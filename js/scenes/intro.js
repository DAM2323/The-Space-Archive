// Intro: the astronaut orbits a black hole three times and arrives in the future.
//
// What is shown (stylized, but following the real physics named in the brief):
//  - the black hole is only orbited, never entered, and its inside is never shown;
//  - gravitational lensing: light from the stars behind it is bent into arcs and
//    a ring (computed with the point-lens equation, see drawStars);
//  - an accretion disk whose far side appears bent over the top of the shadow,
//    and which is brighter on the side moving toward the viewer;
//  - two clocks: time on the ship runs slower than time outside.
// The clock numbers are story values, not a physics measurement.

import { C, PALETTE } from '../data/palette.js';
import { SPRITES } from '../data/sprites.js';
import { t } from '../engine/i18n.js';
import { ctx, clear, px, drawSprite, WIDTH, HEIGHT } from '../engine/render.js';
import { Particles, shake, ease, lerp, clamp } from '../engine/fx.js';
import { el, button } from '../engine/ui.js';
import * as scenes from '../engine/scenes.js';
import * as input from '../engine/input.js';
import { sfx, drone } from '../engine/audio.js';
import { gameState } from '../state.js';

// ---------- timeline (seconds) ----------
const T_APPROACH = 5;         // the black hole grows
const T_ORBITS = 12.5;        // three orbits
const T_FLASH = 1.3;          // arrival flash
const ORBITS = 3;

// GAME VALUE: story clock values. Earth's clock follows the eras of the machines.
// Earth's clock only rolls forward. It runs fast between these stops, slows
// down on each one and ends on the present. Each stop has a short caption.
const STOPS = [1972, 1997, 2004, 2021, 2026];
const ROLL_PART = 0.68;       // part of each step spent rolling; the rest is a pause on the stop
const SHIP_MINUTES = 12;      // GAME VALUE: minutes that pass on the ship clock

const HOLE_END = { x: 160, y: 80, rs: 16 };   // final position and shadow radius
const HOLE_START = { x: 206, y: 66, rs: 2.5 };
const CAPTION_TIMES = [0.4, 4.6, 9.4, 14];  // when each caption line appears

// ---------- state ----------
let time, done, still;
let hole;                     // { x, y, rs } right now
let ship;                     // { x, y, behind, flip }
let stars, trail;
let drift;                    // how far the background stars have moved
let lastYear, lastStop, lastCaption, lastMinutes, lastClockBlip;
let dom, offInput;

// Off-screen canvas for the per-pixel black hole picture.
const holeCanvas = document.createElement('canvas');
holeCanvas.width = WIDTH;
holeCanvas.height = HEIGHT;
const holeCtx = holeCanvas.getContext('2d');
const holeImage = holeCtx.createImageData(WIDTH, HEIGHT);

// Palette colors as [r, g, b], for writing pixels directly.
const RGB = PALETTE.map((hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)));
const RAMP = [RGB[9], RGB[8], RGB[7], RGB[6]];          // rust, ember, amber, star
// 4x4 ordered dither pattern: turns smooth brightness into pixel-art shading.
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16 - 0.5);

