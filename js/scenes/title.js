// Title screen: logo, tagline, menu and options panel.
// The canvas is a small living scene: a parallax starfield that shifts with
// the pointer, a black hole that reacts to the START button and to clicks,
// and the astronaut, who floats over to the menu button that has the focus.

import { C } from '../data/palette.js';
import { SPRITES } from '../data/sprites.js';
import { t } from '../engine/i18n.js';
import { clear, px, ctx, bakeSprite, WIDTH, HEIGHT } from '../engine/render.js';
import { Starfield, Particles, shake, ease, lerp, clamp } from '../engine/fx.js';
import { el, button, arrowNav } from '../engine/ui.js';
import * as scenes from '../engine/scenes.js';
import * as input from '../engine/input.js';
import { sfx, drone } from '../engine/audio.js';
import { gameState } from '../state.js';
import { createOptions } from './options.js';
import { renderBlackHole } from './intro.js';

const HOME = { x: 58, y: 86 };        // where the astronaut rests (game pixels)
const HOLE = { x: 262, y: 58, rs: 7 };          // black hole center and shadow radius
const HOLE_CLICK = 30;                // GAME VALUE: a click this close to the hole makes a ripple
const FOLLOW = 11;                    // GAME VALUE: pull toward her target
const FOLLOW_DRAG = 5;                // GAME VALUE: damping (gives the inertia)
const RIPPLE_TIME = 1.1;              // seconds a lensing ripple lasts

let stars, dust, glow;                // canvas effects
let time = 0;
let diskClock = 0;                    // drives the spin of the accretion disk
let boost = 0;                        // 0..1: START is hovered or focused
let parallax = { x: 0, y: 0, tx: 0, ty: 0 };   // current and target star offset
const astro = { x: HOME.x, y: HOME.y, vx: 0, vy: 0, facing: false };
let ripples = [];                     // [{ t }] lensing ripples in progress
let dom = {};                         // references to DOM nodes we update
let options = null;                   // the options panel
let offInput = null;

const still = () => gameState.settings.reducedMotion;
// A gentle bob, kept even with reduced motion.
const bob = () => Math.sin(time * 0.9) * (still() ? 1.5 : 3);

// ---------- DOM ----------

function buildUI(ui) {
  const root = el('div', 'title');

  // Logo: one <span> per letter so the letters can rise in one by one.
  const logo = el('h1', 'logo');
  const text = t('title.logo');
  logo.setAttribute('aria-label', text);
  [...text].forEach((ch, i) => {
    const s = el('span', ch === ' ' ? 'gap' : '', ch);
    s.setAttribute('aria-hidden', 'true');
    s.style.animationDelay = `${0.25 + i * 0.045}s`;
    logo.append(s);
  });

  const tagline = el('p', 'tagline', t('title.tagline'));

  const menu = el('nav', 'menu');
  const start = button(t('title.start'), () => openScene('intro', true), 'primary');
  const optionsButton = button(t('title.options'), () => { showOptions(true); options.open(); });
  const credits = button(t('title.credits'), () => openScene('credits', false));
  menu.append(start, optionsButton, credits);

  const notice = el('p', 'notice');
  notice.setAttribute('aria-live', 'polite');

  root.append(logo, tagline, menu, notice);

  // Options panel (hidden until opened).
  options = createOptions({
    onClose: () => showOptions(false),
    onLanguage: () => { ui.replaceChildren(); buildUI(ui); showOptions(true); options.open(); },
  });

  ui.append(root, options.panel);
  dom = { root, menu, start, optionsButton, notice };
  start.focus({ preventScroll: true });
}

// Dim the menu while the options panel is open, and give the focus back after.
function showOptions(open) {
  dom.root.classList.toggle('dimmed', open);
  dom.root.inert = open;                         // menu behind the panel cannot be focused
  if (!open) dom.optionsButton.focus({ preventScroll: true });
}

