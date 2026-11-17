import { ARCADE_CONFIG } from "../config.js";

function armazenamentoPadrao() {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

function numeroInteiro(value) {
  const numero = Number(value);
  return Number.isFinite(numero) ? Math.max(0, Math.round(numero)) : 0;
}

function normalizarEntrada(entrada) {
  if (!entrada || typeof entrada !== "object") return null;
  const nome = typeof entrada.nome === "string" ? entrada.nome.trim().slice(0, ARCADE_CONFIG.nomeMax) : "";
  if (nome.length < ARCADE_CONFIG.nomeMin) return null;

  return {
    id: String(entrada.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
    nome,
    pontos: numeroInteiro(entrada.pontos),
    acertos: numeroInteiro(entrada.acertos),
    erros: numeroInteiro(entrada.erros),
    total: numeroInteiro(entrada.total),
    melhorCombo: numeroInteiro(entrada.melhorCombo),
    data: Number.isFinite(Number(entrada.data)) ? Number(entrada.data) : Date.now(),
  };
}

function comparar(a, b) {
  if (b.pontos !== a.pontos) return b.pontos - a.pontos;
  if (b.acertos !== a.acertos) return b.acertos - a.acertos;
  return a.data - b.data;
}

export function loadRanking(storage = armazenamentoPadrao()) {
  if (!storage) return [];
  try {
    const bruto = storage.getItem(ARCADE_CONFIG.rankingChave);
    if (!bruto) return [];
    const dados = JSON.parse(bruto);
    if (!Array.isArray(dados)) return [];

    return dados
      .map(normalizarEntrada)
      .filter(Boolean)
      .sort(comparar)
      .slice(0, ARCADE_CONFIG.rankingLimite);
  } catch {
    return [];
  }
}

export function saveScore(dados, storage = armazenamentoPadrao()) {
  const entrada = normalizarEntrada({
    ...dados,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    data: Date.now(),
  });
  if (!entrada) throw new Error("Nome inválido para o ranking.");

  const todos = [...loadRanking(storage), entrada].sort(comparar);
  const posicao = todos.findIndex((item) => item.id === entrada.id) + 1;
  const ranking = todos.slice(0, ARCADE_CONFIG.rankingLimite);

  if (storage) {
    try {
      storage.setItem(ARCADE_CONFIG.rankingChave, JSON.stringify(ranking));
    } catch {
      // Sem espaço ou armazenamento bloqueado: o ranking continua válido em memória.
    }
  }

  return { entrada, ranking, posicao };
}

export function clearRanking(storage = armazenamentoPadrao()) {
  if (!storage) return;
  try {
    storage.removeItem(ARCADE_CONFIG.rankingChave);
  } catch {
    // Armazenamento indisponível: nada a limpar.
  }
}

export function validarNome(nome) {
  const limpo = String(nome ?? "").trim().replace(/\s+/gu, " ");

  if (limpo.length < ARCADE_CONFIG.nomeMin) {
    return { valido: false, nome: limpo, erro: `Use pelo menos ${ARCADE_CONFIG.nomeMin} caracteres.` };
  }
  if (limpo.length > ARCADE_CONFIG.nomeMax) {
    return { valido: false, nome: limpo, erro: `Use no máximo ${ARCADE_CONFIG.nomeMax} caracteres.` };
  }
  return { valido: true, nome: limpo, erro: "" };
}

export function formatarData(timestamp) {
  const data = new Date(Number(timestamp) || Date.now());
  try {
    return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" }).format(data);
  } catch {
    return data.toLocaleDateString?.() ?? "";
  }
}
