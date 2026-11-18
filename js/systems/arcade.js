import { ARCADE_CONFIG } from "../config.js";
import { catalogo } from "../questions/catalogo.js";
import { criarQuestao } from "../questions/gerador.js";

/**
 * Fisher-Yates. Retorna uma nova lista embaralhada (não altera a original).
 */
export function embaralhar(itens, rng = Math.random) {
  const copia = [...itens];
  for (let i = copia.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/**
 * Monta uma corrida arcade com questões de todas as fases, em ordem aleatória.
 */
export function criarCorridaArcade({ total = ARCADE_CONFIG.totalQuestoes, rng = Math.random } = {}) {
  if (typeof rng !== "function") throw new TypeError("A corrida arcade precisa de uma função rng.");

  const limite = Math.max(1, Math.min(Number(total) || ARCADE_CONFIG.totalQuestoes, catalogo.length));
  const modelos = embaralhar(catalogo, rng).slice(0, limite);
  return modelos.map((modelo) => criarQuestao(modelo, rng));
}

/**
 * Pontuação de uma resposta correta: base + bônus de velocidade + bônus de combo.
 */
export function calcularPontos({ tempoRestante = 0, tempoTotal = 1, comboAnterior = 0 }, config = ARCADE_CONFIG) {
  const proporcao = tempoTotal > 0 ? Math.max(0, Math.min(1, tempoRestante / tempoTotal)) : 0;
  const bonusTempo = Math.round(config.bonusTempoMax * proporcao);
  const bonusCombo = Math.min(Math.max(0, comboAnterior), config.comboMax) * config.bonusCombo;

  return {
    base: config.pontosAcerto,
    bonusTempo,
    bonusCombo,
    total: config.pontosAcerto + bonusTempo + bonusCombo,
  };
}

export function formatarTempo(segundos) {
  const inteiro = Math.max(0, Math.ceil(Number(segundos) || 0));
  return `${String(Math.floor(inteiro / 60)).padStart(2, "0")}:${String(inteiro % 60).padStart(2, "0")}`;
}
