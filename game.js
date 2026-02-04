// --- Blokus (DOM-APIs, mouse rotate/flip, scoring & winner overlay, UNIQUE SHAPES GLOBALLY) ---

const BOARD_SIZE = 20;

// Color via HEX so figures render even if Tailwind didn't emit bg-* classes.
const COLORS = ['emerald','rose','sky','amber'];
const COLOR_HEX = {
  emerald: '#059669', // emerald-600
  rose:    '#e11d48', // rose-600
  sky:     '#0284c7', // sky-600
  amber:   '#d97706', // amber-600
};
const CORNERS = [ [0,0], [BOARD_SIZE-1,BOARD_SIZE-1], [BOARD_SIZE-1,0], [0,BOARD_SIZE-1] ];

// Full Blokus set: 21 free polyominoes (flips/rotations allowed in game)
const BASE_PIECES = [
  // 1 — monomino
  [[0,0]],

  // 2 — domino
  [[0,0],[1,0]],

  // 3 — triominoes (I, L)
  [[0,0],[1,0],[2,0]],                 // I3
  [[0,0],[0,1],[1,0]],                 // L3

  // 5 — tetrominoes (I, O, L, T, S)  (Z is mirror of S when flips allowed)
  [[0,0],[1,0],[2,0],[3,0]],           // I4
  [[0,0],[1,0],[0,1],[1,1]],           // O4
  [[0,0],[0,1],[0,2],[1,2]],           // L4
  [[0,0],[1,0],[2,0],[1,1]],           // T4
  [[1,0],[2,0],[0,1],[1,1]],           // S4

  // 12 — pentominoes (F, I, L, P, N, T, U, V, W, X, Y, Z)
  [[0,1],[1,0],[1,1],[1,2],[2,2]],     // F5  
  [[0,0],[1,0],[2,0],[3,0],[4,0]],     // I5
  [[0,0],[0,1],[0,2],[0,3],[1,3]],     // L5
  [[0,0],[1,0],[0,1],[1,1],[0,2]],     // P5
  [[0,0],[1,0],[1,1],[2,1],[2,2]],     // N5
  [[0,0],[1,0],[2,0],[1,1],[1,2]],     // T5
  [[0,0],[2,0],[0,1],[1,1],[2,1]],     // U5
  [[0,0],[0,1],[0,2],[1,2],[2,2]],     // V5
  [[0,0],[0,1],[1,1],[1,2],[2,2]],     // W5  
  [[1,0],[0,1],[1,1],[2,1],[1,2]],     // X5 (cross)
  [[0,0],[1,0],[2,0],[3,0],[2,1]],     // Y5
  [[0,0],[1,0],[2,0],[2,1],[3,1]],     // Z5
];

/********** tiny DOM helper **********/
function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v);
  }
  for (const child of [].concat(children)) {
    if (child == null) continue;
    node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
  }
  return node;
}

/*************************
 * Geometry helpers
 *************************/
function clone(o){ return JSON.parse(JSON.stringify(o)); }
function rotate(piece){ return normalize(piece.map(([x,y])=>[y,-x])); }
function flip(piece){ return normalize(piece.map(([x,y])=>[-x,y])); }
function normalize(piece){
  const minx = Math.min(...piece.map(p=>p[0]));
  const miny = Math.min(...piece.map(p=>p[1]));
  const out = piece.map(([x,y])=>[x-minx,y-miny]);
  out.sort((a,b)=> a[1]-b[1] || a[0]-b[0]);
  return out;
}
function transformVariants(piece){
  const variants = [];
  const seen = new Set();
  let r = normalize(piece);
  const rots = [];
  for(let i=0;i<4;i++){ rots.push(r); r = rotate(r); }
  const candidates = [];
  for(const v of rots){ candidates.push(normalize(v)); candidates.push(normalize(flip(v))); }
  for(const v of candidates){ const k = JSON.stringify(v); if(!seen.has(k)){ seen.add(k); variants.push(v); } }
  return variants;
}

/*************************
 * Board & Rules
 *************************/
