import { GAME_CONFIG } from "./config.js";

export function createState({ root, screens, initialContext = {} }) {
  if (!root) throw new Error("A máquina de estados precisa de um elemento raiz.");
  let currentScreen = null;
  let currentName = null;
  let transitionId = 0;
  const listeners = new Map();
  const state = {
    context: initialContext,
    on(eventName, callback) {
      const callbacks = listeners.get(eventName) ?? new Set();
      callbacks.add(callback);
      listeners.set(eventName, callbacks);
      return () => callbacks.delete(callback);
    },
    emit(eventName, detail) {
      listeners.get(eventName)?.forEach((callback) => callback(detail));
    },
    async goTo(name, context = {}) {
      const screen = screens[name];
      if (!screen) throw new Error(`Tela desconhecida: ${name}`);
      const id = ++transitionId;
      const previousName = currentName;
      state.context = context;
      currentScreen?.unmount?.();
      root.classList.add("is-transitioning");
      await new Promise((resolve) => window.setTimeout(resolve, GAME_CONFIG.interface.transicaoMs));
      if (id !== transitionId) return;
      root.replaceChildren();
      currentName = name;
      currentScreen = screen;
      screen.mount({ ...context, state });
      root.classList.remove("is-transitioning");
      state.emit("mudou", { from: previousName, to: name, context: state.context });
    },
  };
  return Object.seal(state);
}
