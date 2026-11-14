// All sound is synthesized with WebAudio: short blips for feedback and a soft
// drone for atmosphere. There are no audio files.
// Browsers only allow sound after a user gesture, so the audio context is
// created on the first key press or tap.

import { gameState } from '../state.js';

let ac = null;          // AudioContext
let master = null;      // master volume
let droneNodes = null;  // the running ambient loop, if any
let wantedDrone = false;

function unlock() {
  if (!ac) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;                                   // no WebAudio: stay silent
    ac = new AC();
    master = ac.createGain();
    master.connect(ac.destination);
    applyVolume();
  }
  if (ac.state === 'suspended') ac.resume();
  if (wantedDrone && !droneNodes) startDrone();
}

export function initAudio() {
  window.addEventListener('pointerdown', unlock);
  window.addEventListener('keydown', unlock);
}

// Call after the sound or volume setting changes.
export function applyVolume() {
  if (!master) return;
  const s = gameState.settings;
  master.gain.setTargetAtTime(s.sound ? s.volume : 0, ac.currentTime, 0.02);
}

// One note: an oscillator with a quick attack and a smooth fade out.
// f1 lets the pitch slide from `freq` to `f1` during the note.
function tone({ freq, f1 = freq, at = 0, dur = 0.1, type = 'square', vol = 0.2 }) {
  const t0 = ac.currentTime + at;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (f1 !== freq) osc.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(vol, t0 + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

// A burst of filtered noise (whoosh, thud).
function noise({ at = 0, dur = 0.3, from = 400, to = 2000, vol = 0.2 }) {
  const t0 = ac.currentTime + at;
  const len = Math.ceil(ac.sampleRate * dur);
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource();
  src.buffer = buf;
  const filter = ac.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(from, t0);
  filter.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  const gain = ac.createGain();
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(vol, t0 + dur * 0.3);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filter).connect(gain).connect(master);
  src.start(t0);
}

// The sound events of the game.
const SOUNDS = {
  hover: () => tone({ freq: 880, dur: 0.035, type: 'triangle', vol: 0.08 }),
  select: () => {
    tone({ freq: 523, dur: 0.07, vol: 0.12 });
    tone({ freq: 784, at: 0.06, dur: 0.11, vol: 0.12 });
  },
  back: () => {
    tone({ freq: 494, dur: 0.07, vol: 0.1 });
    tone({ freq: 330, at: 0.06, dur: 0.11, vol: 0.1 });
  },
  tick: () => tone({ freq: 1320, dur: 0.018, type: 'triangle', vol: 0.05 }),
  clock: () => tone({ freq: 660, dur: 0.03, type: 'sine', vol: 0.07 }),
  portal: () => {
    tone({ freq: 110, f1: 880, dur: 0.9, type: 'sawtooth', vol: 0.09 });
    tone({ freq: 165, f1: 1320, dur: 0.9, type: 'sine', vol: 0.12 });
    noise({ dur: 0.9, from: 300, to: 3000, vol: 0.12 });
  },
  portalClose: () => {
    tone({ freq: 880, f1: 110, dur: 0.7, type: 'sine', vol: 0.12 });
    noise({ dur: 0.7, from: 3000, to: 300, vol: 0.1 });
  },
  whoosh: () => noise({ dur: 0.5, from: 500, to: 2500, vol: 0.14 }),
  success: () => [523, 659, 784, 1047].forEach((f, i) => tone({ freq: f, at: i * 0.09, dur: 0.18, type: 'triangle', vol: 0.14 })),
  fail: () => {
    tone({ freq: 220, f1: 150, dur: 0.25, type: 'sawtooth', vol: 0.1 });
    tone({ freq: 160, f1: 100, at: 0.2, dur: 0.35, type: 'sawtooth', vol: 0.1 });
  },
  stamp: () => {
    noise({ dur: 0.12, from: 200, to: 90, vol: 0.4 });
    tone({ freq: 140, f1: 60, dur: 0.16, type: 'sine', vol: 0.3 });
    tone({ freq: 784, at: 0.12, dur: 0.12, type: 'triangle', vol: 0.1 });
    tone({ freq: 1047, at: 0.2, dur: 0.25, type: 'triangle', vol: 0.1 });
  },
  arrive: () => {
    noise({ dur: 1.2, from: 200, to: 5000, vol: 0.16 });
    [392, 523, 784].forEach((f, i) => tone({ freq: f, at: 0.5 + i * 0.14, dur: 0.6, type: 'sine', vol: 0.12 }));
  },
};

export function sfx(name) {
  if (!ac || ac.state !== 'running' || !gameState.settings.sound) return;
  SOUNDS[name]?.();
}

// ---------- ambient drone ----------
// Two low sine waves a fifth apart plus a slow swell: a quiet "deep space" bed.
function startDrone() {
  const out = ac.createGain();
  out.gain.setValueAtTime(0, ac.currentTime);
  out.gain.linearRampToValueAtTime(0.16, ac.currentTime + 3);
  out.connect(master);
  const oscs = [55, 82.5, 110.4].map((f, i) => {
    const o = ac.createOscillator();
    o.type = 'sine';
    o.frequency.value = f;
    const g = ac.createGain();
    g.gain.value = [0.6, 0.35, 0.2][i];
    o.connect(g).connect(out);
    o.start();
    return o;
  });
  const lfo = ac.createOscillator();              // slow breathing of the volume
  lfo.frequency.value = 0.08;
  const lfoGain = ac.createGain();
  lfoGain.gain.value = 0.05;
  lfo.connect(lfoGain).connect(out.gain);
  lfo.start();
  droneNodes = { out, oscs: [...oscs, lfo] };
}

export function drone(on) {
  wantedDrone = on;
  if (!ac) return;                                 // will start on unlock
  if (on && !droneNodes) startDrone();
  if (!on && droneNodes) {
    const { out, oscs } = droneNodes;
    droneNodes = null;
    out.gain.setTargetAtTime(0, ac.currentTime, 0.4);
    setTimeout(() => oscs.forEach((o) => o.stop()), 2500);
  }
}
