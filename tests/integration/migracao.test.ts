import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import mysql from "mysql2/promise";
import { Client } from "pg";
import { executarMigracao, type Relatorio } from "../../scripts/migracao/migrar";

// Integração local: exige o container `mysql-legacy` (npm run migrate:up) e o Supabase local.
// Não roda no CI. Ative com MIGRACAO_IT=1.
const rodar = process.env.MIGRACAO_IT === "1";

const MYSQL_ROOT = {
  host: process.env.LEGACY_MYSQL_HOST ?? "127.0.0.1",
  port: Number(process.env.LEGACY_MYSQL_PORT ?? 3307),
  user: "root",
  password: "root",
};
const DATABASE_URL =
  process.env.DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

describe.skipIf(!rodar)("ETL de migração (fixture sintético)", () => {
  let pg: Client;
  let rel: Relatorio;

  beforeAll(async () => {
    const dir = dirname(fileURLToPath(import.meta.url));
    const sql = readFileSync(join(dir, "../../scripts/migracao/fixture.sql"), "utf8");
    const admin = await mysql.createConnection({ ...MYSQL_ROOT, multipleStatements: true });
    await admin.query(sql);
    await admin.end();

    const my = await mysql.createConnection({ ...MYSQL_ROOT, database: "fixture", dateStrings: true });
    pg = new Client({ connectionString: DATABASE_URL });
    await pg.connect();
    rel = await executarMigracao(my, pg);
    await my.end();
  }, 60000);

  afterAll(async () => {
    if (pg) await pg.end();
  });

  it("contagens conferem com os descartes esperados", () => {
    expect(rel.contagens.generos).toEqual({ origem: 3, destino: 2 });
    expect(rel.generosMesclados).toBe(1);
    expect(rel.contagens.autores.destino).toBe(2);
    expect(rel.contagens.pessoas.destino).toBe(4);
    expect(rel.contagens.livros.destino).toBe(3);
    expect(rel.contagens.livro_autor.destino).toBe(2);
    expect(rel.contagens.temas.destino).toBe(2);
    expect(rel.contagens.exemplares).toEqual({ origem: 4, destino: 3 });
    expect(rel.exemplaresOrfaos).toBe(1);
    expect(rel.contagens.emprestimos).toEqual({ origem: 3, destino: 2 });
    expect(rel.emprestimosOrfaos).toBe(1);
    expect(rel.pessoasCpfNulos).toBe(2); // id5 inválido + id7 duplicado
    expect(rel.pessoasEmailNulos).toBe(1); // id6 duplicado
    expect(rel.problemas.filter((p) => p.startsWith("contagem inesperada"))).toHaveLength(0);
  });

  it("aplica as regras no banco de destino", async () => {
    const cpf2 = await pg.query("select cpf from pessoas where id=2");
    expect(cpf2.rows[0].cpf).toBe("52998224725");
    const cpf7 = await pg.query("select cpf from pessoas where id=7");
    expect(cpf7.rows[0].cpf).toBeNull();

    // gênero remapeado: livro 101 aponta para 20 (não 21)
    const l101 = await pg.query("select genero_id from livros where id=101");
    expect(Number(l101.rows[0].genero_id)).toBe(20);

    // livro 102: gênero órfão → placeholder 1; resumo só-tags → null
    const l102 = await pg.query("select genero_id, resumo from livros where id=102");
    expect(Number(l102.rows[0].genero_id)).toBe(1);
    expect(l102.rows[0].resumo).toBeNull();

    // exemplar 3 (empréstimo aberto) → status 'emprestado'; exemplar 2 preserva 'extraviado'
    const ex3 = await pg.query("select s.codigo from exemplares e join status s on s.id=e.status_id where e.id=3");
    expect(ex3.rows[0].codigo).toBe("emprestado");
    const ex2 = await pg.query("select s.codigo from exemplares e join status s on s.id=e.status_id where e.id=2");
    expect(ex2.rows[0].codigo).toBe("extraviado");

    // empréstimo histórico: prevista = data_emprestimo + 14
    const emp1 = await pg.query("select to_char(data_prevista_devolucao,'YYYY-MM-DD') as prev from emprestimos where id=1");
    expect(emp1.rows[0].prev).toBe("2025-06-25");

    // sequência reajustada: novo gênero recebe id > max
    const nova = await pg.query("insert into generos (nome) values ('Pós-migração') returning id");
    expect(Number(nova.rows[0].id)).toBeGreaterThan(20);
  });
});
