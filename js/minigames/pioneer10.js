// Pioneer 10 mini-game: "Power Budget".
//
// Teaching goal: a probe designed for 21 months kept working for more than 30
// years while its nuclear power source slowly decayed.
//
// How it plays: each round there is a power budget. Switch the transmitter and
// the instruments on or off so the power in use stays inside the budget, then
// let time pass. Instruments collect data, but the data only reaches Earth
// while the transmitter is on. Every round the budget is smaller.
// The ending is fixed: in the last round there is not enough power for the
// transmitter, whatever the player does.
//
// The dates, places and distances in the TEXT are real. Every number in this
// FILE marked GAME VALUE is gameplay only, and so are the names "Instrument 1..4".

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

// ---------- GAME VALUES (gameplay numbers, not mission data) ----------
// One round per real milestone. `year` and the message are real; `budget` is a GAME VALUE.
const ROUNDS = [
  { year: '1972', budget: 100, message: 'g.pio.r1' },
  { year: '1973', budget: 85, message: 'g.pio.r2' },
  { year: '1983', budget: 65, message: 'g.pio.r3' },
  { year: '1997', budget: 50, message: 'g.pio.r4' },
  { year: '2003', budget: 30, message: 'g.pio.r5', final: true },   // too little for the transmitter
];
const TRANSMITTER_COST = 40;                               // GAME VALUE
const INSTRUMENTS = [                                      // GAME VALUE: power cost and data per round
  { cost: 30, data: 4 },
  { cost: 25, data: 3 },
  { cost: 20, data: 3 },
  { cost: 15, data: 2 },
];
const ENDING_LINES = ['g.pio.end.1', 'g.pio.end.2', 'g.pio.end.3', 'g.pio.end.4', 'g.pio.end.5'];
const LINE_SECONDS = 4.5;                                  // reading time for each ending line

// Best possible data for a budget (transmitter on, every instrument combination), for the stars.
function bestData(budget) {
  let best = 0;
  for (let mask = 0; mask < 1 << INSTRUMENTS.length; mask++) {
    let cost = TRANSMITTER_COST, data = 0;
    INSTRUMENTS.forEach((ins, i) => { if (mask & (1 << i)) { cost += ins.cost; data += ins.data; } });
    if (cost <= budget) best = Math.max(best, data);
  }
  return best;
}
const BEST_TOTAL = ROUNDS.reduce((sum, r) => sum + (r.final ? 0 : bestData(r.budget)), 0);

// Where each system "lives" on the picture of the probe (sprite pixels): the
// transmitter is the dish, the instruments sit on the body and the booms.
const DISH = [13, 3];
const SPOTS = [[2, 8], [22, 9], [11, 8], [15, 8]];
const SCALE = 3;

