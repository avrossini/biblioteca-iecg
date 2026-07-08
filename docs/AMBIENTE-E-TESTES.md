# Ambiente Local (Docker) e Estratégia de Testes (TDD)

> Complementa [ARQUITETURA.md](./ARQUITETURA.md) e [PLANO-DESENVOLVIMENTO.md](./PLANO-DESENVOLVIMENTO.md).
> Define como rodar tudo localmente em contêineres e como o TDD guia o desenvolvimento.

---

## 1. Ambiente local 100% em Docker

**Princípio:** nada é instalado direto no host além do **Docker Engine** (já disponível na máquina). Aplicação, banco e serviços do Supabase rodam todos em contêineres, garantindo **paridade dev/prod** e "sobe numa linha só".

### 1.1. Componentes conteinerizados

| Serviço | Contêiner | Papel |
|---------|-----------|-------|
| **App** | Node (Next.js em modo dev) | `next dev` com hot-reload via *bind mount* do código. |
| **Supabase** | Stack da Supabase CLI | Postgres, Auth (GoTrue), Storage, Realtime, PostgREST e Studio — todos em Docker, orquestrados pela CLI (`supabase start`). |

> A **Supabase CLI já sobe seus serviços dentro do Docker**. Portanto o "banco local" nunca é instalado no host — é o Postgres do contêiner do Supabase.

### 1.2. Arquivos que entram no repositório

```
Dockerfile.dev            # imagem de desenvolvimento do app (Node)
docker-compose.yml        # serviço "web" (app) + rede
.dockerignore
supabase/                 # gerado por `supabase init` (config, migrations, seeds, tests)
Makefile                  # atalhos: make up / make down / make test
```

### 1.3. Como o app conversa com o Supabase

A Supabase CLI expõe portas no host (API em `54321`, Postgres em `54322`, Studio em `54323`). O contêiner do app alcança esses serviços por **`host.docker.internal`**:

```
NEXT_PUBLIC_SUPABASE_URL=http://host.docker.internal:54321
# Postgres (scripts/migração):  postgresql://postgres:postgres@host.docker.internal:54322/postgres
```

### 1.4. Subir o ambiente (fluxo)

```bash
supabase start        # sobe os contêineres do Supabase (Docker)
docker compose up     # sobe o contêiner do app (Next.js dev)
# ou, com o Makefile:
make up               # faz os dois
```

- `supabase db reset` recria o banco a partir das migrations + seeds (base limpa e reprodutível).
- Studio (UI do banco) fica em `http://localhost:54323`.

### 1.5. Produção

Em produção **não** usamos os contêineres locais: o app roda na **Vercel** e o banco/auth no **Supabase Cloud**. O Docker é exclusivamente para desenvolvimento e para a esteira de testes (CI).

---

## 2. Estratégia de testes — TDD

**Método:** *red → green → refactor*. Para cada regra de negócio ou funcionalidade nova, escrevemos **o teste antes** da implementação. Nenhuma funcionalidade entra sem teste que a cubra; nenhum bug é corrigido sem antes um teste que o reproduza.

### 2.1. Pirâmide de testes

| Camada | Ferramenta | O que cobre |
|--------|-----------|-------------|
| **Banco / RLS** | **pgTAP** (`supabase test db`) | As políticas de acesso (ACL). Ex.: um usuário só do grupo *Atendente* **não** consegue `INSERT` em `livros`; um *Bibliotecário* consegue; ninguém lê dados sem permissão. É a rede de segurança do controle de acesso. |
| **Integração / dados** | **Vitest** contra o Postgres de teste (contêiner) | Regras de negócio no servidor. Ex.: só empresta exemplar `disponivel`; devolução volta status para `disponivel`; não cria segundo empréstimo em aberto para o mesmo exemplar. |
| **Componentes** | **Vitest + React Testing Library** | Componentes de UI, incl. o `<Can>` (esconde ação sem permissão), formulários e validações. |
| **Ponta a ponta (E2E)** | **Playwright** | Fluxos reais no navegador: login, emprestar → devolver, e um usuário sem permissão não vê o menu/rota. |

### 2.2. Por que RLS entra em teste (pgTAP)

O ACL é o requisito mais sensível. Como a proteção real vive no banco (RLS), ela é testada **no banco**: cada política ganha testes que provam o "pode" e o "não pode" por grupo. Assim, uma mudança futura numa policy que abra acesso indevido **quebra o CI** antes de chegar em produção.

### 2.3. Integração contínua (CI)

Em cada Pull Request, o GitHub Actions:

1. Sobe o **Supabase local** (Docker) e aplica migrations + seeds.
2. Roda **pgTAP** (RLS/banco), **Vitest** (integração + componentes) e **Playwright** (E2E).
3. **Bloqueia o merge** se algo estiver vermelho.

O mesmo `docker`/`supabase` da máquina local é o que roda no CI — sem "na minha máquina funciona".

### 2.4. TDD no roadmap

Cada fase do [PLANO-DESENVOLVIMENTO.md](./PLANO-DESENVOLVIMENTO.md) passa a ser **test-first**:

- Definir os **testes de aceitação** da fase (o que significa "pronto").
- Escrever os testes (vermelho) → implementar (verde) → refatorar.
- Só considera a fase concluída com a suíte verde no CI.

Exemplos de "primeiro teste" por fase:
- **Circulação:** teste que emprestar um exemplar já emprestado é rejeitado (antes de existir a tela).
- **ACL:** teste pgTAP de que *Atendente* não insere livro (antes de escrever a policy).
- **Migração:** teste de reconciliação (contagem origem × destino) sobre um dump de amostra.

### 2.5. Estrutura de testes no repositório

```
/tests
  /unit          # Vitest (componentes, utilidades)
  /integration   # Vitest contra Postgres de teste
  /e2e           # Playwright
/supabase
  /tests         # pgTAP (RLS e regras no banco)
```

---

## 3. Impacto nas decisões

- Ferramentas adicionadas à stack: **Vitest, React Testing Library, Playwright, pgTAP** e **Docker/Docker Compose** para o ambiente local.
- A **Fase 0** do roadmap passa a incluir: `Dockerfile.dev`, `docker-compose.yml`, `supabase init` e o esqueleto de testes + CI rodando (mesmo que com um teste trivial "verde") antes de seguir.
