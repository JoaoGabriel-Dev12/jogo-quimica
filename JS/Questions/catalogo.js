/**
 * Catálogo de questões do jogo de Química Orgânica.
 *
 * Cada fase possui um bloco próprio de modelos. Há três formas de questão:
 * - `modelo(...)`: enunciado estático, aceitando uma ou várias respostas.
 * - `defineQuestion({ gerar })`: questão dinâmica, com parâmetros sorteados.
 * - `template(...)`: modelo declarativo com variantes e placeholders `{campo}`.
 *
 * O array `catalogo` reúne tudo na ordem das fases e é consumido por
 * `gerador.js` e `Systems/arcade.js`.
 */

import { defineQuestion } from "./schema.js";

/* ======================================================================== */
/* HELPERS                                                                  */
/* ======================================================================== */

/** Cria uma questão estática a partir de um enunciado fixo. */
function modelo({
  id,
  fase,
  enunciado,
  resposta,
  respostas,
  aliases = [],
  distratores = [],
  opcoes,
  formato = "texto",
  validarResposta,
}) {
  return defineQuestion({
    id,
    fase,
    enunciado,
    resposta,
    respostas,
    aliases,
    distratores,
    opcoes,
    formato,
    validarResposta,
  });
}

/**
 * Cria um modelo declarativo. O gerador escolhe uma variante e substitui
 * `{campo}` no enunciado, respostas, aliases, distratores e opções.
 * `enunciado`, `respostas`, `distratores`, etc. também podem ser funções.
 */
function template({
  id,
  fase,
  enunciado,
  respostas,
  aliases = [],
  distratores = [],
  opcoes,
  formato = "texto",
  params,
  variantes,
  montar,
  sortearVariante,
}) {
  return defineQuestion({
    id,
    fase,
    formato,
    variantes,
    montar,
    sortearVariante,
    template: { enunciado, respostas, aliases, distratores, opcoes, formato, params },
  });
}

/** Sorteia um item de uma lista usando o gerador informado. */
function pick(items, rng) {
  return items[Math.floor(rng() * items.length)];
}

/** Sorteia um inteiro entre min e max (inclusive). */
function randomInt(min, max, rng) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

/** Aceita a forma numérica por extenso (ex.: "4" ou "quatro"). */
function aliasesNumericos(numero) {
  return numero >= 0 && numero < NUMEROS_POR_EXTENSO.length
    ? [NUMEROS_POR_EXTENSO[numero]]
    : [];
}

/** Monta a fórmula molecular de um hidrocarboneto de cadeia aberta. */
function calculaFormula(tipo, n) {
  const hidrogenos = {
    alcano: 2 * n + 2,
    alceno: 2 * n,
    alcino: 2 * n - 2,
  }[tipo];
  const carbono = n === 1 ? "C" : `C${n}`;
  return `${carbono}H${hidrogenos}`;
}

/** Gera distratores numéricos únicos a partir de um valor correto. */
function distratoresNumericos(valor, extras = []) {
  return [...new Set([valor - 1, valor + 1, valor + 2, ...extras])]
    .filter((numero) => numero >= 0 && numero !== valor)
    .map(String);
}

/* ======================================================================== */
/* FASE 1 · DADOS DE APOIO                                                  */
/* ======================================================================== */

const ELEMENTOS = [
  {
    nome: "carbono", simbolo: "C", z: 6, zExtenso: "seis",
    valencia: 4, valenciaExtenso: "quatro",
    familia: "14", familiaA: "4A", familiaRomano: "IVA",
  },
  {
    nome: "hidrogênio", simbolo: "H", z: 1, zExtenso: "um",
    valencia: 1, valenciaExtenso: "um",
    familia: "1", familiaA: "1A", familiaRomano: "IA",
  },
  {
    nome: "oxigênio", simbolo: "O", z: 8, zExtenso: "oito",
    valencia: 6, valenciaExtenso: "seis",
    familia: "16", familiaA: "6A", familiaRomano: "VIA",
  },
  {
    nome: "nitrogênio", simbolo: "N", z: 7, zExtenso: "sete",
    valencia: 5, valenciaExtenso: "cinco",
    familia: "15", familiaA: "5A", familiaRomano: "VA",
  },
];

/** Vários elementos são aceitos porque a pergunta pede apenas um exemplo. */
const ELEMENTOS_ORGANOGENOS = [
  "hidrogênio", "H",
  "oxigênio", "O",
  "nitrogênio", "N",
  "enxofre", "S",
  "fósforo", "P",
];


/* ======================================================================== */
/* FASE 3 · DADOS DE APOIO                                                  */
/* ======================================================================== */

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

/* ======================================================================== */
/* FASE 4 · DADOS DE APOIO                                                  */
/* ======================================================================== */

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

