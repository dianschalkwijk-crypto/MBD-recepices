// Opt-in read-only live integration. Local planning/ratings exist only in the isolated test browser.
import {test,expect} from '@playwright/test';
test.skip(!process.env.MBD_LIVE_WEEK_TEST,'Explicit live weekmenu verification required');
test('live weekmenu preserves real 0323 yield and reloads category and person filters',async({page},testInfo)=>{
 const writes=[];page.on('request',r=>{if(new URL(r.url()).origin===new URL(process.env.MBD_LIVE_URL).origin&&r.method()!=='GET')writes.push(r.method()+' '+r.url())});
 await page.goto('/api/notion/catalog?sourceReview=1');const catalog=JSON.parse(await page.locator('body').innerText());expect(catalog.ok).toBe(true);const recipes=catalog.items.map(x=>({...x.recipe,id:x.recipe.id||x.mdb,mdb:x.mdb})),original=recipes.find(r=>r.mdb==='MDB-0323');expect(original.portions).toBe('24 cups');
 await page.addInitScript(({recipes})=>{if(localStorage.getItem('mbd-live-week-seeded'))return;localStorage.setItem('madebydian-recipes-filled-copy-v0.5',JSON.stringify({recipes,week:{Maandag:recipes.find(r=>r.mdb==='MDB-0323').id}}));localStorage.setItem('mbd-live-week-seeded','1')},{recipes});
 await page.goto('/');await page.locator('[data-target="week"]').click();const monday=page.locator('#weekPlanner .week-row').first();await expect(monday.locator('.mbd-portions-control input')).toHaveValue('4');await expect(monday.locator('details')).toContainText('Niet omgerekend');await expect(monday.locator('details')).toContainText('300 g zalm');await expect(monday).not.toContainText('24 personen');
 await page.getByLabel('Categorie Maandag',{exact:true}).selectOption('collection:Aziatisch');await monday.getByRole('button',{name:/Bekijk recepten/}).click();await expect(monday.locator('.mbd-week-search-results')).toContainText('MDB-0323');
 await page.getByLabel('Sterren van',{exact:true}).selectOption('Mama');await page.getByLabel('Sterrenfilter',{exact:true}).selectOption('unrated');await page.reload();await page.locator('[data-target="week"]').click();await expect(page.getByLabel('Categorie Maandag',{exact:true})).toHaveValue('collection:Aziatisch');await expect(page.getByLabel('Sterrenfilter',{exact:true})).toHaveValue('unrated');
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('madebydian-recipes-filled-copy-v0.5')).recipes.find(r=>r.mdb==='MDB-0323').portions)).toBe('24 cups');expect(writes).toEqual([]);
 await page.screenshot({path:testInfo.outputPath('weekmenu-live.png'),fullPage:true});
});
