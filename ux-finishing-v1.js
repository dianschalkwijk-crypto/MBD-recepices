(()=>{
if(window.__mbdUxFinishingV1)return;window.__mbdUxFinishingV1=true;
const q=s=>document.querySelector(s);

function visualEmoji(r){
 const t=[r?.title,r?.category,(r?.collections||[]).join(" ")].filter(Boolean).join(" ").toLocaleLowerCase("nl");
 if(/soep|bouillon/.test(t))return "🍲";
 if(/pasta|spaghetti|macaroni|orzo|gnocchi/.test(t))return "🍝";
 if(/pizza/.test(t))return "🍕";
 if(/wrap|taco|burrito|quesadilla/.test(t))return "🌯";
 if(/zalm|vis|tonijn/.test(t))return "🐟";
 if(/kip|chicken/.test(t))return "🍗";
 if(/salade/.test(t))return "🥗";
 if(/aardappel|friet/.test(t))return "🥔";
 if(/brood|tosti|sandwich/.test(t))return "🥪";
 if(/cake|taart|brownie|choco|dessert|toetje/.test(t))return "🍰";
 return "🍽️";
}
async function loadWeekImage(img,placeholder,r){
 const show=url=>{
  if(!url)return false;
  img.onload=()=>{img.hidden=false;placeholder.hidden=true};
  img.onerror=()=>{img.hidden=true;placeholder.hidden=false;img.removeAttribute("src")};
  img.src=url;return true;
 };
 const direct=r?.ownPhotoURL||r?.photoURL||r?.imageURL||r?.image||"";
 if(/^https?:|^data:image\//i.test(String(direct||""))){show(direct);return}
 const path=r?.ownPhotoPath||(Array.isArray(r?.sourcePhotoPaths)&&r.sourcePhotoPaths[0]);
 if(path){
  try{
   if(typeof weekCloud!=="undefined"&&weekCloud){
    const {data:{session}}=await weekCloud.auth.getSession();
    if(session){
     const {data,error}=await weekCloud.storage.from("mbd-cookbook-originals").createSignedUrl(path,180);
     if(!error&&data?.signedUrl){show(data.signedUrl);return}
    }
   }
  }catch(_){}
 }
 if(r?.mdb)show("/api/notion/photo?mdb="+encodeURIComponent(r.mdb));
}
function updateWeekVisual(row,value,select){
 const img=row.querySelector("[data-week-img]"),placeholder=row.querySelector("[data-week-emoji]"),title=row.querySelector("[data-week-title]");
 if(!img||!placeholder||!title)return;
 img.hidden=true;img.removeAttribute("src");placeholder.hidden=false;
 if(String(value||"").startsWith("p:")){
  placeholder.textContent="📦";title.textContent=select?.selectedOptions?.[0]?.textContent||"Maaltijdpakket";return;
 }
 const id=String(value||"").replace(/^r:/,"");
 const r=state.recipes.find(x=>String(x.id)===id||String(x.mdb||"")===id);
 placeholder.textContent=r?visualEmoji(r):"🍽️";
 title.textContent=r?(r.title||r.originalTitle||"Recept"):(select?.selectedOptions?.[0]?.textContent||"Nog geen recept gekozen");
 if(r)loadWeekImage(img,placeholder,r);
}
function decorateWeek(){
 const box=q("#weekPlanner");if(!box||typeof state==="undefined"||!Array.isArray(state.recipes))return;
 for(const row of box.querySelectorAll(".week-row")){
  const select=row.querySelector("select"),label=row.querySelector("b");if(!select||!label)continue;
  for(const opt of select.options){
   if(!String(opt.value).startsWith("r:"))continue;
   const id=String(opt.value).slice(2),r=state.recipes.find(x=>String(x.id)===id);
   if(r)opt.textContent=r.title||r.originalTitle||"Naamloos recept";
  }
  row.querySelectorAll(".mbd-week-preview").forEach(x=>x.remove());
  row.classList.add("mbd-week-row");
  let choice=row.querySelector(".mbd-week-choice");
  if(!choice){
   choice=document.createElement("div");choice.className="mbd-week-choice";
   const thumb=document.createElement("div");thumb.className="mbd-week-thumb";thumb.setAttribute("aria-hidden","true");
   const emoji=document.createElement("span");emoji.setAttribute("data-week-emoji","");
   const img=document.createElement("img");img.setAttribute("data-week-img","");img.hidden=true;img.alt="";
   thumb.append(emoji,img);
   const fields=document.createElement("div");fields.className="mbd-week-fields";
   const selectedTitle=document.createElement("div");selectedTitle.className="mbd-week-title";selectedTitle.setAttribute("data-week-title","");
   fields.append(select,selectedTitle);choice.append(thumb,fields);label.insertAdjacentElement("afterend",choice);
  }
  updateWeekVisual(row,select.value,select);
  if(select.dataset.mbdWeekVisualBound!=="1"){
   select.dataset.mbdWeekVisualBound="1";
   select.addEventListener("change",()=>setTimeout(()=>updateWeekVisual(row,select.value,select),0));
  }
 }
}
function installWeekPlanner(){
 const box=q("#weekPlanner");
 if(box&&box.dataset.mbdWeekDelegate!=="1"){
  box.dataset.mbdWeekDelegate="1";
  box.addEventListener("change",e=>{
   const changed=e.target?.closest?.("select");if(!changed)return;
   const aria=changed.getAttribute("aria-label")||"";
   const refresh=()=>{
    const currentBox=q("#weekPlanner");if(!currentBox)return;
    decorateWeek();
    const live=[...currentBox.querySelectorAll(".week-row select")].find(s=>(s.getAttribute("aria-label")||"")===aria);
    const row=live?.closest(".week-row");
    if(live&&row)updateWeekVisual(row,live.value,live);
   };
   [60,250,800].forEach(ms=>setTimeout(refresh,ms));
  },true);
 }
 if(typeof window.renderWeek!=="function"){decorateWeek();return}
 if(!window.renderWeek.__mbdVisualWeek){
  const baseRender=window.renderWeek;
  const enhanced=function(){
   const result=baseRender.apply(this,arguments);
   decorateWeek();
   if(typeof renderWeekArchive==="function")renderWeekArchive();
   return result;
  };
  enhanced.__mbdVisualWeek=true;
  window.renderWeek=enhanced;
 }
 decorateWeek();
}
function refreshWeekDay(day){
 const box=q("#weekPlanner");if(!box)return;
 decorateWeek();
 const aria=String(day||"")+" avondeten";
 const live=[...box.querySelectorAll(".week-row select")].find(s=>(s.getAttribute("aria-label")||"")===aria);
 const row=live?.closest(".week-row");
 if(live&&row)updateWeekVisual(row,live.value,live);
}
if(!window.__mbdWeekChoiceVisualEventV1){
 window.__mbdWeekChoiceVisualEventV1=true;
 document.addEventListener("mbd:week-choice",e=>{
  const day=e?.detail?.day||"";
  [0,80,300,900].forEach(ms=>setTimeout(()=>refreshWeekDay(day),ms));
 });
}

function addSaveAnother(){
 const msg=q("#importMessage");if(!msg||q("#mbd-save-another"))return;
 if(!/✓.*opgeslagen/i.test(msg.textContent||"")||/niet opgeslagen/i.test(msg.textContent||""))return;
 const b=document.createElement("button");b.id="mbd-save-another";b.type="button";b.className="secondary";b.textContent="➕ Nog een recept opslaan";
 b.style.marginTop="10px";
 b.onclick=()=>{
  try{currentDraft=null;selectedCollections?.clear?.()}catch(_){}
  const u=q("#sourceUrl"),t=q("#sourceText"),review=q("#reviewCard");
  if(u)u.value="";if(t)t.value="";if(review)review.classList.add("hidden");
  msg.classList.add("hidden");b.remove();
  if(typeof setScreen==="function")setScreen("inbox");
  window.scrollTo({top:0,behavior:"smooth"});setTimeout(()=>u?.focus(),350);
 };
 msg.insertAdjacentElement("afterend",b);
}
function installSaveAnother(){
 const msg=q("#importMessage");if(!msg)return;
 new MutationObserver(addSaveAnother).observe(msg,{childList:true,subtree:true,characterData:true,attributes:true});
 addSaveAnother();
}

const searchSynonyms=[
 ["rijst","rice"],["kip","chicken"],["aardappel","aardappelen","potato","potatoes"],["kaas","cheese"],["ui","onion"],["knoflook","garlic"],
 ["zalm","salmon"],["tonijn","tuna"],["gehakt","minced","ground beef","ground meat"],["courgette","zucchini"],["aubergine","eggplant"],
 ["paprika","bell pepper"],["wortel","carrot"],["bloemkool","cauliflower"],["kikkererwt","kikkererwten","chickpea","chickpeas"],["bonen","beans"],
 ["melk","milk"],["room","cream"],["boter","butter"],["ei","eieren","egg","eggs"],["bloem","flour"],["suiker","sugar"]
].map(g=>g.map(x=>String(x).toLocaleLowerCase("nl")));
const searchNorm=s=>String(s||"").toLocaleLowerCase("nl").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g," ").trim();
function searchVariants(t){const n=searchNorm(t);const group=searchSynonyms.find(g=>g.includes(n));return group||[n]}
function smartRecipeMatch(r,query){
 const words=searchNorm(query).split(/\s+/).filter(Boolean);if(!words.length)return true;
 const hay=searchNorm([r?.mdb,r?.title,r?.originalTitle,r?.category,r?.cuisine,r?.ingredients,r?.steps,r?.book,r?.bookPage,(r?.collections||[]).join(" ")].filter(Boolean).join(" "));
 return words.every(w=>searchVariants(w).some(v=>hay.includes(v)));
}
function installSmartSearch(){
 if(typeof window.renderRecipes!=="function"||window.renderRecipes.__mbdSmartSearch)return;
 const baseRender=window.renderRecipes;
 const enhanced=function(){
  const input=q("#recipeSearch"),term=input?.value||"";
  if(!input||!term)return baseRender.apply(this,arguments);
  input.value="";
  let result;
  try{result=baseRender.apply(this,arguments)}finally{input.value=term}
  const all=(typeof state!=="undefined"&&Array.isArray(state.recipes))?state.recipes:[];
  const byLocal=new Map(all.map(r=>[String(r?.id||""),r]));
  const byMdb=new Map(all.map(r=>[String(r?.mdb||"").toUpperCase(),r]));
  for(const card of document.querySelectorAll("#recipeList .recipe-card")){
   const local=card.querySelector("[data-view]")?.getAttribute("data-view")||"";
   const badge=String(card.querySelector(".mdb-badge")?.textContent||"").toUpperCase();
   const r=byLocal.get(String(local))||byMdb.get(badge);
   const ok=smartRecipeMatch(r,term);
   card.hidden=!ok;card.style.display=ok?"":"none";
  }
  return result;
 };
 enhanced.__mbdSmartSearch=true;window.renderRecipes=enhanced;
 try{enhanced()}catch(_){}
}
function sourceKind(url){
 try{const h=new URL(url).hostname.toLowerCase();if(h.includes("instagram"))return"Instagram";if(h.includes("tiktok"))return"TikTok";if(h.includes("facebook"))return"Facebook";if(h.includes("pinterest")||h==="pin.it")return"Pinterest";return"Website"}catch{return"Website"}
}
function showPhotoFallback(url,message){
 const msg=q("#importMessage");if(msg){msg.textContent=message;msg.className="message warn"}
 let a=q("#mbd-link-photo-fallback");
 if(!a){a=document.createElement("a");a.id="mbd-link-photo-fallback";a.className="secondary";a.style.cssText="display:block;text-align:center;text-decoration:none;margin-top:10px";a.textContent="📷 Voeg screenshot of foto toe";msg?.insertAdjacentElement("afterend",a)}
 a.href="/scan.html?sourceURL="+encodeURIComponent(url)+"&sourceKind="+encodeURIComponent(sourceKind(url));
}
function installAutoLinkImport(){
 const btn=q("#analyzeBtn");if(!btn||btn.dataset.mbdAutoLink==="1")return;btn.dataset.mbdAutoLink="1";
 btn.addEventListener("click",async e=>{
  const url=q("#sourceUrl")?.value.trim()||"",text=q("#sourceText")?.value.trim()||"";
  if(!url||text)return;
  e.preventDefault();e.stopImmediatePropagation();
  const msg=q("#importMessage");q("#mbd-link-photo-fallback")?.remove();
  if(msg){msg.textContent="⏳ Bronlink automatisch uitlezen…";msg.className="message ok"}
  btn.disabled=true;
  try{
   const r=await fetch("/api/recipes/source",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url})});
   const d=await r.json().catch(()=>({}));
   if(!r.ok)throw Error(d.message||"Link kon niet worden uitgelezen");
   const found=String(d.sharedText||d.text||"").trim();if(found.length<10)throw Error("Geen bruikbare recepttekst gevonden");
   q("#sourceText").value=found;
   if(typeof window.analyze==="function")await window.analyze();else if(typeof analyze==="function")await analyze();
  }catch(err){
   showPhotoFallback(url,(err?.message||"Link kon niet worden uitgelezen")+". De bronlink blijft bewaard als je via een screenshot of foto toevoegt.");
  }finally{btn.disabled=false}
 },true);
}

