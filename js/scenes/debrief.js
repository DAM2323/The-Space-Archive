// "What really happened" card: the real facts of the machine, each one with
// its source. Only facts that have a citation are shown (see data/sources.js).
// Closing the card marks the machine as completed and saves the game.

import { C } from '../data/palette.js';
import { machines } from '../data/content.en.js';
import { SOURCES, visibleFacts } from '../data/sources.js';
import { t } from '../engine/i18n.js';
import { ctx, WIDTH, HEIGHT } from '../engine/render.js';
import { el, button } from '../engine/ui.js';
import { artFrame } from '../engine/art.js';
import * as scenes from '../engine/scenes.js';
import { sfx } from '../engine/audio.js';
import { save } from '../engine/storage.js';
import { gameState } from '../state.js';
import { drawBackdrop } from './story.js';

let machine, time, leaving;

function back() {
  if (leaving) return;
  leaving = true;
  gameState.completed[machine.id] = true;
  save();
  scenes.go('portal', { machine: machine.id, reverse: true, justCompleted: machine.id }, { duration: 0.25 });
}

export default {
  enter(params, ui) {
    machine = machines[params.machine] ?? machines.opportunity;
    time = 0;
    leaving = false;

    const card = el('section', 'panel card');
    card.setAttribute('aria-label', t('debrief.heading'));
    // Header: title, name and score, with the machine's picture beside them
    // when it has one (a small 16:9 frame; it removes itself if it cannot load).
    const head = el('div', 'card-head');
    const titles = el('div', 'card-titles');
    titles.append(
      el('h2', 'panel-title', t('debrief.heading')),
      el('p', 'card-name', [t(machine.name), t(machine.years)].filter(Boolean).join('  \u00B7  ')),
    );
    // Result of the mini-game, clearly marked as a game score.
    if (params.stars) {
      const score = el('p', 'card-score');
      score.append(el('span', 'stars', '\u2605'.repeat(params.stars)), el('span', 'stars off', '\u2605'.repeat(3 - params.stars)));
      score.append(el('span', 'score-label', t('debrief.score')));
      score.setAttribute('aria-label', `${t('debrief.score')}: ${params.stars} / 3`);
      titles.append(score);
    }
    if (machine.art) {
      head.classList.add('has-art');
      head.append(artFrame({ src: machine.art, alt: t(`art.${machine.id}`), onFail: () => head.classList.remove('has-art') }));
    }
    head.append(titles);
    card.append(head);

    // The fact list. Only facts whose source has a citation are shown.
    const body = el('div', 'card-body');
    body.tabIndex = 0;                         // focusable, so the keyboard can scroll long lists
    const facts = visibleFacts(machine.debrief);
    if (!facts.length) {
      body.append(el('p', 'card-pending', t('debrief.pending')));
    } else {
      // Long lists are laid out in two columns so the card still fits.
      const list = el('ul', facts.length > 5 ? 'facts two' : 'facts');
      facts.forEach((fact, i) => {
        const item = el('li', 'fact');
        item.style.animationDelay = `${0.25 + i * 0.18}s`;
        item.append(el('span', 'fact-text', t(fact.textKey)));
        item.append(el('span', 'fact-source', `${t('debrief.source')}: ${SOURCES[fact.sourceId].short}`));
        list.append(item);
      });
      body.append(list);
    }
    card.append(body);

    const done = button(t('debrief.back'), back, 'primary wide', '');
    card.append(done);
    ui.append(card);
    done.focus({ preventScroll: true });
    sfx('success');
  },

  update(dt) {
    time += dt;
  },

  render() {
    // The story world, dimmed behind the card.
    drawBackdrop(machine.env, 0, true);
    ctx.globalAlpha = 0.72;
    ctx.fillStyle = C.void;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.globalAlpha = 1;
  },
};
