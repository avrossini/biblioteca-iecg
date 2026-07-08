-- Seed de DESENVOLVIMENTO (somente local; roda no `supabase db reset`).
-- NÃO vai para produção. Cria usuários de teste para login local:
--   Administrador: rossini@gmail.com / biblioteca123
--   Atendente:     atendente@gmail.com / biblioteca123
do $$
declare
  v_uid uuid := '00000000-0000-0000-0000-0000000000a1';
begin
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data,
    confirmation_token, recovery_token, email_change_token_new, email_change,
    email_change_token_current, phone_change, phone_change_token, reauthentication_token
  ) values (
    '00000000-0000-0000-0000-000000000000', v_uid, 'authenticated', 'authenticated',
    'rossini@gmail.com', crypt('biblioteca123', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}', '{}',
    '', '', '', '', '', '', '', ''
  ) on conflict (id) do nothing;

  insert into auth.identities (
    provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  ) values (
    v_uid::text, v_uid,
    jsonb_build_object('sub', v_uid::text, 'email', 'rossini@gmail.com', 'email_verified', true),
    'email', now(), now(), now()
  ) on conflict do nothing;

  insert into public.usuario_grupo (user_id, grupo_id)
  select v_uid, id from public.grupos where nome = 'Administrador'
  on conflict do nothing;
end $$;

-- Segundo usuário de dev: Atendente (para testar a UI gated por permissão).
do $$
declare
  v_uid uuid := '00000000-0000-0000-0000-0000000000a2';
begin
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data,
    confirmation_token, recovery_token, email_change_token_new, email_change,
    email_change_token_current, phone_change, phone_change_token, reauthentication_token
  ) values (
    '00000000-0000-0000-0000-000000000000', v_uid, 'authenticated', 'authenticated',
    'atendente@gmail.com', crypt('biblioteca123', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}', '{}',
    '', '', '', '', '', '', '', ''
  ) on conflict (id) do nothing;

  insert into auth.identities (
    provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  ) values (
    v_uid::text, v_uid,
    jsonb_build_object('sub', v_uid::text, 'email', 'atendente@gmail.com', 'email_verified', true),
    'email', now(), now(), now()
  ) on conflict do nothing;

  insert into public.usuario_grupo (user_id, grupo_id)
  select v_uid, id from public.grupos where nome = 'Atendente'
  on conflict do nothing;
end $$;
