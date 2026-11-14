// Scene manager: a stack of scenes plus a tweened fade between them.
//
// A scene is a plain object:
//   enter(params, ui)  called when the scene starts; `ui` is its own DOM layer
//   update(dt)         called 60 times per second
//   render()           draw on the shared canvas buffer
//   exit()             clean up (the DOM layer is removed automatically)
//
// scenes.go(name, params)   replace everything with a new scene (with a fade)
// scenes.push(name, params) put a scene on top (for example a pause menu)
// scenes.pop()              remove the top scene

import { C } from '../data/palette.js';
import { ctx, WIDTH, HEIGHT } from './render.js';
import { ease } from './fx.js';

const registry = new Map();   // name -> scene object
const stack = [];             // [{ name, scene, layer }], last one is on top
let uiRoot = null;
let transition = null;        // { phase: 'out' | 'in', t, duration, name, params }
let fade = 0;                 // 0 = scene fully visible, 1 = fully black

export function initScenes(uiElement) {
  uiRoot = uiElement;
}

export function register(name, scene) {
  registry.set(name, scene);
}

export const has = (name) => registry.has(name);
export const current = () => stack[stack.length - 1]?.name ?? null;
export const busy = () => transition !== null;

function mount(name, params) {
  const scene = registry.get(name);
  const layer = document.createElement('div');
  layer.className = 'scene-layer';
  layer.dataset.scene = name;
  uiRoot.append(layer);
  stack.push({ name, scene, layer });
  scene.enter?.(params, layer);
}

function unmountTop() {
  const top = stack.pop();
  if (!top) return;
  top.scene.exit?.();
  top.layer.remove();
}

// Switch to another scene. Returns false if the scene does not exist (yet)
// or a transition is already running.
export function go(name, params = {}, { duration = 0.4, instant = false } = {}) {
  if (!registry.has(name) || transition) return false;
  if (instant || stack.length === 0) {
    while (stack.length) unmountTop();
    mount(name, params);
    // The very first scene still fades in from black.
    transition = instant ? null : { phase: 'in', t: 0, duration, name, params };
    fade = instant ? 0 : 1;
    return true;
  }
  transition = { phase: 'out', t: 0, duration, name, params };
  return true;
}

export function push(name, params = {}) {
  if (!registry.has(name)) return false;
  mount(name, params);
  return true;
}

export function pop() {
  if (stack.length > 1) unmountTop();
}

export function update(dt) {
  if (transition) {
    transition.t += dt / transition.duration;
    const k = ease.inOutSine(Math.min(1, transition.t));
    if (transition.phase === 'out') {
      fade = k;
      if (transition.t >= 1) {
        // Screen is black: swap the scenes, then fade back in.
        while (stack.length) unmountTop();
        mount(transition.name, transition.params);
        transition.phase = 'in';
        transition.t = 0;
      }
    } else {
      fade = 1 - k;
      if (transition.t >= 1) {
        transition = null;
        fade = 0;
      }
    }
    // The DOM overlay fades together with the canvas and ignores input meanwhile.
    uiRoot.style.opacity = String(1 - fade);
    uiRoot.style.pointerEvents = transition ? 'none' : '';
  }
  // Only the top scene updates; scenes below it are paused.
  stack[stack.length - 1]?.scene.update?.(dt);
}

export function render() {
  for (const entry of stack) entry.scene.render?.();
  if (fade > 0) {
    ctx.globalAlpha = fade;
    ctx.fillStyle = C.void;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.globalAlpha = 1;
  }
}
