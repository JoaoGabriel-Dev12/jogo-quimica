import { catalogo } from "./catalogo.js";

export function createSeededRng(fase, tentativa = 1) {
  let seed = hashString(`${fase}:${tentativa}`) || 1;
  return () => {
    seed += 0x6D2B79F5;
    let value = seed;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

export function getQuestao(fase, rng = Math.random, { excludeModelIds = [] } = {}) {
  const modelos = catalogo.filter((modelo) => modelo.fase === Number(fase) && !excludeModelIds.includes(modelo.id));
  if (!modelos.length) throw new Error(`Nenhuma questão disponível para a fase ${fase}.`);

  const modelo = modelos[Math.floor(rng() * modelos.length)];
  const questao = modelo.gerar(rng);
  const params = questao.params ?? {};
  const { params: _, ...dados } = questao;

  return Object.freeze({ ...dados, params, id: `${modelo.id}-${hashParams(params)}`, modelId: modelo.id, fase: modelo.fase });
}

export function getTotalQuestoes(fase) {
  return catalogo.filter((modelo) => modelo.fase === Number(fase)).length;
}

function hashParams(params) { return hashString(JSON.stringify(params)).toString(36); }
function hashString(value) {
  let hash = 2_166_136_261;
  for (const char of value) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 16_777_619); }
  return hash >>> 0;
}
