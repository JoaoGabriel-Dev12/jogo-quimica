import { normalize } from "./normalize.js";

export function validar(respostaUsuario, { resposta, aliases = [] }) {
  const usuario = normalize(respostaUsuario);
  const respostasValidas = [resposta, ...aliases].map(normalize);
  return {
    correta: usuario.length > 0 && respostasValidas.includes(usuario),
    respostaEsperada: resposta,
  };
}
