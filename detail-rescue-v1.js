(()=>{
'use strict';if(window.__mbdDetailRescueV1)return;window.__mbdDetailRescueV1=true;
const cod=s=>(String(s||'').match(/MDB-\d{4,}/i)||[])[0]?.toUpperCase()||'';
const good=s=>typeof s==='string'&&s.trim()!=='';
function recipes(){try{return typeof state!=='undefined'&&Array.isArray(state.recipes)?state.recipes:[]}catch(e){return[]}}
async function fetchRec(id){const r=await fetch('/api/notion/full?mdb='+encodeURIComponent(id),{cache:'no-store'});if(!r.ok)throw Error('HTTP '+r.status);const d=await r.json();return d.ok?d.recipe:null}
function thumb(id,photo){for(const c of document.querySelectorAll('.recipe-card')){if(cod(c.querySelector('.mdb-badge')?.textContent)!==id)continue;const img=c.querySelector('img.recipe-thumb, img.mbd-recipe-thumb');if(!img||img.dataset.mbdRescue)return;img.dataset.mbdRescue='1';img.src=photo||'/api/notion/photo?mdb='+encodeURIComponent(id);if(id==='MDB-0634')img.onerror=()=>{img.onerror=null;img.src='https://sophieglutenvrij.nl/wp-content/uploads/2022/03/Glutenvrije-knakworst-spinnetjes-1.jpeg'}}}
function fillSection(key,text){if(!good(text))return;const el=[...document.querySelectorAll('#modalRecipeBody .detail-section')].find(x=>x.querySelector('h3')?.textContent.trim().toLowerCase()===key);const div=el?.querySelector('.detail-text');if(!div)return;const before=div.textContent||'';if(!before.trim()||/nog niet|niet beschikbaar|niet lokaal/i.test(before)){div.textContent=text;div.style.whiteSpace='pre-line'}}
async function repair(id){if(!id)return;let r;try{r=await fetchRec(id)}catch(e){console.warn('Notion detail',id,e.message);return}if(!r)return;
let changed=false;for(const x of recipes().filter(x=>cod(x.mdb)===id&&String(x.title||'').trim().toLowerCase()===String(r.title||'').trim().toLowerCase())){for(const f of ['ingredients','steps','notionURL','sourceURL','photoURL'])if(!good(x[f])&&good(r[f])){x[f]=r[f];changed=true}if(r.hasPhoto&&!x.hasPhoto){x.hasPhoto=true;changed=true}if(good(x.ingredients)&&good(x.steps)&&!x.contentSynced){x.contentSynced=true;changed=true}}
if(changed)try{if(typeof persist==='function')persist()}catch(e){console.warn('Local storage',e)}
if(cod(document.querySelector('#modalRecipeMdb')?.textContent)!==id)return;
fillSection('ingrediënten',r.ingredients);fillSection('bereiding',r.steps);
const body=document.querySelector('#modalRecipeBody');if(body&&r.hasPhoto&&!body.querySelector('.mbd-modal-photo')){const img=document.createElement('img');img.className='mbd-modal-photo';img.alt='Receptfoto';img.loading='lazy';img.style.cssText='display:block;width:100%;max-height:320px;object-fit:cover;border-radius:14px;margin:10px auto 16px';img.src=r.photoURL||'/api/notion/photo?mdb='+encodeURIComponent(id);img.onerror=()=>{if(id==='MDB-0634'){img.onerror=null;img.src='https://sophieglutenvrij.nl/wp-content/uploads/2022/03/Glutenvrije-knakworst-spinnetjes-1.jpeg'}else img.style.display='none'};body.prepend(img)}
thumb(id,r.photoURL);
}
document.addEventListener('click',e=>{const btn=e.target?.closest?.('[data-view]');if(!btn)return;setTimeout(()=>repair(cod(document.querySelector('#modalRecipeMdb')?.textContent)||cod(btn.dataset.view)),90)},true);
function fixPhoto(){const r=recipes().find(x=>cod(x.mdb)==='MDB-0634');if(r?.hasPhoto)thumb('MDB-0634',r.imageURL||r.photoURL||'https://sophieglutenvrij.nl/wp-content/uploads/2022/03/Glutenvrije-knakworst-spinnetjes-1.jpeg')}
let n=0,t=setInterval(()=>{fixPhoto();if(++n>17)clearInterval(t)},1200);
})();