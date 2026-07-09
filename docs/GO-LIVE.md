# Go-live (Fase 9) — Biblioteca IECG

Runbook do corte para produção: banco/auth no **Supabase Cloud** (Free, `sa-east-1`) e app na
**Vercel**, com os dados do legado carregados e um admin pronto para logar. **Nenhum segredo neste
arquivo** (tokens, chaves, senhas, `DATABASE_URL`) — eles vivem na Vercel/Supabase e nos registros do
responsável.

## Pré-requisitos (do responsável)

- **Personal Access Token do Supabase** (dashboard → Account → Access Tokens) → `SUPABASE_ACCESS_TOKEN`.
- **Token da Vercel** (Account Settings → Tokens) → `VERCEL_TOKEN`.
- Senhas fortes do banco e do admin são **geradas no corte** e guardadas pelo responsável.

Tokens podem ser **revogados** após o corte.

## Passos

### A. Supabase Cloud
1. `SUPABASE_ACCESS_TOKEN=… npx supabase orgs list` → org id.
2. `npx supabase projects create biblioteca-iecg --org-id <id> --region sa-east-1 --db-password <PW>`
   → project ref; aguardar `ACTIVE_HEALTHY`.
3. `npx supabase link --project-ref <ref>` → `npx supabase db push` (aplica migrations + seed de
   produção `seed_acl`; **não** roda `seed.sql` de dev).
4. `npx supabase projects api-keys --project-ref <ref>` → `anon`, `service_role`. URL:
   `https://<ref>.supabase.co`.
5. Management API `PATCH /v1/projects/<ref>/config/auth` (Bearer = access token): `site_url` = domínio
   Vercel e `uri_allow_list` = `https://<dominio>,https://<dominio>/**` (para os links de
   e-mail/`/auth/confirm` quando o SMTP for ativado).

### B. Vercel
1. Projeto ligado ao repo `avrossini/biblioteca-iecg` (Git integration → `git push` na main deploya).
2. Env de produção: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `NEXT_PUBLIC_PRAZO_DEVOLUCAO_DIAS=14` (públicas) e `SUPABASE_SERVICE_ROLE_KEY` (secreta).
3. `vercel deploy --prod` → domínio de produção. Voltar ao A5 e gravar o domínio no Auth.

### C. Carga de dados (ETL → produção)
1. `npm run migrate:up` (MySQL legado local a partir de `iecg.sql`).
2. `MIGRACAO_PERMITIR_REMOTO=1 DATABASE_URL="postgresql://postgres:<PW>@db.<ref>.supabase.co:5432/postgres?sslmode=require" npm run migrate`
   → conferir o relatório de reconciliação. Fallback: session pooler (ver `.env.example`).

### D. Bootstrap do admin
`ADMIN_EMAIL=rossini@gmail.com ADMIN_PASSWORD=<PW> NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co SUPABASE_SERVICE_ROLE_KEY=<key> npm run bootstrap:admin`

### E. Verificação
Login do admin → painel com números reais; navegar catálogo/leitores/empréstimos; emprestar→devolver;
PWA instalável; rota protegida redireciona; `git push` dispara deploy.

## Recursos criados (corte de 2026-07-08 — sem segredos)

| Item | Valor |
|---|---|
| Supabase project ref | `rqluyilpcpotgfvdbadi` |
| Supabase URL | `https://rqluyilpcpotgfvdbadi.supabase.co` |
| Região / plano | `sa-east-1` (São Paulo) / Free |
| Org Supabase | `avrossini's Org` (`prfxhhuildtuqavrkias`) |
| App em produção | **https://biblioteca-iecg.vercel.app** |
| Projeto Vercel | `avrossini1/biblioteca-iecg` |
| Admin inicial | `rossini@gmail.com` (senha entregue ao responsável; trocar após 1º login) |
| Reconciliação (prod) | generos 181→179, autores 836, bibliotecas 2, pessoas 6, livros 1419, livro_autor 1114→1107, temas 22366→17735, exemplares 444, emprestimos 20 |

Segredos (senha do banco, `service_role`, senha do admin, tokens) **não** ficam aqui — foram
entregues ao responsável e cadastrados na Vercel/Supabase.

## Follow-up (pós-corte)

- **`git push` → deploy automático**: a conexão Vercel↔GitHub exige autorizar o **Vercel GitHub App**
  no repositório `avrossini/biblioteca-iecg` (passo de navegador do dono). Depois disso, cada push na
  `main` deploya. Enquanto isso, deploy manual: `vercel deploy --prod --scope avrossini1`.
- **SMTP de produção** (convite/recuperação por e-mail) → dashboard Supabase (Auth → SMTP). O fluxo de
  convite (`inviteUserByEmail` → `/auth/confirm` → `/redefinir-senha`) já está pronto e o `site_url` já
  aponta para o domínio de produção.
- **Domínio próprio** (atualizar `site_url`/`uri_allow_list`).
- **Upgrade para Pro** se o uso for contínuo (o Free pausa após ~1 semana e não tem backup automático).
- Revogar os tokens Supabase/Vercel usados no corte.
