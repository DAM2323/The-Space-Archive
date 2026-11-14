// Small "juice" toolkit shared by all scenes: easing curves, a parallax
// starfield, a particle system and screen shake.
// Everything here respects the reduced motion setting.

import { C } from '../data/palette.js';
import { WIDTH, HEIGHT, px } from './render.js';
import { gameState } from '../state.js';

const reduced = () => gameState.settings.reducedMotion;

// ---------- easing ----------
// Each takes t in 0..1 and returns an eased 0..1.
export const ease = {
  linear: (t) => t,
  inOutSine: (t) => 0.5 - 0.5 * Math.cos(Math.PI * t),
  outCubic: (t) => 1 - (1 - t) ** 3,
  inCubic: (t) => t ** 3,
  outBack: (t) => 1 + 2.70158 * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2,
};

export const clamp = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
export const lerp = (a, b, t) => a + (b - a) * t;

// ---------- parallax starfield ----------
// Three layers of stars. Far layers are dim and slow, near layers are bright
// and fast. The whole field also shifts a little with (ox, oy), for example
// the pointer position, which gives a sense of depth.
export class Starfield {
  constructor(count = 110, seed = 7) {
    // Small seeded random generator, so the sky looks the same on every visit.
    let s = seed;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    this.stars = [];
    for (let i = 0; i < count; i++) {
      const layer = i % 3;                       // 0 far, 1 middle, 2 near
      this.stars.push({
        x: rnd() * WIDTH,
        y: rnd() * HEIGHT,
        layer,
        phase: rnd() * Math.PI * 2,              // twinkle offset
        speed: 0.6 + rnd() * 1.4,                // twinkle speed
        color: rnd() < 0.12 ? C.ice : rnd() < 0.1 ? C.amber : C.star,
      });
    }
    this.time = 0;
    this.scroll = 0;
  }

  // drift = game pixels per second for the nearest layer.
  update(dt, drift = 2) {
    if (reduced()) return;
    this.time += dt;
    this.scroll += drift * dt;
  }

  render(ox = 0, oy = 0) {
    for (const s of this.stars) {
      const depth = (s.layer + 1) / 3;           // 0.33, 0.66, 1
      let x = (s.x - this.scroll * depth + ox * depth) % WIDTH;
      if (x < 0) x += WIDTH;
      let y = (s.y + oy * depth) % HEIGHT;
      if (y < 0) y += HEIGHT;
      const twinkle = 0.75 + 0.25 * Math.sin(this.time * s.speed + s.phase);
      const base = [0.3, 0.55, 0.95][s.layer];
      px(x, y, s.layer === 0 ? C.mist : s.color, base * twinkle);
    }
  }
}

// ---------- particles ----------
// A simple pool of square pixel particles that fade out over their life.
export class Particles {
  constructor(max = 200) {
    this.max = max;
    this.list = [];
  }

  // p: { x, y, vx, vy, life, color, size?, drag?, alpha? }
  spawn(p) {
    if (this.list.length >= this.max) this.list.shift();
    this.list.push({ size: 1, drag: 0, alpha: 1, ...p, age: 0 });
  }

  update(dt) {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const p = this.list[i];
      p.age += dt;
      if (p.age >= p.life) {
        this.list.splice(i, 1);
        continue;
      }
      p.vx -= p.vx * p.drag * dt;
      p.vy -= p.vy * p.drag * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
  }

  render() {
    for (const p of this.list) {
      const k = 1 - p.age / p.life;              // 1 -> 0 over the life
      px(p.x, p.y, p.color, p.alpha * ease.outCubic(k), p.size, p.size);
    }
  }
}

// ---------- screen shake ----------
// shake.add(2) starts a small shake that decays by itself. Kept subtle on
// purpose, and switched off completely with reduced motion.
export const shake = {
  power: 0,
  x: 0,
  y: 0,
  add(amount) {
    if (reduced()) return;
    this.power = Math.min(4, this.power + amount);
  },
  update(dt) {
    if (this.power <= 0.05 || reduced()) {
      this.power = 0;
      this.x = this.y = 0;
      return;
    }
    this.x = (Math.random() * 2 - 1) * this.power;
    this.y = (Math.random() * 2 - 1) * this.power;
    this.power *= Math.exp(-9 * dt);             // fast exponential decay
  },
};
