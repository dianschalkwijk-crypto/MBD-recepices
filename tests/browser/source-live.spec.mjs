// Opt-in integration against the REAL public catalog. No network stubs, login, recipe writes or allocations.
import {test,expect} from '@playwright/test';
test.skip(!process.env.MBD_LIVE_SOURCE_TEST,'Explicit live-catalog read required');
test('real catalog, local review readback and print do not write recipes',async({page},testInfo)=>{
 const errors=[],writes=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.method()!=='GET')writes.push({url:r.url(),method:r.method()});});
 page.on('requestfailed',r=>console.log('Live read failed:',r.url(),r.failure()?.errorText));
 await page.goto('/bronnen-qr.html');await page.waitForFunction(()=>!!document.querySelector('#source-info').textContent);console.log('Live catalog:',await page.locator('#message').innerText());await expect(page.locator('#source-info')).toContainText('689 records',{timeout:10000});await expect(page.locator('#dashboard strong')).toHaveText(['689','44','689','689','689']);
 await expect(page.locator('#source-info')).toContainText('18 in quarantaine');
 await page.screenshot({path:'/workspace/scratch/mbd-source-live-'+testInfo.project.name+'.png',fullPage:false});
 await page.locator('#query').fill('MDB-0694');await expect(page.locator('article')).toHaveCount(1);await expect(page.locator('article')).toContainText('Controletest');await page.getByRole('button',{name:'Controle openen'}).click();
 await expect(page.locator('#original')).toContainText('MDB-0694');const original=await page.locator('#original').innerText();await page.locator('#note').fill('Technische werkruimtecontroletest in geïsoleerde browser; geen inhoudelijke brongoedkeuring.');await page.locator('#round-field').fill('Technische test');await page.locator('#decision').selectOption('investigate');await page.locator('#save').click();await expect(page.locator('#save-state')).toContainText('Opgeslagen en teruggelezen');
 await page.reload();await expect(page.locator('#source-info')).toContainText('689 records',{timeout:30000});await page.locator('#query').fill('MDB-0694');await page.getByRole('button',{name:'Controle openen'}).click();await expect(page.locator('#note')).toHaveValue('Technische werkruimtecontroletest in geïsoleerde browser; geen inhoudelijke brongoedkeuring.');expect(await page.locator('#original').innerText()).toBe(original);
 await page.evaluate(()=>window.print=()=>{});await page.locator('#print-one').click();await page.emulateMedia({media:'print'});await expect(page.locator('#print-area .print-entry')).toHaveCount(1);await expect(page.locator('#print-area')).toContainText('MDB-0694');await expect(page.locator('#editor')).toBeHidden();await page.emulateMedia({media:'screen'});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(errors).toEqual([]);expect(writes).toEqual([]);
});
