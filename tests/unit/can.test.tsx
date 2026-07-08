import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PermissoesProvider } from "@/components/permissoes/PermissoesProvider";
import { Can } from "@/components/permissoes/Can";

function renderCom(permissoes: string[], code: string | string[]) {
  return render(
    <PermissoesProvider permissoes={permissoes}>
      <Can code={code}>
        <span>conteúdo</span>
      </Can>
    </PermissoesProvider>,
  );
}

describe("<Can />", () => {
  it("mostra os filhos quando o usuário tem a permissão", () => {
    renderCom(["livro.create"], "livro.create");
    expect(screen.getByText("conteúdo")).toBeInTheDocument();
  });

  it("esconde os filhos quando não tem a permissão", () => {
    renderCom(["livro.index"], "livro.create");
    expect(screen.queryByText("conteúdo")).toBeNull();
  });

  it("aceita lista de códigos (basta um)", () => {
    renderCom(["grupo.index"], ["usuario.index", "grupo.index"]);
    expect(screen.getByText("conteúdo")).toBeInTheDocument();
  });
});
