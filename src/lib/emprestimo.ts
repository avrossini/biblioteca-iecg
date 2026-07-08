/**
 * Regras de negócio de circulação (puras, sem I/O) — cobertas por testes.
 * As datas são manipuladas em UTC para o cálculo ser determinístico,
 * independente do fuso do servidor.
 */

/** Prazo padrão de empréstimo, em dias. Decisão de negócio — a confirmar. */
export const PRAZO_PADRAO_DIAS = 14;

/** Data prevista de devolução = data do empréstimo + `dias`. */
export function calcularDataPrevista(
  dataEmprestimo: Date,
  dias: number = PRAZO_PADRAO_DIAS,
): Date {
  const prevista = new Date(dataEmprestimo);
  prevista.setUTCDate(prevista.getUTCDate() + dias);
  return prevista;
}

/** Dias de atraso em relação a `hoje` (0 se ainda dentro do prazo). */
export function diasEmAtraso(dataPrevista: Date, hoje: Date = new Date()): number {
  const ms = hoje.getTime() - dataPrevista.getTime();
  if (ms <= 0) return 0;
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}
