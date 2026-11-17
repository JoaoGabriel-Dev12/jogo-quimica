import { normalize } from "../Util/normalize.js";

/**
 * Contrato das questões.
 *
 * Um modelo pode ser declarado de três formas:
 * - estática:  defineQuestion({ id, fase, enunciado, resposta, aliases })
 * - dinâmica:  defineQuestion({ id, fase, gerar(rng) { ... } })
 * - template:  defineQuestion({ id, fase, variantes, template: { enunciado, respostas, ... } })
 *
 * O gerador sempre recebe uma questão normalizada, com:
 * - resposta: primeira resposta correta (compatibilidade com o código antigo)
 * - respostas: todas as respostas corretas aceitas
 * - aliases: variações adicionais aceitas
 * - distratores: alternativas incorretas
 * - opcoes: alternativas já embaralhadas (quando o modelo fornecer)
 */

export const QUESTION_FORMATS = Object.freeze(["texto", "lacuna", "reacao", "opcoes"]);
export const QUESTION_KINDS = Object.freeze(["estatica", "dinamica", "template"]);

const DEFAULT_FORMAT = "texto";
const PLACEHOLDER_PATTERN = /\{([a-zA-Z0-9_]+)\}/gu;

function falha(mensagem) {
  throw new Error(`[Questões] ${mensagem}`);
}

function objetoSimples(valor) {
  return valor !== null && typeof valor === "object" && !Array.isArray(valor);
}

function comoLista(valor) {
  if (valor == null) return [];
  return Array.isArray(valor) ? valor : [valor];
}

function comoTexto(valor) {
  return valor == null ? "" : String(valor).trim();
}

function achatarRespostas(entrada, destino) {
  for (const item of comoLista(entrada)) {
    if (item == null) continue;
    if (Array.isArray(item)) {
      achatarRespostas(item, destino);
      continue;
    }
    if (objetoSimples(item)) {
      achatarRespostas(item.valor ?? item.resposta, destino);
      achatarRespostas(item.aliases, destino);
      continue;
    }
    const valor = comoTexto(item);
    if (valor) destino.push(valor);
  }
}

function deduplicar(valores) {
  const vistos = new Set();
  return valores.filter((valor) => {
    const chave = normalize(valor);
    if (!chave || vistos.has(chave)) return false;
    vistos.add(chave);
    return true;
  });
}

/**
 * Normaliza as respostas de uma questão.
 * Aceita string, array de strings, arrays de { valor, aliases } e a forma antiga
 * `resposta` + `aliases`.
 */
export function normalizarRespostas(entrada = {}) {
  const respostas = [];
  const aliases = [];

  achatarRespostas(entrada.respostas ?? entrada.corretas, respostas);
  achatarRespostas(entrada.resposta, respostas);
  achatarRespostas(entrada.aliases, aliases);

  const corretas = deduplicar(respostas);
  const chavesCorretas = new Set(corretas.map(normalize));
  const extras = deduplicar(aliases).filter((valor) => !chavesCorretas.has(normalize(valor)));

  // Compatibilidade: se o modelo só informou aliases, o primeiro vira a resposta principal.
  if (!corretas.length && extras.length) corretas.push(extras.shift());

  return {
    resposta: corretas[0] ?? "",
    respostas: corretas,
    aliases: extras,
  };
}

function normalizarLista(entrada) {
  const valores = [];
  achatarRespostas(entrada, valores);
  return deduplicar(valores);
}

function validarBase(modelo) {
  if (!objetoSimples(modelo)) falha("Um modelo de questão deve ser um objeto.");
  const id = comoTexto(modelo.id);
  if (!id) falha("Um modelo de questão precisa de id.");
  const fase = Number(modelo.fase);
  if (!Number.isFinite(fase)) falha(`O modelo "${id}" precisa de uma fase numérica.`);
  const formato = modelo.formato ?? DEFAULT_FORMAT;
  if (!QUESTION_FORMATS.includes(formato)) {
    falha(`O modelo "${id}" usa o formato inválido "${formato}".`);
  }
  return { id, fase, formato };
}

function criarGeradorEstatico(modelo) {
  return () => ({
    enunciado: modelo.enunciado,
    resposta: modelo.resposta,
    respostas: modelo.respostas,
    aliases: modelo.aliases,
    distratores: modelo.distratores,
    opcoes: modelo.opcoes,
    formato: modelo.formato,
    params: modelo.params ? { ...modelo.params } : {},
    validarResposta: modelo.validarResposta,
  });
}

