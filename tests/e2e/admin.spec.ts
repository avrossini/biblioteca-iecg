import { test, expect, type Page } from "@playwright/test";

test.describe.configure({ mode: "serial" });

async function login(page: Page, email: string, senha = "biblioteca123") {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill(senha);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL((url) => new URL(url).pathname === "/");
}

test("admin vê a seção Administração no menu", async ({ page }) => {
  await login(page, "rossini@gmail.com");
  await expect(page.getByText("Administração")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Grupos e permissões" }),
  ).toBeVisible();
});

test("admin altera a matriz de permissões e persiste", async ({ page }) => {
  await login(page, "rossini@gmail.com");
  await page.goto("/admin/grupos");
  await page.getByRole("button", { name: /Atendente/ }).click();

  const check = page.getByLabel("Cadastrar livro");
  await check.check();
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByRole("button", { name: "Salvar" })).toBeVisible();

  await page.reload();
  await page.getByRole("button", { name: /Atendente/ }).click();
  await expect(page.getByLabel("Cadastrar livro")).toBeChecked();

  // Restaura o estado (remove a permissão adicionada) para não contaminar outros testes.
  await page.getByLabel("Cadastrar livro").uncheck();
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByRole("button", { name: "Salvar" })).toBeVisible();
});

test("admin vê a lista de usuários", async ({ page }) => {
  await login(page, "rossini@gmail.com");
  await page.goto("/admin/usuarios");
  await expect(
    page.getByRole("cell", { name: "rossini@gmail.com" }),
  ).toBeVisible();
  await expect(
    page.getByRole("cell", { name: "atendente@gmail.com" }),
  ).toBeVisible();
});

test("usuário sem permissão não vê admin e é bloqueado na rota", async ({
  page,
}) => {
  await login(page, "atendente@gmail.com");
  await expect(page.getByText("Administração")).toHaveCount(0);

  await page.goto("/admin/grupos");
  await expect(page).toHaveURL((url) => new URL(url).pathname === "/");
});