function newBoard(){ return Array.from({length:BOARD_SIZE},()=>Array(BOARD_SIZE).fill(-1)); }
function inBounds(x,y){ return x>=0 && y>=0 && x<BOARD_SIZE && y<BOARD_SIZE; }
function hasCornerTouch(board, player, cells){
  const d=[[1,1],[-1,1],[1,-1],[-1,-1]];
  for(const [x,y] of cells){ for(const [dx,dy] of d){ const nx=x+dx, ny=y+dy; if(inBounds(nx,ny)&&board[ny][nx]===player) return true; } }
  return false;
}
function hasEdgeTouch(board, player, cells){
  const d=[[1,0],[-1,0],[0,1],[0,-1]];
  for(const [x,y] of cells){ for(const [dx,dy] of d){ const nx=x+dx, ny=y+dy; if(inBounds(nx,ny)&&board[ny][nx]===player) return true; } }
  return false;
}
function canPlace(board, player, pieceVariant, ox, oy, usedCount, startCorner){
  const cells=[];
  for(const [px,py] of pieceVariant){ const x=ox+px, y=oy+py; if(!inBounds(x,y) || board[y][x]!==-1) return false; cells.push([x,y]); }
  if(usedCount===0){
    if(!cells.some(([x,y])=> x===startCorner[0] && y===startCorner[1])) return false;
  } else {
    if(!hasCornerTouch(board, player, cells)) return false;
    if(hasEdgeTouch(board, player, cells)) return false;
  }
  return true;
}
function place(board, player, variant, ox, oy){ const nb=clone(board); for(const [px,py] of variant){ nb[oy+py][ox+px]=player; } return nb; }

/*************************
 * State
 *************************/
const state = {
  board: newBoard(),
  players: [], // {id, name, type:'human'|'cpu', color, pieces, used, passed, start}
  turn: 0,
  selectedIndex: 0,
  selectedVariantIdx: 0,
  hovering: null,
  pieceScale: 1.2,
};

/*************************
 * DOM refs
 *************************/
const elBoard = document.getElementById('board');
const elPieces = document.getElementById('pieces');
const elTurn = document.getElementById('turnBadge');
const elScores = document.getElementById('scores');
const elThink = document.getElementById('thinking');
const elThinkNm = document.getElementById('thinkingName');
const btnRotate = document.getElementById('btnRotate');
const btnFlip = document.getElementById('btnFlip');
const btnSkip = document.getElementById('btnSkip');
const btnNew = document.getElementById('btnNew');
const elLobby = document.getElementById('lobby');
const elSeats = document.getElementById('seats');
const selCount = document.getElementById('playerCount');
const btnStart = document.getElementById('btnStart');
const btnPreset4 = document.getElementById('btnPreset4');
const cpuLevelSel = document.getElementById('cpuLevel');
const elHumanHint = document.getElementById('humanHint');

/*************************
 * Winner overlay (no innerHTML)
 *************************/
let winOverlay = null;
function showWinnerOverlay(text){
  if (!winOverlay) {
    winOverlay = el('div', {
      class: 'absolute inset-0 bg-white/70 backdrop-blur-sm rounded-2xl flex items-center justify-center',
    });
    winOverlay.style.zIndex = '50';

    const box = el('div', { class: 'bg-white rounded-2xl shadow p-4' });
    const title = el('div', { class: 'text-2xl font-semibold mb-2', id: 'ovText' }, text);
    const footer= el('div', { class: 'text-right' });
    const okBtn = el('button', {
      id: 'ovOk',
      class: 'bg-indigo-600 text-white px-3 py-1.5 rounded shadow hover:bg-indigo-700 text-sm',
      onclick: () => { winOverlay.classList.add('hidden'); endMatch(); }
    }, 'OK');

    footer.appendChild(okBtn);
    box.append(title, footer);
    winOverlay.appendChild(box);

    const host = document.querySelector('section.lg\\:col-span-3.relative') || document.body;
    host.appendChild(winOverlay);
  } else {
    const t = winOverlay.querySelector('#ovText');
    if (t) t.textContent = text;
  }
  winOverlay.classList.remove('hidden');
}

/*************************
 * Safety helpers
 *************************/
const hasPlayers = () => state.players && state.players.length>0;
function currentPlayer(){ return hasPlayers() ? state.players[state.turn % state.players.length] : null; }

/*************************
 * Lobby / Setup
 *************************/
