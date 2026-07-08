import { test, expect } from "@playwright/test";

test("a página inicial exibe a marca Biblioteca IECG", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Biblioteca IECG").first()).toBeVisible();
});
