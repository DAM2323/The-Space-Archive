// Lunar Roving Vehicle mini-game: "Moon Drive".
//
// Teaching goal: the LRV let astronauts travel far from the lunar module.
//
// How it plays: one button. Hold it to drive, release to slow down. There are
// three drives, one for each Apollo 15 EVA. Stop next to each flag, and slow
// down before craters. Then a card tells the Apollo 17 distance record.
// The fender repair puzzle (four maps) is ready, but it only appears once its
// fact has a citation in data/sources.js (it is tagged [E] in the content pack).
//
// The EVA distances in km are real. Everything marked GAME VALUE is gameplay only.

import { C } from '../data/palette.js';
import { SPRITES } from '../data/sprites.js';
import { SOURCES } from '../data/sources.js';
import { t } from '../engine/i18n.js';
import { ctx, px, clear, drawSprite, WIDTH } from '../engine/render.js';
import { Starfield, Particles, shake, clamp } from '../engine/fx.js';
import { el, button } from '../engine/ui.js';
import { sfx, rotor, drone } from '../engine/audio.js';
import { gameState } from '../state.js';
import { createShell, createHold } from './common.js';

// ---------- GAME VALUES (gameplay numbers, not mission data) ----------
const KM_PX = 120;             // GAME VALUE: screen pixels for one kilometer of track
const MAX_SPEED = 95;          // GAME VALUE: pixels per second
const ACCEL = 62;              // GAME VALUE
const BRAKE = 85;              // GAME VALUE: slowing down when the button is released
const CRATER_SPEED = 56;       // GAME VALUE: faster than this over a crater gives a jolt
const FLAG_ZONE = 20;          // GAME VALUE: stop within this many pixels of a flag
// One drive per Apollo 15 EVA. `km` is real; flags and craters (as fractions of
// the track) are GAME VALUES.
const EVAS = [
  { km: 10.3, flags: [0.38, 0.82], craters: [0.2, 0.6] },
  { km: 12.5, flags: [0.28, 0.6, 0.9], craters: [0.14, 0.44, 0.76] },
  { km: 5.1, flags: [0.62], craters: [0.3, 0.86] },
];
const TOTAL_FLAGS = EVAS.reduce((n, e) => n + e.flags.length, 0);

// ---------- layout (game pixels) ----------
const GROUND = 100;            // y of the horizon
const FOOT = 122;              // y where the wheels touch the ground
const ROVER_X = 70;            // left edge of the rover on screen
const ROVER_MID = ROVER_X + 26;

const hill = (x, seed) => Math.sin(x * 0.02 + seed) * 7 + Math.sin(x * 0.07 + seed * 2) * 3 + Math.sin(x * 0.009 + seed) * 6;

