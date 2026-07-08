/** Valida a nova senha e sua confirmação. Retorna a mensagem de erro ou null. */
export function validarNovaSenha(
  senha: string,
  confirmacao: string,
): string | null {
  if (senha.length < 8) return "A senha deve ter ao menos 8 caracteres.";
  if (senha !== confirmacao) return "As senhas não coincidem.";
  return null;
}
