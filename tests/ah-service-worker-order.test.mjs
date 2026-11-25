import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
test('serviceworker keeps collection normalization ahead of first inline app render',async()=>{
 const context=vm.createContext({Response,Headers,self:{addEventListener(){}}});
 vm.runInContext(readFileSync('service-worker.js','utf8'),context);
 const result=await context.inject(new Response(readFileSync('index.html','utf8'),{headers:{'content-type':'text/html'}}));
 const html=await result.text();
 assert.equal((html.match(/src=['"]\/recipe-time-core\.js/g)||[]).length,1);
 assert.ok(html.indexOf('/recipe-time-core.js')<html.indexOf('function extendCollections'));
 assert.match(html,/recipe-time-core\.js\?v=61/);
});
