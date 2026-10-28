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
 const img=row.querySelector("[data-week-img]"),placeholder=row.querySelector("[data-week-emoji]"),title=row.querySelector("[data-week-title]"),meta=row.querySelector("[data-week-mdb]");
 if(!img||!placeholder||!title)return;
 img.hidden=true;img.removeAttribute("src");placeholder.hidden=false;
 if(String(value||"").startsWith("p:")){
  placeholder.textContent="📦";title.textContent=select?.selectedOptions?.[0]?.textContent||"Maaltijdpakket";if(meta)meta.textContent="Maaltijdpakket";return;
 }
 const id=String(value||"").replace(/^r:/,"");
 const r=state.recipes.find(x=>String(x.id)===id||String(x.mdb||"")===id);
 placeholder.textContent=r?visualEmoji(r):"🍽️";
 title.textContent=r?(r.title||r.originalTitle||"Recept"):"Kies een recept";
 if(meta)meta.textContent=r?.mdb||"";
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
   const selectedMdb=document.createElement("div");selectedMdb.className="mbd-week-mdb";selectedMdb.setAttribute("data-week-mdb","");
   fields.append(selectedTitle,selectedMdb,select);choice.append(thumb,fields);label.insertAdjacentElement("afterend",choice);
  }
  updateWeekVisual(row,select.value,select);
  if(select.dataset.mbdWeekVisualBound!=="1"){
   select.dataset.mbdWeekVisualBound="1";
   select.addEventListener("change",()=>setTimeout(()=>updateWeekVisual(row,select.value,select),0));
  }
 }
}
function installWeekSearch(){
 const planner=q("#weekPlanner");if(!planner||typeof state==="undefined"||!Array.isArray(state.recipes))return;
 let wrap=q("#mbd-week-search");
 if(!wrap){
  wrap=document.createElement("section");wrap.id="mbd-week-search";wrap.className="mbd-week-search";
  const input=document.createElement("input");input.id="mbd-week-search-input";input.type="search";input.placeholder="Zoek recept voor je weekmenu…";input.autocomplete="off";
  const hint=document.createElement("div");hint.className="mbd-week-search-hint";hint.textContent="Zoek op receptnaam, MDB-nummer of ingrediënt. Kies daarna direct een dag.";
  const results=document.createElement("div");results.id="mbd-week-search-results";
  wrap.append(input,hint,results);planner.insertAdjacentElement("beforebegin",wrap);
  input.addEventListener("input",()=>renderWeekSearchResults());
 }
 renderWeekSearchResults();
}
function renderWeekSearchResults(){
 const input=q("#mbd-week-search-input"),host=q("#mbd-week-search-results"),planner=q("#weekPlanner");
 if(!input||!host||!planner||typeof state==="undefined")return;
 const term=searchNorm(input.value||"");host.replaceChildren();
 if(term.length<2)return;
 const words=term.split(/\s+/).filter(Boolean);
 const allowed=new Set();
 for(const opt of planner.querySelectorAll("select option")){
  const v=String(opt.value||"");if(v.startsWith("r:"))allowed.add(v.slice(2));
 }
 const matches=state.recipes.filter(r=>{
  if(!allowed.has(String(r.id)))return false;
  const hay=searchNorm([r.mdb,r.title,r.originalTitle,r.category,r.ingredients].filter(Boolean).join(" "));
  return words.every(w=>searchVariants(w).some(v=>hay.includes(v)));
 }).slice(0,20);
 const info=document.createElement("div");info.className="mbd-week-search-count";info.textContent=matches.length?matches.length+" passende recepten"+(matches.length===20?" (eerste 20)":""):"Geen passende recepten binnen je huidige allergie-/eetvoorkeurfilter.";host.append(info);
 const days=["Maandag","Dinsdag","Woensdag","Donderdag","Vrijdag"];
 for(const r of matches){
  const row=document.createElement("div");row.className="mbd-week-search-result";
  const meta=document.createElement("div");meta.className="mbd-week-search-result-meta";
  const title=document.createElement("strong");title.textContent=r.title||r.originalTitle||"Recept";
  const code=document.createElement("small");code.textContent=r.mdb||"";meta.append(title,code);
  const actions=document.createElement("div");actions.className="mbd-week-search-days";
  for(const day of days){
   const b=document.createElement("button");b.type="button";b.textContent=day.slice(0,2);b.title="Kies voor "+day;
   b.onclick=()=>{
    const select=[...planner.querySelectorAll("select")].find(s=>(s.getAttribute("aria-label")||"")===day+" avondeten");
    if(!select)return;
    const value="r:"+r.id;if(![...select.options].some(o=>o.value===value))return;
    select.value=value;select.dispatchEvent(new Event("change",{bubbles:true}));
    input.value="";host.replaceChildren();
   };
   actions.append(b);
  }
  row.append(meta,actions);host.append(row);
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
   installWeekSearch();
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
 ["rijst","rice"],["kip","chicken"],["aardappel","aardappels","aardappelen","potato","potatoes"],["kaas","cheese"],["ui","uien","onion","onions"],["knoflook","garlic"],
 ["zalm","salmon"],["tonijn","tuna"],["gehakt","minced","ground beef","ground meat"],["courgette","courgettes","zucchini","zucchinis"],["aubergine","aubergines","eggplant","eggplants"],
 ["paprika","bell pepper"],["wortel","wortels","carrot","carrots"],["bloemkool","cauliflower"],["kikkererwt","kikkererwten","chickpea","chickpeas"],["boon","bonen","bean","beans"],
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
function showPhotoFallback(url,message,author=""){
 const msg=q("#importMessage");if(msg){msg.textContent=message;msg.className="message warn"}
 q("#mbd-link-photo-fallback")?.remove();
 const box=document.createElement("div");box.id="mbd-link-photo-fallback";box.style.cssText="display:grid;gap:8px;margin-top:10px";
 const photo=document.createElement("a");photo.className="secondary";photo.style.cssText="display:block;text-align:center;text-decoration:none";photo.textContent="📷 Screenshot of foto toevoegen";
 photo.href="/scan.html?sourceURL="+encodeURIComponent(url)+"&sourceKind="+encodeURIComponent(sourceKind(url))+(author?"&sourceAuthor="+encodeURIComponent(author):"");
 const paste=document.createElement("button");paste.type="button";paste.className="secondary";paste.textContent="📋 Recepttekst/caption plakken";paste.onclick=()=>q("#sourceText")?.focus();
 const manual=document.createElement("a");manual.className="secondary";manual.style.cssText="display:block;text-align:center;text-decoration:none";manual.textContent="✍️ Handmatig vanaf foto invoeren";
 manual.href="/scan.html?sourceURL="+encodeURIComponent(url)+"&sourceKind="+encodeURIComponent(sourceKind(url))+"&manual=1";
 box.append(photo,paste,manual);msg?.insertAdjacentElement("afterend",box);
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
   const draft=(typeof currentDraft!=="undefined")?currentDraft:null;
   if(draft&&(draft.completeness==="onvoldoende"||!draft.ingredients?.length||!draft.steps?.length)){
    showPhotoFallback(url,"De link bevatte niet genoeg receptinformatie. De bronlink blijft bewaard; voeg een screenshot of foto toe zodat de app die kan uitlezen.",String(d.author||d.sourceAuthor||""));
   }
  }catch(err){
   showPhotoFallback(url,"Deze link kon niet volledig worden uitgelezen. De bronlink blijft bewaard; voeg een screenshot of foto toe zodat de app die kan uitlezen.");
  }finally{btn.disabled=false}
 },true);
}

