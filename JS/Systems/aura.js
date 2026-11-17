import { GAME_CONFIG } from "../config.js";

export function aplicarAcerto(context, { tempoRestanteQuestao, tempoTotalQuestao }) {
  const proporcao = tempoTotalQuestao > 0 ? Math.max(0, Math.min(1, tempoRestanteQuestao / tempoTotalQuestao)) : 0;
  const bonusVelocidade = Math.round(GAME_CONFIG.aura.bonusVelocidadeMax * proporcao);
  const ganho = GAME_CONFIG.aura.acerto + bonusVelocidade;
  context.aura = (context.aura ?? 0) + ganho;
  return { aura: context.aura, variacao: ganho, bonusVelocidade };
}

export function aplicarErro(context) {
  const penalidade = GAME_CONFIG.aura.penalidadeErro ?? 50;
  context.aura = (context.aura ?? 0) - penalidade;
  return { aura: context.aura, variacao: -penalidade };
}

export function aplicarConsulta(context) {
  const penalidade = GAME_CONFIG.aura.penalidadeConsulta;
  context.aura = (context.aura ?? 0) - penalidade;
  return { aura: context.aura, variacao: -penalidade };
}