// Go to another scene, or say so if that scene is not built yet.
function openScene(name, withBurst) {
  if (withBurst) {
    shake.add(1.5);
    sfx('whoosh');
    for (let i = 0; i < 14; i++) {
      const a = Math.PI * (0.25 + 0.5 * Math.random());      // downward cone
      const v = 14 + Math.random() * 26;
      glow.spawn({
        x: astro.x, y: astro.y + bob() + 7, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
        life: 0.5 + Math.random() * 0.5, color: Math.random() < 0.5 ? C.amber : C.ember, drag: 2,
      });
    }
  }
  if (!scenes.go(name)) {
    dom.notice.textContent = t('title.notReady');
    dom.notice.classList.remove('show');
    void dom.notice.offsetWidth;                 // restart the fade animation
    dom.notice.classList.add('show');
  }
}

// ---------- canvas ----------

// Where the astronaut wants to be: next to the menu button that has the focus
// (or is hovered, since hovering focuses it), or her resting spot.
function targetSpot() {
  const active = document.activeElement;
  if (!options.isOpen() && active instanceof HTMLElement && dom.menu.contains(active)) {
    const stage = document.getElementById('stage').getBoundingClientRect();
    const r = active.getBoundingClientRect();
    return {
      x: ((r.left - stage.left) / stage.width) * WIDTH - 12,
      y: ((r.top + r.height / 2 - stage.top) / stage.height) * HEIGHT,
      start: active === dom.start,
    };
  }
  return { x: HOME.x, y: HOME.y, start: false };
}

// A lensing ripple: rings of bent starlight that spread out from the hole.
function drawRipples() {
  for (const ripple of ripples) {
    const k = ripple.t / RIPPLE_TIME;
    for (let ring = 0; ring < 2; ring++) {
      const radius = HOLE.rs * (1.6 + (k * 6 + ring * 1.3));
      const steps = Math.round(radius * 2.2);
      for (let i = 0; i < steps; i++) {
        // Broken arcs, like stretched images of stars, not a solid circle.
        if ((i + ring * 3) % 5 > 2) continue;
        const a = (i / steps) * Math.PI * 2 + k * (ring ? -1.4 : 1.4);
        px(HOLE.x + Math.cos(a) * radius, HOLE.y + Math.sin(a) * radius * 0.8, ring ? C.ice : C.star, (1 - k) * (ring ? 0.6 : 0.9));
      }
    }
  }
}

