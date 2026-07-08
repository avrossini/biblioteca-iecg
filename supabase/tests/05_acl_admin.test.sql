-- RLS das telas de administração: só quem tem permissão altera o ACL.
begin;
select plan(3);

insert into auth.users (instance_id, id, aud, role, email) values
  ('00000000-0000-0000-0000-000000000000', '55555555-5555-5555-5555-555555555555', 'authenticated', 'authenticated', 'admin@test'),
  ('00000000-0000-0000-0000-000000000000', '66666666-6666-6666-6666-666666666666', 'authenticated', 'authenticated', 'atend@test');
insert into usuario_grupo (user_id, grupo_id)
select '55555555-5555-5555-5555-555555555555', id from grupos where nome = 'Administrador';
insert into usuario_grupo (user_id, grupo_id)
select '66666666-6666-6666-6666-666666666666', id from grupos where nome = 'Atendente';

-- Atendente NÃO pode alterar permissões de grupo nem ler usuario_grupo
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"66666666-6666-6666-6666-666666666666","role":"authenticated"}', true);
select throws_ok(
  $$ insert into grupo_funcionalidade (grupo_id, funcionalidade_id)
     values ((select id from grupos where nome = 'Atendente'),
             (select id from funcionalidades where codigo = 'livro.create')) $$,
  '42501', null, 'Atendente não altera grupo_funcionalidade'
);
select is_empty($$ select 1 from usuario_grupo $$, 'Atendente não lê usuario_grupo');
reset role;

-- Administrador PODE alterar permissões de grupo
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"55555555-5555-5555-5555-555555555555","role":"authenticated"}', true);
select lives_ok(
  $$ insert into grupo_funcionalidade (grupo_id, funcionalidade_id)
     values ((select id from grupos where nome = 'Bibliotecário'),
             (select id from funcionalidades where codigo = 'usuario.index')) $$,
  'Administrador altera grupo_funcionalidade'
);
reset role;

select * from finish();
rollback;
