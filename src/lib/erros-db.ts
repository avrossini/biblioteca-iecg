/** Traduz erros comuns do Postgres/Supabase em mensagens amigáveis (PT-BR). */
export function traduzErroDb(
  error: { code?: string; message?: string } | null,
): string {
  if (!error) return "Erro desconhecido.";
  switch (error.code) {
    case "23505":
      return "Já existe um registro com esse valor.";
    case "23503":
      return "Não é possível excluir: o registro está em uso.";
    case "42501":
      return "Sem permissão para esta ação.";
    default:
      return error.message ?? "Não foi possível concluir a operação.";
  }
}

export type Resultado = { erro?: string };
