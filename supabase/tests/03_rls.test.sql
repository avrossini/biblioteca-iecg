-- RLS aplica o ACL nas tabelas de domínio.
begin;
select plan(4);

insert into auth.users (instance_id, id, aud, role, email) values
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated', 'biblio@test'),
  ('00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated', 'atend@test');
insert into usuario_grupo (user_id, grupo_id)
select '11111111-1111-1111-1111-111111111111', id from grupos where nome = 'Bibliotecário';
insert into usuario_grupo (user_id, grupo_id)
select '22222222-2222-2222-2222-222222222222', id from grupos where nome = 'Atendente';

insert into generos (id, nome) values (901, 'GenRLS');
insert into pessoas (id, nome) values (901, 'Leitor Secreto');

-- Bibliotecário pode inserir livro
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);
select lives_ok(
  $$ insert into livros (codigo_livro, nome, genero_id) values ('R-1', 'Livro RLS', 901) $$,
  'Bibliotecário insere livro'
);
reset role;

-- Atendente NÃO pode inserir livro, mas lê tabela de referência
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}', true);
select throws_ok(
  $$ insert into livros (codigo_livro, nome, genero_id) values ('R-2', 'Livro RLS 2', 901) $$,
  '42501', null, 'Atendente é bloqueado ao inserir livro'
);
select isnt_empty($$ select 1 from generos $$, 'Atendente lê tabela de referência (generos)');
reset role;

-- Anônimo não enxerga pessoas
set local role anon;
select set_config('request.jwt.claims', '', true);
select is_empty($$ select 1 from pessoas $$, 'anônimo não lê pessoas');
reset role;

select * from finish();
rollback;
