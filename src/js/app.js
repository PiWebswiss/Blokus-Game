// Blokus single-file app bundle (i18n + game logic).
// This file is the only JavaScript entrypoint used by index.html.

// Centralized UI text for all supported languages.
// This bootstrap exposes translation data for the game section below.
(function bootstrapI18n(global) {
  const SUPPORTED_LANGS = ['en', 'fr'];
  const LANG_STORAGE_KEY = 'blokus_lang';

  // Keep text keys identical across languages so the game logic can switch safely.
  const STRINGS = {
    en: {
      pageTitle: 'Blokus - Local (2-4 players, Human/CPU)',
      titleSub: '(Local 2-4 players)',
      titleTagline: 'Choose human/CPU per seat - See when CPU is thinking - Play all on one device',
      cpuLevel: 'CPU level',
      darkMode: 'Dark mode',
      darkModeAria: 'Toggle dark mode',
      langToggleAria: 'Toggle language (English/French)',
      newMatch: 'New Match',
      setupTitle: 'Setup',
      setupDesc: 'Select how many players and who is human vs CPU.',
      players: 'Players',
      startGame: 'Start Game',
      preset4: '4 players (2 human, 2 CPU)',
      board: 'Board',
      rules: 'Rules: First piece must touch your start corner. Same-color pieces may only touch at corners (no edges).',
      thinking: 'is thinking...',
      piecesTitle: 'Current Player Pieces',
      piecesHelp: 'Rotate: <kbd class="px-1 border rounded">R</kbd> or Mouse Wheel - Flip: <kbd class="px-1 border rounded">F</kbd> or Right-Click',
      humanHintSetup: 'Set up players in the lobby, then press Start Game.',
      humanHintCpu: '{name} is CPU - wait for their move.',
      humanHintHuman: 'Click a piece, then click the board. Wheel=rotate, Right-click=flip.',
      controlsTitle: 'Controls',
      controlsHint: 'Skip turn if you are stuck.',
      rotateBtn: 'Rotate (R)',
      flipBtn: 'Flip (F)',
      skipBtn: 'Skip Turn',
      easy: 'Easy',
      medium: 'Medium',
      hard: 'Hard',
      turnIdle: 'Turn: - (set up players and press Start Game)',
      turn: 'Turn: {name} ({type})',
      seatPlayer: 'Player {n}',
      seatType: 'Type',
      seatName: 'Name',
      human: 'Human',
      cpu: 'CPU',
      you: 'You',
      friend: 'Friend',
      cpuDefault: 'CPU {n}',
      pieceAria: 'Piece with {count} cells',
      winnerWin: 'Good! You win with {points} points.',
      winnerLose: 'You lose - {name} wins with {points} points.',
      winnerTieYou: "Good! It's a tie at {points} points between {names}.",
      winnerTie: 'Tie at {points} points between {names}.',
      overlayOk: 'OK',
    },
    fr: {
      pageTitle: 'Blokus - Local (2-4 joueurs, Humain/IA)',
      titleSub: '(Local 2-4 joueurs)',
      titleTagline: "Choisissez Humain/IA pour chaque place - Voyez quand l'IA reflechit - Jouez sur un seul appareil",
      cpuLevel: 'Niveau IA',
      darkMode: 'Mode sombre',
      darkModeAria: 'Basculer le mode sombre',
      langToggleAria: 'Basculer la langue (Anglais/Francais)',
      newMatch: 'Nouvelle partie',
      setupTitle: 'Configuration',
      setupDesc: 'Choisissez le nombre de joueurs et qui est Humain ou IA.',
      players: 'Joueurs',
      startGame: 'Lancer la partie',
      preset4: '4 joueurs (2 humains, 2 IA)',
      board: 'Plateau',
      rules: 'Regles : La premiere piece doit toucher votre coin de depart. Les pieces de meme couleur ne peuvent se toucher que par les coins (pas par les cotes).',
      thinking: 'reflechit...',
      piecesTitle: 'Pieces du joueur courant',
      piecesHelp: 'Rotation: <kbd class="px-1 border rounded">R</kbd> ou molette - Miroir: <kbd class="px-1 border rounded">F</kbd> ou clic droit',
      humanHintSetup: 'Configurez les joueurs dans le lobby puis cliquez sur Lancer la partie.',
      humanHintCpu: '{name} est une IA - attendez son coup.',
      humanHintHuman: 'Cliquez une piece puis cliquez le plateau. Molette=rotation, Clic droit=miroir.',
      controlsTitle: 'Commandes',
      controlsHint: 'Passez votre tour si vous etes bloque.',
      rotateBtn: 'Rotation (R)',
      flipBtn: 'Miroir (F)',
      skipBtn: 'Passer le tour',
      easy: 'Facile',
      medium: 'Moyen',
      hard: 'Difficile',
      turnIdle: 'Tour : - (configurez les joueurs puis lancez la partie)',
      turn: 'Tour : {name} ({type})',
      seatPlayer: 'Joueur {n}',
      seatType: 'Type',
      seatName: 'Nom',
      human: 'Humain',
      cpu: 'IA',
      you: 'Vous',
      friend: 'Ami',
      cpuDefault: 'IA {n}',
      pieceAria: '{count} cases',
      winnerWin: 'Bravo ! Vous gagnez avec {points} points.',
      winnerLose: 'Vous perdez - {name} gagne avec {points} points.',
      winnerTieYou: 'Bravo ! Egalite a {points} points entre {names}.',
      winnerTie: 'Egalite a {points} points entre {names}.',
      overlayOk: 'OK',
    },
  };

  function readStoredLanguage() {
    try {
      const raw = global.localStorage.getItem(LANG_STORAGE_KEY);
      return SUPPORTED_LANGS.includes(raw) ? raw : 'en';
    } catch {
      return 'en';
    }
  }

  // The game section reads this object to render all translated UI text.
  global.BLOKUS_I18N = {
    SUPPORTED_LANGS,
    LANG_STORAGE_KEY,
    STRINGS,
    readStoredLanguage,
  };
})(window);


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

