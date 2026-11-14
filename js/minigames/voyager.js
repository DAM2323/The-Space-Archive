// Voyager mini-game: "Power Budget".
//
// How it plays: each round there is a power budget. Switch instruments on or
// off so the power in use stays inside the budget, then let time pass.
// Instruments that are on collect data. Every round the budget is smaller.
//
// IMPORTANT: the content pack has no verified Voyager facts yet, so this
// level states none. Every number and every name here is a GAME VALUE:
// budgets, costs, data, rounds and "Instrument 1..5" are not mission data.

import { C } from '../data/palette.js';
import { SPRITES } from '../data/sprites.js';
import { t } from '../engine/i18n.js';
import { px, clear, drawSprite, bakeSprite, WIDTH } from '../engine/render.js';
import { Starfield, Particles, ease, clamp } from '../engine/fx.js';
import { el, button, setLabel, arrowNav } from '../engine/ui.js';
import * as input from '../engine/input.js';
import { sfx, drone } from '../engine/audio.js';
import { gameState } from '../state.js';
import { createShell } from './common.js';

// ---------- GAME VALUES (all of them: nothing here is mission data) ----------
const BUDGETS = [100, 80, 60, 40, 20];                     // GAME VALUE: power budget of each round
const INSTRUMENTS = [                                      // GAME VALUE: power cost and data per round
  { cost: 35, data: 4 },
  { cost: 25, data: 3 },
  { cost: 20, data: 3 },
  { cost: 15, data: 2 },
  { cost: 10, data: 1 },
];

// Best possible data for a budget (tries every on/off combination), for the stars.
function bestData(budget) {
  let best = 0;
  for (let mask = 0; mask < 1 << INSTRUMENTS.length; mask++) {
    let cost = 0, data = 0;
    INSTRUMENTS.forEach((ins, i) => { if (mask & (1 << i)) { cost += ins.cost; data += ins.data; } });
    if (cost <= budget) best = Math.max(best, data);
  }
  return best;
}
const BEST_TOTAL = BUDGETS.reduce((sum, b) => sum + bestData(b), 0);

// Where each instrument "lives" on the picture of the machine (sprite pixels).
const SPOTS = [[13, 3], [2, 8], [22, 9], [10, 8], [15, 8]];
const SCALE = 3;

