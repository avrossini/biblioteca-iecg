"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getPermissoes } from "@/lib/permissoes";

async function exigir(codigo: string) {
  const permissoes = await getPermissoes();
  if (!permissoes.includes(codigo)) {
    throw new Error("Sem permissão para esta ação.");
  }
}

export async function criarGrupo(nome: string, descricao: string) {
  await exigir("grupo.create");
  const supabase = await createClient();
  const { error } = await supabase
    .from("grupos")
    .insert({ nome, descricao: descricao || null });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/grupos");
}

export async function excluirGrupo(id: number) {
  await exigir("grupo.destroy");
  const supabase = await createClient();
  const { error } = await supabase.from("grupos").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/grupos");
}

export async function salvarPermissoes(
  grupoId: number,
  funcionalidadeIds: number[],
) {
  await exigir("grupo.permissoes");
  const supabase = await createClient();

  const { data: atuais } = await supabase
    .from("grupo_funcionalidade")
    .select("funcionalidade_id")
    .eq("grupo_id", grupoId);

  const atuaisSet = new Set((atuais ?? []).map((r) => r.funcionalidade_id));
  const novaSet = new Set(funcionalidadeIds);
  const adicionar = funcionalidadeIds.filter((id) => !atuaisSet.has(id));
  const remover = [...atuaisSet].filter((id) => !novaSet.has(id));

  if (adicionar.length) {
    const { error } = await supabase.from("grupo_funcionalidade").insert(
      adicionar.map((funcionalidade_id) => ({
        grupo_id: grupoId,
        funcionalidade_id,
      })),
    );
    if (error) throw new Error(error.message);
  }
  if (remover.length) {
    const { error } = await supabase
      .from("grupo_funcionalidade")
      .delete()
      .eq("grupo_id", grupoId)
      .in("funcionalidade_id", remover);
    if (error) throw new Error(error.message);
  }
  revalidatePath("/admin/grupos");
}
