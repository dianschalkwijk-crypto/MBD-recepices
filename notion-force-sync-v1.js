(()=>{'use strict';if(window.__mbdNotionForceSyncV1)return;window.__mbdNotionForceSyncV1=true;
const code=s=>(String(s||'').match(/MDB-\d{4,}/i)||[])[0]?.toUpperCase()||'';
const present=x=>x!==null&&x!==undefined&&String(x).trim()!=='';
function recipes(){try{return typeof state!=='undefined'&&Array.isArray(state.recipes)?state.recipes:[]}catch{return[]}}
async function full(id){const r=await fetch('/api/notion/full?mdb='+encodeURIComponent(id)+'&_='+Date.now(),{cache:'no-store'});if(!r.ok)throw Error('HTTP '+r.status);const d=await r.json();return d.ok?d.recipe:null}
function modalId(){return code(document.querySelector('#modalRecipeMdb')?.textContent)||code(document.querySelector('[data-modal-mdb]')?.textContent)}
function modalRoot(){const m=document.querySelector('#modalRecipeMdb')||document.querySelector('[data-modal-mdb]');return m?.closest?.('.modal,.sheet,.dialog,[role="dialog"]')||document}
function replaceSection(label,text){
 if(!present(text))return;
 const root=document.querySelector('#modalRecipeBody')||modalRoot();
 const heads=[...root.querySelectorAll('h2,h3,h4,strong,b')];
 const h=heads.find(x=>String(x.textContent||'').trim().toLowerCase()===label);
 if(!h)return;
 const sec=h.closest('.detail-section,.section')||h.parentElement;
 let target=sec?.querySelector('.detail-text,.content,.value');
 if(!target){
   target=h.nextElementSibling;
   if(!target&&sec){
     const kids=[...sec.children].filter(x=>x!==h);
     target=kids[0]||null;
   }
 }
 if(target){target.textContent=text;target.style.whiteSpace='pre-line'}
}
function patchTitle(r){
 const root=modalRoot();
 const direct=root.querySelector('#modalRecipeTitle,[data-modal-title]');
 if(direct){direct.textContent=r.title;return}
 const h=[...root.querySelectorAll('h1,h2')].find(x=>!code(x.textContent)&&!/^ingrediënten$|^bereiding$/i.test(String(x.textContent||'').trim()));
 if(h)h.textContent=r.title
}
function patchSource(r){
 const root=modalRoot();
 for(const el of root.querySelectorAll('[data-modal-source],a[href*="munchiesbymallory"],a[href*="youtube.com"]')){
   el.setAttribute('data-modal-source',r.sourceURL||'');
   if(r.sourceURL){
     if(el.tagName==='A')el.setAttribute('href',r.sourceURL);
     el.removeAttribute('aria-disabled');el.style.pointerEvents='';
     if(/bron|source/i.test(el.textContent||''))el.textContent='Bron openen';
   }else{
     if(el.tagName==='A')el.removeAttribute('href');
     el.setAttribute('aria-disabled','true');el.style.pointerEvents='none';
     if(/bron|source|youtube|website/i.test(el.textContent||''))el.textContent=(r.sourcePlatform||'Social')+' · link nog niet hersteld';
   }
 }
}
function applyToState(r){
 let changed=false;
 for(const x of recipes().filter(x=>code(x.mdb||x.id)===r.mdb)){
   for(const f of ['title','originalTitle','ingredients','steps','notionURL','category','portions','time','photoURL']){
     if(present(r[f])&&x[f]!==r[f]){x[f]=r[f];changed=true}
   }
   if(present(r.sourceURL)&&!present(x.sourceURL)){x.sourceURL=r.sourceURL;changed=true}
   if(present(r.sourcePlatform)&&!present(x.sourcePlatform)){x.sourcePlatform=r.sourcePlatform;changed=true}
   if(r.hasPhoto&&!x.hasPhoto){x.hasPhoto=true;changed=true}
   if(present(r.ingredients)&&present(r.steps)&&!x.contentSynced){x.contentSynced=true;changed=true}
   if(changed)x.syncedFrom='Notion'
 }
 if(changed){try{if(typeof persist==='function')persist()}catch(e){console.warn('persist',e)}}
 return changed
}
async function syncOne(id){
 if(!id)return;
 try{
   const r=await full(id);if(!r)return;
   applyToState(r);
   if(modalId()===id){
     patchTitle(r);
     replaceSection('ingrediënten',r.ingredients);
     replaceSection('bereiding',r.steps);
     patchSource({...r,sourceURL:recipes().find(x=>code(x.mdb||x.id)===id)?.sourceURL||r.sourceURL});
   }
 }catch(e){console.warn('Notion force sync',id,e.message)}
}
document.addEventListener('click',e=>{
 const src=e.target?.closest?.('[data-modal-source]');
 if(src && !String(src.getAttribute('data-modal-source')||'').trim()){e.preventDefault();e.stopImmediatePropagation();return}
 const btn=e.target?.closest?.('[data-view]');
 if(btn)setTimeout(()=>syncOne(code(btn.dataset.view)||modalId()),100);
},true);
let last='';
setInterval(()=>{const id=modalId();if(id&&id!==last){last=id;syncOne(id)}if(!id)last=''},500);
function boot(){
 if(typeof state==='undefined'||!Array.isArray(state.recipes))return setTimeout(boot,300);
 const r=recipes().find(x=>code(x.mdb||x.id)==='MDB-0183');
 if(r)syncOne('MDB-0183');
}
boot();
})();