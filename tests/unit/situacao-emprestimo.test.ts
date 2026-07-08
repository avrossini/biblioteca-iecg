import { describe, it, expect } from "vitest";
import { situacaoEmprestimo } from "@/lib/emprestimo";

const hoje = new Date("2026-07-08T00:00:00Z");

describe("situacaoEmprestimo", () => {
  it("marca devolvido", () => {
    expect(situacaoEmprestimo("2026-07-01", "2026-07-05", hoje)).toEqual({
      label: "Devolvido",
      tom: "neutro",
    });
  });

  it("marca atrasado", () => {
    const s = situacaoEmprestimo("2026-07-01", null, hoje);
    expect(s.tom).toBe("danger");
    expect(s.label).toMatch(/Atrasado/);
  });

  it("marca vence hoje", () => {
    expect(situacaoEmprestimo("2026-07-08", null, hoje).tom).toBe("warn");
  });

  it("marca no prazo", () => {
    expect(situacaoEmprestimo("2026-07-20", null, hoje).tom).toBe("ok");
  });
});
