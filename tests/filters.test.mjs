import {test} from 'node:test';import assert from 'node:assert/strict';
import '../recipe-filters.js';
const match=globalThis.MBDRecipeFilters.matches;
const r={mdb:'MDB-0001',category:'Vis',collections:[]};
const filters={category:'Vis',people:['Dian','Mace'],mode:'minimum',stars:4};
test('every selected diner must meet the threshold, missing is not zero',()=>{
 assert.equal(match(r,filters,{'MDB-0001':{Mama:{stars:4},Mace:{stars:5}}}),true);
 assert.equal(match(r,filters,{'MDB-0001':{Mama:{stars:4}}}),false);
 assert.equal(match(r,filters,{'MDB-0001':{Mama:{stars:5},Mace:{stars:3}}}),false);
 assert.equal(match(r,{...filters,mode:'exact'},{'MDB-0001':{Mama:{stars:4},Mace:{stars:5}}}),false);
});
test('guest identity is per recipe and category is combined with ratings',()=>{
 const ratings={'MDB-0001':{Gast:{name:'Alex',stars:4}}};
 assert.equal(match(r,{...filters,people:['Gast:Alex']},ratings),true);
 assert.equal(match(r,{...filters,people:['Gast:Sam']},ratings),false);
 assert.equal(match(r,{...filters,people:[],category:'Pasta'},ratings),false);
});