/* ======================================================================== */
/* FASE 1 · Introdução ao Carbono e Estrutura Atômica                       */
/* ======================================================================== */
const questoesFase1 = [
  template({
    id: "fase1-octeto-01",
    fase: 1,
    enunciado: "O {nome} tem número atômico Z = ___.",
    respostas: ["{z}", "{zExtenso}", "Z = {z}", "Z={z}"],
    variantes: ELEMENTOS,
    distratores: ({ z }) => ELEMENTOS
      .filter((elemento) => elemento.z !== z)
      .map((elemento) => String(elemento.z)),
    params: ["nome", "z"],
    formato: "lacuna",
  }),

  template({
    id: "fase1-carbono-02",
    fase: 1,
    enunciado: "Qual é o símbolo químico do {nome}?",
    respostas: ["{simbolo}"],
    variantes: ELEMENTOS,
    distratores: ({ simbolo }) => ELEMENTOS
      .filter((elemento) => elemento.simbolo !== simbolo)
      .map((elemento) => elemento.simbolo),
    params: ["nome", "simbolo"],
  }),

  template({
    id: "fase1-valencia-03",
    fase: 1,
    enunciado: "Quantos elétrons o {nome} possui na camada de valência?",
    respostas: ["{valencia}", "{valenciaExtenso}"],
    variantes: ELEMENTOS,
    distratores: ({ valencia }) => [...new Set(
      ELEMENTOS
        .filter((elemento) => elemento.valencia !== valencia)
        .map((elemento) => String(elemento.valencia)),
    )],
    params: ["nome", "valencia"],
  }),

  modelo({
    id: "fase1-camadas-04",
    fase: 1,
    enunciado: "O átomo de carbono no estado fundamental possui ___ camadas eletrônicas.",
    resposta: "2",
    aliases: ["duas"],
    formato: "lacuna",
  }),

  modelo({
    id: "fase1-organica-05",
    fase: 1,
    enunciado: "A Química Orgânica estuda principalmente os compostos formados por qual elemento?",
    resposta: "carbono",
    aliases: ["C", "o carbono"],
    formato: "texto",
  }),

  modelo({
    id: "fase1-vitalismo-06",
    fase: 1,
    enunciado: "Quem derrubou a teoria da força vital ao sintetizar a ureia em laboratório?",
    resposta: "Wöhler",
    aliases: ["Wohler", "Friedrich Wöhler", "Friedrich Wohler"],
    formato: "texto",
  }),

  modelo({
    id: "fase1-ureia-07",
    fase: 1,
    enunciado: "A ureia foi o primeiro composto orgânico sintetizado em laboratório? (sim/não)",
    resposta: "sim",
    aliases: ["s"],
    formato: "texto",
  }),

  modelo({
    id: "fase1-inorganico-08",
    fase: 1,
    enunciado: "O gás carbônico (CO₂) é considerado um composto orgânico? (sim/não)",
    resposta: "não",
    aliases: ["nao", "n"],
    formato: "texto",
  }),

  modelo({
    id: "fase1-organogenos-09",
    fase: 1,
    // Várias respostas diferentes são válidas: o jogador pode citar qualquer
    // elemento organógeno, não apenas o hidrogênio.
    enunciado: "Cite um elemento organógeno (presente em compostos orgânicos) além do carbono.",
    respostas: ELEMENTOS_ORGANOGENOS,
    distratores: ["carbono", "sódio", "ferro", "cálcio"],
    formato: "texto",
  }),

  template({
    id: "fase1-familia-10",
    fase: 1,
    enunciado: "Na tabela periódica, o {nome} pertence ao grupo (família) ___.",
    respostas: ["{familia}", "{familiaA}", "{familiaRomano}", "grupo {familia}", "família {familia}"],
    variantes: ELEMENTOS,
    distratores: ({ familia }) => ELEMENTOS
      .filter((elemento) => elemento.familia !== familia)
      .map((elemento) => elemento.familia),
    params: ["nome", "familia"],
    formato: "lacuna",
  }),
];

/* ======================================================================== */
/* FASE 2 · Postulados de Kekulé, Ligações e Hibridização                   */
/* ======================================================================== */
const questoesFase2 = [
  modelo({
    id: "fase2-tetravalencia-01",
    fase: 2,
    enunciado: "O carbono é tetravalente? (sim/não)",
    resposta: "sim",
    aliases: ["s"],
    formato: "texto",
  }),

  modelo({
    id: "fase2-ligacoes-02",
    fase: 2,
    enunciado: "Quantas ligações o carbono pode formar?",
    resposta: "4",
    aliases: ["quatro"],
    formato: "texto",
  }),

  modelo({
    id: "fase2-tipo-ligacao-03",
    fase: 2,
    enunciado: "Qual tipo de ligação química predomina entre átomos de carbono?",
    resposta: "covalente",
    aliases: ["ligação covalente", "ligacao covalente"],
    formato: "texto",
  }),

  modelo({
    id: "fase2-kekule-04",
    fase: 2,
    enunciado: "As quatro valências do carbono são iguais entre si? (sim/não)",
    resposta: "sim",
    aliases: ["s"],
    formato: "texto",
  }),

  modelo({
    id: "fase2-encadeamento-05",
    fase: 2,
    enunciado: "A capacidade do carbono de formar longas cadeias chama-se ___.",
    resposta: "encadeamento",
    aliases: ["concatenação", "concatenacao"],
    formato: "lacuna",
  }),

  modelo({
    id: "fase2-sp3-06",
    fase: 2,
    enunciado: "Um carbono que faz apenas ligações simples possui hibridização ___.",
    resposta: "sp3",
    aliases: ["sp³"],
    formato: "lacuna",
  }),

  modelo({
    id: "fase2-sp2-07",
    fase: 2,
    enunciado: "Um carbono com uma ligação dupla e duas simples possui hibridização ___.",
    resposta: "sp2",
    aliases: ["sp²"],
    formato: "lacuna",
  }),

  modelo({
    id: "fase2-sp-08",
    fase: 2,
    enunciado: "Um carbono com uma ligação tripla e uma simples possui hibridização ___.",
    resposta: "sp",
    aliases: ["sp1"],
    formato: "lacuna",
  }),

  template({
    id: "fase2-sigma-pi-09",
    fase: 2,
    enunciado: "Em uma ligação {tipo} entre carbonos, existe uma ligação sigma e ___ ligação(ões) pi.",
    respostas: ["{pi}", "{piExtenso}", "{piAlternativo}"],
    variantes: [
      { tipo: "simples", pi: "0", piExtenso: "nenhuma", piAlternativo: "zero" },
      { tipo: "dupla", pi: "1", piExtenso: "uma", piAlternativo: "um" },
      { tipo: "tripla", pi: "2", piExtenso: "duas", piAlternativo: "dois" },
    ],
    distratores: ({ pi }) => ["0", "1", "2", "3"].filter((valor) => valor !== pi),
    params: ["tipo", "pi"],
    formato: "lacuna",
  }),

  modelo({
    id: "fase2-tripla-10",
    fase: 2,
    enunciado: "Quantas ligações pi existem em uma ligação tripla?",
    resposta: "2",
    aliases: ["duas"],
    formato: "texto",
  }),
];

