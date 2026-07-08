-- RPCs de circulação: empréstimo, indisponibilidade, devolução e permissão.
begin;
select plan(6);

-- Fixtures de domínio
insert into generos (id, nome) values (900, 'TesteGen');
insert into bibliotecas (id, nome) values (900, 'TesteBib');
insert into livros (id, codigo_livro, nome, genero_id) values (900, 'T-900', 'Livro Teste', 900);
insert into exemplares (id, livro_id, biblioteca_id, status_id, numero_tombo)
values (900, 900, 900, (select id from status where codigo = 'disponivel'), 'T900');
insert into pessoas (id, nome) values (900, 'Leitor Teste');

-- Usuário com permissão de circulação (Atendente)
insert into auth.users (instance_id, id, aud, role, email)
values ('00000000-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'authenticated', 'authenticated', 'circ@test');
insert into usuario_grupo (user_id, grupo_id)
select '33333333-3333-3333-3333-333333333333', id from grupos where nome = 'Atendente';

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated"}', true);

select lives_ok($$ select registrar_emprestimo(900, 900) $$, 'registra empréstimo de exemplar disponível');
select is(
  (select s.codigo from exemplares e join status s on s.id = e.status_id where e.id = 900),
  'emprestado', 'exemplar fica com status emprestado'
);
select throws_ok($$ select registrar_emprestimo(900, 900) $$, 'P0001', null, 'não empresta exemplar indisponível');
select lives_ok(
  $$ select registrar_devolucao((select id from emprestimos where exemplar_id = 900 and data_devolucao is null)) $$,
  'registra devolução'
);
select is(
  (select s.codigo from exemplares e join status s on s.id = e.status_id where e.id = 900),
  'disponivel', 'exemplar volta a disponível'
);
reset role;

-- Usuário sem permissão não empresta
insert into auth.users (instance_id, id, aud, role, email)
values ('00000000-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444', 'authenticated', 'authenticated', 'noperm@test');
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"44444444-4444-4444-4444-444444444444","role":"authenticated"}', true);
select throws_ok($$ select registrar_emprestimo(900, 900) $$, '42501', null, 'sem permissão não empresta');
reset role;

select * from finish();
rollback;
