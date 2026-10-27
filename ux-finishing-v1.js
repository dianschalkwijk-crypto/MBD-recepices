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
 const direct=r?.ownPhotoURL||r?.photoURL||r?.imageURL||r?.image||"";
 if(/^https?:|^data:image\//i.test(String(direct||""))){
  img.src=direct;img.hidden=false;placeholder.hidden=true;return;
 }
 const path=r?.ownPhotoPath||(Array.isArray(r?.sourcePhotoPaths)&&r.sourcePhotoPaths[0]);
 if(!path)return;
 try{
  if(typeof weekCloud==="undefined"||!weekCloud)return;
  const {data:{session}}=await weekCloud.auth.getSession();if(!session)return;
  const {data,error}=await weekCloud.storage.from("mbd-cookbook-originals").createSignedUrl(path,180);
  if(error||!data?.signedUrl)return;
  img.src=data.signedUrl;img.hidden=false;placeholder.hidden=true;
 }catch(_){}
}
function updateWeekVisual(row,value,select){
 const img=row.querySelector("[data-week-img]"),placeholder=row.querySelector("[data-week-emoji]"),title=row.querySelector("[data-week-title]");
 if(!img||!placeholder||!title)return;
 img.hidden=true;img.removeAttribute("src");placeholder.hidden=false;
 if(String(value||"").startsWith("p:")){
  placeholder.textContent="📦";title.textContent=select?.selectedOptions?.[0]?.textContent||"Maaltijdpakket";return;
 }
 const id=String(value||"").replace(/^r:/,"");
 const r=state.recipes.find(x=>String(x.id)===id);
 placeholder.textContent=r?visualEmoji(r):"🍽️";
 title.textContent=r?(r.title||r.originalTitle||"Recept"):"Nog geen recept gekozen";
 if(r)loadWeekImage(img,placeholder,r);
}
function decorateWeek(){
 const box=q("#weekPlanner");if(!box||typeof state==="undefined"||!Array.isArray(state.recipes))return;
 for(const row of box.querySelectorAll(".week-row")){
  if(row.dataset.mbdVisual==="1")continue;
  const select=row.querySelector("select"),label=row.querySelector("b");if(!select||!label)continue;
  for(const opt of select.options){
   if(!String(opt.value).startsWith("r:"))continue;
   const id=String(opt.value).slice(2),r=state.recipes.find(x=>String(x.id)===id);
   if(r)opt.textContent=r.title||r.originalTitle||"Naamloos recept";
  }
  row.dataset.mbdVisual="1";row.classList.add("mbd-week-row");
  const choice=document.createElement("div");choice.className="mbd-week-choice";
  const thumb=document.createElement("div");thumb.className="mbd-week-thumb";thumb.setAttribute("aria-hidden","true");
  const emoji=document.createElement("span");emoji.setAttribute("data-week-emoji","");
  const img=document.createElement("img");img.setAttribute("data-week-img","");img.hidden=true;img.alt="";
  thumb.append(emoji,img);
  const fields=document.createElement("div");fields.className="mbd-week-fields";
  const selectedTitle=document.createElement("div");selectedTitle.className="mbd-week-title";selectedTitle.setAttribute("data-week-title","");
  select.parentNode?.insertBefore(choice,select);
  fields.append(select,selectedTitle);choice.append(thumb,fields);
  label.insertAdjacentElement("afterend",choice);
  updateWeekVisual(row,select.value,select);
  select.addEventListener("change",()=>setTimeout(()=>updateWeekVisual(row,select.value,select),0));
 }
}
function installWeekPlanner(){
 if(typeof window.renderWeek!=="function")return;
 if(window.renderWeek.__mbdVisualWeek)return;
 const baseRender=window.renderWeek;
 const enhanced=function(){
  const result=baseRender.apply(this,arguments);
  decorateWeek();
  if(typeof renderWeekArchive==="function")renderWeekArchive();
  return result;
 };
 enhanced.__mbdVisualWeek=true;
 window.renderWeek=enhanced;
 decorateWeek();
}
function addSaveAnother(){
 const msg=q("#importMessage");if(!msg||q("#mbd-save-another"))return;
 if(!/^✓ Recept veilig online opgeslagen/i.test(msg.textContent||""))return;
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
function boot(){css();installWeekPlanner();installSaveAnother()}
document.addEventListener("DOMContentLoaded",()=>setTimeout(boot,0));
if(document.readyState!=="loading")setTimeout(boot,0);
setTimeout(boot,900);
})();