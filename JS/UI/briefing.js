import { TOTAL_PHASES, getPhase } from "../phases.js";

let cleanup = () => {};

export function mount(context) {
  const phase = getPhase(context.phase);
  const card = document.createElement("section");
  card.className = "start-card briefing-card";
  card.setAttribute("aria-labelledby", "briefing-phase");
  card.innerHTML = `
    <p class="eyebrow">Preparação</p>
    <h1 id="briefing-phase" class="briefing-phase">Fase ${phase.number}<span> de ${TOTAL_PHASES}</span></h1>
    <p class="briefing-topic">${phase.topic}</p>
    <p class="briefing-instructions">Responda às questões antes do tempo acabar. Acertos aumentam sua aura; consultar o caderno reduz aura e pausa o timer.</p>
    <dl class="briefing-meta">
      <div><dt>Duração</dt><dd>${phase.duration}</dd></div>
      <div><dt>Nota de corte de aura</dt><dd>${phase.auraCutoff}</dd></div>
    </dl>
    <div class="button-row briefing-actions">
      <button class="button button-secondary" type="button" data-action="back">Voltar</button>
      <button class="button button-primary briefing-start" type="button" data-action="start">Começar</button>
    </div>
  `;

  const startButton = card.querySelector('[data-action="start"]');
  const backButton = card.querySelector('[data-action="back"]');
  const onStart = () => context.state.goTo("JOGO", { phase: phase.number });
  const onBack = () => context.state.goTo("MENU");
  startButton.addEventListener("click", onStart);
  backButton.addEventListener("click", onBack);
  document.querySelector("#app").append(card);

  cleanup = () => {
    startButton.removeEventListener("click", onStart);
    backButton.removeEventListener("click", onBack);
  };
}

export function unmount() {
  cleanup();
  cleanup = () => {};
}
