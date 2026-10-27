(()=>{
'use strict';if(window.__mbdSyncV3)return;window.__mbdSyncV3=true;
const PUB='sb_publishable_sIPgFRcpRiszmq8vuWLkAg_K-C0gzfF',DB='https://ywsdubincfabjhvjqkot.supabase.co';
function loadPreferenceIntegration(){
 try{
  if(window.__mbdAllergyIntegrated||document.querySelector('script[data-mbd-preferences]'))return;
  const s=document.createElement('script');s.src='/allergy-integration-v2.js?v=20';s.dataset.mbdPreferences='1';
  s.onerror=()=>console.warn('Allergie/eetvoorkeur-integratie kon niet worden geladen');
  document.head.appendChild(s);
 }catch(e){console.warn('Voorkeur-integratie',e)}
}
const present=x=>x!==null&&x!==undefined&&String(x).trim()!=='';
const name=x=>String(x||'').trim().toLowerCase().replace(/\s+/g,' ');
const value=x=>typeof x==='string'?x:Array.isArray(x)?x.join('\n'):'';
const mojibake=x=>/[ÃâðÂ]/.test(String(x||''));
const englishTitle=x=>/\b(high[- ]protein|homemade|chicken pita|chicken pasta|egg bake|smashburger|save recipe|follow @|ice cream|plant based cookbook|valentine.?s day|banana dessert)\b/i.test(String(x||''));
const englishBody=x=>/\b(tbsp|tsp|cups?|lbs?|oz|boneless|skinless|minced|diced|chopped|shredded|preheat|bake for|cook for|serve with|add the|mix the|olive oil|chicken thighs?|chicken breasts?)\b/i.test(String(x||''));
const suspicious=r=>mojibake(r?.title)||mojibake(r?.ingredients)||mojibake(r?.steps)||englishTitle(r?.title)||englishBody(r?.ingredients)||englishBody(r?.steps);
function tell(s,bad){try{const q=document.querySelector('#recipeSearch');if(!q)return;let e=document.querySelector('#mbd-sync-v2');if(!e){e=document.createElement('div');e.id='mbd-sync-v2';e.style.cssText='font-size:12px;padding:7px 0;font-weight:600';q.insertAdjacentElement('afterend',e)}e.textContent=s;e.style.color=bad?'#985b24':'#277342'}catch(_){}}
async function get(u,opt){const r=await fetch(u,{cache:'no-store',...opt});if(!r.ok)throw Error('HTTP '+r.status);return r.json()}
async function run(){
if(typeof state==='undefined'||!Array.isArray(state.recipes))return;
const by=new Map();for(const r of state.recipes)if(r?.mdb&&!by.has(String(r.mdb).toUpperCase()))by.set(String(r.mdb).toUpperCase(),r);
let server=[];try{
 server=await get(DB+'/rest/v1/mbd_catalog?select=mdb,recipe&order=mdb.asc&limit=1000',{headers:{apikey:PUB}});
}catch(e){tell('Supabase niet bereikbaar: '+e.message,true);return}

// Keep a fresh in-memory copy for THIS sync run. The already-persisted app state remains the durable pre-sync copy until persist() succeeds.
let preSyncState;
try {
 if(typeof persist!=='function')throw Error('persist unavailable');
 preSyncState=JSON.parse(JSON.stringify(state));
 if(!preSyncState||!Array.isArray(preSyncState.recipes))throw Error('snapshot verification failed');
}catch(e){tell('Synchronisatie gestopt: veilige tijdelijke back-up niet mogelijk ('+e.message+').',true);return}
let add=0,fill=0,repair=0,changed=false;const serverIds=new Set(server.map(x=>String(x.mdb||'').toUpperCase()));

// Quarantined catalog rows are preserved but must not pollute the visible recipe library.
// Only move a local copy when its core content still exactly matches the quarantined server row.
// If the user changed it locally, keep it visible and log the conflict instead of hiding user work.
for(const row of server){
 const p=row?.recipe||{};if(p.syncStatus!=='duplicate-quarantined'||!p.duplicateOf)continue;
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
 state.recipes.splice(idx,1);by.delete(id);
 if(state.week&&typeof state.week==='object')for(const d of Object.keys(state.week))if(state.week[d]===local.id||state.week[d]===id)state.week[d]=canonical;
 repair++;changed=true;
}
const merge=(r,origin)=>{
const id=String(r.mdb||'').toUpperCase();if(!/^MDB-\d{4,}$/.test(id)||!present(r.title))return;
const old=by.get(id);
if(old){
 let c=false;
 // Fill only blank fields. Never overwrite existing data from another source.
 if(present(r.title)&&present(old.title)&&name(r.title)!==name(old.title)){
  console.warn('MDB titelconflict: overgeslagen',id,origin);
  return;
 }
 for(const p of ['title','originalTitle','ingredients','steps','sourceURL','notionURL','category','book','bookNo','portions','time','imageURL','photoURL']){
  if(present(r[p])&&!present(old[p])){old[p]=r[p];c=true}
  else if(present(r[p])&&present(old[p])&&JSON.stringify(old[p])!==JSON.stringify(r[p]))
   console.warn('MDB veldconflict: bestaande waarde behouden',id,p,origin);
 }
 if(r.hasPhoto&&!old.hasPhoto){old.hasPhoto=true;c=true}
 if((!Array.isArray(old.collections)||!old.collections.length)&&Array.isArray(r.collections)&&r.collections.length){old.collections=[...r.collections];c=true}
 if(c){old.contentSynced=present(old.ingredients)&&present(old.steps);old.syncedFrom='Aanvulling '+origin;fill++;changed=true}

}else{
 const n={id,mdb:id,title:r.title,originalTitle:r.originalTitle||r.title,ingredients:value(r.ingredients),steps:value(r.steps),sourceURL:r.sourceURL||'',notionURL:r.notionURL||'',category:r.category||'',book:r.book||'',bookNo:r.bookNo||null,collections:Array.isArray(r.collections)?r.collections:[],imageURL:r.imageURL||'',photoURL:r.photoURL||'',hasPhoto:!!r.hasPhoto,contentSynced:present(r.ingredients)&&present(r.steps),portions:r.portions||'',time:r.time||'',warnings:r.warnings||[],syncedFrom:origin};
 state.recipes.push(n);by.set(id,n);add++;changed=true
}};
for(const row of server)if(row?.recipe&&row.recipe.syncStatus!=='duplicate-quarantined')merge({...row.recipe,mdb:row.mdb},'Supabase');
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