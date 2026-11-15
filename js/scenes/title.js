// Title screen: logo, tagline, menu and options panel.
// The canvas shows a quiet scene: parallax stars, a distant black hole and
// the astronaut drifting with a small thruster glow.

import { C } from '../data/palette.js';
import { SPRITES } from '../data/sprites.js';
import { t } from '../engine/i18n.js';
import { clear, drawSprite, ctx, WIDTH, HEIGHT } from '../engine/render.js';
import { Starfield, Particles, shake, lerp } from '../engine/fx.js';
import { el, button, arrowNav } from '../engine/ui.js';
import * as scenes from '../engine/scenes.js';
import * as input from '../engine/input.js';
import { sfx, drone } from '../engine/audio.js';
import { gameState } from '../state.js';
import { createOptions } from './options.js';

const ASTRO = { x: 58, y: 82 };       // astronaut resting position (game pixels)
const HOLE = { x: 226, y: 34 };       // top-left corner of the black hole picture

let stars, dust, glow;                // canvas effects
let time = 0;
let parallax = { x: 0, y: 0, tx: 0, ty: 0 };   // current and target star offset
let holeImage = null;
let dom = {};                         // references to DOM nodes we update
let options = null;                   // the options panel
let offInput = null;

// Draw the distant black hole once into a small canvas.
// Stylized: a dark disc, a thin bright ring of bent light around it, and a
// tilted accretion disk that is brighter on the side moving toward us.
function bakeBlackHole() {
  const w = 72, h = 44, cx = 36, cy = 22;
  const img = document.createElement('canvas');
  img.width = w;
  img.height = h;
  const g = img.getContext('2d');
  const shades = [C.rust, C.ember, C.amber, C.star];
  const dot = (x, y, color, alpha = 1) => {
    g.globalAlpha = alpha;
    g.fillStyle = color;
    g.fillRect(x, y, 1, 1);
  };
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = x - cx + 0.5, dy = y - cy + 0.5;
      const r = Math.hypot(dx, dy);
      const side = 0.5 - (0.5 * dx) / 32;                    // 1 on the left, 0 on the right
      const disk = Math.hypot(dx / 32, dy / 5.5);            // 1 at the disk's outer edge
      const onDisk = disk < 1 && disk > 0.36;
      const shade = (b) => shades[Math.max(0, Math.min(3, Math.floor(b * 4)))];

      if (onDisk && (dy >= 0 || r > 9.5)) {
        // Accretion disk. The half in front of the hole covers it.
        const dither = (x + y) % 2 ? 0.08 : 0;
        dot(x, y, shade((1 - disk) * 0.55 + side * 0.6 + dither));
      } else if (r < 8.5) {
        dot(x, y, C.void);                                   // the dark shadow
      } else if (r < 10) {
        dot(x, y, shade(0.45 + side * 0.5));                 // ring of bent light
      } else if (r < 12.5 && dy < 0) {
        dot(x, y, shade(side * 0.5), 0.75);                  // far side of the disk, bent over the top
      } else if (r < 17) {
        dot(x, y, C.indigo, 0.22 * (1 - (r - 10) / 7));      // soft halo
      }
    }
  }
  return img;
}

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
  dom = { root, menu, optionsButton, notice };
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
        x: ASTRO.x + 6, y: bobY() + 15, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
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

const bobY = () => ASTRO.y + Math.sin(time * 0.9) * 3;

export default {
  enter(_params, ui) {
    time = 0;
    stars = new Starfield(120, 11);
    dust = new Particles(40);
    glow = new Particles(80);
    holeImage ??= bakeBlackHole();
    buildUI(ui);

    drone(true);

    offInput = input.on((a) => {
      if (a.type === 'back') options.close();
      else if (a.type === 'direction') arrowNav(options.isOpen() ? options.panel : dom.menu, a.dy > 0 || a.dx > 0 ? 'ArrowDown' : 'ArrowUp');
      else if (a.type === 'pointer') {
        // The stars shift slightly with the pointer for a feeling of depth.
        parallax.tx = (a.x / WIDTH - 0.5) * -10;
        parallax.ty = (a.y / HEIGHT - 0.5) * -6;
      }
    });
  },

  exit() {
    offInput();
  },

  update(dt) {
    const still = gameState.settings.reducedMotion;
    if (!still) time += dt;
    stars.update(dt, 1.5);
    parallax.x = still ? 0 : lerp(parallax.x, parallax.tx, 1 - Math.exp(-5 * dt));
    parallax.y = still ? 0 : lerp(parallax.y, parallax.ty, 1 - Math.exp(-5 * dt));

    if (!still) {
      // Slow dust motes drifting across the screen.
      if (Math.random() < 0.05) {
        dust.spawn({
          x: WIDTH + 2, y: Math.random() * HEIGHT, vx: -(6 + Math.random() * 10), vy: (Math.random() - 0.5) * 3,
          life: 12, color: Math.random() < 0.5 ? C.violet : C.mist, alpha: 0.35,
        });
      }
      // Small thruster glow under the astronaut's backpack.
      if (Math.random() < 0.35) {
        glow.spawn({
          x: ASTRO.x + 5 + Math.random() * 2, y: bobY() + 16, vx: (Math.random() - 0.5) * 5, vy: 9 + Math.random() * 8,
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
    const pulse = 0.92 + 0.08 * Math.sin(time * 0.7);
    ctx.globalAlpha = pulse;
    ctx.drawImage(holeImage, Math.round(HOLE.x + parallax.x * 0.2), Math.round(HOLE.y + parallax.y * 0.2));
    ctx.globalAlpha = 1;
    dust.render();
    glow.render();
    drawSprite(SPRITES.astronaut, ASTRO.x + Math.sin(time * 0.5) * 2, bobY());
  },
};
