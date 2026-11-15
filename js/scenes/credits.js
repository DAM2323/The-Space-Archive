// Credits and sources: who made it, every source, licenses and attributions,
// and a note about the story (what is fiction and what is real physics).

import { SPRITES } from '../data/sprites.js';
import { SOURCES } from '../data/sources.js';
import { t } from '../engine/i18n.js';
import { clear, drawSprite } from '../engine/render.js';
import { Starfield } from '../engine/fx.js';
import { el, button } from '../engine/ui.js';
import * as scenes from '../engine/scenes.js';
import * as input from '../engine/input.js';
import { sfx, drone } from '../engine/audio.js';
import { gameState } from '../state.js';

let time, from, offInput, scroller;
const stars = new Starfield(120, 53);

const section = (titleKey, ...children) => {
  const box = el('div', 'credits-section');
  box.append(el('h3', 'credits-heading', t(titleKey)), ...children);
  return box;
};

export default {
  // params.from: the scene to go back to ('title' by default).
  enter(params, ui) {
    time = 0;
    from = scenes.has(params.from) ? params.from : 'title';

    const card = el('section', 'panel credits');
    card.setAttribute('aria-label', t('credits.title'));
    scroller = el('div', 'credits-scroll');
    scroller.tabIndex = 0;                     // focusable, so the keyboard can scroll it

    // Only sources that have a citation are listed: they are the ones the game uses.
    const list = el('ul', 'source-list');
    for (const source of Object.values(SOURCES)) {
      if (source.needsSource) continue;
      const item = el('li', 'source');
      if (source.url) {
        const link = el('a', 'source-title', source.title);
        link.href = source.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        item.append(link);
      } else {
        item.append(el('span', 'source-title', source.title));
      }
      item.append(el('span', 'source-publisher', source.publisher));
      list.append(item);
    }

    scroller.append(
      el('p', 'credits-lead', t('credits.made')),
      el('p', 'credits-text', t('credits.challenge')),
      section('credits.sources', el('p', 'credits-text', t('credits.sourcesNote')), list),
      section('credits.art', el('p', 'credits-text', t('credits.artText')), el('p', 'credits-text', t('credits.gameValues'))),
      section('credits.tools', el('p', 'credits-text', t('credits.toolsText'))),
      section('credits.license', el('p', 'credits-text', t('credits.licenseText'))),
      section('credits.about', el('p', 'credits-text', t('credits.aboutText'))),
    );
    const back = button(t('credits.back'), () => scenes.go(from), 'primary wide', 'back');
    card.append(el('h2', 'panel-title', t('credits.title')), scroller, back);
    ui.append(card);
    back.focus({ preventScroll: true });
    drone(true);

    offInput = input.on((a) => {
      if (a.type === 'back') { sfx('back'); scenes.go(from); }
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
    // The astronaut drifts in the corner, next to the card.
    const still = gameState.settings.reducedMotion;
    drawSprite(SPRITES.astronaut, 12 + (still ? 0 : Math.sin(time * 0.4) * 3), 150 + (still ? 0 : Math.sin(time * 0.8) * 4));
  },
};
