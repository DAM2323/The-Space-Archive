// The single game state object. Pure data and serializable, so it is saved
// to localStorage as-is (see engine/storage.js).

export const MACHINE_IDS = ['lrv', 'voyager', 'sojourner', 'opportunity', 'ingenuity'];

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
  completed: { lrv: false, voyager: false, sojourner: false, opportunity: false, ingenuity: false },
  stars: { lrv: 0, voyager: 0, sojourner: 0, opportunity: 0, ingenuity: 0 },
};

export const completedCount = () => MACHINE_IDS.filter((id) => gameState.completed[id]).length;

// Push the settings into the page: CSS reads these classes, and canvas effects
// read gameState.settings.reducedMotion directly.
export function applySettings() {
  const root = document.documentElement;
  root.classList.toggle('text-large', gameState.settings.textSize === 'large');
  root.classList.toggle('reduced-motion', gameState.settings.reducedMotion);
  root.lang = gameState.language;
}
