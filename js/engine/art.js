// Illustrated pictures (the files in Images/). A picture is only requested
// when a scene builds its frame, so each scene loads just the one it shows.
// If a picture cannot be loaded, the frame removes itself and `onFail` runs,
// so the scene falls back to its pixel sprite without any message.

import { t } from './i18n.js';
import { el } from './ui.js';

// artFrame({ src, alt, caption, onFail }) -> <figure class="art-frame">
//   src      path of the picture, for example 'Images/opportunity.webp'
//   alt      one short sentence describing the picture
//   caption  optional text shown on the frame (name and years)
//   onFail   called if the picture cannot be loaded
export function artFrame({ src, alt, caption = '', onFail }) {
  const frame = el('figure', 'art-frame');
  const img = new Image();
  img.className = 'art-img';
  img.alt = alt;
  img.decoding = 'async';
  // The frame fades in when the picture arrives (no fade with reduced motion: see style.css).
  img.addEventListener('load', () => frame.classList.add('loaded'));
  img.addEventListener('error', () => {
    frame.remove();
    onFail?.();
  });
  const bar = el('figcaption', 'art-bar');
  if (caption) bar.append(el('span', 'art-caption', caption));
  // Every picture carries the visible mark, on the frame itself.
  bar.append(el('span', 'art-tag', t('shell.aiMark')));
  frame.append(img, bar);
  img.src = src;
  return frame;
}
