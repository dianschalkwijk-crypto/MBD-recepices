import {test} from 'node:test';
import assert from 'node:assert/strict';
import handler,{readSourceReviewRows} from '../api/notion/catalog.ts';
test('source workspace reads all capped pages, keeps table IDs and originals, and never uses write credentials',async()=>{
 const fetch=globalThis.fetch;const calls=[];const fixture=[{mdb:'MDB-0001',recipe:{mdb:'MDB-0999',sourceURL:'https://example.test/original?exact=1'}},{mdb:'MDB-0002',recipe:{syncStatus:'duplicate-quarantined'}}];
 try{globalThis.fetch=async(url,options)=>{calls.push({url,options});const offset=Number(new URL(url).searchParams.get('offset'));assert.equal(options.method,undefined);assert.equal(options.headers.Authorization,undefined);assert(!url.includes('/rpc/'));return new Response(JSON.stringify(fixture.slice(offset,offset+1)),{headers:{'content-range':`${offset}-${offset}/2`}});};const rows=await readSourceReviewRows();assert.deepEqual(rows,fixture);assert.equal(calls.length,2);
  const res={code:0,setHeader(){},status(n){this.code=n;return this;},json(value){this.body=value;return this;}};
  await handler({method:'POST',query:{sourceReview:'1'}},res);assert.equal(res.code,405);assert.equal(calls.length,2);
  await handler({method:'GET',query:{sourceReview:'1'}},res);assert.equal(res.code,200);assert.equal(res.body.source,'public.mbd_catalog');assert.deepEqual(res.body.items,fixture);
 }finally{globalThis.fetch=fetch;}
});
test('incomplete, changed and duplicate catalog results fail closed instead of publishing a partial master',async()=>{
 const fetch=globalThis.fetch;
 try{
  globalThis.fetch=async url=>new Response(JSON.stringify(new URL(url).searchParams.get('offset')==='0'?[{mdb:'MDB-0001',recipe:{}}]:[]),{headers:{'content-range':'0-0/2'}});await assert.rejects(readSourceReviewRows(),/Onvolledige/);
  globalThis.fetch=async()=>new Response(JSON.stringify([{mdb:'MDB-0001',recipe:{}},{mdb:'MDB-0001',recipe:{}}]),{headers:{'content-range':'0-1/2'}});await assert.rejects(readSourceReviewRows(),/dubbele/);
  globalThis.fetch=async()=>new Response('{}',{status:503});await assert.rejects(readSourceReviewRows(),/HTTP 503/);
 }finally{globalThis.fetch=fetch;}
});
