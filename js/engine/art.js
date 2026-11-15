// Illustrated pictures (the files in Images/). A picture is only requested
// when a scene builds its frame, so each scene loads just the ones it shows.
// If a picture cannot be loaded, its element removes itself and `onFail` runs,
// so the scene falls back to its pixel sprite. The player sees no message;
// the reason is written to the console for debugging.

import { t } from './i18n.js';
import { el } from './ui.js';

// Shared loading: fade in on load, remove and report on failure.
function load(holder, src, alt, onFail) {
  const img = new Image();
  img.className = 'art-img';
  img.alt = alt;
  img.decoding = 'async';
  img.loading = 'lazy';          // the browser fetches it only when it is about to be seen
  // The picture fades in when it arrives (no fade with reduced motion: see style.css).
  img.addEventListener('load', () => holder.classList.add('loaded'));
  img.addEventListener('error', () => {
    console.warn(`[art] could not load "${src}" (missing file, wrong path or blocked request); showing the sprite instead.`);
    holder.remove();
    onFail?.();
  });
  holder.append(img);
  img.src = src;
  return img;
}

// The small badge every picture carries in its top right corner.
const badge = () => el('span', 'art-badge', t('shell.aiMark'));

// artFrame({ src, alt, caption, onFail }) -> <figure class="art-frame">
//   src      path of the picture, for example 'Images/opportunity.webp'
//   alt      one short sentence describing the picture
//   caption  optional text shown on the frame (name and years)
//   onFail   called if the picture cannot be loaded
export function artFrame({ src, alt, caption = '', onFail }) {
  const frame = el('figure', 'art-frame');
  load(frame, src, alt, onFail);
  frame.append(badge());
  if (caption) {
    const bar = el('figcaption', 'art-bar');
    bar.append(el('span', 'art-caption', caption));
    frame.append(bar);
  }
  return frame;
}

// artBackdrop({ src, alt, onFail }) -> <div class="art-backdrop">
// The picture as the background of a whole scene, with a dark gradient at the
// bottom so text placed over it stays readable.
export function artBackdrop({ src, alt, onFail }) {
  const back = el('div', 'art-backdrop');
  load(back, src, alt, onFail);
  back.append(el('div', 'art-shade'), badge());
  return back;
}
