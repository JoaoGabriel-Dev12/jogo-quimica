/**
 * Renderiza alternativas clicáveis para questões que trouxerem `opcoes`.
 * O clique apenas preenche o campo de resposta; o envio continua sendo
 * feito pelo formulário (botão Enviar ou Enter).
 */
export function renderOpcoes(container, opcoes, onSelect) {
  if (!container) return;

  container.replaceChildren();
  const lista = Array.isArray(opcoes) ? opcoes.filter(Boolean) : [];
  container.hidden = lista.length === 0;
  if (!lista.length) return;

  for (const opcao of lista) {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "answer-option";
    botao.textContent = opcao;
    botao.addEventListener("click", () => onSelect?.(opcao));
    container.append(botao);
  }
}

export function setOpcoesDisabled(container, disabled) {
  if (!container) return;
  container.querySelectorAll("button").forEach((botao) => {
    botao.disabled = Boolean(disabled);
  });
}
