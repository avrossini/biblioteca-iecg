import { test, expect, type Page } from "@playwright/test";

test.describe.configure({ mode: "serial" });

async function login(page: Page, email: string, senha = "biblioteca123") {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill(senha);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL((url) => new URL(url).pathname === "/");
}

test("admin cria um leitor", async ({ page }) => {
  const nome = `Leitor ${Date.now()}`;
  await login(page, "rossini@gmail.com");

  await page.goto("/leitores");
  await page.getByRole("button", { name: /Novo leitor/ }).click();
  await page.getByLabel("Nome").fill(nome);
  await page.getByLabel("E-mail").fill(`${Date.now()}@teste.com`);
  await page.getByRole("button", { name: "Criar" }).click();

  await expect(page.getByRole("cell", { name: nome })).toBeVisible();
});

test("CPF inválido é barrado", async ({ page }) => {
  await login(page, "rossini@gmail.com");

  await page.goto("/leitores");
  await page.getByRole("button", { name: /Novo leitor/ }).click();
  await page.getByLabel("Nome").fill(`Leitor ${Date.now()}`);
  await page.getByLabel("CPF").fill("111.111.111-11");
  await page.getByRole("button", { name: "Criar" }).click();

  await expect(page.getByText("CPF inválido")).toBeVisible();
});
