// The Archive (hub): the astronaut floats in zero gravity. Five ghost machines
// drift around her, and six smaller, dimmer "echoes" drift further out.
// Aim at a machine and select it to open its portal; aim at an echo to read
// its card.
//
// Machines and echoes are real DOM buttons placed over the canvas art, so they
// work with mouse, touch, keyboard and screen readers. "Aimed" means focused.

import { C } from '../data/palette.js';
import { SPRITES, ECHO_SPRITES } from '../data/sprites.js';
import { machines, echoes } from '../data/content.en.js';
import { t } from '../engine/i18n.js';
import { ctx, clear, px, drawSprite, bakeSprite, WIDTH, HEIGHT } from '../engine/render.js';
import { Starfield, Particles, shake, ease, lerp, clamp } from '../engine/fx.js';
import { el, button, interactive } from '../engine/ui.js';
import * as scenes from '../engine/scenes.js';
import * as input from '../engine/input.js';
import { sfx, drone } from '../engine/audio.js';
import { gameState, MACHINE_IDS, ECHO_IDS, completedCount, echoesRead, archiveComplete } from '../state.js';

// Where each machine and each echo floats (center, in game pixels).
export const SPOTS = {
  lrv: { x: 56, y: 52 },
  pioneer10: { x: 160, y: 34 },
  sojourner: { x: 264, y: 52 },
  opportunity: { x: 88, y: 122 },
  ingenuity: { x: 232, y: 122 },
};
const ECHO_SPOTS = {
  surveyor3: { x: 20, y: 92 },
  viking1: { x: 300, y: 92 },
  near: { x: 34, y: 150 },
  insight: { x: 286, y: 150 },
  spirit: { x: 134, y: 140 },
  dawn: { x: 186, y: 140 },
};
const ALL_IDS = [...MACHINE_IDS, ...ECHO_IDS];
const spotOf = (id) => SPOTS[id] ?? ECHO_SPOTS[id];
const ASTRO = { x: 160, y: 82 };      // astronaut center

// ---------- the world (shared with the portal scene, which draws on top of it) ----------
const stars = new Starfield(130, 23);
const dust = new Particles(50);
const sparks = new Particles(160);
const ghosts = {};                    // id -> { glow, phase, stamp }
ALL_IDS.forEach((id, i) => (ghosts[id] = { glow: 0, phase: i * 1.7, stamp: 0 }));
let time = 0;
let aimed = null;                     // id of the aimed machine or echo, or null
let facing = false;                   // astronaut looks left?
let arrive = 1;                       // 0..1 arrival animation
let pendingStamp = null;              // { id, at } stamp animation waiting to play

const still = () => gameState.settings.reducedMotion;
const bob = (phase, amount = 3) => (still() ? 0 : Math.sin(time * 0.8 + phase) * amount);