function css(){
 if(q("#mbd-ux-finishing-css"))return;
 const s=document.createElement("style");s.id="mbd-ux-finishing-css";s.textContent=`
 .mbd-week-row{grid-template-columns:1fr!important;gap:7px!important;margin:0 0 15px}
 .mbd-week-day{font-size:15px!important}.mbd-week-row>b{font-size:15px!important}
 .mbd-week-choice{position:relative;display:grid;grid-template-columns:82px minmax(0,1fr);gap:12px;align-items:center;padding:10px;border:1px solid var(--line,#e8dfd8);border-radius:16px;background:#fff;min-height:82px;cursor:pointer}
 .mbd-week-thumb{width:82px;height:82px;border-radius:14px;background:#f4ece7;border:1px solid var(--line,#e8dfd8);display:flex;align-items:center;justify-content:center;overflow:hidden;font-size:32px}
 .mbd-week-thumb img{width:100%;height:100%;object-fit:cover}
 .mbd-week-fields{min-width:0}
 .mbd-week-fields select{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer;z-index:3;margin:0!important}
 .mbd-week-title{font-size:16px;line-height:1.3;font-weight:750;color:#3f3935;white-space:normal;overflow:visible;text-overflow:clip}
 .mbd-week-mdb{margin-top:6px;font-size:11px;color:#8a817b;font-weight:650;letter-spacing:.02em}
 .mbd-week-search{margin:0 0 12px;padding:10px;border:1px solid var(--line,#e8dfd8);border-radius:14px;background:#fbf7f3}
 .mbd-week-search input{margin:0!important}
 .mbd-week-search-hint,.mbd-week-search-count{font-size:12px;color:#756e69;margin-top:6px}
 .mbd-week-search-result{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:center;padding:9px 0;border-top:1px solid #eee4de}
 .mbd-week-search-result-meta{min-width:0}.mbd-week-search-result-meta strong{display:block;font-size:14px}.mbd-week-search-result-meta small{display:block;color:#8a817b;margin-top:2px}
 .mbd-week-search-days{display:flex;gap:4px}.mbd-week-search-days button{border:1px solid #ded3cb;background:#fff;border-radius:8px;padding:6px 7px;font-size:11px;font-weight:700}
 #mbd-save-another{width:100%}
 `;document.head.appendChild(s);
}
function boot(){css();installWeekPlanner();installWeekSearch();installSaveAnother();installAutoLinkImport()}
document.addEventListener("DOMContentLoaded",()=>setTimeout(boot,0));
if(document.readyState!=="loading")setTimeout(boot,0);
setTimeout(boot,900);
})();