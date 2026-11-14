import { getPhase } from "../phases.js";

export function finalizarFase({ state, phase, filaConcluida, stats, consultasPorFase }) {
  const phaseInfo = getPhase(phase);
  const auraFinal = state.context.aura ?? 0;
  const aprovado = filaConcluida === true && auraFinal >= phaseInfo.auraCutoff;
  state.goTo("RESULTADO", {
    phase,
    passed: aprovado,
    filaConcluida,
    reason: filaConcluida ? "Fila concluída" : "Tempo esgotado",
    auraFinal,
    notaCorte: phaseInfo.auraCutoff,
    stats,
    consultasPorFase,
  });
}
