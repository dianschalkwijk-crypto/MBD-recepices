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
function updateWeekVisual(row,id){
 const r=state.recipes.find(x=>String(x.id)===String(id));
 const img=row.querySelector("[data-week-img]"),placeholder=row.querySelector("[data-week-emoji]"),title=row.querySelector("[data-week-title]");
 img.hidden=true;img.removeAttribute("src");placeholder.hidden=false;
 placeholder.textContent=r?visualEmoji(r):"🍽️";
 title.textContent=r?(r.title||r.originalTitle||"Recept"):"Nog geen recept gekozen";
 if(r)loadWeekImage(img,placeholder,r);
}
function installWeekPlanner(){
 if(typeof window.renderWeek!=="function"||typeof state==="undefined"||!Array.isArray(state.recipes))return;
 if(window.renderWeek.__mbdVisualWeek)return;
 const enhanced=function(){
  const days=["Maandag","Dinsdag","Woensdag","Donderdag","Vrijdag"];
  const recipes=state.recipes.slice().sort((a,b)=>String(a.title||"").localeCompare(String(b.title||""),"nl"));
  const options=recipes.map(r=>`<option value="${esc(String(r.id))}">${esc(r.title||r.originalTitle||"Naamloos recept")}</option>`).join("");
  const box=q("#weekPlanner");if(!box)return;
  box.innerHTML=days.map(d=>`<div class="week-row mbd-week-row" data-week-row="${esc(d)}">
    <b class="mbd-week-day">${d}</b>
    <div class="mbd-week-choice">
      <div class="mbd-week-thumb" aria-hidden="true"><span data-week-emoji>🍽️</span><img data-week-img hidden alt=""></div>
      <div class="mbd-week-fields">
        <select data-day="${esc(d)}" aria-label="Recept voor ${esc(d)}"><option value="">Kies recept</option>${options}</select>
        <div class="mbd-week-title" data-week-title>Nog geen recept gekozen</div>
      </div>
    </div>
  </div>`).join("");
  box.querySelectorAll("select").forEach(s=>{
   const row=s.closest("[data-week-row]");
   s.value=state.week?.[s.dataset.day]||"";
   updateWeekVisual(row,s.value);
   s.onchange=()=>{
    if(s.value)state.week[s.dataset.day]=s.value;else delete state.week[s.dataset.day];
    persist();updateWeekVisual(row,s.value);
   };
  });
  if(typeof renderWeekArchive==="function")renderWeekArchive();
 };
 enhanced.__mbdVisualWeek=true;
 window.renderWeek=enhanced;
 if(q('[data-screen="week"].active'))enhanced();
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
 .mbd-week-day{font-size:15px!important}
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