let cleanup = () => {};
export function mount(context) {
  const card = document.createElement("section");
  card.className = "start-card";
  card.innerHTML = `<p class="eyebrow">Jogo educacional</p><h1>Química Orgânica</h1><p class="status">Responda às questões para ganhar aura e avançar pelas fases. Você pode consultar o caderno quando precisar.</p><button class="button button-primary" type="button">Jogar</button>`;
  const button = card.querySelector("button");
  const onPlay = () => context.state.goTo("BRIEFING", { phase: 1 });
  button.addEventListener("click", onPlay);
  document.querySelector("#app").append(card);
  cleanup = () => button.removeEventListener("click", onPlay);
}
export function unmount() { cleanup(); cleanup = () => {}; }
