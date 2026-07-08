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

test("atendente não vê catálogo nem acessa /generos", async ({ page }) => {
  await login(page, "atendente@gmail.com");
  await expect(page.getByRole("link", { name: "Gêneros" })).toHaveCount(0);

  await page.goto("/generos");
  await expect(page).toHaveURL((url) => new URL(url).pathname === "/");
});
