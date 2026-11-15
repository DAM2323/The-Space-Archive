// Wall of Names: the remaining official resources of the challenge, each with
// a short description and its own source.

import { C } from '../data/palette.js';
import { wall } from '../data/content.en.js';
import { SOURCES } from '../data/sources.js';
import { t } from '../engine/i18n.js';
import { clear, px, WIDTH, HEIGHT } from '../engine/render.js';
import { Starfield } from '../engine/fx.js';
import { el, button } from '../engine/ui.js';
import { artFrame } from '../engine/art.js';
import * as scenes from '../engine/scenes.js';
import * as input from '../engine/input.js';
import { sfx, drone } from '../engine/audio.js';
import { gameState } from '../state.js';

let time, offInput, scroller;
const stars = new Starfield(120, 71);

export default {
  enter(_params, ui) {
    time = 0;
    const card = el('section', 'panel credits wall');
    card.setAttribute('aria-label', t('wall.title'));
    scroller = el('div', 'credits-scroll');
    scroller.tabIndex = 0;                     // focusable, so the keyboard can scroll it
    const list = el('ul', 'wall-list');
    wall.forEach((entry, i) => {
      const item = el('li', 'wall-item');
      item.style.animationDelay = `${0.15 + i * 0.12}s`;
      const words = el('div', 'wall-words');
      words.append(
        el('span', 'wall-name', t(entry.name)),
        el('span', 'fact-text', t(entry.textKey)),
        el('span', 'fact-source', `${t('debrief.source')}: ${SOURCES[entry.sourceId].short}`),
      );
      // A small picture beside the entries that have one.
      if (entry.art) {
        item.classList.add('has-art');
        item.append(artFrame({ src: entry.art, alt: t(`art.${entry.id}`), onFail: () => item.classList.remove('has-art') }));
      }
      item.append(words);
      list.append(item);
    });
    scroller.append(
      el('p', 'credits-text wall-intro', t('wall.intro')),
      list,
    );
    const back = button(t('wall.back'), () => scenes.go('hub'), 'primary wide', 'back');
    card.append(el('h2', 'panel-title', t('wall.title')), scroller, back);
    ui.append(card);
    back.focus({ preventScroll: true });
    drone(true);

    offInput = input.on((a) => {
      if (a.type === 'back') { sfx('back'); scenes.go('hub'); }
      else if (a.type === 'direction' && a.dy) scroller.scrollBy({ top: a.dy * scroller.clientHeight * 0.5, behavior: gameState.settings.reducedMotion ? 'auto' : 'smooth' });
    });
  },

  exit() {
    offInput();
  },

  update(dt) {
    time += dt;
    stars.update(dt, 2);
  },

  render() {
    clear();
    stars.render();
    // Faint columns of light on both sides, like a wall catching starlight.
    const still = gameState.settings.reducedMotion;
    for (let i = 0; i < 6; i++) {
      const glow = 0.12 + (still ? 0 : 0.06 * Math.sin(time * 0.8 + i));
      px(4 + i * 2, 20 + i * 6, C.violet, glow, 1, HEIGHT - 40 - i * 12);
      px(WIDTH - 5 - i * 2, 20 + i * 6, C.violet, glow, 1, HEIGHT - 40 - i * 12);
    }
  },
};
