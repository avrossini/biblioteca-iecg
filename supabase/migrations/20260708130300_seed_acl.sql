-- Fase 1 — Seed de PRODUÇÃO (dados dos quais a lógica depende). Idempotente.

-- ============================ Status ============================

insert into public.status (codigo, nome) values
  ('disponivel', 'Disponível'),
  ('emprestado', 'Emprestado')
on conflict (codigo) do nothing;

-- ============================ Funcionalidades (catálogo de permissões) ============================

insert into public.funcionalidades (codigo, nome, categoria) values
  ('home.index',            'Ver painel',              'Dashboard'),
  ('livro.index',           'Listar livros',           'Livros'),
  ('livro.show',            'Ver detalhes do livro',   'Livros'),
  ('livro.create',          'Cadastrar livro',         'Livros'),
  ('livro.update',          'Editar livro',            'Livros'),
  ('livro.destroy',         'Excluir livro',           'Livros'),
  ('exemplar.create',       'Cadastrar exemplar',      'Exemplares'),
  ('exemplar.update',       'Editar exemplar',         'Exemplares'),
  ('exemplar.destroy',      'Excluir exemplar',        'Exemplares'),
  ('autor.index',           'Listar autores',          'Autores'),
  ('autor.create',          'Cadastrar autor',         'Autores'),
  ('autor.update',          'Editar autor',            'Autores'),
  ('autor.destroy',         'Excluir autor',           'Autores'),
  ('genero.index',          'Listar gêneros',          'Gêneros'),
  ('genero.create',         'Cadastrar gênero',        'Gêneros'),
  ('genero.update',         'Editar gênero',           'Gêneros'),
  ('genero.destroy',        'Excluir gênero',          'Gêneros'),
  ('biblioteca.index',      'Listar bibliotecas',      'Bibliotecas'),
  ('biblioteca.create',     'Cadastrar biblioteca',    'Bibliotecas'),
  ('biblioteca.update',     'Editar biblioteca',       'Bibliotecas'),
  ('biblioteca.destroy',    'Excluir biblioteca',      'Bibliotecas'),
  ('status.index',          'Listar status',           'Status'),
  ('status.create',         'Cadastrar status',        'Status'),
  ('status.update',         'Editar status',           'Status'),
  ('status.destroy',        'Excluir status',          'Status'),
  ('pessoa.index',          'Listar leitores',         'Leitores'),
  ('pessoa.create',         'Cadastrar leitor',        'Leitores'),
  ('pessoa.update',         'Editar leitor',           'Leitores'),
  ('pessoa.destroy',        'Excluir leitor',          'Leitores'),
  ('emprestimo.index',      'Listar empréstimos',      'Circulação'),
  ('emprestimo.emprestar',  'Registrar empréstimo',    'Circulação'),
  ('emprestimo.devolver',   'Registrar devolução',     'Circulação'),
  ('emprestimo.historico',  'Ver histórico',           'Circulação'),
  ('usuario.index',         'Listar usuários',         'Administração'),
  ('usuario.create',        'Cadastrar usuário',       'Administração'),
  ('usuario.update',        'Editar usuário',          'Administração'),
  ('usuario.destroy',       'Excluir usuário',         'Administração'),
  ('grupo.index',           'Listar grupos',           'Administração'),
  ('grupo.create',          'Cadastrar grupo',         'Administração'),
  ('grupo.update',          'Editar grupo',            'Administração'),
  ('grupo.destroy',         'Excluir grupo',           'Administração'),
  ('grupo.permissoes',      'Atribuir permissões',     'Administração')
on conflict (codigo) do nothing;

-- ============================ Grupos ============================

insert into public.grupos (nome, descricao) values
  ('Administrador', 'Acesso total ao sistema.'),
  ('Bibliotecário', 'Catálogo, acervo, leitores e circulação.'),
  ('Atendente',     'Empréstimos, devoluções e consulta.')
on conflict (nome) do nothing;

-- ============================ Vínculos grupo × funcionalidade ============================

-- Administrador: todas as funcionalidades.
insert into public.grupo_funcionalidade (grupo_id, funcionalidade_id)
select g.id, f.id
from public.grupos g cross join public.funcionalidades f
where g.nome = 'Administrador'
on conflict do nothing;

-- Bibliotecário: tudo, exceto administração (usuario.* e grupo.*).
insert into public.grupo_funcionalidade (grupo_id, funcionalidade_id)
select g.id, f.id
from public.grupos g cross join public.funcionalidades f
where g.nome = 'Bibliotecário'
  and f.codigo not like 'usuario.%'
  and f.codigo not like 'grupo.%'
on conflict do nothing;

-- Atendente: painel, consulta de livros, leitores e circulação.
insert into public.grupo_funcionalidade (grupo_id, funcionalidade_id)
select g.id, f.id
from public.grupos g cross join public.funcionalidades f
where g.nome = 'Atendente'
  and f.codigo in (
    'home.index', 'livro.index', 'livro.show',
    'pessoa.index', 'pessoa.create', 'pessoa.update', 'pessoa.destroy',
    'emprestimo.index', 'emprestimo.emprestar', 'emprestimo.devolver', 'emprestimo.historico'
  )
on conflict do nothing;
