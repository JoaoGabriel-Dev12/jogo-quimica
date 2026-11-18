import { TOTAL_PHASES, getPhase } from "./phases.js";
import { catalogo } from "./Questions/catalogo.js";
import {
  criarQuestao,
  createRngFromSeed,
  createRunSeed,
  getModelos,
  getQuestao,
  getTotalQuestoes,
} from "./Questions/gerador.js";
import { normalize } from "./Util/normalize.js";
import { validar } from "./Util/validar.js";

const refs = {
  phase: document.querySelector("[data-phase]"),
  seed: document.querySelector("[data-seed]"),
  meta: document.querySelector("[data-meta]"),
  question: document.querySelector("[data-question]"),
  options: document.querySelector("[data-options]"),
  form: document.querySelector("[data-form]"),
  answer: document.querySelector("[data-answer]"),
  feedback: document.querySelector("[data-feedback]"),
  hint: document.querySelector("[data-hint]"),
  params: document.querySelector("[data-params]"),
  respostas: document.querySelector("[data-respostas]"),
  aliases: document.querySelector("[data-aliases]"),
  distratores: document.querySelector("[data-distratores]"),
  sessionNote: document.querySelector("[data-session-note]"),
  sessionCount: document.querySelector("[data-session-count]"),
  sessionList: document.querySelector("[data-session-list]"),
};

const actions = {
  gerar: document.querySelector('[data-action="gerar"]'),
  variante: document.querySelector('[data-action="variante"]'),
  seed: document.querySelector('[data-action="seed"]'),
  sessao: document.querySelector('[data-action="sessao"]'),
  anterior: document.querySelector('[data-action="anterior"]'),
  proxima: document.querySelector('[data-action="proxima"]'),
};

const state = {
  fase: 1,
  seedRun: createRunSeed(),
  contador: 0,
  questao: null,
  modelo: null,
  sessao: null,
};

/* ------------------------------------------------------------------------ */
/* SEED E SORTEIO                                                           */
/* ------------------------------------------------------------------------ */

/** Usa a seed digitada; se estiver vazia, mantém a seed da execução atual. */
function baseSeed() {
  const digitada = refs.seed.value.trim();
  if (digitada) return digitada;
  refs.seed.value = state.seedRun;
  return state.seedRun;
}

/** Cada ação consome uma sub-seed diferente, mantendo a sequência reproduzível. */
function nextRng() {
  return createRngFromSeed(`${baseSeed()}:${state.contador++}`);
}

function modeloPorId(id) {
  return catalogo.find((modelo) => modelo.id === id) ?? null;
}

/* ------------------------------------------------------------------------ */
/* RENDERIZAÇÃO                                                             */
/* ------------------------------------------------------------------------ */

function renderMeta() {
  const questao = state.questao;
  if (!questao) return;

  const info = getPhase(questao.fase);
  refs.meta.replaceChildren();

  const addTag = (texto, classe = "") => {
    const tag = document.createElement("span");
    tag.className = `question-tag ${classe}`.trim();
    tag.textContent = texto;
    refs.meta.append(tag);
  };

  addTag(`Fase ${questao.fase} · ${info.topic}`, "question-tag-phase");
  addTag(`Modelo: ${questao.modelId}`);
  addTag(`Tipo: ${state.modelo?.tipo ?? "—"}`);
  addTag(`Formato: ${questao.formato}`);
  addTag(`ID: ${questao.id}`);
}

function renderOpcoes() {
  const opcoes = state.questao?.opcoes ?? [];
  refs.options.replaceChildren();
  refs.options.hidden = opcoes.length === 0;

  for (const opcao of opcoes) {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "answer-option";
    botao.textContent = opcao;
    botao.addEventListener("click", () => {
      refs.answer.value = opcao;
      validarAtual();
    });
    refs.options.append(botao);
  }
}

