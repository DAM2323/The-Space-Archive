// Opportunity mini-game: "Beyond Sol 90".
//
// Teaching goal: a rover planned for 90 sols kept working for years, and dust
// and energy shaped its whole life.
//
// How it plays: every turn you choose DRIVE, SCIENCE or REST. Driving and
// science cost energy, the Sun gives some back, and dust in the sky reduces it.
//   Phase 1  roll out of Eagle crater (2004)
//   Phase 2  drive on and find Heat Shield Rock (2005)
//   Phase 3  the 2007 dust storms: rest and wait, science is suspended
//   Phase 4  years beyond the plan, then the final dust storm (2018)
// The ending is fixed: in the final storm the rover cannot be saved.
//
// Every date, name and number in the TEXT is a real fact from the content
// pack. Every number in this FILE marked GAME VALUE is gameplay only.

import { C, PALETTE } from '../data/palette.js';
import { SPRITES } from '../data/sprites.js';
import { t } from '../engine/i18n.js';
import { px, drawSprite, WIDTH, HEIGHT } from '../engine/render.js';
import { Particles, shake, ease, lerp, clamp } from '../engine/fx.js';
import { el, button, setLabel, arrowNav } from '../engine/ui.js';
import * as input from '../engine/input.js';
import { sfx, drone } from '../engine/audio.js';
import { gameState } from '../state.js';

// ---------- GAME VALUES (gameplay numbers, not mission data) ----------
const MAX_ENERGY = 100;        // GAME VALUE
const START_ENERGY = 70;       // GAME VALUE
const COST = { drive: 28, science: 20, rest: 0 };          // GAME VALUE: energy per action
const SKY = {                  // GAME VALUE: energy change each turn, by sky
  clear: 18, dusty: 6, final: -8,
};
const STORM_WEEKS = [-2, -4, -6, -5, -3, 1];               // GAME VALUE: the 2007 storm, one turn per week
const STORM_MIN_ENERGY = 40;   // GAME VALUE: energy is topped up to this before the 2007 storm
const FINAL_MAX_ENERGY = 30;   // GAME VALUE: energy is capped to this when the final storm begins
const FINAL_MIN_ENERGY = 24;   // GAME VALUE: ...and raised to this, so the ending is never instant
const FAULT_ENERGY = 30;       // GAME VALUE: energy after a low-power sleep
const TOTAL_TARGETS = 5;       // science targets in the whole level

// Each driving phase is a short track of steps. `targets` are science stops,
// `milestones` are real events shown when the rover reaches that step.
const PHASES = [
  { id: 'p1', steps: 3, crater: true, targets: { 1: 'dataCollected' }, sky: ['clear'] },
  { id: 'p2', steps: 5, targets: { 2: 'heatShield', 4: 'dataCollected' }, sky: ['clear', 'clear', 'dusty', 'clear', 'dusty', 'dusty', 'clear'] },
  { id: 'p3', storm: true },
  { id: 'p4', steps: 6, targets: { 2: 'dataCollected', 5: 'dataCollected' }, milestones: { 2: 'endeavour', 4: 'record' },
    sky: ['clear', 'dusty', 'clear', 'clear', 'dusty', 'clear', 'dusty'] },
];

// ---------- layout (game pixels) ----------
const GROUND = 94;             // y of the horizon
const ROVER_X = 84;
const ROVER_FOOT = 118;        // y where the wheels touch the ground
const STEP_PX = 72;            // how far the world scrolls for one step
const SUN = { x: 290, y: 46 };
const ANIM = { drive: 1.0, science: 1.1, rest: 0.8 };       // seconds per action

// Sky pictures are drawn once per dust level and cached.
const RGB = PALETTE.map((hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)));
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16 - 0.5);
const skyCache = new Map();

