import { ARCADE_CONFIG } from "../config.js";
import { saveScore, validarNome } from "../Systems/ranking.js";
import { renderRankingList } from "./ranking-list.js";

let cleanup = () => {};

export function mount(context) {
  const concluido = context.motivo === "concluido";
  const pontos = Math.max(0, Math.round(Number(context.pontos) || 0));
  const acertos = Math.max(0, Math.round(Number(context.acertos) || 0));
  const erros = Math.max(0, Math.round(Number(context.erros) || 0));
  const respondidas = Math.max(0, Math.round(Number(context.respondidas) || 0));
  const total = Math.max(0, Math.round(Number(context.total) || ARCADE_CONFIG.totalQuestoes));
  const melhorCombo = Math.max(0, Math.round(Number(context.melhorCombo) || 0));
  const vidasRestantes = Math.max(0, Math.round(Number(context.vidasRestantes) || 0));
  const precisao = respondidas > 0 ? Math.round((acertos / respondidas) * 100) : 0;

  const card = document.createElement("section");
  card.className = "start-card cabinet-frame result-card arcade-result-card";
  card.setAttribute("aria-labelledby", "arcade-result-title");
  card.innerHTML = `
    <p class="eyebrow">Modo Arcade</p>
    <h1 id="arcade-result-title" class="${concluido ? "result-pass" : "result-fail"}">${concluido ? "Corrida concluída" : "Missão encerrada"}</h1>
    <p class="status">${concluido ? `Você respondeu todas as ${total} questões da corrida.` : "Suas vidas acabaram. Registre a pontuação e tente novamente."}</p>
    <div class="score-hero">
      <span>Pontuação final</span>
      <strong data-final-score>${pontos}</strong>
      <small>pts</small>
    </div>
    <dl class="arcade-stats">
      <div><dt>Acertos</dt><dd>${acertos}/${respondidas}</dd></div>
      <div><dt>Precisão</dt><dd>${precisao}%</dd></div>
      <div><dt>Erros</dt><dd>${erros}</dd></div>
      <div><dt>Melhor combo</dt><dd>x${melhorCombo}</dd></div>
      <div><dt>Vidas restantes</dt><dd>${vidasRestantes}/${ARCADE_CONFIG.vidas}</dd></div>
    </dl>
    <form class="name-form" novalidate>
      <label for="arcade-name">Seu nome no ranking</label>
      <div class="name-row">
        <input id="arcade-name" name="nome" type="text" maxlength="${ARCADE_CONFIG.nomeMax}" autocomplete="nickname" autocapitalize="words" spellcheck="false" placeholder="Ex.: Ana" required />
        <button class="button button-primary" type="submit">Salvar</button>
      </div>
      <p class="form-error" role="alert" hidden></p>
      <p class="save-status" role="status" aria-live="polite" hidden></p>
    </form>
    <section class="panel ranking-preview ranking-after-save" data-ranking-panel hidden aria-labelledby="arcade-ranking-title">
      <div class="panel-heading">
        <h2 id="arcade-ranking-title">Top ${ARCADE_CONFIG.rankingExibicao}</h2>
        <button class="text-button" type="button" data-action="ranking">Ver tudo</button>
      </div>
      <ol class="ranking-list" data-ranking></ol>
    </section>
    <div class="button-row">
      <button class="button button-primary" type="button" data-action="again">Jogar novamente</button>
      <button class="button button-secondary" type="button" data-action="menu">Menu</button>
    </div>
  `;

  const form = card.querySelector(".name-form");
  const input = card.querySelector("#arcade-name");
  const saveButton = form.querySelector('button[type="submit"]');
  const error = card.querySelector(".form-error");
  const status = card.querySelector(".save-status");
  const rankingPanel = card.querySelector("[data-ranking-panel]");
  const rankingList = card.querySelector("[data-ranking]");
  let saved = false;

  const mostrarErro = (mensagem) => {
    error.textContent = mensagem;
    error.hidden = false;
    input.setAttribute("aria-invalid", "true");
    input.focus();
  };

  const onSave = (event) => {
    event.preventDefault();
    if (saved) return;

    const validacao = validarNome(input.value);
    if (!validacao.valido) {
      mostrarErro(validacao.erro);
      return;
    }

    try {
      const { ranking, entrada, posicao } = saveScore({
        nome: validacao.nome,
        pontos,
        acertos,
        erros,
        total: respondidas,
        melhorCombo,
      });
      saved = true;
      error.hidden = true;
      input.removeAttribute("aria-invalid");
      input.value = entrada.nome;
      input.disabled = true;
      saveButton.disabled = true;
      saveButton.textContent = "Salvo";

      const dentroDoTop = posicao > 0 && posicao <= ARCADE_CONFIG.rankingExibicao;
      status.textContent = dentroDoTop
        ? `✓ ${entrada.nome}, você está em ${posicao}º lugar no ranking!`
        : `✓ Pontuação salva em ${posicao}º lugar. Continue treinando para entrar no top ${ARCADE_CONFIG.rankingExibicao}.`;
      status.hidden = false;
      status.classList.add("is-success");

      rankingPanel.hidden = false;
      renderRankingList(rankingList, ranking, {
        highlightId: entrada.id,
        limite: ARCADE_CONFIG.rankingExibicao,
      });
    } catch (erroSalvar) {
      mostrarErro(erroSalvar instanceof Error ? erroSalvar.message : "Não foi possível salvar a pontuação.");
    }
  };

  const onAgain = () => context.state.goTo("ARCADE");
  const onRanking = () => context.state.goTo("RANKING");
  const onMenu = () => context.state.goTo("MENU");

  form.addEventListener("submit", onSave);
  const buttons = [
    [card.querySelector('[data-action="again"]'), onAgain],
    [card.querySelector('[data-action="ranking"]'), onRanking],
    [card.querySelector('[data-action="menu"]'), onMenu],
  ];
  buttons.forEach(([button, handler]) => button.addEventListener("click", handler));
  document.querySelector("#app").append(card);
  window.requestAnimationFrame(() => input.focus());

  cleanup = () => {
    form.removeEventListener("submit", onSave);
    buttons.forEach(([button, handler]) => button.removeEventListener("click", handler));
  };
}

export function unmount() {
  cleanup();
  cleanup = () => {};
}
