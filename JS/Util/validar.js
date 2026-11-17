import { normalize } from "./normalize.js";

/**
 * Coleta todas as respostas aceitas de uma questão, tanto no formato novo
 * (`respostas[]`) quanto no antigo (`resposta` + `aliases`).
 */
function coletarRespostas(questao = {}) {
  const valores = [];

  const adicionar = (entrada) => {
    if (entrada == null) return;
    if (Array.isArray(entrada)) {
      entrada.forEach(adicionar);
      return;
    }
    if (typeof entrada === "object") {
      adicionar(entrada.valor ?? entrada.resposta);
      adicionar(entrada.aliases);
      return;
    }
    const texto = String(entrada).trim();
    if (texto) valores.push(texto);
  };

  adicionar(questao.respostas);
  adicionar(questao.resposta);
  adicionar(questao.aliases);

  return {
    valores,
    normalizadas: new Set(valores.map(normalize)),
  };
}

/**
 * Valida a resposta do jogador.
 * Questões podem fornecer um `validarResposta(valorNormalizado, helpers)`
 * para casos em que a resposta correta é um conjunto/combinação (ex.: pares
 * de isômeros), e não uma única string.
 */
export function validar(respostaUsuario, questao = {}) {
  const usuario = normalize(respostaUsuario);
  const { valores, normalizadas } = coletarRespostas(questao);
  const respostaEsperada = questao.resposta ?? valores[0] ?? "";

  if (!usuario) return { correta: false, respostaEsperada };

  if (typeof questao.validarResposta === "function") {
    try {
      const correta = Boolean(questao.validarResposta(usuario, { questao, normalizar: normalize }));
      return { correta, respostaEsperada };
    } catch (erro) {
      console.warn("Validador personalizado falhou:", erro);
      return { correta: false, respostaEsperada };
    }
  }

  return {
    correta: normalizadas.has(usuario),
    respostaEsperada,
  };
}