export function create(_ctx, api) {
  const still = () => gameState.settings.reducedMotion;
  const shell = createShell(api, 'g.lrv.title');

  // ---------- game state ----------
  let evaIndex = 0, eva = null;
  let length = 0;                // track length of this drive, in pixels
  let x = 0, speed = 0;          // position along the track and speed
  let flags = [], craters = [];  // [{ x, state }] and [{ x, passed }]
  let collected = 0, jolts = 0;
  let warned = false;
  let state = 'card';            // 'card' | 'drive' | 'pause' | 'repair' | 'done'
  let pauseTime = 0, afterPause = null;

  // ---------- visuals ----------
  let time = 0, hop = 0;
  const stars = new Starfield(110, 9);
  const dust = new Particles(160);

  // ---------- DOM ----------
  const evaText = el('span', 'g-phase');
  const fill = el('div', 'meter-fill');
  const meter = el('div', 'meter');
  meter.append(fill);
  shell.left.append(evaText, meter, el('span', 'g-note', t('game.values')));
  const flagText = el('span', 'g-sky');
  shell.mid.append(flagText);
  const hold = button(t('g.lrv.hold'), () => {}, 'action hold', '');
  shell.controls.append(hold);
  const control = createHold(hold, () => !shell.cardOpen() && state === 'drive');

  function refresh() {
    evaText.textContent = t('g.lrv.eva', { n: evaIndex + 1, km: eva.km });
    flagText.textContent = t('g.lrv.flags', { n: collected, total: TOTAL_FLAGS });
    fill.style.width = `${clamp(x / length) * 100}%`;
  }

  // GAME VALUE: stars from flags reached and crater jolts.
  const stars3 = () => (collected >= TOTAL_FLAGS - 1 && jolts <= 2 ? 3 : collected >= 3 ? 2 : 1);

  function pauseThen(seconds, then) {
    state = 'pause';
    control.release();
    pauseTime = seconds;
    afterPause = then;
  }

  function startEva(index) {
    evaIndex = index;
    eva = EVAS[index];
    length = eva.km * KM_PX;
    x = 0;
    speed = 0;
    warned = false;
    flags = eva.flags.map((f) => ({ x: f * length, state: 'ahead' }));
    craters = eva.craters.map((f) => ({ x: f * length, passed: false }));
    refresh();
    const lines = [t(`g.lrv.eva${index + 1}.text`)];
    if (index === 0) lines.push(t('g.lrv.how'));
    shell.openCard(t('g.lrv.eva.title', { n: index + 1 }), lines, () => {
      state = 'drive';
      shell.say(t('g.lrv.ready'));
      hold.focus({ preventScroll: true });
    });
    state = 'card';
  }

  function evaDone() {
    speed = 0;
    sfx('success');
    shell.say(t('g.lrv.evaDone', { n: evaIndex + 1 }));
    pauseThen(1.6, () => {
      if (evaIndex < EVAS.length - 1) return startEva(evaIndex + 1);
      // After the three Apollo 15 drives: the Apollo 17 record, then (if cited) the repair.
      const repair = !SOURCES['apollo17-fender'].needsSource;
      const lines = [t('g.lrv.record.text')];
      if (repair) lines.push(t('g.lrv.repair.text'));
      shell.openCard(t('g.lrv.record.title'), lines, repair ? startRepair : finish);
      state = 'card';
    });
  }

  function finish() {
    state = 'done';
    rotor(0);
    shell.say(t('g.lrv.end'));
    shell.showDone(() => api.finish({ stars: stars3() }));
  }

  // ---------- fender repair puzzle (only when its fact has a citation) ----------
  // Four maps, four corners. The marked corner shows a shape; pick the map
  // with the same shape. Wrong picks just ask again.
  const CORNERS = ['┌', '┐', '└', '┘'];
  function startRepair() {
    state = 'repair';
    hold.hidden = true;
    let slot = 0;
    const board = el('div', 'repair');
    const slots = CORNERS.map((c) => el('span', 'repair-slot', c));
    const fender = el('div', 'repair-fender');
    fender.append(...slots);
    const picks = el('div', 'repair-picks');
    const order = [2, 0, 3, 1];                   // GAME VALUE: the maps are offered in a mixed order
    const mark = () => slots.forEach((s, i) => (s.className = `repair-slot${i < slot ? ' done' : i === slot ? ' want' : ''}`));
    for (const i of order) {
      const b = button(`${t('g.lrv.map', { n: order.indexOf(i) + 1 })} ${CORNERS[i]}`, () => {
        if (i !== slot) { sfx('bump'); shell.say(t('g.lrv.repair.wrong')); return; }
        b.disabled = true;
        slot++;
        sfx('select');
        mark();
        if (slot === CORNERS.length) {
          sfx('success');
          shell.say(t('g.lrv.repair.done'));
          pauseThen(1.6, () => { board.remove(); finish(); });
        } else {
          picks.querySelector('button:not([disabled])')?.focus({ preventScroll: true });
        }
      }, 'action', '');
      picks.append(b);
    }
    board.append(fender, picks);
    shell.controls.append(board);
    mark();
    shell.say(t('g.lrv.repair.pick'));
    picks.querySelector('button').focus({ preventScroll: true });
  }

  // ---------- drawing ----------
  const screenX = (worldX) => Math.round(ROVER_MID + worldX - x);

  function drawWorld() {
    clear();
    stars.render(-x * 0.02, 0);
    // Far hills, then a nearer ridge (parallax), then the ground.
    ctx.fillStyle = C.gray;
    ctx.globalAlpha = 0.45;
    for (let sx = 0; sx < WIDTH; sx++) {
      const top = Math.round(GROUND - 10 + hill(sx + x * 0.1, 3));
      ctx.fillRect(sx, top, 1, GROUND + 4 - top);
    }
    ctx.globalAlpha = 1;
    for (let sx = 0; sx < WIDTH; sx++) {
      const top = Math.round(GROUND - 3 + hill(sx + x * 0.3, 7) * 0.5);
      ctx.fillRect(sx, top, 1, GROUND + 4 - top);
    }
    ctx.fillStyle = C.mist;
    ctx.fillRect(0, GROUND + 3, WIDTH, 80);
    for (let i = 0; i < 130; i++) {
      const y = GROUND + 5 + ((i * 53) % 46);
      let sx = ((i * 97) % 380) - (x * (0.6 + (y - GROUND) / 90)) % 380;
      if (sx < -4) sx += 380;
      px(sx, y, C.gray, 0.55, 1 + (i % 3 === 0), 1);
    }
  }

  // The lunar module at the start of each drive: an original, simple drawing.
  function drawLunarModule() {
    const sx = screenX(-70);
    if (sx < -40) return;
    const y = FOOT - 34;
    px(sx + 6, y, C.mist, 1, 16, 10);               // upper cabin
    px(sx + 9, y + 3, C.void, 1, 4, 3);             // window
    px(sx + 2, y + 10, C.dust, 1, 24, 10);          // lower stage
    px(sx + 2, y + 10, C.amber, 1, 24, 2);
    px(sx - 2, y + 18, C.gray, 1, 3, 14);           // legs
    px(sx + 27, y + 18, C.gray, 1, 3, 14);
    px(sx - 5, y + 32, C.gray, 1, 9, 2);
    px(sx + 24, y + 32, C.gray, 1, 9, 2);
    px(sx + 12, y + 20, C.gray, 1, 4, 8);           // engine
  }

  function drawCraters() {
    for (const c of craters) {
      const sx = screenX(c.x);
      if (sx < -30 || sx > WIDTH + 30) continue;
      px(sx - 13, FOOT - 1, C.star, 0.5, 26, 1);    // bright rim
      px(sx - 12, FOOT, C.gray, 1, 24, 3);
      px(sx - 9, FOOT + 1, C.night, 0.8, 18, 2);
      px(sx - 10, FOOT + 3, C.gray, 0.7, 20, 1);
    }
  }

  function drawFlags() {
    for (const f of flags) {
      const sx = screenX(f.x);
      if (sx < -20 || sx > WIDTH + 20) continue;
      const color = f.state === 'done' ? C.green : f.state === 'missed' ? C.gray : C.amber;
      // The stopping zone on the ground, then the pole and the flag.
      px(sx - FLAG_ZONE, FOOT + 4, color, 0.8, 4, 1);
      px(sx + FLAG_ZONE - 4, FOOT + 4, color, 0.8, 4, 1);
      px(sx, FOOT - 22, C.star, 1, 1, 22);
      const wave = still() || f.state !== 'ahead' ? 0 : Math.round(Math.sin(time * 5));
      px(sx + 1, FOOT - 22 + wave, color, 1, 8, 5);
      px(sx + 9, FOOT - 21 + wave, color, 1, 2, 3);
    }
  }

  function drawRover() {
    const bounce = Math.round(hop * 4) + (speed > 8 && !still() ? Math.round(Math.sin(time * 30) * 0.6) : 0);
    px(ROVER_X + 4, FOOT, C.void, 0.3, 46, 2);
    drawSprite(SPRITES.lrv, ROVER_X, FOOT - 30 - bounce, { scale: 2 });
  }

  // ---------- start ----------
  drone(true);
  startEva(0);

  return {
    update(dt) {
      time += dt;
      hop = Math.max(0, hop - dt * 3);

      if (state === 'drive') {
        speed = clamp(speed + (control.held ? ACCEL : -BRAKE) * dt, 0, MAX_SPEED);
        x += speed * dt;
        rotor(speed / MAX_SPEED * 0.6);            // a low motor hum that follows the speed

        // Dust thrown up behind the wheels.
        if (!still() && speed > 12 && Math.random() < speed / MAX_SPEED) {
          const wheel = Math.random() < 0.5 ? 8 : 42;
          dust.spawn({
            x: ROVER_X + wheel, y: FOOT - 2, vx: -(10 + Math.random() * speed * 0.5), vy: -(8 + Math.random() * speed * 0.4),
            drag: 0.8, life: 0.5 + Math.random() * 0.5, color: Math.random() < 0.6 ? C.mist : C.gray, alpha: 0.8,
          });
        }

        // Flags: stop next to one to reach it; drive past and it is missed.
        const next = flags.find((f) => f.state === 'ahead');
        if (next) {
          const gap = next.x - x;
          if (!warned && gap < 170 && gap > 0) { warned = true; shell.say(t('g.lrv.flagAhead')); }
          if (Math.abs(gap) <= FLAG_ZONE && speed < 2) {
            next.state = 'done';
            collected++;
            warned = false;
            sfx('success');
            shell.say(t('g.lrv.stopped'));
            for (let i = 0; i < 16; i++) {
              const a = Math.random() * Math.PI * 2, v = 14 + Math.random() * 26;
              dust.spawn({ x: ROVER_MID + gap, y: FOOT - 18, vx: Math.cos(a) * v, vy: Math.sin(a) * v, drag: 3, life: 0.5 + Math.random() * 0.4, color: Math.random() < 0.6 ? C.green : C.star });
            }
          } else if (gap < -FLAG_ZONE) {
            next.state = 'missed';
            warned = false;
            sfx('fail');
            shell.say(t('g.lrv.missed'));
          }
        }

        // Craters: fine when slow, a jolt when fast.
        for (const c of craters) {
          if (c.passed || x < c.x) continue;
          c.passed = true;
          hop = 1;
          if (speed > CRATER_SPEED) {
            jolts++;
            speed *= 0.35;
            sfx('bump');
            shake.add(2);
            shell.say(t('g.lrv.jolt'));
          } else {
            sfx('step');
          }
        }

        refresh();
        if (x >= length) evaDone();
      } else {
        rotor(0);
        if (state === 'pause') {
          pauseTime -= dt;
          if (pauseTime <= 0) afterPause();
        }
      }
      dust.update(dt);
    },

    render() {
      drawWorld();
      drawLunarModule();
      drawCraters();
      drawFlags();
      dust.render();
      drawRover();
    },

    destroy() {
      rotor(0);
      control.destroy();
    },
  };
}