export function create(_ctx, api) {
  const still = () => gameState.settings.reducedMotion;
  const shell = createShell(api, 'g.voy.title');

  // ---------- game state ----------
  let round = 0;
  let on = INSTRUMENTS.map(() => true);
  let data = 0;
  let state = 'card';            // 'card' | 'idle' | 'pass' | 'done'
  let passT = 0;

  // ---------- visuals ----------
  let time = 0, warp = 0, dim = 0;
  const stars = new Starfield(140, 17);
  const sparks = new Particles(120);
  const img = bakeSprite(SPRITES.voyager);
  const shipX = Math.round((WIDTH - img.width * SCALE) / 2), shipY = 38;

  // ---------- DOM ----------
  const roundText = el('span', 'g-phase');
  const fill = el('div', 'meter-fill');
  const meter = el('div', 'meter');
  meter.append(fill);
  const powerText = el('span', 'g-label');
  shell.left.append(roundText, meter, powerText, el('span', 'g-note', t('game.values')));
  const dataText = el('span', 'g-sky');
  shell.mid.append(dataText);

  const toggles = INSTRUMENTS.map((ins, i) => {
    const b = button('', () => {
      if (state !== 'idle') return;
      on[i] = !on[i];
      sfx(on[i] ? 'select' : 'back');
      refresh();
    }, 'action toggle', '');
    b.append(el('span', 'action-cost', `${t('g.voy.cost', { c: ins.cost })} · ${t('g.voy.gain', { d: ins.data })}`));
    shell.controls.append(b);
    return b;
  });
  const pass = button(t('g.voy.pass'), letTimePass, 'primary', '');
  shell.bottom.insertBefore(pass, shell.bottom.lastElementChild);
  shell.controls.classList.add('wrap');

  const used = () => INSTRUMENTS.reduce((sum, ins, i) => sum + (on[i] ? ins.cost : 0), 0);

  function refresh() {
    const budget = BUDGETS[Math.min(round, BUDGETS.length - 1)];
    const u = used(), over = u > budget;
    roundText.textContent = t('g.voy.round', { n: Math.min(round + 1, BUDGETS.length), total: BUDGETS.length });
    powerText.textContent = t('g.voy.power', { used: u, budget });
    fill.style.width = `${clamp(u / budget) * 100}%`;
    fill.className = `meter-fill ${over ? 'low' : u > budget * 0.8 ? 'mid' : ''}`;
    dataText.textContent = t('g.voy.data', { n: data });
    toggles.forEach((b, i) => {
      setLabel(b, `${t('g.voy.instrument', { n: i + 1 })}: ${t(on[i] ? 'g.voy.on' : 'g.voy.off')}`);
      b.classList.toggle('is-on', on[i]);
      b.setAttribute('aria-pressed', String(on[i]));
      b.disabled = state !== 'idle';
    });
    pass.disabled = state !== 'idle' || over;
    if (state === 'idle') shell.msg.textContent = t(over ? 'g.voy.over' : 'g.voy.ready');
  }

  // GAME VALUE: stars compare your data with the best possible.
  const stars3 = () => (data >= BEST_TOTAL * 0.9 ? 3 : data >= BEST_TOTAL * 0.6 ? 2 : 1);

  function letTimePass() {
    if (state !== 'idle' || used() > BUDGETS[round]) return;
    state = 'pass';
    passT = 0;
    INSTRUMENTS.forEach((ins, i) => { if (on[i]) data += ins.data; });
    sfx('whoosh');
    refresh();
  }

  function nextRound() {
    round++;
    if (round >= BUDGETS.length) {
      state = 'done';
      on = on.map(() => false);
      refresh();
      pass.hidden = true;
      shell.say(t('g.voy.end'));
      return shell.showDone(() => api.finish({ stars: stars3() }));
    }
    state = 'idle';
    sfx('fail');
    refresh();
    shell.say(t(used() > BUDGETS[round] ? 'g.voy.over' : 'g.voy.less'));
    (toggles.find((b, i) => on[i]) ?? pass).focus({ preventScroll: true });
  }

  const offInput = input.on((a) => {
    if (a.type === 'direction' && state === 'idle' && !shell.cardOpen()) arrowNav(shell.bottom, a.dx > 0 || a.dy > 0 ? 'ArrowDown' : 'ArrowUp');
  });

  // ---------- start ----------
  refresh();
  drone(true);
  shell.openCard(t('g.voy.card.title'), [t('g.voy.card.text'), t('g.voy.card.how')], () => {
    state = 'idle';
    refresh();
    toggles[0].focus({ preventScroll: true });
  });

  return {
    update(dt) {
      time += dt;
      // While time passes the stars rush by; otherwise they drift slowly.
      warp = state === 'pass' && !still() ? Math.sin(clamp(passT) * Math.PI) : 0;
      stars.update(dt, 3 + warp * 260);
      // The picture gets darker as the budget shrinks.
      dim += ((state === 'done' ? 0.55 : round * 0.09) - dim) * Math.min(1, dt * 2);

      if (state === 'pass') {
        passT += dt / (still() ? 0.3 : 1.4);
        if (passT >= 1) nextRound();
      }
      // Instruments that are on glow and give off small sparks of "data".
      if (!still() && state !== 'done') {
        INSTRUMENTS.forEach((ins, i) => {
          if (!on[i] || Math.random() > 0.08 + warp * 0.3) return;
          const [sx, sy] = SPOTS[i];
          sparks.spawn({
            x: shipX + sx * SCALE + 1, y: shipY + sy * SCALE + 1, vx: (Math.random() - 0.5) * 14, vy: -(6 + Math.random() * 14),
            life: 0.6 + Math.random() * 0.5, color: Math.random() < 0.7 ? C.ice : C.star,
          });
        });
      }
      sparks.update(dt);
    },

    render() {
      clear();
      stars.render();
      const bob = still() ? 0 : Math.sin(time * 0.7) * 3;
      drawSprite(SPRITES.voyager, shipX, shipY + bob, { scale: SCALE });
      INSTRUMENTS.forEach((ins, i) => {
        const [sx, sy] = SPOTS[i];
        const x = shipX + sx * SCALE, y = shipY + sy * SCALE + bob;
        const pulse = still() ? 1 : 0.6 + 0.4 * Math.sin(time * 4 + i);
        px(x, y, on[i] ? C.ice : C.night, on[i] ? pulse : 1, 3, 3);
        px(x - 1, y - 1, on[i] ? C.ice : C.indigo, on[i] ? 0.35 * pulse : 0.6, 5, 5);
      });
      sparks.render();
      if (dim > 0.01) px(0, 0, C.void, ease.inOutSine(clamp(dim)), WIDTH, 180);
    },

    destroy() {
      offInput();
    },
  };
}
