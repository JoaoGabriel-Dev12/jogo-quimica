export function normalize(value) {
  return String(value ?? "")
    .toLocaleLowerCase()
    .replace(/sp[¹²³]/gu, (hibridizacao) => `sp${{ "sp¹": "1", "sp²": "2", "sp³": "3" }[hibridizacao]}`)
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[-\u2010-\u2015]/gu, " ")
    .replace(/[º°]/gu, "")
    .replace(/\s+/gu, " ")
    .trim()
    .replace(/[.,;]+$/gu, "")
    .trim()
    .replace(/^-?\d+,\d+$/u, (numero) => numero.replace(",", "."));
}
