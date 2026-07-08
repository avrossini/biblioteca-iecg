import { describe, it, expect } from "vitest";
import {
  calcularDataPrevista,
  diasEmAtraso,
  PRAZO_PADRAO_DIAS,
} from "@/lib/emprestimo";

describe("cálculo de devolução", () => {
  it("usa o prazo padrão de 14 dias", () => {
    expect(PRAZO_PADRAO_DIAS).toBe(14);
    const prevista = calcularDataPrevista(new Date("2026-07-08"));
    expect(prevista.toISOString().slice(0, 10)).toBe("2026-07-22");
  });

  it("aceita prazo customizado", () => {
    const prevista = calcularDataPrevista(new Date("2026-07-08"), 7);
    expect(prevista.toISOString().slice(0, 10)).toBe("2026-07-15");
  });

  it("não acusa atraso dentro do prazo", () => {
    expect(diasEmAtraso(new Date("2026-07-22"), new Date("2026-07-20"))).toBe(0);
  });

  it("conta os dias de atraso após o prazo", () => {
    expect(diasEmAtraso(new Date("2026-07-22"), new Date("2026-07-25"))).toBe(3);
  });
});