/* ======================================================================== */
/* FASE 3 · HIBRIDIZAÇÃO, GEOMETRIA E LIGAÇÕES                              */
/* ======================================================================== */
const questoesFase3 = [
  defineQuestion({
    id: "f3-hibridizacao",
    fase: 3,
    gerar(rng) {
      const molecula = pick(MOLECULAS_COM_HIBRIDIZACAO_UNICA, rng);
      const hibridizacao = molecula.carbonos[0];

      return {
        enunciado: `No <strong>${molecula.nome}</strong> (${molecula.formula}), qual é a hibridização dos carbonos?`,
        respostas: [hibridizacao, hibridizacao.toUpperCase()],
        distratores: ["sp3", "sp2", "sp"].filter((tipo) => tipo !== hibridizacao),
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
        respostas: [
          `${angulo}°`,
          angulo,
          `${angulo} graus`,
          `${angulo}º`,
          `${anguloDecimal}°`,
          `${anguloDecimal} graus`,
        ],
        distratores: ["109,5", "120", "180"]
          .filter((valor) => valor !== angulo)
          .map((valor) => `${valor}°`),
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
        respostas: geometria === "trigonal plana" ? [geometria, "trigonal"] : [geometria],
        distratores: ["tetraédrica", "trigonal plana", "linear"].filter((valor) => valor !== geometria),
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
        respostas: [String(molecula.sigmas), ...aliasesNumericos(molecula.sigmas)],
        distratores: distratoresNumericos(molecula.sigmas),
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
        respostas: [String(molecula.pis), ...aliasesNumericos(molecula.pis)],
        distratores: ["0", "1", "2", "3"].filter((valor) => Number(valor) !== molecula.pis),
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
        respostas: [String(quantidade), ...aliasesNumericos(quantidade)],
        distratores: distratoresNumericos(quantidade),
        formato: "texto",
        params: { molecula: molecula.nome, hibridizacao, quantidade },
      };
    },
  }),

  defineQuestion({
    id: "f3-saturacao",
    fase: 3,
    gerar(rng) {
      const molecula = pick(MOLECULAS, rng);
      const saturada = molecula.pis === 0;
      const resposta = saturada ? "saturada" : "insaturada";

      return {
        enunciado: `Quanto às ligações entre átomos, a molécula de <strong>${molecula.nome}</strong> (${molecula.formula}) é <strong>saturada</strong> ou <strong>insaturada</strong>?`,
        respostas: [resposta, saturada ? "saturado" : "insaturado"],
        distratores: [saturada ? "insaturada" : "saturada"],
        formato: "texto",
        params: { molecula: molecula.nome, saturada },
      };
    },
  }),

  defineQuestion({
    id: "f3-total-ligacoes",
    fase: 3,
    gerar(rng) {
      const molecula = pick(MOLECULAS, rng);
      const total = molecula.sigmas + molecula.pis;

      return {
        enunciado: `Somando ligações sigma (σ) e pi (π), qual é o total de ligações covalentes no <strong>${molecula.nome}</strong> (${molecula.formula})?`,
        respostas: [String(total), ...aliasesNumericos(total)],
        distratores: distratoresNumericos(total),
        formato: "texto",
        params: { molecula: molecula.nome, total },
      };
    },
  }),

  defineQuestion({
    id: "f3-carbonos-saturados",
    fase: 3,
    gerar(rng) {
      const molecula = pick(MOLECULAS, rng);
      const saturados = molecula.carbonos.filter((tipo) => tipo === "sp3").length;

      return {
        enunciado: `Quantos carbonos saturados (apenas ligações simples) existem no <strong>${molecula.nome}</strong> (${molecula.formula})?`,
        respostas: [String(saturados), ...aliasesNumericos(saturados)],
        distratores: distratoresNumericos(saturados),
        formato: "texto",
        params: { molecula: molecula.nome, saturados },
      };
    },
  }),

  defineQuestion({
    id: "f3-hibridizacao-geometria",
    fase: 3,
    gerar(rng) {
      const molecula = pick(MOLECULAS_COM_HIBRIDIZACAO_UNICA, rng);
      const geometria = molecula.geometrias[0];
      const hibridizacao = molecula.carbonos[0];

      return {
        enunciado: `Um carbono com geometria <strong>${geometria}</strong> (como no ${molecula.nome}) apresenta qual hibridização?`,
        respostas: [hibridizacao, hibridizacao.toUpperCase()],
        distratores: ["sp3", "sp2", "sp"].filter((tipo) => tipo !== hibridizacao),
        formato: "texto",
        params: { molecula: molecula.nome, geometria, hibridizacao },
      };
    },
  }),
];

