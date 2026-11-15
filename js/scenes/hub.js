// The Archive (hub): the astronaut floats in zero gravity and five ghost
// machines drift around her. Aim at one and select it to open its portal.
//
// The machines are real DOM buttons placed over the canvas art, so they work
// with mouse, touch, keyboard and screen readers. "Aimed" simply means focused.

import { C } from '../data/palette.js';
import { SPRITES } from '../data/sprites.js';
import { machines } from '../data/content.en.js';
import { t } from '../engine/i18n.js';
import { ctx, clear, px, drawSprite, bakeSprite, WIDTH, HEIGHT } from '../engine/render.js';
import { Starfield, Particles, shake, ease, lerp, clamp } from '../engine/fx.js';
import { el, button, interactive } from '../engine/ui.js';
import * as scenes from '../engine/scenes.js';
import * as input from '../engine/input.js';
import { sfx, drone } from '../engine/audio.js';
import { gameState, MACHINE_IDS, completedCount } from '../state.js';

// Where each ghost floats (center, in game pixels).
export const SPOTS = {
  lrv: { x: 56, y: 52 },
  pioneer10: { x: 160, y: 34 },
  sojourner: { x: 264, y: 52 },
  opportunity: { x: 88, y: 122 },
  ingenuity: { x: 232, y: 122 },
};
const ASTRO = { x: 160, y: 82 };      // astronaut center

// ---------- the world (shared with the portal scene, which draws on top of it) ----------
const stars = new Starfield(130, 23);
const dust = new Particles(50);
const sparks = new Particles(160);
const ghosts = {};                    // id -> { glow, phase, stampAt }
MACHINE_IDS.forEach((id, i) => (ghosts[id] = { glow: 0, phase: i * 1.7, appear: 1, stamp: 0 }));
let time = 0;
let aimed = null;                     // id of the aimed machine, or null
let facing = false;                   // astronaut looks left?
let arrive = 1;                       // 0..1 arrival animation
let pendingStamp = null;              // { id, at } stamp animation waiting to play

const still = () => gameState.settings.reducedMotion;
const bob = (phase, amount = 3) => (still() ? 0 : Math.sin(time * 0.8 + phase) * amount);

export function ghostPosition(id) {
  const s = SPOTS[id];
  return { x: s.x + (still() ? 0 : Math.sin(time * 0.37 + ghosts[id].phase) * 2), y: s.y + bob(ghosts[id].phase) };
}

export function updateWorld(dt) {
  time += dt;
  stars.update(dt, 1);
  if (!still() && Math.random() < 0.04) {
    dust.spawn({
      x: Math.random() * WIDTH, y: HEIGHT + 2, vx: (Math.random() - 0.5) * 4, vy: -(3 + Math.random() * 5),
      life: 14, color: Math.random() < 0.5 ? C.violet : C.indigo, alpha: 0.5,
    });
  }
  dust.update(dt);
  sparks.update(dt);
  arrive = Math.min(1, arrive + dt / 1.6);

  for (const id of MACHINE_IDS) {
    const g = ghosts[id];
    g.glow = lerp(g.glow, aimed === id ? 1 : 0, 1 - Math.exp(-10 * dt));
    g.stamp = Math.max(0, g.stamp - dt * 2);
    // Sparkles circle the aimed machine.
    if (aimed === id && !still() && Math.random() < 0.5) {
      const a = Math.random() * Math.PI * 2, p = ghostPosition(id);
      sparks.spawn({
        x: p.x + Math.cos(a) * 19, y: p.y + Math.sin(a) * 13, vx: -Math.sin(a) * 9, vy: Math.cos(a) * 9 - 3,
        life: 0.5 + Math.random() * 0.4, color: Math.random() < 0.7 ? C.amber : C.star,
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
        x: p.x + 12, y: p.y - 8, vx: Math.cos(a) * v, vy: Math.sin(a) * v, drag: 3,
        life: 0.5 + Math.random() * 0.5, color: Math.random() < 0.6 ? C.green : C.star,
      });
    }
  }
}

