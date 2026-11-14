// Sojourner mini-game: "Slow and Steady".
//
// Teaching goal: a tiny rover, working step by step around the rocks near its
// lander, did far more than its plan.
//
// How it plays: a map seen from above. Move the rover one square at a time
// (arrow keys, the on-screen arrows, or tap a square next to it). Rocks block
// the way. Each sol you only have a few moves; when they are used up a new sol
// begins. Reach the three targets to analyze them. Fewer sols = more stars.
//
// The map, the number of moves, the sol counter and the stars are GAME VALUES.

import { C } from '../data/palette.js';
import { SPRITES } from '../data/sprites.js';
import { t } from '../engine/i18n.js';
import { ctx as screen, px, clear, drawSprite, WIDTH, HEIGHT } from '../engine/render.js';
import { Particles, shake, ease, lerp, clamp } from '../engine/fx.js';
import { el, button } from '../engine/ui.js';
import * as input from '../engine/input.js';
import { sfx, drone } from '../engine/audio.js';
import { gameState } from '../state.js';
import { createShell } from './common.js';

// ---------- GAME VALUES (gameplay numbers, not mission data) ----------
const MOVES_PER_SOL = 6;       // GAME VALUE
const STAR_SOLS = [3, 5];      // GAME VALUE: 3 stars within 3 sols, 2 stars within 5
// GAME VALUE: the map. L lander, R rover start, # rock, 1-3 targets, . open ground.
const MAP = [
  '..#...2..#.',
  '....#.#....',
  'LR.#....#.3',
  '.....#.#...',
  '.#.1.....#.',
];

// ---------- layout (game pixels) ----------
const CELL = 21;
const COLS = MAP[0].length, ROWS = MAP.length;
const X0 = Math.round((WIDTH - COLS * CELL) / 2);
const Y0 = 34;
const MOVE_TIME = 0.32;        // seconds for one step: slow and steady

// Turn the right-facing rover sprite into the other three directions.
const transpose = (map) => [...map[0]].map((_, x) => map.map((row) => row[x]).join(''));
const ROVER = { right: SPRITES.sojournerTop, down: transpose(SPRITES.sojournerTop) };

