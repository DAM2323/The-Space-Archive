// One input layer for mouse, touch and keyboard, so scenes do not care about
// the device. Scenes subscribe with input.on(handler) and receive actions:
//
//   { type: 'confirm' }             Enter, Space, or a tap on the empty playfield
//   { type: 'back' }                Escape
//   { type: 'direction', dx, dy }   arrow keys (or WASD)
//   { type: 'pointer', x, y }       the pointer moved (game pixels)
//
// input.pointer always holds the last pointer position in game pixels.
// Buttons are normal DOM <button>s, so they already work with every device;
// keys pressed while a button has focus are left to the button.

import { WIDTH, HEIGHT } from './render.js';

const handlers = new Set();
let stage = null;

export const pointer = { x: WIDTH / 2, y: HEIGHT / 2, active: false };

function emit(action) {
  for (const h of [...handlers]) h(action);
}

// Subscribe. Returns a function that unsubscribes (call it in scene.exit()).
export function on(handler) {
  handlers.add(handler);
  return () => handlers.delete(handler);
}

function toGame(e) {
  const r = stage.getBoundingClientRect();
  pointer.x = ((e.clientX - r.left) / r.width) * WIDTH;
  pointer.y = ((e.clientY - r.top) / r.height) * HEIGHT;
  pointer.active = true;
}

const DIRECTIONS = {
  ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1],
  a: [-1, 0], d: [1, 0], w: [0, -1], s: [0, 1],
};

export function initInput(stageEl) {
  stage = stageEl;

  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const onButton = e.target instanceof HTMLElement && e.target.closest('button, input');
    if (e.key === 'Escape') {
      emit({ type: 'back' });
    } else if (e.key === 'Enter' || e.key === ' ') {
      if (onButton) return;                     // the button handles its own click
      e.preventDefault();
      if (!e.repeat) emit({ type: 'confirm' });
    } else if (DIRECTIONS[e.key]) {
      if (e.target instanceof HTMLInputElement) return;   // sliders use the arrows
      e.preventDefault();
      const [dx, dy] = DIRECTIONS[e.key];
      emit({ type: 'direction', dx, dy });
    }
  });

  window.addEventListener('pointermove', (e) => {
    toGame(e);
    emit({ type: 'pointer', x: pointer.x, y: pointer.y });
  });

  // A tap or click on the playfield (not on a button or panel) means "confirm".
  stage.addEventListener('pointerdown', (e) => {
    toGame(e);
    if (e.target.closest('button, input, .panel')) return;
    emit({ type: 'confirm', x: pointer.x, y: pointer.y, fromPointer: true });
  });
}
