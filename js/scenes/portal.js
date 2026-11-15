// Portal transition: a spinning ring opens on the chosen machine and swallows
// the screen (about 1.5 s). On the way back the same animation runs reversed.
// It is drawn on top of the hub world, so there is no cut between the scenes.

import { C, PALETTE } from '../data/palette.js';
import { ctx, WIDTH, HEIGHT } from '../engine/render.js';
import { Particles, shake, ease, lerp, clamp } from '../engine/fx.js';
import * as scenes from '../engine/scenes.js';
import { sfx } from '../engine/audio.js';
import { gameState } from '../state.js';
import { updateWorld, renderWorld, ghostPosition, setAim, drawMachine, machineSize } from './hub.js';

const T_OPEN = 0.65;      // the ring opens on the machine
const T_GROW = 0.85;      // the ring grows until it covers the screen
const R_SMALL = 30;       // ring radius around the machine (game pixels)
const R_FULL = 380;       // large enough to cover the screen from any machine

let p;                    // params: { machine, reverse, justCompleted }
let time, finished, center, sparks;

// Off-screen canvas for the per-pixel swirl inside the ring.
const layer = document.createElement('canvas');
layer.width = WIDTH;
layer.height = HEIGHT;
const layerCtx = layer.getContext('2d');
const image = layerCtx.createImageData(WIDTH, HEIGHT);
const RGB = PALETTE.map((hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)));
const INSIDE = [RGB[1], RGB[2], RGB[3], RGB[4], RGB[11]];   // deep -> ice

function drawRing(cx, cy, radius, spin) {
  const data = image.data;
  data.fill(0);
  if (radius < 1) { layerCtx.putImageData(image, 0, 0); return; }
  const x0 = Math.max(0, Math.floor(cx - radius - 2)), x1 = Math.min(WIDTH, Math.ceil(cx + radius + 2));
  const y0 = Math.max(0, Math.floor(cy - radius - 2)), y1 = Math.min(HEIGHT, Math.ceil(cy + radius + 2));
  const rim = Math.max(2, Math.min(4, radius * 0.16));
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const dx = x + 0.5 - cx, dy = y + 0.5 - cy;
      const r = Math.hypot(dx, dy);
      if (r > radius + 1) continue;
      const a = Math.atan2(dy, dx);
      let c;
      if (r > radius - rim) {
        // The rim: bright dashes that spin around.
        const seg = Math.floor(((a + spin) / (Math.PI * 2)) * 14 + 100) % 2;
        if (r > radius) { if (seg) continue; c = RGB[8]; }       // broken outer edge
        else c = seg ? RGB[7] : RGB[6];
      } else {
        // Inside: a spiral that flows toward the center.
        const v = Math.sin(a * 3 + Math.log(r + 1) * 5 - spin * 2.2) * 0.5 + 0.5;
        const depth = clamp(r / radius);
        const dither = ((x + y) & 1) * 0.12;
        c = INSIDE[Math.min(4, Math.floor((v * 0.75 + depth * 0.4 + dither) * 4))];
      }
      const i = (y * WIDTH + x) * 4;
      data[i] = c[0]; data[i + 1] = c[1]; data[i + 2] = c[2]; data[i + 3] = 255;
    }
  }
  layerCtx.putImageData(image, 0, 0);
}

// Ring radius and "open" amount at animation time u (seconds, forward direction).
function radiusAt(u) {
  if (u < T_OPEN) return R_SMALL * ease.outBack(clamp(u / T_OPEN));
  return lerp(R_SMALL, R_FULL, ease.inCubic(clamp((u - T_OPEN) / T_GROW)));
}

function done() {
  if (finished) return;
  finished = true;
  if (p.reverse) {
    setAim(null, true);
    scenes.go('hub', { justCompleted: p.justCompleted, focus: p.machine }, { instant: true });
  } else {
    scenes.go('story', { machine: p.machine }, { duration: 0.3 });
  }
}

export default {
  enter(params) {
    p = params;
    time = 0;
    finished = false;
    sparks = new Particles(140);
    center = ghostPosition(p.machine);
    setAim(p.reverse ? null : p.machine, true);
    sfx(p.reverse ? 'portalClose' : 'portal');
    if (!p.reverse) shake.add(0.8);
  },

  update(dt) {
    time += dt;
    updateWorld(dt);
    center = ghostPosition(p.machine);
    const total = T_OPEN + T_GROW;

    if (gameState.settings.reducedMotion) {
      // No spinning or zooming: hold a still ring briefly, then continue.
      if (time > 0.5) done();
      return;
    }

    // Sparks fly off the rim while the ring is small.
    const u = p.reverse ? total - time : time;
    const radius = radiusAt(u);
    if (radius < 60 && radius > 4) {
      for (let i = 0; i < 2; i++) {
        const a = Math.random() * Math.PI * 2;
        sparks.spawn({
          x: center.x + Math.cos(a) * radius, y: center.y + Math.sin(a) * radius,
          vx: Math.cos(a) * 18 - Math.sin(a) * 30, vy: Math.sin(a) * 18 + Math.cos(a) * 30, drag: 2,
          life: 0.3 + Math.random() * 0.4, color: Math.random() < 0.5 ? C.amber : C.ice,
        });
      }
    }
    sparks.update(dt);
    if (time >= total) done();
  },

  render() {
    renderWorld(p.machine);
    const reduced = gameState.settings.reducedMotion;
    const total = T_OPEN + T_GROW;
    const u = reduced ? T_OPEN : p.reverse ? total - time : time;
    const radius = radiusAt(Math.max(0, u));

    drawRing(center.x, center.y, radius, reduced ? 0 : time * 5);
    ctx.drawImage(layer, 0, 0);
    sparks.render();

    // The machine itself stays visible in the middle of the ring until it is swallowed.
    const size = machineSize(p.machine);
    const fade = 1 - clamp((u - T_OPEN) / (T_GROW * 0.6));
    drawMachine(p.machine, center.x - size.w / 2, center.y - size.h / 2, fade);
  },
};
