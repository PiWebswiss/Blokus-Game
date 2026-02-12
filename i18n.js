// Centralized UI text for all supported languages.
// This file is loaded before game.js and exposes translation data on window.
(function bootstrapI18n(global) {
  const SUPPORTED_LANGS = ['en', 'fr'];
  const LANG_STORAGE_KEY = 'blokus_lang';

  // Keep text keys identical across languages so game.js can switch language safely.
  const STRINGS = {
    en: {
      pageTitle: 'Blokus - Local (2-4 players, Human/CPU)',
      titleSub: '(Local 2-4 players)',
      titleTagline: 'Choose human/CPU per seat - See when CPU is thinking - Play all on one device',
      cpuLevel: 'CPU level',
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

  // game.js reads this object to render all translated UI text.
  global.BLOKUS_I18N = {
    SUPPORTED_LANGS,
    LANG_STORAGE_KEY,
    STRINGS,
    readStoredLanguage,
  };
})(window);