function renderChips(container, valores, classe, descricao) {
  container.replaceChildren();

  if (!valores.length) {
    const vazio = document.createElement("span");
    vazio.className = "teste-empty";
    vazio.textContent = "—";
    container.append(vazio);
    return;
  }

  for (const valor of valores) {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = `teste-chip ${classe}`;
    chip.textContent = valor;
    chip.title = `${descricao}: clique para validar`;
    chip.addEventListener("click", () => {
      refs.answer.value = valor;
      validarAtual();
    });
    container.append(chip);
  }
}

function renderFatos() {
  const questao = state.questao;

  refs.params.textContent = JSON.stringify(questao.params ?? {}, null, 2);
  renderChips(refs.respostas, questao.respostas, "teste-chip-correct", "Resposta aceita");
  renderChips(refs.aliases, questao.aliases, "teste-chip-alias", "Alias aceito");
  renderChips(refs.distratores, questao.distratores, "teste-chip-distractor", "Distrator");

  const notas = [];
  if (typeof questao.validarResposta === "function") {
    notas.push("Validação personalizada ativa: este modelo aceita combinações que não aparecem na lista de respostas.");
  }
  if (state.modelo?.tipo === "estatica") {
    notas.push("Modelo estático: “Nova variante” repete o enunciado; use “Gerar questão” para sortear outro modelo.");
  }

  refs.hint.hidden = notas.length === 0;
  refs.hint.textContent = notas.join(" ");
}

function resetFeedback() {
  refs.feedback.textContent = "";
  refs.feedback.className = "answer-feedback";
  refs.question.classList.remove("is-correct", "is-incorrect");
}

function mostrarQuestao(questao, modelo) {
  state.questao = questao;
  state.modelo = modelo;

  renderMeta();
  refs.question.innerHTML = questao.enunciado;
  refs.answer.value = "";
  refs.answer.disabled = false;
  resetFeedback();
  renderOpcoes();
  renderFatos();
}

function textoSimples(html) {
  const container = document.createElement("div");
  container.innerHTML = html;
  const texto = container.textContent?.replace(/\s+/gu, " ").trim() ?? "";
  return texto.length > 92 ? `${texto.slice(0, 89)}…` : texto;
}

function renderSessao() {
  const sessao = state.sessao;
  const total = sessao?.questoes.length ?? 0;

  refs.sessionCount.textContent = sessao ? `${sessao.indice + 1}/${total}` : "—";
  refs.sessionNote.hidden = !sessao;
  if (sessao) {
    refs.sessionNote.textContent = `Sessão ativa · fase ${state.fase} · ${total} questões · use Anterior/Próxima ou clique em um item.`;
  }

  refs.sessionList.replaceChildren();

  if (!sessao) {
    const vazio = document.createElement("li");
    vazio.className = "teste-session-empty";
    vazio.textContent = "Clique em “Nova sessão” para gerar a sequência da fase.";
    refs.sessionList.append(vazio);
  } else {
    sessao.questoes.forEach((questao, indice) => {
      const item = document.createElement("li");
      item.className = `teste-session-item${indice === sessao.indice ? " is-active" : ""}`;

      const botao = document.createElement("button");
      botao.type = "button";
      botao.className = "teste-session-button";

      const numero = document.createElement("span");
      numero.className = "teste-session-index";
      numero.textContent = String(indice + 1).padStart(2, "0");

      const texto = document.createElement("span");
      texto.className = "teste-session-text";
      texto.textContent = `${questao.modelId} · ${textoSimples(questao.enunciado)}`;

      botao.append(numero, texto);
      botao.addEventListener("click", () => {
        sessao.indice = indice;
        mostrarQuestao(questao, modeloPorId(questao.modelId));
        renderSessao();
      });

      item.append(botao);
      refs.sessionList.append(item);
    });
  }

  actions.anterior.disabled = !sessao || sessao.indice === 0;
  actions.proxima.disabled = !sessao || sessao.indice >= total - 1;
}

/* ------------------------------------------------------------------------ */
/* AÇÕES                                                                    */
/* ------------------------------------------------------------------------ */