export function create(_ctx, api) {
  const still = () => gameState.settings.reducedMotion;
  const shell = createShell(api, 'g.soj.title');

  // ---------- game state ----------
  const rocks = new Set();
  const targets = {};            // "x,y" -> { n, done }
  let lander = { x: 0, y: 0 };
  let rover = { x: 0, y: 0 };
  MAP.forEach((row, y) => [...row].forEach((ch, x) => {
    if (ch === '#') rocks.add(`${x},${y}`);
    else if (ch === 'L') lander = { x, y };
    else if (ch === 'R') rover = { x, y };
    else if (ch !== '.') targets[`${x},${y}`] = { n: Number(ch), done: false };
  }));
  const totalTargets = Object.keys(targets).length;
  let sol = 1, moves = MOVES_PER_SOL, analyzed = 0;
  let state = 'card';            // 'card' | 'idle' | 'move' | 'night' | 'done'

  // ---------- visuals ----------
  let time = 0;
  let from = { ...rover }, moveT = 1;       // tween between squares
  let facing = 'right', flip = false;
  let bumpT = 0, bumpDir = { x: 0, y: 0 };
  let night = 0, nightT = 0;                // sol change: the screen dims and brightens again
  const tracks = [];                        // wheel tracks left behind
  const puffs = new Particles(100);

  // ---------- DOM ----------
  const solText = el('span', 'g-phase');
  const movesRow = el('div', 'g-row');
  const pips = el('div', 'dots');
  movesRow.append(el('span', 'g-label', t('g.soj.moves')), pips);
  shell.left.append(solText, movesRow, el('span', 'g-note', t('game.values')));
  const targetText = el('span', 'g-sky');
  shell.mid.append(el('span', 'g-phase', t('g.soj.p1.title')), targetText);
  // On-screen arrows, for touch and for players who prefer buttons.
  const DIRS = { left: [-1, 0], up: [0, -1], down: [0, 1], right: [1, 0] };
  const ARROWS = { left: '◀', up: '▲', down: '▼', right: '▶' };
  const pad = {};
  for (const name in DIRS) {
    const b = button(ARROWS[name], () => tryMove(...DIRS[name]), 'action arrow', '');
    b.setAttribute('aria-label', t(`g.soj.${name}`));
    pad[name] = b;
    shell.controls.append(b);
  }

  function refresh() {
    solText.textContent = t('g.soj.sol', { n: sol });
    pips.replaceChildren(...Array.from({ length: MOVES_PER_SOL }, (_, i) => el('span', i < moves ? 'dot on' : 'dot')));
    pips.setAttribute('aria-label', `${t('g.soj.moves')}: ${moves}`);
    targetText.textContent = t('g.soj.targets', { n: analyzed, total: totalTargets });
    for (const name in pad) pad[name].disabled = state !== 'idle';
  }

  const free = (x, y) => x >= 0 && y >= 0 && x < COLS && y < ROWS && !rocks.has(`${x},${y}`) && !(x === lander.x && y === lander.y);
  const center = (c) => ({ x: X0 + c.x * CELL + CELL / 2, y: Y0 + c.y * CELL + CELL / 2 });

  // GAME VALUE: stars from the number of sols used.
  const stars = () => (sol <= STAR_SOLS[0] ? 3 : sol <= STAR_SOLS[1] ? 2 : 1);

  function tryMove(dx, dy) {
    if (state !== 'idle') return;
    if (dx) { facing = 'right'; flip = dx < 0; } else { facing = 'down'; flip = dy < 0; }
    const x = rover.x + dx, y = rover.y + dy;
    if (!free(x, y)) {
      // Blocked: a small bump, and the move is not used up.
      bumpT = 1;
      bumpDir = { x: dx, y: dy };
      sfx('bump');
      if (!still()) shake.add(0.6);
      if (rocks.has(`${x},${y}`)) shell.say(t('g.soj.blocked'));
      return;
    }
    from = { ...rover };
    rover = { x, y };
    moveT = still() ? 0.999 : 0;
    moves--;
    state = 'move';
    sfx('step');
    refresh();
  }

  function arrived() {
    const c = center(rover);
    tracks.push({ x: c.x, y: c.y });
    let message = null;
    const target = targets[`${rover.x},${rover.y}`];
    if (target && !target.done) {
      target.done = true;
      analyzed++;
      message = t(`g.soj.t${analyzed}`);       // facts are told in a fixed order, whichever target comes first
      sfx('success');
      for (let i = 0; i < 20; i++) {
        const a = Math.random() * Math.PI * 2, v = 14 + Math.random() * 30;
        puffs.spawn({ x: c.x, y: c.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, drag: 3, life: 0.5 + Math.random() * 0.5, color: Math.random() < 0.6 ? C.ice : C.star });
      }
    }
    if (analyzed >= totalTargets) {
      state = 'done';
      refresh();
      shell.say(t('g.soj.end'));
      return shell.showDone(() => api.finish({ stars: stars() }));
    }
    if (moves <= 0) {
      // Out of moves: the sol ends and a new one begins.
      state = 'night';
      nightT = 0;
      refresh();
      if (!message) shell.say(t('g.soj.newSol'));
      else shell.say(`${message} ${t('g.soj.newSol')}`);
      return;
    }
    state = 'idle';
    if (message) shell.say(message);
    refresh();
    refocus();
  }

  let lastPad = 'right';
  for (const name in pad) pad[name].addEventListener('focus', () => (lastPad = name));
  const refocus = () => { if (document.activeElement === document.body || document.activeElement?.disabled) pad[lastPad].focus({ preventScroll: true }); };

  function begin() {
    state = 'idle';
    shell.say(t('g.soj.ready'));
    refresh();
    pad.right.focus({ preventScroll: true });
  }

  // Keyboard arrows move the rover; a tap on a square next to it does too.
  const offInput = input.on((a) => {
    if (shell.cardOpen()) return;
    if (a.type === 'direction') tryMove(a.dx, a.dy);
    else if (a.type === 'confirm' && a.fromPointer) {
      const c = center(rover);
      const dx = a.x - c.x, dy = a.y - c.y;
      if (a.y < Y0 || a.y > Y0 + ROWS * CELL || Math.max(Math.abs(dx), Math.abs(dy)) < CELL / 2) return;
      if (Math.abs(dx) > Math.abs(dy)) tryMove(Math.sign(dx), 0);
      else tryMove(0, Math.sign(dy));
    }
  });

  // ---------- drawing ----------
  // The ground is drawn once into its own canvas (it never changes).
  const ground = document.createElement('canvas');
  ground.width = WIDTH;
  ground.height = HEIGHT;
  {
    const g = ground.getContext('2d');
    g.fillStyle = C.dust;
    g.fillRect(0, 0, WIDTH, HEIGHT);
    let s = 77;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 700; i++) {
      g.globalAlpha = 0.25 + rnd() * 0.35;
      g.fillStyle = rnd() < 0.8 ? C.rust : C.star;
      g.fillRect(Math.floor(rnd() * WIDTH), Math.floor(rnd() * HEIGHT), 1 + (rnd() < 0.3), 1);
    }
    // Square corners, so the grid is readable without heavy lines.
    g.globalAlpha = 0.45;
    g.fillStyle = C.rust;
    for (let y = 0; y <= ROWS; y++) for (let x = 0; x <= COLS; x++) {
      g.fillRect(X0 + x * CELL - 1, Y0 + y * CELL, 3, 1);
      g.fillRect(X0 + x * CELL, Y0 + y * CELL - 1, 1, 3);
    }
    // Rocks: each one a slightly different blob with a shadow and a highlight.
    g.globalAlpha = 1;
    for (const key of rocks) {
      const [cx, cy] = key.split(',').map(Number);
      const x = X0 + cx * CELL, y = Y0 + cy * CELL;
      const w = 12 + Math.floor(rnd() * 5), h = 9 + Math.floor(rnd() * 4);
      const ox = Math.floor((CELL - w) / 2), oy = Math.floor((CELL - h) / 2);
      g.fillStyle = C.void;
      g.globalAlpha = 0.3;
      g.fillRect(x + ox + 2, y + oy + h - 1, w, 3);
      g.globalAlpha = 1;
      g.fillStyle = C.rust;
      g.fillRect(x + ox + 2, y + oy, w - 4, h);
      g.fillRect(x + ox, y + oy + 2, w, h - 4);
      g.fillRect(x + ox + 1, y + oy + 1, w - 2, h - 2);
      g.fillStyle = C.ember;
      g.fillRect(x + ox + 3, y + oy + 1, Math.floor(w / 2), 1);
      g.fillRect(x + ox + 2, y + oy + 2, 2, 2);
      g.fillStyle = C.void;
      g.globalAlpha = 0.35;
      g.fillRect(x + ox + 2, y + oy + h - 3, w - 4, 2);
      g.globalAlpha = 1;
    }
  }

  // The lander: an original top-down drawing (a body, three petals and a ramp).
  function drawLander() {
    const c = center(lander);
    const x = Math.round(c.x), y = Math.round(c.y);
    px(x - 10, y - 3, C.indigo, 1, 6, 7);                // left petal
    px(x - 3, y - 10, C.indigo, 1, 7, 6);                // top petal
    px(x - 3, y + 5, C.indigo, 1, 7, 6);                 // bottom petal
    px(x - 9, y - 2, C.ice, 0.7, 4, 5);
    px(x - 2, y - 9, C.ice, 0.7, 5, 4);
    px(x - 2, y + 6, C.ice, 0.7, 5, 4);
    px(x - 4, y - 4, C.mist, 1, 9, 9);                   // body
    px(x - 2, y - 2, C.star, 1, 5, 5);
    px(x, y, C.amber, 1, 1, 1);
    px(x + 5, y - 1, C.gray, 1, 6, 3);                   // ramp toward the rover's start
    px(x, y - 14, C.star, 1, 1, 5);                      // mast
  }

  function drawTargets() {
    for (const key in targets) {
      const [cx, cy] = key.split(',').map(Number);
      const c = center({ x: cx, y: cy }), tg = targets[key];
      px(c.x - 5, c.y - 3, C.mist, 1, 10, 7);
      px(c.x - 4, c.y - 4, C.mist, 1, 8, 9);
      px(c.x - 3, c.y - 3, C.star, 1, 3, 2);
      px(c.x + 1, c.y + 1, C.violet, 0.6, 3, 3);
      if (tg.done) {
        [[-3, 0], [-2, 1], [-1, 2], [0, 1], [1, 0], [2, -1], [3, -2]].forEach(([dx, dy]) => px(c.x + dx, c.y + dy - 9, C.green, 1, 1, 2));
      } else {
        // A pulsing marker shows where to go.
        const k = still() ? 0.5 : 0.5 + 0.5 * Math.sin(time * 4);
        const r = 8 + Math.round(k * 2);
        for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
          px(c.x + sx * r - (sx > 0 ? 2 : 0), c.y + sy * r, C.ice, 0.6 + 0.4 * k, 3, 1);
          px(c.x + sx * r, c.y + sy * r - (sy > 0 ? 2 : 0), C.ice, 0.6 + 0.4 * k, 1, 3);
        }
      }
    }
  }

  function drawRover() {
    const a = center(from), b = center(rover);
    const k = ease.inOutSine(clamp(moveT));
    let x = lerp(a.x, b.x, k), y = lerp(a.y, b.y, k);
    const nudge = Math.sin(clamp(bumpT) * Math.PI) * 3;                  // bump against a rock
    x += bumpDir.x * nudge;
    y += bumpDir.y * nudge;
    const map = ROVER[facing];
    const w = map[0].length, h = map.length;
    px(x - w / 2 + 1, y - h / 2 + 2, C.void, 0.3, w, h);                 // shadow
    if (facing === 'right') drawSprite(map, x - w / 2, y - h / 2, { flip });
    else {
      // Facing up or down: draw the turned sprite, upside down when going up.
      screen.save();
      screen.translate(Math.round(x), Math.round(y));
      if (flip) screen.scale(1, -1);
      drawSprite(map, -w / 2, -h / 2);
      screen.restore();
    }
    // Squares the rover can move to.
    if (state === 'idle') {
      for (const [dx, dy] of Object.values(DIRS)) {
        if (!free(rover.x + dx, rover.y + dy)) continue;
        const c = center({ x: rover.x + dx, y: rover.y + dy });
        const pulse = still() ? 0.6 : 0.45 + 0.25 * Math.sin(time * 5);
        px(c.x - 1, c.y - 1, C.amber, pulse, 3, 3);
      }
    }
  }

  // ---------- start ----------
  refresh();
  drone(true);
  shell.openCard(t('g.soj.p1.title'), [t('g.soj.p1.text'), t('g.soj.p1.how', { n: MOVES_PER_SOL })], begin);

  return {
    update(dt) {
      time += dt;
      bumpT = Math.max(0, bumpT - dt * 4);
      if (state === 'move') {
        moveT += dt / MOVE_TIME;
        if (!still() && Math.random() < 0.5) {
          const a = center(from), b = center(rover), k = clamp(moveT);
          puffs.spawn({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) + 3, vx: (Math.random() - 0.5) * 12, vy: -Math.random() * 8, life: 0.4 + Math.random() * 0.3, color: C.rust, alpha: 0.6 });
        }
        if (moveT >= 1) { moveT = 1; arrived(); }
      } else if (state === 'night') {
        // About 1.6 s: dim to night, change the sol number, brighten again.
        nightT += dt / (still() ? 0.4 : 1.6);
        night = Math.sin(clamp(nightT) * Math.PI);
        if (nightT >= 0.5 && moves <= 0) {
          sol++;
          moves = MOVES_PER_SOL;
          sfx('select');
          refresh();
        }
        if (nightT >= 1) {
          night = 0;
          state = 'idle';
          refresh();
          refocus();
        }
      }
      puffs.update(dt);
    },

    render() {
      clear();
      screen.drawImage(ground, 0, 0);
      for (const tr of tracks) { px(tr.x - 4, tr.y - 4, C.rust, 0.35, 2, 2); px(tr.x + 3, tr.y + 3, C.rust, 0.35, 2, 2); }
      drawLander();
      drawTargets();
      puffs.render();
      drawRover();
      if (night > 0) {
        screen.globalAlpha = night * 0.7;
        screen.fillStyle = C.deep;
        screen.fillRect(0, 0, WIDTH, HEIGHT);
        screen.globalAlpha = 1;
      }
    },

    destroy() {
      offInput();
    },
  };
}
