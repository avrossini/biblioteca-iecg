-- Exemplares: escrita gated por permissão (RLS).
begin;
select plan(2);

insert into auth.users (instance_id, id, aud, role, email) values
  ('00000000-0000-0000-0000-000000000000', '99999999-9999-9999-9999-999999999999', 'authenticated', 'authenticated', 'bib@test'),
  ('00000000-0000-0000-0000-000000000000', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'authenticated', 'authenticated', 'att@test');
insert into usuario_grupo (user_id, grupo_id)
select '99999999-9999-9999-9999-999999999999', id from grupos where nome = 'Bibliotecário';
insert into usuario_grupo (user_id, grupo_id)
select 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', id from grupos where nome = 'Atendente';

-- Fixtures (como owner, ignora RLS)
insert into generos (id, nome) values (960, 'GenEx');
insert into bibliotecas (id, nome) values (960, 'BibEx');
insert into livros (id, codigo_livro, nome, genero_id) values (960, 'EX-1', 'Livro Ex', 960);

-- Atendente não cria exemplar
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa","role":"authenticated"}', true);
select throws_ok(
  $$ insert into exemplares (livro_id, biblioteca_id, status_id)
     values (960, 960, (select id from status where codigo = 'disponivel')) $$,
  '42501', null, 'Atendente não cria exemplar'
);
reset role;

-- Bibliotecário cria exemplar
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"99999999-9999-9999-9999-999999999999","role":"authenticated"}', true);
select lives_ok(
  $$ insert into exemplares (livro_id, biblioteca_id, status_id)
     values (960, 960, (select id from status where codigo = 'disponivel')) $$,
  'Bibliotecário cria exemplar'
);
reset role;

select * from finish();
rollback;