function renderSeats(){
  elSeats.replaceChildren();
  const n = parseInt(selCount.value,10);

  for (let i = 0; i < n; i++) {
    const card = el('div', { class: 'border rounded-xl p-3 flex flex-col gap-2' });

    const header = el('div', { class: 'flex items-center justify-between' });
    const left   = el('div', { class: 'font-semibold' }, `Player ${i+1}`);
    const right  = el('span', { class: 'inline-flex items-center gap-1 text-xs' });
    const dot    = el('span', { class: 'w-3 h-3 rounded-full' });
    dot.style.backgroundColor = COLOR_HEX[COLORS[i]];
    const colorName = el('span', {}, COLORS[i]);
    right.append(dot, colorName);
    header.append(left, right);

    const typeWrap = el('label', { class: 'text-sm' }, 'Type ');
    const typeSel  = el('select', {
      class: 'seatType border rounded px-2 py-1 ml-2 text-sm',
      'data-seat': String(i)
    });
    typeSel.append(
      el('option', { value: 'human' }, 'Human'),
      el('option', { value: 'cpu' }, 'CPU')
    );
    typeSel.value = (i === 0) ? 'human' : 'cpu';
    typeWrap.append(typeSel);

    const nameWrap = el('label', { class: 'text-sm' }, 'Name ');
    const nameInp  = el('input', {
      class: 'seatName border rounded px-2 py-1 ml-2 text-sm w-40',
      'data-seat': String(i),
      value: (i===0 ? 'You' : `CPU ${i+1}`)
    });
    nameWrap.append(nameInp);

    card.append(header, typeWrap, nameWrap);
    elSeats.appendChild(card);
  }
}
selCount.addEventListener('change', renderSeats);

btnPreset4.addEventListener('click', ()=>{
  selCount.value = '4';
  renderSeats();
  const types = ["human","human","cpu","cpu"];
  document.querySelectorAll('.seatType').forEach((el,idx)=> el.value = types[idx]||'cpu');
  document.querySelectorAll('.seatName').forEach((el,idx)=> el.value = idx<2? ['You','Friend'][idx] : `CPU ${idx+1}`);
});

btnStart.addEventListener('click', ()=>{
  const n = parseInt(selCount.value,10);
  state.players = [];
  for(let i=0;i<n;i++){
    const type = document.querySelector(`.seatType[data-seat="${i}"]`).value;
    const name = document.querySelector(`.seatName[data-seat="${i}"]`).value || `P${i+1}`;
    state.players.push({
      id:i,
      name,
      type, // 'human'|'cpu'
      color: COLORS[i],
      pieces: BASE_PIECES.map(normalize),
      used:0,
      passed:false,
      start: CORNERS[i],
    });
  }
  startMatch();
});

/*************************
 * Match lifecycle
 *************************/
function startMatch(){
  state.board = newBoard();
  state.turn = 0;
  state.selectedIndex = 0;
  state.selectedVariantIdx = 0;
  state.hovering = null;
  elLobby.classList.add('hidden');
  renderAll();
  maybeCPU();
}

btnNew.addEventListener('click', ()=>{ elLobby.classList.remove('hidden'); renderSeats(); });

/*************************
 * Renderers
 *************************/