/* ======================================================================== */
/* FASE 4 · CLASSIFICAÇÃO E NOMENCLATURA DE CADEIAS                         */
/* ======================================================================== */
const questoesFase4 = [
  defineQuestion({
    id: "f4-classe",
    fase: 4,
    gerar(rng) {
      const tipos = ["alcano", "alceno", "alcino"];
      const tipo = pick(tipos, rng);
      const n = randomInt(3, 6, rng);
      const formula = calculaFormula(tipo, n);
      const caracteristica = tipo === "alcino" ? "com uma ligação tripla" : "";
      const sinonimos = {
        alcano: ["alcano", "parafina"],
        alceno: ["alceno", "olefina"],
        alcino: ["alcino"],
      }[tipo];

      return {
        enunciado: `Um hidrocarboneto de cadeia aberta ${caracteristica} tem fórmula molecular <strong>${formula}</strong>. A qual classe ele pertence?`,
        respostas: sinonimos,
        distratores: tipos.filter((outro) => outro !== tipo),
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
        respostas: [resposta, resposta === "saturado" ? "saturada" : "insaturada"],
        distratores: [resposta === "saturado" ? "insaturado" : "saturado"],
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
        respostas: ["aromático", "aromática"],
        distratores: ["alifático", "alicíclico", "insaturado"],
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
        respostas: [alcanosLineares[n - 1]],
        distratores: alcanosLineares.filter((nome) => nome !== alcanosLineares[n - 1]),
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
        respostas: [caso.resposta, ...(caso.resposta === "normal" ? ["linear"] : [])],
        distratores: [caso.resposta === "normal" ? "ramificada" : "normal"],
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
        respostas: [String(insaturacoes), ...(insaturacoes === 0 ? ["zero", "nenhuma"] : aliasesNumericos(insaturacoes))],
        distratores: ["0", "1", "2", "3"].filter((valor) => Number(valor) !== insaturacoes),
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
        respostas: [String(hidrogenios), ...aliasesNumericos(hidrogenios)],
        distratores: distratoresNumericos(hidrogenios),
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
        respostas: [String(n), ...aliasesNumericos(n)],
        distratores: distratoresNumericos(n),
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
        respostas: [caso.resposta, caso.resposta === "heterogênea" ? "heterogenea" : "homogenea"],
        distratores: [caso.resposta === "heterogênea" ? "homogênea" : "heterogênea"],
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
        respostas: [
          caso.resposta,
          ...(caso.resposta === "fechada" ? ["cíclica", "ciclica"] : ["acíclica", "aciclica"]),
        ],
        distratores: [caso.resposta === "fechada" ? "aberta" : "fechada"],
        formato: "texto",
        params: { nome: caso.nome },
      };
    },
  }),
];

/* ======================================================================== */
/* FASE 5 · Nomenclatura IUPAC Básica (Prefixos, Infixos, Hidrocarbonetos)  */
/* ======================================================================== */

const PREFIXOS = [
  ["met", "metano"],
  ["et", "etano"],
  ["prop", "propano"],
  ["but", "butano"],
  ["pent", "pentano"],
  ["hex", "hexano"],
  ["hept", "heptano"],
  ["oct", "octano"],
  ["non", "nonano"],
  ["dec", "decano"],
].map(([prefixo, nome], indice) => ({
  n: indice + 1,
  prefixo,
  nome,
  formula: calculaFormula("alcano", indice + 1),
}));

