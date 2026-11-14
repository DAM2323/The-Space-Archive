// Helpers for the DOM text overlay. Using the same helpers everywhere means
// every button gets the same hover / press / focus feedback and the same
// sound blips for free.

import { sfx } from './audio.js';

// el('p', 'tagline', 'text') -> <p class="tagline">text</p>
export function el(tag, className = '', text = '') {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

// Make any focusable node behave like a game control: click feedback, hover
// focuses it (so mouse and keyboard share one cursor) and both play a blip.
// `sound` is the blip played on click ('' for none, when the action plays its own).
export function interactive(node, onClick, sound = 'select') {
  node.addEventListener('click', () => {
    // Restart the CSS "pressed" pop so repeated clicks always animate.
    node.classList.remove('pop');
    void node.offsetWidth;
    node.classList.add('pop');
    if (sound) sfx(sound);
    onClick(node);
  });
  node.addEventListener('pointerenter', (e) => {
    if (e.pointerType === 'mouse') node.focus({ preventScroll: true });
  });
  node.addEventListener('focus', () => sfx('hover'));
  return node;
}

// A game button. `onClick` runs on mouse, touch, Enter and Space.
export function button(label, onClick, className = '', sound = 'select') {
  const b = el('button', `btn ${className}`.trim());
  b.type = 'button';
  b.append(el('span', 'btn-label', label));
  return interactive(b, onClick, sound);
}

export function setLabel(btn, label) {
  btn.querySelector('.btn-label').textContent = label;
}

// Arrow keys move the focus between the buttons inside `container`.
// Returns true if the key was handled.
export function arrowNav(container, key) {
  const dir = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[key];
  if (!dir) return false;
  const items = [...container.querySelectorAll('button:not([disabled])')];
  if (!items.length) return false;
  const i = items.indexOf(document.activeElement);
  const next = i < 0 ? (dir > 0 ? 0 : items.length - 1) : (i + dir + items.length) % items.length;
  items[next].focus({ preventScroll: true });
  return true;
}