function renderBoard(){
  elBoard.replaceChildren();
  elBoard.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1.6rem)`;
  for(let y=0;y<BOARD_SIZE;y++){
    for(let x=0;x<BOARD_SIZE;x++){
      const v = state.board[y][x];
      const cell = el('div', { class: 'cell border border-slate-200 rounded-sm' });
      cell.style.backgroundColor = (v===-1) ? '#ffffff' : (COLOR_HEX[state.players[v].color] || '#94a3b8');
      cell.addEventListener('mouseenter', ()=> onHoverCell(x,y));
      cell.addEventListener('mouseleave', ()=> { state.hovering=null; cellHoverOverlay(); });
      cell.addEventListener('click', ()=> onClickCell(x,y));
      elBoard.appendChild(cell);
    }
  }
}
function cellHoverOverlay(){
  const children = Array.from(elBoard.children);
  children.forEach(c=> c.style.boxShadow='');
  if(!state.hovering) return;
  const { x,y,variant } = state.hovering;
  for(const [px,py] of variant){
    const cx=x+px, cy=y+py;
    if(!inBounds(cx,cy)) continue;
    const idx=cy*BOARD_SIZE+cx;
    const elc=children[idx];
    if(elc) elc.style.boxShadow='inset 0 0 0 3px rgba(99,102,241,0.7)';
  }
}
function renderPieces(){
  elPieces.replaceChildren();
  const p = currentPlayer();
  if(!p){ elHumanHint.textContent = 'Set up players in the lobby, then press Start Game.'; return; }
  if(p.type==='cpu'){ elHumanHint.textContent = `${p.name} is CPU – wait for their move.`; return; }
  elHumanHint.textContent = 'Click a piece, then click the board. Wheel=rotate, Right-click=flip.';

  const arr = p.pieces.map((piece, idx)=>({ piece, idx, size: piece.length }))
                      .sort((a,b)=> b.size - a.size);

  arr.forEach(({piece, idx, size})=>{
    const canMove = hasMoveForPiece(p, piece);

    const btn = el('button', {
      class: `relative border rounded-xl p-2 transition-all ${idx===state.selectedIndex? 'ring-2 ring-indigo-500 shadow' : 'hover:bg-slate-50'} ${canMove? '' : 'opacity-40 cursor-not-allowed'}`,
      onclick: ()=>{ if(!canMove) return; state.selectedIndex = idx; state.selectedVariantIdx=0; renderPieces(); }
    });
    btn.setAttribute('aria-label', `Piece with ${size} cells`);

    const minx=Math.min(...piece.map(pt=>pt[0])), miny=Math.min(...piece.map(pt=>pt[1]));
    const maxx=Math.max(...piece.map(pt=>pt[0])), maxy=Math.max(...piece.map(pt=>pt[1]));
    const w=maxx-minx+1, h=maxy-miny+1;
    const grid = el('div', { class: 'grid gap-[2px]' });
    const cellSize = `${state.pieceScale}rem`;
    grid.style.gridTemplateColumns = `repeat(${w}, ${cellSize})`;

    const cells=Array.from({length:w*h},()=>0);
    piece.forEach(([x,y])=>{ cells[(y-miny)*w+(x-minx)]=1; });

    cells.forEach(v=>{
      const c = el('div', { class: 'piece-cell rounded' });
      c.style.width = cellSize; c.style.height = cellSize;
      c.style.backgroundColor = v ? COLOR_HEX[p.color] : '#f1f5f9';
      grid.appendChild(c);
    });

    btn.appendChild(grid);
    elPieces.appendChild(btn);
  });
}
function renderStatus(){
  const p=currentPlayer();
  if(!p){
    elTurn.textContent = 'Turn: – (set up players and press Start Game)';
    elScores.replaceChildren();
    return;
  }
  elTurn.textContent = `Turn: ${p.name} (${p.type.toUpperCase()})`;

  const frag = document.createDocumentFragment();
  state.players.forEach((pl, i) => {
    const line = el('div');
    const name = el('span', {}, `${pl.name}: `);
    const val  = el('span', { class: 'font-semibold' }, String(scoreFor(i)));
    line.append(name, val);
    frag.appendChild(line);
  });
  elScores.replaceChildren(frag);
}
function renderAll(){ renderBoard(); renderPieces(); renderStatus(); }

function scoreFor(playerIdx){
  let s=0; for(let y=0;y<BOARD_SIZE;y++) for(let x=0;x<BOARD_SIZE;x++) if(state.board[y][x]===playerIdx) s++; return s;
}

/*************************
 * Interaction
 *************************/
function currentPieceVariants(){ const p=currentPlayer(); if(!p) return []; const base=p.pieces[state.selectedIndex]; return base? transformVariants(base):[]; }

function onHoverCell(x,y){
  const p=currentPlayer(); if(!p || p.type!=='human') return;
  const base = p.pieces[state.selectedIndex]; if (!base) return;
  const variants=currentPieceVariants();
  const v=variants[state.selectedVariantIdx % (variants.length||1)];
  if(!v) return; state.hovering={x,y,variant:v}; cellHoverOverlay();
}
function onClickCell(x,y){
  const p=currentPlayer(); if(!p || p.type!=='human') return;
  const base = p.pieces[state.selectedIndex]; if (!base) return;
  const variants=currentPieceVariants();
  const v=variants[state.selectedVariantIdx % (variants.length||1)];
  if(!v) return;
  const ok = canPlace(state.board, p.id, v, x, y, p.used, p.start);
  if(!ok) return flashCell(x,y);
  commitMove(p, v, x, y);
}

function flashCell(x,y){ const idx=y*BOARD_SIZE+x; const elc=elBoard.children[idx]; if(!elc) return; const old=elc.style.outline; elc.style.outline='3px solid rgba(244,63,94,0.9)'; setTimeout(()=> elc.style.outline=old, 180); }

// Buttons & keyboard
btnRotate.addEventListener('click', ()=>{ const p=currentPlayer(); if(p && p.type==='human'){ state.selectedVariantIdx++; if(state.hovering){ const {x,y}=state.hovering; onHoverCell(x,y);} }});
btnFlip.addEventListener('click', ()=>{ const p=currentPlayer(); if(p && p.type==='human'){ state.selectedVariantIdx++; if(state.hovering){ const {x,y}=state.hovering; onHoverCell(x,y);} }});
btnSkip.addEventListener('click', ()=>{ const p=currentPlayer(); if(!p) return; p.passed=true; nextTurn(); });

document.addEventListener('keydown', (e)=>{
  const p=currentPlayer(); if(!p || p.type!=='human') return;
  if(e.key==='r' || e.key==='R'){ state.selectedVariantIdx++; if(state.hovering){ const {x,y}=state.hovering; onHoverCell(x,y);} }
  if(e.key==='f' || e.key==='F'){ state.selectedVariantIdx++; if(state.hovering){ const {x,y}=state.hovering; onHoverCell(x,y);} }
});

// Mouse rotate (wheel) + flip (right click) on the board
elBoard.addEventListener('wheel', (e)=>{
  const p=currentPlayer(); if(!p || p.type!=='human') return;
  e.preventDefault();
  state.selectedVariantIdx += (e.deltaY>0 ? 1 : -1);
  if(state.selectedVariantIdx < 0) state.selectedVariantIdx = 0;
  if(state.hovering){ const {x,y}=state.hovering; onHoverCell(x,y); }
}, { passive: false });

elBoard.addEventListener('contextmenu', (e)=>{
  const p=currentPlayer(); if(!p || p.type!=='human') return;
  e.preventDefault();
  state.selectedVariantIdx++;
  if(state.hovering){ const {x,y}=state.hovering; onHoverCell(x,y); }
});

// Also enable wheel/RC on the piece palette
elPieces.addEventListener('wheel', (e)=>{
  const p=currentPlayer(); if(!p || p.type!=='human') return;
  e.preventDefault();
  state.selectedVariantIdx += (e.deltaY>0 ? 1 : -1);
}, { passive: false });
elPieces.addEventListener('contextmenu', (e)=>{
  const p=currentPlayer(); if(!p || p.type!=='human') return;
  e.preventDefault();
  state.selectedVariantIdx++;
});

/*************************
 * Commit / Turn flow
 *************************/
function commitMove(player, variant, x, y){
  state.board = place(state.board, player.id, variant, x, y);
  const idx = state.selectedIndex;
  player.pieces.splice(idx,1);
  player.used++;
  state.selectedIndex = Math.min(state.selectedIndex, (player.pieces.length-1));
  state.hovering=null; renderAll(); nextTurn();
}

function nextTurn(){
  if(!hasPlayers()) return;
  if(isGameOver()){ announceWinner(); return; }
  const n=state.players.length;
  for(let i=1;i<=n;i++){
    const nxt=(state.turn+i)%n;
    state.turn=nxt;
    const p=state.players[nxt];
    if(!p.passed){ break; }
  }
  renderAll(); maybeCPU();
}

function isGameOver(){
  if(!hasPlayers()) return false;
  let allPassed=true; for(const p of state.players){ if(!p.passed) { allPassed=false; break; } }
  if(allPassed) return true;
  for(const p of state.players){ if(hasAnyMove(p)) return false; }
  return true;
}
function hasAnyMove(player){
  for(let pi=0; pi<player.pieces.length; pi++){
    const variants=transformVariants(player.pieces[pi]);
    for(const v of variants){
      for(let y=0;y<BOARD_SIZE;y++) for(let x=0;x<BOARD_SIZE;x++){
        if(canPlace(state.board, player.id, v, x, y, player.used, player.start)) return true;
      }
    }
  }
  return false;
}

function announceWinner(){
  const scores = state.players.map((p,i)=>({i, name:p.name, type:p.type, s: scoreFor(i)}));
  const max = Math.max(...scores.map(o=>o.s));
  const winners = scores.filter(o=>o.s===max);

  const you = state.players.find(p=>p.type==='human' && p.id===0) || state.players.find(p=>p.type==='human');
  let text;
  if(winners.length===1){
    const w = winners[0];
    if(you && w.i===you.id) text = `Good! You win 🎉 with ${w.s} points.`;
    else text = `You lose 😅 — ${w.name} wins with ${w.s} points.`;
  } else {
    const names = winners.map(w=>w.name).join(', ');
    const youAmong = you && winners.some(w=>w.i===you.id);
    text = youAmong ? `Good! It's a tie at ${max} points between ${names}.`
                    : `Tie at ${max} points between ${names}.`;
  }
  showWinnerOverlay(text);
}

