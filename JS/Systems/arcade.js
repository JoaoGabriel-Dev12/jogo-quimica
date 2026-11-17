import { ARCADE_CONFIG } from "../config.js";
import { catalogo } from "../Questions/catalogo.js";
import { criarQuestao, embaralhar } from "../Questions/gerador.js";

export { embaralhar };

/**
 * Monta uma corrida arcade com questões de todas as fases, em ordem aleatória.
 * Cada modelo gera uma instância nova (com variantes e alternativas próprias).
 */
export function criarCorridaArcade({ total = ARCADE_CONFIG.totalQuestoes, rng = Math.random } = {}) {
  if (typeof rng !== "function") throw new TypeError("A corrida arcade precisa de uma função rng.");

  const limite = Math.max(1, Math.min(Number(total) || ARCADE_CONFIG.totalQuestoes, catalogo.length));
  const modelos = embaralhar(catalogo, rng).slice(0, limite);
  const usados = new Set();
  const corrida = [];

  for (const modelo of modelos) {
    let questao = criarQuestao(modelo, rng);
    // Protege contra modelos que gerem a mesma instância (ex.: template com
    // uma única variante) sem travar a montagem da corrida.
    for (let tentativa = 0; tentativa < 4 && usados.has(questao.id); tentativa += 1) {
      questao = criarQuestao(modelo, rng);
    }
    usados.add(questao.id);
    corrida.push(questao);
  }

  return corrida;
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
