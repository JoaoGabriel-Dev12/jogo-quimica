import { defineQuestion } from "./schema.js";

const alcanosLineares = [
  "metano", "etano", "propano", "butano", "pentano",
  "hexano", "heptano", "octano", "nonano", "decano",
];

const exemplosAromaticos = ["C6H6", "C7H8", "C8H10", "C10H8"];

const casosDeCadeia = [
  { formula: "CH3-CH2-CH2-CH3", resposta: "normal" },
  { formula: "CH3-CH2-CH2-CH2-CH3", resposta: "normal" },
  { formula: "CH3-CH(CH3)-CH3", resposta: "ramificada" },
  { formula: "CH3-CH(CH3)-CH2-CH3", resposta: "ramificada" },
  { formula: "CH3-C(CH3)2-CH3", resposta: "ramificada" },
  { formula: "CH3-CH2-CH2-CH2-CH2-CH3", resposta: "normal" },
];

const casosHeteroatomo = [
  { formula: "CH3-CH2-O-CH3", resposta: "heterogênea" },
  { formula: "CH3-NH-CH2-CH3", resposta: "heterogênea" },
  { formula: "CH3-S-CH3", resposta: "heterogênea" },
  { formula: "CH3-CH2-CH2-OH", resposta: "homogênea" },
  { formula: "CH3-CH2-CH2-NH2", resposta: "homogênea" },
  { formula: "CH3-CH2-CH2-CH3", resposta: "homogênea" },
];

const casosFechamento = [
  { nome: "ciclopropano", resposta: "fechada" },
  { nome: "ciclobutano", resposta: "fechada" },
  { nome: "ciclopentano", resposta: "fechada" },
  { nome: "cicloexano", resposta: "fechada" },
  { nome: "butano", resposta: "aberta" },
  { nome: "pentano", resposta: "aberta" },
  { nome: "propeno", resposta: "aberta" },
];

