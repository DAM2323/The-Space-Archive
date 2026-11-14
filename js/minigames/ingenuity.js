// Ingenuity mini-game: "Wright Brothers Field".
//
// Teaching goal: a technology demo planned for no more than five test flights
// kept flying long after the plan.
//
// How it plays: one button. Hold it to spin the rotors and climb, release to
// descend. Each flight: take off, hover inside the marked zone until the bar
// fills, then land softly. After the five planned flights the helicopter gets
// a new role (scouting) and the flights get harder.
// The real totals (flights, minutes, distance, altitude) are shown only on
// the "What really happened" card.
//
// Every number in this file marked GAME VALUE is gameplay only.

import { C } from '../data/palette.js';
import { SPRITES } from '../data/sprites.js';
import { t } from '../engine/i18n.js';
import { px, clear, drawSprite, WIDTH } from '../engine/render.js';
import { Starfield, Particles, shake, ease, lerp, clamp } from '../engine/fx.js';
import { el, button } from '../engine/ui.js';
import { sfx, rotor, drone } from '../engine/audio.js';
import { gameState } from '../state.js';
import { createShell } from './common.js';

// ---------- GAME VALUES (gameplay numbers, not mission data) ----------
const GRAVITY = 62;            // GAME VALUE: pixels per second squared, downward
const THRUST = 138;            // GAME VALUE: upward push while the button is held
const MAX_SPEED = 62;          // GAME VALUE: fastest climb or fall, pixels per second
const CEILING = 66;            // GAME VALUE: highest altitude, in pixels
const SAFE_LANDING = 36;       // GAME VALUE: fastest touchdown that still counts as soft
const PLANNED = 5;             // real: the plan was no more than five test flights
// GAME VALUE: one entry per flight. zone = altitude to hover at (pixels above
// the ground), half = how far above or below still counts, hover = seconds to stay inside,
// wind = strength of gusts, sway = how far the zone moves up and down.
const FLIGHTS = [
  { zone: 40, half: 13, hover: 1.6, wind: 0, sway: 0 },
  { zone: 46, half: 12, hover: 1.9, wind: 0, sway: 0 },
  { zone: 34, half: 11, hover: 2.1, wind: 8, sway: 0 },
  { zone: 48, half: 11, hover: 2.3, wind: 14, sway: 0 },
  { zone: 42, half: 10, hover: 2.5, wind: 18, sway: 0 },
  { zone: 44, half: 10, hover: 2.5, wind: 20, sway: 6 },
  { zone: 38, half: 10, hover: 2.7, wind: 24, sway: 10 },
  { zone: 40, half: 9, hover: 3.0, wind: 28, sway: 11 },
];

// ---------- layout (game pixels) ----------
const GROUND = 126;            // y of the ground line
const HELI_X = 160;            // center of the helicopter
const HELI_H = 28;             // sprite height at scale 2

const hill = (x, seed) => Math.sin(x * 0.03 + seed) * 6 + Math.sin(x * 0.085 + seed * 2) * 3 + Math.sin(x * 0.012 + seed) * 5;

