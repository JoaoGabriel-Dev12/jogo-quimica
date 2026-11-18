import { GAME_CONFIG } from "../config.js";
import { getPhase, TOTAL_PHASES } from "../phases.js";
import { aplicarAcerto, aplicarErro, aplicarConsulta } from "../Systems/aura.js";
import { criarSessaoFase, finalizarFase } from "../Systems/fase.js";
import { createTimer } from "../Systems/timer.js";
import { validar } from "../Util/validar.js";
import { icons } from "./icons.js";
import { renderOpcoes, setOpcoesDisabled } from "./opcoes.js";

let cleanup = () => {};

export function mount(context) {
  const root = document.querySelector("#app");
  const phase = Number(context.phase) || 1;
  const phaseInfo = getPhase(phase);
  const phaseContext = context.state.context;
  const sessao = criarSessaoFase(phase);
  const stats = {
    correct: 0,
    incorrect: 0,
    penalties: 0,
    speedBonus: 0,
    consultationPenalty: 0,
    errorPenalty: 0,
    ...context.stats,
  };
  let usedModelIds = [...sessao.usados];
  const consultasPorFase = Number(context.consultasPorFase) || 0;
  let consultedThisQuestion = Boolean(context.consultadaNestaQuestao);
  let phaseFinished = false;

  if (!Number.isFinite(phaseContext.tempoRestante)) phaseContext.tempoRestante = phaseInfo.durationSeconds;
  if (!Number.isFinite(phaseContext.aura)) phaseContext.aura = 0;
  phaseContext.stats = stats;
  phaseContext.consultasPorFase = consultasPorFase;
  phaseContext.consultadaNestaQuestao = consultedThisQuestion;
  phaseContext.usedModelIds = usedModelIds;

  const totalQuestoesFase = sessao.total;
  const tempoIdealPorQuestao = phaseInfo.durationSeconds / totalQuestoesFase;
  let inicioQuestaoTempo = phaseContext.tempoRestante;

  let question = sessao.proxima();
  const screen = document.createElement("section");
  screen.className = "game-shell cabinet-frame";
  screen.setAttribute("aria-label", "Área de jogo");
  screen.innerHTML = `
    <header class="game-hud">
      <div class="hud-lead">
        <button class="hud-back" type="button" data-action="back" aria-label="Voltar ao briefing" title="Voltar ao briefing">${icons.arrowLeft}</button>
        <p class="hud-value" aria-label="Tempo restante"><span>Tempo</span> <output data-timer></output></p>
      </div>
      <p class="hud-value" aria-label="Pontos"><span>Pontos</span> <output data-aura></output></p>
    </header>
    <div class="game-progress" aria-hidden="true"><span class="game-progress-fill" data-progress style="width: ${(1 / totalQuestoesFase) * 100}%"></span></div>
    <main class="question-area question-stage" tabindex="0" aria-label="Área da questão">
      <div class="question-meta">
        <span class="question-tag" data-counter>Questão 1/${totalQuestoesFase}</span>
        <span class="question-tag question-tag-phase" data-phase-tag>Fase ${phase} · ${phaseInfo.topic}</span>
      </div>
      <article class="question-text" data-question-id="${question.id}">${question.enunciado}</article>
      <div class="answer-options" data-options hidden aria-label="Alternativas"></div>
      <p class="answer-feedback" role="status" aria-live="polite"></p>
    </main>
    <button class="notebook-backdrop" type="button" hidden aria-label="Fechar caderno"></button>
    <aside class="notebook-panel" hidden aria-labelledby="notebook-title">
      <button class="notebook-close" type="button">Fechar</button>
      <div class="notebook-content"><h2 id="notebook-title">Consulta</h2>${phaseInfo.notebook.map((paragraph) => `<p>${paragraph}</p>`).join("")}</div>
    </aside>
    <form class="game-footer">
      <button class="notebook-button" type="button" aria-expanded="false" title="Consultar caderno (-${GAME_CONFIG.aura.penalidadeConsulta} pontos)">
        Caderno (−${GAME_CONFIG.aura.penalidadeConsulta})
      </button>
      <label class="sr-only" for="game-answer">Sua resposta</label>
      <input id="game-answer" type="text" inputmode="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="Sua resposta" />
      <button class="send-button" type="submit">Enviar</button>
    </form>
  `;

  root.classList.add("game-active");
  document.body.classList.add("game-body");
  root.append(screen);

  const hud = screen.querySelector(".game-hud");
  const timerOutput = screen.querySelector("[data-timer]");
  const auraOutput = screen.querySelector("[data-aura]");
  const questionElement = screen.querySelector(".question-text");
  const optionsElement = screen.querySelector("[data-options]");
  const feedback = screen.querySelector(".answer-feedback");
  const questionCounter = screen.querySelector("[data-counter]");
  const phaseTag = screen.querySelector("[data-phase-tag]");
  const progress = screen.querySelector("[data-progress]");
  const notebookButton = screen.querySelector(".notebook-button");
  const backButton = screen.querySelector('[data-action="back"]');
  const notebookClose = screen.querySelector(".notebook-close");
  const notebookPanel = screen.querySelector(".notebook-panel");
  const backdrop = screen.querySelector(".notebook-backdrop");
  const form = screen.querySelector("form");
  const sendButton = screen.querySelector(".send-button");
  const input = screen.querySelector("input");
  let feedbackTimeout = 0;
  let lastDebugState = "";
  let timer;

  const renderTimer = (seconds) => {
    const wholeSeconds = Math.ceil(seconds);
    timerOutput.value = `${String(Math.floor(wholeSeconds / 60)).padStart(2, "0")}:${String(wholeSeconds % 60).padStart(2, "0")}`;
    timerOutput.textContent = timerOutput.value;
    hud.classList.toggle("is-time-warning", wholeSeconds <= GAME_CONFIG.timer.avisoSegundos);
    renderDebugState();
  };
  const renderAura = (variation = 0) => {
    auraOutput.value = String(phaseContext.aura);
    auraOutput.textContent = String(phaseContext.aura);
    renderDebugState();
    if (variation !== 0) {
      auraOutput.parentElement.classList.remove("aura-gain", "aura-loss");
      void auraOutput.offsetWidth;
      auraOutput.parentElement.classList.add(variation > 0 ? "aura-gain" : "aura-loss");
    }
  };
  const finishPhase = (filaConcluida) => {
    if (phaseFinished) return;
    phaseFinished = true;
    timer.pause();
    phaseContext.aura = Math.max(0, phaseContext.aura);
    finalizarFase({ state: context.state, phase, filaConcluida, stats, consultasPorFase: phaseContext.consultasPorFase });
  };
  const renderQuestionOptions = () => {
    renderOpcoes(optionsElement, question.opcoes, (opcao) => {
      if (input.disabled) return;
      input.value = opcao;
      input.focus();
    });
  };
  const renderDebugState = () => {
    const seconds = Math.max(0, Math.ceil(phaseContext.tempoRestante ?? 0));
    const snapshot = JSON.stringify({ aura: phaseContext.aura, seconds, modelId: question.modelId, params: question.params });
    if (snapshot === lastDebugState) return;
    lastDebugState = snapshot;
    context.state.emit("debug:state", {
      aura: phaseContext.aura,
      tempoRestante: seconds,
      modelId: question.modelId,
      params: question.params,
    });
  };
  timer = createTimer({
    state: context.state,
    onTick: renderTimer,
    onExpired: () => finishPhase(false),
  });
  const closeNotebook = () => {
    notebookPanel.hidden = true;
    backdrop.hidden = true;
    notebookButton.setAttribute("aria-expanded", "false");
    if (!phaseFinished && !feedbackTimeout) timer.resume();
    window.requestAnimationFrame(() => input.focus());
  };
  const openNotebook = () => {
    if (phaseFinished || feedbackTimeout || !notebookPanel.hidden) return;
    notebookPanel.hidden = false;
    backdrop.hidden = false;
    notebookButton.setAttribute("aria-expanded", "true");
    timer.pause();

    consultedThisQuestion = true;
    const effect = aplicarConsulta(phaseContext);
    stats.penalties += 1;
    stats.consultationPenalty += Math.abs(effect.variacao);
    phaseContext.stats = stats;
    phaseContext.consultasPorFase += 1;
    phaseContext.consultadaNestaQuestao = true;
    renderAura(effect.variacao);
  };
  const showNextQuestion = () => {
    if (sessao.concluida()) {
      finishPhase(true);
      return;
    }
    usedModelIds = [...sessao.usados];
    phaseContext.usedModelIds = usedModelIds;
    questionCounter.textContent = `Questão ${usedModelIds.length + 1}/${totalQuestoesFase}`;
    phaseTag.textContent = `Fase ${phase} · ${phaseInfo.topic}`;
    progress.style.width = `${((usedModelIds.length + 1) / totalQuestoesFase) * 100}%`;
    consultedThisQuestion = false;
    phaseContext.consultadaNestaQuestao = false;
    inicioQuestaoTempo = phaseContext.tempoRestante;
    question = sessao.proxima();
    questionElement.dataset.questionId = question.id;
    questionElement.innerHTML = question.enunciado;
    questionElement.classList.remove("is-correct", "is-incorrect");
    feedback.className = "answer-feedback";
    feedback.textContent = "";
    input.value = "";
    input.disabled = false;
    sendButton.disabled = false;
    notebookButton.disabled = false;
    feedbackTimeout = 0;
    renderQuestionOptions();
    renderDebugState();
    timer.resume();
    window.requestAnimationFrame(() => input.focus());
  };
  const skipToNextQuestion = () => {
    if (phaseFinished || feedbackTimeout) return;
    sessao.marcar(question);
    showNextQuestion();
  };
  const forcePhaseAdvance = () => {
    if (phase >= TOTAL_PHASES) {
      context.state.goTo("FIM", { phase: TOTAL_PHASES });
      return;
    }
    context.state.goTo("BRIEFING", { phase: phase + 1 });
  };
  const unsubscribeDebugNext = context.state.on("debug:next-question", skipToNextQuestion);
  const unsubscribeDebugPhase = context.state.on("debug:next-phase", forcePhaseAdvance);
  const unsubscribeDebugExpire = context.state.on("debug:expire", () => timer.expire());
  const onSubmit = (event) => {
    event.preventDefault();
    if (feedbackTimeout || phaseFinished) return;
    const result = validar(input.value, question);
    stats[result.correta ? "correct" : "incorrect"] += 1;
    phaseContext.stats = stats;
    if (result.correta) {
      const tempoGasto = Math.max(0, inicioQuestaoTempo - phaseContext.tempoRestante);
      const tempoRestanteQuestao = Math.max(0, tempoIdealPorQuestao - tempoGasto);
      const effect = aplicarAcerto(phaseContext, { tempoRestanteQuestao, tempoTotalQuestao: tempoIdealPorQuestao });
      stats.speedBonus += effect.bonusVelocidade;
      renderAura(effect.variacao);
    } else {
      const effect = aplicarErro(phaseContext);
      stats.errorPenalty += Math.abs(effect.variacao);
      renderAura(effect.variacao);
    }
    sessao.marcar(question);
    questionElement.classList.add(result.correta ? "is-correct" : "is-incorrect");
    feedback.className = result.correta ? "answer-feedback is-correct" : "answer-feedback is-incorrect";
    feedback.textContent = result.correta ? "✓" : `Resposta correta: ${result.respostaEsperada}`;
    input.disabled = true;
    sendButton.disabled = true;
    notebookButton.disabled = true;
    setOpcoesDisabled(optionsElement, true);
    timer.pause();
    feedbackTimeout = window.setTimeout(() => {
      showNextQuestion();
    }, result.correta ? GAME_CONFIG.feedback.acertoMs : GAME_CONFIG.feedback.erroMs);
  };
  const updateViewportHeight = () => root.style.setProperty("--game-viewport-height", `${Math.round(window.visualViewport?.height ?? window.innerHeight)}px`);
  const onBack = () => {
    if (phaseFinished) return;
    if (!window.confirm("Voltar ao briefing? O progresso desta tentativa será perdido.")) return;
    context.state.goTo("BRIEFING", { phase });
  };

  notebookButton.addEventListener("click", openNotebook);
  backButton.addEventListener("click", onBack);
  notebookClose.addEventListener("click", closeNotebook);
  backdrop.addEventListener("click", closeNotebook);
  form.addEventListener("submit", onSubmit);
  auraOutput.parentElement.addEventListener("animationend", () => auraOutput.parentElement.classList.remove("aura-gain", "aura-loss"));
  window.visualViewport?.addEventListener("resize", updateViewportHeight);
  updateViewportHeight();
  renderQuestionOptions();
  renderTimer(phaseContext.tempoRestante);
  renderAura();
  renderDebugState();
  timer.start();
  window.requestAnimationFrame(() => input.focus());

  cleanup = () => {
    timer.stop();
    window.clearTimeout(feedbackTimeout);
    notebookButton.removeEventListener("click", openNotebook);
    backButton.removeEventListener("click", onBack);
    notebookClose.removeEventListener("click", closeNotebook);
    backdrop.removeEventListener("click", closeNotebook);
    form.removeEventListener("submit", onSubmit);
    unsubscribeDebugNext();
    unsubscribeDebugPhase();
    unsubscribeDebugExpire();
    window.visualViewport?.removeEventListener("resize", updateViewportHeight);
    root.style.removeProperty("--game-viewport-height");
    root.classList.remove("game-active");
    document.body.classList.remove("game-body");
  };
}

export function unmount() { cleanup(); cleanup = () => {}; }
