import { describe, it, expect } from "vitest";
import { corGenero } from "@/lib/cores-genero";

describe("corGenero", () => {
  it("é determinística", () => {
    expect(corGenero(3)).toBe(corGenero(3));
  });

  it("cicla a paleta (5 cores)", () => {
    expect(corGenero(0)).toBe(corGenero(5));
  });

  it("usa neutro quando sem gênero", () => {
    expect(corGenero(null)).toContain("muted");
  });
});