function css(){
 if(q("#mbd-ux-finishing-css"))return;
 const s=document.createElement("style");s.id="mbd-ux-finishing-css";s.textContent=`
 .mbd-week-row{grid-template-columns:1fr!important;gap:7px!important;margin:0 0 15px}
 .mbd-week-day{font-size:15px!important}.mbd-week-row>b{font-size:15px!important}
 .mbd-week-choice{display:grid;grid-template-columns:62px minmax(0,1fr);gap:10px;align-items:center}
 .mbd-week-thumb{width:62px;height:62px;border-radius:14px;background:#f4ece7;border:1px solid var(--line,#e8dfd8);display:flex;align-items:center;justify-content:center;overflow:hidden;font-size:30px}
 .mbd-week-thumb img{width:100%;height:100%;object-fit:cover}
 .mbd-week-fields{min-width:0}.mbd-week-fields select{width:100%;margin:0!important;font-size:15px}
 .mbd-week-title{margin-top:5px;font-size:13px;font-weight:700;color:#564e49;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
 #mbd-save-another{width:100%}
 `;document.head.appendChild(s);
}
function boot(){css();installSmartSearch();installWeekPlanner();installSaveAnother();installAutoLinkImport()}
document.addEventListener("DOMContentLoaded",()=>setTimeout(boot,0));
if(document.readyState!=="loading")setTimeout(boot,0);
setTimeout(boot,900);
})();