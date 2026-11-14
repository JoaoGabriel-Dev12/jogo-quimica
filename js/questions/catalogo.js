import { defineQuestion } from "./schema.js";
import { fase3 } from "./fase3.js";
import { fase4 } from "./fase4.js";

function modelo({ id, fase, enunciado, resposta, aliases = [], formato = "texto" }) {
  return defineQuestion({
    id,
    fase,
    gerar(rng) {
      return { enunciado, resposta, aliases, formato, params: { variante: Math.floor(rng() * 1_000_000) } };
    },
  });
}

export const catalogo = [
  // FASE 1: Introdução ao Carbono e Estrutura Atômica
  modelo({ id: "fase1-octeto-01", fase: 1, enunciado: "O carbono tem número atômico Z = ___", resposta: "6", aliases: ["seis"], formato: "lacuna" }),
  modelo({ id: "fase1-carbono-02", fase: 1, enunciado: "Qual é o símbolo químico do carbono?", resposta: "C", aliases: ["carbono"] }),
  modelo({ id: "fase1-valencia-03", fase: 1, enunciado: "Quantos elétrons o carbono possui na camada de valência?", resposta: "4", aliases: ["quatro"] }),
  modelo({ id: "fase1-camadas-04", fase: 1, enunciado: "O átomo de carbono no estado fundamental possui ___ camadas eletrônicas.", resposta: "2", aliases: ["duas"], formato: "lacuna" }),
  modelo({ id: "fase1-organica-05", fase: 1, enunciado: "A Química Orgânica estuda principalmente os compostos formados por qual elemento?", resposta: "carbono", aliases: ["C", "o carbono"] }),
  modelo({ id: "fase1-vitalismo-06", fase: 1, enunciado: "Quem derrubou a teoria da força vital ao sintetizar a ureia em laboratório?", resposta: "Wöhler", aliases: ["Wohler", "Friedrich Wöhler", "Friedrich Wohler"] }),
  modelo({ id: "fase1-ureia-07", fase: 1, enunciado: "A ureia foi o primeiro composto orgânico sintetizado em laboratório? (sim/não)", resposta: "sim", aliases: ["s"] }),
  modelo({ id: "fase1-inorganico-08", fase: 1, enunciado: "O gás carbônico (CO₂) é considerado um composto orgânico? (sim/não)", resposta: "não", aliases: ["nao", "n"] }),
  modelo({ id: "fase1-organogenos-09", fase: 1, enunciado: "Além do carbono, qual elemento está presente na grande maioria dos compostos orgânicos?", resposta: "hidrogênio", aliases: ["hidrogenio", "H"] }),
  modelo({ id: "fase1-familia-10", fase: 1, enunciado: "Na tabela periódica, o carbono pertence ao grupo (família) ___.", resposta: "14", aliases: ["4A", "IVA"], formato: "lacuna" }),

  // FASE 2: Postulados de Kekulé, Ligações e Hibridização
  modelo({ id: "fase2-tetravalencia-01", fase: 2, enunciado: "O carbono é tetravalente? (sim/não)", resposta: "sim", aliases: ["s"] }),
  modelo({ id: "fase2-ligacoes-02", fase: 2, enunciado: "Quantas ligações o carbono pode formar?", resposta: "4", aliases: ["quatro"] }),
  modelo({ id: "fase2-tipo-ligacao-03", fase: 2, enunciado: "Qual tipo de ligação química predomina entre átomos de carbono?", resposta: "covalente", aliases: ["ligação covalente", "ligacao covalente"] }),
  modelo({ id: "fase2-kekule-04", fase: 2, enunciado: "As quatro valências do carbono são iguais entre si? (sim/não)", resposta: "sim", aliases: ["s"] }),
  modelo({ id: "fase2-encadeamento-05", fase: 2, enunciado: "A capacidade do carbono de formar longas cadeias chama-se ___.", resposta: "encadeamento", aliases: ["concatenação", "concatenacao"], formato: "lacuna" }),
  modelo({ id: "fase2-sp3-06", fase: 2, enunciado: "Um carbono que faz apenas ligações simples possui hibridização ___.", resposta: "sp3", aliases: ["sp³"], formato: "lacuna" }),
  modelo({ id: "fase2-sp2-07", fase: 2, enunciado: "Um carbono com uma ligação dupla e duas simples possui hibridização ___.", resposta: "sp2", aliases: ["sp²"], formato: "lacuna" }),
  modelo({ id: "fase2-sp-08", fase: 2, enunciado: "Um carbono com uma ligação tripla e uma simples possui hibridização ___.", resposta: "sp", aliases: ["sp1"], formato: "lacuna" }),
  modelo({ id: "fase2-sigma-pi-09", fase: 2, enunciado: "Em uma ligação dupla entre carbonos, existe uma ligação sigma e uma ligação ___.", resposta: "pi", aliases: ["π"], formato: "lacuna" }),
  modelo({ id: "fase2-tripla-10", fase: 2, enunciado: "Quantas ligações pi existem em uma ligação tripla?", resposta: "2", aliases: ["duas"] }),

  // FASE 3 e FASE 4 (Importadas)
  ...fase3,
  ...fase4,

  // FASE 5: Nomenclatura IUPAC Básica (Prefixos, Infixos e Hidrocarbonetos)
  modelo({ id: "fase5-metano-01", fase: 5, enunciado: "O nome CH₄ é metano? (sim/não)", resposta: "sim", aliases: ["s"] }),
  modelo({ id: "fase5-etano-02", fase: 5, enunciado: "O prefixo et- indica dois carbonos? (sim/não)", resposta: "sim", aliases: ["s"] }),
  modelo({ id: "fase5-prefixo-met-03", fase: 5, enunciado: "Qual prefixo IUPAC indica a presença de 1 átomo de carbono?", resposta: "met", aliases: ["met-"] }),
  modelo({ id: "fase5-prefixo-prop-04", fase: 5, enunciado: "Qual prefixo IUPAC indica a presença de 3 átomos de carbono?", resposta: "prop", aliases: ["prop-"] }),
  modelo({ id: "fase5-prefixo-but-05", fase: 5, enunciado: "O prefixo but- indica uma cadeia com ___ átomos de carbono.", resposta: "4", aliases: ["quatro"], formato: "lacuna" }),
  modelo({ id: "fase5-prefixo-pent-06", fase: 5, enunciado: "Qual prefixo IUPAC corresponde a 5 átomos de carbono?", resposta: "pent", aliases: ["pent-"] }),
  modelo({ id: "fase5-infixo-an-07", fase: 5, enunciado: "O infixo -an- indica que a cadeia possui apenas ligações ___.", resposta: "simples", aliases: ["saturadas"], formato: "lacuna" }),
  modelo({ id: "fase5-infixo-en-08", fase: 5, enunciado: "O infixo -en- indica a presença de uma ligação ___ na cadeia.", resposta: "dupla", aliases: ["insaturada"], formato: "lacuna" }),
  modelo({ id: "fase5-sufixo-hc-09", fase: 5, enunciado: "Qual é a terminação (sufixo) IUPAC de todos os hidrocarbonetos?", resposta: "o", aliases: ["-o"] }),
  modelo({ id: "fase5-propano-10", fase: 5, enunciado: "Qual é o nome IUPAC do alcano com 3 carbonos (C₃H₈)?", resposta: "propano", aliases: ["n-propano"] }),

  // FASE 6: Isomeria Plana (Constitucional)
  modelo({ id: "fase6-cadeia-01", fase: 6, enunciado: "Isômeros planos têm a mesma fórmula molecular? (sim/não)", resposta: "sim", aliases: ["s"] }),
  modelo({ id: "fase6-butano-02", fase: 6, enunciado: "Butano e isobutano são isômeros? (sim/não)", resposta: "sim", aliases: ["s"] }),
  modelo({ id: "fase6-definicao-03", fase: 6, enunciado: "Isômeros possuem propriedades físicas e químicas idênticas? (sim/não)", resposta: "não", aliases: ["nao", "n"] }),
  modelo({ id: "fase6-tipo-butano-04", fase: 6, enunciado: "Butano (cadeia normal) e metilpropano (ramificada) apresentam isomeria de ___.", resposta: "cadeia", aliases: ["núcleo", "nucleo"], formato: "lacuna" }),
  modelo({ id: "fase6-posicao-05", fase: 6, enunciado: "Propan-1-ol e propan-2-ol diferem apenas na localização da hidroxila. Esse é um caso de isomeria de ___.", resposta: "posição", aliases: ["posicao"], formato: "lacuna" }),
  modelo({ id: "fase6-funcao-06", fase: 6, enunciado: "Etanol (álcool) e metoximetano (éter) possuem fórmula C₂H₆O. Eles são isômeros de ___.", resposta: "função", aliases: ["funcao"], formato: "lacuna" }),
  modelo({ id: "fase6-metameria-07", fase: 6, enunciado: "A isomeria de compensação também é conhecida como ___.", resposta: "metameria", aliases: ["metamerismo"], formato: "lacuna" }),
  modelo({ id: "fase6-tautomeria-08", fase: 6, enunciado: "Na tautomeria, os dois isômeros coexistem em equilíbrio dinâmico? (sim/não)", resposta: "sim", aliases: ["s"] }),
  modelo({ id: "fase6-enol-09", fase: 6, enunciado: "Qual função orgânica instável costuma estar em equilíbrio tautomérico com aldeídos ou cetonas?", resposta: "enol", aliases: ["enóis", "enois"] }),
  modelo({ id: "fase6-minimo-alcano-10", fase: 6, enunciado: "Qual é o número mínimo de carbonos para que um alcano apresente isomeria de cadeia?", resposta: "4", aliases: ["quatro"] }),

  // FASE 7: Isomeria Espacial (Geométrica e Óptica)
  modelo({ id: "fase7-cis-trans-01", fase: 7, enunciado: "Cis e trans são formas de isomeria espacial? (sim/não)", resposta: "sim", aliases: ["s"] }),
  modelo({ id: "fase7-quiral-02", fase: 7, enunciado: "Um carbono quiral pode ter quatro ligantes diferentes? (sim/não)", resposta: "sim", aliases: ["s"] }),
  modelo({ id: "fase7-geometrica-03", fase: 7, enunciado: "A isomeria geométrica (cis-trans) ocorre em cadeias abertas que possuem ligação ___.", resposta: "dupla", aliases: ["insaturação", "insaturacao"], formato: "lacuna" }),
  modelo({ id: "fase7-cis-lado-04", fase: 7, enunciado: "No isômero cis, os ligantes iguais ficam do ___ lado do plano da dupla ligação.", resposta: "mesmo", aliases: ["igual"], formato: "lacuna" }),
  modelo({ id: "fase7-trans-lado-05", fase: 7, enunciado: "No isômero trans, os ligantes iguais ficam em lados ___ do plano da dupla ligação.", resposta: "opostos", aliases: ["contrários", "contrarios", "diferentes"], formato: "lacuna" }),
  modelo({ id: "fase7-ciclo-06", fase: 7, enunciado: "Compostos cíclicos saturados podem apresentar isomeria geométrica cis-trans? (sim/não)", resposta: "sim", aliases: ["s"] }),
  modelo({ id: "fase7-assimetrico-07", fase: 7, enunciado: "O carbono quiral também é chamado de carbono ___.", resposta: "assimétrico", aliases: ["assimetrico"], formato: "lacuna" }),
  modelo({ id: "fase7-luz-08", fase: 7, enunciado: "Isômeros ópticos têm a propriedade de desviar o plano da luz ___.", resposta: "polarizada", aliases: ["luz polarizada"], formato: "lacuna" }),
  modelo({ id: "fase7-enantiomeros-09", fase: 7, enunciado: "Um par de isômeros ópticos que são imagem especular não sobreponível um do outro chama-se ___.", resposta: "enantiômeros", aliases: ["enantiomeros", "enantiômero", "enantiomero"], formato: "lacuna" }),
  modelo({ id: "fase7-racemica-10", fase: 7, enunciado: "Uma mistura equimolar de dois enantiômeros é opticamente inativa e chama-se mistura ___.", resposta: "racêmica", aliases: ["racemica"], formato: "lacuna" }),

  // FASE 8: Reações Orgânicas
  modelo({ id: "fase8-adicao-01", fase: 8, enunciado: "Reações de adição podem ocorrer em ligações duplas? (sim/não)", resposta: "sim", aliases: ["s"] }),
  modelo({ id: "fase8-combustao-02", fase: 8, enunciado: "A combustão completa produz CO₂? (sim/não)", resposta: "sim", aliases: ["s"] }),
  modelo({ id: "fase8-combustao-agua-03", fase: 8, enunciado: "Além de CO₂, qual outra substância é formada na combustão completa de um hidrocarboneto?", resposta: "água", aliases: ["agua", "H2O", "H₂O"] }),
  modelo({ id: "fase8-substituicao-04", fase: 8, enunciado: "Alcanos reagem preferencialmente por meio de reações de ___.", resposta: "substituição", aliases: ["substituicao"], formato: "lacuna" }),
  modelo({ id: "fase8-hidrogenacao-05", fase: 8, enunciado: "A adição de H₂ a um alceno transforma-o em um ___.", resposta: "alcano", aliases: ["hidrocarboneto saturado"], formato: "lacuna" }),
  modelo({ id: "fase8-eliminacao-06", fase: 8, enunciado: "Na reação de eliminação, uma molécula perde átomos e forma uma ligação ___.", resposta: "dupla", aliases: ["múltipla", "multipla", "tripla", "pi"], formato: "lacuna" }),
  modelo({ id: "fase8-esterificacao-07", fase: 8, enunciado: "A reação entre um ácido carboxílico e um álcool produz água e um ___.", resposta: "éster", aliases: ["ester"], formato: "lacuna" }),
  modelo({ id: "fase8-saponificacao-08", fase: 8, enunciado: "A hidrólise alcalina de um éster (gordura/óleo) para produzir sabão chama-se ___.", resposta: "saponificação", aliases: ["saponificacao"], formato: "lacuna" }),
  modelo({ id: "fase8-markovnikov-09", fase: 8, enunciado: "Na regra de Markovnikov, o hidrogênio se liga ao carbono ___ hidrogenado da dupla.", resposta: "mais", aliases: ["maior"], formato: "lacuna" }),
  modelo({ id: "fase8-incompleta-10", fase: 8, enunciado: "A combustão incompleta pode gerar monóxido de carbono (CO) ou fuligem (C)? (sim/não)", resposta: "sim", aliases: ["s"] }),

  // FASE 9: Polímeros
  modelo({ id: "fase9-monomero-01", fase: 9, enunciado: "Polímeros são formados por unidades repetidas? (sim/não)", resposta: "sim", aliases: ["s"] }),
  modelo({ id: "fase9-polietileno-02", fase: 9, enunciado: "O polietileno é um polímero? (sim/não)", resposta: "sim", aliases: ["s"] }),
  modelo({ id: "fase9-unidade-03", fase: 9, enunciado: "Como se chama a pequena molécula que se repete para formar um polímero?", resposta: "monômero", aliases: ["monomero"] }),
  modelo({ id: "fase9-monomero-pe-04", fase: 9, enunciado: "Qual é o monômero usado na fabricação do polietileno?", resposta: "etileno", aliases: ["eteno"] }),
  modelo({ id: "fase9-pvc-05", fase: 9, enunciado: "O PVC (policloreto de vinila) é muito utilizado na fabricação de tubos e conexões? (sim/não)", resposta: "sim", aliases: ["s"] }),
  modelo({ id: "fase9-natural-06", fase: 9, enunciado: "A celulose e o amido são exemplos de polímeros naturais? (sim/não)", resposta: "sim", aliases: ["s"] }),
  modelo({ id: "fase9-celulose-07", fase: 9, enunciado: "Qual é o monômero que forma a celulose e o amido?", resposta: "glicose", aliases: ["glucose"] }),
  modelo({ id: "fase9-adicao-08", fase: 9, enunciado: "Polímeros formados pela soma de monômeros sem perda de moléculas pequenas são chamados de polímeros de ___.", resposta: "adição", aliases: ["adicao"], formato: "lacuna" }),
  modelo({ id: "fase9-condensacao-09", fase: 9, enunciado: "Na polimerização por condensação geralmente ocorre a eliminação de moléculas de ___.", resposta: "água", aliases: ["agua", "H2O", "H₂O"], formato: "lacuna" }),
  modelo({ id: "fase9-vulcanizacao-10", fase: 9, enunciado: "Qual elemento químico é adicionado à borracha natural no processo de vulcanização?", resposta: "enxofre", aliases: ["S"] }),

  // FASE 10: Bioquímica (Biomoléculas)
  modelo({ id: "fase10-aminoacido-01", fase: 10, enunciado: "Aminoácidos participam da formação de proteínas? (sim/não)", resposta: "sim", aliases: ["s"] }),
  modelo({ id: "fase10-glicose-02", fase: 10, enunciado: "A glicose é uma molécula orgânica? (sim/não)", resposta: "sim", aliases: ["s"] }),
  modelo({ id: "fase10-grupos-aa-03", fase: 10, enunciado: "Todo aminoácido possui um grupo amina e um grupo ___.", resposta: "carboxila", aliases: ["ácido carboxílico", "acido carboxilico"], formato: "lacuna" }),
  modelo({ id: "fase10-ligacao-peptidica-04", fase: 10, enunciado: "A ligação que une dois aminoácidos em uma proteína chama-se ligação ___.", resposta: "peptídica", aliases: ["peptidica"], formato: "lacuna" }),
  modelo({ id: "fase10-carboidratos-05", fase: 10, enunciado: "A glicose e a frutose pertencem à classe dos ___.", resposta: "carboidratos", aliases: ["glicídios", "glicidios", "açúcares", "acucares"], formato: "lacuna" }),
  modelo({ id: "fase10-formula-glicose-06", fase: 10, enunciado: "Quantos átomos de carbono existem em uma molécula de glicose (C₆H₁₂O₆)?", resposta: "6", aliases: ["seis"] }),
  modelo({ id: "fase10-lipidios-07", fase: 10, enunciado: "Óleos e gorduras são biomoléculas pertencentes ao grupo dos ___.", resposta: "lipídios", aliases: ["lipidios", "lípides", "lipides"], formato: "lacuna" }),
  modelo({ id: "fase10-triglicerideos-08", fase: 10, enunciado: "Os triglicerídeos são ésteres formados por ácidos graxos e ___.", resposta: "glicerol", aliases: ["glicerina"], formato: "lacuna" }),
  modelo({ id: "fase10-enzimas-09", fase: 10, enunciado: "As enzimas atuam como catalisadores biológicos e são formadas principalmente por ___.", resposta: "proteínas", aliases: ["proteinas"], formato: "lacuna" }),
  modelo({ id: "fase10-dna-10", fase: 10, enunciado: "O DNA e o RNA são exemplos de ácidos ___.", resposta: "nucleicos", aliases: ["nucléicos"], formato: "lacuna" }),

  // FASE 11: Revisão Geral
  modelo({ id: "fase11-revisao-01", fase: 11, enunciado: "O carbono é essencial à química orgânica? (sim/não)", resposta: "sim", aliases: ["s"] }),
  modelo({ id: "fase11-revisao-02", fase: 11, enunciado: "Uma ligação simples é representada por um traço? (sim/não)", resposta: "sim", aliases: ["s"] }),
  modelo({ id: "fase11-revisao-03", fase: 11, enunciado: "Hidrocarbonetos são compostos formados exclusivamente por carbono e ___.", resposta: "hidrogênio", aliases: ["hidrogenio", "H"], formato: "lacuna" }),
  modelo({ id: "fase11-revisao-04", fase: 11, enunciado: "O grupo funcional -OH ligado a carbono saturado caracteriza a função ___.", resposta: "álcool", aliases: ["alcool"], formato: "lacuna" }),
  modelo({ id: "fase11-revisao-05", fase: 11, enunciado: "O grupo funcional -COOH caracteriza os ácidos ___.", resposta: "carboxílicos", aliases: ["carboxilicos", "carboxílico", "carboxilico"], formato: "lacuna" }),
  modelo({ id: "fase11-revisao-06", fase: 11, enunciado: "O benzeno (C₆H₆) é o principal representante dos hidrocarbonetos ___.", resposta: "aromáticos", aliases: ["aromaticos", "aromático", "aromatico"], formato: "lacuna" }),
  modelo({ id: "fase11-revisao-07", fase: 11, enunciado: "Cadeias carbônicas que possuem apenas ligações simples entre carbonos são chamadas de ___.", resposta: "saturadas", aliases: ["saturada"], formato: "lacuna" }),
  modelo({ id: "fase11-revisao-08", fase: 11, enunciado: "Um heteroátomo é um átomo diferente de carbono e hidrogênio localizado ___ átomos de carbono.", resposta: "entre", aliases: ["no meio de"], formato: "lacuna" }),
  modelo({ id: "fase11-revisao-09", fase: 11, enunciado: "O gás de cozinha (GLP) é composto principalmente por propano e ___.", resposta: "butano", aliases: ["isobutano"], formato: "lacuna" }),
  modelo({ id: "fase11-revisao-10", fase: 11, enunciado: "O ácido acético, presente no vinagre, possui quantos átomos de carbono?", resposta: "2", aliases: ["dois"] }),
];
