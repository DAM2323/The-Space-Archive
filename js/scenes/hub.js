// The Archive (hub): the astronaut flies freely in zero gravity. Five ghost
// machines float around her, and six smaller, dimmer "echoes" float further
// out. Fly (or point) near a machine and select it to open its portal; do the
// same with an echo to read its card.
//
// Controls: she follows the pointer with inertia; arrows or WASD fly her;
// Enter, a click or a tap selects what is aimed at. Machines and echoes are
// also real DOM buttons over the canvas art, so Tab and screen readers work.

import { C } from '../data/palette.js';
import { SPRITES, ECHO_SPRITES } from '../data/sprites.js';
import { machines, echoes } from '../data/content.en.js';
import { SOURCES, visibleFacts } from '../data/sources.js';
import { t } from '../engine/i18n.js';
import { ctx, clear, px, drawSprite, bakeSprite, bakeScaled, WIDTH, HEIGHT } from '../engine/render.js';
import { Starfield, Particles, shake, ease, lerp, clamp } from '../engine/fx.js';
import { el, button, interactive } from '../engine/ui.js';
import { artFrame } from '../engine/art.js';
import * as scenes from '../engine/scenes.js';
import * as input from '../engine/input.js';
import { sfx, drone } from '../engine/audio.js';
import { save } from '../engine/storage.js';
import { gameState, MACHINE_IDS, ECHO_IDS, completedCount, echoesRead, archiveComplete } from '../state.js';

// ---------- layout (game pixels) ----------
export const MACHINE_SCALE = 1.5;     // all five machines are drawn 1.5 times their pixel maps
export const SPOTS = {
  lrv: { x: 52, y: 44 },
  pioneer10: { x: 160, y: 36 },
  sojourner: { x: 268, y: 44 },
  opportunity: { x: 66, y: 131 },
  ingenuity: { x: 254, y: 131 },
};
const ECHO_SPOTS = {
  surveyor3: { x: 16, y: 90 },
  viking1: { x: 304, y: 90 },
  near: { x: 118, y: 150 },
  insight: { x: 202, y: 150 },
  spirit: { x: 104, y: 44 },
  dawn: { x: 216, y: 44 },
};
// Faint lines join the five machines, like a constellation.
const LINKS = [['lrv', 'pioneer10'], ['pioneer10', 'sojourner'], ['sojourner', 'ingenuity'], ['ingenuity', 'opportunity'], ['opportunity', 'lrv']];
const ALL_IDS = [...MACHINE_IDS, ...ECHO_IDS];
const isEcho = (id) => !!ECHO_SPOTS[id];
const spotOf = (id) => SPOTS[id] ?? ECHO_SPOTS[id];
const HOME = { x: 160, y: 92 };       // where the astronaut rests

// ---------- GAME VALUES: how the astronaut moves ----------
const FOLLOW = 13;                    // GAME VALUE: pull toward the pointer
const FOLLOW_DRAG = 5.5;              // GAME VALUE: damping while following (gives the inertia)
const THRUST = 240;                   // GAME VALUE: keyboard acceleration, pixels per second squared
const DRIFT_DRAG = 2.4;               // GAME VALUE: damping while flying with keys
const NEAR_MACHINE = 38;              // GAME VALUE: how close counts as "near" a machine
const NEAR_ECHO = 20;                 // GAME VALUE: ...and near an echo
const STANDOFF_MACHINE = 30;          // GAME VALUE: how far from a machine she stops
const STANDOFF_ECHO = 13;             // GAME VALUE: ...and from an echo
const ECHO_DRIFT = 7;                 // GAME VALUE: how far an echo wanders from its spot, in pixels
const SCAN_TIME = 0.5;                // seconds to hold on an echo to read it
const DASH_TIME = 0.42;               // seconds of the dash toward a portal
const IDLE_TIME = 5;                  // seconds without input before she waves or flips

// ---------- the world (shared with the portal scene, which draws on top of it) ----------
const stars = new Starfield(150, 23);
const dust = new Particles(50);
const sparks = new Particles(160);
const puffs = new Particles(90);      // thruster puffs
const ghosts = {};                    // id -> { glow, phase, stamp }
ALL_IDS.forEach((id, i) => (ghosts[id] = { glow: 0, phase: i * 1.7, stamp: 0 }));
const astro = { x: HOME.x, y: HOME.y, vx: 0, vy: 0, facing: false };
let time = 0;
const thumbs = {};                    // id -> function that loads the picture of that machine's info card
let aimed = null;                     // id of the aimed machine or echo, or null
let arrive = 1;                       // 0..1 arrival animation
let pendingStamp = null;              // { id, at } stamp animation waiting to play
let scan = null;                      // { id, t, source } an echo being scanned by holding
let gesture = null;                   // { kind: 'wave' | 'flip', t, duration } idle animation
let nebula = null;

