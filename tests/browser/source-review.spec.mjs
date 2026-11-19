import {test,expect} from '@playwright/test';
import QRCode from 'qrcode';
import {PNG} from 'pngjs';
const target='https://recipe.example.test/soep';
const fixture=[{mdb:'MDB-0001',recipe:{mdb:'MDB-0001',title:'Uiensoep',sourceURL:'https://source.example.test/old?x=1',originalSourceURL:'https://source.example.test/original',contentURL:'https://other.example.test/content',ingredients:'1 ui',steps:'Kook de ui'}},{mdb:'MDB-0002',recipe:{mdb:'MDB-0002',title:'Bron onbekend',ingredients:'1 appel',steps:'Snijd'}},{mdb:'MDB-0003',recipe:{mdb:'MDB-0003',title:'Quarantaine',sourceURL:'https://source.example.test/duplicate',syncStatus:'duplicate-quarantined'}},{mdb:'MDB-0004',recipe:{mdb:'MDB-0999',title:'Schrift <script>bad()</script>',originalSourceRef:'Schrift van Dian, pagina 4'}}];
async function qr(text){return {name:'controle.png',mimeType:'image/png',buffer:await QRCode.toBuffer(text,{width:500,margin:4})};}
test.beforeEach(async({context,page})=>{
 page.errors=[];page.on('pageerror',e=>page.errors.push(e.message));
 page.writes=[];context.on('request',r=>{if(r.method()!=='GET')page.writes.push(r.url());});
 await context.route('**/api/notion/catalog?sourceReview=1',r=>r.fulfill({json:{ok:true,source:'public.mbd_catalog',items:fixture}}));
 await context.route('https://recipe.example.test/**',r=>r.fulfill({contentType:'text/html',body:'<h1>Uiensoep</h1><p>1 ui. Kook de ui.</p>'}));
 await page.goto('/bronnen-qr.html');await expect(page.locator('#source-info')).toContainText('4 records');
});
test.afterEach(async({page})=>{expect(page.errors).toEqual([]);expect(page.writes).toEqual([]);});
async function open(page,title='Uiensoep'){await page.locator('article').filter({has:page.getByRole('heading',{name:title,exact:true})}).getByRole('button',{name:'Controle openen'}).click();}
async function save(page){await page.getByRole('button',{name:'Controle bij dit recept opslaan'}).click();await expect(page.locator('#save-state')).toContainText('Opgeslagen en teruggelezen');}
test('dashboard, original fields and every filter remain separate from recipe data',async({page})=>{
 await expect(page.locator('#dashboard strong')).toHaveText(['4','1','4','4','4']);
 await page.locator('#filter').selectOption('missing-source');await expect(page.locator('article')).toHaveCount(1);await expect(page.locator('article')).toContainText('Bron onbekend');
 for(const filter of ['no-exact','source-pending','qr-pending','untested']){await page.locator('#filter').selectOption(filter);await expect(page.locator('article')).toHaveCount(4);}
 for(const filter of ['replaced','ready']){await page.locator('#filter').selectOption(filter);await expect(page.locator('article')).toHaveCount(0);}
 await page.locator('#filter').selectOption('');await open(page);await expect(page.locator('#original')).toContainText(fixture[0].recipe.sourceURL);await expect(page.locator('#original')).toContainText(fixture[0].recipe.originalSourceURL);await expect(page.locator('#validatedSource')).toHaveValue('');await expect(page.locator('#exactOriginalURL')).toHaveValue('');
 await page.locator('#note').fill('Bron nader onderzoeken');await page.locator('#openCheck').fill('Oorspronkelijke video vergelijken');await page.locator('#nextStep').fill('Eigenaar controleren');await page.locator('#round-field').fill('Ronde 1');await page.locator('#decision').selectOption('investigate');await save(page);
 await page.reload();await open(page);await expect(page.locator('#note')).toHaveValue('Bron nader onderzoeken');await expect(page.locator('#nextStep')).toHaveValue('Eigenaar controleren');await expect(page.locator('#round-field')).toHaveValue('Ronde 1');await expect(page.locator('#original')).toContainText(fixture[0].recipe.sourceURL);
 await expect(page.locator('#rounds')).toContainText('Ronde 1: 0 van 1');
 expect(await page.evaluate(()=>localStorage.getItem('madebydian-recipes-filled-copy-v0.5'))).toBeNull();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('QR image must decode to the exact target and match the actual recipe before approval',async({page,context})=>{
 await open(page);await page.locator('#qrTarget').fill(target);await page.locator('#qr-file').setInputFiles(await qr('MDB-0001'));await expect(page.locator('#qr-result')).toContainText('Placeholder op MDB-ID');
 await page.locator('#testStatus').selectOption('passed');await page.locator('#save').click();await expect(page.locator('#save-state')).toContainText('Niet opgeslagen');
 await page.locator('#qr-file').setInputFiles(await qr('https://recipe.example.test/wrong'));await expect(page.locator('#qr-result')).toContainText('QR wijkt af');
 const blank=new PNG({width:200,height:200});blank.data.fill(255);await page.locator('#qr-file').setInputFiles({name:'blank.png',mimeType:'image/png',buffer:PNG.sync.write(blank)});await expect(page.locator('#qr-result')).toContainText('Niet decodeerbaar');
 await page.locator('#qr-file').setInputFiles(await qr(target));await expect(page.locator('#qr-result')).toContainText('bestemming nog controleren');
 await page.locator('#destination').selectOption('matched');await page.locator('#destination-note').fill('Uiensoep met 1 ui en dezelfde kookstap.');await page.locator('#confirm-destination').click();await expect(page.locator('#message')).toContainText('Open eerst');
 const popupPromise=context.waitForEvent('page');await page.getByRole('link',{name:'Open gedecodeerde QR-bestemming'}).click();const popup=await popupPromise;await expect(popup.locator('body')).toContainText('Uiensoep');await expect(popup.locator('body')).toContainText('1 ui. Kook de ui.');await popup.close();
 await page.locator('#confirm-destination').click();await expect(page.locator('#qr-result')).toContainText('QR en receptbestemming gecontroleerd');
 await page.locator('#validatedSource').fill(target);await page.locator('#sourceEvidence').fill('Titel, 1 ui en kookstap komen inhoudelijk overeen.');await page.locator('#sourceStatus').selectOption('verified');
 // Editing the validated source invalidates the destination evidence; re-open and confirm.
 const pop2=context.waitForEvent('page');await page.getByRole('link',{name:'Open gedecodeerde QR-bestemming'}).click();await (await pop2).close();await page.locator('#destination').selectOption('matched');await page.locator('#destination-note').fill('Uiensoep: 1 ui, kook de ui; bron en bestemming opnieuw vergeleken.');await page.locator('#confirm-destination').click();
 await page.locator('#testStatus').selectOption('passed');await page.locator('#decision').selectOption('ready');await page.locator('#round-field').fill('Ronde 2');await save(page);
 await page.reload();await page.locator('#filter').selectOption('ready');await expect(page.locator('article')).toHaveCount(1);await expect(page.locator('#rounds')).toContainText('Ronde 2: 1 van 1');
 await open(page);await page.locator('#qrTarget').fill(target+'?different=1');await expect(page.locator('#qr-result')).toContainText('QR wijkt af');await page.locator('#save').click();await expect(page.locator('#save-state')).toContainText('Niet opgeslagen');
});
test('replacement, protected destination and exact-original evidence cannot silently approve each other',async({page,context})=>{
 await open(page);await page.locator('#sourceStatus').selectOption('replaced');await page.locator('#replacementSource').fill(target);await page.locator('#save').click();await expect(page.locator('#save-state')).toContainText('onderbouwde beslissing');
 await page.locator('#sourceEvidence').fill('Bewust alternatief; origineel is afgeschermd.');await page.locator('#decision').selectOption('replace');await page.locator('#testStatus').selectOption('restricted');await save(page);
 await page.locator('#exactOriginalURL').fill('https://source.example.test/claimed');await page.locator('#save').click();await expect(page.locator('#save-state')).toContainText('exacte oorspronkelijke URL');await page.locator('#exactOriginalURL').fill('');
 await page.locator('#qrTarget').fill(target);await page.locator('#qr-file').setInputFiles(await qr(target));const popup=context.waitForEvent('page');await page.getByRole('link',{name:'Open gedecodeerde QR-bestemming'}).click();await (await popup).close();await page.locator('#destination').selectOption('restricted');await page.locator('#destination-note').fill('Deze testwaarneming simuleert een afgeschermde bron, geen bewijs van een kapotte URL.');await page.locator('#confirm-destination').click();await expect(page.locator('#qr-result')).toContainText('afgeschermd');await save(page);
 await page.locator('#filter').selectOption('replaced');await expect(page.locator('article')).toHaveCount(1);await page.locator('#filter').selectOption('ready');await expect(page.locator('article')).toHaveCount(0);
});
test('account drafts are excluded; local dataset has isolated reviews and duplicate IDs block save',async({page})=>{
 await page.evaluate(()=>{localStorage.setItem('madebydian-recipes-filled-copy-v0.5',JSON.stringify({recipes:[{id:'local-one',mdb:'MDB-0001',title:'Lokale soep',sourceURL:'https://local.example.test'},{id:'dup',title:'Dubbel A'},{id:'dup',title:'Dubbel B'}]}));localStorage.setItem('mbd-recipe-import-drafts-v1',JSON.stringify([{id:'public-draft',draft:{title:'Lokaal concept'}},{id:'private-draft',ownerId:'other-account',draft:{title:'Privéconcept'}}]));});
 await page.locator('#dataset').selectOption('local');await expect(page.locator('#source-info')).toContainText('3 records');await open(page,'Lokale soep');await page.locator('#note').fill('Alleen lokaal');await save(page);await page.locator('#dataset').selectOption('catalog');await open(page);await expect(page.locator('#note')).toHaveValue('');
 await page.locator('#dataset').selectOption('local');await open(page,'Dubbel A');await expect(page.locator('#save')).toBeDisabled();await expect(page.locator('#editor-warning')).toContainText('Geen unieke vaste sleutel');
 await page.locator('#dataset').selectOption('drafts');await expect(page.locator('article')).toHaveCount(1);await expect(page.locator('article')).toContainText('Lokaal concept');await expect(page.locator('body')).not.toContainText('Privéconcept');
});
test('two tabs detect concurrent saves; history and a downloaded backup restore one review consciously',async({page,context})=>{
 await open(page);await page.locator('#note').fill('Versie 1');await save(page);
 const other=await context.newPage();await other.goto('/bronnen-qr.html');await open(other);await other.locator('#note').fill('Mijn nog niet opgeslagen tekst');
 await page.locator('#note').fill('Versie 2');await save(page);await other.locator('#save').click();await expect(other.locator('#save-state')).toContainText('ander venster');await expect(other.locator('#note')).toHaveValue('Mijn nog niet opgeslagen tekst');await other.close({runBeforeUnload:false});
 await page.locator('#history').click();await expect(page.locator('#note')).toHaveValue('Versie 1');await expect(page.locator('#save-state')).toContainText('nog niet opgeslagen');
 page.once('dialog',d=>d.accept());await page.locator('#close').click();
 const downloadPromise=page.waitForEvent('download');await page.locator('#export').click();const download=await downloadPromise;const path=await download.path();await page.locator('#restore-file').setInputFiles(path);await page.locator('#restore-list button').click();await expect(page.locator('#note')).toHaveValue('Versie 2');await expect(page.locator('#save-state')).toContainText('nog niet opgeslagen');
});
test('print includes the entire filtered selection and storage/network failures never claim success',async({page,context})=>{
 await page.evaluate(()=>window.print=()=>{window.didPrint=true;});await page.locator('#filter').selectOption('missing-source');await page.locator('#print-selection').click();await expect(page.locator('#print-area .print-entry')).toHaveCount(1);await page.emulateMedia({media:'print'});await expect(page.locator('#print-area')).toBeVisible();await expect(page.locator('#list')).toBeHidden();await expect(page.locator('#print-area')).toContainText('MDB-0002');await page.emulateMedia({media:'screen'});
 await context.route('**/api/notion/catalog?sourceReview=1',r=>r.fulfill({status:503,json:{message:'offline'}}));await page.locator('#refresh').click();await expect(page.locator('#message')).toContainText('HTTP 503');await expect(page.locator('article')).toHaveCount(0);
 await context.unroute('**/api/notion/catalog?sourceReview=1');await context.route('**/api/notion/catalog?sourceReview=1',r=>r.fulfill({json:{ok:true,source:'public.mbd_catalog',items:fixture}}));
 await page.addInitScript(()=>Object.defineProperty(window,'indexedDB',{value:{open(){throw Error('Testopslag geblokkeerd');}}}));await page.reload();await open(page);await expect(page.locator('#save')).toBeDisabled();await expect(page.locator('#message')).toContainText('Alleen lezen');
});
