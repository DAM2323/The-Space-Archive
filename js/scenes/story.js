// Story scene: 3 to 5 narrated beats for one machine, typed out in a dialogue
// box, with the machine shown in its world. Then the machine's mini-game,
// or the debrief card for machines that have none.

import { C } from '../data/palette.js';
import { SPRITES } from '../data/sprites.js';
import { machines } from '../data/content.en.js';
import { t } from '../engine/i18n.js';
import { ctx, clear, px, drawSprite, bakeSprite, WIDTH, HEIGHT } from '../engine/render.js';
import { Starfield, Particles, ease, clamp } from '../engine/fx.js';
import { el, button } from '../engine/ui.js';
import { artBackdrop } from '../engine/art.js';
import * as scenes from '../engine/scenes.js';
import * as input from '../engine/input.js';
import { sfx } from '../engine/audio.js';
import { gameState } from '../state.js';
import { MINIGAMES } from '../minigames/index.js';

const CHARS_PER_SECOND = 42;      // typewriter speed
const HORIZON = 84;               // y of the horizon line for ground scenes
const GROUND_Y = 104;             // where the machine's wheels touch the ground

let machine, beat, typed, full, time, bump, leaving;
let artOn = false;                 // the machine's picture is the backdrop (then no sprite is drawn)
let dom, offInput;
const stars = new Starfield(90, 5);
const motes = new Particles(70);

// ---------- backdrop (also used, dimmed, by the debrief card) ----------

// Height of the distant hills at column x (a few sine waves, fixed shape).
const hill = (x, seed) => Math.sin(x * 0.045 + seed) * 5 + Math.sin(x * 0.11 + seed * 2) * 2.5 + Math.sin(x * 0.02 + seed) * 4;