const questoesFase5 = [
  modelo({
    id: "fase5-metano-01",
    fase: 5,
    enunciado: "O nome CH₄ é metano? (sim/não)",
    resposta: "sim",
    aliases: ["s"],
    formato: "texto",
  }),

  modelo({
    id: "fase5-etano-02",
    fase: 5,
    enunciado: "O prefixo et- indica dois carbonos? (sim/não)",
    resposta: "sim",
    aliases: ["s"],
    formato: "texto",
  }),

  template({
    id: "fase5-prefixo-met-03",
    fase: 5,
    enunciado: ({ n }) => `Qual prefixo IUPAC indica a presença de ${n} átomo${n > 1 ? "s" : ""} de carbono?`,
    respostas: ["{prefixo}", "{prefixo}-"],
    variantes: PREFIXOS,
    distratores: ({ prefixo }) => PREFIXOS
      .filter((item) => item.prefixo !== prefixo)
      .map((item) => item.prefixo),
    params: ["n", "prefixo"],
  }),

  modelo({
    id: "fase5-prefixo-prop-04",
    fase: 5,
    enunciado: "Qual prefixo IUPAC indica a presença de 3 átomos de carbono?",
    resposta: "prop",
    aliases: ["prop-"],
    formato: "texto",
  }),

  modelo({
    id: "fase5-prefixo-but-05",
    fase: 5,
    enunciado: "O prefixo but- indica uma cadeia com ___ átomos de carbono.",
    resposta: "4",
    aliases: ["quatro"],
    formato: "lacuna",
  }),

  modelo({
    id: "fase5-prefixo-pent-06",
    fase: 5,
    enunciado: "Qual prefixo IUPAC corresponde a 5 átomos de carbono?",
    resposta: "pent",
    aliases: ["pent-"],
    formato: "texto",
  }),

  modelo({
    id: "fase5-infixo-an-07",
    fase: 5,
    enunciado: "O infixo -an- indica que a cadeia possui apenas ligações ___.",
    resposta: "simples",
    aliases: ["saturadas"],
    formato: "lacuna",
  }),

  modelo({
    id: "fase5-infixo-en-08",
    fase: 5,
    enunciado: "O infixo -en- indica a presença de uma ligação ___ na cadeia.",
    resposta: "dupla",
    aliases: ["insaturada"],
    formato: "lacuna",
  }),

  modelo({
    id: "fase5-sufixo-hc-09",
    fase: 5,
    enunciado: "Qual é a terminação (sufixo) IUPAC de todos os hidrocarbonetos?",
    resposta: "o",
    aliases: ["-o"],
    formato: "texto",
  }),

  template({
    id: "fase5-propano-10",
    fase: 5,
    enunciado: ({ n, formula }) => `Qual é o nome IUPAC do alcano de cadeia normal com ${n} carbono${n > 1 ? "s" : ""} (${formula})?`,
    respostas: ({ nome, n }) => (n >= 3 ? [nome, `n-${nome}`] : [nome]),
    variantes: PREFIXOS,
    distratores: ({ nome }) => PREFIXOS
      .filter((item) => item.nome !== nome)
      .map((item) => item.nome),
    params: ["n", "nome", "formula"],
  }),
];

/* ======================================================================== */
/* FASE 6 · Isomeria Plana (Constitucional)                                 */
/* ======================================================================== */

const PARES_ISOMEROS_CADEIA = [
  ["butano", "isobutano"],
  ["butano", "metilpropano"],
  ["pentano", "isopentano"],
  ["pentano", "neopentano"],
  ["hexano", "2-metilpentano"],
  ["hexano", "3-metilpentano"],
];

/**
 * Aceita qualquer par válido de isômeros de cadeia, em qualquer ordem e com
 * separadores diferentes ("e", vírgula, "+", "/").
 */
function validarParIsomeros(valor, { normalizar }) {
  const partes = valor
    .split(/\s*(?:\be\b|,|\+|\/|&)\s*/u)
    .map((parte) => normalizar(parte))
    .filter(Boolean);

  if (partes.length !== 2) return false;
  const [primeiro, segundo] = [...partes].sort();

  return PARES_ISOMEROS_CADEIA.some(([a, b]) => {
    const [normalizadoA, normalizadoB] = [normalizar(a), normalizar(b)].sort();
    return normalizadoA === primeiro && normalizadoB === segundo;
  });
}

const questoesFase6 = [
  modelo({
    id: "fase6-cadeia-01",
    fase: 6,
    enunciado: "Isômeros planos têm a mesma fórmula molecular? (sim/não)",
    resposta: "sim",
    aliases: ["s"],
    formato: "texto",
  }),

  modelo({
    id: "fase6-butano-02",
    fase: 6,
    // Uma mesma pergunta aceita vários pares corretos, em qualquer ordem.
    enunciado: "Cite um par de isômeros de cadeia (dois compostos).",
    respostas: ["butano e isobutano", "pentano e isopentano", "hexano e 2-metilpentano"],
    distratores: ["butano e pentano", "etano e eteno", "propano e butano"],
    validarResposta: validarParIsomeros,
    formato: "texto",
  }),

  modelo({
    id: "fase6-definicao-03",
    fase: 6,
    enunciado: "Isômeros possuem propriedades físicas e químicas idênticas? (sim/não)",
    resposta: "não",
    aliases: ["nao", "n"],
    formato: "texto",
  }),

  modelo({
    id: "fase6-tipo-butano-04",
    fase: 6,
    enunciado: "Butano (cadeia normal) e metilpropano (ramificada) apresentam isomeria de ___.",
    resposta: "cadeia",
    aliases: ["núcleo", "nucleo"],
    formato: "lacuna",
  }),

  modelo({
    id: "fase6-posicao-05",
    fase: 6,
    enunciado: "Propan-1-ol e propan-2-ol diferem apenas na localização da hidroxila. Esse é um caso de isomeria de ___.",
    resposta: "posição",
    aliases: ["posicao"],
    formato: "lacuna",
  }),

  modelo({
    id: "fase6-funcao-06",
    fase: 6,
    enunciado: "Etanol (álcool) e metoximetano (éter) possuem fórmula C₂H₆O. Eles são isômeros de ___.",
    resposta: "função",
    aliases: ["funcao"],
    formato: "lacuna",
  }),

  modelo({
    id: "fase6-metameria-07",
    fase: 6,
    enunciado: "A isomeria de compensação também é conhecida como ___.",
    resposta: "metameria",
    aliases: ["metamerismo"],
    formato: "lacuna",
  }),

  modelo({
    id: "fase6-tautomeria-08",
    fase: 6,
    enunciado: "Na tautomeria, os dois isômeros coexistem em equilíbrio dinâmico? (sim/não)",
    resposta: "sim",
    aliases: ["s"],
    formato: "texto",
  }),

  modelo({
    id: "fase6-enol-09",
    fase: 6,
    enunciado: "Qual função orgânica instável costuma estar em equilíbrio tautomérico com aldeídos ou cetonas?",
    resposta: "enol",
    aliases: ["enóis", "enois"],
    formato: "texto",
  }),

  modelo({
    id: "fase6-minimo-alcano-10",
    fase: 6,
    enunciado: "Qual é o número mínimo de carbonos para que um alcano apresente isomeria de cadeia?",
    resposta: "4",
    aliases: ["quatro"],
    formato: "texto",
  }),
];

