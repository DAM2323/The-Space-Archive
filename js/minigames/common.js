// DOM pieces shared by the mini-games: the HUD boxes at the top, the message
// line and Continue button at the bottom, and the card shown between phases.

import { t } from '../engine/i18n.js';
import { el, button } from '../engine/ui.js';

export function createShell(api, kickerKey) {
  const hud = el('div', 'g-hud');
  const left = el('div', 'g-box');
  const mid = el('div', 'g-box g-mid');
  hud.append(left, mid);

  const bottom = el('div', 'g-bottom');
  const msg = el('p', 'g-msg');
  msg.setAttribute('aria-live', 'polite');
  const controls = el('div', 'g-actions');
  const done = button(t('game.continue'), () => onDone?.(), 'primary');
  done.hidden = true;
  bottom.append(msg, controls, done);

  const card = el('section', 'panel phase-card');
  card.hidden = true;
  card.setAttribute('role', 'dialog');
  const cardTitle = el('h2', 'panel-title');
  const cardText = el('div', 'phase-text');
  const cardGo = button(t('game.continue'), () => closeCard());
  cardGo.classList.add('primary');
  card.append(el('p', 'phase-kicker', t(kickerKey)), cardTitle, cardText, cardGo);

  api.ui.append(hud, bottom, card);

  let onDone = null;
  let onCardClose = null;

  function closeCard() {
    card.hidden = true;
    hud.inert = bottom.inert = false;
    onCardClose?.();
  }

  return {
    left, mid, bottom, msg, controls,

    // Show a line of text in the message box (already translated).
    say(text) {
      msg.classList.remove('show');
      void msg.offsetWidth;                      // restart the fade
      msg.textContent = text;
      msg.classList.add('show');
    },

    // Show a card with a title and paragraphs; `then` runs when it is closed.
    openCard(title, lines, then) {
      cardTitle.textContent = title;
      cardText.replaceChildren(...lines.map((line) => el('p', '', line)));
      onCardClose = then;
      card.hidden = false;
      hud.inert = bottom.inert = true;
      cardGo.focus({ preventScroll: true });
    },
    cardOpen: () => !card.hidden,

    // End of the mini-game: hide the controls and show the Continue button.
    showDone(then) {
      onDone = then;
      controls.hidden = true;
      done.hidden = false;
      done.focus({ preventScroll: true });
    },
  };
}
