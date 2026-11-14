// Entry point: wires the engine together and starts the first scene.

import content from './data/content.en.js';
import spanish from './data/content.es.js';
import { addLanguage, setLanguage } from './engine/i18n.js';
import { initRender, present } from './engine/render.js';
import { createLoop } from './engine/loop.js';
import * as scenes from './engine/scenes.js';
import { shake } from './engine/fx.js';
import { gameState, applySettings } from './state.js';
import { load } from './engine/storage.js';
import { initInput } from './engine/input.js';
import { initAudio } from './engine/audio.js';
import { MACHINE_IDS } from './state.js';
import title from './scenes/title.js';
import intro from './scenes/intro.js';
import hub from './scenes/hub.js';
import portal from './scenes/portal.js';
import story from './scenes/story.js';
import debrief from './scenes/debrief.js';
import game from './scenes/game.js';
import science from './scenes/science.js';
import credits from './scenes/credits.js';
import { MINIGAMES } from './minigames/index.js';

// Saved settings and progress, then text
load();
addLanguage('en', content.strings);
addLanguage('es', spanish.strings);
setLanguage(gameState.language);
applySettings();

// Engine
initRender(document.getElementById('screen'), document.getElementById('stage'));
scenes.initScenes(document.getElementById('ui'));
initInput(document.getElementById('stage'));
initAudio();

// Scenes (more are registered here as milestones land)
scenes.register('title', title);
scenes.register('intro', intro);
scenes.register('hub', hub);
scenes.register('portal', portal);
scenes.register('story', story);
scenes.register('debrief', debrief);
scenes.register('game', game);
scenes.register('science', science);
scenes.register('credits', credits);

// Each scene can be opened directly through the URL hash, for example
// index.html#hub. A machine id (#opportunity) opens that machine's mini-game,
// or its story if it has none. #story:opportunity and #debrief:sojourner pass
// the machine to a scene. Unknown names fall back to the title screen.
function openFromHash() {
  const [name, arg] = location.hash.slice(1).split(':');
  if (MACHINE_IDS.includes(name)) {
    return scenes.go(MINIGAMES[name] ? 'game' : 'story', { machine: name });
  }
  if (name === 'portal' || name === 'game' || !scenes.has(name)) return scenes.go('title');
  return scenes.go(name, { machine: MACHINE_IDS.includes(arg) ? arg : 'opportunity' });
}
openFromHash();
window.addEventListener('hashchange', openFromHash);

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
