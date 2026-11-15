// The single game state object. Pure data and serializable, so it is saved
// to localStorage as-is (see engine/storage.js).

import { t } from './engine/i18n.js';

export const MACHINE_IDS = ['lrv', 'pioneer10', 'sojourner', 'opportunity', 'ingenuity'];

const prefersReducedMotion =
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export const gameState = {
  language: 'en',
  settings: {
    textSize: 'normal',               // 'normal' | 'large'
    reducedMotion: prefersReducedMotion,
    sound: true,
    volume: 0.4,                      // 0..1, low by default
  },
  completed: { lrv: false, pioneer10: false, sojourner: false, opportunity: false, ingenuity: false },
  stars: { lrv: 0, pioneer10: 0, sojourner: 0, opportunity: 0, ingenuity: 0 },
};

export const completedCount = () => MACHINE_IDS.filter((id) => gameState.completed[id]).length;

// Push the settings into the page: CSS reads these classes, and canvas effects
// read gameState.settings.reducedMotion directly. Also refreshes the page-level
// text that lives outside the scenes.
export function applySettings() {
  const root = document.documentElement;
  root.classList.toggle('text-large', gameState.settings.textSize === 'large');
  root.classList.toggle('reduced-motion', gameState.settings.reducedMotion);
  root.lang = gameState.language;
  const rotate = document.getElementById('rotate-text');
  if (rotate) rotate.textContent = t('shell.rotate');
}