function gerarQuestaoLivre() {
  const modelos = getModelos(state.fase);
  if (!modelos.length) return;

  const rng = nextRng();
  const candidatos = modelos.length > 1 && state.modelo
    ? modelos.filter((modelo) => modelo.id !== state.modelo.id)
    : modelos;
  const modelo = candidatos[Math.floor(rng() * candidatos.length)];

  state.sessao = null;
  mostrarQuestao(criarQuestao(modelo, rng), modelo);
  renderSessao();
}

function gerarVariante() {
  const modelo = state.modelo ?? getModelos(state.fase)[0];
  if (!modelo) return;

  state.sessao = null;
  mostrarQuestao(criarQuestao(modelo, nextRng()), modelo);
  renderSessao();
}

function novaSessao() {
  const total = Math.max(1, getTotalQuestoes(state.fase));
  const rng = createRngFromSeed(`${baseSeed()}:sessao:${state.contador++}`);
  const questoes = [];
  const usados = [];
  const vistas = [];

  for (let indice = 0; indice < total; indice += 1) {
    const questao = getQuestao(state.fase, rng, {
      excludeModelIds: usados,
      excludeQuestionIds: vistas,
    });
    usados.push(questao.modelId);
    vistas.push(questao.id);
    questoes.push(questao);
  }

  state.sessao = { questoes, indice: 0 };
  mostrarQuestao(questoes[0], modeloPorId(questoes[0].modelId));
  renderSessao();
}

function navegarSessao(delta) {
  const sessao = state.sessao;
  if (!sessao) return;

  const indice = Math.min(sessao.questoes.length - 1, Math.max(0, sessao.indice + delta));
  if (indice === sessao.indice) return;

  sessao.indice = indice;
  const questao = sessao.questoes[indice];
  mostrarQuestao(questao, modeloPorId(questao.modelId));
  renderSessao();
}

function novaSeed() {
  state.seedRun = createRunSeed();
  state.contador = 0;
  refs.seed.value = state.seedRun;
  gerarQuestaoLivre();
}

function validarAtual() {
  if (!state.questao) return;

  const valor = refs.answer.value;
  const resultado = validar(valor, state.questao);

  refs.question.classList.toggle("is-correct", resultado.correta);
  refs.question.classList.toggle("is-incorrect", !resultado.correta);
  refs.feedback.className = `answer-feedback ${resultado.correta ? "is-correct" : "is-incorrect"}`;

  if (resultado.correta) {
    const normalizado = normalize(valor);
    const detalhe = normalizado && normalizado !== valor.trim().toLowerCase()
      ? ` Normalizado: “${normalizado}”.`
      : "";
    refs.feedback.textContent = `✓ “${valor}” foi aceita.${detalhe}`;
    return;
  }

  const esperada = resultado.respostaEsperada || "—";
  refs.feedback.textContent = `✗ “${valor || "(vazio)"}” não foi aceita. Resposta esperada: ${esperada}.`;
}

/* ------------------------------------------------------------------------ */
/* INICIALIZAÇÃO                                                            */
/* ------------------------------------------------------------------------ */

function preencherFases() {
  for (let numero = 1; numero <= TOTAL_PHASES; numero += 1) {
    const info = getPhase(numero);
    const opcao = document.createElement("option");
    opcao.value = String(numero);
    opcao.textContent = `Fase ${numero} · ${info.topic}`;
    refs.phase.append(opcao);
  }
}

refs.phase.addEventListener("change", () => {
  state.fase = Number(refs.phase.value) || 1;
  state.contador = 0;
  state.sessao = null;
  gerarQuestaoLivre();
});

refs.seed.addEventListener("input", () => {
  state.contador = 0;
});

refs.form.addEventListener("submit", (event) => {
  event.preventDefault();
  validarAtual();
});

actions.gerar.addEventListener("click", gerarQuestaoLivre);
actions.variante.addEventListener("click", gerarVariante);
actions.seed.addEventListener("click", novaSeed);
actions.sessao.addEventListener("click", novaSessao);
actions.anterior.addEventListener("click", () => navegarSessao(-1));
actions.proxima.addEventListener("click", () => navegarSessao(1));

preencherFases();
refs.seed.value = state.seedRun;
refs.phase.value = String(state.fase);
gerarQuestaoLivre();