/*************************
 * CPU logic
 *************************/
function allLegalPlacements(board, player, used){
  const out=[];
  player.pieces.forEach((base,pIndex)=>{
    const variants=transformVariants(base);
    for(let vi=0;vi<variants.length;vi++){
      const v=variants[vi];
      for(let y=0;y<BOARD_SIZE;y++) for(let x=0;x<BOARD_SIZE;x++){
        if(canPlace(board, player.id, v, x, y, used, player.start)) out.push({pIndex, vIndex:vi, x,y, v});
      }
    }
  });
  return out;
}

function maybeCPU(){
  const p=currentPlayer();
  if(!p || p.type!=='cpu') return;
  elThinkNm.textContent = p.name;
  elThink.classList.remove('hidden');
  const delay = 300 + Math.random()*500;
  setTimeout(()=> cpuPlay(p), delay);
}

function cpuPlay(p){
  const legal = allLegalPlacements(state.board, p, p.used);
  if(legal.length===0){ p.passed=true; elThink.classList.add('hidden'); nextTurn(); return; }
  const level = cpuLevelSel.value;
  let choice;
  if(level==='easy'){
    choice = legal[Math.random()*legal.length|0];
  } else if(level==='medium'){
    choice = legal.sort((a,b)=> b.v.length - a.v.length)[0];
  } else {
    let best=-Infinity; for(const m of legal){
      const nb = place(state.board, p.id, m.v, m.x, m.y);
      const size=m.v.length;
      const dist = m.v.reduce((acc,[px,py])=>{ const cx=(m.x+px)-(BOARD_SIZE-1)/2; const cy=(m.y+py)-(BOARD_SIZE-1)/2; return acc+Math.hypot(cx,cy); },0)/m.v.length;
      const sample = p.pieces.filter((_,i)=>i!==m.pIndex).slice(0,3);
      let mob=0; for(const sp of sample){
        const vs=transformVariants(sp);
        for(const v of vs){
          for(let y=0;y<BOARD_SIZE;y++) for(let x=0;x<BOARD_SIZE;x++){
            if(canPlace(nb, p.id, v, x, y, p.used+1, p.start)) { mob++; if(mob>30) break; }
          }
          if(mob>30) break;
        }
        if(mob>30) break;
      }
      const score = size*5 - dist*0.2 + Math.min(30,mob)*0.3;
      if(score>best){ best=score; choice=m; }
    }
  }
  elThink.classList.add('hidden');
  state.selectedIndex = choice.pIndex;
  commitMove(p, choice.v, choice.x, choice.y);
}

/*************************
 * Tests (non-blocking)
 *************************/
(function tests(){
  try{
    console.assert(typeof renderAll==='function', 'renderAll exists');
    renderAll();
    const tb = newBoard();
    const p0 = {id:0, used:0, start:[0,0]};
    const v1 = normalize([[0,0]]);
    console.assert(canPlace(tb,0,v1,0,0,0,p0.start)===true, 'First move must cover start corner');
    console.assert(canPlace(tb,0,v1,1,0,0,p0.start)===false, 'Reject first move not on corner');
  }catch(e){ console.warn('Self-tests failed', e); }
})();

/*************************
 * Helpers – per-piece move check
 *************************/
function hasMoveForPiece(player, piece){
  const variants = transformVariants(piece);
  for(const v of variants){
    for(let y=0;y<BOARD_SIZE;y++) for(let x=0;x<BOARD_SIZE;x++){
      if(canPlace(state.board, player.id, v, x, y, player.used, player.start)) return true;
    }
  }
  return false;
}

/*************************
 * Boot
 *************************/
(function init(){ renderSeats(); renderAll(); })();