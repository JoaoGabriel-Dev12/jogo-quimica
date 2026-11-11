import { defineQuestion } from "./schema.js";

const MOLECULAS = [
  { nome: "metano", formula: "CH4", carbonos: ["sp3"], sigmas: 4, pis: 0, geometrias: ["tetraédrica"], angulos: ["109,5"] },
  { nome: "etano", formula: "C2H6", carbonos: ["sp3", "sp3"], sigmas: 7, pis: 0, geometrias: ["tetraédrica", "tetraédrica"], angulos: ["109,5"] },
  { nome: "eteno", formula: "C2H4", carbonos: ["sp2", "sp2"], sigmas: 5, pis: 1, geometrias: ["trigonal plana"], angulos: ["120"] },
  { nome: "etino", formula: "C2H2", carbonos: ["sp", "sp"], sigmas: 3, pis: 2, geometrias: ["linear"], angulos: ["180"] },
  { nome: "propeno", formula: "C3H6", carbonos: ["sp3", "sp2", "sp2"], sigmas: 8, pis: 1, geometrias: ["trigonal plana"], angulos: ["120"] },
  { nome: "propino", formula: "C3H4", carbonos: ["sp3", "sp", "sp"], sigmas: 6, pis: 2, geometrias: ["linear"], angulos: ["180"] },
  { nome: "propanona", formula: "C3H6O", carbonos: ["sp3", "sp2", "sp3"], sigmas: 9, pis: 1, geometrias: ["trigonal plana"], angulos: ["120"] },
  { nome: "ácido acético", formula: "C2H4O2", carbonos: ["sp3", "sp2"], sigmas: 7, pis: 1, geometrias: ["trigonal plana"], angulos: ["120"] },
];

const NUMEROS_POR_EXTENSO = [
  "zero", "um", "dois", "três", "quatro", "cinco",
  "seis", "sete", "oito", "nove", "dez",
];
const MOLECULAS_COM_HIBRIDIZACAO_UNICA = MOLECULAS.filter(
  (molecula) => new Set(molecula.carbonos).size === 1,
);
const MOLECULAS_COM_HIBRIDIZACAO_MISTA = MOLECULAS.filter(
  (molecula) => new Set(molecula.carbonos).size > 1,
);
const MOLECULAS_COM_LIGACAO_PI = MOLECULAS.filter((molecula) => molecula.pis > 0);

export const fase3 = [
  defineQuestion({
    id: "f3-hibridizacao",
    fase: 3,
    gerar(rng) {
      const molecula = pick(MOLECULAS_COM_HIBRIDIZACAO_UNICA, rng);
      const hibridizacao = molecula.carbonos[0];

      return {
        enunciado: `No <strong>${molecula.nome}</strong> (${molecula.formula}), qual é a hibridização dos carbonos?`,
        resposta: hibridizacao,
        aliases: [hibridizacao.toUpperCase()],
        formato: "texto",
        params: { molecula: molecula.nome, hibridizacao },
      };
    },
  }),
  defineQuestion({
    id: "f3-angulo",
    fase: 3,
    gerar(rng) {
      const molecula = pick(MOLECULAS_COM_HIBRIDIZACAO_UNICA, rng);
      const angulo = molecula.angulos[0];
      const anguloDecimal = angulo.replace(",", ".");

      return {
        enunciado: `Qual é o ângulo aproximado entre as ligações do carbono no <strong>${molecula.nome}</strong>?`,
        resposta: `${angulo}°`,
        aliases: [
          angulo,
          `${angulo} graus`,
          `${angulo}º`,
          `${anguloDecimal}°`,
          `${anguloDecimal} graus`,
        ],
        formato: "texto",
        params: { molecula: molecula.nome, angulo },
      };
    },
  }),
  defineQuestion({
    id: "f3-geometria",
    fase: 3,
    gerar(rng) {
      const molecula = pick(MOLECULAS_COM_HIBRIDIZACAO_UNICA, rng);
      const geometria = molecula.geometrias[0];

      return {
        enunciado: `Qual é a geometria dos carbonos no <strong>${molecula.nome}</strong> (${molecula.formula})?`,
        resposta: geometria,
        aliases: geometria === "trigonal plana" ? ["trigonal"] : [],
        formato: "texto",
        params: { molecula: molecula.nome, geometria },
      };
    },
  }),
  defineQuestion({
    id: "f3-sigma",
    fase: 3,
    gerar(rng) {
      const molecula = pick(MOLECULAS, rng);

      return {
        enunciado: `Quantas ligações sigma (σ) existem na molécula de <strong>${molecula.nome}</strong> (${molecula.formula})?`,
        resposta: String(molecula.sigmas),
        aliases: aliasesNumericos(molecula.sigmas),
        formato: "texto",
        params: { molecula: molecula.nome, sigmas: molecula.sigmas },
      };
    },
  }),
  defineQuestion({
    id: "f3-pi",
    fase: 3,
    gerar(rng) {
      const molecula = pick(MOLECULAS_COM_LIGACAO_PI, rng);

      return {
        enunciado: `Quantas ligações pi (π) existem na molécula de <strong>${molecula.nome}</strong> (${molecula.formula})?`,
        resposta: String(molecula.pis),
        aliases: aliasesNumericos(molecula.pis),
        formato: "texto",
        params: { molecula: molecula.nome, pis: molecula.pis },
      };
    },
  }),
  defineQuestion({
    id: "f3-contagem-tipo",
    fase: 3,
    gerar(rng) {
      const molecula = pick(MOLECULAS_COM_HIBRIDIZACAO_MISTA, rng);
      const tipos = [...new Set(molecula.carbonos)];
      const hibridizacao = pick(tipos, rng);
      const quantidade = molecula.carbonos.filter((tipo) => tipo === hibridizacao).length;

      return {
        enunciado: `Na molécula de <strong>${molecula.nome}</strong> (${molecula.formula}), quantos carbonos têm hibridização <strong>${hibridizacao}</strong>?`,
        resposta: String(quantidade),
        aliases: aliasesNumericos(quantidade),
        formato: "texto",
        params: { molecula: molecula.nome, hibridizacao, quantidade },
      };
    },
  }),
];

function aliasesNumericos(numero) {
  return numero >= 0 && numero < NUMEROS_POR_EXTENSO.length
    ? [NUMEROS_POR_EXTENSO[numero]]
    : [];
}

function pick(items, rng) {
  return items[Math.floor(rng() * items.length)];
}
