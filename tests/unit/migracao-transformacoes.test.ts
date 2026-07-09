import { describe, it, expect } from "vitest";
import {
  codigoStatus,
  cpfParaBanco,
  emailParaBanco,
  telefoneParaBanco,
  codigoLivroParaTexto,
  htmlParaBanco,
  temaLimpo,
  previstaHistorica,
  aplicarUnicidadePessoas,
  filtrarLivroAutor,
  filtrarTemas,
} from "../../scripts/migracao/transformacoes";

describe("codigoStatus", () => {
  it("mapeia os ids do legado", () => {
    expect(codigoStatus(1)).toBe("disponivel");
    expect(codigoStatus(2)).toBe("emprestado");
    expect(codigoStatus(3)).toBe("extraviado");
    expect(codigoStatus(5)).toBe("vencido");
  });
  it("lança em id desconhecido", () => {
    expect(() => codigoStatus(99)).toThrow();
  });
});

describe("cpfParaBanco", () => {
  it("mantém CPF válido só com dígitos", () => {
    // 529.982.247-25 é um CPF com dígitos verificadores válidos.
    expect(cpfParaBanco("529.982.247-25")).toBe("52998224725");
  });
  it("descarta lixo e dígito verificador inválido", () => {
    expect(cpfParaBanco("0000000")).toBeNull();
    expect(cpfParaBanco("000000000000")).toBeNull();
    expect(cpfParaBanco("12345679800")).toBeNull(); // 11 dígitos, mas inválido
    expect(cpfParaBanco("11111111111")).toBeNull(); // sequência repetida
    expect(cpfParaBanco(null)).toBeNull();
    expect(cpfParaBanco("")).toBeNull();
  });
});

describe("emailParaBanco / telefoneParaBanco", () => {
  it("normaliza e-mail e trata vazio", () => {
    expect(emailParaBanco("  Foo@Bar.COM ")).toBe("foo@bar.com");
    expect(emailParaBanco("")).toBeNull();
    expect(emailParaBanco(null)).toBeNull();
  });
  it("telefone só dígitos; vazio → null", () => {
    expect(telefoneParaBanco("(11) 98175-2479")).toBe("11981752479");
    expect(telefoneParaBanco("")).toBeNull();
  });
});

describe("codigoLivroParaTexto", () => {
  it("converte bigint para texto", () => {
    expect(codigoLivroParaTexto(1330)).toBe("1330");
    expect(codigoLivroParaTexto("  ")).toBeNull();
    expect(codigoLivroParaTexto(null)).toBeNull();
  });
});

describe("htmlParaBanco", () => {
  it("mantém HTML com conteúdo", () => {
    expect(htmlParaBanco("<p>Olá</p>")).toBe("<p>Olá</p>");
  });
  it("vazio / só-tags → null", () => {
    expect(htmlParaBanco("")).toBeNull();
    expect(htmlParaBanco("<p><br></p>")).toBeNull();
    expect(htmlParaBanco("&nbsp; ")).toBeNull();
    expect(htmlParaBanco(null)).toBeNull();
  });
});

describe("temaLimpo", () => {
  it("trim; vazio → null", () => {
    expect(temaLimpo(" medo")).toBe("medo");
    expect(temaLimpo("   ")).toBeNull();
    expect(temaLimpo("")).toBeNull();
  });
});

describe("previstaHistorica", () => {
  it("data_emprestimo + 14 dias", () => {
    expect(previstaHistorica("2025-06-11")).toBe("2025-06-25");
  });
});

describe("aplicarUnicidadePessoas", () => {
  it("menor id mantém cpf/email; duplicados viram null; ninguém some", () => {
    const entrada = [
      { id: 7, nome: "Vanessa", cpf: "29804158809", email: "a@x.com", telefone: null },
      { id: 2, nome: "André", cpf: "29804158809", email: "b@x.com", telefone: null },
      { id: 6, nome: "Reb6", cpf: null, email: "sirlei@iecg.com", telefone: null },
      { id: 5, nome: "Reb5", cpf: null, email: "sirlei@iecg.com", telefone: null },
    ];
    const saida = aplicarUnicidadePessoas(entrada);
    expect(saida).toHaveLength(4);
    const por = Object.fromEntries(saida.map((p) => [p.id, p]));
    expect(por[2].cpf).toBe("29804158809"); // menor id mantém
    expect(por[7].cpf).toBeNull();
    expect(por[5].email).toBe("sirlei@iecg.com");
    expect(por[6].email).toBeNull();
  });
});

describe("filtrarLivroAutor", () => {
  it("remove órfãos e duplicatas", () => {
    const pares = [
      { livro_id: 1, autor_id: 10 },
      { livro_id: 1, autor_id: 10 }, // duplicata
      { livro_id: 1, autor_id: 999 }, // autor órfão
      { livro_id: 888, autor_id: 10 }, // livro órfão
      { livro_id: 2, autor_id: 10 },
    ];
    const out = filtrarLivroAutor(pares, new Set([1, 2]), new Set([10]));
    expect(out).toEqual([
      { livro_id: 1, autor_id: 10 },
      { livro_id: 2, autor_id: 10 },
    ]);
  });
});

describe("filtrarTemas", () => {
  it("trim, descarta vazios/órfãos e deduplica", () => {
    const temas = [
      { livro_id: 1, nome: " medo" },
      { livro_id: 1, nome: "medo" }, // duplicata após trim
      { livro_id: 1, nome: "  " }, // vazio
      { livro_id: 999, nome: "orfao" }, // órfão
      { livro_id: 2, nome: "fé" },
    ];
    const out = filtrarTemas(temas, new Set([1, 2]));
    expect(out).toEqual([
      { livro_id: 1, nome: "medo" },
      { livro_id: 2, nome: "fé" },
    ]);
  });
});
