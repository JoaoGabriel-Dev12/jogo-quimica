export function createTimer({ state, onTick, onExpired }) {
  let frameId = 0;
  let lastTimestamp = 0;
  let running = false;
  let paused = false;
  let expired = false;

  const frame = (timestamp) => {
    if (!running) return;
    if (!lastTimestamp) lastTimestamp = timestamp;
    const deltaTime = Math.min((timestamp - lastTimestamp) / 1000, 1);
    lastTimestamp = timestamp;
    if (!paused && !expired) {
      state.context.tempoRestante = Math.max(0, state.context.tempoRestante - deltaTime);
      onTick(state.context.tempoRestante);
      if (state.context.tempoRestante === 0) {
        expired = true;
        state.emit("tempoEsgotado", { fase: state.context.phase });
        onExpired();
        return;
      }
    }
    frameId = window.requestAnimationFrame(frame);
  };

  const expire = () => {
    if (expired) return;
    expired = true;
    paused = true;
    state.context.tempoRestante = 0;
    onTick(0);
    state.emit("tempoEsgotado", { fase: state.context.phase });
    onExpired();
  };

<<<<<<< HEAD
  return {
    start() { if (!running) { running = true; frameId = window.requestAnimationFrame(frame); } },
    pause() { paused = true; },
    resume() { paused = false; lastTimestamp = 0; },
    stop() { running = false; window.cancelAnimationFrame(frameId); },
=======
  const iniciarLoop = () => {
    if (running) return;
    running = true;
    frameId = window.requestAnimationFrame(frame);
  };

  return {
    start() { iniciarLoop(); },
    pause() { paused = true; },
    resume() { paused = false; lastTimestamp = 0; },
    stop() { running = false; window.cancelAnimationFrame(frameId); },
    reset(seconds) {
      window.cancelAnimationFrame(frameId);
      state.context.tempoRestante = Math.max(0, Number(seconds) || 0);
      paused = false;
      expired = false;
      lastTimestamp = 0;
      onTick(state.context.tempoRestante);
      running = false;
      iniciarLoop();
    },
>>>>>>> origin/master
    expire,
  };
}
