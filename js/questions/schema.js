export const QUESTION_FORMATS = Object.freeze(["texto", "lacuna", "reacao"]);

export function defineQuestion(model) {
  if (!model?.id || !model?.fase || typeof model.gerar !== "function") {
    throw new Error("Um modelo de questão precisa de id, fase e gerar(rng).");
  }
  return Object.freeze(model);
}
