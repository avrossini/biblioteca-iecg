/**
 * ETL da migração de dados (Fase 8): MySQL legado (schema `forge`) → Postgres (Supabase).
 * Idempotente: trunca as tabelas de domínio e recarrega, preservando os IDs bigint do legado
 * (exceto `status`, mapeado por código, e `temas`/`livro_autor`, sem id próprio/deduplicados).
 * Conecta ao Postgres como superusuário (DATABASE_URL) — ignora RLS. NÃO usa as RPCs.
 *
 * Rode com `npm run migrate` (após `npm run migrate:up`). O teste de integração importa
 * `executarMigracao` e injeta suas próprias conexões.
 */
import mysql, { type Connection } from "mysql2/promise";
import type { RowDataPacket } from "mysql2";
import { Client } from "pg";
import * as T from "./transformacoes";

export type Relatorio = {
  contagens: Record<string, { origem: number; destino: number }>;
  generosMesclados: number;
  pessoasCpfNulos: number;
  pessoasEmailNulos: number;
  temasDescartados: number;
  livroAutorDescartados: number;
  exemplaresOrfaos: number;
  emprestimosOrfaos: number;
  conflitosAbertos: number;
  problemas: string[];
};

async function q(my: Connection, sql: string): Promise<RowDataPacket[]> {
  const [rows] = await my.query<RowDataPacket[]>(sql);
  return rows;
}

/** Insere linhas em lote (multi-row parametrizado) respeitando o limite de parâmetros. */
async function inserirLote(
  pg: Client,
  tabela: string,
  colunas: string[],
  linhas: unknown[][],
  chunk = 500,
): Promise<void> {
  for (let i = 0; i < linhas.length; i += chunk) {
    const bloco = linhas.slice(i, i + chunk);
    const params: unknown[] = [];
    const tuplas = bloco.map((linha) => {
      const marks = linha.map((v) => {
        params.push(v);
        return `$${params.length}`;
      });
      return `(${marks.join(",")})`;
    });
    await pg.query(
      `insert into ${tabela} (${colunas.join(",")}) values ${tuplas.join(",")}`,
      params,
    );
  }
}

async function resetSeq(pg: Client, tabela: string): Promise<void> {
  await pg.query(
    `select setval(pg_get_serial_sequence('public.${tabela}','id'),
       coalesce((select max(id) from ${tabela}), 1),
       (select count(*) > 0 from ${tabela}))`,
  );
}

async function contarDestino(pg: Client, tabela: string): Promise<number> {
  const r = await pg.query(`select count(*)::int as n from ${tabela}`);
  return r.rows[0].n as number;
}

