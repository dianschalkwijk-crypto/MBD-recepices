import {test,expect} from '@playwright/test';
test.skip(!process.env.MBD_LIVE_AH_BOOKS_TEST,'Explicit read-only production verification required');
test('older recipes return to original books and themes; only newly imported 0709 appears in AH after old browser cache reload',async({page})=>{
 test.setTimeout(60000);
 await page.goto('/api/notion/books');const books=JSON.parse(await page.locator('body').innerText()).books;expect(books.find(b=>b.name==='AH – Allerhande · Deel 1').storedCount).toBe(1);
 await page.goto('/api/notion/catalog?sourceReview=1');const all=JSON.parse(await page.locator('body').innerText()).items;expect(all.filter(x=>x.recipe.ahCookbook).map(x=>x.mdb)).toEqual(['MDB-0709']);
 const ids=['MDB-0164','MDB-0230','MDB-0232','MDB-0271','MDB-0275','MDB-0307','MDB-0709'],original=all.filter(x=>ids.includes(x.mdb)).map(x=>({...x.recipe,id:x.mdb,mdb:x.mdb}));
 const old=original.map(r=>r.bookRestore?{...r,book:r.bookRestore.from.book,bookNo:41,bookRestore:undefined,ahBookVersion:'old',ahCookbook:{name:r.bookRestore.from.book}}:r);
 await page.addInitScript(old=>{const KEY='madebydian-recipes-filled-copy-v0.5';if(!localStorage.getItem(KEY))localStorage.setItem(KEY,JSON.stringify({recipes:old,week:{}}))},old);
 await page.goto('/index.html');await page.waitForFunction(()=>state.recipes.filter(r=>r.bookRestore?.version==='original-books-20261121').length===6,null,{timeout:20000}).catch(async e=>{console.log('BOOK RESTORE',await page.evaluate(()=>({n:state.recipes.length,restores:state.recipes.filter(r=>r.bookRestore).map(r=>[r.mdb,r.book,r.bookRestore]),sync:document.querySelector('#mbd-sync-v2')?.textContent})));throw e});
 const active=all.filter(x=>x.recipe.syncStatus!=='duplicate-quarantined');await page.waitForFunction(n=>state.recipes.length===n,active.length,{timeout:20000}).catch(async e=>{console.log('CATALOG COUNT',await page.evaluate(()=>({n:state.recipes.length,sync:document.querySelector('#mbd-sync-v2')?.textContent})));throw e});
 const themes=await page.evaluate(()=>MBDTimeCore.standardCollections);
 for(let i=0;i<2;i++){
  if(i){await page.reload();await page.waitForFunction(()=>!!window.__mbdAllergyIntegrated)}
  await page.locator('[data-target="collections"]').click();const tiles=page.locator('.collection-card');await expect(tiles).toHaveCount(28);
  for(const name of themes){const n=active.filter(x=>{const r=x.recipe;return (r.collections||[]).includes(name)||(name==='HelloFresh'&&/hello\s*[- ]?\s*fresh/i.test([r.book,r.sourceAuthor,r.sourceNotes].join(' ')))||(name==='Uit kookboeken'&&r.sourceKind==='Kookboek')}).length;await expect(tiles.filter({hasText:name})).toContainText(new RegExp('· '+n+' totaal$'))}
  for(const label of ['TikTok','Instagram','Insta','rijst','Rijst','AH – Mijn favorieten','AH – Allerhande · Deel 1'])await expect(tiles.filter({hasText:label})).toHaveCount(0);
  const ah=tiles.filter({hasText:/^🛒 AH/});await expect(ah).toContainText('1 totaal');await ah.click();await expect(page.locator('#recipeList .recipe-card:visible')).toHaveCount(1);await expect(page.locator('#recipeList')).toContainText('Rijst uit de oven met vis');
  await page.locator('[data-target="collections"]').click();await tiles.filter({hasText:'Gezin'}).click();await expect(page.locator('#recipeList')).toContainText('Groentesoep');
  const after=await page.evaluate(ids=>ids.map(id=>state.recipes.find(r=>r.mdb===id)),ids);for(const r of after){const before=original.find(x=>x.mdb===r.mdb);for(const k of ['title','ingredients','steps','sourceURL','originalSourceURL','contentURL','photoURL','collections','book','bookNo'])expect(r[k]||'').toEqual(before[k]||'')}
 }
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
