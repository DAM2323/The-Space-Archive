// Mini-game host: runs the mini-game of one machine, adds the pause menu,
// and stores the result. The mini-games themselves never touch gameState.

import { machines } from '../data/content.en.js';
import { t } from '../engine/i18n.js';
import { ctx } from '../engine/render.js';
import { el, button, arrowNav } from '../engine/ui.js';
import * as scenes from '../engine/scenes.js';
import * as input from '../engine/input.js';
import { sfx } from '../engine/audio.js';
import { save } from '../engine/storage.js';
import { gameState } from '../state.js';
import { MINIGAMES } from '../minigames/index.js';

let machine, game, paused, leaving, dom, offInput;

function setPaused(on) {
  if (leaving || paused === on) return;
  paused = on;
  dom.panel.hidden = !on;
  dom.layer.inert = on;                       // the game cannot be clicked while paused
  dom.pause.hidden = on;
  sfx(on ? 'select' : 'back');
  (on ? dom.resume : dom.pause).focus({ preventScroll: true });
}

export default {
  enter(params, ui) {
    machine = machines[params.machine] ?? machines.opportunity;
    paused = false;
    leaving = false;

    const layer = el('div', 'game-layer');
    const pause = button(t('game.pause'), () => setPaused(true), 'small pause', '');
    const panel = el('section', 'panel pause-panel');
    panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', t('game.paused'));
    const resume = button(t('game.resume'), () => setPaused(false), 'primary', '');
    const leave = button(t('game.leave'), () => {
      leaving = true;
      scenes.go('portal', { machine: machine.id, reverse: true }, { duration: 0.25 });
    }, '', 'back');
    panel.append(el('h2', 'panel-title', t('game.paused')), resume, leave);
    ui.append(layer, pause, panel);
    dom = { layer, pause, panel, resume };

    game = MINIGAMES[machine.id].create(ctx, {
      ui: layer,
      // The mini-game calls this once, when it is over.
      finish({ stars }) {
        if (leaving) return;
        leaving = true;
        gameState.stars[machine.id] = Math.max(gameState.stars[machine.id], stars);
        save();
        scenes.go('debrief', { machine: machine.id, stars });
      },
    });

    offInput = input.on((a) => {
      if (a.type === 'back') setPaused(!paused);
      else if (a.type === 'direction' && paused) arrowNav(dom.panel, a.dy > 0 || a.dx > 0 ? 'ArrowDown' : 'ArrowUp');
    });
  },

  exit() {
    offInput();
    game.destroy?.();
  },

  update(dt) {
    if (!paused) game.update(dt);
  },

  render() {
    game.render();
  },
};
