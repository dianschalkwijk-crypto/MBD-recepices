import {test,beforeEach,afterEach} from 'node:test';
import assert from 'node:assert/strict';
import handler,{canonicalSource,findDuplicate,readCatalog} from '../api/notion/save.ts';

const originalFetch=globalThis.fetch;
const originalEnv={NOTION_TOKEN:process.env.NOTION_TOKEN,MBD_SUPABASE_WRITE_SECRET:process.env.MBD_SUPABASE_WRITE_SECRET};
let calls,rows,next,writeMode,bookFails,trashFails;
const draft=(title='Groentesoep',url='https://example.org/recept')=>({title,ingredients:'200 g wortel',steps:'Kook de wortel.',sourceURL:url});
const response=(body,status=200,headers={})=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json',...headers}});
beforeEach(()=>{
  calls=[];rows=[];next=681;writeMode='ok';bookFails=false;trashFails=false;
  process.env.NOTION_TOKEN='test-only';process.env.MBD_SUPABASE_WRITE_SECRET='test-only';
  globalThis.fetch=async(raw,options={})=>{
    const u=new URL(raw),body=options.body?JSON.parse(options.body):null;
    calls.push({path:u.pathname,method:options.method||'GET',body});
    if(u.pathname==='/rest/v1/mbd_catalog'){
      const offset=Number(u.searchParams.get('offset'))||0;
      return response(rows.slice(offset,offset+2),200,{'content-range':`${offset}-${Math.min(offset+1,rows.length-1)}/${rows.length}`});
    }
    if(u.pathname.endsWith('/mbd_reserve_number'))return response('MDB-'+String(++next).padStart(4,'0'));
    if(u.pathname.endsWith('/mbd_catalog_server_write')){
      if(writeMode==='conflict')return response({ok:false,reason:'exists'});
      rows.push({mdb:body.p_mdb,recipe:body.p_recipe});
      if(writeMode==='timeout')throw new Error('Connection lost after commit');
      return response({ok:true});
    }
    if(u.pathname.includes('/data_sources/')){
      if(bookFails)return response({message:'Book service unavailable'},503);
      return response({results:u.pathname.includes('7780dc25')?[{id:'book-31',properties:{'Boeknr.':{number:31},Kookboek:{title:[{plain_text:'Boek 31'}]}}}]:[]});
    }
    if(u.pathname==='/v1/pages')return response({id:'page-'+body.properties['MDB-ID'].rich_text[0].text.content,url:'https://notion.so/'+body.properties['MDB-ID'].rich_text[0].text.content});
    if(u.pathname.startsWith('/v1/pages/')){
      if(body?.in_trash&&trashFails)return response({message:'Trash unavailable'},503);
      return response({ok:true});
    }
    throw new Error('Unexpected mock request: '+u.pathname);
  };
});
afterEach(()=>{
  globalThis.fetch=originalFetch;
  for(const [key,value] of Object.entries(originalEnv))if(value===undefined)delete process.env[key];else process.env[key]=value;
});
async function save(body=draft()){
  const res={statusCode:200,setHeader(){return this},status(n){this.statusCode=n;return this},json(data){this.data=data;return this}};
  await handler({method:'POST',body},res);return res;
}
const reservations=()=>calls.filter(c=>c.path.endsWith('/mbd_reserve_number'));
test('canonical links remove tracking and preserve recipe-identifying query parameters',()=>{
  assert.equal(canonicalSource('https://www.Example.org/recept/?utm_source=ig&b=2&a=1#top'),'example.org/recept?a=1&b=2');
  assert.notEqual(canonicalSource('https://example.org/watch?v=one'),canonicalSource('https://example.org/watch?v=two'));
  assert.notEqual(canonicalSource('https://example.org/?version=1'),canonicalSource('https://example.org/?version=2'));
  assert.equal(canonicalSource('javascript:alert(1)'),'');
});
test('read-only catalog traversal includes all server-capped pages',async()=>{
  rows=Array.from({length:5},(_,i)=>({mdb:'MDB-000'+i,recipe:draft()}));
  assert.equal((await readCatalog()).length,5);
  assert.equal(calls.filter(c=>c.path==='/rest/v1/mbd_catalog').length,3);
});
test('existing canonical source is rejected before reserving or mutating Notion',async()=>{
  rows=[{mdb:'MDB-0123',recipe:draft('Bestaande soep','https://example.org/recept/?utm_source=fb')}];
  const r=await save();assert.equal(r.statusCode,409);assert.equal(r.data.mdb,'MDB-0123');
  assert.equal(r.data.code,'duplicate_recipe');assert.equal(reservations().length,0);
  assert.equal(calls.some(c=>c.path.startsWith('/v1/')),false);
});
test('same complete content without a link is recognized; empty content and quarantined rows are excluded',()=>{
  const recipe=draft('Groentesoep','');
  assert.equal(findDuplicate([{mdb:'MDB-0001',recipe}],{...recipe,title:'  GROENTESOEP  '}).mdb,'MDB-0001');
  assert.equal(findDuplicate([{mdb:'MDB-0001',recipe:{title:'Soep'}}],{title:'Soep'}),undefined);
  assert.equal(findDuplicate([{mdb:'MDB-0001',recipe:{...recipe,syncStatus:'duplicate-quarantined'}}],recipe),undefined);
});
test('new recipe uses the database-reserved ID consistently in Notion and Supabase',async()=>{
  const r=await save();assert.equal(r.statusCode,200);assert.equal(r.data.mdb,'MDB-0682');
  assert.equal(rows[0].mdb,'MDB-0682');assert.equal(rows[0].recipe.notionURL,'https://notion.so/MDB-0682');
  assert.equal(reservations().length,1);
});
test('missing Notion token consumes no number and performs no remote request',async()=>{
  delete process.env.NOTION_TOKEN;const r=await save();assert.equal(r.statusCode,500);assert.equal(calls.length,0);
});
test('missing write credential consumes no number and performs no remote request',async()=>{
  delete process.env.MBD_SUPABASE_WRITE_SECRET;const r=await save();assert.equal(r.statusCode,500);assert.equal(calls.length,0);
});
test('book lookup failure consumes no number',async()=>{
  bookFails=true;assert.equal((await save()).statusCode,500);assert.equal(reservations().length,0);
});
test('unavailable catalog fails closed before allocation',async()=>{
  globalThis.fetch=async()=>response({message:'denied'},403);
  const r=await save();assert.equal(r.statusCode,500);assert.equal(reservations().length,0);
});
test('sequential retry recognizes the stored source and keeps its original MDB',async()=>{
  const first=await save(),retry=await save();assert.equal(first.data.mdb,'MDB-0682');
  assert.equal(retry.statusCode,409);assert.equal(retry.data.mdb,first.data.mdb);assert.equal(rows.length,1);assert.equal(reservations().length,1);
});
test('parallel distinct uploads propagate distinct IDs supplied by a simulated atomic database allocator',async()=>{
  const results=await Promise.all([save(draft('Soep A','https://example.org/a')),save(draft('Soep B','https://example.org/b'))]);
  assert.ok(results.every(r=>r.statusCode===200));assert.equal(new Set(results.map(r=>r.data.mdb)).size,2);
  // This verifies the route, not the unavailable live PostgreSQL function.
});
test('a timeout after commit preserves the Notion page and reports reconciliation rather than rollback',async()=>{
  writeMode='timeout';const r=await save();assert.equal(r.statusCode,502);assert.equal(rows.length,1);
  assert.equal(r.data.reconciliationRequired,true);assert.equal(r.data.rolledBackNotion,false);
  assert.equal(calls.some(c=>c.body?.in_trash),false);
});
test('explicit insert conflict never overwrites a row and reports verified Notion compensation',async()=>{
  writeMode='conflict';const r=await save();assert.equal(r.statusCode,409);
  assert.equal(rows.length,0);assert.equal(r.data.rolledBackNotion,true);
});
test('failed compensation is not reported as a successful rollback',async()=>{
  writeMode='conflict';trashFails=true;const r=await save();assert.equal(r.data.rolledBackNotion,false);assert.equal(r.data.reconciliationRequired,true);
});
test.todo('live PostgreSQL: simultaneous identical uploads return one canonical MDB across server instances');
test.todo('live PostgreSQL: failed upload retry reuses its durable idempotency key');
