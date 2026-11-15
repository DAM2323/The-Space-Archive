// Science Room: one short card per machine that links its engineering to
// what it gave us. Every line names its sources, and a line is only shown
// when all of its sources have a citation.

import { C } from '../data/palette.js';
import { SPRITES } from '../data/sprites.js';
import { machines, science } from '../data/content.en.js';
import { SOURCES } from '../data/sources.js';
import { t } from '../engine/i18n.js';
import { clear, drawSprite, bakeSprite, px, WIDTH } from '../engine/render.js';
import { Starfield, Particles, clamp } from '../engine/fx.js';
import { el, button } from '../engine/ui.js';
import * as scenes from '../engine/scenes.js';
import * as input from '../engine/input.js';
import { sfx, drone } from '../engine/audio.js';
import { gameState } from '../state.js';

const ORDER = ['lrv', 'pioneer10', 'sojourner', 'opportunity', 'ingenuity'];   // by era, oldest first
const LABELS = ['science.machine', 'science.result'];

let page, time, slide, dom, offInput;
const stars = new Starfield(100, 41);
const motes = new Particles(60);

const cited = (line) => line.sourceIds.every((id) => SOURCES[id] && !SOURCES[id].needsSource);

function show(index, direction = 1) {
  page = (index + ORDER.length) % ORDER.length;
  slide = direction;                         // the machine picture slides in from that side
  const id = ORDER[page];
  const m = machines[id];
  dom.name.textContent = [t(m.name), t(m.years)].filter(Boolean).join('  ·  ');
  dom.page.textContent = t('science.page', { n: page + 1, total: ORDER.length });

  const lines = science[id].filter(cited);
  if (!lines.length) {
    dom.body.replaceChildren(el('p', 'card-pending', t('science.pending')));
  } else {
    dom.body.replaceChildren(...lines.map((line, i) => {
      const row = el('div', 'sci-row');
      row.style.animationDelay = `${0.1 + i * 0.15}s`;
      row.append(
        el('span', 'sci-label', t(LABELS[i] ?? LABELS[1])),
        el('span', 'fact-text', t(line.textKey)),
        el('span', 'fact-source', `${t('debrief.source')}: ${line.sourceIds.map((s) => SOURCES[s].short).join('; ')}`),
      );
      return row;
    }));
  }
  dom.card.classList.remove('turn');
  void dom.card.offsetWidth;                 // restart the small page-turn animation
  dom.card.classList.add('turn');
}

export default {
  enter(_params, ui) {
    time = 0;
    const card = el('section', 'panel sci-card');
    card.setAttribute('aria-label', t('science.title'));
    const head = el('div', 'sci-head');
    const name = el('h2', 'sci-name');
    name.setAttribute('aria-live', 'polite');
    head.append(el('span', 'phase-kicker', t('science.title')), name);
    const body = el('div', 'sci-body');
    body.tabIndex = 0;                         // focusable, so the keyboard can scroll it
    const nav = el('div', 'sci-nav');
    const prev = button(`◀ ${t('science.prev')}`, () => show(page - 1, -1), 'small');
    const pageText = el('span', 'sci-page');
    const next = button(`${t('science.next')} ▶`, () => show(page + 1, 1), 'small primary');
    nav.append(prev, pageText, next);
    const foot = el('div', 'sci-nav');
    foot.append(
      button(t('science.credits'), () => scenes.go('credits', { from: 'science' }), 'small'),
      button(t('science.back'), () => scenes.go('hub'), 'small', 'back'),
    );
    card.append(head, body, nav, foot);
    ui.append(card);
    dom = { card, name, body, page: pageText };

    show(0);
    next.focus({ preventScroll: true });
    drone(true);
    offInput = input.on((a) => {
      if (a.type === 'direction' && a.dx) { sfx('select'); show(page + a.dx, a.dx); }
      else if (a.type === 'back') { sfx('back'); scenes.go('hub'); }
    });
  },

  exit() {
    offInput();
  },

  update(dt) {
    const still = gameState.settings.reducedMotion;
    time += dt;
    stars.update(dt, 1.5);
    slide *= Math.exp(-7 * dt);
    if (!still && Math.random() < 0.1) {
      motes.spawn({ x: Math.random() * WIDTH, y: 64, vx: (Math.random() - 0.5) * 6, vy: -(4 + Math.random() * 8), life: 3, color: Math.random() < 0.5 ? C.ice : C.violet, alpha: 0.5 });
    }
    motes.update(dt);
  },

  render() {
    const still = gameState.settings.reducedMotion;
    clear();
    stars.render();
    motes.render();
    // The machine of this page, large, floating above the card.
    const id = ORDER[page];
    const img = bakeSprite(SPRITES[id]);
    const w = img.width * 3, h = img.height * 3;
    const x = (WIDTH - w) / 2 + (still ? 0 : slide * 60);
    const y = 34 - h / 2 + (still ? 0 : Math.sin(time * 0.9) * 2);
    px(WIDTH / 2 - 40, 60, C.violet, 0.5, 80, 1);                 // a small "pedestal" line
    px(WIDTH / 2 - 26, 62, C.indigo, 0.5, 52, 1);
    drawSprite(SPRITES[id], x, y, { scale: 3, alpha: clamp(1 - Math.abs(slide)) });
    // Completed machines get their stars shown as small lights.
    const n = gameState.stars[id];
    for (let i = 0; i < 3; i++) px(WIDTH / 2 - 8 + i * 7, 65, i < n ? C.amber : C.night, 1, 3, 3);
  },
};
