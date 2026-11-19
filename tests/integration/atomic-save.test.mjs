import {test,before,after,beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import {createHash} from 'node:crypto';

const IMAGE='postgres@sha256:ff87138949ad9a46f32ff23bd6852b52ce024a13dffe9b4087be98292cdd3b4f';
const container='mbd-save-test-'+process.pid,secret='mbd-local-integration-secret';
const env={...process.env};for(const key of ['DOCKER_HOST','DOCKER_CONTEXT','DOCKER_TLS','DOCKER_TLS_VERIFY','DOCKER_CERT_PATH'])delete env[key];
const hash=s=>createHash('sha256').update(s).digest('hex');
const literal=value=>value===null?'NULL':"'"+String(value).replaceAll("'","''")+"'";
let server,bridge,created=false,state;
function command(bin,args,input=''){return new Promise((resolve,reject)=>{const p=spawn(bin,args,{env,stdio:['pipe','pipe','pipe']});let out='',err='';p.stdout.on('data',c=>out+=c);p.stderr.on('data',c=>err+=c);p.on('error',reject);p.on('close',code=>code===0?resolve(out.trim()):reject(Error(err.trim()||`${bin} exited ${code}`)));p.stdin.end(input);});}
const docker=(args,input)=>command('docker',['--host=unix:///var/run/docker.sock',...args],input);
function sql(query){if(!container.startsWith('mbd-save-test-'))throw Error('Unsafe integration target');return docker(['exec','-i',container,'psql','-h','127.0.0.1','-U','postgres','-d','mbd_concurrency_test','-X','-qAt','-v','ON_ERROR_STOP=1'],query);}
async function json(query){return JSON.parse(await sql(query));}
const draft=(title='Concurrency test',sourceURL='https://fixture.invalid/recipe')=>({title,ingredients:'1 test onion',steps:'Cook the test onion.',sourceURL});
function invoke(body=draft(),options={}){return command(process.execPath,['--experimental-strip-types',new URL('./route-worker.mjs',import.meta.url).pathname],JSON.stringify({bridge,draft:body,...options})).then(JSON.parse);}
async function counts(){return json("select jsonb_build_object('catalog',(select count(*) from public.mbd_catalog),'reservations',(select count(*) from public.mbd_number_reservations),'claims',(select count(*) from private.mbd_save_requests));");}
function send(res,value,status=200){res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify(value));}
async function upstream(req,res){
 try{
  let text='';for await(const part of req)text+=part;const r=JSON.parse(text),url=new URL(r.url),b=r.body;
  if(url.hostname==='ywsdubincfabjhvjqkot.supabase.co'){
   if(url.pathname==='/rest/v1/mbd_catalog'){
    if(url.searchParams.has('mdb')&&state.fault==='readback-missing')return send(res,[]);
    const where=url.searchParams.has('mdb')?' where mdb='+literal(url.searchParams.get('mdb').replace(/^eq\./,'')):'';
    const offset=Number(url.searchParams.get('offset'))||0,limit=Number(url.searchParams.get('limit'))||500;
    const rows=await json('select coalesce(jsonb_agg(x),\'[]\'::jsonb) from (select mdb,recipe from public.mbd_catalog'+where+' order by mdb limit '+limit+' offset '+offset+') x;');
    if(!where&&offset===0&&state.raceSize){await new Promise(resolve=>{state.waiters.push(resolve);if(state.waiters.length===state.raceSize){state.raceSize=0;for(const release of state.waiters)release();}});}
    return send(res,rows);
   }
   if(url.pathname.endsWith('/mbd_claim_recipe_save'))return send(res,await json('select public.mbd_claim_recipe_save('+[b.p_secret,b.p_fingerprint??null,b.p_source_key??null].map(literal).join(',')+');'));
   if(url.pathname.endsWith('/mbd_reserve_number'))return send(res,await json('select to_jsonb(public.mbd_reserve_number('+literal(b.p_secret)+'));'));
   if(url.pathname.endsWith('/mbd_catalog_server_write')){
    if(state.fault==='before-write'){state.fault='';return send(res,{message:'Fixture failure before commit'},503);}
    const value=await json('select public.mbd_catalog_server_write('+[literal(b.p_secret),literal(b.p_mdb),literal(JSON.stringify(b.p_recipe))+'::jsonb','NULL'].join(',')+');');
    if(state.fault==='after-write'){state.fault='';return send(res,{message:'Fixture response lost after real commit'},503);}return send(res,value);
   }
   throw Error('Unexpected database endpoint');
  }
  if(url.hostname!=='api.notion.com')throw Error('Real external network forbidden');
  if(url.pathname.includes('/data_sources/'))return send(res,{results:url.pathname.includes('7780dc25')?[{id:'fixture-book',properties:{'Boeknr.':{number:31},Kookboek:{title:[{plain_text:'Fixture book'}]}}}]:state.fullBook?Array.from({length:30},(_,i)=>({id:'fixture-existing-'+i})):[]});
  if(url.pathname==='/v1/pages'){
   if(!b.properties['MDB-ID']){state.bookCreates++;return send(res,{id:'fixture-new-book'});}
   state.notionCreates++;if(state.fault==='notion-response-lost'){state.fault='';return send(res,{message:'Fixture Notion response lost'},503);}
   const mdb=b.properties['MDB-ID'].rich_text[0].text.content;return send(res,{id:'fixture-page-'+mdb,url:'https://notion.invalid/'+mdb});
  }
  if(url.pathname.startsWith('/v1/pages/')){if(b?.in_trash)state.trashes++;return send(res,{ok:true});}
  throw Error('Unexpected Notion fixture endpoint');
 }catch(e){send(res,{message:e.message},e.message.includes('unauthorized')?401:500);}
}
before(async()=>{
 await docker(['run','--rm','--detach','--name',container,'--network','none','-e','POSTGRES_HOST_AUTH_METHOD=trust','-e','POSTGRES_DB=mbd_concurrency_test',IMAGE]);created=true;
 for(let i=0;;i++){try{await docker(['exec',container,'pg_isready','-h','127.0.0.1','-U','postgres','-d','mbd_concurrency_test']);break;}catch(e){if(i===40)throw e;await new Promise(r=>setTimeout(r,250));}}
 await sql(await readFile(new URL('../fixtures/atomic-save-schema.sql',import.meta.url),'utf8'));
 assert.match(await sql('select version();'),/PostgreSQL 17\.11/);
 server=createServer(upstream);await new Promise(r=>server.listen(0,'127.0.0.1',r));bridge='http://127.0.0.1:'+server.address().port;
});
after(async()=>{if(server){server.closeAllConnections();await new Promise(r=>server.close(r));}if(created)await docker(['stop',container]);});
beforeEach(async()=>{state={fault:'',notionCreates:0,bookCreates:0,fullBook:false,trashes:0,raceSize:0,waiters:[]};await sql("truncate private.mbd_save_requests,public.mbd_number_reservations,public.mbd_catalog; insert into public.mbd_catalog(mdb,recipe) values('MDB-0705','{\"title\":\"Isolated baseline fixture\"}');");});

