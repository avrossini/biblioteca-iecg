# Arquitetura — Biblioteca Rossini Benitez (v2)

> Reconstrução do sistema em **Next.js + Supabase**, deploy na **Vercel**.
> Este documento define stack, modelo de dados (domínio + ACL), mapa de permissões, estratégia PWA e estrutura do projeto.
> Baseia-se nos processos descritos em [PROCESSOS-DE-NEGOCIO.md](./PROCESSOS-DE-NEGOCIO.md).

---

## 1. Stack e deploy

| Camada | Escolha | Observação |
|--------|---------|------------|
| Frontend/Backend | **Next.js (App Router, React, TypeScript)** | Full-stack: Server Components + Server Actions / Route Handlers. |
| Banco de dados | **Supabase Postgres** | Postgres gerenciado. |
| Autenticação | **Supabase Auth** (`auth.users`) | E-mail/senha + recuperação. |
| Autorização | **ACL próprio + Row Level Security (RLS)** | Ver seção 4. |
| Estilo | **Tailwind CSS** (+ shadcn/ui sugerido) | Mobile-first, responsivo. |
| Dados no cliente | **TanStack Query** (React Query) | Cache + suporte a consulta offline. |
| PWA | **Serwist** (service worker) + manifest | Instalável + consulta offline. |
| Testes | **Vitest + React Testing Library + Playwright + pgTAP** | TDD em todas as camadas. Ver [AMBIENTE-E-TESTES.md](./AMBIENTE-E-TESTES.md). |
| Ambiente local | **Docker + Docker Compose** (app) + **Supabase CLI** (Docker) | Tudo conteinerizado; nada instalado no host além do Docker. |
| Hospedagem | **Vercel (Hobby)** | `git push` na `main` → deploy; PRs → preview. |

**Ressalvas de tier gratuito:** Vercel Hobby é para uso não-comercial (produção comercial → Pro ~US$20/mês); projetos gratuitos do Supabase pausam após ~1 semana de inatividade.

---

## 2. Princípios da reconstrução

1. **Segurança no banco, não só na tela.** Toda regra de acesso é garantida por **RLS no Postgres** — mesmo que alguém chame a API diretamente. A UI apenas espelha isso (esconde o que o usuário não pode).
2. **Sem "números mágicos".** O status do exemplar é referenciado por um **código estável** (`disponivel`, `emprestado`), nunca por `id` fixo (corrige o problema atual do `status_id = 1/2` hardcoded).
3. **Integridade referencial explícita.** Chaves estrangeiras com política de exclusão definida (`restrict` / `set null` / `cascade`) — corrige as exclusões "órfãs" do sistema atual.
4. **Cada tela/ação = uma funcionalidade nomeada** no ACL, derivada das rotas atuais.
5. **TDD e ambiente conteinerizado.** Desenvolvimento test-first (inclusive testes de RLS) e ambiente local 100% em Docker — ver [AMBIENTE-E-TESTES.md](./AMBIENTE-E-TESTES.md).

---

## 3. Modelo de dados — Domínio

Nomes de tabela em `snake_case` plural (convenção Postgres/Supabase). Todas com `id uuid default gen_random_uuid()`, `created_at`, `updated_at`.

### 3.1. Tabelas

```
generos        (id, nome)
autores        (id, nome, biografia)
bibliotecas    (id, nome)
status         (id, codigo UNIQUE, nome)         -- codigo: 'disponivel' | 'emprestado' | ...
pessoas        (id, nome, email, telefone, cpf)
livros         (id, codigo_livro, nome, resumo, genero_id → generos)
temas          (id, livro_id → livros, nome)
livro_autor    (livro_id → livros, autor_id → autores)   -- N:N
exemplares     (id, livro_id → livros, biblioteca_id → bibliotecas,
                status_id → status, data_aquisicao)
emprestimos    (id, exemplar_id → exemplares, pessoa_id → pessoas,
                data_emprestimo, data_prevista_devolucao?, data_devolucao NULL)
```

### 3.2. Relacionamentos

- `livros` N:N `autores` (via `livro_autor`)
- `livros` 1:N `temas`
- `livros` N:1 `generos`
- `livros` 1:N `exemplares`
- `exemplares` N:1 `bibliotecas`, N:1 `status`
- `exemplares` 1:N `emprestimos`
- `emprestimos` N:1 `pessoas`

### 3.3. Políticas de exclusão (decisões a confirmar)

| Ação | Regra proposta |
|------|----------------|
| Excluir **livro** com exemplares | Bloquear (`on delete restrict`). |
| Excluir **autor** vinculado a livros | Bloquear. |
| Excluir **gênero** usado por livros | Bloquear (hoje exclui e deixa órfão). |
| Excluir **biblioteca** com exemplares | Bloquear. |
| Excluir **status** em uso | Bloquear. |
| Excluir **exemplar** emprestado / com histórico | Bloquear se houver empréstimo em aberto. |
| Excluir **pessoa** com empréstimo em aberto | Bloquear. |

### 3.4. Melhorias propostas sobre o as-is (a confirmar)