function resolverVariante(variante, rng) {
  if (!objetoSimples(variante)) return { valor: variante };
  const valores = {};
  for (const [chave, valor] of Object.entries(variante)) {
    valores[chave] = typeof valor === "function" ? valor(rng) : valor;
  }
  return valores;
}

function renderizar(valor, valores, rng) {
  if (typeof valor === "function") return renderizar(valor(valores, rng), valores, rng);
  if (valor == null) return "";

  if (Array.isArray(valor)) {
    return valor.map((item) => renderizar(item, valores, rng)).filter((item) => item !== "");
  }

  if (objetoSimples(valor)) {
    if (valor.valor != null || valor.resposta != null) {
      return {
        valor: renderizar(valor.valor ?? valor.resposta, valores, rng),
        aliases: renderizarLista(valor.aliases, valores, rng),
      };
    }
    return Object.fromEntries(
      Object.entries(valor).map(([chave, item]) => [chave, renderizar(item, valores, rng)]),
    );
  }

  return String(valor).replace(PLACEHOLDER_PATTERN, (_, chave) => {
    if (!(chave in valores)) falha(`A variável "{${chave}}" não existe nas variantes do template.`);
    return String(valores[chave]);
  });
}

function renderizarLista(valor, valores, rng) {
  if (valor == null) return [];
  if (typeof valor === "function") return renderizarLista(valor(valores, rng), valores, rng);

  const itens = Array.isArray(valor) ? valor : [valor];
  const resultado = [];
  for (const item of itens) {
    const renderizado = renderizar(item, valores, rng);
    if (Array.isArray(renderizado)) resultado.push(...renderizado);
    else if (renderizado != null && renderizado !== "") resultado.push(renderizado);
  }
  return resultado;
}

function resolverParams(espec, valores, rng) {
  if (typeof espec === "function") {
    const resultado = espec(valores, rng);
    return objetoSimples(resultado) ? resultado : {};
  }

  if (Array.isArray(espec)) {
    return Object.fromEntries(espec.filter((chave) => chave in valores).map((chave) => [chave, valores[chave]]));
  }

  if (objetoSimples(espec)) {
    return Object.fromEntries(
      Object.entries(espec).map(([chave, valor]) => {
        if (typeof valor === "function") return [chave, valor(valores, rng)];
        if (typeof valor === "string") return [chave, renderizar(valor, valores, rng)];
        return [chave, valor];
      }),
    );
  }

  return Object.fromEntries(
    Object.entries(valores).filter(([, valor]) => valor == null || typeof valor !== "object"),
  );
}

function validarPlaceholders(template, campos, id) {
  const revisar = (valor) => {
    if (typeof valor === "string") {
      for (const [, chave] of valor.matchAll(PLACEHOLDER_PATTERN)) {
        if (!campos.has(chave)) {
          falha(`O template "${id}" usa "{${chave}}", mas nenhuma variante possui esse campo.`);
        }
      }
      return;
    }
    if (Array.isArray(valor)) {
      valor.forEach(revisar);
      return;
    }
    if (objetoSimples(valor)) Object.values(valor).forEach(revisar);
  };

  if (typeof template.enunciado !== "function") revisar(template.enunciado);
  for (const campo of ["respostas", "corretas", "aliases", "distratores", "opcoes"]) {
    if (typeof template[campo] !== "function") revisar(template[campo]);
  }
}

function compilarTemplate(modelo, base) {
  const template = modelo.template;
  if (!objetoSimples(template)) {
    falha(`O modelo "${base.id}" precisa de um objeto template.`);
  }

  const variantes = comoLista(modelo.variantes ?? template.variantes);
  if (!variantes.length) falha(`O template "${base.id}" precisa de pelo menos uma variante.`);

  const campos = new Set();
  for (const variante of variantes) {
    if (objetoSimples(variante)) Object.keys(variante).forEach((chave) => campos.add(chave));
    else campos.add("valor");
  }

  validarPlaceholders(template, campos, base.id);

  if (Array.isArray(template.params)) {
    for (const chave of template.params) {
      if (!campos.has(chave)) {
        falha(`O template "${base.id}" pede o parâmetro "${chave}", mas nenhuma variante o possui.`);
      }
    }
  }

  return (rng = Math.random, contexto = {}) => {
    const variante = typeof modelo.sortearVariante === "function"
      ? modelo.sortearVariante(variantes, rng)
      : variantes[Math.floor(rng() * variantes.length)];

    const valores = resolverVariante(variante, rng);

    if (typeof modelo.montar === "function") {
      return modelo.montar({ variante, valores, rng, contexto, template });
    }

    return {
      enunciado: renderizar(template.enunciado, valores, rng),
      respostas: renderizarLista(template.respostas ?? template.corretas, valores, rng),
      aliases: renderizarLista(template.aliases, valores, rng),
      distratores: renderizarLista(template.distratores, valores, rng),
      opcoes: renderizarLista(template.opcoes, valores, rng),
      formato: template.formato ?? modelo.formato,
      params: resolverParams(template.params, valores, rng),
      validarResposta: template.validarResposta ?? modelo.validarResposta,
    };
  };
}

