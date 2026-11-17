import { loadRanking, clearRanking } from "../Systems/ranking.js";
import { ARCADE_CONFIG } from "../config.js";
import { renderRankingList } from "./ranking-list.js";

let cleanup = () => {};

export function mount(context) {
  let ranking = loadRanking();
  const card = document.createElement("section");
  card.className = "start-card ranking-screen";
  card.setAttribute("aria-labelledby", "ranking-title");
  card.innerHTML = `
    <p class="eyebrow">Modo Arcade</p>
    <h1 id="ranking-title">Ranking</h1>
    <p class="status">As melhores pontuações salvas neste navegador. As ${ARCADE_CONFIG.rankingExibicao} primeiras aparecem aqui.</p>
    <ol class="ranking-list ranking-list-full" data-ranking></ol>
    <p class="ranking-empty" data-ranking-empty>Nenhuma pontuação registrada ainda. Jogue o modo arcade para estrear o ranking.</p>
    <div class="button-row">
      <button class="button button-primary" type="button" data-action="arcade">Jogar Arcade</button>
      <button class="button button-secondary" type="button" data-action="menu">Voltar ao menu</button>
    </div>
    <button class="text-button text-button-danger" type="button" data-action="clear">Limpar ranking local</button>
  `;

  const list = card.querySelector("[data-ranking]");
  const empty = card.querySelector("[data-ranking-empty]");
  const clearButton = card.querySelector('[data-action="clear"]');

  const render = () => {
    renderRankingList(list, ranking, {
      empty,
      mostrarData: true,
      limite: ARCADE_CONFIG.rankingExibicao,
    });
    clearButton.hidden = ranking.length === 0;
  };
  render();

  const onArcade = () => context.state.goTo("ARCADE");
  const onMenu = () => context.state.goTo("MENU");
  const onClear = () => {
    if (!window.confirm("Apagar todas as pontuações do ranking local?")) return;
    clearRanking();
    ranking = [];
    render();
  };

  const buttons = [
    [card.querySelector('[data-action="arcade"]'), onArcade],
    [card.querySelector('[data-action="menu"]'), onMenu],
    [clearButton, onClear],
  ];
  buttons.forEach(([button, handler]) => button.addEventListener("click", handler));
  document.querySelector("#app").append(card);

  cleanup = () => buttons.forEach(([button, handler]) => button.removeEventListener("click", handler));
}

export function unmount() {
  cleanup();
  cleanup = () => {};
}
