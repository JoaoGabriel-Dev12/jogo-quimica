import { ARCADE_CONFIG } from "../config.js";
import { TOTAL_PHASES } from "../phases.js";
import { loadRanking } from "../systems/ranking.js";
import { icons } from "./icons.js";
import { renderRankingList } from "./ranking-list.js";

let cleanup = () => {};

export function mount(context) {
  const ranking = loadRanking();
  const card = document.createElement("section");
  card.className = "start-card menu-card";
  card.setAttribute("aria-labelledby", "app-title");
  card.innerHTML = `
    <header class="menu-header">
      <p class="eyebrow">Laboratório Neon</p>
      <h1 id="app-title">Química Orgânica</h1>
      <p class="status">Escolha um modo de jogo. Acerte as questões, ganhe aura e suba no ranking.</p>
    </header>
    <div class="mode-grid">
      <button class="mode-card" type="button" data-mode="jornada">
        <span class="mode-icon" aria-hidden="true">${icons.flask}</span>
        <span class="mode-copy">
          <span class="mode-title">Jornada</span>
          <span class="mode-description">${TOTAL_PHASES} fases, caderno de consulta e nota de corte de aura.</span>
        </span>
        <span class="mode-arrow" aria-hidden="true">${icons.arrowRight}</span>
      </button>
      <button class="mode-card mode-card-arcade" type="button" data-mode="arcade">
        <span class="mode-icon" aria-hidden="true">${icons.bolt}</span>
        <span class="mode-copy">
          <span class="mode-title">Modo Arcade</span>
          <span class="mode-description">${ARCADE_CONFIG.totalQuestoes} questões aleatórias · ${ARCADE_CONFIG.tempoPorQuestao}s por questão · ${ARCADE_CONFIG.vidas} vidas.</span>
        </span>
        <span class="mode-arrow" aria-hidden="true">${icons.arrowRight}</span>
      </button>
    </div>
    <section class="panel ranking-preview" aria-labelledby="ranking-preview-title">
      <div class="panel-heading">
        <h2 id="ranking-preview-title">Ranking Arcade</h2>
        <button class="text-button" type="button" data-action="ranking">Ver tudo</button>
      </div>
      <ol class="ranking-list" data-ranking-preview></ol>
      <p class="ranking-empty" data-ranking-empty>Nenhuma pontuação registrada ainda. Seja o primeiro do laboratório.</p>
    </section>
  `;

  const preview = card.querySelector("[data-ranking-preview]");
  const empty = card.querySelector("[data-ranking-empty]");
  renderRankingList(preview, ranking, { empty, limite: 5 });

  const onJourney = () => context.state.goTo("BRIEFING", { phase: 1 });
  const onArcade = () => context.state.goTo("ARCADE");
  const onRanking = () => context.state.goTo("RANKING");

  const buttons = [
    [card.querySelector('[data-mode="jornada"]'), onJourney],
    [card.querySelector('[data-mode="arcade"]'), onArcade],
    [card.querySelector('[data-action="ranking"]'), onRanking],
  ];

  buttons.forEach(([button, handler]) => button.addEventListener("click", handler));
  document.querySelector("#app").append(card);

  cleanup = () => buttons.forEach(([button, handler]) => button.removeEventListener("click", handler));
}

export function unmount() {
  cleanup();
  cleanup = () => {};
}