export const fase4 = [
  defineQuestion({
    id: "f4-classe",
    fase: 4,
    gerar(rng) {
      const tipos = ["alcano", "alceno", "alcino"];
      const tipo = pick(tipos, rng);
      const n = randomInt(3, 6, rng);
      const formula = calculaFormula(tipo, n);
      const caracteristica = tipo === "alcino" ? "com uma ligação tripla" : "";

      return {
        enunciado: `Um hidrocarboneto de cadeia aberta ${caracteristica} tem fórmula molecular <strong>${formula}</strong>. A qual classe ele pertence?`,
        resposta: tipo,
        aliases: [tipo],
        formato: "texto",
        params: { classe: tipo, n, formula },
      };
    },
  }),
  defineQuestion({
    id: "f4-saturacao",
    fase: 4,
    gerar(rng) {
      const n = randomInt(3, 6, rng);
      const tipo = pick(["alcano", "alceno", "alcino"], rng);
      const formula = calculaFormula(tipo, n);
      const resposta = tipo === "alcano" ? "saturado" : "insaturado";

      return {
        enunciado: `O composto de fórmula molecular <strong>${formula}</strong> (cadeia aberta) é saturado ou insaturado?`,
        resposta,
        aliases: [],
        formato: "texto",
        params: { tipo, n, formula },
      };
    },
  }),
  defineQuestion({
    id: "f4-aromatico",
    fase: 4,
    gerar(rng) {
      const formula = pick(exemplosAromaticos, rng);

      return {
        enunciado: `Um hidrocarboneto de fórmula molecular <strong>${formula}</strong>, de cadeia fechada e com anel aromático, como é classificado?`,
        resposta: "aromático",
        aliases: [],
        formato: "texto",
        params: { formula, classe: "aromático" },
      };
    },
  }),
  defineQuestion({
    id: "f4-nomenclatura-linear",
    fase: 4,
    gerar(rng) {
      const n = randomInt(1, alcanosLineares.length, rng);
      const formula = calculaFormula("alcano", n);

      return {
        enunciado: `Dê o nome IUPAC do alcano de cadeia normal com <strong>${n} carbono${n > 1 ? "s" : ""}</strong> (${formula}).`,
        resposta: alcanosLineares[n - 1],
        aliases: [],
        formato: "texto",
        params: { n, formula },
      };
    },
  }),
  defineQuestion({
    id: "f4-normal-ramificada",
    fase: 4,
    gerar(rng) {
      const caso = pick(casosDeCadeia, rng);

      return {
        enunciado: `Observe o composto de fórmula estrutural <strong>${caso.formula}</strong>. Sua cadeia carbônica é normal ou ramificada?`,
        resposta: caso.resposta,
        aliases: caso.resposta === "normal" ? ["linear"] : [],
        formato: "texto",
        params: { formula: caso.formula },
      };
    },
  }),
  defineQuestion({
    id: "f4-insaturacoes",
    fase: 4,
    gerar(rng) {
      const n = randomInt(3, 8, rng);
      const tipo = pick(["alcano", "alceno", "alcino"], rng);
      const formula = calculaFormula(tipo, n);
      const insaturacoes = tipo === "alcano" ? 0 : tipo === "alceno" ? 1 : 2;

      return {
        enunciado: `Um hidrocarboneto de cadeia aberta tem fórmula molecular <strong>${formula}</strong>. Quantas insaturações ele possui?`,
        resposta: String(insaturacoes),
        aliases: insaturacoes === 0 ? ["zero", "nenhuma"] : [],
        formato: "texto",
        params: { n, tipo, formula },
      };
    },
  }),
  defineQuestion({
    id: "f4-hidrogenios",
    fase: 4,
    gerar(rng) {
      const tipo = pick(["alcano", "alceno", "alcino"], rng);
      const n = randomInt(2, 8, rng);
      const hidrogenios = {
        alcano: 2 * n + 2,
        alceno: 2 * n,
        alcino: 2 * n - 2,
      }[tipo];

      return {
        enunciado: `Quantos átomos de hidrogênio possui um <strong>${tipo}</strong> de cadeia aberta com <strong>${n} carbonos</strong>?`,
        resposta: String(hidrogenios),
        aliases: [],
        formato: "texto",
        params: { tipo, n, hidrogenios },
      };
    },
  }),
  defineQuestion({
    id: "f4-carbonos",
    fase: 4,
    gerar(rng) {
      const n = randomInt(1, alcanosLineares.length, rng);
      const nome = alcanosLineares[n - 1];

      return {
        enunciado: `Quantos átomos de carbono existem na cadeia principal do <strong>${nome}</strong>?`,
        resposta: String(n),
        aliases: [],
        formato: "texto",
        params: { nome, n },
      };
    },
  }),
  defineQuestion({
    id: "f4-homogenea-heterogenea",
    fase: 4,
    gerar(rng) {
      const caso = pick(casosHeteroatomo, rng);

      return {
        enunciado: `Observe a estrutura <strong>${caso.formula}</strong>. Quanto à presença de heteroátomo entre carbonos, essa cadeia é homogênea ou heterogênea?`,
        resposta: caso.resposta,
        aliases: caso.resposta === "heterogênea" ? ["heterogenea"] : ["homogenea"],
        formato: "texto",
        params: { formula: caso.formula },
      };
    },
  }),
  defineQuestion({
    id: "f4-aberta-fechada",
    fase: 4,
    gerar(rng) {
      const caso = pick(casosFechamento, rng);

      return {
        enunciado: `Quanto ao fechamento, o hidrocarboneto <strong>${caso.nome}</strong> possui cadeia aberta ou fechada?`,
        resposta: caso.resposta,
        aliases: caso.resposta === "fechada" ? ["cíclica", "ciclica"] : ["acíclica", "aciclica"],
        formato: "texto",
        params: { nome: caso.nome },
      };
    },
  }),
];

function calculaFormula(tipo, n) {
  const hidrogenos = {
    alcano: 2 * n + 2,
    alceno: 2 * n,
    alcino: 2 * n - 2,
  }[tipo];
  const carbono = n === 1 ? "C" : `C${n}`;
  return `${carbono}H${hidrogenos}`;
}

function pick(items, rng) {
  return items[Math.floor(rng() * items.length)];
}

function randomInt(min, max, rng) {
  return Math.floor(rng() * (max - min + 1)) + min;
}
