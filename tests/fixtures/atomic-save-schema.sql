-- Isolated PostgreSQL 17 integration fixture, NEVER a production migration.
-- Functions copied from the read-only production snapshot on 19 November 2026.
-- Only accepted credential hashes are replaced by a public test-only credential.
create schema extensions;
create extension pgcrypto with schema extensions;
create role anon nologin;
create role authenticated nologin;
create role service_role nologin;
create schema private;
create table public.mbd_catalog(mdb text primary key check(mdb ~ '^MDB-[0-9]{4}$'),recipe jsonb not null check(length(trim(coalesce(recipe->>'title','')))>0),updated_at timestamptz not null default now());
create table public.mbd_number_reservations(mdb text primary key,reserved_at timestamptz not null default now());
create table private.mbd_save_requests(fingerprint text primary key check(fingerprint ~ '^[a-f0-9]{64}$'),source_key text unique check(source_key is null or source_key ~ '^[a-f0-9]{64}$'),mdb text not null unique,created_at timestamptz not null default now());
alter table public.mbd_catalog enable row level security;
create policy catalog_read on public.mbd_catalog for select to anon,authenticated using(true);
grant select on public.mbd_catalog to anon,authenticated;
alter table private.mbd_save_requests enable row level security;
revoke all on private.mbd_save_requests from public,anon,authenticated;

CREATE OR REPLACE FUNCTION public.mbd_reserve_number(p_secret text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions', 'pg_temp'
AS $function$
declare v_n integer; v_mdb text;
begin
 if encode(extensions.digest(coalesce(p_secret,''),'sha256'),'hex') not in ('7c6234c2ea17f03ac6135cac8c8481b0f7080e5e07f4a296d9c376adcebb21a3', '7c6234c2ea17f03ac6135cac8c8481b0f7080e5e07f4a296d9c376adcebb21a3', '7c6234c2ea17f03ac6135cac8c8481b0f7080e5e07f4a296d9c376adcebb21a3') then raise exception 'unauthorized' using errcode='42501'; end if;
 perform pg_advisory_xact_lock(6452026);
 select greatest(coalesce((select max(substring(mdb from 5)::integer) from public.mbd_catalog where mdb ~ '^MDB-[0-9]+$'),0),coalesce((select max(substring(mdb from 5)::integer) from public.mbd_number_reservations where mdb ~ '^MDB-[0-9]+$'),0), 0686)+1 into v_n;
 v_mdb := 'MDB-'||lpad(v_n::text,4,'0');
 insert into public.mbd_number_reservations(mdb) values(v_mdb);
 return v_mdb;
end $function$
;

CREATE OR REPLACE FUNCTION public.mbd_claim_recipe_save(p_secret text, p_fingerprint text, p_source_key text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions', 'pg_temp'
AS $function$
declare v_mdb text;
begin
 if encode(extensions.digest(coalesce(p_secret,''),'sha256'),'hex') not in ('7c6234c2ea17f03ac6135cac8c8481b0f7080e5e07f4a296d9c376adcebb21a3', '7c6234c2ea17f03ac6135cac8c8481b0f7080e5e07f4a296d9c376adcebb21a3', '7c6234c2ea17f03ac6135cac8c8481b0f7080e5e07f4a296d9c376adcebb21a3') then raise exception 'unauthorized' using errcode='42501'; end if;
 if p_fingerprint is null and p_source_key is null then return jsonb_build_object('status','authorized'); end if;
 if p_fingerprint is null or p_fingerprint !~ '^[a-f0-9]{64}$' or
    (p_source_key is not null and p_source_key !~ '^[a-f0-9]{64}$') then
  raise exception 'invalid_save_identity';
 end if;
 -- Serialize with all existing number allocators. Check AND allocate in one transaction.
 perform pg_advisory_xact_lock(6452026);
 select mdb into v_mdb from private.mbd_save_requests
 where fingerprint=p_fingerprint or (p_source_key is not null and source_key=p_source_key)
 order by created_at limit 1;
 if found then
  return jsonb_build_object('mdb',v_mdb,'status',
   case when exists(select 1 from public.mbd_catalog where mdb=v_mdb) then 'stored' else 'processing' end);
 end if;
 v_mdb := public.mbd_reserve_number(p_secret);
 insert into private.mbd_save_requests(fingerprint,source_key,mdb) values(p_fingerprint,p_source_key,v_mdb);
 return jsonb_build_object('mdb',v_mdb,'status','claimed');
end $function$
;

CREATE OR REPLACE FUNCTION public.mbd_catalog_server_write(p_secret text, p_mdb text, p_recipe jsonb, p_expected_updated_at timestamp with time zone DEFAULT NULL::timestamp with time zone)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions', 'pg_temp'
AS $function$
declare
  v_existing public.mbd_catalog%rowtype;
  v_now timestamptz := now();
begin
  if encode(extensions.digest(coalesce(p_secret,''),'sha256'),'hex') not in ('7c6234c2ea17f03ac6135cac8c8481b0f7080e5e07f4a296d9c376adcebb21a3', '7c6234c2ea17f03ac6135cac8c8481b0f7080e5e07f4a296d9c376adcebb21a3', '7c6234c2ea17f03ac6135cac8c8481b0f7080e5e07f4a296d9c376adcebb21a3') then
    raise exception 'unauthorized' using errcode='42501';
  end if;

  if p_mdb !~ '^MDB-[0-9]{4}$' then
    raise exception 'invalid_mdb';
  end if;

  if length(trim(coalesce(p_recipe->>'title',''))) = 0 then
    raise exception 'missing_title';
  end if;

  select * into v_existing
  from public.mbd_catalog
  where mdb = p_mdb
  for update;

  if found then
    if p_expected_updated_at is null then
      return jsonb_build_object(
        'ok',false,'conflict',true,'reason','exists',
        'mdb',p_mdb,'updated_at',v_existing.updated_at
      );
    end if;

    if v_existing.updated_at is distinct from p_expected_updated_at then
      return jsonb_build_object(
        'ok',false,'conflict',true,'reason','stale',
        'mdb',p_mdb,'updated_at',v_existing.updated_at
      );
    end if;

    update public.mbd_catalog
    set recipe = p_recipe, updated_at = v_now
    where mdb = p_mdb;

    return jsonb_build_object(
      'ok',true,'conflict',false,'action','updated',
      'mdb',p_mdb,'updated_at',v_now
    );
  end if;

  if p_expected_updated_at is not null then
    return jsonb_build_object(
      'ok',false,'conflict',true,'reason','missing','mdb',p_mdb
    );
  end if;

  insert into public.mbd_catalog(mdb,recipe,updated_at)
  values (p_mdb,p_recipe,v_now);

  return jsonb_build_object(
    'ok',true,'conflict',false,'action','inserted',
    'mdb',p_mdb,'updated_at',v_now
  );
end;
$function$
;

revoke all on function public.mbd_claim_recipe_save(text,text,text) from public;
revoke all on function public.mbd_reserve_number(text) from public;
revoke all on function public.mbd_catalog_server_write(text,text,jsonb,timestamptz) from public;
grant execute on function public.mbd_claim_recipe_save(text,text,text), public.mbd_reserve_number(text), public.mbd_catalog_server_write(text,text,jsonb,timestamptz) to anon,authenticated,service_role;
