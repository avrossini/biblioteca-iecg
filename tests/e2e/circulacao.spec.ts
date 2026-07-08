import { test, expect, type Page } from "@playwright/test";

test.describe.configure({ mode: "serial" });

async function login(page: Page, email: string, senha = "biblioteca123") {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill(senha);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL((url) => new URL(url).pathname === "/");
}

async function criarSimples(page: Page, rota: string, botao: RegExp, valor: string) {
  await page.goto(rota);
  await page.getByRole("button", { name: botao }).click();
  await page.getByLabel("Nome").fill(valor);
  await page.getByRole("button", { name: "Criar" }).click();
  await expect(page.getByRole("cell", { name: valor })).toBeVisible();
}

test("empresta e devolve (loop completo)", async ({ page }) => {
  const stamp = Date.now();
  const titulo = `Livro ${stamp}`;
  await login(page, "rossini@gmail.com");

  // Pré-requisitos
  await criarSimples(page, "/generos", /Novo gênero/, `Gen ${stamp}`);
  await criarSimples(page, "/bibliotecas", /Novo biblioteca/, `Bib ${stamp}`);
  await criarSimples(page, "/leitores", /Novo leitor/, `Leitor ${stamp}`);

  // Livro
  await page.goto("/livros/novo");
  await page.getByLabel("Título").fill(titulo);
  await page.getByLabel("Gênero").selectOption({ index: 1 });
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByRole("heading", { name: titulo })).toBeVisible();

  // Exemplar
  await page.getByRole("button", { name: "Novo exemplar" }).click();
  await page.getByRole("button", { name: "Adicionar" }).click();
  await expect(page.getByText("Disponível")).toBeVisible();

  // Empresta pelo exemplar
  await page.getByRole("button", { name: "Emprestar" }).click();
  await page.getByLabel("Leitor").selectOption({ index: 1 });
  await page.getByRole("button", { name: "Confirmar" }).click();
  await expect(page.getByText("Emprestado")).toBeVisible();

  // Aparece na lista de empréstimos
  await page.goto("/emprestimos");
  await expect(page.getByText(titulo)).toBeVisible();

  // Devolve pela lista → some do filtro "só abertos"
  await page.getByRole("button", { name: "Devolver" }).first().click();
  await expect(page.getByText(titulo)).toHaveCount(0);
});
