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

### Modelo para as próximas fases

```
### Fase N — <nome> — <status> (<data>)
| Verificação | Resultado |
| Gate genérico (1–11) | ... |
| Aceitação específica (deliverables da fase) | ... |
```
