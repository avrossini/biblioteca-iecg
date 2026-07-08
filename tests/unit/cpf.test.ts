import { describe, it, expect } from "vitest";
import { validarCpf, apenasDigitos } from "@/lib/cpf";

describe("validarCpf", () => {
  it("aceita CPF válido com máscara", () => {
    expect(validarCpf("529.982.247-25")).toBe(true);
  });
  it("aceita CPF válido sem máscara", () => {
    expect(validarCpf("52998224725")).toBe(true);
  });
  it("rejeita dígito verificador errado", () => {
    expect(validarCpf("529.982.247-24")).toBe(false);
  });
  it("rejeita sequência repetida", () => {
    expect(validarCpf("111.111.111-11")).toBe(false);
  });
  it("rejeita tamanho errado", () => {
    expect(validarCpf("123")).toBe(false);
  });
});

describe("apenasDigitos", () => {
  it("remove a máscara", () => {
    expect(apenasDigitos("529.982.247-25")).toBe("52998224725");
  });
});