export function create(_ctx, api) {
  const still = () => gameState.settings.reducedMotion;
  const shell = createShell(api, 'g.pio.title');

  // ---------- game state ----------
  let round = 0;
  let transmitter = true;
  let on = INSTRUMENTS.map(() => true);
  let sent = 0;                  // data that reached Earth
  let state = 'card';            // 'card' | 'idle' | 'pass' | 'ending' | 'done'
  let passT = 0, endTime = 0, endLine = 0;

  // ---------- visuals ----------
  let time = 0, warp = 0, dim = 0;
  const stars = new Starfield(140, 17);
  const sparks = new Particles(160);
  const img = bakeSprite(SPRITES.pioneer10);
  const shipX = Math.round((WIDTH - img.width * SCALE) / 2), shipY = 38;

  // ---------- DOM ----------
  const yearText = el('span', 'g-phase');
  const fill = el('div', 'meter-fill');
  const meter = el('div', 'meter');
  meter.append(fill);
  const powerText = el('span', 'g-label');
  shell.left.append(yearText, meter, powerText, el('span', 'g-note', t('game.values')));
  const dataText = el('span', 'g-sky');
  const statusText = el('span', 'g-income');
  shell.mid.append(dataText, statusText);

  const txButton = button('', () => {
    if (state !== 'idle' || ROUNDS[round].final) return;
    transmitter = !transmitter;
    sfx(transmitter ? 'select' : 'back');
    refresh();
  }, 'action toggle', '');
  const txNote = el('span', 'action-cost');
  txButton.append(txNote);
  shell.controls.append(txButton);
  const toggles = INSTRUMENTS.map((ins, i) => {
    const b = button('', () => {
      if (state !== 'idle') return;
      on[i] = !on[i];
      sfx(on[i] ? 'select' : 'back');
      refresh();
    }, 'action toggle', '');
    b.append(el('span', 'action-cost', `${t('g.pio.cost', { c: ins.cost })} · ${t('g.pio.gain', { d: ins.data })}`));
    shell.controls.append(b);
    return b;
  });
  const pass = button(t('g.pio.pass'), letTimePass, 'primary', '');
  shell.bottom.insertBefore(pass, shell.bottom.lastElementChild);
  shell.controls.classList.add('wrap');

  const used = () => (transmitter ? TRANSMITTER_COST : 0) + INSTRUMENTS.reduce((sum, ins, i) => sum + (on[i] ? ins.cost : 0), 0);

  function refresh() {
    const r = ROUNDS[Math.min(round, ROUNDS.length - 1)];
    const u = used(), over = u > r.budget;
    yearText.textContent = r.year;
    powerText.textContent = t('g.pio.power', { used: u, budget: r.budget });
    fill.style.width = `${clamp(u / r.budget) * 100}%`;
    fill.className = `meter-fill ${over ? 'low' : u > r.budget * 0.8 ? 'mid' : ''}`;
    dataText.textContent = t('g.pio.data', { n: sent });
    statusText.textContent = t(over ? 'g.pio.over' : transmitter ? 'g.pio.ok' : 'g.pio.silent');
    statusText.className = `g-income${over || !transmitter ? ' warn' : ''}`;

    const idle = state === 'idle';
    setLabel(txButton, `${t('g.pio.transmitter')}: ${t(transmitter ? 'g.pio.on' : 'g.pio.off')}`);
    txNote.textContent = r.final ? t('g.pio.noPower') : `${t('g.pio.cost', { c: TRANSMITTER_COST })} · ${t('g.pio.sends')}`;
    txButton.classList.toggle('is-on', transmitter);
    txButton.setAttribute('aria-pressed', String(transmitter));
    txButton.disabled = !idle || !!r.final;
    toggles.forEach((b, i) => {
      setLabel(b, `${t('g.pio.instrument', { n: i + 1 })}: ${t(on[i] ? 'g.pio.on' : 'g.pio.off')}`);
      b.classList.toggle('is-on', on[i]);
      b.setAttribute('aria-pressed', String(on[i]));
      b.disabled = !idle;
    });
    pass.disabled = !idle || over;
  }

  // GAME VALUE: stars compare the data you sent home with the best possible.
  const stars3 = () => (sent >= BEST_TOTAL * 0.9 ? 3 : sent >= BEST_TOTAL * 0.6 ? 2 : 1);

  function startRound(index) {
    round = index;
    state = 'idle';
    // In the last round the decayed power source cannot run the transmitter.
    if (ROUNDS[round].final) transmitter = false;
    refresh();
    shell.say(t(ROUNDS[round].message));
    if (index > 0) sfx(ROUNDS[round].final ? 'fail' : 'clock');
    const first = [txButton, ...toggles, pass].find((b) => !b.disabled);
    first?.focus({ preventScroll: true });
  }

  function letTimePass() {
    if (state !== 'idle' || used() > ROUNDS[round].budget) return;
    state = 'pass';
    passT = 0;
    if (transmitter) INSTRUMENTS.forEach((ins, i) => { if (on[i]) sent += ins.data; });
    sfx('whoosh');
    refresh();
  }

  // The fixed ending: the last signal, told in five lines.
  function startEnding() {
    state = 'ending';
    endTime = 0;
    endLine = 1;
    on = on.map(() => false);
    refresh();
    pass.hidden = true;
    shell.controls.hidden = true;
    shell.bottom.classList.add('ending');
    sfx('lastSignal');
    drone(false);
    shell.say(t(ENDING_LINES[0]));
  }

  const offInput = input.on((a) => {
    if (a.type === 'direction' && state === 'idle' && !shell.cardOpen()) arrowNav(shell.bottom, a.dx > 0 || a.dy > 0 ? 'ArrowDown' : 'ArrowUp');
  });

  // ---------- start ----------
  refresh();
  drone(true);
  shell.openCard(t('g.pio.card.title'), [t('g.pio.card.text'), t('g.pio.card.how')], () => startRound(0));

  return {
    update(dt) {
      time += dt;
      // While time passes the stars rush by; otherwise they drift slowly.
      warp = state === 'pass' && !still() ? Math.sin(clamp(passT) * Math.PI) : 0;
      stars.update(dt, 3 + warp * 260);
      // The picture gets darker as the power decays.
      const target = state === 'ending' || state === 'done' ? 0.6 : round * 0.09;
      dim += (target - dim) * Math.min(1, dt * 1.5);

      if (state === 'pass') {
        passT += dt / (still() ? 0.3 : 1.4);
        if (passT >= 1) {
          if (ROUNDS[round].final) startEnding();
          else startRound(round + 1);
        }
      } else if (state === 'ending') {
        endTime += dt;
        if (endLine < ENDING_LINES.length && endTime > endLine * LINE_SECONDS) {
          shell.say(t(ENDING_LINES[endLine]));
          endLine++;
        } else if (endLine === ENDING_LINES.length && endTime > endLine * LINE_SECONDS - 2) {
          state = 'done';
          shell.showDone(() => api.finish({ stars: stars3() }));
        }
      }

      if (!still() && state !== 'ending' && state !== 'done') {
        // Instruments that are on give off small sparks of "data".
        INSTRUMENTS.forEach((ins, i) => {
          if (!on[i] || Math.random() > 0.07 + warp * 0.3) return;
          const [sx, sy] = SPOTS[i];
          sparks.spawn({
            x: shipX + sx * SCALE + 1, y: shipY + sy * SCALE + 1, vx: (Math.random() - 0.5) * 14, vy: -(6 + Math.random() * 14),
            life: 0.6 + Math.random() * 0.5, color: Math.random() < 0.7 ? C.ice : C.star,
          });
        });
        // The transmitter sends a stream of signal toward Earth (off to the left).
        if (transmitter && Math.random() < 0.25 + warp * 0.5) {
          sparks.spawn({
            x: shipX + DISH[0] * SCALE, y: shipY + DISH[1] * SCALE + (Math.random() - 0.5) * 6, vx: -(70 + Math.random() * 40), vy: (Math.random() - 0.5) * 6,
            life: 1.6, color: Math.random() < 0.6 ? C.amber : C.star, alpha: 0.8,
          });
        }
      }
      sparks.update(dt);
    },

    render() {
      clear();
      stars.render();
      const bob = still() ? 0 : Math.sin(time * 0.7) * 3;
      drawSprite(SPRITES.pioneer10, shipX, shipY + bob, { scale: SCALE });
      // Lights: amber on the dish for the transmitter, ice for each instrument.
      const light = (sx, sy, lit, color, i) => {
        const x = shipX + sx * SCALE, y = shipY + sy * SCALE + bob;
        const pulse = still() ? 1 : 0.6 + 0.4 * Math.sin(time * 4 + i);
        px(x, y, lit ? color : C.night, lit ? pulse : 1, 3, 3);
        px(x - 1, y - 1, lit ? color : C.indigo, lit ? 0.35 * pulse : 0.6, 5, 5);
      };
      light(DISH[0], DISH[1], transmitter, C.amber, 9);
      INSTRUMENTS.forEach((ins, i) => light(SPOTS[i][0], SPOTS[i][1], on[i], C.ice, i));
      sparks.render();
      if (dim > 0.01) px(0, 0, C.void, ease.inOutSine(clamp(dim)), WIDTH, 180);
    },

    destroy() {
      offInput();
    },
  };
}