function skyImage(level) {              // level: 0 (clear) .. 10 (darkest storm)
  if (skyCache.has(level)) return skyCache.get(level);
  const img = document.createElement('canvas');
  img.width = WIDTH;
  img.height = GROUND + 8;
  const g = img.getContext('2d');
  const data = g.createImageData(img.width, img.height);
  const d = level / 10;
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      // More haze near the horizon and when the air is dusty.
      const haze = (y / GROUND) * 0.85 + d * 0.95 - 0.45 + BAYER[(y & 3) * 4 + (x & 3)] * 0.3;
      const c = haze > 0.95 ? (d > 0.85 ? RGB[9] : RGB[10]) : haze > 0.55 ? RGB[9] : haze > 0.25 ? RGB[3] : haze > 0 ? RGB[2] : RGB[1];
      const i = (y * img.width + x) * 4;
      data.data[i] = c[0]; data.data[i + 1] = c[1]; data.data[i + 2] = c[2]; data.data[i + 3] = 255;
    }
  }
  g.putImageData(data, 0, 0);
  skyCache.set(level, img);
  return img;
}

const hill = (x, seed) => Math.sin(x * 0.03 + seed) * 6 + Math.sin(x * 0.085 + seed * 2) * 3 + Math.sin(x * 0.012 + seed) * 5;

