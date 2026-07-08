# Biblioteca IECG

Sistema de gestão de biblioteca (v2) — catálogo, acervo e circulação, com controle
de acesso por grupos (ACL) e PWA. Reescrita do sistema legado (Laravel) em
**Next.js + Supabase**.

> Documentação completa em [`docs/`](./docs): processos de negócio, arquitetura,
> plano de desenvolvimento, ambiente/testes e o [padrão visual](./docs/PADRAO-VISUAL.md).

## Stack

- **Next.js** (App Router, TypeScript) + **Tailwind CSS**
- **Supabase** (Postgres + Auth + RLS)
- **Testes (TDD):** Vitest + React Testing Library, Playwright (E2E), pgTAP (RLS)
- **Ambiente local:** Docker (app) + Supabase CLI (Docker)
- **Deploy:** Vercel (`git push` na `main`)

## Pré-requisitos

- Docker Engine em execução
- Node 24+ (para comandos `npm`/`npx` no host)

## Rodando localmente

```bash
cp .env.example .env.local        # preencha com os valores de `npx supabase start`
npx supabase start                # sobe Postgres/Auth/Studio (Docker)
docker compose up                 # sobe o app (http://localhost:3000)
# ou, com make:
make up
```

- Studio (UI do banco): http://localhost:54323
- `npx supabase db reset` recria o banco a partir das migrations + seeds.
- `npm run db:types` regenera `src/lib/database.types.ts` a partir do schema.
- **Admin de desenvolvimento** (criado pelo seed local, só em dev): `rossini@gmail.com` / `biblioteca123`.

## Testes

```bash
npm run test:unit     # Vitest (componentes + regras de negócio)
npm run test:e2e      # Playwright (fluxos no navegador)
npm run test:db       # pgTAP (RLS/ACL) — requer Supabase no ar
make test             # unit + db
```

Os testes E2E rodam contra um **build de produção** (`next build && next start`, iniciado
automaticamente pelo Playwright) e usam um _global-setup_ que normaliza a senha do admin.

O desenvolvimento é **test-first**: cada regra/funcionalidade nasce de um teste
que falha. O CI (GitHub Actions) roda toda a suíte e barra merge com teste vermelho.

## Estrutura

```
src/app         Rotas (App Router)
src/components  Componentes de UI
src/lib         Regras de negócio, clientes Supabase
supabase        Config, migrations, seeds e testes (pgTAP)
tests           unit / integration (Vitest) e e2e (Playwright)
docs            Documentação do projeto
```