/* ======================================================================== */
/* FASE 7 · Isomeria Espacial (Geométrica e Óptica)                         */
/* ======================================================================== */
const questoesFase7 = [
  modelo({
    id: "fase7-cis-trans-01",
    fase: 7,
    enunciado: "Cis e trans são formas de isomeria espacial? (sim/não)",
    resposta: "sim",
    aliases: ["s"],
    formato: "texto",
  }),

  modelo({
    id: "fase7-quiral-02",
    fase: 7,
    enunciado: "Um carbono quiral pode ter quatro ligantes diferentes? (sim/não)",
    resposta: "sim",
    aliases: ["s"],
    formato: "texto",
  }),

  modelo({
    id: "fase7-geometrica-03",
    fase: 7,
    enunciado: "A isomeria geométrica (cis-trans) ocorre em cadeias abertas que possuem ligação ___.",
    resposta: "dupla",
    aliases: ["insaturação", "insaturacao"],
    formato: "lacuna",
  }),

  modelo({
    id: "fase7-cis-lado-04",
    fase: 7,
    enunciado: "No isômero cis, os ligantes iguais ficam do ___ lado do plano da dupla ligação.",
    resposta: "mesmo",
    aliases: ["igual"],
    formato: "lacuna",
  }),

  modelo({
    id: "fase7-trans-lado-05",
    fase: 7,
    enunciado: "No isômero trans, os ligantes iguais ficam em lados ___ do plano da dupla ligação.",
    resposta: "opostos",
    aliases: ["contrários", "contrarios", "diferentes"],
    formato: "lacuna",
  }),

  modelo({
    id: "fase7-ciclo-06",
    fase: 7,
    enunciado: "Compostos cíclicos saturados podem apresentar isomeria geométrica cis-trans? (sim/não)",
    resposta: "sim",
    aliases: ["s"],
    formato: "texto",
  }),

  modelo({
    id: "fase7-assimetrico-07",
    fase: 7,
    enunciado: "O carbono quiral também é chamado de carbono ___.",
    resposta: "assimétrico",
    aliases: ["assimetrico"],
    formato: "lacuna",
  }),

  modelo({
    id: "fase7-luz-08",
    fase: 7,
    enunciado: "Isômeros ópticos têm a propriedade de desviar o plano da luz ___.",
    resposta: "polarizada",
    aliases: ["luz polarizada"],
    formato: "lacuna",
  }),

  modelo({
    id: "fase7-enantiomeros-09",
    fase: 7,
    enunciado: "Um par de isômeros ópticos que são imagem especular não sobreponível um do outro chama-se ___.",
    resposta: "enantiômeros",
    aliases: ["enantiomeros", "enantiômero", "enantiomero"],
    formato: "lacuna",
  }),

  modelo({
    id: "fase7-racemica-10",
    fase: 7,
    enunciado: "Uma mistura equimolar de dois enantiômeros é opticamente inativa e chama-se mistura ___.",
    resposta: "racêmica",
    aliases: ["racemica"],
    formato: "lacuna",
  }),
];

/* ======================================================================== */
/* FASE 8 · Reações Orgânicas                                               */
/* ======================================================================== */
const questoesFase8 = [
  modelo({
    id: "fase8-adicao-01",
    fase: 8,
    enunciado: "Reações de adição podem ocorrer em ligações duplas? (sim/não)",
    resposta: "sim",
    aliases: ["s"],
    formato: "texto",
  }),

  modelo({
    id: "fase8-combustao-02",
    fase: 8,
    enunciado: "A combustão completa produz CO₂? (sim/não)",
    resposta: "sim",
    aliases: ["s"],
    formato: "texto",
  }),

  modelo({
    id: "fase8-combustao-agua-03",
    fase: 8,
    enunciado: "Além de CO₂, qual outra substância é formada na combustão completa de um hidrocarboneto?",
    respostas: ["água", "H2O", "H₂O", "vapor d'água", "óxido de hidrogênio"],
    distratores: ["CO", "fuligem", "O2", "H2"],
    formato: "texto",
  }),

  modelo({
    id: "fase8-substituicao-04",
    fase: 8,
    enunciado: "Alcanos reagem preferencialmente por meio de reações de ___.",
    resposta: "substituição",
    aliases: ["substituicao"],
    formato: "lacuna",
  }),

  modelo({
    id: "fase8-hidrogenacao-05",
    fase: 8,
    enunciado: "A adição de H₂ a um alceno transforma-o em um ___.",
    resposta: "alcano",
    aliases: ["hidrocarboneto saturado"],
    formato: "lacuna",
  }),

  modelo({
    id: "fase8-eliminacao-06",
    fase: 8,
    enunciado: "Na reação de eliminação, uma molécula perde átomos e forma uma ligação ___.",
    resposta: "dupla",
    aliases: ["múltipla", "multipla", "tripla", "pi"],
    formato: "lacuna",
  }),

  modelo({
    id: "fase8-esterificacao-07",
    fase: 8,
    enunciado: "A reação entre um ácido carboxílico e um álcool produz água e um ___.",
    resposta: "éster",
    aliases: ["ester"],
    formato: "lacuna",
  }),

  modelo({
    id: "fase8-saponificacao-08",
    fase: 8,
    enunciado: "A hidrólise alcalina de um éster (gordura/óleo) para produzir sabão chama-se ___.",
    resposta: "saponificação",
    aliases: ["saponificacao"],
    formato: "lacuna",
  }),

  modelo({
    id: "fase8-markovnikov-09",
    fase: 8,
    enunciado: "Na regra de Markovnikov, o hidrogênio se liga ao carbono ___ hidrogenado da dupla.",
    resposta: "mais",
    aliases: ["maior"],
    formato: "lacuna",
  }),

  modelo({
    id: "fase8-incompleta-10",
    fase: 8,
    enunciado: "A combustão incompleta pode gerar monóxido de carbono (CO) ou fuligem (C)? (sim/não)",
    resposta: "sim",
    aliases: ["s"],
    formato: "texto",
  }),
];

