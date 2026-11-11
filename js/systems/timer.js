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

  return {
    start() { if (!running) { running = true; frameId = window.requestAnimationFrame(frame); } },
    pause() { paused = true; },
    resume() { paused = false; lastTimestamp = 0; },
    stop() { running = false; window.cancelAnimationFrame(frameId); },
    expire,
  };
}
