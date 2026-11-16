import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalizeRows,freshReview,dashboard,matches,originalFields,recordSnapshot,qrState,ready,validateReview} from '../source-review-core.js';
const fixture=[{mdb:'MDB-0001',recipe:{mdb:'MDB-0999',title:'Soep',sourceURL:'https://example.test/content',originalSourceURL:'https://example.test/original',contentURL:'https://other.test/soep',ingredients:'1 ui',steps:'Kook'}},{mdb:'MDB-0002',recipe:{title:'Onbekend'}},{mdb:'MDB-0003',recipe:{title:'Bestand',originalSourceRef:'Eigen schrift, blz. 4',syncStatus:'duplicate-quarantined'}}];
const rows=normalizeRows(fixture,'catalog');
test('table MDB and every original field are preserved without promoting candidates',()=>{
 const before=structuredClone(fixture);assert.equal(rows[0].mdb,'MDB-0001');assert.equal(rows[0].identityWarning,true);assert.equal(rows[2].quarantined,true);assert.equal(freshReview().exactOriginalURL,'');assert.equal(freshReview().validatedSource,'');assert.deepEqual(originalFields(rows[0].recipe).contentURL,'https://other.test/soep');assert.deepEqual(fixture,before);
});
test('source missing and exact original unknown are different counts, with dataset-scoped IDs',()=>{
 const d=dashboard(rows,new Map());assert.equal(d.total,3);assert.equal(d.missingSources,1);assert.equal(d.missingExact,3);assert.equal(d.qrPending,3);assert.equal(d.openDecisions,3);
 const local=normalizeRows([{id:'x',mdb:'MDB-0001',title:'Privé'}],'local');assert.notEqual(local[0].key,rows[0].key);
 const ambiguous=normalizeRows([{id:'same'},{id:'same'},{title:'missing'}],'local');assert(ambiguous.every(r=>!r.stable));
});
function verified(){return {...freshReview(),sourceStatus:'verified',validatedSource:'https://example.test/original',sourceEvidence:'Titel en ingrediënten vergeleken',testStatus:'passed',decision:'ready',round:'Ronde 2',qrTarget:'https://example.test/original',recordSnapshot:recordSnapshot(rows[0]),qrEvidence:{decoded:'https://example.test/original',imageHash:'a'.repeat(64),decodedAt:'2026-11-16',openedAt:'2026-11-16',destination:'matched',destinationNote:'Titel Soep en 1 ui komen overeen',checkedAt:'2026-11-16',checkedURL:'https://example.test/original',recipeSnapshot:recordSnapshot(rows[0])}};}
test('QR decode alone, placeholders and a reachable but wrong target never count as approved',()=>{
 const r=verified();assert.equal(qrState(r),'verified');assert(ready(rows[0],r));assert.doesNotThrow(()=>validateReview(rows[0],r));
 for(const [decoded,expected] of [['MDB-0001','placeholder'],['https://other.test/wrong','mismatch'],['javascript:alert(1)','not-url']]){const changed={...r,qrEvidence:{...r.qrEvidence,decoded}};assert.equal(qrState(changed),expected);assert.throws(()=>validateReview(rows[0],changed));}
 const decoded={...r,qrEvidence:{...r.qrEvidence,destination:''}};assert.equal(qrState(decoded),'decoded');assert.throws(()=>validateReview(rows[0],decoded));
 const restricted={...r,qrEvidence:{...r.qrEvidence,destination:'restricted'}};assert.equal(qrState(restricted),'restricted');assert.throws(()=>validateReview(rows[0],restricted));
});
test('all filters and round progress reflect stored evidence; changed recipe requires rechecking',()=>{
 const r=verified(),map=new Map([[rows[0].key,r]]);assert(matches(rows[0],r,{filter:'ready',round:'Ronde 2'}));assert(!matches(rows[0],r,{round:'Ronde 1'}));assert(matches(rows[1],freshReview(),{filter:'missing-source'}));assert(matches(rows[0],r,{filter:'no-exact'}));
 assert.equal(dashboard(rows,map).rounds['Ronde 2'].ready,1);
 const changed={...rows[0],title:'Andere soep'};assert(!ready(changed,r));assert(matches(changed,r,{filter:'qr-pending'}));assert(matches(changed,r,{filter:'source-pending'}));assert(matches(changed,r,{filter:'untested'}));assert.throws(()=>validateReview(changed,r));
});
test('exact-original and replacement claims require explicit, separate evidence',()=>{
 assert.throws(()=>validateReview(rows[0],{...freshReview(),exactOriginalURL:'https://example.test/original'}));
 assert.throws(()=>validateReview(rows[0],{...freshReview(),sourceStatus:'replaced',replacementSource:'https://other.test/soep'}));
 assert.doesNotThrow(()=>validateReview(rows[0],{...freshReview(),sourceStatus:'replaced',replacementSource:'https://other.test/soep',sourceEvidence:'Bewust vergelijkbaar alternatief; oorspronkelijke video afgeschermd'}));
 assert.throws(()=>validateReview(rows[0],{...freshReview(),qrTarget:'https://user:password@example.test'}));
 assert.throws(()=>validateReview(rows[0],{...freshReview(),decision:'ready'}));
});
