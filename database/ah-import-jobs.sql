-- Additive persistent checkpoints. Existing recipes, claims and numbers are untouched.
create table public.mbd_ah_import_jobs (
 source_key text primary key check(source_key ~ '^ah:[0-9]+$'),
 owner_id uuid not null references auth.users(id),
 state jsonb not null default '{}'::jsonb check(jsonb_typeof(state)='object'),
 collections jsonb not null default '[]'::jsonb check(jsonb_typeof(collections)='array'),
 lease uuid,
 lease_until timestamptz,
 updated_at timestamptz not null default now()
);
alter table public.mbd_ah_import_jobs enable row level security;
create policy ah_admin_read on public.mbd_ah_import_jobs for select to authenticated using(public.is_admin());
revoke all on public.mbd_ah_import_jobs from anon,authenticated;
grant select(source_key,owner_id,state,collections,updated_at) on public.mbd_ah_import_jobs to authenticated;
create index mbd_ah_import_jobs_owner on public.mbd_ah_import_jobs(owner_id);
create or replace function public.mbd_ah_checkpoint(p_secret text,p_key text,p_action text,p_owner uuid default null,p_lease uuid default null,p_state jsonb default '{}'::jsonb,p_collections jsonb default '[]'::jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare j public.mbd_ah_import_jobs%rowtype; check_result jsonb;
begin
 -- Existing secret validator, read-only mode: never allocates a number.
 check_result:=public.mbd_claim_recipe_save(p_secret,null,null);
 if check_result->>'status'<>'authorized' then raise exception 'Unauthorized' using errcode='42501'; end if;
 if p_key !~ '^ah:[0-9]+$' or jsonb_typeof(p_state)<>'object' or jsonb_typeof(p_collections)<>'array' then raise exception 'Ongeldige import'; end if;
 if p_action='claim' then
  perform pg_advisory_xact_lock(hashtext('mbd_ah_import_pipeline'));
  if exists(select 1 from public.mbd_ah_import_jobs where source_key<>p_key and lease_until>now()) then return jsonb_build_object('busy',true,'state','{}'::jsonb); end if;
  if not exists(select 1 from public.profiles where user_id=p_owner and role='admin') then raise exception 'Beheerder vereist' using errcode='42501'; end if;
  insert into public.mbd_ah_import_jobs(source_key,owner_id) values(p_key,p_owner) on conflict do nothing;
  select * into j from public.mbd_ah_import_jobs where source_key=p_key for update;
  if j.lease_until>now() then return jsonb_build_object('busy',true,'state',j.state); end if;
  update public.mbd_ah_import_jobs set lease=gen_random_uuid(),lease_until=now()+interval '3 minutes',collections=(select coalesce(jsonb_agg(distinct x),'[]'::jsonb) from jsonb_array_elements(j.collections||p_collections) x),updated_at=now() where source_key=p_key returning * into j;
 elsif p_action in ('checkpoint','release') then
  update public.mbd_ah_import_jobs set state=state||p_state,lease_until=case when p_action='release' then null else now()+interval '3 minutes' end,lease=case when p_action='release' then null else lease end,updated_at=now() where source_key=p_key and lease=p_lease and lease_until>now() returning * into j;
  if not found then raise exception 'Importvergrendeling verlopen; lees de voortgang opnieuw'; end if;
 else raise exception 'Ongeldige checkpointactie'; end if;
 return jsonb_build_object('busy',false,'lease',j.lease,'state',j.state,'collections',j.collections);
end $$;
revoke all on function public.mbd_ah_checkpoint(text,text,text,uuid,uuid,jsonb,jsonb) from public;
grant execute on function public.mbd_ah_checkpoint(text,text,text,uuid,uuid,jsonb,jsonb) to anon,authenticated;
