-- Teste de sanidade do banco (pgTAP).
-- Garante que a esteira de testes de banco funciona antes de existir schema.
-- A partir da Fase 1, cada política de RLS (ACL) ganha seus próprios testes aqui.
begin;
select plan(1);
select ok(true, 'ambiente pgTAP operacional');
select * from finish();
rollback;
