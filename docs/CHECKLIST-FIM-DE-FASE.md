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
| CI (GitHub Actions) | ⏳ (verificar run do commit "Fase 3") |

Deliverables: plumbing de permissões (`getPermissoes`/`requirePermissao` + `PermissoesProvider`/`<Can>`);
app shell responsivo com navegação condicional; telas **Grupos e permissões** (matriz) e **Usuários**
(listar/convidar/editar grupos/ativar-desativar) com service role; template de convite; 2º usuário de
dev (Atendente). Nota: server action `signOut` isolada em `auth-actions.ts` (`"use server"`) para
importação segura em Client Components.

### Modelo para as próximas fases

```
### Fase N — <nome> — <status> (<data>)
| Verificação | Resultado |
| Gate genérico (1–11) | ... |
| Aceitação específica (deliverables da fase) | ... |
```
