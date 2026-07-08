import { describe, it, expect } from "vitest";
import manifest from "@/app/manifest";

describe("manifest do PWA", () => {
  const m = manifest();

  it("identifica o app", () => {
    expect(m.name).toBe("Biblioteca IECG");
    expect(m.short_name).toBeTruthy();
  });

  it("abre em janela própria a partir da raiz", () => {
    expect(m.display).toBe("standalone");
    expect(m.start_url).toBe("/");
    expect(m.scope).toBe("/");
  });

  it("usa as cores da marca", () => {
    expect(m.theme_color).toBe("#43607f");
    expect(m.background_color).toBe("#f7f7f4");
  });

  it("traz ícones 192 e 512, incluindo um maskable", () => {
    const icones = m.icons ?? [];
    const tamanhos = icones.map((i) => i.sizes);
    expect(tamanhos).toContain("192x192");
    expect(tamanhos).toContain("512x512");
    expect(icones.some((i) => i.purpose === "maskable")).toBe(true);
  });
});