export function drawBackdrop(env, clock, still) {
  clear();
  stars.render();
  if (env === 'space') return;
  const mars = env === 'mars';
  const far = mars ? C.rust : C.gray;
  const near = mars ? C.dust : C.mist;
  const dark = mars ? C.rust : C.gray;

  // Soft band of light on the horizon (dithered).
  for (let y = HORIZON - 26; y < HORIZON; y++) {
    const k = (y - (HORIZON - 26)) / 26;
    for (let x = (y & 1); x < WIDTH; x += 2) {
      if (k > 0.35 + ((x * 7 + y * 13) % 10) / 16) px(x, y, mars ? C.rust : C.indigo, 0.5);
    }
  }
  // Distant hills, then the ground.
  ctx.fillStyle = far;
  for (let x = 0; x < WIDTH; x++) {
    const top = Math.round(HORIZON - 6 + hill(x, mars ? 1 : 4));
    ctx.globalAlpha = 0.7;
    ctx.fillRect(x, top, 1, HORIZON + 8 - top);
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = near;
  ctx.fillRect(0, HORIZON + 6, WIDTH, HEIGHT - HORIZON - 6);
  // Ground texture: darker speckles and a few rocks, denser toward the viewer.
  for (let i = 0; i < 260; i++) {
    const x = (i * 97) % WIDTH, y = HORIZON + 7 + ((i * 53) % (HEIGHT - HORIZON - 7));
    px(x, y, dark, 0.55, 1 + (i % 3 === 0), 1);
  }
  for (let i = 0; i < 9; i++) {
    const x = (i * 71 + 20) % WIDTH, y = HORIZON + 12 + ((i * 37) % 60);
    px(x, y, dark, 1, 4 + (i % 3), 2);
    px(x + 1, y - 1, dark, 1, 2 + (i % 3), 1);
    px(x + 1, y - 1, C.star, 0.25, 1, 1);
  }
  // Wind-blown dust on Mars.
  if (mars && !still) {
    for (let i = 0; i < 14; i++) {
      const x = (i * 61 + clock * (18 + (i % 5) * 6)) % (WIDTH + 30) - 15;
      const y = HORIZON + 4 + ((i * 29) % 30);
      px(x, y, C.dust, 0.35, 5 + (i % 4), 1);
    }
  }
}

// ---------- text ----------

function showBeat(index) {
  beat = index;
  full = t(machine.beats[beat].textKey);
  typed = gameState.settings.reducedMotion ? full.length : 0;
  bump = 1;
  dom.text.textContent = full.slice(0, Math.floor(typed));
  dom.reader.textContent = full;                 // full sentence for screen readers
  dom.dots.replaceChildren(...machine.beats.map((_, i) => el('span', i === beat ? 'dot on' : i < beat ? 'dot seen' : 'dot')));
  dom.box.classList.toggle('typing', typed < full.length);
}

function advance() {
  if (leaving) return;
  if (typed < full.length) {
    // First press finishes the line, the next press moves on.
    typed = full.length;
    dom.text.textContent = full;
    dom.box.classList.remove('typing');
    return;
  }
  sfx('select');
  if (beat < machine.beats.length - 1) {
    showBeat(beat + 1);
  } else {
    // After the last beat: the mini-game if this machine has one, else the card.
    leaving = true;
    scenes.go(MINIGAMES[machine.id] ? 'game' : 'debrief', { machine: machine.id });
  }
}

function leave() {
  if (leaving) return;
  leaving = true;
  sfx('back');
  scenes.go('portal', { machine: machine.id, reverse: true }, { duration: 0.25 });
}

export default {
  enter(params, ui) {
    machine = machines[params.machine] ?? machines.opportunity;
    time = 0;
    leaving = false;
    motes.list.length = 0;

    const box = el('div', 'dialogue');
    const name = el('p', 'dialogue-name', [t(machine.name), t(machine.years)].filter(Boolean).join('  ·  '));
    const text = el('p', 'dialogue-text');
    text.setAttribute('aria-hidden', 'true');
    const reader = el('p', 'sr-only');
    reader.setAttribute('aria-live', 'polite');
    const foot = el('div', 'dialogue-foot');
    const dots = el('div', 'dots');
    const next = button(t('story.next'), advance, 'small primary next', '');
    foot.append(dots, next);
    box.append(name, text, reader, foot);
    // The machine's picture fills the scene behind the dialogue box, with a dark
    // gradient under the text. Without a picture (or if it fails to load) the
    // drawn backdrop and the pixel sprite are used instead.
    artOn = false;
    if (machine.art) {
      artOn = true;
      ui.append(artBackdrop({ src: machine.art, alt: t(`art.${machine.id}`), onFail: () => { artOn = false; } }));
    }
    ui.append(button(t('story.leave'), leave, 'small corner-top', ''), box);
    dom = { box, text, reader, dots, next };

    showBeat(0);
    next.focus({ preventScroll: true });
    offInput = input.on((a) => {
      if (a.type === 'confirm') advance();
      else if (a.type === 'back') leave();
    });
  },

  exit() {
    offInput();
  },

  update(dt) {
    const still = gameState.settings.reducedMotion;
    time += dt;
    stars.update(dt, machine.env === 'space' ? 3 : 0.3);
    bump = Math.max(0, bump - dt * 3);

    // Typewriter, with a soft tick every few letters.
    if (typed < full.length) {
      const before = Math.floor(typed);
      typed = Math.min(full.length, typed + CHARS_PER_SECOND * dt);
      const now = Math.floor(typed);
      if (now !== before) {
        dom.text.textContent = full.slice(0, now);
        if (now % 3 === 0 && full[now - 1] !== ' ') sfx('tick');
        if (now === full.length) dom.box.classList.remove('typing');
      }
    }

    // Floating specks: dust in the air on the ground, slow sparkles in space.
    if (!still && Math.random() < 0.12) {
      const space = machine.env === 'space';
      motes.spawn({
        x: space ? WIDTH + 2 : -2, y: Math.random() * (space ? HEIGHT : GROUND_Y),
        vx: space ? -(8 + Math.random() * 14) : 10 + Math.random() * 16, vy: (Math.random() - 0.5) * 4,
        life: 10, color: space ? C.mist : machine.env === 'mars' ? C.dust : C.gray, alpha: 0.4,
      });
    }
    motes.update(dt);
  },

  render() {
    const still = gameState.settings.reducedMotion;
    drawBackdrop(machine.env, time, still);
    motes.render();

    // The picture already shows the machine, so no sprite is drawn over it.
    if (artOn) return;

    // The machine, three times larger than in the hub.
    const img = bakeSprite(SPRITES[machine.id]);
    const scale = 3;
    const w = img.width * scale, h = img.height * scale;
    const slide = still ? 0 : (1 - ease.outCubic(clamp(time / 0.9))) * 40;       // rolls in at the start
    const hop = still ? 0 : -Math.round(ease.outCubic(bump) * 3);                // small nod on each new beat
    let x = (WIDTH - w) / 2 - slide, y = GROUND_Y - h + hop;
    if (machine.env === 'space') {
      y = 58 - h / 2 + (still ? 0 : Math.sin(time * 0.7) * 4) + hop;
    } else {
      // Shadow on the ground.
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = C.void;
      ctx.fillRect(Math.round(x) + 4, GROUND_Y, w - 8, 2);
      ctx.globalAlpha = 1;
    }
    drawSprite(SPRITES[machine.id], x, y, { scale, alpha: clamp(time / 0.5) });
  },
};
