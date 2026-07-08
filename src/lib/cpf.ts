/** Remove tudo que não for dígito. */
export function apenasDigitos(v: string): string {
  return (v ?? "").replace(/\D/g, "");
}

/** Valida um CPF pelos dígitos verificadores (aceita com ou sem máscara). */
export function validarCpf(v: string): boolean {
  const cpf = apenasDigitos(v);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false; // sequência repetida (000..., 111...)

  const calcDigito = (base: string, pesoInicial: number): number => {
    let soma = 0;
    for (let i = 0; i < base.length; i++) {
      soma += Number(base[i]) * (pesoInicial - i);
    }
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  const d1 = calcDigito(cpf.slice(0, 9), 10);
  const d2 = calcDigito(cpf.slice(0, 10), 11);
  return d1 === Number(cpf[9]) && d2 === Number(cpf[10]);
}