const still = () => gameState.settings.reducedMotion;
// A gentle bob. Reduced motion keeps it, at half the height.
const bob = (phase, amount = 3) => Math.sin(time * 0.8 + phase) * amount * (still() ? 0.5 : 1);

export function ghostPosition(id) {
  const s = spotOf(id), phase = ghosts[id].phase;
  if (still()) return { x: s.x, y: s.y + bob(phase, isEcho(id) ? 1.5 : 2) };   // no drift, only the gentle bob
  // Echoes drift slowly around their spot; machines only bob in place.
  if (isEcho(id)) return { x: s.x + Math.sin(time * 0.13 + phase) * ECHO_DRIFT, y: s.y + Math.cos(time * 0.1 + phase * 1.3) * ECHO_DRIFT * 0.7 };
  return { x: s.x + Math.sin(time * 0.37 + phase) * 1.5, y: s.y + bob(phase, 2) };
}

// A soft nebula, drawn once: dithered clouds in the cool palette colors.
function makeNebula() {
  const w = WIDTH + 60, h = HEIGHT + 40;
  const img = document.createElement('canvas');
  img.width = w;
  img.height = h;
  const g = img.getContext('2d');
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      // A few slow waves added together make a cloudy field between 0 and 1.
      const n = 0.5 + 0.22 * Math.sin(x * 0.021 + y * 0.013) + 0.18 * Math.sin(y * 0.034 - x * 0.009 + 2) + 0.12 * Math.sin((x + y) * 0.05 + 4) + 0.08 * Math.sin(x * 0.09 - y * 0.07);
      const v = n + (BAYER[(y & 3) * 4 + (x & 3)] / 16 - 0.5) * 0.28;
      if (v < 0.62) continue;
      const teal = Math.sin(x * 0.015 - y * 0.02) > 0.55;
      g.fillStyle = v > 0.86 ? (teal ? C.teal : C.violet) : v > 0.74 ? C.indigo : C.night;
      g.globalAlpha = v > 0.86 ? 0.3 : v > 0.74 ? 0.42 : 0.62;
      g.fillRect(x, y, 1, 1);
    }
  }
  return img;
}

// Small puffs from her backpack, pushed opposite to the way she accelerates.
function puff(ax, ay, amount = 1) {
  if (still() && Math.random() < 0.6) return;          // reduced motion: fewer puffs
  const len = Math.hypot(ax, ay) || 1;
  for (let i = 0; i < amount; i++) {
    puffs.spawn({
      x: astro.x - (ax / len) * 5 + (Math.random() - 0.5) * 3, y: astro.y - (ay / len) * 6 + (Math.random() - 0.5) * 3,
      vx: -(ax / len) * (18 + Math.random() * 22) + astro.vx * 0.3, vy: -(ay / len) * (18 + Math.random() * 22) + astro.vy * 0.3,
      drag: 2.5, life: 0.3 + Math.random() * 0.35, color: Math.random() < 0.55 ? C.amber : Math.random() < 0.5 ? C.ember : C.star, alpha: 0.9,
    });
  }
}

// `control`: { ax, ay } acceleration asked for by the player this step, or
// null when nobody is steering (portal transition).
export function updateWorld(dt, control = null) {
  time += dt;
  stars.update(dt, 1);
  if (Math.random() < (still() ? 0.015 : 0.04)) {
    dust.spawn({
      x: Math.random() * WIDTH, y: HEIGHT + 2, vx: (Math.random() - 0.5) * 4, vy: -(3 + Math.random() * 5),
      life: 14, color: Math.random() < 0.5 ? C.violet : C.indigo, alpha: 0.5,
    });
  }
  dust.update(dt);
  sparks.update(dt);
  puffs.update(dt);
  arrive = Math.min(1, arrive + dt / 1.6);

  // The astronaut: acceleration from the player, drag, then move and stay on screen.
  const drag = control?.drag ?? DRIFT_DRAG;
  const ax = control?.ax ?? 0, ay = control?.ay ?? 0;
  astro.vx += (ax - astro.vx * drag) * dt;
  astro.vy += (ay - astro.vy * drag) * dt;
  astro.x = clamp(astro.x + astro.vx * dt, 10, WIDTH - 10);
  astro.y = clamp(astro.y + astro.vy * dt, 26, HEIGHT - 14);
  if (Math.hypot(ax, ay) > 60 && Math.random() < 0.5) puff(ax, ay);
  if (gesture) {
    gesture.t += dt;
    if (gesture.t >= gesture.duration) gesture = null;
  }

  for (const id of ALL_IDS) {
    const g = ghosts[id];
    g.glow = lerp(g.glow, aimed === id ? 1 : 0, 1 - Math.exp(-10 * dt));
    g.stamp = Math.max(0, g.stamp - dt * 2);
    // Sparkles circle the aimed machine or echo.
    if (aimed === id && Math.random() < (still() ? 0.15 : 0.5)) {
      const a = Math.random() * Math.PI * 2, p = ghostPosition(id);
      const small = isEcho(id);
      sparks.spawn({
        x: p.x + Math.cos(a) * (small ? 10 : 25), y: p.y + Math.sin(a) * (small ? 8 : 17), vx: -Math.sin(a) * 9, vy: Math.cos(a) * 9 - 3,
        life: 0.5 + Math.random() * 0.4, color: small ? (Math.random() < 0.7 ? C.ice : C.star) : Math.random() < 0.7 ? C.amber : C.star,
      });
    }
  }

  // The "completed" stamp lands a moment after returning from a story.
  if (pendingStamp && time >= pendingStamp.at) {
    const id = pendingStamp.id, p = ghostPosition(id);
    pendingStamp = null;
    ghosts[id].stamp = 1;
    sfx('stamp');
    shake.add(1.6);
    for (let i = 0; i < 26; i++) {
      const a = Math.random() * Math.PI * 2, v = 20 + Math.random() * 40;
      sparks.spawn({
        x: p.x + machineSize(id).w / 2 + 4, y: p.y - machineSize(id).h / 2 - 3, vx: Math.cos(a) * v, vy: Math.sin(a) * v, drag: 3,
        life: 0.5 + Math.random() * 0.5, color: Math.random() < 0.6 ? C.green : C.star,
      });
    }
  }
}

