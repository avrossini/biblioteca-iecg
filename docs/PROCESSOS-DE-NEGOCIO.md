# Processos de Negócio — Biblioteca Rossini Benitez

> Documentação do funcionamento **atual** (as-is) do sistema, extraída diretamente do código-fonte.
> Objetivo: descrever cada processo de negócio e **exatamente como ele ocorre hoje**, servindo de base para decidir o que precisa ser adicionado/corrigido.

---

## 1. Visão geral

O sistema é uma aplicação de **gestão de acervo de biblioteca** (Laravel 9 / PHP 8, Blade + Bootstrap). Ele controla:

- **Catálogo**: livros, seus autores, gênero e temas.
- **Acervo físico**: exemplares (cópias físicas) de cada livro, alocados a uma biblioteca e com um status.
- **Circulação**: empréstimo e devolução de exemplares para pessoas (leitores), com histórico.
- **Apoio**: cadastros de gêneros, autores, bibliotecas, status, pessoas e usuários do sistema.

**Conceito central:** existe uma separação entre **Livro** (a obra, informação bibliográfica) e **Exemplar** (a cópia física que efetivamente circula). O empréstimo sempre ocorre sobre um **exemplar**, nunca sobre o livro diretamente.

```
Genero 1 ──< Livro >──N:N── Autor
                │
                ├──< Tema
                │
                └──< Exemplar >── Biblioteca
                         │  └──── Status
                         │
                         └──< Emprestimo >── Pessoa
```

---

## 2. Entidades e estrutura de dados

| Entidade | Tabela | Campos principais | Observações |
|----------|--------|-------------------|-------------|
| **Genero** | `generos` | `nome` | Cadastro simples. |
| **Autor** | `autores` | `nome`, `biografia` | `biografia` adicionada posteriormente. Relação N:N com Livro via `livro_autor`. |
| **Livro** | `livros` | `nome`, `resumo` (HTML formatado), `codigo_livro`, `genero_id` | `codigo_livro` é numérico e opcional (`nullable`); usado para ordenação na listagem. |
| **Tema** | `temas` | `nome`, `livro_id` | Múltiplos temas por livro (1:N). Gerenciados junto com o livro. |
| **Biblioteca** | `bibliotecas` | `nome` | Unidade/local físico do exemplar. |
| **Status** | `status` | `nome` | Estado do exemplar. Ver **valores fixos** abaixo. |
| **Exemplar** | `exemplares` | `livro_id`, `biblioteca_id`, `status_id`, `data_aquisicao` | Cópia física de um livro. |
| **Pessoa** | `pessoas` | `nome`, `email`, `telefone`, `cpf` | O leitor. Nenhum campo é validado como único. |
| **Emprestimo** | `emprestimos` | `exemplar_id`, `pessoa_id`, `data_emprestimo`, `data_devolucao` (nullable) | `data_devolucao` nula ⇒ empréstimo **em aberto**. |
| **User** | `users` | `name`, `email`, `password` | Usuário/operador do sistema (login). |

### Valores fixos de Status (⚠️ importante)

Embora Status seja um cadastro editável, a lógica de empréstimo depende de **IDs fixos gravados no código**:

- `status_id = 1` → **Disponível** (livre para empréstimo / após devolução)
- `status_id = 2` → **Emprestado**

Esses números estão *hardcoded* no `EmprestimoController` (não são lidos por nome). Se os registros de status forem recriados com outros IDs, a circulação quebra.

---

## 3. Processos de negócio (as-is)

### 3.1. Cadastros base (Gênero, Autor, Biblioteca, Status, Pessoa)

Todos seguem o mesmo padrão CRUD via formulários Blade + POST. Fluxo genérico:

1. **Listar** (`index`) — mostra todos os registros (DataTable no front) e exibe a mensagem de flash da última operação.
2. **Criar** (`create` → `store`) — formulário → `Model::create($request->all())` → redireciona para o index com mensagem de sucesso.
3. **Editar** (`edit` → `update`) — carrega o registro por `id` → grava os campos → redireciona com mensagem.
4. **Excluir** (`destroy`) — remove por `id` → redireciona com mensagem.

**Regras específicas de exclusão:**

| Entidade | Regra ao excluir |
|----------|------------------|
| **Autor** | **Bloqueado** se estiver vinculado a ≥1 livro. Mensagem instrui a remover o autor dos livros antes. (`AutorController::destroy`) |
| **Gênero** | Sem verificação. Exclui direto (⚠️ pode deixar livros com `genero_id` órfão). |
| **Biblioteca** | Sem verificação. Exclui direto (⚠️ exemplares podem ficar órfãos). |
| **Status** | Sem verificação. Exclui direto (⚠️ quebra a lógica de IDs fixos se remover o 1 ou o 2). |
| **Pessoa** | Sem verificação. Exclui direto (⚠️ mesmo com empréstimos em aberto no histórico). |