// A small green check badge for completed machines.
function drawStamp(x, y, pop) {
  const r = 5 + Math.round(pop * 3);
  ctx.fillStyle = C.void;
  ctx.fillRect(x - r - 1, y - r - 1, r * 2 + 3, r * 2 + 3);
  ctx.fillStyle = pop > 0.5 ? C.star : C.green;
  ctx.fillRect(x - r, y - r, r * 2 + 1, r * 2 + 1);
  ctx.fillStyle = C.void;
  // check mark
  [[-3, 0], [-2, 1], [-1, 2], [0, 1], [1, 0], [2, -1], [3, -2]].forEach(([dx, dy]) => ctx.fillRect(x + dx, y + dy, 1, 2));
}

// Four corner brackets around the aimed machine.
function drawBrackets(x, y, w, h, glow) {
  const gap = Math.round(lerp(10, 2, ease.outBack(clamp(glow))) + (still() ? 0 : Math.sin(time * 5) * 0.8));
  const x0 = Math.round(x - w / 2 - gap), x1 = Math.round(x + w / 2 + gap);
  const y0 = Math.round(y - h / 2 - gap), y1 = Math.round(y + h / 2 + gap);
  ctx.globalAlpha = clamp(glow * 1.5);
  ctx.fillStyle = C.amber;
  for (const [cx, sx] of [[x0, 1], [x1, -1]]) {
    for (const [cy, sy] of [[y0, 1], [y1, -1]]) {
      ctx.fillRect(sx > 0 ? cx : cx - 4, cy, 5, 1);
      ctx.fillRect(cx, sy > 0 ? cy : cy - 4, 1, 5);
    }
  }
  ctx.globalAlpha = 1;
}

// `hide` skips one machine (the portal draws that one itself).
export function renderWorld(hide = null) {
  clear();
  stars.render();
  dust.render();

  for (const id of MACHINE_IDS) {
    if (id === hide) continue;
    const g = ghosts[id], p = ghostPosition(id);
    const img = bakeSprite(SPRITES[id]);
    const done = gameState.completed[id];
    // Machines fade in one after another when she arrives.
    const shown = clamp(arrive * 3 - 0.4 - MACHINE_IDS.indexOf(id) * 0.3);
    const flicker = still() ? 0 : Math.sin(time * 3 + g.phase * 5) * 0.05;
    const alpha = shown * lerp(done ? 0.85 : 0.55 + flicker, 1, g.glow);
    const lift = -3 * ease.outBack(clamp(g.glow));
    const x = p.x - img.width / 2, y = p.y - img.height / 2 + lift;

    // Soft halo behind the ghost.
    ctx.globalAlpha = shown * (0.1 + 0.2 * g.glow);
    ctx.fillStyle = aimed === id ? C.amber : C.violet;
    ctx.fillRect(Math.round(x) - 3, Math.round(y + img.height) + 2, img.width + 6, 1);
    ctx.globalAlpha = 1;

    drawSprite(SPRITES[id], x, y, { alpha });
    if (g.glow > 0.03) drawBrackets(p.x, p.y + lift, img.width, img.height, g.glow);
    if (done && !(pendingStamp && pendingStamp.id === id)) drawStamp(Math.round(p.x + img.width / 2), Math.round(y) - 1, g.stamp);
  }

  // Dotted aiming line from the astronaut to the aimed machine.
  const ay = ASTRO.y + bob(0.5, 4) + (1 - ease.outCubic(arrive)) * -40;
  if (aimed) {
    const p = ghostPosition(aimed), g = ghosts[aimed];
    const dx = p.x - ASTRO.x, dy = p.y - ay, len = Math.hypot(dx, dy);
    for (let d = 12; d < len - 20; d += 4) {
      const march = still() ? 0 : (time * 14) % 4;
      const k = (d + march) / len;
      px(ASTRO.x + dx * k, ay + dy * k, C.amber, 0.7 * g.glow);
    }
  }

  sparks.render();
  drawSprite(SPRITES.astronaut, ASTRO.x - 6, ay - 8, { flip: facing, alpha: ease.outCubic(arrive) });
}

export function setAim(id) {
  aimed = id;
  if (id) facing = SPOTS[id].x < ASTRO.x;
}