// A small green check badge for completed machines (7 x 7 pixels, a bit larger while it lands).
function drawStamp(x, y, pop) {
  const r = 3 + Math.round(pop * 3);
  ctx.fillStyle = C.void;
  ctx.fillRect(x - r - 1, y - r - 1, r * 2 + 3, r * 2 + 3);
  ctx.fillStyle = pop > 0.5 ? C.star : C.green;
  ctx.fillRect(x - r, y - r, r * 2 + 1, r * 2 + 1);
  ctx.fillStyle = C.void;
  // check mark
  [[-2, 0], [-1, 1], [0, 0], [1, -1], [2, -2]].forEach(([dx, dy]) => ctx.fillRect(x + dx, y + dy, 1, 2));
}

// One machine ghost, with its top-left corner at (x, y). Also used by the portal.
export function drawMachine(id, x, y, alpha = 1) {
  ctx.globalAlpha = alpha;
  ctx.drawImage(bakeScaled(SPRITES[id], MACHINE_SCALE), Math.round(x), Math.round(y));
  ctx.globalAlpha = 1;
}
export const machineSize = (id) => {
  const img = bakeScaled(SPRITES[id], MACHINE_SCALE);
  return { w: img.width, h: img.height };
};

// Four corner brackets around the aimed machine or echo.
function drawBrackets(x, y, w, h, glow, color) {
  const gap = Math.round(lerp(10, 2, ease.outBack(clamp(glow))) + (still() ? 0 : Math.sin(time * 5) * 0.8));
  const arm = w < 16 ? 3 : 6;
  const x0 = Math.round(x - w / 2 - gap), x1 = Math.round(x + w / 2 + gap);
  const y0 = Math.round(y - h / 2 - gap), y1 = Math.round(y + h / 2 + gap);
  ctx.globalAlpha = clamp(glow * 1.5);
  ctx.fillStyle = color;
  for (const [cx, sx] of [[x0, 1], [x1, -1]]) {
    for (const [cy, sy] of [[y0, 1], [y1, -1]]) {
      ctx.fillRect(sx > 0 ? cx : cx - arm + 1, cy, arm, 1);
      ctx.fillRect(cx, sy > 0 ? cy : cy - arm + 1, 1, arm);
    }
  }
  ctx.globalAlpha = 1;
}

// The astronaut: the sprite turned toward what she looks at, plus an arm that
// points at the aimed machine, waves when idle, and a slow flip now and then.
function drawAstronaut(alpha) {
  const img = bakeSprite(SPRITES.astronaut);
  const x = Math.round(astro.x), y = Math.round(astro.y + bob(0.5, 2) + (1 - ease.outCubic(arrive)) * -40);
  const flip = gesture?.kind === 'flip' ? ease.inOutSine(gesture.t / gesture.duration) * Math.PI * 2 : 0;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  if (flip) ctx.rotate(flip);
  ctx.scale(astro.facing ? -1 : 1, 1);
  ctx.drawImage(img, -6, -8);
  ctx.restore();
  ctx.globalAlpha = 1;
  if (flip) return;

  // The arm starts at the shoulder on the side she is facing.
  const side = astro.facing ? -1 : 1;
  const sx = x + side * 4, sy = y + 1;
  let angle = null;
  if (aimed) {
    const p = ghostPosition(aimed);
    angle = Math.atan2(p.y - sy, p.x - sx);
    // Her visor catches the light on the side she looks toward.
    px(x + side * 2, y - 5 + Math.sign(p.y - y), C.star, alpha);
  } else if (gesture?.kind === 'wave') {
    angle = -Math.PI / 2 + side * (0.5 + 0.45 * Math.sin(gesture.t * 11));
  }
  if (angle !== null) {
    for (let i = 1; i <= 5; i++) px(sx + Math.cos(angle) * i, sy + Math.sin(angle) * i, i === 5 ? C.star : C.mist, alpha);
  }
}

