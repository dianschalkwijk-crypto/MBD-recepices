import {test,expect} from '@playwright/test';
test('uncertain claimed save preserves input and blocks another submission',async({page})=>{
 let saves=0;
 await page.route('https://**/*',r=>r.fulfill({contentType:'text/javascript',body:r.request().url().includes('supabase')?`window.supabase={createClient(){return {auth:{getSession:async()=>({data:{session:null}}),getUser:async()=>({data:{user:null}}),onAuthStateChange(){return {data:{subscription:{unsubscribe(){}}}}}},from(){const q=new Proxy({},{get(_,key){if(key==='then')return resolve=>Promise.resolve({data:[],error:null}).then(resolve);return ()=>q}});return q;}}}};`:'[]'}));
 await page.route('**/pinterest-books-23-29.json',r=>r.fulfill({json:{recipes:[]}}));
 await page.route('**/api/**',r=>r.fulfill({json:{ok:true,recipes:[],items:[]}}));
 await page.route('**/api/recipes/import',r=>r.fulfill({json:{title_nl:'Technische controlesoep',ingredients:[{amount:'200',unit:'g',ingredient:'wortel'}],steps:['Kook de wortel.'],source_completeness:'complete',collections:['Overig']}}));
 await page.route('**/api/notion/save',r=>{saves++;return r.fulfill({status:409,json:{ok:false,code:'save_in_progress',reconciliationRequired:true,mdb:'MDB-0706',error:'Dit recept heeft al nummer MDB-0706. Controleer de bestaande opslag; er is geen nieuw nummer aangemaakt.'}});});
 await page.goto('/');await page.waitForFunction(()=>document.querySelector('#saveRecipeBtn')?.dataset.mbdNotionSync==='1');
 await page.locator('#sourceText').fill('Technische controlesoep\n200 g wortel\nKook de wortel.');
 await page.locator('#analyzeBtn').click();
 await expect(page.locator('#reviewTitle')).toHaveValue('Technische controlesoep');
 await page.locator('#saveRecipeBtn').click();await expect(page.locator('#importMessage')).toContainText('Controle nodig');await expect(page.locator('#importMessage')).toContainText('MDB-0706');
 await expect(page.locator('#saveRecipeBtn')).toBeDisabled();await expect(page.locator('#reviewIngredients')).toHaveValue('200 g wortel');await expect(page.locator('#reviewSteps')).toHaveValue('1. Kook de wortel.');
 expect(saves).toBe(1);expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('madebydian-recipes-filled-copy-v0.5')).recipes.some(r=>r.mdb==='MDB-0706'))).toBe(false);
});
