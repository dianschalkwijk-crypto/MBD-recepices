-- Deploy before the route that calls mbd_claim_recipe_save.
-- No existing recipe, reservation or function is rewritten.
create schema if not exists private;
create table private.mbd_save_requests (
 fingerprint text primary key check (fingerprint ~ '^[a-f0-9]{64}$'),
 source_key text unique check (source_key is null or source_key ~ '^[a-f0-9]{64}$'),
 mdb text not null unique,
 created_at timestamptz not null default now()
);
alter table private.mbd_save_requests enable row level security;
revoke all on private.mbd_save_requests from public, anon, authenticated;
create or replace function public.mbd_claim_recipe_save(p_secret text, p_fingerprint text, p_source_key text default null)
returns jsonb language plpgsql security definer
set search_path to public, extensions, pg_temp
as $function$
declare v_mdb text;
begin
 if encode(extensions.digest(coalesce(p_secret,''),'sha256'),'hex') not in ('e122349c6cf9cbfe7cd3e881c6d6e35bae8ece379cb201e42a2d881dfb741bec', '62ba2054e5345db20ca06624559b04e1b55032ec676c010ddf4cd2f201fe5ccd', 'f9429f53075a169ac9d8936fe38ddd8f2530f3d0e5c071eebff97f3272afe85f') then raise exception 'unauthorized' using errcode='42501'; end if;
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
end $function$;
revoke all on function public.mbd_claim_recipe_save(text,text,text) from public;
grant execute on function public.mbd_claim_recipe_save(text,text,text) to anon, authenticated, service_role;

