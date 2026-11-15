// Echo card: a short fact card for one of the six echoes in the hub.
// No portal and no mini-game: a title, a year, three or four facts with
// their sources, and a Back button. Opening it marks the echo as read.

import { C } from '../data/palette.js';
import { ECHO_SPRITES } from '../data/sprites.js';
import { echoes } from '../data/content.en.js';
import { SOURCES } from '../data/sources.js';
import { t } from '../engine/i18n.js';
import { clear, drawSprite, bakeSprite, px, WIDTH } from '../engine/render.js';
import { Starfield, Particles, ease, clamp } from '../engine/fx.js';
import { el, button } from '../engine/ui.js';
import { artFrame } from '../engine/art.js';
import * as scenes from '../engine/scenes.js';
import * as input from '../engine/input.js';
import { sfx, drone } from '../engine/audio.js';
import { save } from '../engine/storage.js';
import { gameState, ECHO_IDS } from '../state.js';

let echo, time, leaving, offInput;
let artShown = false;              // the echo's picture is on the card (then no sprite is drawn)
const stars = new Starfield(100, 61);
const motes = new Particles(60);

// A fact is shown only if all its sources have a citation.
const cited = (fact) => fact.sourceIds.every((id) => SOURCES[id] && !SOURCES[id].needsSource);

function back() {
  if (leaving) return;
  leaving = true;
  scenes.go('hub', { focus: echo.id });
}

export default {
  enter(params, ui) {
    echo = echoes[ECHO_IDS.includes(params.id) ? params.id : ECHO_IDS[0]];
    time = 0;
    leaving = false;
    gameState.echoes[echo.id] = true;
    save();

    const card = el('section', 'panel sci-card echo-card');
    card.setAttribute('aria-label', t(echo.name));
    const head = el('div', 'sci-head');
    head.append(el('span', 'phase-kicker', t('echo.kicker')), el('h2', 'sci-name', [t(echo.name), t(echo.years)].filter(Boolean).join('  ·  ')));
    const body = el('div', 'sci-body');
    body.tabIndex = 0;                         // focusable, so the keyboard can scroll it
    // Four facts are laid out in two columns so the card still fits.
    const facts = echo.facts.filter(cited);
    const list = el('ul', facts.length > 3 ? 'facts two' : 'facts');
    facts.forEach((fact, i) => {
      const item = el('li', 'fact');
      item.style.animationDelay = `${0.2 + i * 0.16}s`;
      item.append(
        el('span', 'fact-text', t(fact.textKey)),
        el('span', 'fact-source', `${t('debrief.source')}: ${fact.sourceIds.map((id) => SOURCES[id].short).join('; ')}`),
      );
      list.append(item);
    });
    body.append(list);
    const done = button(t('echo.back'), back, 'primary wide', 'back');
    // With a picture: the card fills the screen, picture on one side and the
    // facts next to it (on narrow screens the picture goes on top). Without
    // one, or if it fails to load, the small card and the sprite are used.
    artShown = false;
    if (echo.art) {
      artShown = true;
      card.classList.add('with-art');
      list.className = 'facts';
      const row = el('div', 'echo-row');
      row.append(artFrame({
        src: echo.art,
        alt: t(`art.${echo.id}`),
        onFail: () => {
          artShown = false;
          card.classList.remove('with-art');
          list.className = facts.length > 3 ? 'facts two' : 'facts';
          row.replaceWith(body);
        },
      }), body);
      card.append(head, row, done);
    } else {
      card.append(head, body, done);
    }
    ui.append(card);
    done.focus({ preventScroll: true });
    drone(true);
    sfx('success');

    offInput = input.on((a) => { if (a.type === 'back') back(); });
  },

  exit() {
    offInput();
  },

  update(dt) {
    time += dt;
    stars.update(dt, 1.5);
    if (!gameState.settings.reducedMotion && Math.random() < 0.1) {
      motes.spawn({ x: Math.random() * WIDTH, y: 62, vx: (Math.random() - 0.5) * 6, vy: -(4 + Math.random() * 8), life: 3, color: Math.random() < 0.5 ? C.ice : C.violet, alpha: 0.5 });
    }
    motes.update(dt);
  },

  render() {
    const still = gameState.settings.reducedMotion;
    clear();
    stars.render();
    motes.render();
    if (artShown) return;
    // The echo, large, floating above the card. It fades in like a memory.
    const img = bakeSprite(ECHO_SPRITES[echo.id]);
    const scale = 5;
    const w = img.width * scale, h = img.height * scale;
    const y = 32 - h / 2 + (still ? 0 : Math.sin(time * 0.9) * 2);
    px(WIDTH / 2 - 34, 58, C.ice, 0.35, 68, 1);
    drawSprite(ECHO_SPRITES[echo.id], (WIDTH - w) / 2, y, { scale, alpha: 0.35 + 0.5 * ease.outCubic(clamp(time / 1.2)) });
  },
};
