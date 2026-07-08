import { test, expect, type Page } from "@playwright/test";

async function login(page: Page, email: string, senha = "biblioteca123") {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill(senha);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL((url) => new URL(url).pathname === "/");
}

test("painel mostra os indicadores", async ({ page }) => {
  await login(page, "rossini@gmail.com");
  await expect(page.getByText("Livros no catálogo")).toBeVisible();
  await expect(page.getByText("Empréstimos em aberto").first()).toBeVisible();
});
