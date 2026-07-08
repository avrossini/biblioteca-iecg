-- Função tem_permissao respeita os grupos do usuário.
begin;
select plan(4);

insert into auth.users (instance_id, id, aud, role, email) values
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated', 'biblio@test'),
  ('00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated', 'atend@test');

insert into usuario_grupo (user_id, grupo_id)
select '11111111-1111-1111-1111-111111111111', id from grupos where nome = 'Bibliotecário';
insert into usuario_grupo (user_id, grupo_id)
select '22222222-2222-2222-2222-222222222222', id from grupos where nome = 'Atendente';

-- Bibliotecário
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);
select ok(public.tem_permissao('livro.create'), 'Bibliotecário tem livro.create');
select ok(not public.tem_permissao('usuario.index'), 'Bibliotecário não tem usuario.index');
reset role;

-- Atendente
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}', true);
select ok(not public.tem_permissao('livro.create'), 'Atendente não tem livro.create');
select ok(public.tem_permissao('emprestimo.emprestar'), 'Atendente tem emprestimo.emprestar');
reset role;

select * from finish();
rollback;
