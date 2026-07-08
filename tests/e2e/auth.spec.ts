import { test, expect, type APIRequestContext } from "@playwright/test";

const ADMIN_EMAIL = "rossini@gmail.com";
const SENHA_ORIGINAL = "biblioteca123";
const MAILPIT = "http://127.0.0.1:54324";

// Executa em série: alguns testes dependem do estado da sessão/senha.
test.describe.configure({ mode: "serial" });

test("rota protegida sem sessão redireciona para /login", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login/);
});

test("login com admin cai no dashboard; logout volta ao login", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(ADMIN_EMAIL);
  await page.getByLabel("Senha").fill(SENHA_ORIGINAL);
  await page.getByRole("button", { name: "Entrar" }).click();

  await expect(page.getByRole("heading", { name: "Painel" })).toBeVisible();

  await page.getByRole("button", { name: "Sair" }).click();
  await expect(page).toHaveURL(/\/login/);
});

test("senha errada exibe mensagem de erro", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(ADMIN_EMAIL);
  await page.getByLabel("Senha").fill("senha-errada");
  await page.getByRole("button", { name: "Entrar" }).click();

  await expect(page.getByText(/inválidos/i)).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});

test("recuperação de senha completa via Mailpit", async ({ page, request }) => {
  const NOVA = "nova-senha-teste-123";

  await request.delete(`${MAILPIT}/api/v1/messages`);

  await page.goto("/esqueci-senha");
  await page.getByLabel("E-mail").fill(ADMIN_EMAIL);
  await page.getByRole("button", { name: /Enviar link/ }).click();
  await expect(page.getByRole("status")).toBeVisible();

  const link = await obterLinkRecuperacao(request);
  expect(link).toContain("/auth/confirm");

  await page.goto(link);
  await expect(page).toHaveURL(/\/redefinir-senha/);
  await page.getByLabel("Nova senha", { exact: true }).fill(NOVA);
  await page.getByLabel("Confirmar nova senha").fill(NOVA);
  await page.getByRole("button", { name: /Salvar/ }).click();
  await expect(page.getByRole("heading", { name: "Painel" })).toBeVisible();

  // Confirma que a nova senha funciona
  await page.getByRole("button", { name: "Sair" }).click();
  await page.waitForURL(/\/login/);
  await page.getByLabel("E-mail").fill(ADMIN_EMAIL);
  await page.getByLabel("Senha").fill(NOVA);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByRole("heading", { name: "Painel" })).toBeVisible();

  // Restaura a senha original (usuário logado pode redefinir)
  await page.goto("/redefinir-senha");
  await page.getByLabel("Nova senha", { exact: true }).fill(SENHA_ORIGINAL);
  await page.getByLabel("Confirmar nova senha").fill(SENHA_ORIGINAL);
  await page.getByRole("button", { name: /Salvar/ }).click();
  await expect(page.getByRole("heading", { name: "Painel" })).toBeVisible();
});

async function obterLinkRecuperacao(request: APIRequestContext): Promise<string> {
  for (let i = 0; i < 30; i++) {
    const res = await request.get(`${MAILPIT}/api/v1/messages`);
    const data = await res.json();
    if (data.messages && data.messages.length > 0) {
      const id = data.messages[0].ID;
      const msg = await (
        await request.get(`${MAILPIT}/api/v1/message/${id}`)
      ).json();
      const corpo: string = msg.HTML || msg.Text || "";
      const m = corpo.match(/https?:\/\/[^\s"'<>]*\/auth\/confirm[^\s"'<>]*/);
      if (m) return m[0].replace(/&amp;/g, "&");
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("E-mail de recuperação não encontrado no Mailpit");
}