// Draw the black hole (shadow, ring of bent light, accretion disk) into holeCanvas.
function drawHole(cx, cy, rs, clock) {
  const data = holeImage.data;
  data.fill(0);
  const rIn = rs * 1.7, rOut = rs * 4.4;      // disk inner and outer edge
  const TILT = 0.17;                           // we see the disk almost edge-on
  const x0 = Math.max(0, Math.floor(cx - rOut)), x1 = Math.min(WIDTH, Math.ceil(cx + rOut));
  const y0 = Math.max(0, Math.floor(cy - rs * 2.2)), y1 = Math.min(HEIGHT, Math.ceil(cy + rs * 2.2));

  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const dx = x + 0.5 - cx, dy = y + 0.5 - cy;
      const r = Math.hypot(dx, dy);
      let light = 0;            // brightness 0..1+ of glowing gas at this pixel
      let dark = false;         // true inside the shadow

      // 1) The disk seen directly: a flat ring, squashed by the viewing angle.
      const rho = Math.hypot(dx, dy / TILT);
      if (rho > rIn && rho < rOut && (dy > 0 || r > rs * 1.02)) {
        const a = Math.atan2(dy / TILT, dx);
        const fall = 1 - (rho - rIn) / (rOut - rIn);                       // hotter near the hole
        const swirl = 0.72 + 0.28 * Math.sin(a * 2 + 9 * Math.log(rho / rs) + clock * 2.4);
        const doppler = 1 - 0.5 * Math.cos(a);                             // brighter on the approaching (left) side
        light = (0.25 + 0.75 * fall ** 1.2) * swirl * doppler;
      } else if (r < rs) {
        dark = true;
      } else {
        const a = Math.atan2(dy, dx);
        const doppler = 1 - 0.45 * Math.cos(a);
        if (dy < 0) {
          // 2) The far side of the disk: its light is bent over the top of the hole.
          const u = (Math.hypot(dx, dy / 0.93) - rs * 1.13) / (rs * 0.58);
          if (u > 0 && u < 1) {
            const swirl = 0.75 + 0.25 * Math.sin(a * 5 - u * 5 + clock * 2.4);
            light = (1 - 0.65 * u) * swirl * doppler * 0.9;
          }
        } else {
          // 3) A thinner, fainter image of the disk bent under the hole.
          const u = (r - rs * 1.1) / (rs * 0.2);
          if (u > 0 && u < 1) light = 0.5 * doppler;
        }
        // 4) Thin bright ring of light right at the edge of the shadow.
        if (r < rs * 1.1) light = Math.max(light, 0.62 * doppler);
        // Soft glow around everything.
        if (light === 0 && r < rs * 2.6) light = -0.001 - (1 - (r - rs) / (rs * 1.6)) * 0.2;
      }

      const i = (y * WIDTH + x) * 4;
      if (dark) {
        data[i] = RGB[0][0]; data[i + 1] = RGB[0][1]; data[i + 2] = RGB[0][2]; data[i + 3] = 255;
      } else if (light > 0) {
        const v = light + BAYER[(y & 3) * 4 + (x & 3)] * 0.22;
        if (v < 0.1) continue;
        const c = RAMP[v < 0.36 ? 0 : v < 0.62 ? 1 : v < 0.95 ? 2 : 3];
        data[i] = c[0]; data[i + 1] = c[1]; data[i + 2] = c[2]; data[i + 3] = 255;
      } else if (light < 0) {
        // Glow: dithered violet haze.
        if (-light + BAYER[(y & 3) * 4 + (x & 3)] * 0.2 > 0.12) {
          data[i] = RGB[3][0]; data[i + 1] = RGB[3][1]; data[i + 2] = RGB[3][2]; data[i + 3] = 110;
        }
      }
    }
  }
  holeCtx.putImageData(holeImage, 0, 0);
}

// Background stars, bent by the black hole.
// Point-lens equation: a star at angular distance b from the hole appears at
// th = (b + sqrt(b^2 + 4 E^2)) / 2 on the same side, and a second, fainter
// image appears on the opposite side at th2 = th - b. E is the Einstein radius.
// Stars almost exactly behind the hole (small b) are stretched into arcs,
// which together form a bright ring.
function makeStars() {
  let s = 4242;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const list = [];
  for (let i = 0; i < 230; i++) {
    list.push({
      x: rnd() * 480, y: rnd() * 220 - 20,
      bright: 0.35 + rnd() * 0.65,
      color: rnd() < 0.15 ? C.ice : rnd() < 0.1 ? C.amber : rnd() < 0.3 ? C.mist : C.star,
      phase: rnd() * 6.28,
    });
  }
  return list;
}

function arc(cx, cy, radius, angle, halfLength, color, alpha) {
  if (halfLength < 1) {
    px(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius, color, alpha);
    return;
  }
  for (let k = -halfLength; k <= halfLength; k++) {
    const a = angle + k / radius;
    px(cx + Math.cos(a) * radius, cy + Math.sin(a) * radius, color, alpha * (1 - 0.5 * Math.abs(k) / halfLength));
  }
}

function drawStars() {
  const E = hole.rs * 2.5;
  for (const s of stars) {
    let sx = (s.x + drift) % 480;
    if (sx < 0) sx += 480;
    sx -= 80;
    const bx = sx - hole.x, by = s.y - hole.y;
    const b = Math.hypot(bx, by) || 0.01;
    const root = Math.sqrt(b * b + 4 * E * E);
    const th = (b + root) / 2;
    const angle = Math.atan2(by, bx);
    const twinkle = still ? 1 : 0.8 + 0.2 * Math.sin(time * 2 + s.phase);
    const alpha = s.bright * twinkle;
    const stretch = Math.min(9, (th / b - 1) * 2.2);          // how much the image is smeared along the ring
    arc(hole.x, hole.y, th, angle, stretch, s.color, Math.min(1, alpha * (1 + stretch * 0.12)));
    const th2 = th - b;                                       // second image, opposite side
    if (th2 > hole.rs * 1.15) {
      arc(hole.x, hole.y, th2, angle + Math.PI, Math.min(7, (th2 / b) * 2.2), s.color, alpha * clamp(E / b, 0, 1) * 0.8);
    }
  }
}

