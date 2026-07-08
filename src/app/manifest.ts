import type { MetadataRoute } from "next";

/**
 * Web App Manifest (servido em /manifest.webmanifest).
 * Torna a Biblioteca IECG instalável (standalone) com a identidade visual do projeto.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Biblioteca IECG",
    short_name: "Biblioteca",
    description:
      "Sistema de gestão de biblioteca — catálogo, acervo e circulação.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    lang: "pt-BR",
    dir: "ltr",
    background_color: "#f7f7f4",
    theme_color: "#43607f",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
