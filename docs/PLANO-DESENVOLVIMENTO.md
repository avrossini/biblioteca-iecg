# Plano de Desenvolvimento — Biblioteca Rossini Benitez (v2)

> Reconstrução em **Next.js + Supabase** num **repositório novo e limpo**, sem qualquer alteração no projeto Laravel atual.
> Complementa [ARQUITETURA.md](./ARQUITETURA.md) e [PROCESSOS-DE-NEGOCIO.md](./PROCESSOS-DE-NEGOCIO.md).

---

## 1. Princípios

1. **Não tocar no legado.** O repositório atual (Laravel/MySQL) continua intacto e em produção até o corte final. A v2 nasce em outro repositório.
2. **Infra como código.** Schema, políticas de acesso (RLS) e seeds versionados em migrations no próprio repo — nada configurado "na mão" no painel.
3. **Deploy simples.** `git push` na `main` → build e deploy automáticos na Vercel; cada Pull Request gera uma URL de preview.
4. **Migração ensaiada.** A carga de dados do sistema atual é um script reexecutável, testado em staging antes do corte.
5. **Ambiente local em Docker.** App, banco e serviços rodam em contêineres; nada instalado no host além do Docker. Ver [AMBIENTE-E-TESTES.md](./AMBIENTE-E-TESTES.md).
6. **Desenvolvimento test-first (TDD).** Cada regra/funcionalidade nasce de um teste que falha; CI barra merge com suíte vermelha. Ver [AMBIENTE-E-TESTES.md](./AMBIENTE-E-TESTES.md).
7. **Gate de fim de fase.** Nenhuma fase fecha sem passar pela checagem geral (testes + verificações) e ter o resultado registrado. Ver [CHECKLIST-FIM-DE-FASE.md](./CHECKLIST-FIM-DE-FASE.md).

---

## 2. Repositório novo

- **Nome sugerido:** `biblioteca-rossini-v2` (repo Git independente, do zero).
- **Bootstrap:**
  ```bash
  npx create-next-app@latest biblioteca-rossini-v2 \
    --typescript --app --tailwind --eslint --src-dir --import-alias "@/*"
  ```
- **Estrutura** conforme seção 7 do [ARQUITETURA.md](./ARQUITETURA.md).
- **Ferramentas de banco:** Supabase CLI (`supabase init`, `supabase db push`, `supabase migration new`).
- **Qualidade:** ESLint + Prettier, Husky (pre-commit), GitHub Actions para lint/build em PR.

### Ambientes

| Ambiente | Onde | Uso |
|----------|------|-----|
| **Local** | **Tudo em Docker**: app (Docker Compose) + Supabase CLI (Docker) | Desenvolvimento. Ver [AMBIENTE-E-TESTES.md](./AMBIENTE-E-TESTES.md). |
| **Staging** | Projeto Supabase "staging" + preview Vercel | Testes e **ensaio da migração**. |
| **Produção** | Projeto Supabase "prod" + Vercel prod | Corte final. |

---

## 3. Estratégia de migração de dados (MySQL → Supabase/Postgres)

> **Resumo:** não fazemos "cópia idêntica" do MySQL. Criamos o **schema novo** (já corrigido) no Postgres e rodamos um **script de ETL** (Extrair → Transformar → Carregar) que lê o banco atual e grava no novo, ajustando o que mudou.

### 3.1. Por que ETL e não uma conversão automática

Ferramentas como **pgloader** fazem um espelho MySQL→Postgres 1:1 — úteis se o schema fosse igual. Mas o nosso schema **muda de propósito** (status por código estável, integridade referencial, ACL novo, campos como `data_prevista_devolucao`). Por isso um **script de migração próprio** é mais adequado: ele transforma os dados enquanto carrega. (pgloader pode ser usado, opcionalmente, só para uma cópia bruta de conferência.)

### 3.2. Decisão de chaves (importante para a migração)

Para tornar a migração **determinística e reversível**, a recomendação é **preservar os IDs numéricos** do sistema atual nas tabelas de domínio (usar `bigint` como PK, inserindo o mesmo `id` de origem, e depois ajustar as *sequences*). Isso elimina a etapa de "remapear IDs" e mantém as chaves estrangeiras batendo automaticamente.

> Isso ajusta a escolha de `uuid` da ARQUITETURA para as tabelas de domínio. A identidade dos **usuários** (`auth.users` do Supabase) continua em `uuid`. ✅ **Decisão a confirmar.**

### 3.3. Como o script funciona

Script único (Node/TypeScript, rodável via `npm run migrate`) que:

1. Conecta em **leitura** ao MySQL atual (a partir de um `mysqldump` restaurado localmente — nunca no banco de produção direto).
2. Conecta ao Postgres/Supabase de destino (staging primeiro) via connection string com a *service role*.
3. Migra tabela a tabela, **na ordem das dependências**:

   ```
   generos → autores → bibliotecas → status → pessoas
     → livros → livro_autor → temas
     → exemplares → emprestimos
   ```
4. **Transformações aplicadas durante a carga:**
   - **status**: mapeia o `status_id` antigo (1, 2, …) para o novo `codigo` estável (`disponivel`, `emprestado`).
   - **livro_autor**: preserva o vínculo N:N (ignora a coluna `autor_id` órfã da migration antiga).
   - **temas**: já vêm normalizados (uma linha por tema); descarta temas vazios gerados pelo `explode(";")` do sistema atual.
   - **emprestimos**: `data_devolucao` nula = em aberto; calcula/preenche `data_prevista_devolucao` (retirada + prazo padrão) para registros históricos.
   - **exemplares/pessoas/livros**: normaliza datas, remove espaços, valida CPF quando aplicável.