/**
 * Valida e normaliza uma instância gerada. É chamada pelo gerador em toda
 * rodada, então protege o jogo contra modelos quebrados ou incompletos.
 */
export function normalizarQuestao(bruta, modelo = {}) {
  if (!objetoSimples(bruta)) {
    falha(`O modelo "${modelo.id ?? "?"}" não retornou um objeto de questão.`);
  }

  const enunciado = comoTexto(bruta.enunciado ?? modelo.enunciado);
  if (!enunciado) falha(`A questão do modelo "${modelo.id ?? "?"}" está sem enunciado.`);

  const formato = bruta.formato ?? modelo.formato ?? DEFAULT_FORMAT;
  if (!QUESTION_FORMATS.includes(formato)) {
    falha(`A questão "${modelo.id ?? "?"}" usa o formato inválido "${formato}".`);
  }

  const respostas = normalizarRespostas({
    resposta: bruta.resposta ?? modelo.resposta,
    respostas: bruta.respostas ?? bruta.corretas ?? modelo.respostas,
    aliases: bruta.aliases ?? modelo.aliases,
  });

  const validarResposta = bruta.validarResposta ?? modelo.validarResposta;
  if (!respostas.respostas.length && typeof validarResposta !== "function") {
    falha(`A questão "${modelo.id ?? "?"}" precisa de pelo menos uma resposta correta.`);
  }

  const aceitas = new Set([...respostas.respostas, ...respostas.aliases].map(normalize));
  const distratores = normalizarLista(bruta.distratores ?? modelo.distratores)
    .filter((valor) => !aceitas.has(normalize(valor)));
  const opcoes = normalizarLista(bruta.opcoes ?? modelo.opcoes);
  const chavesOpcoes = new Set(opcoes.map(normalize));
  const distratoresUnicos = distratores.filter((valor) => !chavesOpcoes.has(normalize(valor)));

  return Object.freeze({
    ...bruta,
    enunciado,
    formato,
    resposta: respostas.resposta,
    respostas: respostas.respostas,
    aliases: respostas.aliases,
    distratores: distratoresUnicos,
    opcoes,
    params: objetoSimples(bruta.params) ? { ...bruta.params } : {},
    validarResposta: typeof validarResposta === "function" ? validarResposta : undefined,
    tipo: modelo.tipo ?? bruta.tipo ?? "dinamica",
    fase: Number(modelo.fase ?? bruta.fase),
  });
}

/**
 * Define um modelo de questão. O tipo é inferido:
 * - `gerar` presente -> dinâmica;
 * - `template` presente -> template declarativo;
 * - caso contrário -> estática.
 */
export function defineQuestion(modelo) {
  const base = validarBase(modelo);

  const temGerar = typeof modelo.gerar === "function";
  const temTemplate = modelo.template != null;
  const temEstatica = !temGerar && !temTemplate && modelo.enunciado != null;

  const formas = [temGerar, temTemplate, temEstatica].filter(Boolean).length;
  if (formas !== 1) {
    falha(`O modelo "${base.id}" deve ter exatamente uma forma: gerar, template ou enunciado estático.`);
  }

  let tipo;
  let gerar;

  if (temGerar) {
    tipo = "dinamica";
    gerar = modelo.gerar;
  } else if (temTemplate) {
    tipo = "template";
    gerar = compilarTemplate(modelo, base);
  } else {
    tipo = "estatica";
    const respostas = normalizarRespostas({
      resposta: modelo.resposta,
      respostas: modelo.respostas,
      aliases: modelo.aliases,
    });
    if (!respostas.respostas.length && typeof modelo.validarResposta !== "function") {
      falha(`A questão estática "${base.id}" precisa de resposta.`);
    }
    gerar = criarGeradorEstatico(modelo);
  }

  return Object.freeze({ ...modelo, ...base, tipo, gerar });
}
