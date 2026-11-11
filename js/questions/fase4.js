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
