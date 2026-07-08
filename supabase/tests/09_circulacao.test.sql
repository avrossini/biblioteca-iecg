-- Circulação: leitura de empréstimos gated por emprestimo.index.
-- (As RPCs registrar_emprestimo/registrar_devolucao já são cobertas por 04_circulacao.)
begin;
select plan(2);

insert into auth.users (instance_id, id, aud, role, email) values
  ('00000000-0000-0000-0000-000000000000', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'authenticated', 'authenticated', 'att@test'),
  ('00000000-0000-0000-0000-000000000000', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'authenticated', 'authenticated', 'sem@test');
insert into usuario_grupo (user_id, grupo_id)
select 'dddddddd-dddd-dddd-dddd-dddddddddddd', id from grupos where nome = 'Atendente';
-- usuário 'eeee...' sem grupo (sem permissões)

-- Fixtures (owner)
insert into generos (id, nome) values (970, 'GenCirc');
insert into bibliotecas (id, nome) values (970, 'BibCirc');
insert into livros (id, codigo_livro, nome, genero_id) values (970, 'CIRC-1', 'Livro Circ', 970);
insert into pessoas (id, nome) values (970, 'Leitor Circ');
insert into exemplares (id, livro_id, biblioteca_id, status_id)
values (970, 970, 970, (select id from status where codigo = 'disponivel'));
insert into emprestimos (exemplar_id, pessoa_id, data_emprestimo, data_prevista_devolucao)
values (970, 970, current_date, current_date + 14);

-- Atendente lê empréstimos
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"dddddddd-dddd-dddd-dddd-dddddddddddd","role":"authenticated"}', true);
select isnt_empty($$ select 1 from emprestimos $$, 'Atendente lê empréstimos');
reset role;

-- Usuário sem permissão não lê empréstimos
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee","role":"authenticated"}', true);
select is_empty($$ select 1 from emprestimos $$, 'sem permissão não lê empréstimos');
reset role;

select * from finish();
rollback;