- **`data_prevista_devolucao`** no empréstimo → habilita controle de atraso no dashboard.
- **Validação ao emprestar**: só permite se o exemplar estiver `disponivel` (hoje não valida).
- **Unicidade**: avaliar `cpf` único em `pessoas` e `codigo_livro` único em `livros`.
- **Status como código estável** (item 2 dos princípios).

---

### 3.5. Restrições confirmadas (2026-07-08)

Decididas com o cliente; regem o schema de destino da migração.

| Item | Decisão |
|------|---------|
| **IDs (domínio)** | `bigint`, preservando os IDs do legado (FKs batem sem remapeamento). |
| **Senhas** | Não migradas; contas recriadas no Supabase Auth com **reset por e-mail** (opção B). |
| **autores.nome** | Obrigatório, **não único** (permite homônimos). |
| **pessoas.cpf** | Opcional, **único quando preenchido**, com validação de formato. |
| **pessoas.email** | Opcional, **único quando preenchido**. |
| **pessoas.telefone** | Opcional, sem restrição. |
| **livros.codigo_livro** | **Texto**, opcional, sem unicidade. |
| **livros.genero_id** | **Obrigatório**. |
| **livros.nome** | Obrigatório, não único. |
| **temas** | `nome` obrigatório, **único por livro** (`UNIQUE(livro_id, nome)`). |
| **exemplares.numero_tombo** | Campo novo, opcional, sem unicidade. |
| **exemplares.data_aquisicao** | Opcional. |
| **emprestimos** | No máx. **1 em aberto por exemplar** (`UNIQUE(exemplar_id) WHERE data_devolucao IS NULL`); `data_prevista_devolucao` obrigatória. |
| **status** | Referenciado por `codigo` estável (`disponivel`/`emprestado`), nunca por id fixo. |
| **Prazo de devolução** | Configurável por ambiente: `NEXT_PUBLIC_PRAZO_DEVOLUCAO_DIAS` (default 14). |

## 4. Modelo de dados — ACL

Modelo **RBAC multi-grupo** (usuário pode ter vários grupos; permissões se somam), conforme decidido.

```
auth.users (Supabase)
     │ 1:N
usuario_grupo (user_id → auth.users, grupo_id → grupos)
     │
grupos (id, nome, descricao)
     │ N:N
grupo_funcionalidade (grupo_id → grupos, funcionalidade_id → funcionalidades)
     │
funcionalidades (id, codigo UNIQUE, nome, categoria)   -- codigo: 'livro.create' etc.
```

- **funcionalidades** = catálogo de ações do sistema (o inventário sai das rotas atuais — ver seção 5).
- **grupos** = papéis (Administrador, Bibliotecário, Atendente…).
- **usuario_grupo** = liga o usuário autenticado aos grupos.

### 4.1. Função de verificação (base do RLS)

```sql
create or replace function public.tem_permissao(p_codigo text)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1
    from usuario_grupo ug
    join grupo_funcionalidade gf on gf.grupo_id = ug.grupo_id
    join funcionalidades f       on f.id = gf.funcionalidade_id
    where ug.user_id = auth.uid()
      and f.codigo   = p_codigo
  );
$$;
```

### 4.2. Exemplo de RLS numa tabela de domínio

```sql
alter table livros enable row level security;

create policy "ler livros"     on livros for select
  using ( tem_permissao('livro.index') );
create policy "criar livros"   on livros for insert
  with check ( tem_permissao('livro.create') );
create policy "editar livros"  on livros for update
  using ( tem_permissao('livro.update') );
create policy "excluir livros" on livros for delete
  using ( tem_permissao('livro.destroy') );
```

O mesmo padrão se repete para cada tabela. Assim a autorização é **garantida pelo banco**, independente do frontend.

### 4.3. Na aplicação (Next.js)

- Um helper carrega as permissões do usuário logado uma vez (ex.: `getPermissoes()`), guardadas no contexto.
- Componente/guarda `<Can code="livro.create">…</Can>` esconde botões e itens de menu.
- Rotas de admin (`/admin/*`) exigem permissões de gestão de usuários/grupos.

---

## 5. Mapa de Funcionalidades → Permissões

Derivado das rotas do sistema atual. Cada `codigo` vira uma linha em `funcionalidades`.

| Categoria | Código | Descrição |
|-----------|--------|-----------|
| **Dashboard** | `home.index` | Ver painel inicial |
| **Livros** | `livro.index` | Listar livros |
| | `livro.show` | Ver detalhes do livro |
| | `livro.create` | Cadastrar livro |
| | `livro.update` | Editar livro |
| | `livro.destroy` | Excluir livro |
| **Exemplares** | `exemplar.create` | Cadastrar exemplar |
| | `exemplar.update` | Editar exemplar |
| | `exemplar.destroy` | Excluir exemplar |
| **Autores** | `autor.index` / `create` / `update` / `destroy` | CRUD de autores |
| **Gêneros** | `genero.index` / `create` / `update` / `destroy` | CRUD de gêneros |
| **Bibliotecas** | `biblioteca.index` / `create` / `update` / `destroy` | CRUD de bibliotecas |
| **Status** | `status.index` / `create` / `update` / `destroy` | CRUD de status |
| **Pessoas** | `pessoa.index` / `create` / `update` / `destroy` | CRUD de leitores |
| **Circulação** | `emprestimo.index` | Listar empréstimos |
| | `emprestimo.emprestar` | Emprestar exemplar |
| | `emprestimo.devolver` | Registrar devolução |
| | `emprestimo.historico` | Ver histórico do exemplar |
| **Administração** | `usuario.index` / `create` / `update` / `destroy` | Gestão de usuários |
| | `grupo.index` / `create` / `update` / `destroy` | Gestão de grupos |
| | `grupo.permissoes` | Atribuir funcionalidades a grupos |

