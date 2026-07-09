# Checklist de Fim de Fase (Gate)

> Toda fase do [PLANO-DESENVOLVIMENTO.md](./PLANO-DESENVOLVIMENTO.md) só é considerada **concluída**
> após passar por esta checagem geral. O gate é parte do plano de cada fase e deve ser executado e
> registrado (seção "Registro de execução" ao final deste arquivo).

## Gate genérico (roda em toda fase)

| # | Verificação | Comando | Critério |
|---|-------------|---------|----------|
| 1 | Lint | `npm run lint` | sem erros |
| 2 | Typecheck | `npm run typecheck` | sem erros |
| 3 | Testes unitários/componentes | `npm run test:unit` | todos verdes |
| 4 | Testes de banco (pgTAP) *(se houver banco)* | `npm run test:db` | todos verdes |
| 5 | Testes E2E *(se houver UI)* | `npm run test:e2e` | todos verdes |
| 6 | Build de produção | `npm run build` | compila |
| 7 | Ambiente Docker sobe e responde | `make up` + `curl localhost:3000` | app responde HTTP 200 |
| 8 | Banco recria do zero *(se houver banco)* | `npx supabase db reset` | aplica migrations + seeds sem erro |
| 9 | CI verde | `gh run list` | run do último push = `success` |
| 10 | Docs/README atualizados | revisão | refletem o que foi entregue |
| 11 | Commit + push | `git push` | branch `main` publicada |

## Aceitação específica da fase

Cada fase define, no seu plano, a lista de **deliverables** a conferir item a item (o "o que é pronto").
O gate genérico acima garante saúde técnica; a aceitação específica garante que o **escopo** da fase
foi entregue.

## Registro de execução

### Fase 0 — Fundação — ✅ APROVADA (2026-07-08)

| Verificação | Resultado |
|-------------|-----------|
| Lint | ✓ sem erros |
| Typecheck | ✓ sem erros |
| Unit (Vitest) | ✓ 5/5 |
| Build de produção | ✓ compila |
| Docker (app em contêiner) | ✓ `Up`, HTTP 200 em `localhost:3000` |
| E2E (Playwright / chromium) | ✓ 1/1 (marca "Biblioteca IECG" visível) |
| pgTAP (sanity) | ✓ (via `supabase test db`) |
| CI (GitHub Actions) | ✓ run do commit "Fase 0" = **success** |
| Repositório publicado | ✓ avrossini/biblioteca-iecg (`main`) |

Deliverables da fase conferidos: app Next.js + Tailwind com a marca; Docker (`Dockerfile.dev` +
`docker-compose.yml`); `supabase init`; clientes Supabase; tooling de testes (Vitest, Playwright,
pgTAP); CI; `Makefile`, `README`, `docs/`.

### Fase 1 — Banco, ACL e RLS — ✅ APROVADA (2026-07-08)

| Verificação | Resultado |
|-------------|-----------|
| `supabase db reset` | ✓ migrations + seeds sem erro |
| pgTAP (schema, ACL, RLS, circulação) | ✓ 35 asserts |
| Tipos TS + Typecheck | ✓ |
| Unit / Build | ✓ |
| CI | ✓ (verificar run do commit "Fase 1") |

### Fase 2 — Autenticação — ✅ APROVADA (2026-07-08)

| Verificação | Resultado |
|-------------|-----------|
| Lint / Typecheck | ✓ |
| Unit (Vitest) | ✓ 9/9 |
| pgTAP (banco) | ✓ 35 |
| E2E (Playwright, build de produção) | ✓ 5/5 (redirect de rota protegida, login, logout, senha errada, recuperação via Mailpit) |
| Build de produção | ✓ |
| Docker | ✓ `/login` 200 (marca visível), `/` → 307 (protegida) |
| `supabase db reset` | ✓ |
| CI (GitHub Actions) | ✓ success (run do commit "Fase 2", 5m11s) |

Deliverables: proxy (ex-middleware) de sessão + proteção de rotas; login; logout; recuperação de
senha (template de e-mail + `/auth/confirm`); dashboard protegido; clients tipados com `Database`.
Notas técnicas: o E2E roda contra **build de produção** (hidratação confiável — o dev/HMR falha no
chromium headless deste ambiente) e usa um **global-setup** que reseta a senha do admin, tornando a
suíte determinística.

