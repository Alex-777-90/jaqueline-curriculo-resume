-- 1. Antes, crie a usuária em Supabase > Authentication > Users > Add user.
-- 2. Troque o e-mail abaixo se o login escolhido for diferente do currículo.
-- 3. Execute no SQL Editor (nunca no navegador público).
do $$
declare
  email_da_editora text := 'jaque.sousa1@hotmail.com';
  id_da_editora uuid;
begin
  select id into id_da_editora from auth.users where lower(email) = lower(email_da_editora);
  if id_da_editora is null then
    raise exception 'Crie primeiro a usuária em Authentication > Users com o e-mail informado.';
  end if;
  insert into public.site_editors(user_id) values (id_da_editora) on conflict do nothing;
end;
$$;
-- Para revogar acesso, remova o UUID correspondente em public.site_editors.
