"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getPermissoes } from "@/lib/permissoes";
import { traduzErroDb, type Resultado } from "@/lib/erros-db";

async function pode(codigo: string) {
  return (await getPermissoes()).includes(codigo);
}

export async function criar(valores: Record<string, string>): Promise<Resultado> {
  if (!(await pode("autor.create"))) return { erro: "Sem permissão." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("autores")
    .insert({ nome: valores.nome.trim(), biografia: valores.biografia?.trim() || null });
  if (error) return { erro: traduzErroDb(error) };
  revalidatePath("/autores");
  return {};
}

export async function salvar(id: number, valores: Record<string, string>): Promise<Resultado> {
  if (!(await pode("autor.update"))) return { erro: "Sem permissão." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("autores")
    .update({ nome: valores.nome.trim(), biografia: valores.biografia?.trim() || null })
    .eq("id", id);
  if (error) return { erro: traduzErroDb(error) };
  revalidatePath("/autores");
  return {};
}

export async function excluir(id: number): Promise<Resultado> {
  if (!(await pode("autor.destroy"))) return { erro: "Sem permissão." };
  const supabase = await createClient();
  const { error } = await supabase.from("autores").delete().eq("id", id);
  if (error) return { erro: traduzErroDb(error) };
  revalidatePath("/autores");
  return {};
}
