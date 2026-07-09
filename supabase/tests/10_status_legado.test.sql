-- Fase 8 — os status do legado (extraviado, vencido) foram preservados no schema.
begin;
select plan(2);

select is(
  (select count(*)::int from status where codigo = 'extraviado'),
  1, 'status extraviado existe'
);
select is(
  (select count(*)::int from status where codigo = 'vencido'),
  1, 'status vencido existe'
);

select * from finish();
rollback;