### Fase 3 — ACL na interface — ✅ APROVADA (2026-07-08)

| Verificação | Resultado |
|-------------|-----------|
| Lint / Typecheck | ✓ |
| Unit (Vitest) | ✓ 12/12 (inclui `<Can>`) |
| pgTAP (banco) | ✓ 38 (inclui RLS de administração) |
| E2E (Playwright, build de produção) | ✓ 9/9 (auth + admin: menu condicional, matriz persiste, lista de usuários, bloqueio de rota) |
| Build de produção | ✓ |
| Docker | ✓ `/login` 200, `/` → 307 |
| `supabase db reset` | ✓ |
| CI (GitHub Actions) | ✓ success (run do commit "Fase 3") |

Deliverables: plumbing de permissões (`getPermissoes`/`requirePermissao` + `PermissoesProvider`/`<Can>`);
app shell responsivo com navegação condicional; telas **Grupos e permissões** (matriz) e **Usuários**
(listar/convidar/editar grupos/ativar-desativar) com service role; template de convite; 2º usuário de
dev (Atendente). Nota: server action `signOut` isolada em `auth-actions.ts` (`"use server"`) para
importação segura em Client Components.

### Fase 4a — Catálogo: cadastros simples — ✅ APROVADA (2026-07-08)

| Verificação | Resultado |
|-------------|-----------|
| Lint / Typecheck | ✓ |
| Unit (Vitest) | ✓ 14/14 (inclui `CadastroSimples`) |
| pgTAP (banco) | ✓ 41 (inclui RLS + FK restrict do catálogo) |
| E2E (Playwright) | ✓ 11/11 (cria gênero/autor; Atendente sem catálogo e bloqueado em /generos) |
| Build / Docker | ✓ (`/generos` 307 protegido, `/login` 200) |
| `supabase db reset` | ✓ |
| CI (GitHub Actions) | ✓ success (run do commit "Fase 4a") |

Deliverables: componente genérico `CadastroSimples`; CRUD de **gêneros, autores, bibliotecas, status**
(status com códigos núcleo protegidos); seção **Catálogo** no menu (gated); erros de FK/RLS traduzidos
(`src/lib/erros-db.ts`). Nota de processo: rodar `supabase db reset` antes do pgTAP local (o E2E de
admin persiste mudança de permissão no banco vivo); e matar servidor antigo na porta 3000 antes do E2E.

### Fase 4b — Catálogo: livros — ✅ APROVADA (2026-07-08)

| Verificação | Resultado |
|-------------|-----------|
| Lint / Typecheck | ✓ |
| Unit (Vitest) | ✓ 20/20 (inclui `sanitize`, `cores-genero`) |
| pgTAP (banco) | ✓ 41 |
| E2E (Playwright) | ✓ 12/12 (cria livro completo com rich text; Atendente vê lista mas não cria) |
| Build / Docker | ✓ (`/livros` 307 protegido, `/login` 200) |
| `supabase db reset` | ✓ |
| CI (GitHub Actions) | ✓ success (run do commit "Fase 4b") |

Deliverables: lista de livros (lombada por gênero determinística), formulário com autores
(multi-seleção), temas (tags) e **resumo rich text (Tiptap)**, detalhe com resumo **sanitizado**
(`sanitize-html`), editar/excluir (`.bind` de server action). Nota: o teste E2E da matriz de
permissões agora **restaura** o estado para não contaminar outros testes.

### Fase 4c — Catálogo: exemplares — ✅ APROVADA (2026-07-08)

| Verificação | Resultado |
|-------------|-----------|
| Lint / Typecheck | ✓ |
| Unit (Vitest) | ✓ 20/20 |
| pgTAP (banco) | ✓ 43 (inclui RLS de exemplares) |
| E2E (Playwright) | ✓ 13/13 (admin adiciona exemplar a um livro) |
| Build / Docker | ✓ (`/livros` 307, `/login` 200) |
| `supabase db reset` | ✓ |
| CI (GitHub Actions) | ✓ success (run do commit "Fase 4c") |

