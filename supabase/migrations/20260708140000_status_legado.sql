-- Fase 8 — Migração de dados.
-- O sistema legado tinha 4 status (Disponível, Emprestado, Extraviado, Status Vencido).
-- Preservamos a classificação: além de 'disponivel'/'emprestado' (seed_acl), adicionamos
-- 'extraviado' e 'vencido'. Exemplares nesses status não são emprestáveis (a RPC só empresta
-- 'disponivel') — comportamento correto.
insert into public.status (codigo, nome) values
  ('extraviado', 'Extraviado'),
  ('vencido', 'Status Vencido')
on conflict (codigo) do nothing;
