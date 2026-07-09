/**
 * Transformações puras da migração de dados (Fase 8) — sem I/O, testáveis.
 * Reaproveitam as regras já existentes do app (CPF e prazo de empréstimo).
 */
import { apenasDigitos, validarCpf } from "../../src/lib/cpf";
import { calcularDataPrevista, PRAZO_PADRAO_DIAS } from "../../src/lib/emprestimo";

export type CodigoStatus = "disponivel" | "emprestado" | "extraviado" | "vencido";

// Mapa dos ids de status do legado → código estável no destino.
const MAPA_STATUS: Record<number, CodigoStatus> = {
  1: "disponivel",
  2: "emprestado",
  3: "extraviado",
  5: "vencido",
};

/** Traduz o status_id do legado para o código estável. Lança se desconhecido. */
export function codigoStatus(legacyId: number): CodigoStatus {
  const c = MAPA_STATUS[legacyId];
  if (!c) throw new Error(`status legado desconhecido: ${legacyId}`);
  return c;
}

/** CPF: mantém só se for válido (11 dígitos + dígitos verificadores). Senão null. */
export function cpfParaBanco(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  const d = apenasDigitos(String(raw));
  if (d.length !== 11) return null;
  return validarCpf(d) ? d : null;
}

/** E-mail normalizado (trim + minúsculas). Vazio → null. */
export function emailParaBanco(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  const e = String(raw).trim().toLowerCase();
  return e === "" ? null : e;
}

/** Telefone: só dígitos; vazio → null (campo livre no destino). */
export function telefoneParaBanco(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  const t = apenasDigitos(String(raw));
  return t === "" ? null : t;
}

/** codigo_livro (bigint no legado) → texto. null/vazio → null. */
export function codigoLivroParaTexto(
  raw: number | string | null | undefined,
): string | null {
  if (raw == null) return null;
  const s = String(raw).trim();
  return s === "" ? null : s;
}

/** Resumo/biografia HTML: vazio ou só-tags/espaços → null; senão o HTML original (trim). */
export function htmlParaBanco(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  const s = String(raw);
  const semConteudo = s
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, "")
    .trim();
  return semConteudo === "" ? null : s.trim();
}

/** Nome de tema: trim; vazio → null (marca para descarte). */
export function temaLimpo(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  const t = String(raw).trim();
  return t === "" ? null : t;
}

/** Nome obrigatório (gênero, autor, livro, pessoa…): apenas trim. */
export function nomeLimpo(raw: string | null | undefined): string {
  return String(raw ?? "").trim();
}

/** data_prevista_devolucao histórica = data_emprestimo + prazo padrão (14). "YYYY-MM-DD". */
export function previstaHistorica(
  dataEmprestimo: string | Date,
  dias: number = PRAZO_PADRAO_DIAS,
): string {
  const base =
    typeof dataEmprestimo === "string"
      ? new Date(dataEmprestimo + "T00:00:00Z")
      : dataEmprestimo;
  return calcularDataPrevista(base, dias).toISOString().slice(0, 10);
}

export type PessoaNorm = {
  id: number;
  nome: string;
  cpf: string | null;
  email: string | null;
  telefone: string | null;
};

/**
 * Garante unicidade de cpf/email entre as pessoas: em duplicidade, o registro de
 * MENOR id mantém o valor; nos demais o campo vira null (sem perder a pessoa).
 */
export function aplicarUnicidadePessoas(pessoas: PessoaNorm[]): PessoaNorm[] {
  const ordenadas = [...pessoas].sort((a, b) => a.id - b.id);
  const cpfsVistos = new Set<string>();
  const emailsVistos = new Set<string>();
  return ordenadas.map((p) => {
    let cpf = p.cpf;
    let email = p.email;
    if (cpf != null) {
      if (cpfsVistos.has(cpf)) cpf = null;
      else cpfsVistos.add(cpf);
    }
    if (email != null) {
      if (emailsVistos.has(email)) email = null;
      else emailsVistos.add(email);
    }
    return { ...p, cpf, email };
  });
}

export type Par = { livro_id: number; autor_id: number };

/** livro_autor: descarta órfãos (livro/autor inexistente) e duplicatas (PK composta). */
export function filtrarLivroAutor(
  pares: Par[],
  livroIds: Set<number>,
  autorIds: Set<number>,
): Par[] {
  const vistos = new Set<string>();
  const out: Par[] = [];
  for (const p of pares) {
    if (!livroIds.has(p.livro_id) || !autorIds.has(p.autor_id)) continue;
    const k = `${p.livro_id}:${p.autor_id}`;
    if (vistos.has(k)) continue;
    vistos.add(k);
    out.push(p);
  }
  return out;
}

export type TemaBruto = { livro_id: number; nome: string | null };
export type TemaLimpoRow = { livro_id: number; nome: string };

/** temas: trim, descarta vazios, descarta órfãos e deduplica por (livro_id, nome). */
export function filtrarTemas(
  temas: TemaBruto[],
  livroIds: Set<number>,
): TemaLimpoRow[] {
  const vistos = new Set<string>();
  const out: TemaLimpoRow[] = [];
  for (const t of temas) {
    const nome = temaLimpo(t.nome);
    if (nome == null) continue;
    if (!livroIds.has(t.livro_id)) continue;
    const k = `${t.livro_id}:${nome}`;
    if (vistos.has(k)) continue;
    vistos.add(k);
    out.push({ livro_id: t.livro_id, nome });
  }
  return out;
}
