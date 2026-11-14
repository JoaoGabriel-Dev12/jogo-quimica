function icone(conteudo, { preenchido = false } = {}) {
  const atributos = preenchido
    ? 'fill="currentColor" stroke="none"'
    : 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
  return `<svg class="icon" viewBox="0 0 24 24" ${atributos} aria-hidden="true" focusable="false">${conteudo}</svg>`;
}

export const icons = Object.freeze({
  flask: icone(`
    <path d="M9 3h6" />
    <path d="M10 3v5.4L5.3 17a2.4 2.4 0 0 0 2.1 3.5h9.2a2.4 2.4 0 0 0 2.1-3.5L14 8.4V3" />
    <path d="M7.5 14h9" />
  `),
  bolt: icone(`
    <path d="M13 2 4.5 13.5H11l-1 8.5L19.5 10H13V2Z" />
  `),
  heart: icone(`
    <path d="M12 20.6S4.8 16.2 3 11.9A5.1 5.1 0 0 1 12 6.4a5.1 5.1 0 0 1 9 5.5c-1.8 4.3-9 8.7-9 8.7Z" />
  `, { preenchido: true }),
  atom: icone(`
    <circle cx="12" cy="12" r="2.1" fill="currentColor" stroke="none" />
    <ellipse cx="12" cy="12" rx="9.2" ry="3.8" />
    <ellipse cx="12" cy="12" rx="9.2" ry="3.8" transform="rotate(60 12 12)" />
    <ellipse cx="12" cy="12" rx="9.2" ry="3.8" transform="rotate(120 12 12)" />
  `),
  arrowRight: icone(`
    <path d="M4.5 12h15" />
    <path d="m13.5 6 6 6-6 6" />
  `),
  arrowLeft: icone(`
    <path d="M19.5 12h-15" />
    <path d="m10.5 6-6 6 6 6" />
  `),
});
