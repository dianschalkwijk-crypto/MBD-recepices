DO $repair$
DECLARE r record; original text; updated text;
BEGIN
 FOR r IN SELECT oid FROM pg_proc WHERE pronamespace='public'::regnamespace AND proname IN ('mbd_reserve_number','mbd_catalog_server_write') LOOP
 original := pg_get_functiondef(r.oid);
 updated := replace(original, '<> ''e122349c6cf9cbfe7cd3e881c6d6e35bae8ece379cb201e42a2d881dfb741bec''', 'NOT IN (''e122349c6cf9cbfe7cd3e881c6d6e35bae8ece379cb201e42a2d881dfb741bec'', ''f09429c2cf82fbdd3b74c58a818168a3b71913e8768a121e499068fc9c3771da'')');
 IF original=updated THEN RAISE EXCEPTION 'Expected credential check missing'; END IF;
 EXECUTE updated;
 END LOOP;
END $repair$;
