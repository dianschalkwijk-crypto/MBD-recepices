import {test} from 'node:test';
import assert from 'node:assert/strict';
import {checkWriteCredential} from '../api/notion/health.ts';
test('credential check never allocates a number or submits a valid recipe identifier',async()=>{
 const original=globalThis.fetch,secret=process.env.MBD_SUPABASE_WRITE_SECRET;
 process.env.MBD_SUPABASE_WRITE_SECRET='test-only';
 try{
  let count=0;
  globalThis.fetch=async(url,options)=>{
   count++;assert.ok(url.endsWith('/rpc/mbd_catalog_server_write'));
   const body=JSON.parse(options.body);assert.equal(body.p_mdb,'health-check-invalid');assert.deepEqual(body.p_recipe,{});
   return new Response(JSON.stringify({message:'invalid_mdb'}),{status:400});
  };
  assert.equal((await checkWriteCredential()).ready,true);assert.equal(count,1);
  globalThis.fetch=async()=>new Response(JSON.stringify({message:'unauthorized'}),{status:401});
  assert.equal((await checkWriteCredential()).ready,false);
 }finally{globalThis.fetch=original;if(secret===undefined)delete process.env.MBD_SUPABASE_WRITE_SECRET;else process.env.MBD_SUPABASE_WRITE_SECRET=secret;}
});