// ---------- timeline helpers ----------

// 0..1 progress through the three orbits (slow start and end, steady middle).
function orbitProgress() {
  const u = clamp((time - T_APPROACH) / T_ORBITS);
  return 0.6 * u + 0.4 * ease.inOutSine(u);
}

const PHI0 = 2.5;   // where on the orbit the ship joins (front left)
function orbitPoint(phi) {
  return {
    x: hole.x + Math.cos(phi) * hole.rs * 6.4,
    y: hole.y + Math.sin(phi) * hole.rs * 1.55,
  };
}

// Earth's clock at orbit time u (0..1): the year shown, and the stop it is
// resting on (-1 while it is rolling between two stops).
function earthClock(u) {
  const steps = STOPS.length - 1;
  const s = Math.min(steps - 0.0001, u * steps);
  const i = Math.floor(s);
  const roll = clamp((s - i) / ROLL_PART);
  if (u >= 1 || roll >= 1) return { year: STOPS[i + 1], stop: i + 1 };
  // Easing makes the counter leave a stop slowly, race, and slow down into the next one.
  const year = Math.round(lerp(STOPS[i], STOPS[i + 1], ease.inOutCubic(roll)));
  return { year, stop: year === STOPS[i] ? i : -1 };
}

const shipClockText = (minutes) => `00:${String(minutes).padStart(2, '0')}`;

function finish() {
  if (done) return;
  done = true;
  scenes.go(scenes.has('hub') ? 'hub' : 'title', { arriving: true });
}

// ---------- DOM ----------

function buildUI(ui) {
  const clocks = el('div', 'clocks');
  const shipBox = el('div', 'clock');
  const shipValue = el('span', 'clock-value', shipClockText(0));
  shipBox.append(el('span', 'clock-label', t('intro.shipClock')), shipValue, el('span', 'clock-note', t('intro.slower')));
  const outBox = el('div', 'clock right');
  const outValue = el('span', 'clock-value', String(STOPS[0]));
  const outEvent = el('span', 'clock-event', t(`intro.stop.${STOPS[0]}`));
  outEvent.setAttribute('aria-live', 'polite');
  outBox.append(el('span', 'clock-label', t('intro.outsideClock')), outValue, outEvent, el('span', 'clock-note', t('intro.storyYears')));
  clocks.append(shipBox, outBox);

  const caption = el('p', 'caption');
  caption.setAttribute('aria-live', 'polite');
  ui.append(clocks, caption);
  dom = { shipValue, outValue, outEvent, outBox, caption };

  if (still) {
    // Reduced motion: one still frame, final clock values, and a button.
    shipValue.textContent = shipClockText(SHIP_MINUTES);
    outValue.textContent = `${STOPS[0]} \u2192 ${STOPS[STOPS.length - 1]}`;
    outEvent.textContent = t(`intro.stop.${STOPS[STOPS.length - 1]}`);
    caption.textContent = `${t('intro.line.3')} ${t('intro.line.4')}`;
    caption.classList.add('show');
    const go = button(t('intro.continue'), finish, 'primary corner');
    ui.append(go);
    go.focus({ preventScroll: true });
  } else {
    ui.append(button(t('intro.skip'), finish, 'small corner', 'back'));
  }
}

function showCaption(index) {
  dom.caption.classList.remove('show');
  void dom.caption.offsetWidth;                // restart the fade
  dom.caption.textContent = t(`intro.line.${index + 1}`);
  dom.caption.classList.add('show');
}

// ---------- scene ----------

