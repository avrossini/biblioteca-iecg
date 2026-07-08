-- Leitores (pessoas): RLS, unicidade e formato de CPF.
begin;
select plan(4);

insert into auth.users (instance_id, id, aud, role, email) values
  ('00000000-0000-0000-0000-000000000000', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'authenticated', 'authenticated', 'att@test'),
  ('00000000-0000-0000-0000-000000000000', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'authenticated', 'authenticated', 'sem@test');
insert into usuario_grupo (user_id, grupo_id)
select 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', id from grupos where nome = 'Atendente';
-- usuário 'cccc...' fica sem grupo (sem permissões)

-- Atendente cria leitor e a unicidade/formato de CPF são aplicados
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb","role":"authenticated"}', true);
select lives_ok($$ insert into pessoas (nome, cpf) values ('Leitor A', '52998224725') $$, 'Atendente cria leitor');
select throws_ok($$ insert into pessoas (nome, cpf) values ('Leitor B', '52998224725') $$, '23505', null, 'CPF duplicado barrado');
select throws_ok($$ insert into pessoas (nome, cpf) values ('Leitor C', '123') $$, '23514', null, 'CPF fora do formato barrado');
reset role;

-- Usuário sem permissão não lê pessoas
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"cccccccc-cccc-cccc-cccc-cccccccccccc","role":"authenticated"}', true);
select is_empty($$ select 1 from pessoas $$, 'usuário sem permissão não lê pessoas');
reset role;

select * from finish();
rollback;
