// Cor de "lombada" determinística por gênero (cicla a paleta de gênero do tema).
const VARS = [
  "--color-romance",
  "--color-historia",
  "--color-ciencia",
  "--color-infantil",
  "--color-poesia",
];

export function corGenero(generoId: number | null | undefined): string {
  if (generoId == null) return "var(--color-muted)";
  return `var(${VARS[Math.abs(generoId) % VARS.length]})`;
}