/** Executa toda a migração. Retorna o relatório de reconciliação. */
export async function executarMigracao(
  my: Connection,
  pg: Client,
): Promise<Relatorio> {
  const agora = new Date().toISOString();
  const rel: Relatorio = {
    contagens: {},
    generosMesclados: 0,
    pessoasCpfNulos: 0,
    pessoasEmailNulos: 0,
    temasDescartados: 0,
    livroAutorDescartados: 0,
    exemplaresOrfaos: 0,
    emprestimosOrfaos: 0,
    conflitosAbertos: 0,
    problemas: [],
  };
  const ts = (v: unknown) => (v == null ? agora : v);

  await pg.query("begin");
  try {
    await pg.query(
      `truncate emprestimos, exemplares, temas, livro_autor, livros, pessoas,
                 bibliotecas, autores, generos restart identity`,
    );

    // Mapa código → status.id (status vêm do seed; não são truncados).
    const stRows = await pg.query("select id, codigo from status");
    const statusIdPorCodigo = new Map<string, number>(
      stRows.rows.map((r) => [r.codigo as string, Number(r.id)]),
    );

    // ---------- generos (dedupe por nome, pois destino é UNIQUE) ----------
    const generos = await q(my, "select id, nome, created_at, updated_at from generos order by id");
    const canonicalPorNome = new Map<string, number>();
    const generoRemap = new Map<number, number>();
    const generosInserir: unknown[][] = [];
    for (const g of generos) {
      const nome = T.nomeLimpo(g.nome);
      const chave = nome.toLowerCase();
      const canon = canonicalPorNome.get(chave);
      if (canon != null) {
        generoRemap.set(Number(g.id), canon);
        rel.generosMesclados++;
      } else {
        canonicalPorNome.set(chave, Number(g.id));
        generoRemap.set(Number(g.id), Number(g.id));
        generosInserir.push([g.id, nome, ts(g.created_at), ts(g.updated_at)]);
      }
    }
    await inserirLote(pg, "generos", ["id", "nome", "created_at", "updated_at"], generosInserir);

    // ---------- autores ----------
    const autores = await q(my, "select id, nome, biografia, created_at, updated_at from autores order by id");
    const autorIds = new Set<number>(autores.map((a) => Number(a.id)));
    await inserirLote(
      pg,
      "autores",
      ["id", "nome", "biografia", "created_at", "updated_at"],
      autores.map((a) => [a.id, T.nomeLimpo(a.nome), T.htmlParaBanco(a.biografia), ts(a.created_at), ts(a.updated_at)]),
    );

    // ---------- bibliotecas ----------
    const bibliotecas = await q(my, "select id, nome, created_at, updated_at from bibliotecas order by id");
    await inserirLote(
      pg,
      "bibliotecas",
      ["id", "nome", "created_at", "updated_at"],
      bibliotecas.map((b) => [b.id, T.nomeLimpo(b.nome), ts(b.created_at), ts(b.updated_at)]),
    );

    // ---------- pessoas (normaliza + unicidade cpf/email) ----------
    const pessoasRaw = await q(my, "select id, nome, cpf, email, telefone, created_at, updated_at from pessoas order by id");
    const criadoPessoa = new Map<number, unknown>();
    const atualizadoPessoa = new Map<number, unknown>();
    const temCpfRaw = new Map<number, boolean>();
    const temEmailRaw = new Map<number, boolean>();
    const naoVazio = (v: unknown) => v != null && String(v).trim() !== "";
    const pessoasNorm: T.PessoaNorm[] = pessoasRaw.map((p) => {
      const id = Number(p.id);
      criadoPessoa.set(id, ts(p.created_at));
      atualizadoPessoa.set(id, ts(p.updated_at));
      temCpfRaw.set(id, naoVazio(p.cpf));
      temEmailRaw.set(id, naoVazio(p.email));
      return {
        id,
        nome: T.nomeLimpo(p.nome),
        cpf: T.cpfParaBanco(p.cpf),
        email: T.emailParaBanco(p.email),
        telefone: T.telefoneParaBanco(p.telefone),
      };
    });
    const pessoas = T.aplicarUnicidadePessoas(pessoasNorm);
    // Nulificado = tinha valor na origem, mas ficou null (inválido ou duplicado).
    for (const p of pessoas) {
      if (p.cpf == null && temCpfRaw.get(p.id)) rel.pessoasCpfNulos++;
      if (p.email == null && temEmailRaw.get(p.id)) rel.pessoasEmailNulos++;
    }
    await inserirLote(
      pg,
      "pessoas",
      ["id", "nome", "cpf", "email", "telefone", "created_at", "updated_at"],
      pessoas.map((p) => [p.id, p.nome, p.cpf, p.email, p.telefone, criadoPessoa.get(p.id), atualizadoPessoa.get(p.id)]),
    );

    // ---------- livros (remapeia genero; descarta autor_id vestigial) ----------
    const PLACEHOLDER_GENERO = 1;
    const livros = await q(my, "select id, codigo_livro, nome, resumo, genero_id, autor_id, created_at, updated_at from livros order by id");
    const livroIds = new Set<number>(livros.map((l) => Number(l.id)));
    await inserirLote(
      pg,
      "livros",
      ["id", "codigo_livro", "nome", "resumo", "genero_id", "created_at", "updated_at"],
      livros.map((l) => {
        const gen = generoRemap.get(Number(l.genero_id)) ?? PLACEHOLDER_GENERO;
        return [l.id, T.codigoLivroParaTexto(l.codigo_livro), T.nomeLimpo(l.nome), T.htmlParaBanco(l.resumo), gen, ts(l.created_at), ts(l.updated_at)];
      }),
    );

    // ---------- livro_autor (pivot: dedupe + órfãos; rede de segurança via livros.autor_id) ----------
    const paresRaw = await q(my, "select livro_id, autor_id from livro_autor");
    const pares: T.Par[] = paresRaw.map((p) => ({ livro_id: Number(p.livro_id), autor_id: Number(p.autor_id) }));
    for (const l of livros) {
      const aid = l.autor_id == null ? null : Number(l.autor_id);
      if (aid != null && aid !== 1) pares.push({ livro_id: Number(l.id), autor_id: aid });
    }
    const paresLimpos = T.filtrarLivroAutor(pares, livroIds, autorIds);
    rel.livroAutorDescartados = pares.length - paresLimpos.length;
    await inserirLote(pg, "livro_autor", ["livro_id", "autor_id"], paresLimpos.map((p) => [p.livro_id, p.autor_id]));

    // ---------- temas (trim, vazios, órfãos, dedupe) — sem preservar id ----------
    const temasRaw = await q(my, "select livro_id, nome from temas");
    const temas = T.filtrarTemas(temasRaw.map((t) => ({ livro_id: Number(t.livro_id), nome: t.nome })), livroIds);
    rel.temasDescartados = temasRaw.length - temas.length;
    await inserirLote(pg, "temas", ["livro_id", "nome"], temas.map((t) => [t.livro_id, t.nome]));

    // ---------- exemplares ----------
    const exemplaresRaw = await q(my, "select id, livro_id, biblioteca_id, status_id, data_aquisicao, created_at, updated_at from exemplares order by id");
    const bibliotecaIds = new Set<number>(bibliotecas.map((b) => Number(b.id)));
    const exemplares = exemplaresRaw.filter((e) => {
      const ok = livroIds.has(Number(e.livro_id)) && bibliotecaIds.has(Number(e.biblioteca_id));
      if (!ok) {
        rel.exemplaresOrfaos++;
        rel.problemas.push(`exemplar ${e.id} órfão (livro ${e.livro_id} / biblioteca ${e.biblioteca_id})`);
      }
      return ok;
    });
    const exemplarIds = new Set<number>(exemplares.map((e) => Number(e.id)));
    await inserirLote(
      pg,
      "exemplares",
      ["id", "livro_id", "biblioteca_id", "status_id", "numero_tombo", "data_aquisicao", "created_at", "updated_at"],
      exemplares.map((e) => {
        const codigo = T.codigoStatus(Number(e.status_id));
        const statusId = statusIdPorCodigo.get(codigo);
        if (statusId == null) throw new Error(`status código ${codigo} inexistente no destino`);
        return [e.id, e.livro_id, e.biblioteca_id, statusId, null, e.data_aquisicao, ts(e.created_at), ts(e.updated_at)];
      }),
    );

    // ---------- emprestimos ----------
    const pessoaIds = new Set<number>(pessoas.map((p) => p.id));
    const empRaw = await q(my, "select id, exemplar_id, pessoa_id, data_emprestimo, data_devolucao, created_at, updated_at from emprestimos order by id");
    type Emp = { id: number; exemplar_id: number; pessoa_id: number; data_emprestimo: string; data_devolucao: string | null; created_at: unknown; updated_at: unknown };
    const emp: Emp[] = [];
    for (const e of empRaw) {
      if (!exemplarIds.has(Number(e.exemplar_id)) || !pessoaIds.has(Number(e.pessoa_id))) {
        rel.emprestimosOrfaos++;
        rel.problemas.push(`empréstimo ${e.id} órfão (exemplar ${e.exemplar_id} / pessoa ${e.pessoa_id})`);
        continue;
      }
      emp.push({
        id: Number(e.id),
        exemplar_id: Number(e.exemplar_id),
        pessoa_id: Number(e.pessoa_id),
        data_emprestimo: String(e.data_emprestimo),
        data_devolucao: e.data_devolucao == null ? null : String(e.data_devolucao),
        created_at: ts(e.created_at),
        updated_at: ts(e.updated_at),
      });
    }
    // Invariante: no máx. 1 aberto por exemplar. Se houver mais, mantém o mais recente aberto
    // e "fecha" os demais (data_devolucao = data_emprestimo).
    const abertosPorExemplar = new Map<number, Emp[]>();
    for (const e of emp) {
      if (e.data_devolucao == null) {
        const lista = abertosPorExemplar.get(e.exemplar_id) ?? [];
        lista.push(e);
        abertosPorExemplar.set(e.exemplar_id, lista);
      }
    }
    for (const [exemplarId, lista] of abertosPorExemplar) {
      if (lista.length <= 1) continue;
      lista.sort((a, b) => a.data_emprestimo.localeCompare(b.data_emprestimo));
      for (let i = 0; i < lista.length - 1; i++) {
        lista[i].data_devolucao = lista[i].data_emprestimo;
        rel.conflitosAbertos++;
      }
      rel.problemas.push(`exemplar ${exemplarId} tinha ${lista.length} empréstimos abertos; mantido 1`);
    }
    await inserirLote(
      pg,
      "emprestimos",
      ["id", "exemplar_id", "pessoa_id", "data_emprestimo", "data_prevista_devolucao", "data_devolucao", "created_at", "updated_at"],
      emp.map((e) => [e.id, e.exemplar_id, e.pessoa_id, e.data_emprestimo, T.previstaHistorica(e.data_emprestimo), e.data_devolucao, e.created_at, e.updated_at]),
    );

    // Reconcilia status dos exemplares com empréstimos abertos.
    const abertosExemplarIds = emp.filter((e) => e.data_devolucao == null).map((e) => e.exemplar_id);
    if (abertosExemplarIds.length > 0) {
      const idEmprestado = statusIdPorCodigo.get("emprestado");
      await pg.query(
        `update exemplares set status_id = $1 where id = any($2::bigint[])`,
        [idEmprestado, abertosExemplarIds],
      );
    }

    // ---------- sequences ----------
    for (const t of ["generos", "autores", "bibliotecas", "pessoas", "livros", "temas", "exemplares", "emprestimos"]) {
      await resetSeq(pg, t);
    }

    await pg.query("commit");

    // ---------- reconciliação ----------
    rel.contagens = {
      generos: { origem: generos.length, destino: await contarDestino(pg, "generos") },
      autores: { origem: autores.length, destino: await contarDestino(pg, "autores") },
      bibliotecas: { origem: bibliotecas.length, destino: await contarDestino(pg, "bibliotecas") },
      pessoas: { origem: pessoasRaw.length, destino: await contarDestino(pg, "pessoas") },
      livros: { origem: livros.length, destino: await contarDestino(pg, "livros") },
      livro_autor: { origem: paresRaw.length, destino: await contarDestino(pg, "livro_autor") },
      temas: { origem: temasRaw.length, destino: await contarDestino(pg, "temas") },
      exemplares: { origem: exemplaresRaw.length, destino: await contarDestino(pg, "exemplares") },
      emprestimos: { origem: empRaw.length, destino: await contarDestino(pg, "emprestimos") },
    };

    // Divergências inesperadas (destino ≠ origem − descartes conhecidos).
    const esperado: Record<string, number> = {
      generos: generos.length - rel.generosMesclados,
      autores: autores.length,
      bibliotecas: bibliotecas.length,
      pessoas: pessoasRaw.length,
      livros: livros.length,
      temas: temasRaw.length - rel.temasDescartados,
      exemplares: exemplaresRaw.length - rel.exemplaresOrfaos,
      emprestimos: empRaw.length - rel.emprestimosOrfaos,
    };
    for (const [t, n] of Object.entries(esperado)) {
      if (rel.contagens[t].destino !== n) {
        rel.problemas.push(`contagem inesperada em ${t}: destino ${rel.contagens[t].destino}, esperado ${n}`);
      }
    }
    return rel;
  } catch (e) {
    await pg.query("rollback");
    throw e;
  }
}