// `hide` skips one machine (the portal draws that one itself).
export function renderWorld(hide = null) {
  clear();
  // Camera parallax: the far layers shift a little against her movement.
  const ox = still() ? 0 : (HOME.x - astro.x) * 0.1, oy = still() ? 0 : (HOME.y - astro.y) * 0.1;
  nebula ??= makeNebula();
  ctx.drawImage(nebula, Math.round(-30 + ox * 0.5), Math.round(-20 + oy * 0.5));
  stars.render(ox * 1.6, oy * 1.6);
  dust.render();

  // Faint dotted lines between the machines. They light up when all five stories are done.
  const shownAll = clamp(arrive * 2 - 0.8);
  const complete = archiveComplete();
  for (const [a, b] of LINKS) {
    const pa = ghostPosition(a), pb = ghostPosition(b);
    const len = Math.hypot(pb.x - pa.x, pb.y - pa.y);
    const lit = aimed === a || aimed === b;
    const march = complete && !still() ? (time * 10) % 5 : 0;        // light runs along the lines once complete
    for (let d = 24 + march; d < len - 24; d += 5) {
      px(lerp(pa.x, pb.x, d / len), lerp(pa.y, pb.y, d / len), complete ? C.amber : lit ? C.mist : C.violet, shownAll * (complete ? 0.75 : lit ? 0.4 : 0.22));
    }
  }
  // Complete: the center of the Archive pulses with slow rings of light.
  if (complete) {
    for (let ring = 0; ring < 2; ring++) {
      const k = (time * (still() ? 0.08 : 0.22) + ring * 0.5) % 1;
      const radius = 8 + k * 46, steps = Math.round(18 + radius * 1.2);
      for (let i = 0; i < steps; i++) {
        const a = (i / steps) * Math.PI * 2;
        px(HOME.x + Math.cos(a) * radius, HOME.y + Math.sin(a) * radius * 0.6, ring ? C.amber : C.green, shownAll * (1 - k) * 0.5);
      }
    }
  }

  // Echoes: smaller and dimmer than the machines, further from the center.
  ECHO_IDS.forEach((id, i) => {
    const g = ghosts[id], p = ghostPosition(id);
    const img = bakeSprite(ECHO_SPRITES[id]);
    const read = gameState.echoes[id];
    const shown = clamp(arrive * 3 - 1.4 - i * 0.2);
    const flicker = still() ? 0 : Math.sin(time * 2.3 + g.phase * 3) * 0.06;
    const alpha = shown * lerp(read ? 0.55 : 0.32 + flicker, 1, g.glow);
    const lift = -2 * ease.outBack(clamp(g.glow));
    const x = p.x - img.width / 2, y = p.y - img.height / 2 + lift;
    drawSprite(ECHO_SPRITES[id], x, y, { alpha });
    if (g.glow > 0.03) drawBrackets(p.x, p.y + lift, img.width, img.height, g.glow, C.ice);
    if (read) px(Math.round(p.x + img.width / 2) + 1, Math.round(y) - 2, C.green, shown, 3, 3);   // small "read" light
    // Scanning: a ring fills clockwise around the echo while the player holds.
    if (scan?.id === id) {
      const steps = 44, radius = 12;
      for (let k = 0; k < steps; k++) {
        const a = -Math.PI / 2 + (k / steps) * Math.PI * 2;
        const lit = k / steps <= scan.t;
        px(p.x + Math.cos(a) * radius, p.y + lift + Math.sin(a) * radius, lit ? C.ice : C.indigo, lit ? 1 : 0.6);
      }
    }
  });

  for (const id of MACHINE_IDS) {
    if (id === hide) continue;
    const g = ghosts[id], p = ghostPosition(id);
    const { w, h } = machineSize(id);
    const done = gameState.completed[id];
    // Machines fade in one after another when she arrives.
    const shown = clamp(arrive * 3 - 0.4 - MACHINE_IDS.indexOf(id) * 0.3);
    const flicker = still() ? 0 : Math.sin(time * 3 + g.phase * 5) * 0.05;
    const alpha = shown * lerp(done ? 0.85 : 0.6 + flicker, 1, g.glow);
    const lift = -3 * ease.outBack(clamp(g.glow));
    const x = p.x - w / 2, y = p.y - h / 2 + lift;

    // The glow when she or the pointer is near: a soft amber block behind the ghost.
    if (g.glow > 0.03) {
      ctx.fillStyle = C.amber;
      ctx.globalAlpha = 0.07 * g.glow * shown;
      ctx.fillRect(Math.round(x) - 5, Math.round(y) - 4, w + 10, h + 8);
      ctx.globalAlpha = 0.07 * g.glow * shown;
      ctx.fillRect(Math.round(x) - 3, Math.round(y) - 2, w + 6, h + 4);
      ctx.globalAlpha = 1;
    }
    drawMachine(id, x, y, alpha);
    if (g.glow > 0.03) drawBrackets(p.x, p.y + lift, w, h, g.glow, C.amber);
    if (done && !(pendingStamp && pendingStamp.id === id)) drawStamp(Math.round(p.x + w / 2) + 5, Math.round(y) - 3, g.stamp);   // top right, just outside the machine
  }

  // Dotted aiming line from the astronaut to the aimed machine or echo.
  if (aimed) {
    const p = ghostPosition(aimed), g = ghosts[aimed];
    const dx = p.x - astro.x, dy = p.y - astro.y, len = Math.hypot(dx, dy);
    const color = isEcho(aimed) ? C.ice : C.amber;
    for (let d = 10; d < len - (isEcho(aimed) ? 10 : 22); d += 4) {
      const march = still() ? 0 : (time * 14) % 4;
      const k = (d + march) / len;
      px(astro.x + dx * k, astro.y + dy * k, color, 0.6 * g.glow);
    }
  }

  sparks.render();
  puffs.render();
  drawAstronaut(ease.outCubic(arrive));
}

