import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Lista os códigos de funcionalidade do usuário autenticado (RPC meus_codigos). */
export async function getPermissoes(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("meus_codigos");
  if (error || !data) return [];
  return data as unknown as string[];
}

/** Helper booleano sobre uma lista de permissões já carregada. */
export function temPermissao(codigo: string, permissoes: string[]): boolean {
  return permissoes.includes(codigo);
}

/**
 * Guarda de rota (Server Components/páginas): redireciona para "/" se o usuário
 * não tiver a permissão. A proteção definitiva continua no RLS do banco.
 */
export async function requirePermissao(codigo: string): Promise<void> {
  const permissoes = await getPermissoes();
  if (!permissoes.includes(codigo)) {
    redirect("/");
  }
}