// ---------- the hub scene ----------
let dom = {};
let offInput = null;
let leaving = false;

function enterPortal(id) {
  if (leaving) return;
  leaving = true;
  setAim(id);
  scenes.go('portal', { machine: id }, { instant: true });
}

function buildUI(ui) {
  const top = el('div', 'hub-top');
  const n = completedCount();
  top.append(el('p', 'hub-progress', t('hub.progress', { n, total: MACHINE_IDS.length })));
  top.append(button(t('hub.title'), () => scenes.go('title'), 'small', 'back'));

  const field = el('div', 'hub-field');
  dom.buttons = {};
  for (const id of MACHINE_IDS) {
    const m = machines[id];
    // Machines in the lower half show their label above, so it stays on screen.
    const b = el('button', SPOTS[id].y > HEIGHT / 2 ? 'ghost above' : 'ghost');
    b.type = 'button';
    b.style.left = `${(SPOTS[id].x / WIDTH) * 100}%`;
    b.style.top = `${(SPOTS[id].y / HEIGHT) * 100}%`;
    const label = el('span', 'ghost-label');
    label.append(el('span', 'ghost-name', t(m.name)));
    if (t(m.years)) label.append(el('span', 'ghost-years', t(m.years)));
    if (gameState.completed[id]) label.append(el('span', 'ghost-done', t('hub.completed')));
    b.append(label);
    b.setAttribute('aria-label', [t(m.name), t(m.years), gameState.completed[id] ? t('hub.completed') : ''].filter(Boolean).join(', '));
    interactive(b, () => enterPortal(id), '');
    b.addEventListener('focus', () => setAim(id));
    b.addEventListener('blur', () => { if (aimed === id && !leaving) setAim(null); });
    b.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') b.blur(); });
    dom.buttons[id] = b;
    field.append(b);
  }

  const bottom = el('div', 'hub-bottom');
  const allDone = n === MACHINE_IDS.length;
  dom.hint = el('p', 'hub-hint', t(allDone ? 'hub.allDone' : 'hub.hint'));
  bottom.append(dom.hint);
  // The Science Room is offered when all five are done, and the player may
  // also choose to leave for it earlier.
  if (allDone) bottom.append(button(t('hub.science'), () => scenes.go('science'), 'primary small'));
  else top.append(button(t('hub.leave'), () => scenes.go('science'), 'small'));
  ui.append(top, field, bottom);
}

// Arrow keys: jump to the nearest machine in that direction.
function moveAim(dx, dy) {
  const from = aimed ? SPOTS[aimed] : ASTRO;
  let best = null, bestScore = Infinity;
  for (const id of MACHINE_IDS) {
    if (id === aimed) continue;
    const vx = SPOTS[id].x - from.x, vy = SPOTS[id].y - from.y;
    const along = vx * dx + vy * dy;
    if (along <= 1) continue;
    const score = (vx * vx + vy * vy) / along;      // near and well aligned wins
    if (score < bestScore) { bestScore = score; best = id; }
  }
  if (best) dom.buttons[best].focus({ preventScroll: true });
}

export default {
  // params.arriving: coming from the intro. params.justCompleted: a machine id to stamp.
  enter(params, ui) {
    leaving = false;
    setAim(null);
    arrive = params.arriving ? 0 : 0.75;
    if (params.justCompleted) pendingStamp = { id: params.justCompleted, at: time + 0.45 };
    buildUI(ui);
    if (params.arriving) {
      dom.hint.textContent = t('hub.arrive');
      setTimeout(() => { if (dom.hint.isConnected) dom.hint.textContent = t('hub.hint'); }, 4500);
    }
    if (params.focus && dom.buttons[params.focus]) dom.buttons[params.focus].focus({ preventScroll: true });
    drone(true);
    offInput = input.on((a) => {
      if (a.type === 'direction') moveAim(a.dx, a.dy);
      else if (a.type === 'back') { sfx('back'); scenes.go('title'); }
    });
  },

  exit() {
    offInput();
  },

  update(dt) {
    updateWorld(dt);
  },

  render() {
    renderWorld();
  },
};