// Aim at a machine or an echo (null for nothing). She turns to face it.
export function setAim(id, quiet = false) {
  if (id === aimed) return;
  aimed = id;
  if (id) {
    astro.facing = spotOf(id).x < astro.x;
    if (!quiet) sfx('hover');
  }
  for (const key in dom.buttons ?? {}) dom.buttons[key].classList.toggle('aimed', key === id);
  thumbs[id]?.();
}

// ---------- the hub scene ----------
let dom = {};
let offInput = null;
let leaving = false;
let focused = null;                   // id of the ghost button that has keyboard focus
let mode = 'idle';                    // 'pointer' | 'keys' | 'idle': who is steering
let dash = null;                      // { id, t, from } she is dashing toward a selection
let modal = false;                    // the "Archive is complete" card is open: the hub waits
let completeAt = null;                // when to show that card (world time), or null
let uiRoot = null;
let idle = 0;
let nextGesture = 'wave';
const held = new Set();               // fly keys that are down

const FLY_KEYS = {
  ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1],
  a: [-1, 0], d: [1, 0], w: [0, -1], s: [0, 1], A: [-1, 0], D: [1, 0], W: [0, -1], S: [0, 1],
};

// Hold on an echo to scan it. `source` remembers what started the hold, so
// only releasing that same thing (the pointer or the key) cancels it.
function startScan(id, source) {
  if (leaving || scan) return;
  scan = { id, t: 0, source };
  idle = 0;
  gesture = null;
  setAim(id, true);
  sfx('charge');
}
function cancelScan(source) {
  if (scan && (!source || scan.source === source)) scan = null;
}

const HOLD_KEYS = ['Enter', ' '];

function onKeyDown(e) {
  if (modal) return;
  if (HOLD_KEYS.includes(e.key) && !leaving && !e.ctrlKey && !e.metaKey && !e.altKey) {
    // Enter or Space on a machine selects at once (as a normal button press);
    // on an echo it starts the scan and must be held.
    const onOtherButton = e.target instanceof HTMLElement && e.target.closest('button') && !e.target.closest('.ghost');
    const target = onOtherButton ? null : findAim();
    if (target && isEcho(target)) {
      e.preventDefault();
      if (!e.repeat) startScan(target, 'key');
    }
    return;
  }
  if (!FLY_KEYS[e.key] || e.ctrlKey || e.metaKey || e.altKey || leaving) return;
  e.preventDefault();
  held.add(e.key);
  mode = 'keys';
  idle = 0;
  gesture = null;
  // Flying takes over from a focused button, so Enter selects what she is near.
  if (document.activeElement instanceof HTMLElement && document.activeElement !== document.body) document.activeElement.blur();
}
function onKeyUp(e) {
  held.delete(e.key);
  if (HOLD_KEYS.includes(e.key)) {
    if (scan?.source === 'key') e.preventDefault();          // no late "click" from the Space key
    cancelScan('key');
  }
}
const onBlur = () => { held.clear(); cancelScan(); };
const onPointerUp = () => cancelScan('pointer');

// What is being aimed at: the focused button, or the nearest machine or echo
// that she, or the pointer, is close to.
function findAim() {
  if (focused) return focused;
  let best = null, bestDistance = Infinity;
  for (const id of ALL_IDS) {
    const p = ghostPosition(id), reach = isEcho(id) ? NEAR_ECHO : NEAR_MACHINE;
    let d = Math.hypot(astro.x - p.x, astro.y - p.y);
    if (mode === 'pointer' && input.pointer.active) d = Math.min(d, Math.hypot(input.pointer.x - p.x, input.pointer.y - p.y));
    if (d < reach && d / reach < bestDistance) { bestDistance = d / reach; best = id; }
  }
  return best;
}

function open(id) {
  if (isEcho(id)) scenes.go('echo', { id });
  else scenes.go('portal', { machine: id }, { instant: true });
}

