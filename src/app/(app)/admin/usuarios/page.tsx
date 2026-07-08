import { requirePermissao } from "@/lib/permissoes";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { UsuariosClient } from "./UsuariosClient";

export default async function UsuariosPage() {
  await requirePermissao("usuario.index");

  const admin = createAdminClient();
  const supabase = await createClient();

  const [{ data: lista }, { data: grupos }, { data: vinculos }] =
    await Promise.all([
      admin.auth.admin.listUsers(),
      supabase.from("grupos").select("id, nome").order("nome"),
      supabase.from("usuario_grupo").select("user_id, grupo_id"),
    ]);

  const gruposPorUsuario = new Map<string, number[]>();
  for (const v of vinculos ?? []) {
    if (!gruposPorUsuario.has(v.user_id)) gruposPorUsuario.set(v.user_id, []);
    gruposPorUsuario.get(v.user_id)!.push(v.grupo_id);
  }

  const usuarios = (lista?.users ?? []).map((u) => ({
    id: u.id,
    email: u.email ?? "",
    ativo: !(u as { banned_until?: string | null }).banned_until,
    ultimoAcesso: u.last_sign_in_at ?? null,
    grupos: gruposPorUsuario.get(u.id) ?? [],
  }));

  return (
    <div className="p-4 md:p-6">
      <h1 className="mb-4 font-serif text-2xl font-semibold">Usuários</h1>
      <UsuariosClient usuarios={usuarios} grupos={grupos ?? []} />
    </div>
  );
}
