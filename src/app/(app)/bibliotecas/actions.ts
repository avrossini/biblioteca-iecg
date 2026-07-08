"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getPermissoes } from "@/lib/permissoes";
import { traduzErroDb, type Resultado } from "@/lib/erros-db";

async function pode(codigo: string) {
  return (await getPermissoes()).includes(codigo);
}

export async function criar(valores: Record<string, string>): Promise<Resultado> {
  if (!(await pode("biblioteca.create"))) return { erro: "Sem permissão." };
  const supabase = await createClient();
  const { error } = await supabase.from("bibliotecas").insert({ nome: valores.nome.trim() });
  if (error) return { erro: traduzErroDb(error) };
  revalidatePath("/bibliotecas");
  return {};
}

export async function salvar(id: number, valores: Record<string, string>): Promise<Resultado> {
  if (!(await pode("biblioteca.update"))) return { erro: "Sem permissão." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("bibliotecas")
    .update({ nome: valores.nome.trim() })
    .eq("id", id);
  if (error) return { erro: traduzErroDb(error) };
  revalidatePath("/bibliotecas");
  return {};
}

export async function excluir(id: number): Promise<Resultado> {
  if (!(await pode("biblioteca.destroy"))) return { erro: "Sem permissão." };
  const supabase = await createClient();
  const { error } = await supabase.from("bibliotecas").delete().eq("id", id);
  if (error) return { erro: traduzErroDb(error) };
  revalidatePath("/bibliotecas");
  return {};
}
