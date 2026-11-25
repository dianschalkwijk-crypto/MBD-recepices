-- Additive household extension. Existing recipe, ratings, preferences and archives are untouched.
BEGIN;
CREATE OR REPLACE FUNCTION public.mbd_kitchen_valid(s jsonb) RETURNS boolean LANGUAGE plpgsql IMMUTABLE SET search_path=pg_catalog,public AS $$
DECLARE k text; x jsonb; b jsonb; reserved numeric; item_ids jsonb:='{}'; w record; i record;
BEGIN
 IF s->>'schema' IS DISTINCT FROM '1' OR octet_length(s::text)>4000000 THEN RETURN false; END IF;
 FOREACH k IN ARRAY ARRAY['products','shopping','inventory','reservations','weeks','orders'] LOOP IF jsonb_typeof(s->k)<>'object' OR s->k IS NULL THEN RETURN false; END IF; END LOOP;
 IF (SELECT count(*)<>count(DISTINCT value->>'identity') FROM jsonb_each(s->'products')) THEN RETURN false; END IF;
 FOR k,x IN SELECT key,value FROM jsonb_each(s->'products') LOOP
  IF k !~ '^[0-9a-fA-F-]{36}$' OR coalesce(x->>'id','')<>k OR length(trim(coalesce(x->>'name','')))=0 OR length(coalesce(x->>'identity',''))=0 THEN RETURN false; END IF;
 END LOOP;
 FOR w IN SELECT key,value FROM jsonb_each(s->'weeks') LOOP
  IF w.key !~ '^\d{4}-\d{2}-\d{2}$' OR extract(isodow FROM w.key::date)<>1 OR jsonb_typeof(w.value->'items')<>'object' THEN RETURN false; END IF;
  FOR i IN SELECT key,value FROM jsonb_each(w.value->'items') LOOP
   IF i.key IS DISTINCT FROM ((i.value->>'date')||'|'||(i.value->>'slot')) OR coalesce(i.value->>'date','') !~ '^\d{4}-\d{2}-\d{2}$' OR coalesce(i.value->>'slot','') NOT IN ('breakfast','morning','lunch','afternoon','dinner','evening') OR coalesce(i.value->>'id','') !~ '^[0-9a-fA-F-]{36}$' OR (i.value->>'date')::date<w.key::date OR (i.value->>'date')::date>w.key::date+6 OR item_ids ? (i.value->>'id') THEN RETURN false; END IF;
   item_ids:=item_ids||jsonb_build_object(i.value->>'id',true);
  END LOOP;
 END LOOP;
 FOR k,b IN SELECT key,value FROM jsonb_each(s->'inventory') LOOP
  IF k !~ '^[0-9a-fA-F-]{36}$' OR coalesce(b->>'id','')<>k OR jsonb_typeof(b->'quantity') IS DISTINCT FROM 'number' OR (b->>'quantity')::numeric<0 OR (b->>'quantity')::numeric>1000000 OR coalesce(b->>'location','') NOT IN ('freezer','fridge','pantry','spices') THEN RETURN false; END IF;
  SELECT coalesce(sum((value->>'quantity')::numeric),0) INTO reserved FROM jsonb_each(s->'reservations') WHERE value->>'batchId'=k AND value->>'status'='reserved';
  IF reserved>(b->>'quantity')::numeric THEN RETURN false; END IF;
 END LOOP;
 FOR k,x IN SELECT key,value FROM jsonb_each(s->'reservations') LOOP
  IF coalesce(x->>'status','') NOT IN ('reserved','used','cancelled') OR NOT (s->'inventory' ? (x->>'batchId')) OR jsonb_typeof(x->'quantity') IS DISTINCT FROM 'number' OR (x->>'quantity')::numeric<=0 THEN RETURN false; END IF;
  IF x->>'status'='reserved' AND NOT (item_ids ? (x->>'itemId')) THEN RETURN false; END IF;
 END LOOP;
 FOR k,b IN SELECT key,value FROM jsonb_each(s->'shopping') LOOP
  FOR x IN SELECT value FROM jsonb_each(b->'manual') LOOP IF jsonb_typeof(x) IS DISTINCT FROM 'number' OR x::numeric<0 OR x::numeric>1000000 THEN RETURN false; END IF; END LOOP;
 END LOOP;
 RETURN true;
