import {test,expect} from '@playwright/test';
const sdk=`window.__draftCloudRows=[];window.__draftUser=null;window.__draftFail=false;
window.supabase={createClient(){return {auth:{getUser:async()=>({data:{user:window.__draftUser?{id:window.__draftUser}:null}}),getSession:async()=>({data:{session:null}}),onAuthStateChange(){return {data:{subscription:{unsubscribe(){}}}}}},from(table){let action='select',payload;const q=new Proxy({},{get(_,key){if(key==='then')return (resolve,reject)=>{if(table==='mbd_import_drafts'&&window.__draftFail)return Promise.resolve({error:{message:'offline'}}).then(resolve,reject);if(table==='mbd_import_drafts'&&action==='upsert'){const i=window.__draftCloudRows.findIndex(x=>x.id===payload.id);if(i<0)window.__draftCloudRows.push(payload);else window.__draftCloudRows[i]=payload;}return Promise.resolve({data:table==='mbd_import_drafts'?structuredClone(window.__draftCloudRows):[],error:null}).then(resolve,reject)};return (...args)=>{if(key==='upsert'){action=key;payload=args[0];}return q}}});return q;},rpc:async()=>({data:[],error:null})}}};`;
test.beforeEach(async({page})=>{
 page.testErrors=[];page.on('pageerror',error=>page.testErrors.push(error.message));
 await page.route('https://cdn.jsdelivr.net/**',r=>r.fulfill({contentType:'text/javascript',body:sdk}));
 await page.route('https://**/*',r=>{if(r.request().url().includes('cdn.jsdelivr.net'))return r.fallback();return r.fulfill({json:[]});});
 await page.route('**/pinterest-books-23-29.json',r=>r.fulfill({json:{recipes:[]}}));
 await page.route('**/api/**',r=>r.fulfill({status:503,json:{error:'Test netwerkfout'}}));
 await page.goto('/');await page.waitForFunction(()=>typeof saveLocalDraft==='function');
 await page.evaluate(()=>setScreen('inbox'));
});
test.afterEach(async({page})=>{expect(page.testErrors).toEqual([]);});
async function edit(page){
 await page.locator('#sourceUrl').fill('https://example.com/test-recept');
 await page.locator('#reviewTitle').fill('Soep van wortel');
 await page.locator('#reviewIngredients').fill('200 g wortel');
 await page.locator('#reviewSteps').fill('1. Kook de wortel.');
}
test('draft survives reload and reopens with all edits, without an MDB',async({page})=>{
 await edit(page);await page.locator('#cancelReviewBtn').click();
 await expect(page.locator('#reviewCard')).toBeHidden();
 const local=await page.evaluate(()=>JSON.parse(localStorage.getItem(DRAFT_KEY)));
 expect(local).toHaveLength(1);expect(local[0].draft.mdb).toBeUndefined();
 await page.reload();await page.evaluate(()=>setScreen('inbox'));
 await page.locator('[data-open-draft]').click();
 await expect(page.locator('#reviewIngredients')).toHaveValue('200 g wortel');
 await expect(page.locator('#reviewSteps')).toHaveValue('1. Kook de wortel.');
});
test('repeated sync uses one stable draft ID and offline deletion does not resurrect',async({page})=>{
 await edit(page);
 await page.evaluate(async()=>{window.__draftUser='test-user';await loadCloudDrafts();await loadCloudDrafts();});
 expect(await page.evaluate(()=>window.__draftCloudRows.length)).toBe(1);
 await expect(page.locator('#savedDraftsList')).toContainText('Online opgeslagen');
 await page.evaluate(async()=>{window.__draftFail=true;await retireDraft(editingDraftId);});
 await expect(page.locator('[data-open-draft]')).toHaveCount(0);
 await page.evaluate(async()=>{window.__draftFail=false;await loadCloudDrafts();});
 expect(await page.evaluate(()=>window.__draftCloudRows[0].draft._deleted)).toBe(true);
 await expect(page.locator('[data-open-draft]')).toHaveCount(0);
});
test('failed final save retains inputs and draft; incomplete recipes never POST',async({page})=>{
 let saves=0;await page.route('**/api/notion/save',r=>{saves++;return r.fulfill({status:500,json:{error:'Test netwerkfout'}})});
 await edit(page);await page.waitForFunction(()=>document.querySelector('#saveRecipeBtn').dataset.mbdNotionSync==='1');
 await page.locator('#saveRecipeBtn').click();
 await expect(page.locator('#importMessage')).toContainText('Niet opgeslagen');
 await expect(page.locator('#reviewIngredients')).toHaveValue('200 g wortel');
 expect(saves).toBe(1);
 await page.locator('#reviewSteps').fill('');await page.locator('#saveRecipeBtn').click();
 expect(saves).toBe(1);
 expect(await page.evaluate(()=>readSavedDrafts().filter(x=>!x.draft._deleted).length)).toBe(1);
});
test('a concept belonging to one account is not sent to another account',async({page})=>{
 await edit(page);await page.evaluate(async()=>{window.__draftUser='user-a';await loadCloudDrafts();window.__draftUser='user-b';window.__draftCloudRows=[];await loadCloudDrafts();});
 expect(await page.evaluate(()=>window.__draftCloudRows.length)).toBe(0);
 await expect(page.locator('[data-open-draft]')).toHaveCount(0);
});
test('category heading and every selected diner determine the result count',async({page})=>{
 await page.evaluate(()=>{
  state.recipes=[{id:'one',mdb:'MDB-0001',title:'Vis A',ingredients:'200 g wortel',steps:'Kook de wortel.',category:'Vis',collections:[]},{id:'two',mdb:'MDB-0002',title:'Vis B',ingredients:'200 g wortel',steps:'Kook de wortel.',category:'Vis',collections:[]}];
  mbdRatingsSave({'MDB-0001':{Mama:{stars:4},Mace:{stars:5}},'MDB-0002':{Mama:{stars:5}}},false);setScreen('recipes');
 });
 await page.locator('#recipeFilterMenu summary').click();
 await page.locator('#filterCategory').selectOption('Vis');
 await page.locator('[name="filterPerson"][value="Dian"]').check();
 await page.locator('[name="filterPerson"][value="Mace"]').check();
 await expect(page.locator('#recipeListHeading')).toHaveText('Vis');
 await expect(page.locator('#recipeFilterSummary')).toContainText('1 resultaat');
 await page.locator('#filterRatingMode').selectOption('exact');
 await expect(page.locator('#recipeFilterSummary')).toContainText('0 resultaten');
});
test('photo requires crop confirmation and failed photo upload retries without a second recipe',async({page})=>{
 let saves=0,photos=0;
 await page.route('**/api/notion/save',r=>{saves++;return r.fulfill({json:{ok:true,mdb:'MDB-0900',notionURL:'https://notion.so/test',book:{name:'Test',number:31}}})});
 await page.route('**/api/notion/photo',r=>{photos++;return r.fulfill(photos===1?{status:502,json:{error:'Foto tijdelijk niet bereikbaar'}}:{json:{ok:true}})});
 await edit(page);await page.waitForSelector('#mbdPhotoInput');
 await page.locator('#mbdPhotoInput').setInputFiles({name:'test.svg',mimeType:'image/svg+xml',buffer:Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100"><rect width="200" height="100" fill="red"/></svg>')});
 await expect(page.getByRole('dialog')).toBeVisible();
 await page.getByRole('slider',{name:'Links',exact:true}).fill('50');
 await page.getByRole('button',{name:'Gebruik uitsnede'}).click();
 await page.waitForFunction(()=>currentDraft?.photo?.base64);
 const size=await page.evaluate(async()=>{const i=new Image();i.src='data:image/jpeg;base64,'+currentDraft.photo.base64;await i.decode();return [i.naturalWidth,i.naturalHeight]});
 expect(size).toEqual([100,100]);
 await page.locator('#saveRecipeBtn').click();
 await expect(page.locator('#importMessage')).toContainText('Foto niet opgeslagen');
 await expect(page.locator('#reviewCard')).toBeVisible();
 await page.locator('#saveRecipeBtn').click();
 await expect(page.locator('#importMessage')).toContainText('foto opgeslagen');
 expect(saves).toBe(1);expect(photos).toBe(2);
});
test('blocked import keeps manually edited ingredients and steps in a local draft',async({page})=>{
 await edit(page);
 await page.locator('#sourceText').fill('Caption met brongegevens die niet mag verdwijnen');
 await page.locator('#analyzeBtn').click();
 await expect(page.locator('#importMessage')).toContainText('niet bereikbaar');
 await expect(page.locator('#reviewIngredients')).toHaveValue('200 g wortel');
 await expect(page.locator('#reviewSteps')).toHaveValue('1. Kook de wortel.');
 expect(await page.evaluate(()=>readSavedDrafts()[0].draft.sourceText)).toContain('Caption met brongegevens');
});
test.describe('actual offline launch',()=>{
 test.use({serviceWorkers:'allow'});
 test('cached application reopens a local draft without a network connection',async({page,context})=>{
  await edit(page);await page.locator('#cancelReviewBtn').click();
  await page.evaluate(async()=>{const registration=await navigator.serviceWorker.ready;await new Promise(resolve=>{if(navigator.serviceWorker.controller)return resolve();navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true})});});
  await page.waitForFunction(async()=>{const names=await caches.keys();const c=await caches.open(names.find(n=>n.includes('0.10.38')));return !!await c.match('/recipe-filters.js?v=38')});
  await context.setOffline(true);await page.reload({waitUntil:'domcontentloaded'});
  await page.evaluate(()=>setScreen('inbox'));await page.locator('[data-open-draft]').click();
  await expect(page.locator('#reviewIngredients')).toHaveValue('200 g wortel');
 });
});
