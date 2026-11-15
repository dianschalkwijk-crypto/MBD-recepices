import {test,afterEach} from 'node:test';import assert from 'node:assert/strict';
import handler from '../api/recipes/source.ts';
const originalFetch=globalThis.fetch;afterEach(()=>globalThis.fetch=originalFetch);
const res=()=>({statusCode:200,setHeader(){return this},status(n){this.statusCode=n;return this},json(data){this.data=data;return this}});
test('website import preserves only actual JSON-LD recipe metadata and photograph URL',async()=>{
 globalThis.fetch=async()=>new Response('<meta property="og:description" content="Een gevonden beschrijving"><script type="application/ld+json">'+JSON.stringify({'@type':'Recipe',name:'Wortelsoep',author:{name:'Testauteur'},image:{url:'https://example.org/photo.jpg'},recipeIngredient:['200 g wortel'],recipeInstructions:[{text:'Kook de wortel.'}]})+'</script>');
 const r=res();await handler({method:'POST',body:{url:'https://93.184.216.34/recept'}},r);
 assert.equal(r.statusCode,200);assert.equal(r.data.author,'Testauteur');assert.equal(r.data.metadata.imageURL,'https://example.org/photo.jpg');
 assert.equal(r.data.metadata.description,'Een gevonden beschrijving');assert.match(r.data.sharedText,/200 g wortel/);
});
test('blocked social source gives a failure without inventing recipe data',async()=>{
 globalThis.fetch=async()=>new Response('blocked',{status:403});const r=res();await handler({method:'POST',body:{url:'https://93.184.216.34/reel/test'}},r);
 assert.equal(r.statusCode,422);assert.equal(r.data.ingredients,undefined);
});
test('private network addresses are refused before fetching',async()=>{
 let requests=0;globalThis.fetch=async()=>{requests++;return new Response('test')};const r=res();await handler({method:'POST',body:{url:'https://127.0.0.1/recept'}},r);
 assert.equal(r.statusCode,400);assert.equal(requests,0);
});