EXCEPTION WHEN OTHERS THEN RETURN false;
END; $$;
CREATE TABLE IF NOT EXISTS public.mbd_kitchen_state(
 owner_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
 revision bigint NOT NULL DEFAULT 0 CHECK(revision>=0),
 data jsonb NOT NULL,
 updated_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT mbd_kitchen_state_valid CHECK(public.mbd_kitchen_valid(data||jsonb_build_object('weeks','{}'::jsonb)))
);
CREATE TABLE IF NOT EXISTS public.mbd_kitchen_actions(
 owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
 request_id uuid NOT NULL,
 revision bigint NOT NULL,
 event jsonb NOT NULL CHECK(octet_length(event::text)<1000000),
 created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(owner_id,request_id)
);
-- State check above cannot require planned items: plans live in existing week_menus.
-- Complete cross-entity validation happens inside the transaction below.
ALTER TABLE public.mbd_kitchen_state DROP CONSTRAINT IF EXISTS mbd_kitchen_state_valid;
ALTER TABLE public.mbd_kitchen_state ADD CONSTRAINT mbd_kitchen_state_valid CHECK(
 jsonb_typeof(data)='object' AND data->>'schema'='1' AND octet_length(data::text)<4000000
 AND jsonb_typeof(data->'products')='object' AND jsonb_typeof(data->'inventory')='object'
 AND jsonb_typeof(data->'reservations')='object' AND jsonb_typeof(data->'shopping')='object');
ALTER TABLE public.mbd_kitchen_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mbd_kitchen_actions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS kitchen_owner ON public.mbd_kitchen_state;
CREATE POLICY kitchen_owner ON public.mbd_kitchen_state FOR ALL TO authenticated USING(owner_id=(SELECT auth.uid())) WITH CHECK(owner_id=(SELECT auth.uid()));
DROP POLICY IF EXISTS kitchen_action_read ON public.mbd_kitchen_actions;
CREATE POLICY kitchen_action_read ON public.mbd_kitchen_actions FOR SELECT TO authenticated USING(owner_id=(SELECT auth.uid()));
DROP POLICY IF EXISTS kitchen_action_insert ON public.mbd_kitchen_actions;
CREATE POLICY kitchen_action_insert ON public.mbd_kitchen_actions FOR INSERT TO authenticated WITH CHECK(owner_id=(SELECT auth.uid()));
REVOKE ALL ON public.mbd_kitchen_state,public.mbd_kitchen_actions FROM PUBLIC,anon;
GRANT SELECT,INSERT,UPDATE ON public.mbd_kitchen_state TO authenticated;
GRANT SELECT,INSERT ON public.mbd_kitchen_actions TO authenticated;
CREATE OR REPLACE FUNCTION public.mbd_kitchen_guard() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog,public AS $$
DECLARE full_state jsonb;
BEGIN
 IF TG_OP='UPDATE' AND (NEW.owner_id<>OLD.owner_id OR NEW.revision<>OLD.revision+1) THEN RAISE EXCEPTION 'Revision conflict' USING ERRCODE='40001'; END IF;
 SELECT NEW.data||jsonb_build_object('weeks',coalesce(jsonb_object_agg(week_start::text,meals) FILTER(WHERE meals->>'schemaVersion'='2'),'{}')) INTO full_state FROM public.week_menus WHERE owner_id=NEW.owner_id;
 IF NOT public.mbd_kitchen_valid(full_state) THEN RAISE EXCEPTION 'Invalid household state' USING ERRCODE='23514'; END IF;
 NEW.updated_at:=now();RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS mbd_kitchen_guard ON public.mbd_kitchen_state;
CREATE TRIGGER mbd_kitchen_guard BEFORE INSERT OR UPDATE ON public.mbd_kitchen_state FOR EACH ROW EXECUTE FUNCTION public.mbd_kitchen_guard();
CREATE OR REPLACE FUNCTION public.mbd_kitchen_read() RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=pg_catalog,public AS $$
DECLARE o uuid:=auth.uid();result jsonb;
BEGIN
 IF o IS NULL THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE='42501'; END IF;
 SELECT jsonb_build_object('revision',revision,'data',data||jsonb_build_object('weeks',coalesce((SELECT jsonb_object_agg(week_start::text,meals) FROM public.week_menus WHERE owner_id=o AND meals->>'schemaVersion'='2'),'{}'))) INTO result FROM public.mbd_kitchen_state WHERE owner_id=o;
 RETURN coalesce(result,jsonb_build_object('revision',0,'data',null));
