import {test,expect} from '@playwright/test';
test('Safari quota fallback survives reopening and auxiliary library pages read the same recipes',async({page})=>{
 await page.route('https://**/*',r=>r.fulfill({contentType:'application/javascript',body:r.request().url().includes('supabase')?`window.supabase={createClient(){return {auth:{getSession:async()=>({data:{session:null}}),getUser:async()=>({data:{user:null}}),onAuthStateChange(){}},from(){const q=new Proxy({},{get(_,k){if(k==='then')return resolve=>Promise.resolve({data:[],error:null}).then(resolve);return ()=>q}});return q}}}};`:'[]'}));
 await page.route('**/api/**',r=>r.fulfill({json:{ok:true,items:[],recipes:[]}}));
 await page.addInitScript(()=>{const key='madebydian-recipes-filled-copy-v0.5',original=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k===key&&v.length>1200&&!v.startsWith('MBD-LZ1:'))throw new DOMException('Safari vol','QuotaExceededError');return original.call(this,k,v)};if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify({recipes:[{id:'MDB-0812',mdb:'MDB-0812',title:'Mijn bewaarde recept',ingredients:'100 g kip',steps:'Gaar bakken.',collections:['Gourmet'],note:'Niet wissen'}],week:{}}));});
 await page.goto('/?kitchenTest=1');await page.waitForFunction(()=>typeof state!=='undefined');
 await page.evaluate(()=>{state.recipes[0].note='Mijn persoonlijke notitie 🌷 '.repeat(200);persist()});
 expect(await page.evaluate(()=>MBDLibraryStorage.compressed)).toBe(true);
 await page.reload();await page.waitForFunction(()=>typeof state!=='undefined');expect(await page.evaluate(()=>state.recipes[0].note)).toBe('Mijn persoonlijke notitie 🌷 '.repeat(200));
 await page.goto('/bibliotheek-controle.html');await expect(page.locator('#status')).toHaveText('1 recepten gevonden in deze browser');expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('madebydian-recipes-filled-copy-v0.5')).recipes[0].note)).toBe('Mijn persoonlijke notitie 🌷 '.repeat(200));
});
