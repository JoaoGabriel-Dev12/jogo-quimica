import { getPhase } from "../phases.js";
import { createRngFromSeed, createRunSeed, getQuestao, getTotalQuestoes } from "../Questions/gerador.js";

/**
 * Cria o estado de uma tentativa de fase. A UI não precisa saber como as
 * questões são sorteadas: ela apenas pede a próxima e marca a atual como usada.
 */
export function criarSessaoFase(phase) {
  const numero = Number(phase);
  const seed = createRunSeed();
  const total = Math.max(1, getTotalQuestoes(numero));
  let usados = [];
  let vistas = [];

  return {
    total,
    get usados() { return usados; },
    get vistas() { return vistas; },
    proxima() {
      return getQuestao(numero, createRngFromSeed(`${numero}:${seed}:${usados.length}`), {
        excludeModelIds: usados,
        excludeQuestionIds: vistas,
      });
    },
    marcar(questao) {
      if (!questao) return;
      if (!usados.includes(questao.modelId)) usados = [...usados, questao.modelId];
      if (!vistas.includes(questao.id)) vistas = [...vistas, questao.id];
    },
    concluida() {
      return usados.length >= total;
    },
  };
}

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
