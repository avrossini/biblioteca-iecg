-- Estrutura do schema de domínio e ACL.
begin;
select plan(20);

-- Tabelas
select has_table('public', 'generos', 'tabela generos existe');
select has_table('public', 'autores', 'tabela autores existe');
select has_table('public', 'bibliotecas', 'tabela bibliotecas existe');
select has_table('public', 'status', 'tabela status existe');
select has_table('public', 'pessoas', 'tabela pessoas existe');
select has_table('public', 'livros', 'tabela livros existe');
select has_table('public', 'temas', 'tabela temas existe');
select has_table('public', 'livro_autor', 'tabela livro_autor existe');
select has_table('public', 'exemplares', 'tabela exemplares existe');
select has_table('public', 'emprestimos', 'tabela emprestimos existe');
select has_table('public', 'grupos', 'tabela grupos existe');
select has_table('public', 'funcionalidades', 'tabela funcionalidades existe');
select has_table('public', 'grupo_funcionalidade', 'tabela grupo_funcionalidade existe');
select has_table('public', 'usuario_grupo', 'tabela usuario_grupo existe');

-- Funções
select has_function('public', 'tem_permissao', array['text'], 'função tem_permissao existe');
select has_function('public', 'registrar_emprestimo', 'RPC registrar_emprestimo existe');
select has_function('public', 'registrar_devolucao', 'RPC registrar_devolucao existe');

-- Constraints / índices
select col_is_pk('public', 'livros', 'id', 'id é PK de livros');
select has_index('public', 'emprestimos', 'emprestimos_um_aberto_por_exemplar', 'índice de empréstimo em aberto existe');
select fk_ok('public', 'exemplares', 'livro_id', 'public', 'livros', 'id', 'FK exemplares → livros');

select * from finish();
rollback;