function imprimirRelatorio(rel: Relatorio): void {
  console.log("\n===== Relatório de reconciliação =====");
  for (const [t, c] of Object.entries(rel.contagens)) {
    console.log(`  ${t.padEnd(14)} origem ${String(c.origem).padStart(6)} → destino ${String(c.destino).padStart(6)}`);
  }
  console.log("  ---");
  console.log(`  gêneros mesclados (nome dup):   ${rel.generosMesclados}`);
  console.log(`  pessoas com CPF nulificado:     ${rel.pessoasCpfNulos}`);
  console.log(`  pessoas com e-mail nulificado:  ${rel.pessoasEmailNulos}`);
  console.log(`  temas descartados:              ${rel.temasDescartados}`);
  console.log(`  livro_autor descartados:        ${rel.livroAutorDescartados}`);
  console.log(`  exemplares órfãos:              ${rel.exemplaresOrfaos}`);
  console.log(`  empréstimos órfãos:             ${rel.emprestimosOrfaos}`);
  console.log(`  conflitos de aberto resolvidos: ${rel.conflitosAbertos}`);
  if (rel.problemas.length > 0) {
    console.log("  --- ocorrências ---");
    for (const p of rel.problemas) console.log(`   • ${p}`);
  }
  console.log("======================================\n");
}

