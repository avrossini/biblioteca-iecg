-- Fase 1 — Row Level Security. A proteção real do ACL vive aqui.
-- Padrão: leitura conforme a tabela; escrita sempre condicionada a tem_permissao(<codigo>).
-- O papel `service_role` (scripts de migração) ignora RLS por padrão.

-- Acesso de tabela aos papéis do Supabase (a RLS restringe as linhas; o GRANT libera a tabela).
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;

-- ============================ Referência (leitura livre a autenticados) ============================

alter table public.generos enable row level security;
create policy generos_sel on public.generos for select to authenticated using (true);
create policy generos_ins on public.generos for insert to authenticated with check (public.tem_permissao('genero.create'));
create policy generos_upd on public.generos for update to authenticated using (public.tem_permissao('genero.update')) with check (public.tem_permissao('genero.update'));
create policy generos_del on public.generos for delete to authenticated using (public.tem_permissao('genero.destroy'));

alter table public.autores enable row level security;
create policy autores_sel on public.autores for select to authenticated using (true);
create policy autores_ins on public.autores for insert to authenticated with check (public.tem_permissao('autor.create'));
create policy autores_upd on public.autores for update to authenticated using (public.tem_permissao('autor.update')) with check (public.tem_permissao('autor.update'));
create policy autores_del on public.autores for delete to authenticated using (public.tem_permissao('autor.destroy'));

alter table public.bibliotecas enable row level security;
create policy bibliotecas_sel on public.bibliotecas for select to authenticated using (true);
create policy bibliotecas_ins on public.bibliotecas for insert to authenticated with check (public.tem_permissao('biblioteca.create'));
create policy bibliotecas_upd on public.bibliotecas for update to authenticated using (public.tem_permissao('biblioteca.update')) with check (public.tem_permissao('biblioteca.update'));
create policy bibliotecas_del on public.bibliotecas for delete to authenticated using (public.tem_permissao('biblioteca.destroy'));

alter table public.status enable row level security;
create policy status_sel on public.status for select to authenticated using (true);
create policy status_ins on public.status for insert to authenticated with check (public.tem_permissao('status.create'));
create policy status_upd on public.status for update to authenticated using (public.tem_permissao('status.update')) with check (public.tem_permissao('status.update'));
create policy status_del on public.status for delete to authenticated using (public.tem_permissao('status.destroy'));

-- ============================ Catálogo ============================

alter table public.livros enable row level security;
create policy livros_sel on public.livros for select to authenticated using (public.tem_permissao('livro.index'));
create policy livros_ins on public.livros for insert to authenticated with check (public.tem_permissao('livro.create'));
create policy livros_upd on public.livros for update to authenticated using (public.tem_permissao('livro.update')) with check (public.tem_permissao('livro.update'));
create policy livros_del on public.livros for delete to authenticated using (public.tem_permissao('livro.destroy'));

-- temas e livro_autor: conteúdo do livro. Leitura livre; escrita = gerir o livro.
alter table public.temas enable row level security;
create policy temas_sel on public.temas for select to authenticated using (true);
create policy temas_ins on public.temas for insert to authenticated with check (public.tem_permissao('livro.update'));
create policy temas_upd on public.temas for update to authenticated using (public.tem_permissao('livro.update')) with check (public.tem_permissao('livro.update'));
create policy temas_del on public.temas for delete to authenticated using (public.tem_permissao('livro.update'));

alter table public.livro_autor enable row level security;
create policy livro_autor_sel on public.livro_autor for select to authenticated using (true);
create policy livro_autor_ins on public.livro_autor for insert to authenticated with check (public.tem_permissao('livro.update'));
create policy livro_autor_del on public.livro_autor for delete to authenticated using (public.tem_permissao('livro.update'));

-- ============================ Acervo ============================

alter table public.exemplares enable row level security;
create policy exemplares_sel on public.exemplares for select to authenticated using (true);
create policy exemplares_ins on public.exemplares for insert to authenticated with check (public.tem_permissao('exemplar.create'));
create policy exemplares_upd on public.exemplares for update to authenticated using (public.tem_permissao('exemplar.update')) with check (public.tem_permissao('exemplar.update'));
create policy exemplares_del on public.exemplares for delete to authenticated using (public.tem_permissao('exemplar.destroy'));

-- ============================ Leitores ============================

alter table public.pessoas enable row level security;
create policy pessoas_sel on public.pessoas for select to authenticated using (public.tem_permissao('pessoa.index'));
create policy pessoas_ins on public.pessoas for insert to authenticated with check (public.tem_permissao('pessoa.create'));
create policy pessoas_upd on public.pessoas for update to authenticated using (public.tem_permissao('pessoa.update')) with check (public.tem_permissao('pessoa.update'));
create policy pessoas_del on public.pessoas for delete to authenticated using (public.tem_permissao('pessoa.destroy'));

-- ============================ Circulação ============================
-- Leitura pela listagem; escrita SOMENTE via RPCs (security definer). Sem policies de escrita.

alter table public.emprestimos enable row level security;
create policy emprestimos_sel on public.emprestimos for select to authenticated using (public.tem_permissao('emprestimo.index'));

-- ============================ Administração (ACL) ============================

alter table public.grupos enable row level security;
create policy grupos_sel on public.grupos for select to authenticated using (public.tem_permissao('grupo.index'));
create policy grupos_ins on public.grupos for insert to authenticated with check (public.tem_permissao('grupo.create'));
create policy grupos_upd on public.grupos for update to authenticated using (public.tem_permissao('grupo.update')) with check (public.tem_permissao('grupo.update'));
create policy grupos_del on public.grupos for delete to authenticated using (public.tem_permissao('grupo.destroy'));

alter table public.funcionalidades enable row level security;
create policy funcionalidades_sel on public.funcionalidades for select to authenticated using (public.tem_permissao('grupo.index'));

alter table public.grupo_funcionalidade enable row level security;
create policy grupo_func_sel on public.grupo_funcionalidade for select to authenticated using (public.tem_permissao('grupo.index'));
create policy grupo_func_ins on public.grupo_funcionalidade for insert to authenticated with check (public.tem_permissao('grupo.permissoes'));
create policy grupo_func_del on public.grupo_funcionalidade for delete to authenticated using (public.tem_permissao('grupo.permissoes'));

alter table public.usuario_grupo enable row level security;
create policy usuario_grupo_sel on public.usuario_grupo for select to authenticated using (public.tem_permissao('usuario.index'));
create policy usuario_grupo_ins on public.usuario_grupo for insert to authenticated with check (public.tem_permissao('usuario.update'));
create policy usuario_grupo_del on public.usuario_grupo for delete to authenticated using (public.tem_permissao('usuario.update'));
