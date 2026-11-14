export const appName = "Química Orgânica";

export const GAME_CONFIG = Object.freeze({
  fases: Object.freeze([
    { duracao: 120, notaCorte: 300, colegas: 8 },
    { duracao: 150, notaCorte: 400, colegas: 10 },
    { duracao: 150, notaCorte: 400, colegas: 10 },
    { duracao: 180, notaCorte: 450, colegas: 12 },
    { duracao: 180, notaCorte: 450, colegas: 12 },
    { duracao: 180, notaCorte: 500, colegas: 14 },
    { duracao: 180, notaCorte: 500, colegas: 14 },
    { duracao: 210, notaCorte: 550, colegas: 16 },
    { duracao: 210, notaCorte: 550, colegas: 16 },
    { duracao: 210, notaCorte: 600, colegas: 18 },
    { duracao: 240, notaCorte: 650, colegas: 20 },
  ]),
  aura: Object.freeze({
    acerto: 100,
    bonusVelocidadeMax: 50,
    penalidadeConsulta: 30,
    penalidadeErro: 50,
  }),
  feedback: Object.freeze({ acertoMs: 600, erroMs: 1500 }),
  timer: Object.freeze({ avisoSegundos: 10 }),
  interface: Object.freeze({ transicaoMs: 150 }),
});
<<<<<<< HEAD
=======

export const ARCADE_CONFIG = Object.freeze({
  totalQuestoes: 15,
  vidas: 3,
  tempoPorQuestao: 12,
  avisoSegundos: 4,
  feedbackMs: 1100,
  pontosAcerto: 100,
  bonusTempoMax: 50,
  bonusCombo: 10,
  comboMax: 5,
  nomeMax: 16,
  nomeMin: 2,
  rankingLimite: 50,
  rankingExibicao: 10,
  rankingChave: "quimica-organica:arcade:ranking:v1",
});
>>>>>>> origin/master