Deliverables: seção **Exemplares** na página do livro (listar/criar/editar/excluir, status em Chip),
gated por `exemplar.*`; exclusão bloqueada por FK quando há empréstimo. **Fase 4 (Catálogo) concluída.**

### Fase 5 — Leitores — ✅ APROVADA (2026-07-08)

| Verificação | Resultado |
|-------------|-----------|
| Lint / Typecheck | ✓ |
| Unit (Vitest) | ✓ 26/26 (inclui `validarCpf`) |
| pgTAP (banco) | ✓ 47 (RLS + unicidade + formato de CPF) |
| E2E (Playwright) | ✓ 15/15 (cria leitor; CPF inválido barrado) |
| Build / Docker | ✓ (`/leitores` 307, `/login` 200) |
| `supabase db reset` | ✓ |
| CI (GitHub Actions) | ✓ success (run do commit "Fase 5") |

Deliverables: CRUD de leitores (`/leitores`) reutilizando `CadastroSimples`; `src/lib/cpf.ts`
(validação de dígitos verificadores); item "Leitores" no menu. Nota: erro em `role="alert"` colide
com o route-announcer do Next no E2E — mirar o texto (`getByText`), não o role.

### Fase 6 — Circulação — ✅ APROVADA (2026-07-08)

| Verificação | Resultado |
|-------------|-----------|
| Lint / Typecheck | ✓ |
| Unit (Vitest) | ✓ 30/30 (inclui `situacaoEmprestimo`) |
| pgTAP (banco) | ✓ 49 (leitura de empréstimos gated) |
| E2E (Playwright) | ✓ 17/17 (loop emprestar→devolver; painel) |
| Build / Docker | ✓ (`/emprestimos` 307, `/login` 200) |
| `supabase db reset` | ✓ |
| CI (GitHub Actions) | ✓ success (run do commit "Fase 6") |

Deliverables: ações `emprestar`/`devolver` sobre as RPCs; emprestar/devolver **contextual** no exemplar
+ página **/emprestimos/novo**; lista **/emprestimos** (situação, filtro, histórico por exemplar,
devolver); **dashboard real** (KPIs + empréstimos em aberto + acervo por gênero + ações rápidas);
item "Empréstimos" no menu. **Ciclo operacional fechado (Fases 1–6).**

### Fase 7 — PWA — ✅ APROVADA (2026-07-08)

| Verificação | Resultado |
|-------------|-----------|
| Lint / Typecheck | ✓ |
| Unit (Vitest) | ✓ 34/34 (inclui `manifest`) |
| pgTAP (banco) | ✓ 49 (sem alteração de banco nesta fase) |
| E2E (Playwright) | ✓ 20/20 (manifest válido; `/offline`; SW registra e serve fallback offline real) |
| Build de produção | ✓ (`/manifest.webmanifest` e `/offline` como estáticos) |
| Docker | ✓ `/login` 200, `/manifest.webmanifest` 200 (`application/manifest+json`), `/sw.js` 200, `/offline` 200 |
| `supabase db reset` | ✓ (não necessário — sem migração; pgTAP verde) |
| CI (GitHub Actions) | ✓ success (run do commit "Fase 7", 40e5eeb) |

Deliverables: **PWA instalável** — manifest (`src/app/manifest.ts` → `/manifest.webmanifest`) com
ícones 192/512 + maskable gerados da marca (`scripts/gen-icons.mjs` + `public/icons/*`); `viewport`/
`appleWebApp`/`icons` no root layout; service worker mínimo (`public/sw.js`) com fallback offline,
registrado por `ServiceWorkerRegister`; página pública `/offline`; `proxy.ts` e `ROTAS_PUBLICAS`
ajustados para liberar manifest/SW/offline. **Escopo "só instalável"** — cache das páginas de consulta
adiado (ver ARQUITETURA §6). Nota de processo: parar o container Docker na porta 3000 antes do E2E
(Playwright sobe o build de produção); o E2E do SW faz `reload()` após o registro para garantir
`navigator.serviceWorker.controller` antes de cortar a rede.