/* ======================================================================== */
/* FASE 9 · Polímeros                                                       */
/* ======================================================================== */
const questoesFase9 = [
  modelo({
    id: "fase9-monomero-01",
    fase: 9,
    enunciado: "Polímeros são formados por unidades repetidas? (sim/não)",
    resposta: "sim",
    aliases: ["s"],
    formato: "texto",
  }),

  modelo({
    id: "fase9-polietileno-02",
    fase: 9,
    enunciado: "O polietileno é um polímero? (sim/não)",
    resposta: "sim",
    aliases: ["s"],
    formato: "texto",
  }),

  modelo({
    id: "fase9-unidade-03",
    fase: 9,
    enunciado: "Como se chama a pequena molécula que se repete para formar um polímero?",
    resposta: "monômero",
    aliases: ["monomero"],
    formato: "texto",
  }),

  modelo({
    id: "fase9-monomero-pe-04",
    fase: 9,
    enunciado: "Qual é o monômero usado na fabricação do polietileno?",
    resposta: "etileno",
    aliases: ["eteno"],
    formato: "texto",
  }),

  modelo({
    id: "fase9-pvc-05",
    fase: 9,
    enunciado: "O PVC (policloreto de vinila) é muito utilizado na fabricação de tubos e conexões? (sim/não)",
    resposta: "sim",
    aliases: ["s"],
    formato: "texto",
  }),

  modelo({
    id: "fase9-natural-06",
    fase: 9,
    // Vários polímeros naturais são aceitos; os distratores são sintéticos.
    enunciado: "Cite um exemplo de polímero natural.",
    respostas: ["celulose", "amido", "proteína", "DNA", "RNA", "borracha natural", "quitina"],
    distratores: ["polietileno", "PVC", "poliestireno", "nylon"],
    formato: "texto",
  }),

  modelo({
    id: "fase9-celulose-07",
    fase: 9,
    enunciado: "Qual é o monômero que forma a celulose e o amido?",
    resposta: "glicose",
    aliases: ["glucose"],
    formato: "texto",
  }),

  modelo({
    id: "fase9-adicao-08",
    fase: 9,
    enunciado: "Polímeros formados pela soma de monômeros sem perda de moléculas pequenas são chamados de polímeros de ___.",
    resposta: "adição",
    aliases: ["adicao"],
    formato: "lacuna",
  }),

  modelo({
    id: "fase9-condensacao-09",
    fase: 9,
    enunciado: "Na polimerização por condensação geralmente ocorre a eliminação de moléculas de ___.",
    resposta: "água",
    aliases: ["agua", "H2O", "H₂O"],
    formato: "lacuna",
  }),

  modelo({
    id: "fase9-vulcanizacao-10",
    fase: 9,
    enunciado: "Qual elemento químico é adicionado à borracha natural no processo de vulcanização?",
    resposta: "enxofre",
    aliases: ["S"],
    formato: "texto",
  }),
];