export function create(ctx, api) {
  const still = () => gameState.settings.reducedMotion;

  // ---------- game state (local to this mini-game) ----------
  let phaseIndex = 0;
  let phase = PHASES[0];
  let energy = START_ENERGY;
  let step = 0;                  // position on the current track
  let turn = 0;                  // turns played in the current phase
  let week = 0;                  // weeks survived in the 2007 storm
  let data = 0;                  // science targets studied
  let faults = 0;                // low-power sleeps
  let studied = {};              // step -> true, for the current phase
  let finalStorm = false;
  let finalTurn = 0;
  let state = 'card';            // 'card' | 'idle' | 'anim' | 'ending' | 'done'
  let anim = null;               // { kind, t, dur, from }
  let endTime = 0, endLine = 0;

  // ---------- visuals ----------
  let time = 0;
  let scroll = 0;                // world scroll in pixels
  let dust = 0, dustTarget = 0;  // 0 clear .. 1 darkest
  let dark = 0;                  // extra darkness of the ending
  let wall = 1;                  // 1 inside the crater .. 0 on the plain
  let bump = 0;
  const puffs = new Particles(120);    // wheel dust, sparks
  const motes = new Particles(80);     // sunlight, data
  const streaks = [];                  // blowing storm dust
  for (let i = 0; i < 70; i++) streaks.push({ x: Math.random() * WIDTH, y: Math.random() * 150, v: 90 + Math.random() * 160, len: 3 + Math.random() * 8 });

  // ---------- DOM ----------
  const dom = {};
  function buildUI() {
    const hud = el('div', 'g-hud');
    const left = el('div', 'g-box');
    dom.fill = el('div', 'meter-fill');
    const meter = el('div', 'meter');
    meter.append(dom.fill);
    dom.energyText = el('span', 'g-value');
    const row = el('div', 'g-row');
    row.append(el('span', 'g-label', t('g.opp.energy')), dom.energyText);
    dom.delta = el('span', 'g-delta');
    dom.dataText = el('span', 'g-data');
    left.append(row, meter, dom.delta, dom.dataText, el('span', 'g-note', t('g.opp.gameValues')));
    meter.setAttribute('role', 'img');

    const mid = el('div', 'g-box g-mid');
    dom.phaseTitle = el('span', 'g-phase');
    dom.sky = el('span', 'g-sky');
    dom.income = el('span', 'g-income');
    mid.append(dom.phaseTitle, dom.sky, dom.income);
    hud.append(left, mid);

    const bottom = el('div', 'g-bottom');
    dom.msg = el('p', 'g-msg');
    dom.msg.setAttribute('aria-live', 'polite');
    dom.actions = el('div', 'g-actions');
    dom.buttons = {};
    for (const kind of ['drive', 'science', 'rest']) {
      const b = button(t(`g.opp.${kind}`), () => act(kind), 'action', '');
      b.append(el('span', 'action-cost'));
      dom.buttons[kind] = b;
      dom.actions.append(b);
    }
    dom.continue = button(t('g.opp.continue'), () => api.finish({ stars: stars() }), 'primary', 'select');
    dom.continue.hidden = true;
    bottom.append(dom.msg, dom.actions, dom.continue);

    // Card shown at the start of each phase.
    dom.card = el('section', 'panel phase-card');
    dom.card.setAttribute('role', 'dialog');
    dom.cardTitle = el('h2', 'panel-title');
    dom.cardText = el('div', 'phase-text');
    dom.cardGo = button(t('g.opp.continue'), closeCard, 'primary');
    dom.card.append(el('p', 'phase-kicker', t('g.opp.title')), dom.cardTitle, dom.cardText, dom.cardGo);

    api.ui.append(hud, bottom, dom.card);
    dom.hud = hud;
    dom.bottom = bottom;
  }

  // GAME VALUE: 1 to 3 stars from science done and low-power sleeps.
  function stars() {
    if (data >= 4 && faults === 0) return 3;
    return data >= 2 ? 2 : 1;
  }

  // The sky for this turn: its name, the energy it gives, and how dusty it looks.
  function skyNow() {
    if (finalStorm) return { key: 'final', value: SKY.final, dust: Math.min(1, 0.85 + finalTurn * 0.05) };
    if (phase.storm) {
      const value = STORM_WEEKS[Math.min(week, STORM_WEEKS.length - 1)];
      return { key: 'storm', value, dust: 0.62 + -value * 0.045 };
    }
    const key = phase.sky[turn % phase.sky.length];
    return { key, value: SKY[key], dust: key === 'dusty' ? 0.38 : 0 };
  }

  const targetHere = () => !phase.storm && !finalStorm && phase.targets[step] && !studied[step];
  const signed = (v) => (v > 0 ? `+${v}` : v < 0 ? `−${-v}` : '0');

  function say(key, vars) {
    dom.msg.classList.remove('show');
    void dom.msg.offsetWidth;                    // restart the fade
    dom.msg.textContent = t(`g.opp.${key}`, vars);
    dom.msg.classList.add('show');
  }

  // Redraw the HUD and enable only the actions that are possible now.
  function refresh() {
    const sky = skyNow();
    dustTarget = sky.dust;
    dom.fill.style.width = `${energy}%`;
    dom.fill.className = `meter-fill ${energy <= 25 ? 'low' : energy <= 50 ? 'mid' : ''}`;
    dom.energyText.textContent = String(Math.round(energy));
    dom.fill.parentElement.setAttribute('aria-label', `${t('g.opp.energy')}: ${Math.round(energy)} / ${MAX_ENERGY}`);
    dom.dataText.textContent = `${t('g.opp.data')}: ${data} / ${TOTAL_TARGETS}`;
    dom.phaseTitle.textContent = t(`g.opp.${phase.id}.title`);
    dom.sky.textContent = phase.storm ? `${t('g.opp.sky.storm')} · ${t('g.opp.week', { n: Math.min(week + 1, 6) })}` : t(`g.opp.sky.${sky.key}`);
    dom.sky.className = `g-sky ${sky.key}`;
    dom.income.textContent = t('g.opp.thisTurn', { v: signed(sky.value) });

    const idle = state === 'idle';
    const can = {
      drive: energy >= COST.drive && !finalStormOver(),
      science: energy >= COST.science && !!targetHere(),
      rest: true,
    };
    for (const kind in dom.buttons) {
      const b = dom.buttons[kind];
      b.disabled = !idle || !can[kind];
      b.classList.toggle('wanted', idle && kind === 'science' && can.science);
      let note = signed(-COST[kind]);
      if (kind === 'science' && phase.storm) note = t('g.opp.suspended');
      else if (kind === 'science' && !targetHere()) note = t('g.opp.noTarget');
      b.querySelector('.action-cost').textContent = note;
    }
  }
  const finalStormOver = () => state === 'ending' || state === 'done';

  function focusAction(preferred) {
    const order = [preferred, 'rest', 'drive', 'science'];
    const kind = order.find((k) => k && !dom.buttons[k].disabled);
    if (kind) dom.buttons[kind].focus({ preventScroll: true });
  }

  // ---------- phase cards ----------
  function openCard(lines) {
    state = 'card';
    dom.cardTitle.textContent = t(`g.opp.${phase.id}.title`);
    dom.cardText.replaceChildren(...lines.map((key) => el('p', '', t(`g.opp.${key}`))));
    dom.card.hidden = false;
    dom.card.classList.remove('in');
    void dom.card.offsetWidth;
    dom.card.classList.add('in');
    dom.hud.inert = dom.bottom.inert = true;
    refresh();
    dom.cardGo.focus({ preventScroll: true });
  }

  function closeCard() {
    dom.card.hidden = true;
    dom.hud.inert = dom.bottom.inert = false;
    state = 'idle';
    say(phase.storm ? 'stormRest' : targetHere() ? 'target' : 'ready');
    refresh();
    focusAction(phase.storm ? 'rest' : 'drive');
  }

  function startPhase(index, extraLines = []) {
    phaseIndex = index;
    phase = PHASES[index];
    step = 0;
    turn = 0;
    week = 0;
    studied = {};
    if (phase.storm) energy = Math.max(energy, STORM_MIN_ENERGY);
    openCard([...extraLines, `${phase.id}.text`]);
    if (phase.storm) sfx('fail');
  }

  // ---------- one turn ----------
  function act(kind) {
    if (state !== 'idle' || dom.buttons[kind].disabled) return;
    state = 'anim';
    anim = { kind, t: 0, dur: still() ? 0.15 : ANIM[kind], from: scroll };
    sfx(kind === 'drive' ? 'drive' : kind === 'science' ? 'scan' : 'charge');
    refresh();
  }

  function resolve(kind) {
    const before = energy;
    const sky = skyNow();
    let message = null;

    energy -= COST[kind];
    if (kind === 'drive') {
      step++;
      wall = phase.crater ? 1 - step / phase.steps : 0;
    }
    if (kind === 'science') {
      const fact = phase.targets[step];
      studied[step] = true;
      data++;
      message = fact;
      sfx('success');
      burst(ROVER_X + 78, ROVER_FOOT - 6, C.ice);
    }
    energy = clamp(energy + sky.value, 0, MAX_ENERGY);
    turn++;
    showDelta(Math.round(energy - before));

    if (finalStorm) {
      finalTurn++;
      if (energy <= 0) return startEnding();
      message = `final.${Math.min(finalTurn, 3)}`;
      if (!still()) shake.add(0.5);
    } else if (phase.storm) {
      week++;
      if (week === 3) message = 'p3.low';                      // the real low point: 18 July
      if (energy <= 0) message = lowPower();
      if (week >= STORM_WEEKS.length) return startPhase(phaseIndex + 1, ['p3.end']);
      if (!message) message = 'stormRest';
    } else {
      if (kind === 'drive') {
        const milestone = phase.milestones?.[step];
        if (milestone) { message = milestone; sfx('success'); burst(ROVER_X + 24, ROVER_FOOT - 30, C.amber); }
        if (step >= phase.steps) {
          if (phaseIndex === PHASES.length - 1) return startFinalStorm();
          return startPhase(phaseIndex + 1);
        }
      }
      if (!message) message = targetHere() ? 'target' : skyNow().key === 'dusty' ? 'dustyNote' : 'ready';
    }

    state = 'idle';
    say(message);
    refresh();
    focusAction(kind);
  }

  // Out of energy before the final storm: the rover sleeps and recovers.
  function lowPower() {
    faults++;
    energy = FAULT_ENERGY;
    sfx('fail');
    return 'fault';
  }

  function showDelta(v) {
    dom.delta.textContent = signed(v);
    dom.delta.className = `g-delta ${v >= 0 ? 'up' : 'down'}`;
    void dom.delta.offsetWidth;
    dom.delta.classList.add('show');
  }

  function burst(x, y, color) {
    if (still()) return;
    for (let i = 0; i < 16; i++) {
      const a = Math.random() * Math.PI * 2, v = 12 + Math.random() * 30;
      puffs.spawn({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 10, drag: 3, life: 0.5 + Math.random() * 0.5, color: Math.random() < 0.6 ? color : C.star });
    }
  }

  // ---------- the fixed ending ----------
  function startFinalStorm() {
    finalStorm = true;
    finalTurn = 0;
    energy = clamp(energy, FINAL_MIN_ENERGY, FINAL_MAX_ENERGY);
    state = 'idle';
    sfx('fail');
    shake.add(1.2);
    say('final.start');
    refresh();
    focusAction('rest');
  }

  function startEnding() {
    state = 'ending';
    endTime = 0;
    endLine = 0;
    dom.actions.hidden = true;
    dom.hud.classList.add('fade');
    dom.bottom.classList.add('ending');
    refresh();
    sfx('lastSignal');
    drone(false);
    say('end.1');
    endLine = 1;
  }

  // ---------- drawing ----------
  function drawSun() {
    if (dust > 0.97) return;
    const r = dust < 0.3 ? 8 : dust < 0.7 ? 7 : 5;
    const core = dust < 0.2 ? C.star : dust < 0.55 ? C.amber : dust < 0.8 ? C.ember : C.rust;
    const rim = dust < 0.2 ? C.amber : dust < 0.55 ? C.ember : C.rust;
    const alpha = clamp(1.15 - dust);
    for (let y = -r - 1; y <= r + 1; y++) {
      for (let x = -r - 1; x <= r + 1; x++) {
        const d = Math.hypot(x, y);
        if (d <= r - 1.5) px(SUN.x + x, SUN.y + y, core, alpha);
        else if (d <= r + 0.3) px(SUN.x + x, SUN.y + y, rim, alpha * 0.9);
      }
    }
  }

  function drawHills() {
    // Far hills move slowly, the near ridge faster (parallax). Inside the
    // crater the near ridge is a high wall that sinks as the rover climbs out.
    ctx.fillStyle = C.rust;
    ctx.globalAlpha = 0.55;
    for (let x = 0; x < WIDTH; x++) {
      const top = Math.round(GROUND - 9 + hill(x + scroll * 0.12, 1));
      ctx.fillRect(x, top, 1, GROUND + 6 - top);
    }
    ctx.globalAlpha = 1;
    const rise = ease.inOutSine(clamp(wall)) * 34;
    for (let x = 0; x < WIDTH; x++) {
      const top = Math.round(GROUND - 2 - rise + hill(x + scroll * 0.35, 4) * (0.6 + rise * 0.03));
      ctx.fillRect(x, top, 1, GROUND + 6 - top);
    }
  }

  function drawGround() {
    ctx.fillStyle = C.dust;
    ctx.fillRect(0, GROUND + 4, WIDTH, HEIGHT - GROUND - 4);
    // Speckles and rocks scroll with the ground. Things lower on the screen
    // are closer, so they move faster.
    for (let i = 0; i < 150; i++) {
      const y = GROUND + 5 + ((i * 53) % 50);
      const depth = 0.55 + ((y - GROUND) / 50) * 0.6;
      let x = ((i * 97) % 380) - (scroll * depth) % 380;
      if (x < -4) x += 380;
      px(x, y, C.rust, 0.5, 1 + (i % 3 === 0), 1);
    }
    for (let i = 0; i < 6; i++) {
      const y = GROUND + 10 + ((i * 37) % 34);
      let x = ((i * 131 + 40) % 420) - scroll % 420;
      if (x < -8) x += 420;
      px(x, y, C.rust, 1, 5 + (i % 3), 2);
      px(x + 1, y - 1, C.rust, 1, 3 + (i % 3), 1);
    }
  }

  // A science target: a pale rock that sparkles until it has been studied.
  function drawTargets() {
    if (phase.storm) return;
    for (const key in phase.targets) {
      const s = Number(key);
      const x = Math.round(ROVER_X + 70 + s * STEP_PX - scroll);
      if (x < -20 || x > WIDTH + 20) continue;
      const y = ROVER_FOOT - 7;
      const meteorite = phase.targets[key] === 'heatShield';
      px(x + 1, y, meteorite ? C.gray : C.mist, 1, 8, 6);
      px(x, y + 2, meteorite ? C.gray : C.mist, 1, 10, 4);
      px(x + 2, y + 1, meteorite ? C.mist : C.star, 1, 3, 1);
      px(x + 6, y + 3, meteorite ? C.void : C.violet, 0.7, 2, 2);
      if (studied[s]) {
        px(x + 3, y - 6, C.green, 1, 1, 2); px(x + 4, y - 5, C.green, 1, 1, 2); px(x + 5, y - 6, C.green, 1, 1, 2); px(x + 6, y - 7, C.green, 1, 1, 2);
      } else {
        const blink = still() ? 1 : 0.5 + 0.5 * Math.sin(time * 4);
        px(x + 4, y - 7 - Math.round(blink * 2), C.ice, 0.5 + 0.5 * blink, 2, 2);
      }
    }
  }

  // Small map of the track at the top: steps, science targets, the goal.
  function drawTrack() {
    if (phase.storm || state === 'ending' || state === 'done') return;
    const x0 = 118, w = 84, y = 50;
    px(x0 - 7, y - 9, C.deep, 0.85, w + 20, 17);              // dark plate so it reads on any sky
    px(x0, y, C.indigo, 1, w + 1, 1);
    for (let s = 0; s <= phase.steps; s++) {
      const x = x0 + Math.round((s / phase.steps) * w);
      px(x, y - 1, s <= step ? C.amber : C.violet, 1, 1, 3);
      if (phase.targets[s]) px(x - 1, y - 6, studied[s] ? C.green : C.ice, 1, 3, 3);
    }
    px(x0 + w + 2, y - 4, C.star, 1, 1, 6);                   // goal flag
    px(x0 + w + 3, y - 4, C.amber, 1, 3, 2);
    const rx = x0 + ((scroll / STEP_PX) / phase.steps) * w;
    px(rx - 2, y + 3, C.amber, 1, 5, 2);
    px(rx - 1, y + 2, C.amber, 1, 3, 1);
  }

  function drawRover() {
    const driving = anim?.kind === 'drive';
    const hop = driving && !still() ? Math.round(Math.sin(time * 38) * 0.6) : 0;
    const y = ROVER_FOOT - 32 + hop - Math.round(ease.outCubic(bump) * 2);
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = C.void;
    ctx.fillRect(ROVER_X + 4, ROVER_FOOT, 42, 2);
    ctx.globalAlpha = 1;
    drawSprite(SPRITES.opportunity, ROVER_X, y, { scale: 2 });

    // Science: a dotted beam from the camera mast to the target.
    if (anim?.kind === 'science') {
      const k = anim.t / anim.dur;
      const x0 = ROVER_X + 12, y0 = y + 3, x1 = ROVER_X + 75, y1 = ROVER_FOOT - 5;
      for (let i = 0; i < 16; i++) {
        const u = i / 16;
        if (u > k * 1.6) break;
        if ((i + Math.floor(time * 12)) % 2) px(lerp(x0, x1, u), lerp(y0, y1, u), C.ice, 0.9);
      }
    }
    // Rest: the solar panels glitter.
    if (anim?.kind === 'rest' && !still()) {
      for (let i = 0; i < 5; i++) px(ROVER_X + 4 + ((i * 11 + Math.floor(time * 14) * 7) % 40), y + 14 + (i % 2) * 2, C.star, 0.9);
    }
  }

  function drawStorm() {
    if (dust < 0.05) return;
    // A veil of dust over everything, then streaks blowing past.
    ctx.globalAlpha = dust * 0.42;
    ctx.fillStyle = C.rust;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.globalAlpha = 1;
    const count = Math.round(streaks.length * clamp(dust * 1.2));
    for (let i = 0; i < count; i++) {
      const s = streaks[i];
      px(s.x, s.y, i % 3 ? C.dust : C.rust, 0.25 + dust * 0.35, Math.round(s.len), 1);
    }
  }

  // ---------- the instance ----------
  buildUI();
  const offInput = input.on((a) => {
    if (a.type === 'direction' && state === 'idle') arrowNav(dom.actions, a.dx > 0 || a.dy > 0 ? 'ArrowDown' : 'ArrowUp');
  });
  drone(true);
  startPhase(0);

  return {
    update(dt) {
      time += dt;
      dust = lerp(dust, dustTarget, 1 - Math.exp(-2.2 * dt));
      bump = Math.max(0, bump - dt * 3);

      if (state === 'anim') {
        anim.t += dt;
        const k = clamp(anim.t / anim.dur);
        if (anim.kind === 'drive') {
          scroll = anim.from + STEP_PX * ease.inOutSine(k);
          if (!still() && Math.random() < 0.7) {
            // Dust kicked up behind the wheels.
            const wheel = [8, 24, 40][Math.floor(Math.random() * 3)];
            puffs.spawn({
              x: ROVER_X + wheel, y: ROVER_FOOT - 1, vx: -(14 + Math.random() * 22), vy: -(4 + Math.random() * 12),
              drag: 1.5, life: 0.4 + Math.random() * 0.5, color: Math.random() < 0.5 ? C.dust : C.rust, alpha: 0.8,
            });
          }
        } else if (anim.kind === 'rest' && !still() && dust < 0.9 && Math.random() < 0.6 - dust * 0.5) {
          // Sunlight drifting down to the solar panels.
          const tx = ROVER_X + 6 + Math.random() * 36, ty = ROVER_FOOT - 18;
          motes.spawn({ x: SUN.x, y: SUN.y, vx: (tx - SUN.x) / 0.7, vy: (ty - SUN.y) / 0.7, life: 0.7, color: Math.random() < 0.5 ? C.amber : C.star });
        } else if (anim.kind === 'science' && !still() && Math.random() < 0.4) {
          motes.spawn({ x: ROVER_X + 74 + Math.random() * 8, y: ROVER_FOOT - 8, vx: (Math.random() - 0.5) * 8, vy: -(14 + Math.random() * 14), life: 0.6, color: C.ice });
        }
        if (k >= 1) {
          const kind = anim.kind;
          if (kind === 'drive') scroll = anim.from + STEP_PX;
          anim = null;
          bump = 1;
          resolve(kind);
        }
      }

      // Blowing storm dust.
      if (!still()) {
        for (const s of streaks) {
          s.x -= s.v * (0.5 + dust) * dt;
          if (s.x < -12) { s.x = WIDTH + Math.random() * 30; s.y = Math.random() * 150; }
        }
      }
      puffs.update(dt);
      motes.update(dt);

      // The ending plays by itself: three lines, then the button.
      if (state === 'ending') {
        endTime += dt;
        dark = Math.min(1, dark + dt / 6);
        dustTarget = 1;
        if (endLine === 1 && endTime > 4) { say('end.2'); endLine = 2; }
        else if (endLine === 2 && endTime > 8) { say('end.3'); endLine = 3; }
        else if (endLine === 3 && endTime > 10.5) {
          state = 'done';
          dom.continue.hidden = false;
          dom.continue.focus({ preventScroll: true });
        }
      }
    },

    render() {
      ctx.drawImage(skyImage(Math.round(dust * 10)), 0, 0);
      drawSun();
      drawHills();
      drawGround();
      drawTargets();
      drawRover();
      puffs.render();
      motes.render();
      drawStorm();
      // The ending: the picture slowly goes dark around the rover.
      if (dark > 0) {
        ctx.globalAlpha = ease.inOutSine(dark) * 0.8;
        ctx.fillStyle = C.void;
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.globalAlpha = 1;
      }
      drawTrack();
    },

    destroy() {
      offInput();
    },
  };
}