// Translation data is provided by the i18n bootstrap section above.
const i18nBundle = window.BLOKUS_I18N;
if (!i18nBundle) {
  throw new Error('i18n bootstrap must run before the game logic section');
}
const {
  SUPPORTED_LANGS,
  LANG_STORAGE_KEY,
  STRINGS: I18N,
  readStoredLanguage
} = i18nBundle;
const THEME_STORAGE_KEY = 'blokus_theme';

function readStoredTheme(){
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function cssVar(name, fallback){
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

// Full Blokus set: 21 free polyominoes (flips/rotations allowed in game).
const BASE_PIECES = [
  // 1 - monomino
  [[0,0]],

  // 2 - domino
  [[0,0],[1,0]],

  // 3 - triominoes (I, L)
  [[0,0],[1,0],[2,0]],                 // I3
  [[0,0],[0,1],[1,0]],                 // L3

  // 5 - tetrominoes (I, O, L, T, S). Z is mirror of S when flips are allowed.
  [[0,0],[1,0],[2,0],[3,0]],           // I4
  [[0,0],[1,0],[0,1],[1,1]],           // O4
  [[0,0],[0,1],[0,2],[1,2]],           // L4
  [[0,0],[1,0],[2,0],[1,1]],           // T4
  [[1,0],[2,0],[0,1],[1,1]],           // S4

  // 12 - pentominoes (F, I, L, P, N, T, U, V, W, X, Y, Z)
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
  lang: readStoredLanguage(),
  theme: readStoredTheme(),
};

function t(key, vars = {}){
  // Resolve a translated string and replace template variables like {name}.
  const table = I18N[state.lang] || I18N.en;
  const fallback = I18N.en[key] ?? key;
  const template = table[key] ?? fallback;
  return String(template).replace(/\{(\w+)\}/g, (_, token) => String(vars[token] ?? ''));
}

function defaultSeatType(i){
  return i === 0 ? 'human' : 'cpu';
}

function defaultSeatName(i, type = defaultSeatType(i)){
  if (type === 'cpu') return t('cpuDefault', { n: i + 1 });
  if (i === 0) return t('you');
  if (i === 1) return t('friend');
  return `${t('human')} ${i + 1}`;
}

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
const btnLang = document.getElementById('btnLang');
const btnTheme = document.getElementById('btnTheme');
const elThemeLabel = document.getElementById('themeLabel');
const elLangEn = document.getElementById('langEn');
const elLangFr = document.getElementById('langFr');
const elTitleSub = document.getElementById('titleSub');
const elTitleTagline = document.getElementById('titleTagline');
const elLabelCpuLevel = document.getElementById('labelCpuLevel');
const elSetupTitle = document.getElementById('setupTitle');
const elSetupDesc = document.getElementById('setupDesc');
const elLabelPlayers = document.getElementById('labelPlayers');
const elBoardLabel = document.getElementById('boardLabel');
const elBoardRules = document.getElementById('boardRules');
const elThinkingText = document.getElementById('thinkingText');
const elPiecesTitle = document.getElementById('piecesTitle');
const elPiecesHelp = document.getElementById('piecesHelp');
const elControlsTitle = document.getElementById('controlsTitle');
const elControlsHint = document.getElementById('controlsHint');

function applyThemeVisual(){
  const isDark = state.theme === 'dark';
  document.documentElement.classList.toggle('dark', isDark);
  btnTheme.setAttribute('aria-checked', String(isDark));
}

function updateLanguageToggleVisual(){
  const isEn = state.lang === 'en';
  elLangEn.classList.toggle('font-semibold', isEn);
  elLangEn.classList.toggle('text-slate-900', isEn);
  elLangEn.classList.toggle('text-slate-400', !isEn);
  elLangFr.classList.toggle('font-semibold', !isEn);
  elLangFr.classList.toggle('text-slate-900', !isEn);
  elLangFr.classList.toggle('text-slate-400', isEn);
  btnLang.setAttribute('aria-label', t('langToggleAria'));
  btnLang.title = t('langToggleAria');
}

function applyStaticTranslations(){
  // Update labels that do not depend on current game state.
  document.documentElement.lang = state.lang;
  document.title = t('pageTitle');

  elTitleSub.textContent = t('titleSub');
  elTitleTagline.textContent = t('titleTagline');
  elLabelCpuLevel.textContent = t('cpuLevel');
  btnNew.textContent = t('newMatch');
  elSetupTitle.textContent = t('setupTitle');
  elSetupDesc.textContent = t('setupDesc');
  elLabelPlayers.textContent = t('players');
  btnStart.textContent = t('startGame');
  btnPreset4.textContent = t('preset4');
  elBoardLabel.textContent = t('board');
  elBoardRules.textContent = t('rules');
  elThinkingText.textContent = t('thinking');
  elPiecesTitle.textContent = t('piecesTitle');
  elPiecesHelp.innerHTML = t('piecesHelp');
  elControlsTitle.textContent = t('controlsTitle');
  elControlsHint.textContent = t('controlsHint');
  btnRotate.textContent = t('rotateBtn');
  btnFlip.textContent = t('flipBtn');
  btnSkip.textContent = t('skipBtn');
  elThemeLabel.textContent = t('darkMode');
  btnTheme.setAttribute('aria-label', t('darkModeAria'));
  btnTheme.title = t('darkModeAria');

  const easyOption = cpuLevelSel.querySelector('option[value="easy"]');
  const mediumOption = cpuLevelSel.querySelector('option[value="medium"]');
  const hardOption = cpuLevelSel.querySelector('option[value="hard"]');
  if (easyOption) easyOption.textContent = t('easy');
  if (mediumOption) mediumOption.textContent = t('medium');
  if (hardOption) hardOption.textContent = t('hard');

  updateLanguageToggleVisual();
  applyThemeVisual();
}

function setLanguage(lang, { persist = true, rerender = true } = {}){
  // Main language switch entry point (called by the EN/FR toggle button).
  if (!SUPPORTED_LANGS.includes(lang)) return;
  state.lang = lang;
  if (persist) {
    try { localStorage.setItem(LANG_STORAGE_KEY, lang); } catch {}
  }
  applyStaticTranslations();
  if (!elLobby.classList.contains('hidden')) renderSeats();
  if (rerender) renderAll();
  if (winOverlay) {
    const okBtn = winOverlay.querySelector('#ovOk');
    if (okBtn) okBtn.textContent = t('overlayOk');
  }
}

function setTheme(theme, { persist = true, rerender = true } = {}){
  if (!['light', 'dark'].includes(theme)) return;
  state.theme = theme;
  if (persist) {
    try { localStorage.setItem(THEME_STORAGE_KEY, theme); } catch {}
  }
  applyThemeVisual();
  if (rerender) renderAll();
}

/*************************
 * Winner overlay (no innerHTML)
 *************************/
let winOverlay = null;
function showWinnerOverlay(text){
  if (!winOverlay) {
    winOverlay = el('div', {
      class: 'winner-overlay absolute inset-0 bg-white/70 backdrop-blur-sm rounded-2xl flex items-center justify-center',
    });
    winOverlay.style.zIndex = '50';

    const box = el('div', { class: 'winner-card bg-white rounded-2xl shadow p-4' });
    const title = el('div', { class: 'text-2xl font-semibold mb-2', id: 'ovText' }, text);
    const footer= el('div', { class: 'text-right' });
    const okBtn = el('button', {
      id: 'ovOk',
      class: 'bg-indigo-600 text-white px-3 py-1.5 rounded shadow hover:bg-indigo-700 text-sm',
      onclick: () => { winOverlay.classList.add('hidden'); endMatch(); }
    }, t('overlayOk'));

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
  const existingTypes = {};
  const existingNames = {};
  document.querySelectorAll('.seatType').forEach((node) => {
    const seat = Number(node.dataset.seat);
    if (Number.isInteger(seat)) existingTypes[seat] = node.value;
  });
  document.querySelectorAll('.seatName').forEach((node) => {
    const seat = Number(node.dataset.seat);
    if (Number.isInteger(seat)) existingNames[seat] = node.value;
  });

  elSeats.replaceChildren();
  const n = parseInt(selCount.value,10);

  for (let i = 0; i < n; i++) {
    const card = el('div', { class: 'border rounded-xl p-3 flex flex-col gap-2' });
    const typeValue = existingTypes[i] || defaultSeatType(i);
    const hasExistingName = Object.prototype.hasOwnProperty.call(existingNames, i);
    const nameValue = hasExistingName ? existingNames[i] : defaultSeatName(i, typeValue);

    const header = el('div', { class: 'flex items-center justify-between' });
    const left   = el('div', { class: 'font-semibold' }, t('seatPlayer', { n: i + 1 }));
    const right  = el('span', { class: 'inline-flex items-center gap-1 text-xs' });
    const dot    = el('span', { class: 'w-3 h-3 rounded-full' });
    dot.style.backgroundColor = COLOR_HEX[COLORS[i]];
    const colorName = el('span', {}, COLORS[i]);
    right.append(dot, colorName);
    header.append(left, right);

    const typeWrap = el('label', { class: 'text-sm' }, `${t('seatType')} `);
    const typeSel  = el('select', {
      class: 'seatType border rounded px-2 py-1 ml-2 text-sm',
      'data-seat': String(i)
    });
    typeSel.append(
      el('option', { value: 'human' }, t('human')),
      el('option', { value: 'cpu' }, t('cpu'))
    );
    typeSel.value = typeValue;
    typeWrap.append(typeSel);

    const nameWrap = el('label', { class: 'text-sm' }, `${t('seatName')} `);
    const nameInp  = el('input', {
      class: 'seatName border rounded px-2 py-1 ml-2 text-sm w-40',
      'data-seat': String(i),
      value: nameValue
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
  document.querySelectorAll('.seatName').forEach((el,idx)=>{
    if (idx === 0) el.value = t('you');
    else if (idx === 1) el.value = t('friend');
    else el.value = t('cpuDefault', { n: idx + 1 });
  });
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
  // Start a fresh board but keep the selected lobby configuration.
  state.board = newBoard();
  state.turn = 0;
  state.selectedIndex = 0;
  state.selectedVariantIdx = 0;
  state.hovering = null;
  elLobby.classList.add('hidden');
  renderAll();
  maybeCPU();
}

function openLobby(){
  // Return to lobby without destroying existing seat input values.
  elThink.classList.add('hidden');
  elLobby.classList.remove('hidden');
  renderSeats();
}

function endMatch(){
  // Clear current match state after winner confirmation.
  state.players = [];
  state.board = newBoard();
  state.turn = 0;
  state.selectedIndex = 0;
  state.selectedVariantIdx = 0;
  state.hovering = null;
  openLobby();
  renderAll();
}

btnNew.addEventListener('click', openLobby);
btnLang.addEventListener('click', ()=>{ setLanguage(state.lang === 'en' ? 'fr' : 'en'); });
btnTheme.addEventListener('click', ()=>{ setTheme(state.theme === 'dark' ? 'light' : 'dark'); });

/*************************
 * Renderers
 *************************/
function renderBoard(){
  elBoard.replaceChildren();
  elBoard.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1.6rem)`;
  const emptyCellColor = cssVar('--cell-empty', '#ffffff');
  for(let y=0;y<BOARD_SIZE;y++){
    for(let x=0;x<BOARD_SIZE;x++){
      const v = state.board[y][x];
      const cell = el('div', { class: 'cell border border-slate-200 rounded-sm' });
      cell.style.backgroundColor = (v===-1) ? emptyCellColor : (COLOR_HEX[state.players[v].color] || '#94a3b8');
      cell.addEventListener('mouseenter', ()=> onHoverCell(x,y));
      cell.addEventListener('mouseleave', ()=> { state.hovering=null; cellHoverOverlay(); });
      cell.addEventListener('click', ()=> onClickCell(x,y));
      elBoard.appendChild(cell);
    }
  }
}
function cellHoverOverlay(){
  const children = Array.from(elBoard.children);
  const hoverRing = cssVar('--hover-ring', 'rgba(99,102,241,0.7)');
  children.forEach(c=> c.style.boxShadow='');
  if(!state.hovering) return;
  const { x,y,variant } = state.hovering;
  for(const [px,py] of variant){
    const cx=x+px, cy=y+py;
    if(!inBounds(cx,cy)) continue;
    const idx=cy*BOARD_SIZE+cx;
    const elc=children[idx];
    if(elc) elc.style.boxShadow=`inset 0 0 0 3px ${hoverRing}`;
  }
}
function renderPieces(){
  elPieces.replaceChildren();
  const p = currentPlayer();
  if(!p){ elHumanHint.textContent = t('humanHintSetup'); return; }
  if(p.type==='cpu'){ elHumanHint.textContent = t('humanHintCpu', { name: p.name }); return; }
  elHumanHint.textContent = t('humanHintHuman');

  const arr = p.pieces.map((piece, idx)=>({ piece, idx, size: piece.length }))
                      .sort((a,b)=> b.size - a.size);
  const pieceEmptyColor = cssVar('--piece-empty', '#f1f5f9');

  arr.forEach(({piece, idx, size})=>{
    const canMove = hasMoveForPiece(p, piece);

    const btn = el('button', {
      class: `relative border rounded-xl p-2 transition-all ${idx===state.selectedIndex? 'ring-2 ring-indigo-500 shadow' : 'hover:bg-slate-50'} ${canMove? '' : 'opacity-40 cursor-not-allowed'}`,
      onclick: ()=>{ if(!canMove) return; state.selectedIndex = idx; state.selectedVariantIdx=0; renderPieces(); }
    });
    btn.setAttribute('aria-label', t('pieceAria', { count: size }));

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
      c.style.backgroundColor = v ? COLOR_HEX[p.color] : pieceEmptyColor;
      grid.appendChild(c);
    });

    btn.appendChild(grid);
    elPieces.appendChild(btn);
  });
}
function renderStatus(){
  const p=currentPlayer();
  if(!p){
    elTurn.textContent = t('turnIdle');
    elScores.replaceChildren();
    return;
  }
  elTurn.textContent = t('turn', { name: p.name, type: t(p.type) });

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
    if(you && w.i===you.id) text = t('winnerWin', { points: w.s });
    else text = t('winnerLose', { name: w.name, points: w.s });
  } else {
    const names = winners.map(w=>w.name).join(', ');
    const youAmong = you && winners.some(w=>w.i===you.id);
    text = youAmong
      ? t('winnerTieYou', { points: max, names })
      : t('winnerTie', { points: max, names });
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
 * Helpers - per-piece move check
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
(function init(){
  // Initial render: build lobby cards, apply saved language, then draw UI.
  renderSeats();
  applyStaticTranslations();
  renderAll();
})();
