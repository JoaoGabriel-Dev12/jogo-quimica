import { GAME_CONFIG } from "../config.js";
import { TOTAL_PHASES, getPhase } from "../phases.js";

let cleanup = () => {};

export function mount(context) {
  const phase = getPhase(context.phase);
  const passed = Boolean(context.passed);
  const correct = nonNegativeInteger(context.stats?.correct);
  const incorrect = nonNegativeInteger(context.stats?.incorrect);
  const consultations = nonNegativeInteger(context.consultasPorFase ?? context.stats?.penalties);
  const speedBonus = nonNegativeInteger(context.stats?.speedBonus);
  const consultationPenalty = nonNegativeInteger(context.stats?.consultationPenalty);
  const baseAura = correct * GAME_CONFIG.aura.acerto;
  const auraFinal = nonNegativeInteger(context.auraFinal);
  const cutoff = nonNegativeInteger(context.notaCorte ?? phase.auraCutoff);
  const scale = Math.max(auraFinal, cutoff, 1);
  const progress = Math.min((auraFinal / scale) * 100, 100);
  const cutoffPosition = Math.min((cutoff / scale) * 100, 100);
  const action = passed
    ? phase.number === TOTAL_PHASES ? "Finalizar" : "Próxima fase"
    : "Tentar de novo";

  const card = document.createElement("section");
  card.className = "start-card result-card";
  card.setAttribute("aria-labelledby", "result-title");
  card.innerHTML = `
    <p class="eyebrow">Resultado da fase ${phase.number}</p>
    <h1 id="result-title" class="result-${passed ? "pass" : "fail"}">${passed ? "Aprovado" : "Reprovado"}</h1>
    <section class="result-comparison" aria-label="Comparativo de aura">
      <div class="result-aura-values">
        <p>Aura final: <strong>${auraFinal}</strong></p>
        <p>Nota de corte: <strong>${cutoff}</strong></p>
      </div>
      <div class="aura-meter" role="meter" aria-label="Aura final em relação à nota de corte" aria-valuemin="0" aria-valuemax="${scale}" aria-valuenow="${auraFinal}">
        <span class="aura-meter-fill${passed ? "" : " is-failing"}" style="width: ${progress}%"></span>
        <span class="aura-meter-cutoff" style="left: ${cutoffPosition}%" aria-hidden="true"></span>
      </div>
    </section>
    <dl class="result-breakdown">
      <div><dt>Acertos (${correct})</dt><dd>+${baseAura} aura</dd></div>
      <div><dt>Erros (${incorrect})</dt><dd>0 aura</dd></div>
      <div><dt>Consultas (${consultations})</dt><dd>incluídas na penalidade</dd></div>
      <div><dt>Bônus de velocidade</dt><dd>+${speedBonus}</dd></div>
      <div><dt>Penalidade de consulta</dt><dd>−${consultationPenalty}</dd></div>
      <div class="result-total"><dt>Aura final</dt><dd>${auraFinal}</dd></div>
    </dl>
    <p class="aura-equation" aria-label="Cálculo da aura: acertos vezes ${GAME_CONFIG.aura.acerto}, mais bônus de velocidade, menos penalidade de consulta">
      ${baseAura} + ${speedBonus} − ${consultationPenalty} = ${auraFinal}
    </p>
    <button class="button button-primary" type="button">${action}</button>
  `;

  const button = card.querySelector("button");
  const onContinue = () => {
    if (passed && phase.number === TOTAL_PHASES) return context.state.goTo("FIM", { phase: phase.number });
    context.state.goTo("BRIEFING", { phase: passed ? phase.number + 1 : phase.number });
  };
  button.addEventListener("click", onContinue);
  document.querySelector("#app").append(card);
  cleanup = () => button.removeEventListener("click", onContinue);
}

export function unmount() {
  cleanup();
  cleanup = () => {};
}

function nonNegativeInteger(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.round(number)) : 0;
}
