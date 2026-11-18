import { catalogo } from "./catalogo.js";
import { normalizarQuestao } from "./schema.js";
import { normalize } from "../Util/normalize.js";

const MAX_OPCOES = 4;
const TENTATIVAS_ID = 8;

/**
 * Cria um RNG determinístico a partir de uma semente textual.
 * Útil para depurar uma rodada específica.
 */
export function createRngFromSeed(seed) {
  let estado = hashString(String(seed)) || 1;

  return () => {
    estado += 0x6d2b79f5;
    let valor = estado;
    valor = Math.imul(valor ^ (valor >>> 15), valor | 1);
    valor ^= valor + Math.imul(valor ^ (valor >>> 7), valor | 61);
    return ((valor ^ (valor >>> 14)) >>> 0) / 4_294_967_296;
  };
}

/**
 * Compatibilidade com o código existente: `fase` + `tentativa` formam a semente.
 */
export function createSeededRng(fase, tentativa = 1) {
  return createRngFromSeed(`${fase}:${tentativa}`);
}

/**
 * Semente nova por execução. Sem isso, recarregar a página reiniciava a
 * "tentativa" e repetia exatamente as mesmas questões.
 */
export function createRunSeed() {
  const cryptoObject = globalThis.crypto;
  if (typeof cryptoObject?.randomUUID === "function") return cryptoObject.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

/** Fisher-Yates. Retorna uma nova lista embaralhada. */
export function embaralhar(itens, rng = Math.random) {
  const copia = [...itens];
  for (let i = copia.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function deduplicar(valores) {
  const vistos = new Set();
  return valores.filter((valor) => {
    const chave = normalize(valor);
    if (!chave || vistos.has(chave)) return false;
    vistos.add(chave);
    return true;
  });
}

/**
 * Monta alternativas embaralhadas sem repetir opções.
 * - Se a questão já trouxe `opcoes`, elas são respeitadas e embaralhadas.
 * - Caso contrário, usa a resposta principal + `distratores`.
 */
function montarOpcoes(questao, rng) {
  const aceitas = new Set([...questao.respostas, ...questao.aliases].map(normalize));
  const base = questao.opcoes.length
    ? [...questao.opcoes]
    : questao.distratores.length
      ? [questao.resposta, ...questao.distratores]
      : [];

  let opcoes = deduplicar(base.filter(Boolean));

  if (opcoes.length && !opcoes.some((opcao) => aceitas.has(normalize(opcao)))) {
    if (!questao.resposta) return [];
    opcoes.push(questao.resposta);
    opcoes = deduplicar(opcoes);
  }

  if (opcoes.length > MAX_OPCOES) {
    const corretas = opcoes.filter((opcao) => aceitas.has(normalize(opcao)));
    const incorretas = opcoes.filter((opcao) => !aceitas.has(normalize(opcao)));
    const limiteCorretas = incorretas.length ? 1 : MAX_OPCOES;
    opcoes = [
      ...corretas.slice(0, limiteCorretas),
      ...embaralhar(incorretas, rng).slice(0, MAX_OPCOES - limiteCorretas),
    ];
  }

  // Uma única opção não ajuda o jogador; é melhor manter o campo livre.
  return opcoes.length >= 2 ? embaralhar(opcoes, rng) : [];
}

/**
 * Gera uma instância de questão a partir de um modelo do catálogo.
 */
export function criarQuestao(modelo, rng = Math.random, contexto = {}) {
  if (!modelo || typeof modelo.gerar !== "function") {
    throw new TypeError(`Modelo de questão inválido: ${modelo?.id ?? "?"}`);
  }

  const bruta = modelo.gerar(rng, contexto);
  const questao = normalizarQuestao(bruta, modelo);
  const opcoes = montarOpcoes(questao, rng);
  const params = questao.params ?? {};

  return Object.freeze({
    ...questao,
    opcoes,
    id: `${modelo.id}-${hashParams({ params, respostas: questao.respostas, enunciado: questao.enunciado })}`,
    modelId: modelo.id,
    fase: Number(modelo.fase),
  });
}

/**
 * Sorteia uma questão da fase. Evita modelos já usados e, dentro do limite,
 * evita repetir a mesma instância (importante para templates com variantes).
 */
export function getQuestao(fase, rng = Math.random, { excludeModelIds = [], excludeQuestionIds = [] } = {}) {
  const numero = Number(fase);
  const modelosFase = catalogo.filter((modelo) => modelo.fase === numero);
  if (!modelosFase.length) throw new Error(`Nenhuma questão disponível para a fase ${fase}.`);

  const livres = modelosFase.filter((modelo) => !excludeModelIds.includes(modelo.id));
  // Se todos os modelos já foram usados, permite repetição para não travar a fase.
  const modelos = livres.length ? livres : modelosFase;

  for (let tentativa = 0; tentativa < TENTATIVAS_ID; tentativa += 1) {
    const modelo = modelos[Math.floor(rng() * modelos.length)];
    const questao = criarQuestao(modelo, rng);
    if (!excludeQuestionIds.includes(questao.id)) return questao;
  }

  return criarQuestao(modelos[Math.floor(rng() * modelos.length)], rng);
}

export function getModelos(fase) {
  return catalogo.filter((modelo) => modelo.fase === Number(fase));
}

export function getTotalQuestoes(fase) {
  return getModelos(fase).length;
}

function hashParams(valor) {
  return hashString(JSON.stringify(valor)).toString(36);
}

function hashString(valor) {
  let hash = 2_166_136_261;
  for (const caractere of String(valor)) {
    hash ^= caractere.charCodeAt(0);
    hash = Math.imul(hash, 16_777_619);
  }
  return hash >>> 0;
}