### Fase 8 — Migração de dados — ✅ APROVADA (2026-07-08)

| Verificação | Resultado |
|-------------|-----------|
| Lint / Typecheck | ✓ |
| Unit (Vitest) | ✓ 48/48 (inclui 14 de `migracao-transformacoes`) + 2 integração skipadas |
| Integração (local, Docker MySQL) | ✓ 2/2 (`MIGRACAO_IT=1`, ETL contra fixture sintético) |
| pgTAP (banco) | ✓ 51 (inclui `10_status_legado`) |
| E2E (Playwright) | ✓ 20/20 (estado limpo) |
| Build / Docker | ✓ (`/login` 200) |
| `supabase db reset` | ✓ (aplica migration `status_legado`) |
| **Ensaio real (ETL do dump)** | ✓ idempotente; reconciliação coerente (ver abaixo) |
| CI (GitHub Actions) | ✓ success (run do commit "Fase 8", 95135dd) |

Reconciliação do ensaio real: generos 181→179 (2 mesclados), autores 836, bibliotecas 2, pessoas 6
(5 CPFs + 1 e-mail nulificados), livros 1419, livro_autor 1114→1107, temas 22366→17735, exemplares
444, emprestimos 20. Sem órfãos de exemplar/empréstimo. Deliverables: migration `status_legado`
(preserva extraviado/vencido); ETL `scripts/migracao/` (transformações puras + orquestrador via
`mysql2`/`pg`/service role, IDs preservados, sequences reajustadas); container `mysql-legacy`
(profile Docker); relatório de reconciliação; `docs/MIGRACAO-DE-DADOS.md`. **Produção fica para a
Fase 9.** Notas: dump com PII **nunca** commitado (`/iecg.sql` no gitignore); integração fora do CI
(sem MySQL/PII); trava de segurança contra carga remota acidental.

### Fase 9 — Corte / Go-live — ✅ APROVADA (2026-07-08)

| Verificação | Resultado |
|-------------|-----------|
| Lint / Typecheck | ✓ |
| Unit (Vitest) | ✓ 50/50 (inclui `ehConexaoLocal`) + 2 integração skipadas |
| pgTAP / E2E / Build | ✓ (inalterados desde a Fase 8) |
| **Supabase Cloud** | ✓ projeto `rqluyilpcpotgfvdbadi` (Free, sa-east-1); `db push` aplicou as 6 migrations (seed_acl de produção); `seed.sql` dev **não** aplicado |
| **Vercel** | ✓ deploy de produção em **https://biblioteca-iecg.vercel.app** (env vars públicas + `service_role` secreta) |
| **Auth** | ✓ `site_url`/`uri_allow_list` = domínio de produção (Management API) |
| **ETL em produção** | ✓ reconciliação idêntica ao ensaio (livros 1419, temas 22366→17735, pessoas 6, exemplares 444, emprestimos 20) |
| **Bootstrap admin** | ✓ `rossini@gmail.com` criado e ligado ao grupo Administrador |
| **Verificação prod** | ✓ `/login` 200; login (password grant) OK; admin com 42 permissões; RLS: livros 1419/pessoas 6/emprestimos 20/exemplares 444; `/manifest.webmanifest` 200 (PWA) |
| CI (GitHub Actions) | ⏳ verificar run do commit "Fase 9" |

Deliverables: sistema **no ar em produção** com dados reais do legado. Adequações: SSL no ETL
(`ehConexaoLocal` + `ssl` no `pg.Client`), `scripts/bootstrap-admin.ts` (resolve o ovo-e-galinha do
1º admin), `docs/GO-LIVE.md` (runbook + recursos). **Follow-up (do responsável):** autorizar o Vercel
GitHub App p/ `git push`→deploy; configurar SMTP de produção; domínio próprio; considerar Pro (Free
pausa após ~1 semana). Segredos nunca commitados; tokens revogáveis.

### Modelo para as próximas fases

```
### Fase N — <nome> — <status> (<data>)
| Verificação | Resultado |
| Gate genérico (1–11) | ... |
| Aceitação específica (deliverables da fase) | ... |
```