// Select a machine or an echo: she dashes to it, then the portal (or card) opens.
function select(id) {
  if (leaving) return;
  leaving = true;
  held.clear();
  gesture = null;
  setAim(id, true);
  sfx('select');
  if (still()) return open(id);            // reduced motion: no dash
  sfx('whoosh');
  dash = { id, t: 0, from: { x: astro.x, y: astro.y } };
}

// One invisible button over a machine or an echo. Machines keep their name
// and year visible below them; echo labels appear when they are aimed at.
function ghostButton(id, className, parts) {
  const spot = spotOf(id);
  const b = el('button', className);
  b.type = 'button';
  b.style.left = `${(spot.x / WIDTH) * 100}%`;
  b.style.top = `${(spot.y / HEIGHT) * 100}%`;
  const label = el('span', 'ghost-label');
  // Labels near the left or right edge are shifted so they stay on screen.
  if (isEcho(id) && spot.x < 50) label.classList.add('edge-left');
  if (isEcho(id) && spot.x > WIDTH - 50) label.classList.add('edge-right');
  for (const [cls, text] of parts) if (text) label.append(el('span', cls, text));
  b.append(label);
  b.setAttribute('aria-label', parts.map(([, text]) => text).filter(Boolean).join(', '));
  if (isEcho(id)) {
    // Echoes are read by holding. A plain activation without a pointer or a
    // held key (for example from a screen reader) opens the echo directly.
    interactive(b, () => {}, '');
    b.addEventListener('pointerdown', () => startScan(id, 'pointer'));
    b.addEventListener('click', (e) => { if (e.detail === 0 && !scan) select(id); });
    b.addEventListener('contextmenu', (e) => e.preventDefault());
  } else {
    interactive(b, () => select(id), '');
  }
  b.addEventListener('focus', () => { focused = id; setAim(id, true); });
  b.addEventListener('blur', () => { if (focused === id) focused = null; });
  b.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') b.blur(); });
  dom.buttons[id] = b;
  return b;
}

// The info card of a machine: name, years and one verified fact with its source.
// It sits above the machine, or below its label when there is no room above,
// and fades in while the machine is aimed at (pointer, astronaut or keyboard focus).
function infoCard(id, b) {
  const m = machines[id], spot = spotOf(id);
  const facts = visibleFacts(m.debrief);
  const fact = facts.includes(m.debrief[m.cardFact]) ? m.debrief[m.cardFact] : facts[0];
  if (!fact) return;
  const card = el('span', 'ghost-card');
  card.id = `card-${id}`;
  const words = el('span', 'card-words');
  words.append(
    el('span', 'card-title', t(m.name)),
    el('span', 'card-years', t('hub.cardYears', { y: t(m.years) })),
    el('span', 'card-fact', t(fact.textKey)),
    el('span', 'fact-source', `${t('debrief.source')}: ${SOURCES[fact.sourceId].short}`),
  );
  card.append(words);
  // A small picture of the machine, loaded the first time its card is shown.
  if (m.art) {
    let asked = false;
    const thumb = () => {
      if (asked) return;
      asked = true;
      card.classList.add('has-art');
      card.prepend(artFrame({ src: m.art, alt: t(`art.${id}`), onFail: () => card.classList.remove('has-art') }));
    };
    b.addEventListener('pointerenter', thumb);
    b.addEventListener('focus', thumb);
    thumbs[id] = thumb;
  }
  if (spot.y < HEIGHT / 2) b.classList.add('card-below');
  if (spot.x < 80) card.classList.add('edge-left');
  if (spot.x > WIDTH - 80) card.classList.add('edge-right');
  b.append(card);
  b.setAttribute('aria-describedby', card.id);
}

function buildUI(ui) {
  const top = el('div', 'hub-top');
  const n = completedCount();
  const progress = el('p', 'hub-progress');
  progress.append(
    el('span', '', t('hub.progress', { n, total: MACHINE_IDS.length })),
    el('span', 'hub-echoes', t('hub.echoes', { n: echoesRead(), total: ECHO_IDS.length })),
  );
  const allDone = n === MACHINE_IDS.length;
  top.append(
    progress,
    button(t('hub.title'), () => scenes.go('title'), 'small', 'back'),
    button(t('hub.wall'), () => scenes.go('wall'), 'small'),
    // The Science Room is highlighted once all five machines are archived.
    button(t('hub.leave'), () => scenes.go('science'), allDone ? 'small primary' : 'small'),
  );

  const field = el('div', 'hub-field');
  dom.buttons = {};
  for (const id of MACHINE_IDS) {
    const m = machines[id];
    const b = ghostButton(id, 'ghost machine', [
      ['ghost-name', t(m.name)], ['ghost-years', t(m.years)], ['ghost-done', gameState.completed[id] ? t('hub.completed') : ''],
    ]);
    infoCard(id, b);
    field.append(b);
  }
  for (const id of ECHO_IDS) {
    const e = echoes[id];
    field.append(ghostButton(id, `ghost echo${ECHO_SPOTS[id].y > HEIGHT / 2 ? ' above' : ''}`, [
      ['ghost-kind', t('hub.echo')], ['ghost-name', t(e.name)], ['ghost-years', t(e.years)], ['ghost-done', gameState.echoes[id] ? t('hub.echoRead') : ''],
    ]));
  }

  const bottom = el('div', 'hub-bottom');
  const everything = allDone && echoesRead() === ECHO_IDS.length;
  dom.hint = el('p', 'hub-hint', t(everything ? 'hub.completeHint' : allDone ? 'hub.allDone' : 'hub.hint'));
  bottom.append(dom.hint, el('p', 'hub-controls', t('hub.controls')));
  ui.append(top, field, bottom);
  dom.field = field;
  dom.top = top;

  // All five stories done: the progress block says so from then on.
  if (allDone) {
    dom.stamp = el('span', 'hub-complete', t('hub.complete'));
    progress.append(dom.stamp);
  }
}