export function ghostPosition(id) {
  const s = spotOf(id);
  const sway = ECHO_SPOTS[id] ? 1.5 : 3;      // echoes drift a little less
  return { x: s.x + (still() ? 0 : Math.sin(time * 0.37 + ghosts[id].phase) * 2), y: s.y + bob(ghosts[id].phase, sway) };
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

  for (const id of ALL_IDS) {
    const g = ghosts[id];
    g.glow = lerp(g.glow, aimed === id ? 1 : 0, 1 - Math.exp(-10 * dt));
    g.stamp = Math.max(0, g.stamp - dt * 2);
    // Sparkles circle the aimed machine or echo.
    if (aimed === id && !still() && Math.random() < 0.5) {
      const a = Math.random() * Math.PI * 2, p = ghostPosition(id);
      const small = !!ECHO_SPOTS[id];
      sparks.spawn({
        x: p.x + Math.cos(a) * (small ? 10 : 19), y: p.y + Math.sin(a) * (small ? 8 : 13), vx: -Math.sin(a) * 9, vy: Math.cos(a) * 9 - 3,
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

// Four corner brackets around the aimed machine or echo.
function drawBrackets(x, y, w, h, glow, color) {
  const gap = Math.round(lerp(10, 2, ease.outBack(clamp(glow))) + (still() ? 0 : Math.sin(time * 5) * 0.8));
  const arm = w < 16 ? 3 : 5;
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

// `hide` skips one machine (the portal draws that one itself).
export function renderWorld(hide = null) {
  clear();
  stars.render();
  dust.render();

  // Echoes first: smaller and dimmer than the machines, further from the center.
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
  });

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
    if (g.glow > 0.03) drawBrackets(p.x, p.y + lift, img.width, img.height, g.glow, C.amber);
    if (done && !(pendingStamp && pendingStamp.id === id)) drawStamp(Math.round(p.x + img.width / 2), Math.round(y) - 1, g.stamp);
  }

  // Dotted aiming line from the astronaut to the aimed machine or echo.
  const ay = ASTRO.y + bob(0.5, 4) + (1 - ease.outCubic(arrive)) * -40;
  if (aimed) {
    const p = ghostPosition(aimed), g = ghosts[aimed];
    const dx = p.x - ASTRO.x, dy = p.y - ay, len = Math.hypot(dx, dy);
    const color = ECHO_SPOTS[aimed] ? C.ice : C.amber;
    for (let d = 12; d < len - (ECHO_SPOTS[aimed] ? 12 : 20); d += 4) {
      const march = still() ? 0 : (time * 14) % 4;
      const k = (d + march) / len;
      px(ASTRO.x + dx * k, ay + dy * k, color, 0.7 * g.glow);
    }
  }

  sparks.render();
  drawSprite(SPRITES.astronaut, ASTRO.x - 6, ay - 8, { flip: facing, alpha: ease.outCubic(arrive) });
}

export function setAim(id) {
  aimed = id;
  if (id) facing = spotOf(id).x < ASTRO.x;
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

function openEcho(id) {
  if (leaving) return;
  leaving = true;
  sfx('select');
  scenes.go('echo', { id });
}

// One invisible button over a machine or an echo, with a label that appears
// when it is aimed at. Things in the lower half show the label above.
function ghostButton(id, className, parts, onSelect) {
  const spot = spotOf(id);
  const b = el('button', `${className}${spot.y > HEIGHT / 2 ? ' above' : ''}`);
  b.type = 'button';
  b.style.left = `${(spot.x / WIDTH) * 100}%`;
  b.style.top = `${(spot.y / HEIGHT) * 100}%`;
  const label = el('span', 'ghost-label');
  // Labels near the left or right edge are shifted so they stay on screen.
  if (spot.x < 50) label.classList.add('edge-left');
  if (spot.x > WIDTH - 50) label.classList.add('edge-right');
  for (const [cls, text] of parts) if (text) label.append(el('span', cls, text));
  b.append(label);
  b.setAttribute('aria-label', parts.map(([, text]) => text).filter(Boolean).join(', '));
  interactive(b, () => onSelect(id), '');
  b.addEventListener('focus', () => setAim(id));
  b.addEventListener('blur', () => { if (aimed === id && !leaving) setAim(null); });
  b.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') b.blur(); });
  dom.buttons[id] = b;
  return b;
}

function buildUI(ui, celebrate) {
  const top = el('div', 'hub-top');
  const n = completedCount();
  const progress = el('p', 'hub-progress');
  progress.append(
    el('span', '', t('hub.progress', { n, total: MACHINE_IDS.length })),
    el('span', 'hub-echoes', t('hub.echoes', { n: echoesRead(), total: ECHO_IDS.length })),
  );
  top.append(progress);
  top.append(button(t('hub.title'), () => scenes.go('title'), 'small', 'back'));
  top.append(button(t('hub.wall'), () => scenes.go('wall'), 'small'));

  const field = el('div', 'hub-field');
  dom.buttons = {};
  for (const id of MACHINE_IDS) {
    const m = machines[id];
    field.append(ghostButton(id, 'ghost', [
      ['ghost-name', t(m.name)], ['ghost-years', t(m.years)], ['ghost-done', gameState.completed[id] ? t('hub.completed') : ''],
    ], enterPortal));
  }
  for (const id of ECHO_IDS) {
    const e = echoes[id];
    field.append(ghostButton(id, 'ghost echo', [
      ['ghost-kind', t('hub.echo')], ['ghost-name', t(e.name)], ['ghost-years', t(e.years)], ['ghost-done', gameState.echoes[id] ? t('hub.echoRead') : ''],
    ], openEcho));
  }

  const bottom = el('div', 'hub-bottom');
  const allDone = n === MACHINE_IDS.length;
  const complete = archiveComplete();
  dom.hint = el('p', 'hub-hint', t(complete ? 'hub.completeHint' : allDone ? 'hub.allDone' : 'hub.hint'));
  bottom.append(dom.hint);
  // The Science Room is offered when all five are done, and the player may
  // also choose to leave for it earlier.
  if (allDone) bottom.append(button(t('hub.science'), () => scenes.go('science'), 'primary small'));
  else top.append(button(t('hub.leave'), () => scenes.go('science'), 'small'));

  ui.append(top, field, bottom);

  // Everything archived and every echo read: the "Archive complete" stamp.
  if (complete) {
    const stamp = el('p', `archive-stamp${celebrate ? ' land' : ''}`, t('hub.complete'));
    ui.append(stamp);
    if (celebrate) {
      setTimeout(() => { if (stamp.isConnected) { sfx('stamp'); sfx('success'); shake.add(2); } }, still() ? 0 : 900);
    }
  }
}

// Arrow keys: jump to the nearest machine or echo in that direction.
function moveAim(dx, dy) {
  const from = aimed ? spotOf(aimed) : ASTRO;
  let best = null, bestScore = Infinity;
  for (const id of ALL_IDS) {
    if (id === aimed) continue;
    const vx = spotOf(id).x - from.x, vy = spotOf(id).y - from.y;
    const along = vx * dx + vy * dy;
    if (along <= 1) continue;
    const score = (vx * vx + vy * vy) / along;      // near and well aligned wins
    if (score < bestScore) { bestScore = score; best = id; }
  }
  if (best) dom.buttons[best].focus({ preventScroll: true });
}

export default {
  // params.arriving: coming from the intro. params.justCompleted: a machine id
  // to stamp. params.justRead: an echo that was just read. params.focus: what to aim at.
  enter(params, ui) {
    leaving = false;
    setAim(null);
    arrive = params.arriving ? 0 : 0.75;
    if (params.justCompleted) pendingStamp = { id: params.justCompleted, at: time + 0.45 };
    // The big stamp lands when the last machine or the last echo completes the Archive.
    buildUI(ui, !!(params.justCompleted || params.justRead));
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