/* ======================================================================== */
/* FASE 10 · Bioquímica (Biomoléculas)                                      */
/* ======================================================================== */
const questoesFase10 = [
  modelo({
    id: "fase10-aminoacido-01",
    fase: 10,
    enunciado: "Aminoácidos participam da formação de proteínas? (sim/não)",
    resposta: "sim",
    aliases: ["s"],
    formato: "texto",
  }),

  modelo({
    id: "fase10-glicose-02",
    fase: 10,
    enunciado: "A glicose é uma molécula orgânica? (sim/não)",
    resposta: "sim",
    aliases: ["s"],
    formato: "texto",
  }),

  modelo({
    id: "fase10-grupos-aa-03",
    fase: 10,
    enunciado: "Todo aminoácido possui um grupo amina e um grupo ___.",
    resposta: "carboxila",
    aliases: ["ácido carboxílico", "acido carboxilico"],
    formato: "lacuna",
  }),

  modelo({
    id: "fase10-ligacao-peptidica-04",
    fase: 10,
    enunciado: "A ligação que une dois aminoácidos em uma proteína chama-se ligação ___.",
    resposta: "peptídica",
    aliases: ["peptidica"],
    formato: "lacuna",
  }),

  modelo({
    id: "fase10-carboidratos-05",
    fase: 10,
    enunciado: "A glicose e a frutose pertencem à classe dos ___.",
    respostas: ["carboidratos", "glicídios", "açúcares", "hidratos de carbono"],
    distratores: ["lipídios", "proteínas", "ácidos nucleicos", "vitaminas"],
    formato: "lacuna",
  }),

  modelo({
    id: "fase10-formula-glicose-06",
    fase: 10,
    enunciado: "Quantos átomos de carbono existem em uma molécula de glicose (C₆H₁₂O₆)?",
    resposta: "6",
    aliases: ["seis"],
    formato: "texto",
  }),

  modelo({
    id: "fase10-lipidios-07",
    fase: 10,
    enunciado: "Óleos e gorduras são biomoléculas pertencentes ao grupo dos ___.",
    resposta: "lipídios",
    aliases: ["lipidios", "lípides", "lipides"],
    formato: "lacuna",
  }),

  modelo({
    id: "fase10-triglicerideos-08",
    fase: 10,
    enunciado: "Os triglicerídeos são ésteres formados por ácidos graxos e ___.",
    resposta: "glicerol",
    aliases: ["glicerina"],
    formato: "lacuna",
  }),

  modelo({
    id: "fase10-enzimas-09",
    fase: 10,
    enunciado: "As enzimas atuam como catalisadores biológicos e são formadas principalmente por ___.",
    resposta: "proteínas",
    aliases: ["proteinas"],
    formato: "lacuna",
  }),

  modelo({
    id: "fase10-dna-10",
    fase: 10,
    enunciado: "O DNA e o RNA são exemplos de ácidos ___.",
    resposta: "nucleicos",
    aliases: ["nucléicos"],
    formato: "lacuna",
  }),
];

/* ======================================================================== */
/* FASE 11 · Revisão Geral                                                  */
/* ======================================================================== */
const questoesFase11 = [
  modelo({
    id: "fase11-revisao-01",
    fase: 11,
    enunciado: "O carbono é essencial à química orgânica? (sim/não)",
    resposta: "sim",
    aliases: ["s"],
    formato: "texto",
  }),

  modelo({
    id: "fase11-revisao-02",
    fase: 11,
    enunciado: "Uma ligação simples é representada por um traço? (sim/não)",
    resposta: "sim",
    aliases: ["s"],
    formato: "texto",
  }),

  modelo({
    id: "fase11-revisao-03",
    fase: 11,
    enunciado: "Hidrocarbonetos são compostos formados exclusivamente por carbono e ___.",
    resposta: "hidrogênio",
    aliases: ["hidrogenio", "H"],
    formato: "lacuna",
  }),

  modelo({
    id: "fase11-revisao-04",
    fase: 11,
    enunciado: "O grupo funcional -OH ligado a carbono saturado caracteriza a função ___.",
    resposta: "álcool",
    aliases: ["alcool"],
    formato: "lacuna",
  }),

  modelo({
    id: "fase11-revisao-05",
    fase: 11,
    enunciado: "O grupo funcional -COOH caracteriza os ácidos ___.",
    resposta: "carboxílicos",
    aliases: ["carboxilicos", "carboxílico", "carboxilico"],
    formato: "lacuna",
  }),

  modelo({
    id: "fase11-revisao-06",
    fase: 11,
    enunciado: "O benzeno (C₆H₆) é o principal representante dos hidrocarbonetos ___.",
    resposta: "aromáticos",
    aliases: ["aromaticos", "aromático", "aromatico"],
    formato: "lacuna",
  }),

  modelo({
    id: "fase11-revisao-07",
    fase: 11,
    enunciado: "Cadeias carbônicas que possuem apenas ligações simples entre carbonos são chamadas de ___.",
    resposta: "saturadas",
    aliases: ["saturada"],
    formato: "lacuna",
  }),

  modelo({
    id: "fase11-revisao-08",
    fase: 11,
    enunciado: "Um heteroátomo é um átomo diferente de carbono e hidrogênio localizado ___ átomos de carbono.",
    resposta: "entre",
    aliases: ["no meio de"],
    formato: "lacuna",
  }),

  modelo({
    id: "fase11-revisao-09",
    fase: 11,
    enunciado: "O gás de cozinha (GLP) é composto principalmente por propano e ___.",
    resposta: "butano",
    aliases: ["isobutano"],
    formato: "lacuna",
  }),

  modelo({
    id: "fase11-revisao-10",
    fase: 11,
    enunciado: "O ácido acético, presente no vinagre, possui quantos átomos de carbono?",
    resposta: "2",
    aliases: ["dois"],
    formato: "texto",
  }),
];

/* ======================================================================== */
/* CATÁLOGO · ORDEM DAS FASES                                               */
/* ======================================================================== */
export const catalogo = [
  ...questoesFase1,
  ...questoesFase2,
  ...questoesFase3,
  ...questoesFase4,
  ...questoesFase5,
  ...questoesFase6,
  ...questoesFase7,
  ...questoesFase8,
  ...questoesFase9,
  ...questoesFase10,
  ...questoesFase11,
];