async function main(): Promise<void> {
  const LEGACY_MYSQL_URL = process.env.LEGACY_MYSQL_URL ?? "mysql://root:root@127.0.0.1:3307/forge";
  const DATABASE_URL = process.env.DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

  // Trava de segurança: só banco local, salvo confirmação explícita (produção = Fase 9).
  const local = /(?:@|\/\/)(127\.0\.0\.1|localhost)[:/]/.test(DATABASE_URL);
  if (!local && process.env.MIGRACAO_PERMITIR_REMOTO !== "1") {
    console.error("DATABASE_URL não é local. Defina MIGRACAO_PERMITIR_REMOTO=1 para carregar em produção (Fase 9).");
    process.exit(2);
  }

  const my = await mysql.createConnection({ uri: LEGACY_MYSQL_URL, dateStrings: true, multipleStatements: true });
  const pg = new Client({ connectionString: DATABASE_URL });
  await pg.connect();
  try {
    const rel = await executarMigracao(my, pg);
    imprimirRelatorio(rel);
    if (rel.problemas.some((p) => p.startsWith("contagem inesperada"))) {
      console.error("Divergência de contagem — verifique o relatório.");
      process.exit(1);
    }
    console.log("Migração concluída.");
  } finally {
    await my.end();
    await pg.end();
  }
}

// Executado diretamente (npm run migrate); sob o Vitest, apenas exporta.
if (!process.env.VITEST) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