export default {
  enter(_params, ui) {
    time = 0;
    boost = 0;
    ripples = [];
    Object.assign(astro, { x: HOME.x, y: HOME.y, vx: 0, vy: 0, facing: false });
    stars = new Starfield(140, 11);
    dust = new Particles(40);
    glow = new Particles(90);
    buildUI(ui);
    drone(true);

    offInput = input.on((a) => {
      if (a.type === 'back') options.close();
      // Arrows or W/S move between the buttons (the focus change plays the blip).
      else if (a.type === 'direction') arrowNav(options.isOpen() ? options.panel : dom.menu, a.dy > 0 || a.dx > 0 ? 'ArrowDown' : 'ArrowUp');
      else if (a.type === 'pointer') {
        // The stars shift slightly with the pointer for a feeling of depth.
        parallax.tx = (a.x / WIDTH - 0.5) * -12;
        parallax.ty = (a.y / HEIGHT - 0.5) * -7;
      } else if (a.type === 'confirm' && a.fromPointer && !options.isOpen() && Math.hypot(a.x - HOLE.x, a.y - HOLE.y) < HOLE_CLICK) {
        // A click on the black hole: a soft sound and, unless motion is reduced, a ripple.
        sfx('ripple');
        if (!still()) {
          ripples.push({ t: 0 });
          shake.add(0.8);
        }
      }
    });
  },

  exit() {
    offInput();
  },

  update(dt) {
    time += dt;
    const reduced = still();
    stars.update(dt, 1.5);
    parallax.x = reduced ? 0 : lerp(parallax.x, parallax.tx, 1 - Math.exp(-5 * dt));
    parallax.y = reduced ? 0 : lerp(parallax.y, parallax.ty, 1 - Math.exp(-5 * dt));

    // The astronaut drifts to her target with a soft spring (inertia), and puffs
    // her thrusters while she speeds up. Reduced motion keeps this, at low intensity.
    const target = targetSpot();
    const ax = (target.x - astro.x) * FOLLOW, ay = (target.y - astro.y) * FOLLOW;
    astro.vx += (ax - astro.vx * FOLLOW_DRAG) * dt;
    astro.vy += (ay - astro.vy * FOLLOW_DRAG) * dt;
    astro.x += astro.vx * dt;
    astro.y += astro.vy * dt;
    if (Math.abs(astro.vx) > 4) astro.facing = astro.vx < 0;
    else if (Math.hypot(astro.vx, astro.vy) < 3) astro.facing = false;      // at rest she looks toward the menu
    const push = Math.hypot(ax, ay);
    if (push > 70 && Math.random() < (reduced ? 0.25 : 0.6)) {
      glow.spawn({
        x: astro.x - (ax / push) * 5, y: astro.y + bob() - (ay / push) * 6, vx: -(ax / push) * (16 + Math.random() * 20), vy: -(ay / push) * (16 + Math.random() * 20),
        drag: 2.5, life: 0.3 + Math.random() * 0.35, color: Math.random() < 0.55 ? C.amber : C.ember, alpha: 0.9,
      });
    }

    // START hovered or focused: the hole glows and its disk spins faster.
    boost = lerp(boost, target.start ? 1 : 0, 1 - Math.exp(-4 * dt));
    diskClock += dt * (reduced ? 0.4 + boost * 0.6 : 1 + boost * 2.6);
    ripples = ripples.filter((r) => (r.t += dt) < RIPPLE_TIME);

    {
      // Slow dust motes drifting across the screen (fewer with reduced motion).
      if (Math.random() < (reduced ? 0.015 : 0.05)) {
        dust.spawn({
          x: WIDTH + 2, y: Math.random() * HEIGHT, vx: -(6 + Math.random() * 10), vy: (Math.random() - 0.5) * 3,
          life: 12, color: Math.random() < 0.5 ? C.violet : C.mist, alpha: 0.35,
        });
      }
      // A small idle thruster glow under her backpack.
      if (Math.random() < (reduced ? 0.1 : 0.25)) {
        glow.spawn({
          x: astro.x - 1 + Math.random() * 2, y: astro.y + bob() + 8, vx: (Math.random() - 0.5) * 5, vy: 9 + Math.random() * 8,
          life: 0.5 + Math.random() * 0.4, color: Math.random() < 0.6 ? C.amber : C.ember, alpha: 0.9,
        });
      }
    }
    dust.update(dt);
    glow.update(dt);
  },

  render() {
    clear();
    stars.render(parallax.x, parallax.y);
    // The black hole is far away, so it moves less than the nearest stars.
    const hx = HOLE.x + parallax.x * 0.2, hy = HOLE.y + parallax.y * 0.2;
    // Its glow: a soft halo that grows with `boost` and during a ripple.
    const flare = clamp(boost * (still() ? 0.6 : 1) + (ripples.length ? 0.6 : 0));
    if (flare > 0.02) {
      for (let ring = 0; ring < 3; ring++) {
        const radius = HOLE.rs * (2.2 + ring * 0.9), steps = Math.round(radius * 3);
        for (let i = 0; i < steps; i++) {
          const a = (i / steps) * Math.PI * 2;
          if ((i + ring) % 2) px(hx + Math.cos(a) * radius, hy + Math.sin(a) * radius * 0.55, ring ? C.ember : C.amber, flare * (0.5 - ring * 0.14));
        }
      }
    }
    ctx.drawImage(renderBlackHole(hx, hy, HOLE.rs * (1 + 0.06 * ease.inOutSine(flare)), diskClock), 0, 0);
    drawRipples();
    dust.render();
    glow.render();

    // The astronaut, turned toward the way she is flying.
    const img = bakeSprite(SPRITES.astronaut);
    ctx.save();
    ctx.translate(Math.round(astro.x), Math.round(astro.y + bob()));
    ctx.scale(astro.facing ? -1 : 1, 1);
    ctx.drawImage(img, -6, -8);
    ctx.restore();
  },
};
