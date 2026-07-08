import { test, expect } from "@playwright/test";

test("expõe o manifest com a identidade do app", async ({ page, request }) => {
  await page.goto("/login");
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute(
    "href",
    /manifest\.webmanifest/,
  );

  const res = await request.get("/manifest.webmanifest");
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(json.name).toBe("Biblioteca IECG");
  expect(json.display).toBe("standalone");
  expect((json.icons ?? []).length).toBeGreaterThanOrEqual(2);
});

test("a rota /offline mostra a mensagem de offline", async ({ page }) => {
  await page.goto("/offline");
  await expect(page.getByText(/você está offline/i)).toBeVisible();
});

test("service worker registra e serve o fallback offline", async ({ page, context }) => {
  await page.goto("/login");
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => true));
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller, null, {
    timeout: 15000,
  });

  await context.setOffline(true);
  await page.goto("/livros");
  await expect(page.getByText(/você está offline/i)).toBeVisible();
  await context.setOffline(false);
});
