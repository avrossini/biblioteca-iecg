/**
 * Regras de negócio de circulação (puras, sem I/O) — cobertas por testes.
 * As datas são manipuladas em UTC para o cálculo ser determinístico,
 * independente do fuso do servidor.
 */

/**
 * Prazo padrão de empréstimo, em dias.
 * Configurável via env `NEXT_PUBLIC_PRAZO_DEVOLUCAO_DIAS` (default 14).
 */
const prazoEnv = Number(process.env.NEXT_PUBLIC_PRAZO_DEVOLUCAO_DIAS);
export const PRAZO_PADRAO_DIAS =
  Number.isFinite(prazoEnv) && prazoEnv > 0 ? prazoEnv : 14;

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

export type SituacaoTom = "ok" | "warn" | "danger" | "neutro";

/** Situação de um empréstimo (rótulo + tom para Chip). Datas em "YYYY-MM-DD". */
export function situacaoEmprestimo(
  dataPrevista: string,
  dataDevolucao: string | null,
  hoje: Date = new Date(),
): { label: string; tom: SituacaoTom } {
  if (dataDevolucao) return { label: "Devolvido", tom: "neutro" };
  const atraso = diasEmAtraso(new Date(dataPrevista), hoje);
  if (atraso > 0) return { label: `Atrasado ${atraso}d`, tom: "danger" };
  if (dataPrevista.slice(0, 10) === hoje.toISOString().slice(0, 10)) {
    return { label: "Vence hoje", tom: "warn" };
  }
  return { label: "No prazo", tom: "ok" };
}
