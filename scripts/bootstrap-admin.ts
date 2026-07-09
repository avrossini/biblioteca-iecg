/**
 * Bootstrap do primeiro administrador em produção (Fase 9). Idempotente.
 * Cria (ou atualiza a senha de) um usuário no Supabase Auth e o vincula ao grupo Administrador,
 * resolvendo o ovo-e-galinha (o seed.sql de dev não roda em produção).
 *
 * Uso:
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... \
 *   NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co SUPABASE_SERVICE_ROLE_KEY=... \
 *   npm run bootstrap:admin
 */
import { createClient } from "@supabase/supabase-js";

async function main(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!url || !key || !email || !password) {
    console.error(
      "Defina NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL e ADMIN_PASSWORD.",
    );
    process.exit(2);
    return;
  }

  const admin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1) cria o usuário (email já confirmado) ou, se existir, atualiza a senha.
  let userId: string | undefined;
  const criado = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (criado.error) {
    const lista = await admin.auth.admin.listUsers();
    if (lista.error) throw lista.error;
    const existente = lista.data.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase(),
    );
    if (!existente) throw criado.error;
    userId = existente.id;
    const upd = await admin.auth.admin.updateUserById(userId, { password, email_confirm: true });
    if (upd.error) throw upd.error;
    console.log(`Usuário já existia; senha atualizada: ${email}`);
  } else {
    userId = criado.data.user?.id;
    console.log(`Usuário criado: ${email}`);
  }
  if (!userId) throw new Error("Não foi possível obter o id do usuário.");

  // 2) resolve o grupo Administrador (vem do seed de produção seed_acl).
  const grp = await admin.from("grupos").select("id").eq("nome", "Administrador").single();
  if (grp.error) throw grp.error;
  if (!grp.data) throw new Error("Grupo Administrador não encontrado (rode as migrations).");

  // 3) vincula ao grupo (idempotente).
  const vinc = await admin
    .from("usuario_grupo")
    .upsert(
      { user_id: userId, grupo_id: grp.data.id },
      { onConflict: "user_id,grupo_id", ignoreDuplicates: true },
    );
  if (vinc.error) throw vinc.error;

  console.log(`Admin ${email} vinculado ao grupo Administrador. Pronto para logar.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