// The "Archive is complete" moment, shown once: a card with a short recap of
// what the player learned (one verified fact per machine, the same ones as on
// the hub cards). It is remembered in the saved game.
function showComplete(ui) {
  modal = true;
  held.clear();
  scan = null;
  gameState.archiveSeen = true;
  save();
  sfx('stamp');
  sfx('success');
  shake.add(2);
  dom.stamp?.classList.add('land');

  const card = el('section', 'panel complete');
  card.setAttribute('role', 'dialog');
  card.setAttribute('aria-label', t('hub.complete'));
  const list = el('ul', 'facts');
  MACHINE_IDS.forEach((id, i) => {
    const m = machines[id];
    const facts = visibleFacts(m.debrief);
    const fact = facts.includes(m.debrief[m.cardFact]) ? m.debrief[m.cardFact] : facts[0];
    if (!fact) return;
    const item = el('li', 'fact');
    item.style.animationDelay = `${0.3 + i * 0.16}s`;
    item.append(el('span', 'recap-name', t(m.name)), el('span', 'fact-text', t(fact.textKey)));
    list.append(item);
  });
  const close = () => {
    card.remove();
    dom.field.inert = dom.top.inert = false;
    modal = false;
  };
  const stay = button(t('complete.stay'), close, 'small');
  const room = button(t('hub.science'), () => scenes.go('science'), 'small primary');
  const row = el('div', 'sci-nav');
  row.append(stay, room);
  card.append(el('h2', 'panel-title', t('hub.complete')), el('p', 'complete-intro', t('complete.intro')), list, row);
  ui.append(card);
  dom.field.inert = dom.top.inert = true;
  room.focus({ preventScroll: true });
}