test('real PostgreSQL: twelve overlapping sessions claim exactly one number',async()=>{
 const calls=await Promise.all(Array.from({length:12},()=>json('select jsonb_build_object(\'backend\',pg_backend_pid(),\'claim\',public.mbd_claim_recipe_save('+[secret,hash('same-content'),hash('same-source')].map(literal).join(',')+'));')));
 assert.equal(new Set(calls.map(x=>x.backend)).size,12);assert.equal(calls.filter(x=>x.claim.status==='claimed').length,1);assert.equal(new Set(calls.map(x=>x.claim.mdb)).size,1);assert.deepEqual(await counts(),{catalog:1,reservations:1,claims:1});
});
test('real PostgreSQL: matching source deduplicates different content and distinct sources allocate distinct numbers',async()=>{
 const same=await Promise.all(Array.from({length:8},(_,i)=>json('select public.mbd_claim_recipe_save('+[secret,hash('content-'+i),hash('one-source')].map(literal).join(',')+');')));assert.equal(new Set(same.map(x=>x.mdb)).size,1);
 const different=await Promise.all(Array.from({length:8},(_,i)=>json('select public.mbd_claim_recipe_save('+[secret,hash('different-content-'+i),hash('source-'+i)].map(literal).join(',')+');')));assert.equal(new Set(different.map(x=>x.mdb)).size,8);assert.equal((await counts()).reservations,9);
});
test('separate server instances: concurrent identical uploads create one Notion fixture and one real stored row',async()=>{
 state.raceSize=8;const results=await Promise.all(Array.from({length:8},()=>invoke()));
 assert.equal(new Set(results.map(x=>x.instance)).size,8);assert.equal(results.filter(x=>x.status===200).length,1);assert.equal(results.filter(x=>x.status===409).length,7);assert.equal(new Set(results.map(x=>x.data.mdb)).size,1);assert.equal(state.notionCreates,1);assert.deepEqual(await counts(),{catalog:2,reservations:1,claims:1});
});
test('separate server instances: retry after failure before storage preserves claim and number without a second Notion page',async()=>{
 state.fault='before-write';const first=await invoke(),retry=await invoke();assert.equal(first.status,502);assert.equal(retry.status,409);assert.equal(retry.data.mdb,first.data.mdb);assert.equal(retry.data.code,'save_in_progress');assert.equal(state.notionCreates,1);assert.equal(state.trashes,0);assert.deepEqual(await counts(),{catalog:1,reservations:1,claims:1});
});
test('identical concurrent uploads at a full book create only one next book after claiming',async()=>{
 state.raceSize=6;state.fullBook=true;const results=await Promise.all(Array.from({length:6},()=>invoke()));assert.equal(results.filter(x=>x.status===200).length,1);assert.equal(state.bookCreates,1);assert.equal(state.notionCreates,1);assert.deepEqual(await counts(),{catalog:2,reservations:1,claims:1});
});
test('separate server instances: response loss after real commit is reconciled as the same stored recipe',async()=>{
 state.fault='after-write';const first=await invoke(),retry=await invoke();assert.equal(first.status,502);assert.equal(retry.status,409);assert.equal(retry.data.mdb,first.data.mdb);assert.equal(state.notionCreates,1);assert.equal(state.trashes,0);assert.deepEqual(await counts(),{catalog:2,reservations:1,claims:1});
 const stored=await json('select public.mbd_claim_recipe_save('+[secret,hash(JSON.stringify(['concurrency test','1 test onion','cook the test onion.'])),null].map(literal).join(',')+');');assert.equal(stored.status,'stored');assert.equal(stored.mdb,first.data.mdb);
});
test('readback failure never compensates a committed recipe or permits another claim',async()=>{
 state.fault='readback-missing';const first=await invoke();assert.equal(first.status,502);assert.equal(first.data.code,'save_outcome_unknown');assert.equal(state.trashes,0);state.fault='';const retry=await invoke();assert.equal(retry.data.mdb,first.data.mdb);assert.deepEqual(await counts(),{catalog:2,reservations:1,claims:1});
});
test('real PostgreSQL: wrong secret and invalid identity do not mutate; private claims remain inaccessible',async()=>{
 await assert.rejects(sql('select public.mbd_claim_recipe_save('+[literal('wrong'),literal(hash('content')),'NULL'].join(',')+');'),/unauthorized/);
 await assert.rejects(sql('select public.mbd_claim_recipe_save('+[literal(secret),literal('invalid'),'NULL'].join(',')+');'),/invalid_save_identity/);
 await assert.rejects(sql('set role anon; select * from private.mbd_save_requests;'),/permission denied/);assert.deepEqual(await counts(),{catalog:1,reservations:0,claims:0});
});
test('lost Notion creation response preserves the claim and reports its original number',async()=>{
 state.fault='notion-response-lost';const first=await invoke(),retry=await invoke();assert.equal(first.status,502);assert.equal(first.data.code,'save_outcome_unknown');assert.equal(first.data.reconciliationRequired,true);assert.equal(retry.status,409);assert.equal(retry.data.mdb,first.data.mdb);assert.equal(state.notionCreates,1);assert.deepEqual(await counts(),{catalog:1,reservations:1,claims:1});
});
test('non-mutating deployment check verifies all real claim authorization without reserving',async()=>{
 const result=await invoke(undefined,{method:'GET',query:{verify:'1'}});assert.equal(result.status,200);assert.equal(result.data.mutationPerformed,false);assert.deepEqual(await counts(),{catalog:1,reservations:0,claims:0});assert.equal(state.notionCreates,0);
});
