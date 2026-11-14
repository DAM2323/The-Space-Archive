// "What really happened" card: the real facts of the machine, each one with
// its source. Only facts that have a citation are shown (see data/sources.js).
// Closing the card marks the machine as completed and saves the game.

import { C } from '../data/palette.js';
import { machines } from '../data/content.en.js';
import { SOURCES, visibleFacts } from '../data/sources.js';
import { t } from '../engine/i18n.js';
import { ctx, WIDTH, HEIGHT } from '../engine/render.js';
import { el, button, setLabel } from '../engine/ui.js';
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
    card.append(
      el('h2', 'panel-title', t('debrief.heading')),
      el('p', 'card-name', [t(machine.name), t(machine.years)].filter(Boolean).join('  ·  ')),
    );

    // Result of the mini-game, clearly marked as a game score.
    if (params.stars) {
      const score = el('p', 'card-score');
      score.append(el('span', 'stars', '\u2605'.repeat(params.stars)), el('span', 'stars off', '\u2605'.repeat(3 - params.stars)));
      score.append(el('span', 'score-label', t('debrief.score')));
      score.setAttribute('aria-label', `${t('debrief.score')}: ${params.stars} / 3`);
      card.append(score);
    }

    // The fact list. A machine can also have a bonus story with its own facts;
    // a button switches the card between the two lists.
    const body = el('div', 'card-body');
    body.tabIndex = 0;                         // focusable, so the keyboard can scroll long lists
    const title = card.querySelector('.panel-title');
    let showingBonus = false;
    function fill() {
      const facts = visibleFacts(showingBonus ? machine.bonus.facts : machine.debrief);
      title.textContent = t(showingBonus ? machine.bonus.title : 'debrief.heading');
      if (!facts.length) return body.replaceChildren(el('p', 'card-pending', t('debrief.pending')));
      // Long lists are laid out in two columns so the card still fits.
      const list = el('ul', facts.length > 5 ? 'facts two' : 'facts');
      facts.forEach((fact, i) => {
        const item = el('li', 'fact');
        item.style.animationDelay = `${0.25 + i * 0.18}s`;
        item.append(el('span', 'fact-text', t(fact.textKey)));
        item.append(el('span', 'fact-source', `${t('debrief.source')}: ${SOURCES[fact.sourceId].short}`));
        list.append(item);
      });
      body.replaceChildren(list);
    }
    fill();
    card.append(body);
    if (machine.bonus && visibleFacts(machine.bonus.facts).length) {
      const bonus = button(t('debrief.bonus'), () => {
        showingBonus = !showingBonus;
        setLabel(bonus, t(showingBonus ? 'debrief.facts' : 'debrief.bonus'));
        fill();
      }, 'wide');
      card.append(bonus);
    }

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
