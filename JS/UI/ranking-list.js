import { formatarData } from "../Systems/ranking.js";

function criarElemento(tag, className, texto) {
  const elemento = document.createElement(tag);
  if (className) elemento.className = className;
  if (texto !== undefined) elemento.textContent = texto;
  return elemento;
}

/**
 * Desenha o ranking com DOM seguro (sem interpolar nomes em innerHTML).
 */
export function renderRankingList(list, ranking, { empty, highlightId = "", mostrarData = false, limite = ranking.length } = {}) {
  const entradas = ranking.slice(0, limite);
  list.replaceChildren();

  entradas.forEach((entrada, indice) => {
    const item = criarElemento("li", "ranking-entry");
    if (indice === 0) item.classList.add("is-first");
    if (indice === 1) item.classList.add("is-second");
    if (indice === 2) item.classList.add("is-third");
    if (entrada.id === highlightId) item.classList.add("is-new");

    const posicao = criarElemento("span", "ranking-position", `${indice + 1}º`);
    posicao.setAttribute("aria-label", `${indice + 1}º lugar`);

    const jogador = criarElemento("span", "ranking-player");
    jogador.append(criarElemento("span", "ranking-name", entrada.nome));

    const acertos = `${entrada.acertos}/${entrada.total} acertos`;
    const meta = mostrarData
      ? `${acertos} · ${formatarData(entrada.data)}`
      : acertos;
    jogador.append(criarElemento("span", "ranking-meta", meta));

    const pontos = criarElemento("span", "ranking-score");
    pontos.append(criarElemento("strong", "", String(entrada.pontos)));
    pontos.append(criarElemento("small", "", "pts"));

    item.append(posicao, jogador, pontos);
    list.append(item);
  });

  list.hidden = entradas.length === 0;
  if (empty) empty.hidden = entradas.length > 0;
  return entradas.length;
}
