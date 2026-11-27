import {test,expect} from '@playwright/test';
const KEY='madebydian-recipes-filled-copy-v0.5';
test('original theme memberships survive old cached AH migration and source labels never create tiles',async({page})=>{
 const from={book:'AH – Allerhande · Deel 1',bookNo:41};
 const old=[{id:'MDB-0164',mdb:'MDB-0164',title:'Groentesoep',...from,ahCookbook:{name:from.book},ahBookVersion:'old',ingredients:'200 g wortel',steps:'Kook.',sourceURL:'https://www.ah.nl/r/393226',collections:['Gezin','TikTok','Rijst','rijst']},{id:'MDB-0271',mdb:'MDB-0271',title:'Mijn pasta',...from,book:'Mijn bewuste eigen boek',ingredients:'200 g pasta',steps:'Kook.',collections:['Pasta','Instagram','Insta']},{id:'MDB-0709',mdb:'MDB-0709',title:'Nieuwe AH visrijst',...from,ahRecipeId:'1197714',ingredients:'400 g vis',steps:'Bak.',collections:['Vis','Rijst','budget','AH – Mijn favorieten'],timings:{activeMinutes:15}}];
 const server=old.slice(0,2).map(r=>({mdb:r.mdb,recipe:{...r,book:r.mdb==='MDB-0164'?'Gezin':'Pasta',bookNo:2,bookRestore:{version:'restore-test',from}}}));
 for(const row of server){delete row.recipe.ahCookbook;delete row.recipe.ahBookVersion}
 await page.route('https://**/*',r=>{const u=new URL(r.request().url());if(u.origin===new URL(process.env.MBD_LIVE_URL||'http://127.0.0.1:4174').origin)return r.continue();if(u.pathname.includes('/rest/v1/mbd_catalog'))return r.fulfill({json:server});return r.fulfill({contentType:'application/javascript',body:u.href.includes('supabase')?`window.supabase={createClient(){return {auth:{getSession:async()=>({data:{session:null}}),getUser:async()=>({data:{user:null}}),onAuthStateChange(){}},from(){const q=new Proxy({},{get(_,k){if(k==='then')return resolve=>Promise.resolve({data:[],error:null}).then(resolve);return ()=>q}});return q}}}};`:'[]'})});
 await page.route('**/api/**',r=>r.fulfill({json:{ok:true,items:[],recipes:[]}}));await page.route('**/pinterest-books-23-29.json',r=>r.fulfill({json:{recipes:[{book:23,number:1,title:'Historisch Pinterest recept dat niet opnieuw geïmporteerd mag worden',ingredients:'1 ei',preparation:'Bak.',sourceURL:'https://pinterest.com/pin/historical/'}]}}));
 await page.addInitScript(({KEY,old})=>{if(!localStorage.getItem(KEY))localStorage.setItem(KEY,JSON.stringify({recipes:old,week:{}}))},{KEY,old});
 await page.goto('/index.html');await page.waitForFunction(()=>state.recipes.find(r=>r.mdb==='MDB-0164')?.book==='Gezin');
 for(let round=0;round<2;round++){
  if(round){await page.reload();await page.waitForFunction(()=>!!window.__mbdAllergyIntegrated)}
  await page.locator('[data-target="collections"]').click();const tiles=page.locator('.collection-card');await expect(tiles).toHaveCount(29);
  for(const label of ['TikTok','Instagram','Insta','rijst','Rijst','AH – Mijn favorieten','AH – Allerhande · Deel 1'])await expect(tiles.filter({hasText:label})).toHaveCount(0);
  for(const theme of ['Gezin','Pasta','AH']){const tile=tiles.filter({hasText:theme==='AH'?/^🛒 AH/:theme});await expect(tile).toContainText('1 totaal');await tile.click();await expect(page.locator('#recipeList .recipe-card:visible')).toHaveCount(1);await page.locator('[data-target="collections"]').click()}
  const after=await page.evaluate(()=>state.recipes);expect(after).toHaveLength(3);for(const r of old)expect(after.find(x=>x.mdb===r.mdb).collections).toEqual(r.collections);
  expect(after.find(r=>r.mdb==='MDB-0271').book).toBe('Mijn bewuste eigen boek');
  expect(after.find(r=>r.mdb==='MDB-0164').ahCookbook).toBeUndefined();
 }
});