END; $$;
CREATE OR REPLACE FUNCTION public.mbd_kitchen_commit(p_request_id uuid,p_expected_revision bigint,p_state jsonb,p_event jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=pg_catalog,public AS $$
DECLARE o uuid:=auth.uid();r bigint;w record;empty_state jsonb:='{"schema":1,"products":{},"shopping":{},"inventory":{},"reservations":{},"orders":{},"settings":{},"seen":[]}';
BEGIN
 IF o IS NULL THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE='42501'; END IF;
 IF p_request_id IS NULL OR NOT public.mbd_kitchen_valid(p_state) THEN RAISE EXCEPTION 'Invalid household state' USING ERRCODE='23514'; END IF;
 INSERT INTO public.mbd_kitchen_state(owner_id,data) VALUES(o,empty_state) ON CONFLICT(owner_id) DO NOTHING;
 SELECT revision INTO r FROM public.mbd_kitchen_state WHERE owner_id=o FOR UPDATE;
 IF EXISTS(SELECT 1 FROM public.mbd_kitchen_actions WHERE owner_id=o AND request_id=p_request_id) THEN RETURN public.mbd_kitchen_read()||'{"replayed":true}'; END IF;
 IF r<>p_expected_revision THEN RAISE EXCEPTION 'Household revision conflict' USING ERRCODE='40001'; END IF;
 -- Update only explicitly represented schema-v2 weeks. Never delete legacy weeks or archives.
 FOR w IN SELECT key,value FROM jsonb_each(p_state->'weeks') LOOP
  IF EXISTS(SELECT 1 FROM public.week_menus WHERE owner_id=o AND week_start=w.key::date AND coalesce(meals->>'schemaVersion','')<>'2') THEN RAISE EXCEPTION 'Legacy week requires explicit migration' USING ERRCODE='23514'; END IF;
  INSERT INTO public.week_menus(owner_id,week_start,meals,servings) VALUES(o,w.key::date,w.value,greatest(1,ceil(coalesce((p_state->'settings'->>'adults')::numeric,1)+coalesce((p_state->'settings'->>'children')::numeric,2)*coalesce((p_state->'settings'->>'childPortion')::numeric,1))::integer)) ON CONFLICT(owner_id,week_start) DO UPDATE SET meals=excluded.meals,servings=excluded.servings;
 END LOOP;
 UPDATE public.mbd_kitchen_state SET data=p_state-'weeks',revision=r+1 WHERE owner_id=o;
 INSERT INTO public.mbd_kitchen_actions(owner_id,request_id,revision,event) VALUES(o,p_request_id,r+1,p_event);
 RETURN public.mbd_kitchen_read()||'{"replayed":false}';
END; $$;
CREATE OR REPLACE FUNCTION public.mbd_kitchen_week_guard() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog,public AS $$
DECLARE o uuid; full_state jsonb;
BEGIN
 IF TG_OP='DELETE' THEN o:=OLD.owner_id; ELSE o:=NEW.owner_id; END IF;
 SELECT data||jsonb_build_object('weeks',coalesce((SELECT jsonb_object_agg(week_start::text,meals) FROM public.week_menus WHERE owner_id=o AND meals->>'schemaVersion'='2'),'{}')) INTO full_state FROM public.mbd_kitchen_state WHERE owner_id=o;
 IF full_state IS NOT NULL AND NOT public.mbd_kitchen_valid(full_state) THEN RAISE EXCEPTION 'Week change leaves invalid stock reservation' USING ERRCODE='23514'; END IF;
 RETURN NULL;
END; $$;
DROP TRIGGER IF EXISTS mbd_kitchen_week_guard ON public.week_menus;
CREATE CONSTRAINT TRIGGER mbd_kitchen_week_guard AFTER INSERT OR UPDATE OR DELETE ON public.week_menus DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION public.mbd_kitchen_week_guard();
REVOKE ALL ON FUNCTION public.mbd_kitchen_read(),public.mbd_kitchen_commit(uuid,bigint,jsonb,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.mbd_kitchen_read(),public.mbd_kitchen_commit(uuid,bigint,jsonb,jsonb) TO authenticated;
COMMIT;
