-- Catálogo: RLS de escrita e integridade referencial.
begin;
select plan(3);

insert into auth.users (instance_id, id, aud, role, email) values
  ('00000000-0000-0000-0000-000000000000', '77777777-7777-7777-7777-777777777777', 'authenticated', 'authenticated', 'adm@test'),
  ('00000000-0000-0000-0000-000000000000', '88888888-8888-8888-8888-888888888888', 'authenticated', 'authenticated', 'att@test');
insert into usuario_grupo (user_id, grupo_id)
select '77777777-7777-7777-7777-777777777777', id from grupos where nome = 'Administrador';
insert into usuario_grupo (user_id, grupo_id)
select '88888888-8888-8888-8888-888888888888', id from grupos where nome = 'Atendente';

-- Atendente não cria gênero (RLS)
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"88888888-8888-8888-8888-888888888888","role":"authenticated"}', true);
select throws_ok($$ insert into generos (nome) values ('Proibido') $$, '42501', null, 'Atendente não cria gênero');
reset role;

-- Administrador cria gênero (RLS)
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"77777777-7777-7777-7777-777777777777","role":"authenticated"}', true);
select lives_ok($$ insert into generos (nome) values ('Ficção Teste') $$, 'Administrador cria gênero');
reset role;

-- Integridade: gênero em uso não pode ser excluído
insert into generos (id, nome) values (950, 'GenFK');
insert into livros (id, codigo_livro, nome, genero_id) values (950, 'FK-1', 'Livro FK', 950);
select throws_ok($$ delete from generos where id = 950 $$, '23503', null, 'gênero em uso não pode ser excluído');

select * from finish();
rollback;
