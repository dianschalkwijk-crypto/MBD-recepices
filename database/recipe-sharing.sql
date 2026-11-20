-- Additive schema; existing catalog, numbers, accounts and source fields are preserved.
create table public.mbd_recipe_links (
 token uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id),
 recipe_id uuid not null references public.recipes(id),
 created_at timestamptz not null default now(),
 revoked_at timestamptz
);
alter table public.mbd_recipe_links enable row level security;
create index mbd_recipe_links_owner on public.mbd_recipe_links(owner_id);
create policy links_owner_read on public.mbd_recipe_links for select to authenticated using(owner_id=(select auth.uid()));
create policy links_owner_insert on public.mbd_recipe_links for insert to authenticated with check(owner_id=(select auth.uid()) and public.has_app_access() and exists(select 1 from public.recipes r where r.id=recipe_id and r.owner_id=(select auth.uid()) and r.deleted_at is null));
create policy links_owner_revoke on public.mbd_recipe_links for update to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
revoke all on public.mbd_recipe_links from anon,authenticated;
grant select,insert on public.mbd_recipe_links to authenticated;
grant update(revoked_at) on public.mbd_recipe_links to authenticated;

create table public.mbd_saved_recipes (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id),
 source_key text not null,
 recipe jsonb not null check(jsonb_typeof(recipe)='object'),
 added_at timestamptz not null default now(),
 unique(owner_id,source_key)
);
alter table public.mbd_saved_recipes enable row level security;
create index mbd_saved_recipes_owner on public.mbd_saved_recipes(owner_id);
create policy saved_owner_admin_read on public.mbd_saved_recipes for select to authenticated using(owner_id=(select auth.uid()) or public.is_admin());
-- Inserts only through the bounded adoption function below. No client-supplied snapshots.
revoke all on public.mbd_saved_recipes from anon,authenticated;
grant select,delete on public.mbd_saved_recipes to authenticated;
create policy saved_owner_delete on public.mbd_saved_recipes for delete to authenticated using(owner_id=(select auth.uid()));

create table public.mbd_social_checks (
 mdb text primary key references public.mbd_catalog(mdb),
 social_url text not null,
 status text not null check(status in ('available','unavailable','restricted','unverified')),
 checked_at timestamptz not null default now(),
 evidence text not null default '',
 checked_by uuid not null references auth.users(id)
);
alter table public.mbd_social_checks enable row level security;
create policy social_check_public_read on public.mbd_social_checks for select to anon,authenticated using(true);
revoke all on public.mbd_social_checks from anon,authenticated;
grant select(mdb,social_url,status,checked_at) on public.mbd_social_checks to anon,authenticated;

create or replace function public.mbd_shared_recipe(p_token uuid) returns jsonb
language sql stable security definer set search_path='' as $$
 select jsonb_build_object('id',r.id,'title',r.title,'ingredients',r.ingredients,'steps',r.instructions,'photoURL',r.image_url,'sourceURL',r.source_url,'sourceKind',r.source_kind,'mdb',r.mbd_number)
 from public.mbd_recipe_links l join public.recipes r on r.id=l.recipe_id
 where l.token=p_token and l.revoked_at is null and r.deleted_at is null
$$;
revoke all on function public.mbd_shared_recipe(uuid) from public;
grant execute on function public.mbd_shared_recipe(uuid) to anon,authenticated;

create or replace function public.mbd_save_shared_recipe(p_mdb text default null,p_token uuid default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); payload jsonb; result_id uuid; key text;
begin
 if uid is null or not public.has_app_access() then raise exception 'Log in met een actief account om dit recept toe te voegen' using errcode='42501'; end if;
 if (p_mdb is null)=(p_token is null) then raise exception 'Kies precies één gedeeld recept'; end if;
 if p_mdb is not null then
  if p_mdb !~ '^MDB-[0-9]{4}$' then raise exception 'Ongeldig receptnummer'; end if;
  select c.recipe into payload from public.mbd_catalog c where c.mdb=p_mdb and coalesce(c.recipe->>'syncStatus','')<>'duplicate-quarantined';
  if payload is null then raise exception 'Recept niet gevonden'; end if;
  -- Explicit public recipe fields only; never copy account notes, file paths or Notion links.
  payload:=jsonb_build_object('mdb',p_mdb,'title',payload->>'title','ingredients',payload->'ingredients','steps',payload->'steps','portions',payload->>'portions','photoURL',case when payload->>'hasPhoto'='true' or coalesce(payload->>'photoURL','')<>'' then '/api/notion/photo?mdb='||p_mdb else '' end,'sourceURL',payload->>'sourceURL','originalSourceURL',payload->>'originalSourceURL','contentURL',payload->>'contentURL','socialURL',payload->>'socialURL','socialSourceURL',payload->>'socialSourceURL','contentSourceURL',payload->>'contentSourceURL','collections',payload->'collections');
  key:='catalog:'||p_mdb;
 else
  payload:=public.mbd_shared_recipe(p_token);
  if payload is null then raise exception 'Deellink is niet beschikbaar of is ingetrokken'; end if;
  key:='recipe:'||(payload->>'id');
  payload:=payload||jsonb_build_object('shareToken',p_token);
 end if;
 insert into public.mbd_saved_recipes(owner_id,source_key,recipe) values(uid,key,payload)
 on conflict(owner_id,source_key) do nothing returning id into result_id;
 if result_id is null then select id into result_id from public.mbd_saved_recipes where owner_id=uid and source_key=key; end if;
 return jsonb_build_object('id',result_id,'saved',true);
end $$;
revoke all on function public.mbd_save_shared_recipe(text,uuid) from public;
grant execute on function public.mbd_save_shared_recipe(text,uuid) to authenticated;

create or replace function public.mbd_record_social_check(p_mdb text,p_url text,p_status text,p_evidence text default '') returns jsonb
language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or not public.is_admin() then raise exception 'Alleen de beheerder kan broncontroles vastleggen' using errcode='42501'; end if;
 if p_status not in ('available','unavailable','restricted','unverified') then raise exception 'Ongeldige status'; end if;
 if p_status='unavailable' and length(trim(p_evidence))<8 then raise exception 'Beschrijf het bewijs dat deze specifieke socialpost is verwijderd'; end if;
 if not exists(select 1 from public.mbd_catalog c where c.mdb=p_mdb and p_url in (c.recipe->>'socialURL',c.recipe->>'socialSourceURL',c.recipe->>'originalSourceURL',c.recipe->>'sourceURL',c.recipe->>'contentURL',c.recipe->>'contentSourceURL')) then raise exception 'De URL hoort niet bij dit recept'; end if;
 insert into public.mbd_social_checks(mdb,social_url,status,evidence,checked_by) values(p_mdb,p_url,p_status,p_evidence,auth.uid())
 on conflict(mdb) do update set social_url=excluded.social_url,status=excluded.status,evidence=excluded.evidence,checked_by=excluded.checked_by,checked_at=now();
 return jsonb_build_object('saved',true,'status',p_status);
end $$;
revoke all on function public.mbd_record_social_check(text,text,text,text) from public;
grant execute on function public.mbd_record_social_check(text,text,text,text) to authenticated;
