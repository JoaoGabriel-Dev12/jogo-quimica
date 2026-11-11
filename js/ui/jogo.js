import { GAME_CONFIG } from "../config.js";
import { getPhase, TOTAL_PHASES } from "../phases.js";
import { getQuestao, getTotalQuestoes, createSeededRng } from "../questions/gerador.js";
import { aplicarAcerto, aplicarConsulta } from "../systems/aura.js";
import { finalizarFase } from "../systems/fase.js";
import { createTimer } from "../systems/timer.js";
import { validar } from "../util/validar.js";

let cleanup = () => {};
const attemptsByPhase = new Map();

export function mount(context) {
  const root = document.querySelector("#app");
  const phase = Number(context.phase) || 1;
  const phaseInfo = getPhase(phase);
  const attempt = getNextAttempt(phase);
  const phaseContext = context.state.context;
  const stats = { correct: 0, incorrect: 0, penalties: 0, speedBonus: 0, consultationPenalty: 0, ...context.stats };
  let usedModelIds = context.usedModelIds ?? [];
  const consultasPorFase = Number(context.consultasPorFase) || 0;
  let consultedThisQuestion = Boolean(context.consultadaNestaQuestao);
  let phaseFinished = false;

  if (!Number.isFinite(phaseContext.tempoRestante)) phaseContext.tempoRestante = phaseInfo.durationSeconds;
  if (!Number.isFinite(phaseContext.aura)) phaseContext.aura = 0;
  phaseContext.stats = stats;
  phaseContext.consultasPorFase = consultasPorFase;
  phaseContext.consultadaNestaQuestao = consultedThisQuestion;

  let question = getQuestao(phase, createSeededRng(phase, `${attempt}:${usedModelIds.length}`), { excludeModelIds: usedModelIds });
  const screen = document.createElement("section");
  screen.className = "game-shell";
  screen.setAttribute("aria-label", "Área de jogo");
  screen.innerHTML = `
    <header class="game-hud">
      <p class="hud-value" aria-label="Tempo restante"><span>Timer</span> <output data-timer></output></p>
      <p class="hud-value" aria-label="Aura"><span>Aura</span> <output data-aura></output></p>
    </header>
    <main class="question-area" tabindex="0" aria-label="Área da questão">
      <article class="question-text" data-question-id="${question.id}">${question.enunciado}</article>
      <p class="answer-feedback" role="status" aria-live="polite"></p>
    </main>
    <button class="notebook-backdrop" type="button" hidden aria-label="Fechar caderno"></button>
    <aside class="notebook-panel" hidden aria-labelledby="notebook-title">
      <button class="notebook-close" type="button">Fechar</button>
      <div class="notebook-content"><h2 id="notebook-title">Consulta</h2>${phaseInfo.notebook.map((paragraph) => `<p>${paragraph}</p>`).join("")}</div>
    </aside>
    <form class="game-footer">
      <button class="notebook-button" type="button" aria-expanded="false">Caderno</button>
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
  const feedback = screen.querySelector(".answer-feedback");
  const notebookButton = screen.querySelector(".notebook-button");
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
    finalizarFase({ state: context.state, phase, filaConcluida, stats, consultasPorFase: phaseContext.consultasPorFase });
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
    window.requestAnimationFrame(() => input.focus());
  };
  const openNotebook = () => {
    notebookPanel.hidden = false;
    backdrop.hidden = false;
    notebookButton.setAttribute("aria-expanded", "true");
    if (!consultedThisQuestion) {
      consultedThisQuestion = true;
      const effect = aplicarConsulta(phaseContext);
      stats.penalties += 1;
      stats.consultationPenalty += Math.abs(effect.variacao);
      phaseContext.stats = stats;
      phaseContext.consultasPorFase += 1;
      phaseContext.consultadaNestaQuestao = true;
      renderAura(effect.variacao || -GAME_CONFIG.aura.penalidadeConsulta);
    }
  };
  const showNextQuestion = (nextUsedModelIds) => {
    if (nextUsedModelIds.length >= getTotalQuestoes(phase)) {
      finishPhase(true);
      return;
    }
    usedModelIds = nextUsedModelIds;
    phaseContext.usedModelIds = usedModelIds;
    consultedThisQuestion = false;
    phaseContext.consultadaNestaQuestao = false;
    question = getQuestao(phase, createSeededRng(phase, `${attempt}:${usedModelIds.length}`), { excludeModelIds: usedModelIds });
    questionElement.dataset.questionId = question.id;
    questionElement.innerHTML = question.enunciado;
    questionElement.classList.remove("is-correct", "is-incorrect");
    feedback.textContent = "";
    input.value = "";
    input.disabled = false;
    sendButton.disabled = false;
    notebookButton.disabled = false;
    feedbackTimeout = 0;
    renderDebugState();
    timer.resume();
    window.requestAnimationFrame(() => input.focus());
  };
  const skipToNextQuestion = () => {
    if (phaseFinished || feedbackTimeout) return;
    showNextQuestion([...usedModelIds, question.modelId]);
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
      const effect = aplicarAcerto(phaseContext, { tempoRestanteQuestao: phaseContext.tempoRestante, tempoTotalQuestao: phaseInfo.durationSeconds });
      stats.speedBonus += effect.bonusVelocidade;
      renderAura(effect.variacao);
    }
    const allUsedModels = [...usedModelIds, question.modelId];
    questionElement.classList.add(result.correta ? "is-correct" : "is-incorrect");
    feedback.textContent = result.correta ? "✓" : `Resposta correta: ${result.respostaEsperada}`;
    input.disabled = true;
    sendButton.disabled = true;
    notebookButton.disabled = true;
    timer.pause();
    feedbackTimeout = window.setTimeout(() => {
      showNextQuestion(allUsedModels);
    }, result.correta ? GAME_CONFIG.feedback.acertoMs : GAME_CONFIG.feedback.erroMs);
  };
  const updateViewportHeight = () => root.style.setProperty("--game-viewport-height", `${Math.round(window.visualViewport?.height ?? window.innerHeight)}px`);

  notebookButton.addEventListener("click", openNotebook);
  notebookClose.addEventListener("click", closeNotebook);
  backdrop.addEventListener("click", closeNotebook);
  form.addEventListener("submit", onSubmit);
  auraOutput.parentElement.addEventListener("animationend", () => auraOutput.parentElement.classList.remove("aura-gain", "aura-loss"));
  window.visualViewport?.addEventListener("resize", updateViewportHeight);
  updateViewportHeight();
  renderTimer(phaseContext.tempoRestante);
  renderAura();
  renderDebugState();
  timer.start();
  window.requestAnimationFrame(() => input.focus());

  cleanup = () => {
    timer.stop();
    window.clearTimeout(feedbackTimeout);
    notebookButton.removeEventListener("click", openNotebook);
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

function getNextAttempt(phase) {
  const attempt = (attemptsByPhase.get(phase) ?? 0) + 1;
  attemptsByPhase.set(phase, attempt);
  return attempt;
}
