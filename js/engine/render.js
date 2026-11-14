// Canvas setup and drawing helpers.
// Everything is drawn on an off-screen 320x180 buffer, then copied to the
// visible canvas with an integer scale factor so pixels stay perfectly square.

import { PALETTE, C } from '../data/palette.js';

export const WIDTH = 320;
export const HEIGHT = 180;

let screen = null;      // the visible <canvas>
let screenCtx = null;
let stage = null;       // the element that wraps canvas + DOM overlay
let scale = 1;          // integer scale in DEVICE pixels

// The off-screen buffer every scene draws on.
export const buffer = document.createElement('canvas');
buffer.width = WIDTH;
buffer.height = HEIGHT;
export const ctx = buffer.getContext('2d');
ctx.imageSmoothingEnabled = false;

export function initRender(canvasEl, stageEl) {
  screen = canvasEl;
  stage = stageEl;
  screenCtx = screen.getContext('2d');
  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', resize);
}

// Pick the largest integer scale (in device pixels) that fits the window,
// then letterbox. Working in device pixels keeps the art crisp on phones.
export function resize() {
  const dpr = window.devicePixelRatio || 1;
  const fitW = (window.innerWidth * dpr) / WIDTH;
  const fitH = (window.innerHeight * dpr) / HEIGHT;
  scale = Math.max(1, Math.floor(Math.min(fitW, fitH)));

  screen.width = WIDTH * scale;
  screen.height = HEIGHT * scale;
  const cssScale = scale / dpr;               // CSS pixels per game pixel
  stage.style.width = `${WIDTH * cssScale}px`;
  stage.style.height = `${HEIGHT * cssScale}px`;
  // The DOM overlay sizes its text from this variable (see style.css).
  stage.style.setProperty('--px', cssScale);
}

// Copy the buffer to the screen. (ox, oy) is the screen-shake offset in game pixels.
export function present(ox = 0, oy = 0) {
  screenCtx.imageSmoothingEnabled = false;
  if (ox || oy) {
    screenCtx.fillStyle = C.void;
    screenCtx.fillRect(0, 0, screen.width, screen.height);
  }
  screenCtx.drawImage(buffer, Math.round(ox) * scale, Math.round(oy) * scale, screen.width, screen.height);
}

// ---------- drawing helpers (all coordinates are game pixels) ----------

export function clear(color = C.void) {
  ctx.globalAlpha = 1;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

// One pixel (or a w x h block), snapped to the pixel grid.
export function px(x, y, color, alpha = 1, w = 1, h = 1) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
  ctx.globalAlpha = 1;
}

// Turn a pixel map (array of strings, see data/sprites.js) into a small canvas.
// Done once per sprite and cached, so drawing it later is a single drawImage.
const spriteCache = new Map();

export function bakeSprite(map) {
  let baked = spriteCache.get(map);
  if (baked) return baked;
  baked = document.createElement('canvas');
  baked.width = map[0].length;
  baked.height = map.length;
  const g = baked.getContext('2d');
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      const ch = map[y][x];
      if (ch === '.') continue;
      g.fillStyle = PALETTE[parseInt(ch, 16)];
      g.fillRect(x, y, 1, 1);
    }
  }
  spriteCache.set(map, baked);
  return baked;
}

// Draw a sprite with its top-left corner at (x, y).
// `scale` must be a whole number so the pixels stay square.
export function drawSprite(map, x, y, { alpha = 1, flip = false, scale = 1 } = {}) {
  const img = bakeSprite(map);
  const w = img.width * scale, h = img.height * scale;
  ctx.globalAlpha = alpha;
  if (flip) {
    ctx.save();
    ctx.translate(Math.round(x) + w, Math.round(y));
    ctx.scale(-1, 1);
    ctx.drawImage(img, 0, 0, w, h);
    ctx.restore();
  } else {
    ctx.drawImage(img, Math.round(x), Math.round(y), w, h);
  }
  ctx.globalAlpha = 1;
}
