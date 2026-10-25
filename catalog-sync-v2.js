(()=>{
'use strict';if(window.__mbdSyncV3)return;window.__mbdSyncV3=true;
const PUB='sb_publishable_sIPgFRcpRiszmq8vuWLkAg_K-C0gzfF',DB='https://ywsdubincfabjhvjqkot.supabase.co';
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
let server=[],notion=[];try{[server,notion]=await Promise.all([
get(DB+'/rest/v1/mbd_catalog?select=mdb,recipe&order=mdb.asc&limit=1000',{headers:{apikey:PUB}}),
get('/api/notion/catalog').then(x=>x.items||[]).catch(e=>{console.warn('Notion niet bereikbaar, Supabase blijft beschikbaar',e);return []})
])}catch(e){tell('Synchronisatie niet bereikbaar: '+e.message,true);return}
let add=0,fill=0,repair=0,changed=false;const serverIds=new Set(server.map(x=>String(x.mdb||'').toUpperCase()));
const merge=(r,origin)=>{
const id=String(r.mdb||'').toUpperCase();if(!/^MDB-\d{4,}$/.test(id)||!present(r.title))return;
const old=by.get(id);
if(old){
 let c=false;
 if(origin==='Notion'){
  for(const p of ['title','originalTitle','ingredients','steps','sourceURL','notionURL','category','book','bookNo','portions','time','imageURL','photoURL']){
   if(p==='sourceURL'){if(present(r[p])&&!present(old[p])){old[p]=r[p];c=true}continue}
   if(present(r[p])&&old[p]!==r[p]){old[p]=r[p];c=true}
  }
  if(r.hasPhoto&&!old.hasPhoto){old.hasPhoto=true;c=true}
  if(Array.isArray(r.collections)&&r.collections.length&&JSON.stringify(old.collections||[])!==JSON.stringify(r.collections)){old.collections=[...r.collections];c=true}
  if(c){old.contentSynced=present(old.ingredients)&&present(old.steps);old.syncedFrom='Notion';repair++;changed=true}
 }else{
  for(const p of ['title','ingredients','steps','sourceURL','notionURL','category','book','bookNo','portions','time','imageURL','photoURL','contentSynced','warnings'])if(r[p]!==undefined&&r[p]!==null&&((p==='contentSynced'||p==='warnings')||present(r[p]))&&JSON.stringify(old[p])!==JSON.stringify(r[p])){old[p]=r[p];c=true}
  if(r.hasPhoto&&!old.hasPhoto){old.hasPhoto=true;c=true}
  if((!Array.isArray(old.collections)||!old.collections.length)&&Array.isArray(r.collections)&&r.collections.length){old.collections=[...r.collections];c=true}
  if(c){fill++;changed=true}
 }
}else{
 const n={id,mdb:id,title:r.title,originalTitle:r.originalTitle||r.title,ingredients:value(r.ingredients),steps:value(r.steps),sourceURL:r.sourceURL||'',notionURL:r.notionURL||'',category:r.category||'',book:r.book||'',bookNo:r.bookNo||null,collections:Array.isArray(r.collections)?r.collections:[],imageURL:r.imageURL||'',photoURL:r.photoURL||'',hasPhoto:!!r.hasPhoto,contentSynced:present(r.ingredients)&&present(r.steps),portions:r.portions||'',time:r.time||'',warnings:r.warnings||[],syncedFrom:origin};
 state.recipes.push(n);by.set(id,n);add++;changed=true
}};
for(const row of server)if(row?.recipe)merge({...row.recipe,mdb:row.mdb},'Supabase');
const candidates=notion.filter(r=>{
 const id=String(r?.mdb||'').toUpperCase(),old=by.get(id);
 if(!/^MDB-\d{4,}$/.test(id))return false;
 if(!old)return true;
 if(!present(old.ingredients)||!present(old.steps))return true;
 if(present(r.title)&&name(old.title)!==name(r.title))return true;
 return suspicious(old);
});
for(const r of candidates.slice(0,40)){try{
 const d=await get('/api/notion/full?mdb='+encodeURIComponent(r.mdb));
 if(d.ok&&d.recipe&&!suspicious(d.recipe))merge({...d.recipe,book:r.book,bookNo:r.bookNo},'Notion');
}catch(e){console.warn('Notion recept',r.mdb,e.message)}}
if(changed){try{if(typeof persist!=='function')throw Error('persist unavailable');const snapshotKey='mbd-pre-sync-snapshot';if(!localStorage.getItem(snapshotKey)){localStorage.setItem(snapshotKey,JSON.stringify({recipes:state.recipes,week:state.week||{},savedAt:new Date().toISOString()}))}persist();if(typeof renderAll==='function')renderAll()}catch(e){tell('Online recepten gevonden; lokaal bewaren is mislukt.',true);return}}
tell('Supabase: '+server.length+' · Notion: '+notion.length+' · lokaal: '+state.recipes.length+' · toegevoegd: '+add+' · aangevuld: '+fill+' · hersteld: '+repair,false);
}
let started=false;function boot(){if(started||typeof state==='undefined'||!Array.isArray(state.recipes))return;started=true;setTimeout(()=>run().catch(e=>tell('Sync: '+e.message,true)),1500)}
document.addEventListener('DOMContentLoaded',boot);boot();let t=setInterval(()=>{boot();if(started)clearInterval(t)},300);setTimeout(()=>clearInterval(t),12000);
})();