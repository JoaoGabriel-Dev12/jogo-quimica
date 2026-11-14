import { GAME_CONFIG } from "./config.js";

export const TOTAL_PHASES = GAME_CONFIG.fases.length;

const phaseTopics = [
  "Fundamentos de Química Orgânica",
  "Cadeias carbônicas",
  "Hibridização",
  "Hidrocarbonetos",
  "Nomenclatura orgânica",
  "Isomeria plana",
  "Isomeria espacial",
  "Reações orgânicas",
  "Polímeros",
  "Bioquímica orgânica",
  "Síntese e revisão",
];

const phaseNotebooks = [
  // Fase 1: Fundamentos de Química Orgânica
  [
    "<strong>Átomo de Carbono (C):</strong> Pertence ao grupo 14 (família 4A) da tabela periódica, possui número atômico Z = 6, 2 camadas eletrônicas e 4 elétrons na camada de valência.",
    "<strong>Compostos Orgânicos:</strong> São formados principalmente por carbono e hidrogênio. Substâncias como CO₂, CO e carbonatos são exceções classificadas como inorgânicas.",
    "<strong>Histórico:</strong> Em 1828, Friedrich Wöhler derrubou a Teoria da Força Vital ao sintetizar a ureia em laboratório a partir de um composto inorgânico.",
  ],
  // Fase 2: Cadeias carbônicas (Postulados e Ligações)
  [
    "<strong>Postulados de Kekulé:</strong> O carbono é tetravalente (faz 4 ligações covalentes iguais) e possui a capacidade de formar longas sequências chamada encadeamento.",
    "<strong>Ligações Sigma (σ) e Pi (π):</strong> Toda ligação simples é sigma (1σ). Uma ligação dupla tem 1σ e 1π. Uma ligação tripla tem 1σ e 2π.",
    "<strong>Tipos de Carbono:</strong> Apenas ligações simples = sp³; uma ligação dupla = sp²; uma ligação tripla (ou duas duplas) = sp.",
  ],
  // Fase 3: Hibridização
  [
    "<strong>sp³ (Saturado):</strong> Apenas ligações simples | Geometria: tetraédrica | Ângulo: 109,5° (ex.: metano CH₄, etano C₂H₆).",
    "<strong>sp² (Insaturado):</strong> Uma ligação dupla | Geometria: trigonal plana | Ângulo: 120° (ex.: eteno C₂H₄, carbonila de propanona e ácido acético).",
    "<strong>sp (Insaturado):</strong> Uma ligação tripla | Geometria: linear | Ângulo: 180° (ex.: etino C₂H₂, propino C₃H₄).",
    "<strong>Contagem de ligações:</strong> Cada ligação simples conta como 1σ; dupla conta como 1σ + 1π; tripla conta como 1σ + 2π.",
  ],
  // Fase 4: Hidrocarbonetos e Classificação de Cadeias
  [
    "<strong>Fórmulas Gerais (cadeia aberta):</strong> Alcanos (simples): CₙH₂ₙ₊₂ (0 insaturações) | Alcenos (1 dupla): CₙH₂ₙ (1 insaturação) | Alcinos (1 tripla): CₙH₂ₙ₋₂ (2 insaturações).",
    "<strong>Classificação da Cadeia:</strong> Normal (apenas carbonos primários e secundários) vs. Ramificada (possui carbono terciário ou quaternário). Aberta (acíclica) vs. Fechada (cíclica).",
    "<strong>Heteroátomo:</strong> Cadeia heterogênea possui átomo diferente de C e H <em>entre</em> carbonos (ex.: C-O-C). Se estiver na ponta (ex.: -OH), a cadeia continua homogênea.",
    "<strong>Aromáticos:</strong> Cadeias fechadas com anel benzênico (ex.: benzeno C₆H₆, tolueno C₇H₈, naftaleno C₁₀H₈).",
  ],
  // Fase 5: Nomenclatura orgânica
  [
    "<strong>Prefixos (nº de carbonos):</strong> 1 = met | 2 = et | 3 = prop | 4 = but | 5 = pent | 6 = hex | 7 = hept | 8 = oct | 9 = non | 10 = dec.",
    "<strong>Infixos (tipo de ligação):</strong> -an- (apenas simples) | -en- (uma dupla) | -in- (uma tripla).",
    "<strong>Sufixo:</strong> Todo hidrocarboneto termina com a letra <strong>-o</strong> (ex.: met + an + o = metano; prop + an + o = propano).",
  ],
  // Fase 6: Isomeria plana
  [
    "<strong>Definição:</strong> Isômeros têm a <em>mesma fórmula molecular</em>, mas estruturas diferentes e propriedades físicas/químicas distintas.",
    "<strong>Tipos Principais:</strong> <em>Cadeia</em> (normal vs. ramificada, ocorre em alcanos a partir de 4 carbonos) | <em>Posição</em> (muda o lugar da insaturação, ramificação ou grupo funcional).",
    "<strong>Função, Metameria e Tautomeria:</strong> <em>Função</em> (funções diferentes, ex.: álcool e éter) | <em>Metameria</em> (muda a posição do heteroátomo) | <em>Tautomeria</em> (equilíbrio dinâmico envolvendo um enol).",
  ],
  // Fase 7: Isomeria espacial
  [
    "<strong>Geométrica (Cis-Trans):</strong> Ocorre em cadeias abertas com ligação dupla (ligantes diferentes em cada carbono da dupla) ou cadeias fechadas saturadas. <em>Cis</em> = ligantes iguais do mesmo lado; <em>Trans</em> = lados opostos.",
    "<strong>Óptica:</strong> Exige carbono quiral (assimétrico), que possui 4 ligantes diferentes entre si. Desvia o plano da luz polarizada.",
    "<strong>Enantiômeros e Racêmica:</strong> Enantiômeros são imagens especulares não sobreponíveis. A mistura equimolar (50%/50%) dos dois chama-se mistura racêmica (opticamente inativa).",
  ],
  // Fase 8: Reações orgânicas
  [
    "<strong>Combustão:</strong> Completa gera CO₂ + H₂O. Incompleta gera monóxido de carbono (CO) ou fuligem (C).",
    "<strong>Substituição vs. Adição vs. Eliminação:</strong> Alcanos sofrem <em>substituição</em>. Alcenos/alcinos sofrem <em>adição</em> (hidrogenação transforma alceno em alcano; regra de Markovnikov: H vai ao carbono mais hidrogenado). <em>Eliminação</em> forma ligação dupla.",
    "<strong>Esterificação e Saponificação:</strong> Ácido carboxílico + álcool ⇌ éster + água (esterificação). Éster (gordura) + base → sabão + glicerol (saponificação).",
  ],
  // Fase 9: Polímeros
  [
    "<strong>Conceito:</strong> Macromoléculas formadas pela união de milhares de pequenas unidades repetidas chamadas <strong>monômeros</strong>.",
    "<strong>Sintéticos e Naturais:</strong> Etileno (eteno) forma o polietileno; cloreto de vinila forma o PVC. Celulose e amido são polímeros naturais formados por glicose.",
    "<strong>Tipos e Processos:</strong> <em>Adição</em> (soma sem perda de átomos) vs. <em>Condensação</em> (elimina moléculas pequenas, geralmente H₂O). A <em>vulcanização</em> adiciona enxofre (S) à borracha natural.",
  ],
  // Fase 10: Bioquímica orgânica
  [
    "<strong>Carboidratos (Glicídios):</strong> Glicose (C₆H₁₂O₆, 6 carbonos) e frutose são exemplos de açúcares que fornecem energia.",
    "<strong>Aminoácidos e Proteínas:</strong> Todo aminoácido tem um grupo amina (-NH₂) e um grupo carboxila (-COOH). Eles se unem por <em>ligação peptídica</em> formando proteínas (como as enzimas).",
    "<strong>Lipídios e Ácidos Nucleicos:</strong> Óleos e gorduras são lipídios (triglicerídeos = ésteres de ácidos graxos + glicerol). DNA e RNA são ácidos nucleicos.",
  ],
  // Fase 11: Síntese e revisão
  [
    "<strong>Hidrocarbonetos e Cadeias:</strong> Compostos apenas de C e H. Cadeias saturadas têm só ligações simples; aromáticas têm anel benzênico (C₆H₆); heteroátomo fica entre carbonos. GLP = propano + butano.",
    "<strong>Funções Oxigenadas:</strong> Álcool (-OH em carbono saturado) | Ácido carboxílico (-COOH, ex.: ácido acético tem 2 carbonos).",
    "<strong>Representação:</strong> Uma ligação simples = 1 traço; dupla = 2 traços; tripla = 3 traços.",
  ],
];

export function getPhase(number = 1) {
  const safeNumber = Math.min(Math.max(Number(number) || 1, 1), TOTAL_PHASES);
  const topic = phaseTopics[safeNumber - 1];
  const config = GAME_CONFIG.fases[safeNumber - 1];
  return {
    number: safeNumber,
    topic,
    duration: formatDuration(config.duracao),
    durationSeconds: config.duracao,
    auraCutoff: config.notaCorte,
    notebook: phaseNotebooks[safeNumber - 1],
  };
}

function formatDuration(seconds) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}
