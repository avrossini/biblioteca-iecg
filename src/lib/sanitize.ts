import sanitizeHtml from "sanitize-html";

/** Sanitiza o HTML do resumo (rich text) antes de exibir. */
export function sanitizarResumo(html: string | null | undefined): string {
  if (!html) return "";
  return sanitizeHtml(html, {
    allowedTags: [
      "p", "br", "strong", "b", "em", "i", "u", "s",
      "h1", "h2", "h3", "ul", "ol", "li", "blockquote", "code", "pre", "a",
    ],
    allowedAttributes: { a: ["href", "target", "rel"] },
    allowedSchemes: ["http", "https", "mailto"],
  });
}
