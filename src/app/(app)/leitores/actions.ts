"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getPermissoes } from "@/lib/permissoes";
import { traduzErroDb, type Resultado } from "@/lib/erros-db";
import { apenasDigitos, validarCpf } from "@/lib/cpf";

async function pode(codigo: string) {
  return (await getPermissoes()).includes(codigo);
}

type Campos = {
  nome: string;
  cpf: string | null;
  email: string | null;
  telefone: string | null;
};

function normalizar(
  valores: Record<string, string>,
): { erro: string } | { dados: Campos } {
  const cpf = valores.cpf?.trim() ? apenasDigitos(valores.cpf) : "";
  if (cpf && !validarCpf(cpf)) return { erro: "CPF inválido." };
  return {
    dados: {
      nome: valores.nome.trim(),
      cpf: cpf || null,
      email: valores.email?.trim() || null,
      telefone: valores.telefone?.trim() || null,
    },
  };
}

export async function criar(valores: Record<string, string>): Promise<Resultado> {
  if (!(await pode("pessoa.create"))) return { erro: "Sem permissão." };
  const n = normalizar(valores);
  if ("erro" in n) return { erro: n.erro };
  const supabase = await createClient();
  const { error } = await supabase.from("pessoas").insert(n.dados);
  if (error) return { erro: traduzErroDb(error) };
  revalidatePath("/leitores");
  return {};
}

export async function salvar(id: number, valores: Record<string, string>): Promise<Resultado> {
  if (!(await pode("pessoa.update"))) return { erro: "Sem permissão." };
  const n = normalizar(valores);
  if ("erro" in n) return { erro: n.erro };
  const supabase = await createClient();
  const { error } = await supabase.from("pessoas").update(n.dados).eq("id", id);
  if (error) return { erro: traduzErroDb(error) };
  revalidatePath("/leitores");
  return {};
}

export async function excluir(id: number): Promise<Resultado> {
  if (!(await pode("pessoa.destroy"))) return { erro: "Sem permissão." };
  const supabase = await createClient();
  const { error } = await supabase.from("pessoas").delete().eq("id", id);
  if (error) return { erro: traduzErroDb(error) };
  revalidatePath("/leitores");
  return {};
}
