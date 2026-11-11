import { GAME_CONFIG } from "./config.js";

export const TOTAL_PHASES = GAME_CONFIG.fases.length;
const phaseTopics = [
  "Fundamentos de Química Orgânica", "Cadeias carbônicas", "Hibridização", "Hidrocarbonetos",
  "Nomenclatura orgânica", "Isomeria plana", "Isomeria espacial", "Reações orgânicas",
  "Polímeros", "Bioquímica orgânica", "Síntese e revisão",
];

export function getPhase(number = 1) {
  const safeNumber = Math.min(Math.max(Number(number) || 1, 1), TOTAL_PHASES);
  const topic = phaseTopics[safeNumber - 1];
  const config = GAME_CONFIG.fases[safeNumber - 1];
  return {
    number: safeNumber,
    topic,
    duration: formatDuration(config.duracao),
    durationSeconds: config.duracao,
    auraCutoff: config.notaCorte,
    notebook: [
      `${topic} reúne conceitos que ajudam a interpretar estruturas e propriedades das moléculas orgânicas.`,
      "Use este espaço como consulta breve durante a fase; retome o enunciado para relacionar o conceito à resposta.",
    ],
  };
}

function formatDuration(seconds) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}
