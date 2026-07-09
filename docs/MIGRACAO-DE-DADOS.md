# Migração de dados (Fase 8)

Carrega os dados do sistema legado (Laravel/MySQL, schema `forge`) no banco novo
(Postgres/Supabase). **ETL idempotente**, rodado localmente para ensaio; o corte em produção é a
**Fase 9**. Objetivo: **não perder informação**.

## Como o legado mapeia no destino

| Legado | Destino | Regra |
|---|---|---|
| `generos` | `generos` | id preservado. **Nome duplicado → mesclado** (destino é UNIQUE); livros remapeados |
| `autores` | `autores` | id preservado; `biografia` (HTML) preservada |
| `bibliotecas` | `bibliotecas` | id preservado |
| `status` (1,2,3,5) | `status` | **por código**: 1→`disponivel`, 2→`emprestado`, 3→`extraviado`, 5→`vencido` |
| `pessoas` | `pessoas` | id preservado; CPF só se **válido** (`validarCpf`), senão NULL; CPF/e-mail duplicado mantém o menor id |
| `livros` | `livros` | id preservado; `codigo_livro` bigint→texto; `resumo` HTML (vazio→NULL); `genero_id` órfão→placeholder 1; **`autor_id` legado descartado** (vestigial) |
| `livro_autor` | `livro_autor` | dedupe + descarte de órfãos; autoria real; rede de segurança via `livros.autor_id ≠ 1` |
| `temas` | `temas` | TRIM; descarta vazios/órfãos; dedupe por `(livro_id, nome)`. Sem preservar id |
| `exemplares` | `exemplares` | id preservado; `status_id` via mapa de código; `numero_tombo`=NULL |
| `emprestimos` | `emprestimos` | id preservado; `data_prevista_devolucao` = `data_emprestimo + 14`; exemplar de empréstimo aberto → `emprestado` |
| `users` / infra Laravel | — | não migradas (a `users` está vazia; contas criadas na Fase 9) |

Os IDs `bigint` do legado são **preservados** (o schema usa `identity by default`); as sequences são
reajustadas ao fim. A carga roda como superusuário (`DATABASE_URL`), ignorando RLS — **não** usa as
RPCs (que forçariam `current_date`/`disponivel`).

## Como rodar (local)

Pré-requisitos: Supabase local no ar (`npx supabase start`) e Docker.

1. Copie o dump do legado e aponte o caminho:
   - Simples: copie para a raiz do repo como `iecg.sql` (já no `.gitignore` — **contém PII, nunca
     commitar**), OU defina `LEGACY_DUMP_PATH` no `.env` com o caminho no host.
2. `npm run migrate:up` — sobe o MySQL 8 efêmero (profile `legacy`) e **auto-carrega o dump**.
3. `npm run migrate` — roda o ETL e imprime o **relatório de reconciliação**.
4. `npm run migrate:down` — derruba o MySQL e apaga o volume (para recarregar do zero).

Trava de segurança: `migrar.ts` só roda contra banco local; para produção (Fase 9), exige
`MIGRACAO_PERMITIR_REMOTO=1`.

## Relatório de reconciliação (ensaio de 2026-07-08)

```
generos     181 → 179   (2 nomes duplicados mesclados)
autores     836 → 836
bibliotecas   2 → 2
pessoas       6 → 6      (5 CPFs nulificados: inválidos/duplicado; 1 e-mail duplicado nulificado)
livros     1419 → 1419
livro_autor 1114 → 1107  (7 órfãos/duplicatas)
temas     22366 → 17735  (4631 vazios/órfãos/duplicatas)
exemplares  444 → 444
emprestimos  20 → 20
```

Verificado no destino: 436 exemplares `disponivel`, 8 `emprestado`, 7 empréstimos em aberto, 0
exemplares com empréstimo aberto fora do status `emprestado`. ETL **idempotente** (2ª execução →
contagens idênticas).

## Testes

- **Unit** (`tests/unit/migracao-transformacoes.test.ts`): transformações puras (CI).
- **pgTAP** (`supabase/tests/10_status_legado.test.sql`): status `extraviado`/`vencido` (CI).
- **Integração** (`tests/integration/migracao.test.ts`): ETL ponta-a-ponta contra o
  `scripts/migracao/fixture.sql` (sintético, sem PII). Local, exige o container; ative com
  `MIGRACAO_IT=1` (`npm run test:migracao`). **Não roda no CI** (sem MySQL nem PII).
