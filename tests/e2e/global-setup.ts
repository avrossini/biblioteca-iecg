// Garante estado determinístico antes da suíte E2E: reseta a senha do admin de
// desenvolvimento para o valor canônico (testes de recuperação alteram a senha).
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";
const ADMIN_ID = "00000000-0000-0000-0000-0000000000a1";

export default async function globalSetup() {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${ADMIN_ID}`, {
    method: "PUT",
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password: "biblioteca123" }),
  });
  if (!res.ok) {
    throw new Error(
      `global-setup: falha ao resetar senha do admin (HTTP ${res.status})`,
    );
  }
}
