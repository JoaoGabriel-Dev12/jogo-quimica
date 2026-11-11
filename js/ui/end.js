let cleanup = () => {};
export function mount(context) {
  const card = document.createElement("section");
  card.className = "start-card";
  card.innerHTML = `<p class="eyebrow">Fase ${context.phase ?? 11}</p><h1>Jornada concluída</h1><p class="status">Você terminou todas as fases disponíveis.</p><button class="button button-primary" type="button">Voltar ao menu</button>`;
  const button = card.querySelector("button");
  const onReturn = () => context.state.goTo("MENU");
  button.addEventListener("click", onReturn);
  document.querySelector("#app").append(card);
  cleanup = () => button.removeEventListener("click", onReturn);
}
export function unmount() { cleanup(); cleanup = () => {}; }
