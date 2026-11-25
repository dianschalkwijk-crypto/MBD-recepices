(()=>{'use strict';if(window.__mbdDetailRescueV2)return;window.__mbdDetailRescueV2=true;
const cod=s=>(String(s||'').match(/MDB-\d{4,}/i)||[])[0]?.toUpperCase()||'';
const good=s=>typeof s==='string'&&s.trim()!=='';
function recipes(){try{return typeof state!=='undefined'&&Array.isArray(state.recipes)?state.recipes:[]}catch(e){return[]}}
async function fetchRec(id){const r=await fetch('/api/notion/full?mdb='+encodeURIComponent(id),{cache:'no-store'});if(!r.ok)throw Error('HTTP '+r.status);const d=await r.json();return d.ok?d.recipe:null}
function root(){const m=document.querySelector('#modalRecipeMdb');return m?.closest?.('.modal,.sheet,.dialog,[role="dialog"]')||document}
function setTitle(r){const z=root();let h=z.querySelector?.('#modalRecipeTitle');if(!h)h=[...(z.querySelectorAll?.('h1,h2')||[])].find(x=>!cod(x.textContent)&&good(x.textContent));if(h&&good(r.title))h.textContent=r.title}
function setSection(key,text){if(!good(text))return;const b=document.querySelector('#modalRecipeBody')||root();const sec=[...(b.querySelectorAll?.('.detail-section')||[])].find(x=>x.querySelector('h3')?.textContent.trim().toLowerCase()===key);const d=sec?.querySelector('.detail-text');if(d){d.textContent=text;d.style.whiteSpace='pre-line';return}const h=[...(b.querySelectorAll?.('h3')||[])].find(x=>x.textContent.trim().toLowerCase()===key);const n=h?.nextElementSibling;if(n){n.textContent=text;n.style.whiteSpace='pre-line'}}
async function repair(id){if(!id)return;let r;try{r=await fetchRec(id)}catch(e){console.warn('Notion detail',id,e.message);return}if(!r)return;
let changed=false;for(const x of recipes().filter(x=>cod(x.mdb)===id)){for(const f of ['title','originalTitle','ingredients','steps','notionURL','sourceURL','photoURL','category','portions','time']){if(good(r[f])&&x[f]!==r[f]){x[f]=r[f];changed=true}}if(r.hasPhoto&&!x.hasPhoto){x.hasPhoto=true;changed=true}if(good(r.ingredients)&&good(r.steps)&&!x.contentSynced){x.contentSynced=true;changed=true}if(changed)x.syncedFrom='Notion'}
if(changed){try{if(typeof persist==='function')persist();if(typeof renderAll==='function')renderAll()}catch(e){console.warn('Local storage',e)}}
if(cod(document.querySelector('#modalRecipeMdb')?.textContent)!==id)return;setTitle(r);setSection('ingrediënten',r.ingredients);setSection('bereiding',r.steps)}
document.addEventListener('click',e=>{const btn=e.target?.closest?.('[data-view]');if(!btn)return;setTimeout(()=>repair(cod(document.querySelector('#modalRecipeMdb')?.textContent)||cod(btn.dataset.view)),80)},true);
let last='';setInterval(()=>{const id=cod(document.querySelector('#modalRecipeMdb')?.textContent);if(id&&id!==last){last=id;repair(id)}if(!id)last=''},700);
})();