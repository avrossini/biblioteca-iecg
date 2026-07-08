"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getPermissoes } from "@/lib/permissoes";
import { traduzErroDb, type Resultado } from "@/lib/erros-db";
import { calcularDataPrevista } from "@/lib/emprestimo";

async function pode(codigo: string) {
  return (await getPermissoes()).includes(codigo);
}

export async function emprestar(
  exemplarId: number,
  pessoaId: number,
): Promise<Resultado> {
  if (!(await pode("emprestimo.emprestar"))) return { erro: "Sem permissão." };
  const supabase = await createClient();
  const prevista = calcularDataPrevista(new Date()).toISOString().slice(0, 10);
  const { error } = await supabase.rpc("registrar_emprestimo", {
    p_exemplar_id: exemplarId,
    p_pessoa_id: pessoaId,
    p_data_prevista: prevista,
  });
  if (error) return { erro: error.message || traduzErroDb(error) };
  revalidatePath("/emprestimos");
  revalidatePath("/");
  return {};
}

export async function devolver(emprestimoId: number): Promise<Resultado> {
  if (!(await pode("emprestimo.devolver"))) return { erro: "Sem permissão." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("registrar_devolucao", {
    p_emprestimo_id: emprestimoId,
  });
  if (error) return { erro: error.message || traduzErroDb(error) };
  revalidatePath("/emprestimos");
  revalidatePath("/");
  return {};
}
