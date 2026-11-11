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
    <p class="briefing-instructions">Responda às questões antes do tempo acabar. Acertos aumentam sua aura; consultar o caderno reduz aura, mas não pausa o timer.</p>
    <dl class="briefing-meta">
      <div><dt>Duração</dt><dd>${phase.duration}</dd></div>
      <div><dt>Nota de corte de aura</dt><dd>${phase.auraCutoff}</dd></div>
    </dl>
    <button class="button button-primary briefing-start" type="button">Começar</button>
  `;

  const button = card.querySelector("button");
  const onStart = () => context.state.goTo("JOGO", { phase: phase.number });
  button.addEventListener("click", onStart);
  document.querySelector("#app").append(card);

  cleanup = () => button.removeEventListener("click", onStart);
}

export function unmount() {
  cleanup();
  cleanup = () => {};
}