export default {
  // params.arriving: coming from the intro. params.justCompleted: a machine id
  // to stamp. params.focus: what to aim at.
  enter(params, ui) {
    leaving = false;
    dash = null;
    scan = null;
    focused = null;
    mode = 'idle';
    idle = 0;
    gesture = null;
    held.clear();
    aimed = null;
    arrive = params.arriving ? 0 : 0.75;
    if (params.arriving) Object.assign(astro, { x: HOME.x, y: HOME.y, vx: 0, vy: 0 });
    if (params.justCompleted) pendingStamp = { id: params.justCompleted, at: time + 0.45 };
    // The big stamp lands when the last machine or the last echo completes the Archive.
    buildUI(ui);
    // The first time all five stories are done: the "Archive is complete" moment,
    // a little after the last stamp has landed.
    modal = false;
    completeAt = archiveComplete() && !gameState.archiveSeen ? time + (params.justCompleted ? 1.7 : 0.9) : null;
    uiRoot = ui;
    if (params.arriving) {
      dom.hint.textContent = t('hub.arrive');
      setTimeout(() => { if (dom.hint.isConnected) dom.hint.textContent = t('hub.hint'); }, 4500);
    }
    // Coming back from a story or a card: she is still next to it, so it stays aimed.
    if (params.focus && spotOf(params.focus)) {
      const p = spotOf(params.focus);
      if (Math.hypot(astro.x - p.x, astro.y - p.y) > (isEcho(params.focus) ? NEAR_ECHO : NEAR_MACHINE) - 6) {
        const gap = isEcho(params.focus) ? STANDOFF_ECHO : STANDOFF_MACHINE;
        Object.assign(astro, { x: p.x + (p.x < HOME.x ? gap : -gap), y: p.y + (isEcho(params.focus) ? -3 : 6), vx: 0, vy: 0 });
      }
    }
    drone(true);
    offInput = input.on((a) => {
      if (leaving || modal) return;
      if (a.type === 'pointer' || (a.type === 'confirm' && a.fromPointer)) { mode = 'pointer'; idle = 0; gesture = null; }
      if (a.type === 'confirm') {
        const target = findAim();
        if (target && isEcho(target)) { if (a.fromPointer) startScan(target, 'pointer'); }   // keys are handled in onKeyDown
        else if (target) select(target);
      } else if (a.type === 'back') {
        sfx('back');
        scenes.go('title');
      }
    });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  },

  exit() {
    offInput();
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    window.removeEventListener('blur', onBlur);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('pointercancel', onPointerUp);
    held.clear();
    scan = null;
  },

  update(dt) {
    // The dash: a quick, accelerating move to the selection, with a burst of puffs.
    if (dash) {
      dash.t += dt / DASH_TIME;
      const p = ghostPosition(dash.id);
      // She stops just in front of it, on the side she came from.
      const gap = isEcho(dash.id) ? STANDOFF_ECHO : STANDOFF_MACHINE;
      const away = Math.hypot(dash.from.x - p.x, dash.from.y - p.y) || 1;
      const stop = Math.min(1, gap / away);
      const tx = lerp(p.x, dash.from.x, stop), ty = lerp(p.y, dash.from.y, stop);
      const k = ease.inCubic(clamp(dash.t));
      const nx = lerp(dash.from.x, tx, k), ny = lerp(dash.from.y, ty, k);
      puff(nx - astro.x, ny - astro.y, 2);
      astro.vx = astro.vy = 0;
      astro.x = nx;
      astro.y = ny;
      updateWorld(dt);
      if (dash.t >= 1) {
        const id = dash.id;
        dash = null;
        open(id);
      }
      return;
    }

    if (completeAt !== null && time >= completeAt && !leaving) {
      completeAt = null;
      showComplete(uiRoot);
    }
    if (modal) { updateWorld(dt); return; }

    // Steering: keys give thrust, the pointer pulls her like a soft spring.
    let control = null;
    if (!leaving) {
      let kx = 0, ky = 0;
      for (const key of held) { kx += FLY_KEYS[key][0]; ky += FLY_KEYS[key][1]; }
      const len = Math.hypot(kx, ky);
      if (len) {
        control = { ax: (kx / len) * THRUST, ay: (ky / len) * THRUST, drag: DRIFT_DRAG };
        if (kx) astro.facing = kx < 0;
        idle = 0;
      } else if (mode === 'pointer' && input.pointer.active) {
        // She flies to the pointer, but when something is aimed at she stops
        // beside it instead of on top of it.
        let tx = input.pointer.x, ty = input.pointer.y, keep = 14;
        if (aimed) {
          // Only while the pointer itself is on that machine or echo; when the
          // pointer moves away she follows it again.
          const p = ghostPosition(aimed);
          if (Math.hypot(tx - p.x, ty - p.y) < (isEcho(aimed) ? NEAR_ECHO : NEAR_MACHINE)) {
            tx = p.x;
            ty = p.y;
            keep = isEcho(aimed) ? STANDOFF_ECHO : STANDOFF_MACHINE;
          }
        }
        const dx = tx - astro.x, dy = ty - astro.y;
        const distance = Math.hypot(dx, dy);
        // Positive pull moves her closer, negative pull backs her off to the right distance.
        const pull = distance > 0.5 ? clamp((distance - keep) / distance, -1.5, 1) : 0;
        control = { ax: dx * pull * FOLLOW, ay: dy * pull * FOLLOW, drag: FOLLOW_DRAG };
        if (!aimed && Math.abs(dx) > 6) astro.facing = dx < 0;
      }
    }
    updateWorld(dt, control);
    if (!leaving) {
      // The echo buttons follow the drifting echoes, so pointer and focus stay on target.
      for (const id of ECHO_IDS) {
        const p = ghostPosition(id), b = dom.buttons[id];
        b.style.left = `${(p.x / WIDTH) * 100}%`;
        b.style.top = `${(p.y / HEIGHT) * 100}%`;
      }
      setAim(findAim());
      // Scanning an echo: the ring fills while the hold lasts; it opens when full
      // and is cancelled if she is no longer aimed at that echo.
      if (scan) {
        if (aimed !== scan.id) {
          scan = null;
        } else {
          scan.t += dt / SCAN_TIME;
          if (scan.t >= 1) {
            const id = scan.id;
            scan = null;
            select(id);
            return;
          }
        }
      }
      // Idle for a while: she waves, or does a slow flip (never with reduced motion).
      const pushing = control ? Math.hypot(control.ax, control.ay) : 0;
      idle += Math.hypot(astro.vx, astro.vy) < 6 && pushing < 12 ? dt : 0;
      if (idle >= IDLE_TIME && !gesture && !aimed) {
        // Reduced motion: she only waves, never flips.
        gesture = nextGesture === 'wave' || still() ? { kind: 'wave', t: 0, duration: 1.8 } : { kind: 'flip', t: 0, duration: 2.6 };
        nextGesture = nextGesture === 'wave' ? 'flip' : 'wave';
        idle = 0;
      } else if (idle >= IDLE_TIME) {
        idle = 0;
      }
    }
  },

  render() {
    renderWorld();
  },
};
