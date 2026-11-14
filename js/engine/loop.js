// Fixed-step game loop: update() always runs at 60 steps per second no matter
// the screen refresh rate, render() runs once per animation frame.
// The loop stops while the tab is hidden and resumes cleanly.

export const STEP = 1 / 60;

export function createLoop(update, render) {
  let last = 0;
  let acc = 0;
  let raf = 0;
  let running = false;

  function frame(now) {
    raf = requestAnimationFrame(frame);
    // Clamp long gaps (slow frame, debugger) so we never run a burst of updates.
    acc += Math.min((now - last) / 1000, 0.25);
    last = now;
    while (acc >= STEP) {
      update(STEP);
      acc -= STEP;
    }
    render();
  }

  function start() {
    if (running) return;
    running = true;
    last = performance.now();
    acc = 0;
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));

  return { start, stop };
}
