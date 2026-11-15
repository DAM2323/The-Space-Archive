// Saves settings and progress in localStorage. Every call is wrapped in
// try/catch: if storage is blocked or full, the game simply runs without saving.

import { gameState, MACHINE_IDS, ECHO_IDS } from '../state.js';

const KEY = 'spaceArchive.v1';

// Copy saved values into gameState. Only known fields are read, so an old or
// broken save can never corrupt the state.
export function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (!saved) return;
    if (typeof saved.language === 'string') gameState.language = saved.language;
    for (const name in gameState.settings) {
      if (typeof saved.settings?.[name] === typeof gameState.settings[name]) {
        gameState.settings[name] = saved.settings[name];
      }
    }
    for (const id of MACHINE_IDS) {
      gameState.completed[id] = saved.completed?.[id] === true;
      gameState.stars[id] = Number(saved.stars?.[id]) || 0;
    }
    for (const id of ECHO_IDS) gameState.echoes[id] = saved.echoes?.[id] === true;
    gameState.archiveSeen = saved.archiveSeen === true;
  } catch {
    // Storage not available: keep the defaults.
  }
}

export function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(gameState));
  } catch {
    // Storage not available: nothing to do.
  }
}

// "Reset progress": forget completed machines, stars and read echoes, keep the settings.
export function resetProgress() {
  for (const id of MACHINE_IDS) {
    gameState.completed[id] = false;
    gameState.stars[id] = 0;
  }
  for (const id of ECHO_IDS) gameState.echoes[id] = false;
  gameState.archiveSeen = false;
  save();
}
