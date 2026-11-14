// The single game state object. Pure data and serializable, so it can be
// saved to localStorage as-is (saving is added with storage.js in M1).

const prefersReducedMotion =
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export const gameState = {
  language: 'en',
  settings: {
    textSize: 'normal',               // 'normal' | 'large'
    reducedMotion: prefersReducedMotion,
  },
  completed: { opportunity: false, ingenuity: false, sojourner: false, lrv: false, voyager: false },
  stars: { opportunity: 0, ingenuity: 0, sojourner: 0, lrv: 0, voyager: 0 },
};

// Push the settings into the page: CSS reads these classes, and canvas effects
// read gameState.settings.reducedMotion directly.
export function applySettings() {
  const root = document.documentElement;
  root.classList.toggle('text-large', gameState.settings.textSize === 'large');
  root.classList.toggle('reduced-motion', gameState.settings.reducedMotion);
  root.lang = gameState.language;
}
