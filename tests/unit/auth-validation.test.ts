import { describe, it, expect } from "vitest";
import { validarNovaSenha } from "@/lib/auth-validation";

describe("validarNovaSenha", () => {
  it("rejeita senha curta", () => {
    expect(validarNovaSenha("1234", "1234")).toMatch(/8 caracteres/);
  });

  it("rejeita quando as senhas não coincidem", () => {
    expect(validarNovaSenha("senhaforte1", "outra")).toMatch(/não coincidem/);
  });

  it("aceita senha válida e confirmada", () => {
    expect(validarNovaSenha("senhaforte1", "senhaforte1")).toBeNull();
  });
});
