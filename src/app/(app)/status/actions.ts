"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getPermissoes } from "@/lib/permissoes";
import { traduzErroDb, type Resultado } from "@/lib/erros-db";

const NUCLEO = ["disponivel", "emprestado"];

async function pode(codigo: string) {
  return (await getPermissoes()).includes(codigo);
}

export async function criar(valores: Record<string, string>): Promise<Resultado> {
  if (!(await pode("status.create"))) return { erro: "Sem permissão." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("status")
    .insert({ codigo: valores.codigo.trim(), nome: valores.nome.trim() });
  if (error) return { erro: traduzErroDb(error) };
  revalidatePath("/status");
  return {};
}

export async function salvar(id: number, valores: Record<string, string>): Promise<Resultado> {
  if (!(await pode("status.update"))) return { erro: "Sem permissão." };
  const supabase = await createClient();
  // O código é imutável na edição; apenas o rótulo muda.
  const { error } = await supabase.from("status").update({ nome: valores.nome.trim() }).eq("id", id);
  if (error) return { erro: traduzErroDb(error) };
  revalidatePath("/status");
  return {};
}

export async function excluir(id: number): Promise<Resultado> {
  if (!(await pode("status.destroy"))) return { erro: "Sem permissão." };
  const supabase = await createClient();
  const { data: s } = await supabase.from("status").select("codigo").eq("id", id).single();
  if (s && NUCLEO.includes(s.codigo)) {
    return { erro: "Este status é essencial para a circulação e não pode ser excluído." };
  }
  const { error } = await supabase.from("status").delete().eq("id", id);
  if (error) return { erro: traduzErroDb(error) };
  revalidatePath("/status");
  return {};
}
