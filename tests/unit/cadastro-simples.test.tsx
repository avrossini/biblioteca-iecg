import { describe, it, expect, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: () => {} }),
}));

import { render, screen } from "@testing-library/react";
import { CadastroSimples } from "@/components/crud/CadastroSimples";

const noop = async () => ({});

describe("<CadastroSimples />", () => {
  it("renderiza título, botão de novo e as linhas", () => {
    render(
      <CadastroSimples
        titulo="Gêneros"
        singular="gênero"
        campos={[{ nome: "nome", label: "Nome" }]}
        itens={[{ id: 1, nome: "Romance" }]}
        podeCriar
        podeEditar
        podeExcluir
        onCriar={noop}
        onSalvar={noop}
        onExcluir={noop}
      />,
    );
    expect(screen.getByText("Gêneros")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Novo gênero/ })).toBeInTheDocument();
    expect(screen.getByText("Romance")).toBeInTheDocument();
  });

  it("esconde ações quando não há permissão", () => {
    render(
      <CadastroSimples
        titulo="Gêneros"
        singular="gênero"
        campos={[{ nome: "nome", label: "Nome" }]}
        itens={[{ id: 1, nome: "Romance" }]}
        podeCriar={false}
        podeEditar={false}
        podeExcluir={false}
        onCriar={noop}
        onSalvar={noop}
        onExcluir={noop}
      />,
    );
    expect(screen.queryByRole("button", { name: /Novo gênero/ })).toBeNull();
    expect(screen.queryByRole("button", { name: "Editar" })).toBeNull();
  });
});
