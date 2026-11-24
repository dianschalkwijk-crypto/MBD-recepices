import {test} from 'node:test';import assert from 'node:assert/strict';import '../recipe-review-core.js';import '../person-ratings-core.js';
const core=globalThis.MBDRecipeReview,ratings=globalThis.MBDPersonRatings;
test('verified wrong source correction preserves a separately edited local source and all identifiers/collections',()=>{
 const remote={mdb:'MDB-0683',sourceURL:'',collections:['New'],catalogReviewUpdate:{version:'1',fields:['sourceURL','mdb','collections'],previous:{sourceURL:'https://instagram.com/wrong'}}};
 const old={mdb:'MDB-0683',sourceURL:'https://instagram.com/wrong',collections:['Gezin']};core.apply(old,remote);assert.equal(old.sourceURL,'');assert.deepEqual(old.collections,['Gezin']);assert.equal(old.mdb,'MDB-0683');
 const edited={mdb:'MDB-0683',sourceURL:'https://instagram.com/proven-user-source',collections:['Gezin']};assert.deepEqual(core.apply(edited,remote).conflicts,['sourceURL']);assert.equal(edited.sourceURL,'https://instagram.com/proven-user-source');
});
test('official score needs explicit evidence, estimates stay blue and illustrative heuristics are not labelled official',()=>{
 assert.equal(core.score({nutriScore:'A'}),null);assert.equal(core.score({nutriScore:'A',nutriScoreEstimated:false}),null);
 const official=core.score({nutriScore:'B',nutriScoreEstimated:false,nutriScoreSourceURL:'https://source.example/label'});assert.equal(official.kind,'official');
 const estimate=core.score({estimatedRecipeScore:{kind:'estimated',grade:'B'}});assert.equal(estimate.kind,'estimated');assert.equal(estimate.background,'#dceeff');assert.notEqual(official.background,estimate.background);
 assert.match(core.score({estimatedRecipeScore:{kind:'indicative_recipe_estimate',grade:'C'}}).label,/geen officiële/);
});
test('cloud Mama rating merges into a locally present Jake entry without losing anyone or unsaved fields',()=>{
 const actual=ratings.merge({'MDB-0752':{Mama:{stars:2},Mace:{stars:3}}},{'MDB-0752':{Jake:{stars:5},Mama:{stars:4,note:'eigen notitie'}}},{'MDB-0752':{Mama:{note:'nog niet opgeslagen'}}});
 assert.deepEqual(actual['MDB-0752'],{Jake:{stars:5},Mama:{stars:2,note:'nog niet opgeslagen'},Mace:{stars:3}});
});
test('only explicit valid-MDB edits are uploaded, and server-side other family values survive',()=>{
 const before={'MDB-0789':{Mama:{stars:4},Jake:{stars:5}}};const after=structuredClone(before);after['MDB-0789'].Mama.stars=2;after.INVALID={Mama:{stars:1}};
 const delta=ratings.changes(before,after);assert.deepEqual(delta,{'MDB-0789':{Mama:{stars:2}}});
 assert.deepEqual(ratings.patch({Mama:{stars:4,note:'bewaren'},Jake:{stars:3},Mace:{stars:5}},delta['MDB-0789']),{Mama:{stars:2,note:'bewaren'},Jake:{stars:3},Mace:{stars:5}});
});
test('recipe ingredient arrays render as lines and prototype keys cannot become ratings',()=>{assert.equal(core.text(['1 ei','2 g zout']),'1 ei\n2 g zout');ratings.patch({},JSON.parse('{"__proto__":{"polluted":true}}'));assert.equal({}.polluted,undefined)});
test('audit is a dated snapshot and never certifies modified content or a blocked portion proposal',()=>{
 const entry={expected:{ingredients:'1 ei',steps:'Bak',portions:'4 personen'},audit:{run:'2026-11-24',fullyVerified:false,notionVerified:true,imageVerified:true,awaitingApproval:true,portionCorrectionPending:true}};
 const r={ingredients:'1 ei',steps:'Bak',portions:'4 personen',reviewStatus:'approved'};core.audit(r,entry);assert.equal(r.reviewAudit.notionVerified,true);assert.equal(core.counts([r]).awaitingApproval,1);assert.equal(core.counts([r]).fully,0);
 r.ingredients='eigen wijziging';core.audit(r,entry);assert.equal(r.reviewAudit.stale,true);assert.equal(r.reviewAudit.notionVerified,false);
});
