import {execFile,execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import '../../kitchen-core.js';
import {readFileSync} from 'node:fs';
const K=globalThis.MBDKitchen,owner='11111111-1111-4111-8111-111111111111';
const container='mbd-kitchen-integration-'+process.pid;
const docker=(args,input)=>execFileSync('docker',['--host=unix:///var/run/docker.sock',...args],{input,encoding:'utf8',stdio:['pipe','pipe','pipe']});
docker(['run','-d','--name',container,'--network','none','--tmpfs','/var/lib/postgresql/data:rw,size=256m','-e','POSTGRES_PASSWORD=fixture','postgres:17.11']);
try {
let ready=false;for(let n=0;n<100;n++){try{docker(['exec',container,'pg_isready','-h','127.0.0.1','-U','postgres']);ready=true;break}catch{Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,100)}}if(!ready)throw Error('Local fixture did not start: '+docker(['logs',container]));
const bootstrap=q=>docker(['exec','-i',container,'psql','-h','127.0.0.1','-U','postgres','-v','ON_ERROR_STOP=1'],q);
bootstrap(readFileSync(new URL('../fixtures/kitchen/schema.sql',import.meta.url),'utf8'));
const migration=readFileSync(new URL('../../migrations/20261125141327_household_kitchen.sql',import.meta.url),'utf8');bootstrap(migration);bootstrap(migration);
const sql=q=>execFileSync('docker',['--host=unix:///var/run/docker.sock','exec','-i',container,'psql','-h','127.0.0.1','-U','postgres','-qAt','-v','ON_ERROR_STOP=1'],{input:q,encoding:'utf8',stdio:['pipe','pipe','pipe']}).trim();
const quote=x=>"'"+JSON.stringify(x).replaceAll("'","''")+"'::jsonb";
const auth=q=>sql(`BEGIN; SET LOCAL ROLE authenticated; SET LOCAL request.jwt.claim.sub='${owner}'; ${q}; COMMIT;`);
let s=K.empty(),revision=0;
function commit(type,payload,request=randomUUID()){const next=K.apply(s,{id:request,type,payload,at:new Date().toISOString()});const result=JSON.parse(auth(`SELECT public.mbd_kitchen_commit('${request}',${revision},${quote(next)},${quote({type})})`));s=result.data;revision=result.revision;return {result,next,request};}
const b={id:randomUUID(),name:'Fixture sauce',quantity:4,unit:'portie',location:'freezer',confirmed:true};
commit('inventory_add',b);
const p={id:randomUUID(),date:'2026-11-25',slot:'dinner',name:b.name,batchId:b.id,batchQuantity:1};
commit('plan_set',p);assert.equal(K.available(s,b.id),3);
const used=commit('inventory_use',{itemId:p.id});assert.equal(s.inventory[b.id].quantity,3);
const replay=JSON.parse(auth(`SELECT public.mbd_kitchen_commit('${used.request}',0,${quote(used.next)},'{}')`));assert(replay.replayed);assert.equal(replay.data.inventory[b.id].quantity,3);
assert.throws(()=>auth(`SELECT public.mbd_kitchen_commit('${randomUUID()}',0,${quote(s)},'{}')`),/revision conflict/i);
assert.throws(()=>auth(`UPDATE public.mbd_kitchen_state SET data=jsonb_set(data,'{inventory,${b.id},quantity}','-1'),revision=revision+1`),/Invalid household state/);
const p2={...p,id:randomUUID(),date:'2026-11-26'};commit('plan_set',p2);
assert.throws(()=>auth(`DELETE FROM public.week_menus`),/invalid stock reservation/i);
commit('plan_remove',{id:p2.id});assert.equal(K.available(s,b.id),3);
const other=sql(`BEGIN;SET LOCAL ROLE authenticated;SET LOCAL request.jwt.claim.sub='22222222-2222-4222-8222-222222222222';SELECT count(*) FROM public.mbd_kitchen_state;COMMIT;`);assert.equal(other,'0');
assert.throws(()=>sql('SET ROLE anon;SELECT public.mbd_kitchen_read()'),/permission denied/);
assert.throws(()=>auth('DELETE FROM public.mbd_kitchen_actions'),/permission denied/);
assert.equal(JSON.parse(auth('SELECT public.mbd_kitchen_read()')).data.inventory[b.id].quantity,3);
const fixed={id:randomUUID(),name:'Fixture meel',package:'1 kg',brand:'Fixture'};commit('product_save',fixed);
const lunch={id:randomUUID(),date:'2026-11-24',slot:'lunch',name:'Fixture lunch',shoppingLines:['1500 g meel'],expectedItemId:null};commit('plan_set',lunch);const ingredientKey=K.requirements(s,'2026-11-23').find(l=>l.name==='meel').key;commit('shopping_match',{week:'2026-11-23',key:ingredientKey,productId:fixed.id});assert.equal(K.shopping(s,'2026-11-23').find(l=>l.productId===fixed.id).quantity,2);commit('shopping_amount',{week:'2026-11-23',productId:fixed.id,delta:1});assert.equal(K.shopping(s,'2026-11-23').find(l=>l.productId===fixed.id).quantity,3);commit('product_patch',{id:fixed.id,changes:{category:'Voorraadkast'},expected:{category:'Overig'}});assert.equal(JSON.parse(auth('SELECT public.mbd_kitchen_read()')).data.products[fixed.id].category,'Voorraadkast');assert.equal(JSON.parse(auth('SELECT public.mbd_kitchen_read()')).data.shopping['2026-11-23'].matches[ingredientKey].productId,fixed.id);
const candidates=[1,2].map(n=>K.apply(s,{id:randomUUID(),type:'product_save',payload:{id:randomUUID(),name:'Concurrent fixture '+n,package:'1 stuk'},at:'2026-11-25'}));
const race=await Promise.allSettled(candidates.map(next=>new Promise((resolve,reject)=>{const p=execFile('docker',['--host=unix:///var/run/docker.sock','exec','-i',container,'psql','-h','127.0.0.1','-U','postgres','-qAt','-v','ON_ERROR_STOP=1'],(e,out,err)=>e?reject(Error(err)):resolve(out));p.stdin.end(`BEGIN;SET LOCAL ROLE authenticated;SET LOCAL request.jwt.claim.sub='${owner}';SELECT public.mbd_kitchen_commit('${randomUUID()}',${revision},${quote(next)},'{}');COMMIT;`)})));
assert.equal(race.filter(x=>x.status==='fulfilled').length,1);assert.equal(race.filter(x=>x.status==='rejected').length,1);assert.match(race.find(x=>x.status==='rejected').reason.message,/revision conflict/i);
console.log('PASS: atomic reservation/use/cancel, replay, CAS, negative stock guard, deferred orphan guard, owner RLS, anon denial, immutable history, reload.');

} finally {try{docker(['rm','-fv',container])}catch{}}