5. É **idempotente**: pode rodar de novo (trunca e recarrega, ou faz *upsert*), então dá para ensaiar quantas vezes quiser.
6. Ao final, imprime um **relatório de reconciliação**: contagem origem × destino por tabela, para conferência.

### 3.4. Usuários e senhas (caso à parte)

As contas de acesso não vão para tabelas comuns, e sim para o **Supabase Auth**. Duas opções:

- **(A) Preservar as senhas** — o Laravel usa **bcrypt**, compatível com o Supabase Auth. Dá para importar os usuários com o hash existente, e ninguém precisa trocar de senha.
- **(B) Convite/reset** — cria os usuários e dispara e-mail de definição de senha no primeiro acesso. Mais simples e mais seguro (senhas antigas ficam para trás).

> **Recomendo (B)** para começar limpo, salvo se você quiser evitar que os funcionários redefinam senha — aí vamos de (A). ✅ **Decisão a confirmar.**

Os vínculos `usuario_grupo` (quem é de qual grupo) são recriados no script, já que o ACL é novo.

### 3.5. Ensaio e corte

1. **Ensaio** em staging: restaura um dump recente, roda o ETL, confere o relatório e faz *spot-check* nas telas.
2. Ajusta o script conforme os problemas encontrados; repete até "zerar".
3. **Corte (cutover)**: em uma janela combinada, congela o sistema atual (somente leitura), gera o dump final, roda o ETL em produção, valida e libera a v2.

### 3.6. O que preciso de você para esta etapa

- Um **`mysqldump`** do banco atual (estrutura + dados) — ou credenciais de leitura para eu gerar um.
- Confirmar as duas decisões acima (IDs numéricos; senhas A ou B).
- Fechar as **restrições de campo** que ficaram pendentes (CPF único, `codigo_livro` obrigatório, etc. — ver seção 5.x pendente no chat), pois definem o schema de destino.

---

## 4. Roadmap por fases

Cada fase é entregável e verificável de forma independente.

| Fase | Entrega | Depende de |
|------|---------|-----------|
| **0. Fundação** | Repo novo; Next.js + Tailwind; **Docker** (`Dockerfile.dev` + `docker-compose.yml`); `supabase init` (Docker); esqueleto de **testes + CI verde** (Vitest/Playwright/pgTAP); deploy "hello world" na Vercel via `git push`. | — |
| **1. Banco** | Migrations do domínio + ACL + função `tem_permissao` + seeds (status, funcionalidades, grupos). | Restrições confirmadas |
| **2. Autenticação** | Login, recuperação de senha, sessão (middleware), proteção de rotas. | 1 |
| **3. ACL na UI** | `getPermissoes`, componente `<Can>`, navegação condicional; telas de **Grupos/permissões** e **Usuários**. | 2 |
| **4. Catálogo** | CRUD de gêneros, autores, bibliotecas, status, livros (+temas/autores) e exemplares. | 3 |
| **5. Leitores** | CRUD de pessoas. | 3 |
| **6. Circulação** | Emprestar, devolver, histórico, dashboard com indicadores. | 4, 5 |
| **7. PWA** | Manifest, service worker (Serwist), consulta offline, banner de status. | 4–6 |
| **8. Migração** | Script de ETL + ensaio em staging + relatório de reconciliação. | 1 (+ dump) |
| **9. Corte** | Migração em produção, validação, virada para a v2. | 7, 8 |

**Toda fase é test-first:** define-se primeiro os testes de aceitação (o que é "pronto"), escreve-se os testes (vermelho), implementa-se (verde) e só então segue. Nenhuma fase fecha com CI vermelho. Ver [AMBIENTE-E-TESTES.md](./AMBIENTE-E-TESTES.md).

**Toda fase termina com o gate** da [CHECKLIST-FIM-DE-FASE.md](./CHECKLIST-FIM-DE-FASE.md): a checagem geral (lint, typecheck, testes, build, Docker, CI) e a conferência dos deliverables da fase, com o resultado registrado naquele arquivo. O planejamento de cada fase deve incluir esse gate como etapa final.

O visual segue o mockup já validado (tema claro, azul-ardósia, serifada clássica, lombada por gênero).

---

## 5. Riscos e mitigações

| Risco | Mitigação |
|-------|-----------|
| Dados sujos no legado (temas vazios, datas inválidas, CPFs malformados) | Limpeza no ETL + relatório de exceções para revisão manual. |
| Divergência de regras (ex.: empréstimos em aberto inconsistentes) | Reconciliação origem×destino antes do corte. |
| Tier gratuito (Vercel Hobby não-comercial; Supabase pausa) | Avaliar Vercel Pro / Supabase Pro na entrada em produção. |
| Offline de escrita fora de escopo | Escopo atual = consulta offline; escrita exige conexão (documentado). |

---

## 6. Decisões em aberto (bloqueiam o schema/migração)

- [x] **IDs**: preservar IDs numéricos do legado (`bigint`). ✅
- [x] **Senhas**: opção (B) reset por e-mail. ✅
- [x] **Restrições de campo**: confirmadas — ver [ARQUITETURA.md](./ARQUITETURA.md) §3.5. ✅
- [x] **Nome do repositório**: `biblioteca-iecg` (GitHub: avrossini/biblioteca-iecg). ✅
- [ ] **Dump** do banco atual (`mysqldump`) — pendente, necessário para a Fase 8/9.