export default {
  enter(_params, ui) {
    still = gameState.settings.reducedMotion;
    time = 0;
    done = false;
    drift = 0;
    lastYear = STOPS[0];
    lastStop = 0;
    lastCaption = -1;
    lastMinutes = 0;
    lastClockBlip = 0;
    hole = { ...HOLE_START };
    ship = { x: -20, y: 150, behind: false, flip: false };
    stars = makeStars();
    trail = new Particles(120);
    if (still) {
      hole = { ...HOLE_END };
      Object.assign(ship, orbitPoint(1.2));
    }
    buildUI(ui);
    drone(true);
    // Space, Enter or a tap anywhere skips the intro.
    offInput = input.on((a) => {
      if (a.type === 'confirm' || a.type === 'back') finish();
    });
  },

  exit() {
    offInput();
  },

  update(dt) {
    if (still) return;
    time += dt;

    // Approach: the hole grows and slides to the center of the screen.
    const k = ease.inOutSine(clamp(time / T_APPROACH));
    hole.x = lerp(HOLE_START.x, HOLE_END.x, k);
    hole.y = lerp(HOLE_START.y, HOLE_END.y, k);
    hole.rs = lerp(HOLE_START.rs, HOLE_END.rs, k);

    // Ship: fly in, then orbit. Front half of the orbit moves left to right.
    const p = orbitProgress();
    const prevX = ship.x;
    if (time < T_APPROACH) {
      const target = orbitPoint(PHI0);
      const e = ease.outCubic(time / T_APPROACH);
      ship.x = lerp(-20, target.x, e);
      ship.y = lerp(156, target.y, e);
      ship.behind = false;
    } else {
      const phi = PHI0 - p * ORBITS * Math.PI * 2;
      Object.assign(ship, orbitPoint(phi));
      ship.behind = Math.sin(phi) < 0;
    }
    ship.flip = ship.x < prevX;

    // The stars sweep past while she orbits.
    drift -= dt * (4 + 60 * Math.sin(Math.PI * clamp((time - T_APPROACH) / T_ORBITS)) ** 0.5 * (time > T_APPROACH ? 1 : 0));

    // Thruster trail.
    trail.spawn({
      x: ship.x + (ship.flip ? 4 : -4), y: ship.y + (Math.random() - 0.5) * 2,
      vx: (ship.flip ? 1 : -1) * (6 + Math.random() * 10), vy: (Math.random() - 0.5) * 6,
      life: 0.35 + Math.random() * 0.35, color: Math.random() < 0.5 ? C.amber : C.ice, alpha: ship.behind ? 0.4 : 0.9,
    });
    trail.update(dt);

    // Clocks.
    const earth = earthClock(clamp((time - T_APPROACH) / T_ORBITS));
    if (earth.year !== lastYear) {
      lastYear = earth.year;
      dom.outValue.textContent = String(earth.year);
      if (time - lastClockBlip > 0.07) { sfx('clock'); lastClockBlip = time; }
    }
    if (earth.stop !== lastStop) {
      lastStop = earth.stop;
      // Rolling: the caption fades out. On a stop: show its caption with a small "bump".
      dom.outEvent.classList.toggle('rolling', earth.stop < 0);
      if (earth.stop >= 0) {
        dom.outEvent.textContent = t(`intro.stop.${STOPS[earth.stop]}`);
        dom.outBox.classList.remove('bump');
        void dom.outBox.offsetWidth;
        dom.outBox.classList.add('bump');
        sfx('select');
      }
    }
    const minutes = Math.floor(p * SHIP_MINUTES);
    if (minutes !== lastMinutes) {
      lastMinutes = minutes;
      dom.shipValue.textContent = shipClockText(minutes);
      sfx('tick');
    }

    // Captions.
    let line = -1;
    for (let i = 0; i < CAPTION_TIMES.length; i++) if (time >= CAPTION_TIMES[i]) line = i;
    if (line !== lastCaption) {
      lastCaption = line;
      showCaption(line);
    }

    // Arrival.
    const flashStart = T_APPROACH + T_ORBITS;
    if (time >= flashStart && time - dt < flashStart) {
      sfx('arrive');
      shake.add(1.2);
    }
    if (time >= flashStart + T_FLASH) finish();
  },

  render() {
    clear();
    drawStars();
    drawHole(hole.x, hole.y, hole.rs, time);

    const drawShip = () => {
      trail.render();
      drawSprite(SPRITES.ship, ship.x - 4, ship.y - 2, { flip: ship.flip, alpha: ship.behind ? 0.75 : 1 });
    };
    // Behind the hole: draw the ship first so the hole and disk cover it.
    if (ship.behind) drawShip();
    ctx.drawImage(holeCanvas, 0, 0);
    if (!ship.behind) drawShip();

    // Arrival: one slow fade to light (no rapid flashing).
    const f = clamp((time - T_APPROACH - T_ORBITS) / T_FLASH);
    if (f > 0) {
      ctx.globalAlpha = ease.inCubic(f) * 0.92;
      ctx.fillStyle = C.star;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.globalAlpha = 1;
    }
  },
};
