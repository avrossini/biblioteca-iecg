"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getPermissoes } from "@/lib/permissoes";
import { traduzErroDb } from "@/lib/erros-db";
import type { DadosLivro, ResultadoLivro } from "@/lib/livro-tipos";

type SB = Awaited<ReturnType<typeof createClient>>;

async function pode(codigo: string) {
  return (await getPermissoes()).includes(codigo);
}

async function syncAutoresTemas(
  supabase: SB,
  livroId: number,
  autores: number[],
  temas: string[],
) {
  await supabase.from("livro_autor").delete().eq("livro_id", livroId);
  if (autores.length) {
    await supabase
      .from("livro_autor")
      .insert(autores.map((autor_id) => ({ livro_id: livroId, autor_id })));
  }
  await supabase.from("temas").delete().eq("livro_id", livroId);
  const limpos = [...new Set(temas.map((t) => t.trim()).filter(Boolean))];
  if (limpos.length) {
    await supabase
      .from("temas")
      .insert(limpos.map((nome) => ({ livro_id: livroId, nome })));
  }
}

export async function criarLivro(dados: DadosLivro): Promise<ResultadoLivro> {
  if (!(await pode("livro.create"))) return { erro: "Sem permissão." };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("livros")
    .insert({
      nome: dados.nome.trim(),
      codigo_livro: dados.codigo_livro.trim() || null,
      genero_id: dados.genero_id,
      resumo: dados.resumo || null,
    })
    .select("id")
    .single();
  if (error || !data) return { erro: traduzErroDb(error) };
  await syncAutoresTemas(supabase, data.id, dados.autores, dados.temas);
  revalidatePath("/livros");
  return { id: data.id };
}

export async function atualizarLivro(
  id: number,
  dados: DadosLivro,
): Promise<ResultadoLivro> {
  if (!(await pode("livro.update"))) return { erro: "Sem permissão." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("livros")
    .update({
      nome: dados.nome.trim(),
      codigo_livro: dados.codigo_livro.trim() || null,
      genero_id: dados.genero_id,
      resumo: dados.resumo || null,
    })
    .eq("id", id);
  if (error) return { erro: traduzErroDb(error) };
  await syncAutoresTemas(supabase, id, dados.autores, dados.temas);
  revalidatePath("/livros");
  revalidatePath(`/livros/${id}`);
  return { id };
}

export async function excluirLivro(id: number): Promise<ResultadoLivro> {
  if (!(await pode("livro.destroy"))) return { erro: "Sem permissão." };
  const supabase = await createClient();
  const { error } = await supabase.from("livros").delete().eq("id", id);
  if (error) return { erro: traduzErroDb(error) };
  revalidatePath("/livros");
  return {};
}
