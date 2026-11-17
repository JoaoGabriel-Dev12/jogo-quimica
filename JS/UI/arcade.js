import { ARCADE_CONFIG } from "../config.js";
import { getPhase } from "../phases.js";
import { criarCorridaArcade, calcularPontos, formatarTempo } from "../Systems/arcade.js";
import { createTimer } from "../Systems/timer.js";
import { validar } from "../Util/validar.js";
import { icons } from "./icons.js";
import { renderOpcoes, setOpcoesDisabled } from "./opcoes.js";

let cleanup = () => {};

export function mount(context) {
  const root = document.querySelector("#app");
  const state = context.state;
  const run = criarCorridaArcade();
  const total = run.length;
  let indice = 0;
  let pontos = 0;
  let acertos = 0;
  let erros = 0;
  let respondidas = 0;
  let vidas = ARCADE_CONFIG.vidas;
  let melhorCombo = 0;
  let combo = 0;
  let finished = false;
  let locked = false;
  let feedbackTimeout = 0;
  let timer;

  state.context.tempoRestante = ARCADE_CONFIG.tempoPorQuestao;
  state.context.phase = run[0]?.fase ?? 1;

  const screen = document.createElement("section");
  screen.className = "game-shell arcade-shell";
  screen.setAttribute("aria-label", "Modo Arcade");
  screen.innerHTML = `
    <header class="game-hud arcade-hud">
      <div class="hud-lead">
        <button class="hud-back" type="button" data-action="back" aria-label="Sair do modo arcade" title="Sair do modo arcade">${icons.arrowLeft}</button>
        <p class="hud-value arcade-timer" aria-label="Tempo restante da questão"><span>Tempo</span> <output data-timer></output></p>
      </div>
      <p class="hud-value arcade-score" aria-label="Pontuação"><span>Pontos</span> <output data-score>0</output></p>
      <p class="hud-value arcade-lives" data-lives aria-label="Vidas"></p>
    </header>
    <div class="game-progress" aria-hidden="true"><span class="game-progress-fill" data-progress></span></div>
    <main class="question-area question-stage" aria-label="Área da questão">
      <div class="question-meta">
        <span class="question-tag" data-counter></span>
        <span class="question-tag question-tag-phase" data-phase-tag></span>
        <span class="question-tag question-tag-combo" data-combo hidden></span>
      </div>
      <article class="question-text" tabindex="0"></article>
      <div class="answer-options" data-options hidden aria-label="Alternativas"></div>
      <p class="answer-feedback" role="status" aria-live="polite"></p>
    </main>
    <form class="game-footer arcade-footer">
      <label class="sr-only" for="arcade-answer">Sua resposta</label>
      <input id="arcade-answer" type="text" inputmode="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="Sua resposta" />
      <button class="send-button" type="submit">Enviar</button>
    </form>
  `;

  root.classList.add("game-active");
  document.body.classList.add("game-body");
  root.append(screen);

  const hud = screen.querySelector(".arcade-hud");
  const backButton = screen.querySelector('[data-action="back"]');
  const timerOutput = screen.querySelector("[data-timer]");
  const scoreOutput = screen.querySelector("[data-score]");
  const livesOutput = screen.querySelector("[data-lives]");
  const progress = screen.querySelector("[data-progress]");
  const counter = screen.querySelector("[data-counter]");
  const phaseTag = screen.querySelector("[data-phase-tag]");
  const comboTag = screen.querySelector("[data-combo]");
  const questionElement = screen.querySelector(".question-text");
  const optionsElement = screen.querySelector("[data-options]");
  const feedback = screen.querySelector(".answer-feedback");
  const form = screen.querySelector("form");
  const input = screen.querySelector("input");
  const sendButton = screen.querySelector(".send-button");
  let question = run[0];

  const renderTimer = (seconds) => {
    const texto = formatarTempo(seconds);
    timerOutput.value = texto;
    timerOutput.textContent = texto;
    hud.classList.toggle("is-time-warning", Math.ceil(seconds) <= ARCADE_CONFIG.avisoSegundos);
  };

  const renderLives = () => {
    livesOutput.replaceChildren();
    for (let i = 0; i < ARCADE_CONFIG.vidas; i += 1) {
      const life = document.createElement("span");
      life.className = `life${i < vidas ? "" : " is-lost"}`;
      life.innerHTML = icons.heart;
      life.setAttribute("aria-hidden", "true");
      livesOutput.append(life);
    }
    livesOutput.setAttribute("aria-label", `Vidas: ${vidas} de ${ARCADE_CONFIG.vidas}`);
    livesOutput.classList.toggle("is-critical", vidas === 1);
  };

  const renderScore = () => {
    scoreOutput.value = String(pontos);
    scoreOutput.textContent = String(pontos);
  };

  const renderCombo = () => {
    if (combo >= 2) {
      comboTag.hidden = false;
      comboTag.textContent = `Combo x${combo}`;
    } else {
      comboTag.hidden = true;
      comboTag.textContent = "";
    }
  };

  const renderQuestion = () => {
    question = run[indice];
    const phase = getPhase(question.fase);
    state.context.phase = question.fase;
    questionElement.dataset.questionId = question.id;
    questionElement.innerHTML = question.enunciado;
    questionElement.classList.remove("is-correct", "is-incorrect");
    feedback.textContent = "";
    feedback.className = "answer-feedback";
    counter.textContent = `Questão ${indice + 1}/${total}`;
    phaseTag.textContent = `Fase ${phase.number} · ${phase.topic}`;
    progress.style.width = `${((indice + 1) / total) * 100}%`;
    renderCombo();
    renderOpcoes(optionsElement, question.opcoes, (opcao) => {
      if (input.disabled) return;
      input.value = opcao;
      input.focus();
    });
    input.value = "";
    input.disabled = false;
    sendButton.disabled = false;
    locked = false;
    window.requestAnimationFrame(() => input.focus());
  };

  const finish = (motivo) => {
    if (finished) return;
    finished = true;
    timer.stop();
    window.clearTimeout(feedbackTimeout);
    state.goTo("ARCADE_FIM", {
      motivo,
      pontos,
      acertos,
      erros,
      respondidas,
      total,
      melhorCombo,
      vidasRestantes: vidas,
    });
  };

  const nextQuestion = () => {
    if (finished) return;
    if (vidas <= 0) {
      finish("vidas");
      return;
    }
    indice += 1;
    if (indice >= total) {
      finish("concluido");
      return;
    }
    renderQuestion();
    timer.reset(ARCADE_CONFIG.tempoPorQuestao);
  };

  const perderVida = () => {
    vidas = Math.max(0, vidas - 1);
    renderLives();
    return vidas <= 0;
  };

  const encerrarQuestao = (atraso = ARCADE_CONFIG.feedbackMs) => {
    window.clearTimeout(feedbackTimeout);
    feedbackTimeout = window.setTimeout(() => {
      if (vidas <= 0) finish("vidas");
      else nextQuestion();
    }, atraso);
  };

  const travarEntrada = () => {
    locked = true;
    timer.pause();
    input.disabled = true;
    sendButton.disabled = true;
    setOpcoesDisabled(optionsElement, true);
  };

  const aoEsgotarTempo = () => {
    if (finished || locked) return;
    travarEntrada();
    respondidas += 1;
    erros += 1;
    combo = 0;
    questionElement.classList.add("is-incorrect");
    feedback.className = "answer-feedback is-incorrect";
    feedback.textContent = `Tempo esgotado! Resposta: ${question.resposta}`;
    perderVida();
    encerrarQuestao(ARCADE_CONFIG.feedbackMs + 200);
  };

  const onSubmit = (event) => {
    event.preventDefault();
    if (finished || locked) return;

    const result = validar(input.value, question);
    respondidas += 1;
    travarEntrada();

    if (result.correta) {
      const ganho = calcularPontos({
        tempoRestante: state.context.tempoRestante,
        tempoTotal: ARCADE_CONFIG.tempoPorQuestao,
        comboAnterior: combo,
      });
      combo += 1;
      acertos += 1;
      melhorCombo = Math.max(melhorCombo, combo);
      pontos += ganho.total;
      renderScore();
      renderCombo();
      questionElement.classList.add("is-correct");
      feedback.className = "answer-feedback is-correct";
      feedback.textContent = `+${ganho.total} pts${ganho.bonusCombo ? ` · combo +${ganho.bonusCombo}` : ""}`;
      encerrarQuestao(ARCADE_CONFIG.feedbackMs - 200);
      return;
    }

    erros += 1;
    combo = 0;
    renderCombo();
    questionElement.classList.add("is-incorrect");
    feedback.className = "answer-feedback is-incorrect";
    feedback.textContent = `Resposta correta: ${result.respostaEsperada}`;
    perderVida();
    encerrarQuestao(ARCADE_CONFIG.feedbackMs + 200);
  };

  const updateViewportHeight = () => root.style.setProperty("--game-viewport-height", `${Math.round(window.visualViewport?.height ?? window.innerHeight)}px`);
  const onBack = () => {
    if (finished) return;
    if (!window.confirm("Sair da corrida? A pontuação desta tentativa será descartada.")) return;
    finished = true;
    timer?.stop();
    window.clearTimeout(feedbackTimeout);
    state.goTo("MENU");
  };

  form.addEventListener("submit", onSubmit);
  backButton.addEventListener("click", onBack);
  window.visualViewport?.addEventListener("resize", updateViewportHeight);
  updateViewportHeight();
  renderLives();
  renderScore();
  renderQuestion();
  renderTimer(ARCADE_CONFIG.tempoPorQuestao);

  timer = createTimer({
    state,
    onTick: renderTimer,
    onExpired: aoEsgotarTempo,
  });
  timer.start();

  cleanup = () => {
    timer?.stop();
    window.clearTimeout(feedbackTimeout);
    form.removeEventListener("submit", onSubmit);
    backButton.removeEventListener("click", onBack);
    window.visualViewport?.removeEventListener("resize", updateViewportHeight);
    root.style.removeProperty("--game-viewport-height");
    root.classList.remove("game-active");
    document.body.classList.remove("game-body");
  };
}

export function unmount() {
  cleanup();
  cleanup = () => {};
}