export function create(ctx, api) {
  const still = () => gameState.settings.reducedMotion;
  const shell = createShell(api, 'g.ing.title');

  // ---------- game state ----------
  let flight = 0;                // index of the current flight
  let alt = 0, speed = 0;        // altitude (pixels above ground) and vertical speed (up is positive)
  let hovered = 0;               // seconds spent inside the zone on this flight
  let hardLandings = 0;
  let holding = false;
  let state = 'card';            // 'card' | 'ready' | 'fly' | 'land' | 'pause' | 'done'
  let pauseTime = 0, afterPause = null;

  // ---------- visuals ----------
  let time = 0, spin = 0, scroll = 0, flash = 0;
  const stars = new Starfield(70, 31);
  const puffs = new Particles(140);

  // ---------- DOM ----------
  const flightText = el('span', 'g-phase');
  const dots = el('div', 'dots');
  shell.left.append(flightText, dots, el('span', 'g-note', t('game.values')));
  const planText = el('span', 'g-sky');
  shell.mid.append(planText);
  const hold = button(t('g.ing.hold'), () => {}, 'action hold', '');
  shell.controls.append(hold);
  // The button works while it is pressed, with mouse, touch or keyboard.
  const press = (on) => { holding = on && (state === 'ready' || state === 'fly' || state === 'land'); hold.classList.toggle('held', holding); };
  hold.addEventListener('pointerdown', (e) => { hold.setPointerCapture(e.pointerId); press(true); });
  hold.addEventListener('pointerup', () => press(false));
  hold.addEventListener('pointercancel', () => press(false));
  hold.addEventListener('contextmenu', (e) => e.preventDefault());
  const HOLD_KEYS = [' ', 'Enter', 'ArrowUp', 'w'];
  let heldKey = null;            // only the key that started the hold can end it
  const onKeyDown = (e) => {
    if (!HOLD_KEYS.includes(e.key) || shell.cardOpen() || state === 'done') return;
    if (e.target instanceof HTMLElement && e.target.closest('button') && e.target !== hold) return;
    e.preventDefault();
    heldKey = e.key;
    press(true);
  };
  const onKeyUp = (e) => { if (e.key === heldKey) { heldKey = null; press(false); } };
  const onBlur = () => press(false);
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', onBlur);

  function refresh() {
    flightText.textContent = t('g.ing.flight', { n: Math.min(flight + 1, FLIGHTS.length) });
    planText.textContent = t(flight < PLANNED ? 'g.ing.planned' : 'g.ing.scouting');
    dots.replaceChildren(...FLIGHTS.map((_, i) => el('span', `dot${i < flight ? ' on' : i === flight ? ' seen' : ''}${i >= PLANNED ? ' extra' : ''}`)));
  }

  // GAME VALUE: 1 to 3 stars from the number of hard landings.
  const stars3 = () => (hardLandings <= 1 ? 3 : hardLandings <= 4 ? 2 : 1);

  function ready() {
    state = 'ready';
    alt = 0;
    speed = 0;
    hovered = 0;
    refresh();
    shell.say(t('g.ing.ready'));
    hold.focus({ preventScroll: true });
  }

  // Wait a moment (so the player can read), then run `then`.
  function pauseThen(seconds, then) {
    state = 'pause';
    press(false);
    pauseTime = seconds;
    afterPause = then;
  }

  function landed(soft) {
    alt = 0;
    speed = 0;
    for (let i = 0; i < (soft ? 10 : 26); i++) {
      puffs.spawn({
        x: HELI_X + (Math.random() - 0.5) * 30, y: GROUND - 1, vx: (Math.random() - 0.5) * (soft ? 40 : 110), vy: -Math.random() * (soft ? 14 : 40),
        drag: 2, life: 0.5 + Math.random() * 0.6, color: Math.random() < 0.5 ? C.dust : C.rust,
      });
    }
    if (!soft) {
      hardLandings++;
      sfx('fail');
      shake.add(2.2);
      shell.say(t('g.ing.hard'));
      return pauseThen(1.8, ready);
    }
    sfx('land');
    if (state !== 'land') return;              // touched down before the hover was done: just keep going
    sfx('success');
    flash = 1;
    const n = flight + 1;
    shell.say(t(flight === 0 ? 'g.ing.first' : 'g.ing.landed', { n }));
    flight++;
    refresh();
    pauseThen(flight === 1 ? 3 : 1.6, () => {
      if (flight === PLANNED) {
        shell.openCard(t('g.ing.p2.title'), [t('g.ing.p2.text'), t('g.ing.p2.how')], ready);
        state = 'card';
      } else if (flight >= FLIGHTS.length) {
        state = 'done';
        rotor(0);
        shell.say(t('g.ing.end', { n: FLIGHTS.length }));
        shell.showDone(() => api.finish({ stars: stars3() }));
      } else {
        ready();
      }
    });
  }

  // Height of the hover zone right now (it sways on scouting flights).
  const zoneNow = () => {
    const f = FLIGHTS[Math.min(flight, FLIGHTS.length - 1)];
    return f.zone + Math.sin(time * 0.9) * f.sway;
  };

  // ---------- drawing ----------
  function drawWorld() {
    clear(C.deep);
    stars.render();
    // Dusty light near the horizon.
    for (let y = GROUND - 44; y < GROUND; y++) {
      const k = (y - (GROUND - 44)) / 44;
      for (let x = y & 1; x < WIDTH; x += 2) if (k > 0.3 + ((x * 7 + y * 13) % 10) / 15) px(x, y, C.rust, 0.5);
    }
    ctx.fillStyle = C.rust;
    ctx.globalAlpha = 0.6;
    for (let x = 0; x < WIDTH; x++) {
      const top = Math.round(GROUND - 9 + hill(x + scroll * 0.2, 2));
      ctx.fillRect(x, top, 1, GROUND + 4 - top);
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = C.dust;
    ctx.fillRect(0, GROUND, WIDTH, 60);
    for (let i = 0; i < 110; i++) {
      const y = GROUND + 2 + ((i * 53) % 50);
      let x = ((i * 97) % 360) - (scroll * (0.6 + (y - GROUND) / 80)) % 360;
      if (x < -4) x += 360;
      px(x, y, C.rust, 0.5, 1 + (i % 3 === 0), 1);
    }
    // Take-off and landing spot.
    px(HELI_X - 26, GROUND + 1, C.rust, 0.8, 52, 2);
    for (let i = 0; i < 5; i++) px(HELI_X - 24 + i * 11, GROUND + 1, C.star, 0.8, 5, 1);
  }

  function drawZone() {
    if (state === 'card' || state === 'done') return;
    const f = FLIGHTS[Math.min(flight, FLIGHTS.length - 1)];
    // The band is drawn so that "the whole helicopter is inside it" is exactly the rule.
    const top = Math.round(GROUND - zoneNow() - f.half - HELI_H) - 1, bottom = Math.round(GROUND - zoneNow() + f.half) + 1;
    const inside = Math.abs(alt - zoneNow()) <= f.half;
    const full = hovered >= f.hover;
    const color = full ? C.green : inside ? C.amber : C.ice;
    ctx.globalAlpha = inside ? 0.16 : 0.08;
    ctx.fillStyle = color;
    ctx.fillRect(40, top, WIDTH - 80, bottom - top);
    ctx.globalAlpha = 1;
    const march = still() ? 0 : Math.floor(time * 10) % 6;
    for (let x = 40 + march; x < WIDTH - 40; x += 6) {
      px(x, top, color, 0.9, 3, 1);
      px(x, bottom, color, 0.9, 3, 1);
    }
    // Hover bar: fills while the helicopter stays inside the zone.
    const w = 60, k = clamp(hovered / f.hover);
    px(HELI_X - w / 2 - 1, top + 3, C.void, 0.8, w + 2, 4);
    px(HELI_X - w / 2, top + 4, C.indigo, 1, w, 2);
    px(HELI_X - w / 2, top + 4, color, 1, Math.round(w * k), 2);
  }

  function drawHelicopter() {
    const y = Math.round(GROUND - alt - HELI_H);
    const x = HELI_X - 22;
    // Shadow on the ground gets smaller as it climbs.
    const sw = Math.round(lerp(34, 12, clamp(alt / CEILING)));
    px(HELI_X - sw / 2, GROUND + 1, C.void, 0.35, sw, 2);
    drawSprite(SPRITES.ingenuity, x, y, { scale: 2 });
    // Spinning rotors: cover the still blades and draw blades of changing length.
    if (spin > 0.05) {
      const phase = still() ? 1 : Math.abs(Math.sin(time * 40));
      for (const [row, half] of [[0, 17], [4, 13]]) {
        const len = Math.round(half * (0.35 + 0.65 * (row ? 1 - phase : phase)));
        px(HELI_X - 2 - half, y + row, C.deep, 1, half * 2 + 4, 2);              // hide the still blade
        px(HELI_X - len - 1, y + row, C.mist, 0.5 + 0.5 * spin, len * 2 + 2, 2);
        px(HELI_X - 1, y + row, C.star, 1, 2, 2);                                // the mast
      }
    }
    if (flash > 0) {
      ctx.globalAlpha = flash * 0.5;
      ctx.fillStyle = C.green;
      ctx.fillRect(x - 4, y - 4, 52, HELI_H + 8);
      ctx.globalAlpha = 1;
    }
  }

  // ---------- start ----------
  refresh();
  drone(true);
  shell.openCard(t('g.ing.p1.title'), [t('g.ing.p1.text'), t('g.ing.p1.how')], ready);

  return {
    update(dt) {
      time += dt;
      stars.update(dt, 0.3);
      flash = Math.max(0, flash - dt * 2);
      const f = FLIGHTS[Math.min(flight, FLIGHTS.length - 1)];
      const flying = state === 'ready' || state === 'fly' || state === 'land';

      // Rotors spin up while the button is held and slow down on the ground.
      spin = lerp(spin, holding ? 1 : alt > 0 ? 0.55 : 0, 1 - Math.exp(-6 * dt));
      rotor(state === 'done' ? 0 : spin);

      if (flying) {
        if (state === 'ready' && holding) {
          state = 'fly';
          shell.say(t('g.ing.hover'));
        }
        if (state !== 'ready') {
          const gust = f.wind * Math.sin(time * 1.7 + flight) * Math.sin(time * 0.6);
          speed += ((holding ? THRUST : 0) - GRAVITY + gust) * dt;
          speed = clamp(speed, -MAX_SPEED, MAX_SPEED);
          alt += speed * dt;
          if (alt > CEILING) { alt = CEILING; speed = Math.min(speed, 0); }
          if (alt <= 0 && speed < 0) {
            landed(-speed <= SAFE_LANDING);
          } else if (state === 'fly') {
            // Hover time counts up inside the zone and slowly drains outside it.
            const inside = Math.abs(alt - zoneNow()) <= f.half;
            const before = hovered;
            hovered = clamp(hovered + (inside ? dt : -dt * 0.4), 0, f.hover);
            if (inside && Math.floor(hovered * 4) !== Math.floor(before * 4)) sfx('tick');
            if (hovered >= f.hover) {
              state = 'land';
              sfx('select');
              shell.say(t('g.ing.land'));
            }
          }
          // Scouting flights travel: the ground slides by.
          if (flight >= PLANNED && alt > 4 && !still()) scroll += dt * 26;
        }
        // Dust blown away under the rotors near the ground.
        if (!still() && spin > 0.5 && alt < 26 && Math.random() < 0.6) {
          const side = Math.random() < 0.5 ? -1 : 1;
          puffs.spawn({
            x: HELI_X + side * (6 + Math.random() * 10), y: GROUND - 1, vx: side * (20 + Math.random() * 40), vy: -(2 + Math.random() * 10),
            drag: 2.5, life: 0.4 + Math.random() * 0.4, color: Math.random() < 0.5 ? C.dust : C.rust, alpha: 0.8,
          });
        }
      } else if (state === 'pause') {
        pauseTime -= dt;
        if (pauseTime <= 0) afterPause();
      }
      puffs.update(dt);
    },

    render() {
      drawWorld();
      drawZone();
      puffs.render();
      drawHelicopter();
    },

    destroy() {
      rotor(0);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    },
  };
}