---

### 3.2. Cadastro de Livro

**Criar livro** (`LivroController::create` → `store`):

1. A tela de criação carrega a lista de autores e a lista de gêneros disponíveis.
2. O operador informa: nome, código do livro, gênero, resumo (texto formatado/HTML), autores (múltipla seleção) e temas.
3. Ao salvar:
   - Cria o registro do livro com os campos preenchidos.
   - **Autores**: recebidos como JSON, aplicados via `sync()` na tabela `livro_autor` (N:N).
   - **Temas**: recebidos como uma **string única separada por `;`**. O sistema faz `explode(";", ...)` e cria um registro em `temas` para cada pedaço.
4. Redireciona para a listagem de livros com mensagem de sucesso.

**Editar livro** (`edit` → `update`):

1. Carrega o livro, os autores atualmente selecionados (consulta direta em `livro_autor`) e a string de temas concatenada com `"; "`.
2. Ao salvar:
   - Atualiza nome, código, gênero e resumo (o resumo vem do campo `resumo_texto_formatado`).
   - **Autores**: re-sincronizados via `sync()`.
   - **Temas**: estratégia de *"apaga tudo e recria"* — **todos os temas do livro são deletados** e depois recriados a partir da string enviada.

**Excluir livro** (`destroy`):

- **Regra**: o livro **não pode ser excluído** enquanto tiver ≥1 exemplar cadastrado. A mensagem instrui a remover o livro de todos os exemplares antes.
- Se não houver exemplares, exclui o livro.

**Visualizar livro** (`show`):

- Exibe os dados do livro (autores, gênero) e a **lista de exemplares** daquele livro, cada um com seu status e biblioteca.

---

### 3.3. Cadastro de Exemplar

Um exemplar só existe atrelado a um livro. As telas de exemplar são acessadas a partir do contexto de um livro (rotas via POST).

**Criar exemplar** (`ExemplarController::create` → `store`):

1. A partir de um livro, abre-se o formulário de novo exemplar, que carrega a lista de bibliotecas e a lista de status.
2. O operador informa: biblioteca, status e data de aquisição.
3. Ao salvar, cria o exemplar (`livro_id`, `biblioteca_id`, `status_id`, `data_aquisicao`) e volta para a listagem de livros com mensagem de sucesso.

**Excluir exemplar** (`destroy`):

- Exclui o exemplar diretamente, sem verificação. Mensagem confirma exclusão.
- ⚠️ Não há checagem se o exemplar está **emprestado** ou possui histórico de empréstimos.

> ⚠️ **Bug conhecido:** `ExemplarController::update` **não atualiza um exemplar** — o código foi copiado do `LivroController` e na prática altera um *Livro*. A edição de exemplar, hoje, não funciona como esperado. (Ver seção 5.)

---

### 3.4. Circulação — Empréstimo e Devolução

Este é o processo central. Todas as ações partem, na prática, da listagem/visualização de livros e seus exemplares.

#### 3.4.1. Emprestar (`EmprestimoController::emprestar` → `registrarEmprestimo`)

1. **Iniciar empréstimo** (`emprestar`): a partir de um exemplar, abre a tela de empréstimo, carregando:
   - Os dados do exemplar (com livro e autores).
   - A lista de **todas as pessoas** cadastradas (para escolher o leitor).
2. **Registrar** (`registrarEmprestimo`): ao confirmar:
   - O exemplar tem seu status alterado para **Emprestado** (`status_id = 2`).
   - É criado um registro de empréstimo com `pessoa_id`, `exemplar_id` e `data_emprestimo = data de hoje`.
   - `data_devolucao` fica **nula** (empréstimo em aberto).
   - Redireciona para a listagem de livros com a mensagem *"Livro 'X' emprestado para 'Y' com sucesso!"*.

⚠️ **Não há validação** de que o exemplar esteja disponível antes de emprestar. Em tese é possível "emprestar" um exemplar que já está emprestado (o status é simplesmente sobrescrito para 2 e um novo empréstimo em aberto é criado).

#### 3.4.2. Devolver (`EmprestimoController::devolver` → `registrarDevolucao`)

> Observação: a rota `emprestimo.registrarDevolucao` existe, mas a lógica de devolução está implementada no método `devolver`.

1. A partir de um empréstimo em aberto, o operador aciona a devolução.
2. Ao registrar:
   - O exemplar volta ao status **Disponível** (`status_id = 1`).
   - O empréstimo recebe `data_devolucao = data de hoje`.
   - Redireciona para a listagem de livros com a mensagem *"Livro 'X' devolvido por 'Y' com sucesso!"*.