### Grupos-semente sugeridos

| Grupo | Permissões |
|-------|-----------|
| **Administrador** | Todas. |
| **Bibliotecário** | Catálogo (livros/exemplares/autores/gêneros/bibliotecas/status) + circulação + pessoas. |
| **Atendente** | `home.index`, `livro.index/show`, `pessoa.*`, `emprestimo.*`. |

---

## 6. PWA — instalável + consulta offline

1. **Manifest** (`app/manifest.ts`): nome, ícones (192/512), `display: "standalone"`, cores → app instalável na tela inicial.
2. **Service worker** (via **Serwist**): faz cache do "app shell" (layout, CSS, JS) para abertura rápida e funcionamento offline da casca.
3. **Consulta offline dos dados**: TanStack Query com persistência (IndexedDB) — as listagens já visitadas (livros, exemplares, pessoas) ficam disponíveis sem conexão.
4. **Escrita exige conexão** (decisão atual): emprestar/devolver só online. Um banner indica estado offline e desabilita ações de escrita.
5. **HTTPS**: garantido pela Vercel.

---

## 7. Estrutura do projeto (Next.js App Router)

```
/app
  /(auth)
    login/page.tsx
    esqueci-senha/page.tsx
  /(app)
    layout.tsx              # shell responsivo: nav/drawer + guarda de sessão
    dashboard/page.tsx
    livros/                 # lista, [id] (detalhe), novo, [id]/editar
    exemplares/
    autores/  generos/  bibliotecas/  status/  pessoas/
    emprestimos/            # lista, emprestar, devolver, historico
    admin/
      usuarios/  grupos/  funcionalidades/
  manifest.ts
/components                 # UI + <Can>, tabelas responsivas, formulários
/lib
  supabase/
    client.ts               # browser client
    server.ts               # server client (cookies / SSR)
  acl.ts                    # getPermissoes(), helpers
/supabase
  /migrations               # SQL versionado (schema + RLS + seeds)
  /tests                    # pgTAP — testes de RLS e regras no banco
/tests
  /unit                     # Vitest (componentes, utilidades)
  /integration              # Vitest contra Postgres de teste
  /e2e                      # Playwright
/public
  /icons                    # ícones PWA
Dockerfile.dev              # imagem de dev do app (Node)
docker-compose.yml          # serviço do app + rede local
Makefile                    # make up / down / test
middleware.ts               # sessão + proteção de rotas por permissão
```

### Fluxo de autenticação

1. Login via Supabase Auth (`signInWithPassword`), sessão em cookies (`@supabase/ssr`).
2. `middleware.ts` valida a sessão e redireciona não-autenticados para `/login`.
3. Server Components leem dados via client Supabase server-side (RLS aplica automaticamente).
4. Mutações via **Server Actions** / Route Handlers, também sob RLS.

---

## 8. Roadmap de implementação (proposto)

1. **Fundação**: projeto Next.js + Tailwind + Supabase (client/server) + deploy Vercel "hello world".
2. **Banco**: migrations do domínio + ACL + função `tem_permissao` + seeds (status, grupos, funcionalidades).
3. **Auth**: login, recuperação de senha, middleware de sessão.
4. **ACL na UI**: `getPermissoes`, `<Can>`, navegação condicional.
5. **Catálogo**: CRUD de gêneros, autores, bibliotecas, status, livros (+ temas/autores), exemplares.
6. **Pessoas**.
7. **Circulação**: emprestar, devolver, histórico, dashboard.
8. **Administração**: usuários, grupos, atribuição de funcionalidades.
9. **PWA**: manifest, service worker, consulta offline.
10. **Migração de dados** do sistema atual (se aplicável).

---

## 9. Decisões em aberto

- [x] Restrições de campo — **confirmadas** (ver §3.5).
- [x] IDs (`bigint`) e senhas (reset por e-mail) — **confirmados**.
- [x] Migração dos dados legados — **necessária** (script ETL; ver PLANO §3).
- [x] Layout visual / identidade — **validado por mockup** (tema claro, azul-ardósia, Georgia, lombada por gênero).
- [ ] Políticas de exclusão (§3.3) — propostas; confirmar caso a caso na Fase 4/6.
- [ ] Idioma/i18n e fuso horário para as datas.
- [ ] Disponibilizar o **dump** do MySQL atual para a migração.
```

