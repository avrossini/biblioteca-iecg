import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EsqueciSenhaForm } from "@/app/(auth)/esqueci-senha/EsqueciSenhaForm";

describe("<EsqueciSenhaForm />", () => {
  it("exibe o campo de e-mail e o botão de envio", () => {
    render(<EsqueciSenhaForm />);
    expect(screen.getByText("E-mail")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Enviar link de recuperação/ }),
    ).toBeInTheDocument();
  });
});
