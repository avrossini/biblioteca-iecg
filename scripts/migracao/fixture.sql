-- Fixture SINTÉTICO (sem PII) para o teste de integração do ETL (Fase 8).
-- Reproduz a estrutura do legado e os casos de borda: nome de gênero duplicado,
-- CPF inválido, e-mail duplicado, tema vazio/espaço, status 3/5, órfãos e duplicatas.
drop database if exists fixture;
create database fixture character set utf8mb4 collate utf8mb4_unicode_ci;
use fixture;

create table generos (id bigint unsigned primary key, nome varchar(255) not null, created_at timestamp null, updated_at timestamp null);
insert into generos values
  (1,'Não Cadastrado',null,null),
  (20,'Aconselhamento',null,null),
  (21,'Aconselhamento',null,null); -- nome duplicado → mesclado no 20

create table autores (id bigint unsigned primary key, nome varchar(255) not null, biografia longtext null, created_at timestamp null, updated_at timestamp null);
insert into autores values
  (1,'Não Cadastrado',null,null,null),
  (10,'Autor Teste','<p>Bio</p>',null,null);

create table bibliotecas (id bigint unsigned primary key, nome varchar(255) not null, created_at timestamp null, updated_at timestamp null);
insert into bibliotecas values (1,'Biblioteca A',null,null);

create table pessoas (id bigint unsigned primary key, nome varchar(255) not null, email varchar(255) not null, telefone varchar(255) not null, cpf varchar(255) not null, created_at timestamp null, updated_at timestamp null);
insert into pessoas (id,nome,email,telefone,cpf) values
  (2,'Pessoa Dois','a@x.com','11999990000','52998224725'),  -- CPF válido
  (7,'Pessoa Sete','b@x.com','11999990001','52998224725'),  -- CPF duplicado → nulo no 7
  (5,'Pessoa Cinco','dup@x.com','00000','0000000'),          -- CPF inválido → nulo
  (6,'Pessoa Seis','dup@x.com','00000','');                  -- e-mail duplicado → nulo no 6

create table livros (id bigint unsigned primary key, genero_id bigint unsigned not null, autor_id bigint unsigned null, nome varchar(255) not null, resumo longtext not null, codigo_livro bigint unsigned null, created_at timestamp null, updated_at timestamp null);
insert into livros (id,genero_id,autor_id,nome,resumo,codigo_livro) values
  (100,20,1,'Livro Cem','<p>Olá</p>',555),
  (101,21,10,'Livro Cento e Um','',556),          -- genero 21→20; autor_id 10 (rede de segurança); resumo vazio→null
  (102,999,1,'Livro Cento e Dois','<p><br></p>',557); -- genero órfão→placeholder 1; resumo só-tags→null

create table livro_autor (livro_id bigint unsigned not null, autor_id bigint unsigned not null);
insert into livro_autor values
  (100,10),
  (100,10),   -- duplicata
  (100,999),  -- autor órfão
  (888,10);   -- livro órfão

create table temas (id bigint unsigned primary key auto_increment, livro_id bigint unsigned not null, nome varchar(255) not null);
insert into temas (livro_id,nome) values
  (100,' medo'),
  (100,'medo'),   -- duplicata após trim
  (100,'   '),    -- vazio
  (999,'orfao'),  -- órfão
  (101,'fé');

create table exemplares (id bigint unsigned primary key, livro_id bigint unsigned not null, status_id bigint unsigned not null, biblioteca_id bigint unsigned not null, data_aquisicao date not null, created_at timestamp null, updated_at timestamp null);
insert into exemplares (id,livro_id,status_id,biblioteca_id,data_aquisicao) values
  (1,100,1,1,'2024-02-26'),  -- disponivel
  (2,101,3,1,'2024-02-26'),  -- extraviado
  (3,100,2,1,'2024-02-26'),  -- emprestado
  (4,888,1,1,'2024-02-26');  -- livro órfão → exemplar descartado

create table emprestimos (id bigint unsigned primary key, exemplar_id bigint unsigned not null, pessoa_id bigint unsigned not null, data_emprestimo date not null, data_devolucao date null, created_at timestamp null, updated_at timestamp null);
insert into emprestimos (id,exemplar_id,pessoa_id,data_emprestimo,data_devolucao) values
  (1,3,2,'2025-06-11',null),          -- aberto
  (2,1,2,'2025-01-01','2025-01-10'),  -- devolvido
  (3,99,2,'2025-02-01',null);         -- exemplar órfão → descartado
