-- Execute no SQL Editor de um projeto Supabase dedicado a este currículo.
-- Pode ser executado novamente sem apagar conteúdo.
begin;
create table if not exists public.site_editors (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.site_editors enable row level security;
revoke all on public.site_editors from anon, authenticated;
grant select on public.site_editors to authenticated;
drop policy if exists editor_reads_own_permission on public.site_editors;
create policy editor_reads_own_permission on public.site_editors for select to authenticated
  using (user_id = (select auth.uid()));

create table if not exists public.site_content (
  id text primary key check (id = 'main'),
  data jsonb not null check (jsonb_typeof(data) = 'object' and data ?& array['profile','settings','experiences','education','certificates','skills','videos','projects','highlights','languages']),
  revision integer not null default 1 check (revision > 0),
  updated_at timestamptz not null default now()
);
alter table public.site_content enable row level security;
revoke all on public.site_content from anon, authenticated;
grant select on public.site_content to anon, authenticated;
grant update (data, revision) on public.site_content to authenticated;
drop policy if exists public_reads_curriculum on public.site_content;
create policy public_reads_curriculum on public.site_content for select to anon, authenticated using (id = 'main');
drop policy if exists editor_updates_curriculum on public.site_content;
create policy editor_updates_curriculum on public.site_content for update to authenticated
  using (exists(select 1 from public.site_editors where user_id = (select auth.uid())))
  with check (id = 'main' and exists(select 1 from public.site_editors where user_id = (select auth.uid())));

create or replace function public.touch_curriculum() returns trigger language plpgsql set search_path = '' as $$
begin
  if new.revision <> old.revision + 1 then
    raise exception 'A revisão deve avançar exatamente uma versão';
  end if;
  new.updated_at = now();
  return new;
end;
$$;
revoke all on function public.touch_curriculum() from public;
drop trigger if exists touch_curriculum on public.site_content;
create trigger touch_curriculum before update on public.site_content for each row execute function public.touch_curriculum();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('curriculo-media','curriculo-media',true,20971520,array['image/jpeg','image/png','image/webp','application/pdf','video/mp4','video/webm'])
on conflict(id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
-- Leitura dos arquivos é pública: só envie mídias destinadas ao currículo público.
-- A API de objetos permanece protegida pelo RLS nativo do Supabase Storage.
drop policy if exists editor_reads_media on storage.objects;
create policy editor_reads_media on storage.objects for select to authenticated using (
  bucket_id = 'curriculo-media' and exists(select 1 from public.site_editors where user_id = (select auth.uid()))
);
drop policy if exists editor_uploads_media on storage.objects;
create policy editor_uploads_media on storage.objects for insert to authenticated with check (
  bucket_id = 'curriculo-media' and (storage.foldername(name))[1] = 'site'
  and exists(select 1 from public.site_editors where user_id = (select auth.uid()))
);
drop policy if exists editor_deletes_media on storage.objects;
create policy editor_deletes_media on storage.objects for delete to authenticated using (
  bucket_id = 'curriculo-media' and exists(select 1 from public.site_editors where user_id = (select auth.uid()))
);
commit;
