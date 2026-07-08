// Gera os ícones do PWA a partir do glifo de livro da marca (Brand.tsx):
// livro branco sobre o azul-ardósia do tema. Rode com `npm run gen:icons`.
// Saída commitada em public/icons/ — não precisa rodar em CI/Docker.
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ACCENT = "#43607f";
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "icons");

/** SVG do ícone: fundo accent + glifo (24x24) centralizado ocupando `frac` do canvas. */
function svgIcon(size, frac) {
  const alvo = size * frac;
  const escala = alvo / 24;
  const off = (size - alvo) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${ACCENT}"/>
  <g transform="translate(${off} ${off}) scale(${escala})" fill="none" stroke="#ffffff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
    <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5z"/>
    <path d="M13 4h5.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H13z"/>
  </g>
</svg>`;
}

async function gerar(nome, size, frac) {
  await sharp(Buffer.from(svgIcon(size, frac))).png().toFile(join(OUT, nome));
  console.log("gerado:", nome);
}

await mkdir(OUT, { recursive: true });
await gerar("icon-192.png", 192, 0.58);
await gerar("icon-512.png", 512, 0.58);
// Maskable: glifo dentro da safe zone (~80%), fundo sangrando até a borda.
await gerar("icon-maskable-512.png", 512, 0.45);
await gerar("apple-touch-icon.png", 180, 0.58);
