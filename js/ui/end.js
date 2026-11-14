import { icons } from "./icons.js";

let cleanup = () => {};

export function mount(context) {
  const card = document.createElement("section");
  card.className = "start-card end-card";
  card.setAttribute("aria-labelledby", "end-title");
  card.innerHTML = `
    <p class="eyebrow">Fase ${context.phase ?? 11}</p>
    <h1 id="end-title">Jornada concluída</h1>
    <p class="status">Você terminou todas as fases disponíveis. Que tal testar seus reflexos no modo arcade?</p>
    <div class="end-badge" aria-hidden="true">${icons.atom}</div>
    <div class="button-row">
      <button class="button button-primary" type="button" data-action="arcade">Jogar Arcade</button>
      <button class="button button-secondary" type="button" data-action="menu">Menu</button>
    </div>
  `;

  const onArcade = () => context.state.goTo("ARCADE");
  const onReturn = () => context.state.goTo("MENU");
  const arcadeButton = card.querySelector('[data-action="arcade"]');
  const menuButton = card.querySelector('[data-action="menu"]');
  arcadeButton.addEventListener("click", onArcade);
  menuButton.addEventListener("click", onReturn);
  document.querySelector("#app").append(card);

  cleanup = () => {
    arcadeButton.removeEventListener("click", onArcade);
    menuButton.removeEventListener("click", onReturn);
  };
}

export function unmount() {
  cleanup();
  cleanup = () => {};
}
