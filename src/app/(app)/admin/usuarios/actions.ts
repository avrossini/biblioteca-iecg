"use server";

import { revalidatePath } from "next/cache";
import { getPermissoes } from "@/lib/permissoes";
import { createAdminClient } from "@/lib/supabase/admin";

async function exigir(codigo: string) {
  const permissoes = await getPermissoes();
  if (!permissoes.includes(codigo)) {
    throw new Error("Sem permissão para esta ação.");
  }
}

export async function convidarUsuario(email: string, grupoIds: number[]) {
  await exigir("usuario.create");
  const admin = createAdminClient();

  const { data, error } = await admin.auth.admin.inviteUserByEmail(email);
  if (error) throw new Error(error.message);

  const userId = data.user?.id;
  if (userId && grupoIds.length) {
    const { error: e2 } = await admin
      .from("usuario_grupo")
      .insert(grupoIds.map((grupo_id) => ({ user_id: userId, grupo_id })));
    if (e2) throw new Error(e2.message);
  }
  revalidatePath("/admin/usuarios");
}

export async function salvarGruposUsuario(userId: string, grupoIds: number[]) {
  await exigir("usuario.update");
  const admin = createAdminClient();

  await admin.from("usuario_grupo").delete().eq("user_id", userId);
  if (grupoIds.length) {
    const { error } = await admin
      .from("usuario_grupo")
      .insert(grupoIds.map((grupo_id) => ({ user_id: userId, grupo_id })));
    if (error) throw new Error(error.message);
  }
  revalidatePath("/admin/usuarios");
}

export async function alternarAtivo(userId: string, ativar: boolean) {
  await exigir("usuario.update");
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: ativar ? "none" : "876000h",
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/usuarios");
}
