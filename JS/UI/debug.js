import { TOTAL_PHASES } from "../phases.js";

export function mountDebugControls(state) {
  const debug = document.createElement("aside");
  debug.className = "debug-controls";
  debug.hidden = true;
  debug.setAttribute("aria-label", "Painel de depuração");
  debug.innerHTML = `
    <h2>Depuração</h2>
    <dl class="debug-values">
      <div><dt>Aura calculada</dt><dd data-debug-aura>0</dd></div>
      <div><dt>Tempo restante</dt><dd data-debug-time>--:--</dd></div>
      <div><dt>Modelo atual</dt><dd data-debug-model>—</dd></div>
      <div><dt>Parâmetros</dt><dd><code data-debug-params>{}</code></dd></div>
    </dl>
    <div class="debug-actions">
      <button type="button" data-debug-action="next-question">Próxima questão (N)</button>
      <button type="button" data-debug-action="next-phase">Próxima fase (F)</button>
      <button type="button" data-debug-action="expire">Esgotar tempo (T)</button>
    </div>
  `;
  document.body.append(debug);

  const onDebugState = ({ aura, tempoRestante, modelId, params }) => {
    debug.querySelector("[data-debug-aura]").textContent = String(aura ?? 0);
    const seconds = Math.max(0, Math.ceil(tempoRestante ?? 0));
    debug.querySelector("[data-debug-time]").textContent = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
    debug.querySelector("[data-debug-model]").textContent = modelId ?? "—";
    debug.querySelector("[data-debug-params]").textContent = JSON.stringify(params ?? {});
  };
  const unsubscribe = state.on("debug:state", onDebugState);
  const onAction = (event) => {
    const action = event.target.closest("[data-debug-action]")?.dataset.debugAction;
    if (action) state.emit(`debug:${action}`);
  };
  const onKeyDown = (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.isComposing) return;
    const target = event.target;
    const key = event.key.toLowerCase();
    if (key === "d") {
      debug.hidden = !debug.hidden;
      event.preventDefault();
      return;
    }
    if (target instanceof HTMLElement && (target.isContentEditable || target.matches("input, textarea, select"))) return;

    if (key === "n") {
      state.emit("debug:next-question");
    } else if (key === "f") {
      const phase = Number(state.context.phase) || 1;
      if (phase >= TOTAL_PHASES) state.goTo("FIM", { phase: TOTAL_PHASES });
      else state.goTo("BRIEFING", { phase: phase + 1 });
    } else if (key === "t") {
      state.emit("debug:expire");
    }
  };
  const onClick = (event) => {
    if (event.target instanceof Element) onAction(event);
  };
  debug.addEventListener("click", onClick);
  document.addEventListener("keydown", onKeyDown);

  return () => {
    unsubscribe();
    debug.removeEventListener("click", onClick);
    document.removeEventListener("keydown", onKeyDown);
    debug.remove();
  };
}
