// Entry point: wires the engine together and starts the first scene.

import content from './data/content.en.js';
import { addLanguage, setLanguage, t } from './engine/i18n.js';
import { initRender, present } from './engine/render.js';
import { createLoop } from './engine/loop.js';
import * as scenes from './engine/scenes.js';
import { shake } from './engine/fx.js';
import { gameState, applySettings } from './state.js';
import title from './scenes/title.js';

// Text
addLanguage('en', content.strings);
setLanguage(gameState.language);
applySettings();
document.getElementById('rotate-text').textContent = t('shell.rotate');

// Engine
initRender(document.getElementById('screen'), document.getElementById('stage'));
scenes.initScenes(document.getElementById('ui'));

// Scenes (more are registered here as milestones land)
scenes.register('title', title);

// Each scene can be opened directly through the URL hash, for example
// index.html#title. Unknown names fall back to the title screen.
function sceneFromHash() {
  const name = location.hash.slice(1);
  return scenes.has(name) ? name : 'title';
}
scenes.go(sceneFromHash());
window.addEventListener('hashchange', () => {
  const name = sceneFromHash();
  if (name !== scenes.current()) scenes.go(name);
});

// Main loop
createLoop(
  (dt) => {
    scenes.update(dt);
    shake.update(dt);
  },
  () => {
    scenes.render();
    present(shake.x, shake.y);
  },
).start();