#### 3.4.3. Listar empréstimos (`index`)

- Lista **todos os empréstimos**, do mais recente para o mais antigo, com livro, pessoa e status do exemplar.

#### 3.4.4. Histórico por exemplar (`historico`)

- Dado um exemplar, lista **todos os empréstimos daquele exemplar** (aberto e devolvidos), com livro, pessoa e status.

**Datas:** todas as datas de empréstimo/devolução usam a **data atual do servidor** (`date("Y-m-d")`). Não há campo de "data prevista de devolução" nem cálculo de atraso/multa.

---

### 3.5. Painel inicial (Home / Dashboard)

`HomeController::index` monta a tela inicial com **4 indicadores**:

- Total de **livros** cadastrados.
- Total de **exemplares** cadastrados.
- Total de **pessoas** cadastradas.
- Total de **empréstimos em aberto** (empréstimos com `data_devolucao` nula).

---

### 3.6. Usuários e autenticação

**Login / Logout** (`Auth\AuthenticatedSessionController`): telas de login e logout do scaffolding Laravel Breeze.

**Recuperação de senha** (`PasswordResetLinkController`): fluxo de "esqueci minha senha" por e-mail.

**Troca de senha** (`UserController::newPassword` → `changePassword`):

1. Tela de troca de senha.
2. Valida: senha atual obrigatória; nova senha obrigatória, mínimo 8 caracteres e confirmada.
3. Confere se a senha atual bate com a do usuário autenticado; se não, retorna erro.
4. Se correta, grava a nova senha (hash) e confirma sucesso.

⚠️ **Estado atual da autenticação:**
- Todas as rotas da aplicação estão com o middleware `auth` **comentado** em `routes/web.php`. Ou seja, **hoje o sistema está totalmente aberto** — qualquer pessoa acessa todas as telas sem login.
- O **CRUD de usuários** (`UserController` — index/create/store/edit/update/destroy) está **não funcional**: os métodos foram copiados do `StatusController` e operam sobre `Status`, não sobre `User`. Apenas `newPassword`/`changePassword` funcionam de fato com usuários.

---

## 4. Resumo das regras de negócio existentes

1. Empréstimo ocorre sempre sobre **exemplar** (cópia física), não sobre o livro.
2. Emprestar → exemplar vai para status **2 (Emprestado)**; devolver → volta para **1 (Disponível)**.
3. Um empréstimo está **em aberto** enquanto `data_devolucao` for nula.
4. **Livro** não pode ser excluído se tiver exemplares.
5. **Autor** não pode ser excluído se estiver vinculado a livros.
6. Datas de empréstimo e devolução são sempre a **data atual do servidor**.
7. Temas de um livro são informados como texto separado por `;` e, na edição, são recriados do zero.

---

## 5. Inconsistências e pontos de atenção (as-is)

Itens observados no código que impactam os processos e provavelmente precisam de decisão/correção:

| # | Onde | Problema |
|---|------|----------|
| 1 | `routes/web.php` | Middleware `auth` comentado → **sistema sem controle de acesso**. |
| 2 | `UserController` | index/create/store/edit/update/destroy operam sobre `Status`, não `User` → **gestão de usuários não funciona**. |
| 3 | `ExemplarController::update` | Atualiza um `Livro` em vez de um `Exemplar` (copiado do LivroController) → **edição de exemplar não funciona**; há ainda código morto após o `return` no `edit`. |
| 4 | `EmprestimoController::registrarEmprestimo` | Não valida se o exemplar já está emprestado antes de emprestar. |
| 5 | Status IDs (1 e 2) | *Hardcoded* na circulação; excluir/recriar status pode quebrar o processo. |
| 6 | `PessoaController::destroy` | Exclui pessoa sem checar empréstimos em aberto/histórico. |
| 7 | Exclusão de Gênero/Biblioteca/Status | Sem checagem de vínculos → possíveis referências órfãs. |
| 8 | Livro/Tema (`store`/`update`) | `explode(";", ...)` sobre string vazia gera um tema vazio; edição apaga e recria todos os temas. |
| 9 | Migration `livros` | Define `autor_id` como coluna FK, mas o relacionamento real é N:N via `livro_autor`; o método `down()` referencia `$table` indefinido (idem em `exemplares`/`emprestimos`). |
| 10 | Circulação | Sem data prevista de devolução, sem controle de atraso/multa, sem limite de exemplares por pessoa. |

---

## 6. O que ainda falta documentar / definir

*(Seção reservada — a ser preenchida com os processos e regras adicionais que serão informados.)*
