// The options panel: sound, volume, text size, reduced motion, language and
// "reset progress". It is a DOM component, built once by the scene that shows it.

import { t, setLanguage, languages } from '../engine/i18n.js';
import { el, button, setLabel } from '../engine/ui.js';
import { applyVolume, sfx } from '../engine/audio.js';
import { save, resetProgress } from '../engine/storage.js';
import { gameState, applySettings } from '../state.js';

const VOLUME_STEPS = [0.2, 0.4, 0.6, 0.8, 1];

// Returns { panel, open(), close(), isOpen() }.
// onClose runs after the panel closes; onLanguage runs when the language changes
// (the scene should rebuild its text).
export function createOptions({ onClose, onLanguage, showLanguage = true } = {}) {
  const s = gameState.settings;
  const panel = el('section', 'panel options');
  panel.hidden = true;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', t('options.heading'));

  let resetArmed = false;

  const sound = button('', () => { s.sound = !s.sound; changed(); sfx('select'); }, '', '');
  const volume = button('', () => {
    const i = VOLUME_STEPS.findIndex((v) => v >= s.volume - 0.01);
    s.volume = VOLUME_STEPS[(i + 1) % VOLUME_STEPS.length];
    changed();
    sfx('select');
  }, '', '');
  const textSize = button('', () => { s.textSize = s.textSize === 'large' ? 'normal' : 'large'; changed(); });
  const motion = button('', () => { s.reducedMotion = !s.reducedMotion; changed(); });
  const language = button('', () => {
    const list = languages();
    gameState.language = list[(list.indexOf(gameState.language) + 1) % list.length];
    setLanguage(gameState.language);
    changed();
    panel.setAttribute('aria-label', t('options.heading'));
    heading.textContent = t('options.heading');
    setLabel(close, t('options.close'));
    onLanguage?.();
  });
  // Reset needs two presses, so it cannot happen by accident.
  const reset = button('', () => {
    if (!resetArmed) {
      resetArmed = true;
    } else {
      resetProgress();
      resetArmed = false;
      setLabel(reset, t('options.reset.done'));
      return;
    }
    refresh();
  }, 'danger');
  const close = button(t('options.close'), () => api.close(), 'primary wide', 'back');

  const grid = el('div', 'option-grid');
  // The language can only be changed where the whole screen can be rebuilt (the title).
  grid.append(sound, volume, textSize, motion, ...(showLanguage ? [language] : []), reset);
  if (!showLanguage) reset.classList.add('span');
  const heading = el('h2', 'panel-title', t('options.heading'));
  panel.append(heading, grid, close);

  function refresh() {
    const onOff = (v) => t(v ? 'options.on' : 'options.off');
    setLabel(sound, `${t('options.sound')}: ${onOff(s.sound)}`);
    setLabel(volume, `${t('options.volume')}: ${Math.round(s.volume * 100)}%`);
    setLabel(textSize, `${t('options.textSize')}: ${t('options.textSize.' + s.textSize)}`);
    setLabel(motion, `${t('options.reducedMotion')}: ${onOff(s.reducedMotion)}`);
    setLabel(language, `${t('options.language')}: ${t('language.name')}`);
    setLabel(reset, t(resetArmed ? 'options.reset.confirm' : 'options.reset'));
    sound.setAttribute('aria-pressed', String(s.sound));
    motion.setAttribute('aria-pressed', String(s.reducedMotion));
    volume.disabled = !s.sound;
  }

  // A setting changed: apply it, remember it, redraw the labels.
  function changed() {
    applySettings();
    applyVolume();
    save();
    refresh();
  }

  const api = {
    panel,
    isOpen: () => !panel.hidden,
    open() {
      resetArmed = false;
      refresh();
      panel.hidden = false;
      sound.focus({ preventScroll: true });
    },
    close() {
      if (panel.hidden) return;
      panel.hidden = true;
      onClose?.();
    },
  };
  refresh();
  return api;
}
