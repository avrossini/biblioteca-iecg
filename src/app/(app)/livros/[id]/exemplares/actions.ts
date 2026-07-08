"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getPermissoes } from "@/lib/permissoes";
import { traduzErroDb, type Resultado } from "@/lib/erros-db";

export type DadosExemplar = {
  biblioteca_id: number;
  status_id: number;
  numero_tombo: string;
  data_aquisicao: string;
};

async function pode(codigo: string) {
  return (await getPermissoes()).includes(codigo);
}

export async function criarExemplar(
  livroId: number,
  dados: DadosExemplar,
): Promise<Resultado> {
  if (!(await pode("exemplar.create"))) return { erro: "Sem permissão." };
  const supabase = await createClient();
  const { error } = await supabase.from("exemplares").insert({
    livro_id: livroId,
    biblioteca_id: dados.biblioteca_id,
    status_id: dados.status_id,
    numero_tombo: dados.numero_tombo.trim() || null,
    data_aquisicao: dados.data_aquisicao || null,
  });
  if (error) return { erro: traduzErroDb(error) };
  revalidatePath(`/livros/${livroId}`);
  return {};
}

export async function atualizarExemplar(
  id: number,
  livroId: number,
  dados: DadosExemplar,
): Promise<Resultado> {
  if (!(await pode("exemplar.update"))) return { erro: "Sem permissão." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("exemplares")
    .update({
      biblioteca_id: dados.biblioteca_id,
      status_id: dados.status_id,
      numero_tombo: dados.numero_tombo.trim() || null,
      data_aquisicao: dados.data_aquisicao || null,
    })
    .eq("id", id);
  if (error) return { erro: traduzErroDb(error) };
  revalidatePath(`/livros/${livroId}`);
  return {};
}

export async function excluirExemplar(id: number, livroId: number): Promise<Resultado> {
  if (!(await pode("exemplar.destroy"))) return { erro: "Sem permissão." };
  const supabase = await createClient();
  const { error } = await supabase.from("exemplares").delete().eq("id", id);
  if (error) return { erro: traduzErroDb(error) };
  revalidatePath(`/livros/${livroId}`);
  return {};
}
