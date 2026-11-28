(()=>{
'use strict';if(window.__mbdSyncV3)return;window.__mbdSyncV3=true;
const PUB='sb_publishable_sIPgFRcpRiszmq8vuWLkAg_K-C0gzfF',DB='https://ywsdubincfabjhvjqkot.supabase.co';
function loadPreferenceIntegration(){
 if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',loadPreferenceIntegration,{once:true});return}
 try{
  if(window.__mbdAllergyIntegrated||document.querySelector('script[data-mbd-preferences]'))return;
  const s=document.createElement('script');s.src='/allergy-integration-v2.js?v=58';s.dataset.mbdPreferences='1';
  s.onerror=()=>console.warn('Allergie/eetvoorkeur-integratie kon niet worden geladen');
  document.head.appendChild(s);
 }catch(e){console.warn('Voorkeur-integratie',e)}
}
const present=x=>x!==null&&x!==undefined&&String(x).trim()!=='';
const name=x=>String(x||'').trim().toLowerCase().replace(/\s+/g,' ');
const value=x=>typeof x==='string'?x:Array.isArray(x)?x.join('\n'):'';
const mojibake=x=>/[ÃâðÂ]/.test(String(x||''));
const englishTitle=x=>/\b(high[- ]protein|homemade|chicken pita|chicken pasta|egg bake|smashburger|save recipe|follow @|ice cream|plant based cookbook|valentine.?s day|banana dessert|breakfast wrap|breakfast sandwich|lazy sunday|herb cheese|baked cottage cheese)\b/i.test(String(x||''));
const englishBody=x=>/\b(tbsp|tsp|cups?|lbs?|oz|boneless|skinless|minced|diced|chopped|shredded|preheat|bake for|cook for|serve with|add the|mix the|olive oil|chicken thighs?|chicken breasts?|bell pepper|spring onion|shredded cheddar|ground beef|ground lamb)\b/i.test(String(x||''));
function englishScore(x){
 const s=String(x||'').toLowerCase();
 const en=(s.match(/\b(chicken|beef|pork|flour|tablespoons?|teaspoons?|cups?|bake|baked|cook|cooked|stir|onion|garlic|butter|cheese|rice|cream|eggs?|salt|pepper|breakfast|homemade|with|and|into|shredded|minced|diced|chopped|boneless|skinless)\b/g)||[]).length;
 const nl=(s.match(/\b(kip|rund|varken|bloem|eetlepels?|theelepels?|bak|gebakken|kook|gekookt|roer|ui|knoflook|boter|kaas|rijst|room|eieren?|zout|peper|ontbijt|met|en|in|geraspt|fijngehakt|gesneden)\b/g)||[]).length;
 return en-nl;
}
const clearerDutch=(local,server)=>present(local)&&present(server)&&(englishTitle(local)||englishBody(local)||englishScore(local)>=3)&&!englishTitle(server)&&!englishBody(server)&&englishScore(server)<=0;
const suspicious=r=>mojibake(r?.title)||mojibake(r?.ingredients)||mojibake(r?.steps)||englishTitle(r?.title)||englishBody(r?.ingredients)||englishBody(r?.steps);
function tell(s,bad){try{const q=document.querySelector('#recipeSearch');if(!q)return;let e=document.querySelector('#mbd-sync-v2');if(!e){e=document.createElement('div');e.id='mbd-sync-v2';e.style.cssText='font-size:12px;padding:7px 0;font-weight:600';q.insertAdjacentElement('afterend',e)}e.textContent=s;e.style.color=bad?'#985b24':'#277342'}catch(_){}}
async function get(u,opt){const r=await fetch(u,{cache:'no-store',...opt});if(!r.ok)throw Error('HTTP '+r.status);return r.json()}
async function run(){
if(typeof state==='undefined'||!Array.isArray(state.recipes))return;
const by=new Map();for(const r of state.recipes)if(r?.mdb&&!by.has(String(r.mdb).toUpperCase()))by.set(String(r.mdb).toUpperCase(),r);
let server=[];try{
 for(let offset=0;;){
  const response=await fetch(DB+'/rest/v1/mbd_catalog?select=mdb,recipe&order=mdb.asc&offset='+offset+'&limit=500',{headers:{apikey:PUB,Prefer:'count=exact'},cache:'no-store'});if(!response.ok)throw Error('Catalogus HTTP '+response.status);const page=await response.json();if(!Array.isArray(page))throw Error('Ongeldige catalogus');server.push(...page);offset+=page.length;const raw=response.headers?.get('content-range')?.split('/')[1],total=raw&&/^\d+$/.test(raw)?Number(raw):null;if(total!==null&&offset>=total||!page.length||total===null&&page.length<500)break;if(offset>100000)throw Error('Onvolledige catalogus: veilige paginalimiet bereikt');
 }

}catch(e){tell('Supabase niet bereikbaar: '+e.message,true);return}

let auditEntries={};try{const report=await get('/recipe-review-audit-20261124.json');if(report.run==='2026-11-24'&&report.entries)auditEntries=report.entries}catch(e){console.warn('Controleverslag niet geladen',e)}
for(const row of server){const entry=auditEntries[row.mdb];if(!row.recipe?.catalogReviewUpdate&&entry?.update&&Object.entries(entry.expected).every(([k,v])=>value(row.recipe?.[k])===value(v)))row.recipe.catalogReviewUpdate=entry.update;}
// Keep a fresh in-memory copy for THIS sync run. The already-persisted app state remains the durable pre-sync copy until persist() succeeds.
let preSyncState;
try {
 if(typeof persist!=='function')throw Error('persist unavailable');
 preSyncState=JSON.parse(JSON.stringify(state));
 if(!preSyncState||!Array.isArray(preSyncState.recipes))throw Error('snapshot verification failed');
}catch(e){tell('Synchronisatie gestopt: veilige tijdelijke back-up niet mogelijk ('+e.message+').',true);return}
window.MBDCatalogTotal=server.length;if(window.MBDCatalogReconcile)window.MBDCatalogSummary=MBDCatalogReconcile.summary(server);let add=0,fill=0,repair=0,changed=false;const serverIds=new Set(server.map(x=>String(x.mdb||'').toUpperCase()));

// Quarantined catalog rows are preserved but must not pollute the visible recipe library.
// Only move a local copy when its core content still exactly matches the quarantined server row.
// If the user changed it locally, keep it visible and log the conflict instead of hiding user work.
for(const row of server){
 const p=row?.recipe||{};if(p.recordStatus==='archived-test'||p.isTest){const idx=state.recipes.findIndex(r=>r.mdb===row.mdb);if(idx>=0){state.archivedTestRecipes||=[];if(!state.archivedTestRecipes.some(r=>r.mdb===row.mdb))state.archivedTestRecipes.push({...state.recipes[idx],recordStatus:'archived-test'});state.recipes.splice(idx,1);by.delete(row.mdb);changed=true;}continue}if(p.syncStatus!=='duplicate-quarantined'||!p.duplicateOf)continue;
 const id=String(row.mdb||'').toUpperCase(),canonical=String(p.duplicateOf||'').toUpperCase();
 const idx=state.recipes.findIndex(r=>String(r?.mdb||'').toUpperCase()===id);
 if(idx<0)continue;
 const local=state.recipes[idx];
 const same=name(local.title)===name(p.title)&&value(local.ingredients).trim()===value(p.ingredients).trim()&&value(local.steps).trim()===value(p.steps).trim();
 if(!same){console.warn('Quarantaine overgeslagen: lokale inhoud wijkt af',id,canonical);continue}
 if(!Array.isArray(state.quarantinedRecipes))state.quarantinedRecipes=[];
 if(!state.quarantinedRecipes.some(r=>String(r?.mdb||'').toUpperCase()===id)){
  state.quarantinedRecipes.push({...local,syncStatus:'duplicate-quarantined',duplicateOf:canonical,quarantinedAt:p.quarantinedAt||new Date().toISOString()});
 }
 const master=by.get(canonical);if(master)for(const flag of ['favorite','favourite','isFavorite','isFavourite'])if(local[flag]===true)master[flag]=true;
 state.recipes.splice(idx,1);by.delete(id);
 if(state.week&&typeof state.week==='object')for(const d of Object.keys(state.week))if(state.week[d]===local.id||state.week[d]===id)state.week[d]=canonical;
 repair++;changed=true;
}
const merge=(r,origin)=>{
const id=String(r.mdb||'').toUpperCase();if(!/^MDB-\d{4,}$/.test(id)||!present(r.title))return;
const old=by.get(id);
if(old){
 let c=false,seedRepair=false;
 if(window.MBDCatalogReconcile){const fresh=MBDCatalogReconcile.reconcile(old,r);if(fresh.changed){Object.assign(old,fresh.recipe);c=true;}if(fresh.conflicts.length)console.warn('Lokale receptwijziging behouden; online correctie controleren',id,fresh.conflicts.join(', '));}

 if(window.MBDRecipeReview){const reviewed=MBDRecipeReview.apply(old,r);if(reviewed.changed)c=true;}
 for(const k of ['estimatedRecipeScore','nutriScore','nutriScoreEstimated','nutriScoreSourceURL'])if(r[k]!==undefined&&JSON.stringify(old[k])!==JSON.stringify(r[k])){old[k]=r[k];c=true;}
 if(r.bookRestore&&old.bookRestore?.version!==r.bookRestore.version){
  const fix=r.bookRestore;
  if(!old.book||old.book===fix.from.book||old.book===r.book){
   for(const k of ['book','bookNo','notionBook','notionBookNo','notionBookId']){if(k in r)old[k]=r[k];else delete old[k]}
   for(const k of ['ahCookbook','ahBookVersion','ahPreviousBook','ahBookConflict'])delete old[k];
   old.bookRestore=fix;c=true;
  }else{console.warn('Oorspronkelijk boekherstel overgeslagen: eigen lokale boekkeuze behouden',id)}
 }

 if(r.ahCookbook&&r.ahBookVersion&&old.ahBookVersion!==r.ahBookVersion){
  const previous=r.ahPreviousBook;
  if(!old.book||old.book===r.book||old.book===previous?.name){for(const k of ['book','bookNo','notionBook','notionBookNo','notionBookId','ahCookbook','ahBookVersion','ahPreviousBook'])if(k in r)old[k]=r[k];delete old.ahBookConflict;c=true}
  else {old.ahBookConflict='Afwijkende lokale kookboekkeuze behouden; AH-indeling controleren.';c=true}
 }

 if(r.ahSyncVersion&&r.ahSyncVersion!==old.ahSyncVersion){
  const previous=r.ahPreviousContent,same=(a,b)=>['title','ingredients','steps'].every(k=>value(a?.[k]).trim()===value(b?.[k]).trim());
  if(same(old,r)||previous&&same(old,previous)){
   for(const k of ['title','originalTitle','ingredients','steps','photoURL','hasPhoto','portions','time','timings','nutrition','nutritionData','allergens','allergenStatus','ahLists','ahCategories','ahPhotoURL','ahRecipeId','ahCanonicalURL','ahSyncVersion','notionURL','notionBook','notionBookNo','notionBookId','previouslyMade','contentSynced','warnings'])if(k in r&&(!old.ahBookConflict||!['book','bookNo','notionBook','notionBookNo','notionBookId'].includes(k)))old[k]=r[k];
   old.collections=[...new Set([...(old.collections||[]),...(r.collections||[])])];delete old.ahPendingUpdate;c=true;
  }else{old.ahPendingUpdate={version:r.ahSyncVersion,message:'AH-bron bijgewerkt; afwijkende lokale inhoud behouden.'};console.warn('AH-update wacht op lokale inhoudscontrole',id);c=true;}
 }

 // Bestaande lokale gebruikersdata blijft leidend. Alleen oude ingebouwde seedtekst
 // mag worden vervangen wanneer die aantoonbaar Engels/kapot is en Supabase een duidelijke Nederlandse versie heeft.
 const canRepairSeed=old.seeded===true;
 if(present(r.title)&&present(old.title)&&name(r.title)!==name(old.title)){
  if(canRepairSeed&&clearerDutch(old.title,r.title)){old.title=r.title;c=true;seedRepair=true}
  else{console.warn('MDB titelconflict: bestaande waarde behouden',id,origin)}
 }
 for(const p of ['title','originalTitle','ingredients','steps','sourceURL','originalSourceURL','originalSourceRef','contentURL','contentSourceURL','socialURL','socialSourceURL','notionURL','category','book','bookNo','portions','time','imageURL','photoURL']){
  if(old.catalogPendingUpdate?.fields?.[p])continue;
  if(p==='title'&&name(old.title)===name(r.title))continue;
  if(present(r[p])&&!present(old[p])){old[p]=['ingredients','steps'].includes(p)?value(r[p]):r[p];c=true}
  else if(present(r[p])&&present(old[p])&&JSON.stringify(old[p])!==JSON.stringify(r[p])){
   if(canRepairSeed&&['title','originalTitle','ingredients','steps'].includes(p)&&clearerDutch(old[p],r[p])){old[p]=['ingredients','steps'].includes(p)?value(r[p]):r[p];c=true;seedRepair=true}
   else console.warn('MDB veldconflict: bestaande waarde behouden',id,p,origin);
  }
 }
 if(r.hasPhoto&&!old.hasPhoto){old.hasPhoto=true;c=true}
 if((!Array.isArray(old.collections)||!old.collections.length)&&Array.isArray(r.collections)&&r.collections.length){old.collections=[...r.collections];c=true}
 if(c){old.contentSynced=present(old.ingredients)&&present(old.steps);old.syncedFrom=seedRepair?'Nederlandse seed-herstel '+origin:'Aanvulling '+origin;fill++;if(seedRepair)repair++;changed=true}

}else{
 const n={...r,id,mdb:id,title:r.title,originalTitle:r.originalTitle||r.title,ingredients:value(r.ingredients),steps:value(r.steps),sourceURL:r.sourceURL||'',originalSourceURL:r.originalSourceURL||'',originalSourceRef:r.originalSourceRef||'',contentURL:r.contentURL||'',contentSourceURL:r.contentSourceURL||'',socialURL:r.socialURL||'',socialSourceURL:r.socialSourceURL||'',notionURL:r.notionURL||'',category:r.category||'',book:r.book||'',bookNo:r.bookNo||null,collections:Array.isArray(r.collections)?r.collections:[],imageURL:r.imageURL||'',photoURL:r.photoURL||'',hasPhoto:!!r.hasPhoto,contentSynced:present(r.ingredients)&&present(r.steps),portions:r.portions||'',time:r.time||'',warnings:r.warnings||[],syncedFrom:origin};
 const archived=Array.isArray(state.quarantinedRecipes)?state.quarantinedRecipes.find(x=>x.mdb===id):null;if(archived&&window.MBDCatalogReconcile?.restorePersonal)Object.assign(n,MBDCatalogReconcile.restorePersonal(archived,n));
 state.recipes.push(n);by.set(id,n);add++;changed=true
}};
for(const row of server)if(row?.recipe&&row.recipe.syncStatus!=='duplicate-quarantined'&&row.recipe.recordStatus!=='archived-test'&&!row.recipe.isTest)merge({...row.recipe,mdb:row.mdb},'Supabase');
for(const recipe of state.recipes)if(window.MBDRecipeReview&&auditEntries[recipe.mdb]){MBDRecipeReview.audit(recipe,auditEntries[recipe.mdb]);changed=true;}
// Notion is a backup only. Do not pull Notion into the app or overwrite app data.
if(changed){try{persist();if(typeof renderAll==='function')renderAll()}catch(e){
 const quota=e?.name==='QuotaExceededError'||e?.code===22||e?.code===1014||/quota|storage.*full|exceed/i.test(String(e?.message||e||''));
 if(quota){
  // De online catalogus is de bron voor receptinhoud. Bij volle Safari-opslag houden we de verse
  // samengevoegde catalogus in het geheugen in plaats van terug te vallen op verouderde lokale inhoud.
  try{if(typeof renderAll==='function')renderAll()}catch(renderError){console.warn('Render na opslaglimiet',renderError)}
  tell('Online recepten geladen. Safari-opslag is vol; de actuele catalogus blijft nu beschikbaar en wordt bij een volgende start opnieuw online geladen.',true);
  return;
 }
 try{if(preSyncState&&Array.isArray(preSyncState.recipes)){state=preSyncState;if(typeof STORAGE_KEY!=='undefined')localStorage.setItem(STORAGE_KEY,JSON.stringify(state));try{localStorage.setItem('mbd-week-planning-backup',JSON.stringify({week:state.week||{},savedAt:new Date().toISOString()}))}catch(_){}try{localStorage.setItem('mbd-week-archive-backup',JSON.stringify(state.weekArchive||[]))}catch(_){}if(typeof renderAll==='function')renderAll()}}catch(rollbackError){console.error('Herstel uit verse back-up mislukt',rollbackError)}
 tell('Synchronisatie kon niet veilig worden opgeslagen; de toestand van vóór deze synchronisatie is zo mogelijk hersteld.',true);return
}}
tell('Supabase: '+server.length+' · lokaal: '+state.recipes.length+' · toegevoegd: '+add+' · aangevuld: '+fill+' · hersteld: '+repair,false);
}
let started=false;function boot(){if(started||typeof state==='undefined'||!Array.isArray(state.recipes))return;started=true;setTimeout(()=>run().catch(e=>tell('Sync: '+e.message,true)),1500)}
document.addEventListener('DOMContentLoaded',boot);loadPreferenceIntegration();boot();let t=setInterval(()=>{boot();if(started)clearInterval(t)},300);setTimeout(()=>clearInterval(t),12000);
})();
