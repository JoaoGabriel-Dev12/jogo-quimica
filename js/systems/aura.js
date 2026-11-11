import { GAME_CONFIG } from "../config.js";

export function aplicarAcerto(context, { tempoRestanteQuestao, tempoTotalQuestao }) {
  const bonusVelocidade = Math.round(GAME_CONFIG.aura.bonusVelocidadeMax * (tempoRestanteQuestao / tempoTotalQuestao));
  const ganho = GAME_CONFIG.aura.acerto + bonusVelocidade;
  context.aura = Math.max(0, (context.aura ?? 0) + ganho);
  return { aura: context.aura, variacao: ganho, bonusVelocidade };
}

export function aplicarConsulta(context) {
  const anterior = context.aura ?? 0;
  context.aura = Math.max(0, anterior - GAME_CONFIG.aura.penalidadeConsulta);
  return { aura: context.aura, variacao: context.aura - anterior };
}
