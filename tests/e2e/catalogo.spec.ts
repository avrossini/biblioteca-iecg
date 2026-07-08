import { test, expect, type Page } from "@playwright/test";

test.describe.configure({ mode: "serial" });

async function login(page: Page, email: string, senha = "biblioteca123") {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill(senha);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL((url) => new URL(url).pathname === "/");
}

test("admin cria gênero e autor", async ({ page }) => {
  const nomeGenero = `Gênero ${Date.now()}`;
  const nomeAutor = `Autor ${Date.now()}`;

  await login(page, "rossini@gmail.com");

  await page.goto("/generos");
  await page.getByRole("button", { name: /Novo gênero/ }).click();
  await page.getByLabel("Nome").fill(nomeGenero);
  await page.getByRole("button", { name: "Criar" }).click();
  await expect(page.getByRole("cell", { name: nomeGenero })).toBeVisible();

  await page.goto("/autores");
  await page.getByRole("button", { name: /Novo autor/ }).click();
  await page.getByLabel("Nome").fill(nomeAutor);
  await page.getByRole("button", { name: "Criar" }).click();
  await expect(page.getByRole("cell", { name: nomeAutor })).toBeVisible();
});

test("admin cria um livro completo", async ({ page }) => {
  const titulo = `Livro ${Date.now()}`;
  await login(page, "rossini@gmail.com");

  await page.goto("/livros/novo");
  await page.getByLabel("Título").fill(titulo);
  await page.getByLabel("Código do livro").fill(`COD-${Date.now()}`);
  await page.getByLabel("Gênero").selectOption({ index: 1 });
  await page.locator('input[type="checkbox"]').first().check();
  await page.getByLabel("Novo tema").fill("Aventura");
  await page.getByRole("button", { name: "Adicionar" }).click();
  await page.locator(".conteudo-rico").click();
  await page.keyboard.type("Um ótimo livro de teste.");
  await page.getByRole("button", { name: "Salvar" }).click();

  await expect(page.getByRole("heading", { name: titulo })).toBeVisible();
  await expect(page.getByText("Um ótimo livro de teste.")).toBeVisible();
});

test("atendente vê livros mas não cria; sem catálogo de cadastros", async ({ page }) => {
  await login(page, "atendente@gmail.com");

  await page.goto("/livros");
  await expect(page.getByRole("heading", { name: "Livros" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Novo livro" })).toHaveCount(0);

  await expect(page.getByRole("link", { name: "Gêneros" })).toHaveCount(0);
  await page.goto("/generos");
  await expect(page).toHaveURL((url) => new URL(url).pathname === "/");
});
