(()=>{
if(window.__mbdScanEnhanceV1)return;window.__mbdScanEnhanceV1=true;
const el=id=>document.getElementById(id);
if(!el("scan")||!el("photo")||!el("mode"))return;

const mode=el("mode"),photo=el("photo"),scan=el("scan"),statusBox=el("status");
const oldScan=scan.onclick;
let appendNext=false,lastMultiResults=null;

function files(){try{return Array.isArray(selected)?selected:[]}catch(_){return [...(photo.files||[])]}}
function setFiles(next){try{selected=next}catch(_){}}
function setStatus(t){statusBox.textContent=t}
function clearChoices(){document.getElementById("mbd-recognition-choices")?.remove()}
function makeChoices(title,items){
 clearChoices();
 const wrap=document.createElement("div");wrap.id="mbd-recognition-choices";wrap.style.cssText="margin-top:12px;padding:12px;border:1px solid #e5d8ce;border-radius:12px;background:#fbf7f3";
 const h=document.createElement("strong");h.textContent=title;wrap.append(h);
 const row=document.createElement("div");row.style.cssText="display:flex;flex-wrap:wrap;gap:8px;margin-top:9px";
 for(const item of items){const b=document.createElement("button");b.type="button";b.textContent=item.label;b.onclick=item.action;row.append(b)}
 wrap.append(row);statusBox.insertAdjacentElement("afterend",wrap);
}
function convert(file){return new Promise((resolve,reject)=>{
 const img=new Image(),url=URL.createObjectURL(file);
 img.onload=()=>{try{
  const scale=Math.min(1,1800/Math.max(img.width,img.height)),canvas=document.createElement("canvas");
  canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale));
  canvas.getContext("2d").drawImage(img,0,0,canvas.width,canvas.height);URL.revokeObjectURL(url);
  resolve(canvas.toDataURL("image/jpeg",.82));
 }catch(e){URL.revokeObjectURL(url);reject(e)}};
 img.onerror=()=>{URL.revokeObjectURL(url);reject(Error("Foto niet leesbaar"))};img.src=url;
})}
async function recognize(file,hint="auto"){
 const image=await convert(file);
 const r=await fetch("/api/recipes/recognize-photo",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({image,hint})});
 const d=await r.json().catch(()=>({error:"De herkenningsdienst gaf geen geldig antwoord."}));
 if(!r.ok)throw Error((d.error||"Herkenning mislukt")+" (HTTP "+r.status+")");
 return d;
}
function fill(d){
 if(d.bookPage)el("source").value=d.bookPage;if(d.book&&!el("author").value)el("author").value=d.book;
 el("title").value=d.title||"";
 el("ingredients").value=(d.ingredients||[]).join("\n");
 el("steps").value=(d.steps||[]).join("\n");
 el("method").value=["Airfryer","Oven","Pan","Koken"].includes(d.method)?d.method:"Overig";
 el("category").value=["Ontbijt","Lunch","Avondeten","Snack","Bijgerecht"].includes(d.category)?d.category:"Overig";
 el("mainIngredient").value=d.mainIngredient||"";el("ack").checked=false;
 el("kind").value=d.imageType==="food_photo"?"Eigen recept":d.imageType==="recipe_page"?"Kookboek":el("kind").value;
}
function uncertain(d){return d.confidence==="low"||d.imageType==="unclear"||(!d.title&&!(d.ingredients||[]).length&&!(d.steps||[]).length)}
async function one(file,hint="auto"){
 clearChoices();setStatus(hint==="auto"?"Foto wordt automatisch bekeken…":"Foto opnieuw analyseren…");
 const d=await recognize(file,hint);fill(d);
 if(!uncertain(d)){
  setStatus("Herkenning voltooid. "+(d.notes||"")+" Controleer de velden vóór opslaan.");return;
 }
 const opts=[];
 for(const name of (d.alternatives||[]).slice(0,3)){
  opts.push({label:"🍽️ "+name,action:()=>{el("title").value=name;el("kind").value="Eigen recept";clearChoices();setStatus("Gekozen: "+name+". Controleer de overige velden.")}});
 }
 opts.push(
  {label:"📖 Dit is een receptpagina",action:()=>one(file,"recipe_page").catch(e=>setStatus("Niet herkend: "+e.message))},
  {label:"🍽️ Dit is een gerechtfoto",action:()=>one(file,"food_photo").catch(e=>setStatus("Niet herkend: "+e.message))},
  {label:"📷 Andere foto kiezen",action:()=>{clearChoices();photo.value="";photo.click()}}
 );
 makeChoices("Ik weet niet zeker wat er op de foto staat. Kies wat het dichtst klopt:",opts);
 setStatus("De foto is deels uitgelezen, maar ik ben niet zeker genoeg. Kies hieronder één van de opties.");
}
function combine(results){
 const d={
  title:results.find(x=>x.title)?.title||"",
  ingredients:results.flatMap(x=>x.ingredients||[]),
  steps:results.flatMap(x=>x.steps||[]),
  method:results.find(x=>x.method&&x.method!=="Overig")?.method||"Overig",
  category:results.find(x=>x.category&&x.category!=="Overig")?.category||"Overig",
  mainIngredient:results.find(x=>x.mainIngredient)?.mainIngredient||"",
  bookPage:results.map(x=>x.bookPage).filter(Boolean).join(", "),
  book:results.find(x=>x.book)?.book||"",
  imageType:"recipe_page",
  confidence:results.some(x=>x.confidence==="low")?"low":"medium",
  notes:"Meerdere pagina’s samengevoegd."
 };
 fill(d);el("kind").value="Kookboek";clearChoices();
 setStatus("Ik heb de foto’s samengevoegd als één recept. Controleer de volgorde en dubbele regels.");
}
function showBatch(results){
 try{batch=results;activePhotoIndex=0}catch(_){}
 const box=el("batchlist");box.replaceChildren();el("batch").classList.remove("hide");
 results.forEach((d,i)=>{
  const wrap=document.createElement("div"),label=document.createElement("strong"),edit=document.createElement("button");
  label.textContent=(i+1)+". "+(d.title||"Niet herkend");edit.type="button";edit.textContent="Controleer dit recept";
  edit.onclick=()=>{try{activePhotoIndex=i}catch(_){}fill(d);el("kind").value=d.imageType==="food_photo"?"Eigen recept":"Kookboek";setStatus("Controleer titel, ingrediënten en bereiding voordat je opslaat.")};
  wrap.append(label,document.createElement("br"),edit);box.append(wrap);
 });
 clearChoices();setStatus("Ik heb meerdere recepten herkend. Controleer ze één voor één.");
}
async function autoScan(){
 const fs=files();if(!fs.length)return;
 scan.disabled=true;clearChoices();
 try{
  if(fs.length===1){await one(fs[0],"auto");return}
  const results=[];
  for(let i=0;i<fs.length;i++){setStatus("Foto "+(i+1)+" van "+fs.length+" automatisch bekijken…");results.push(await recognize(fs[i],"auto"))}
  lastMultiResults=results;
  const allPages=results.every(x=>x.imageType==="recipe_page"&&x.confidence!=="low");
  const clearTitles=[...new Set(results.map(x=>String(x.title||"").toLocaleLowerCase("nl").trim()).filter(Boolean))];
  if(allPages&&clearTitles.length<=1){combine(results);return}
  if(allPages&&clearTitles.length===results.length){showBatch(results);return}
  makeChoices("Ik heb de foto’s gelezen, maar weet niet zeker hoe ze bij elkaar horen:",[
   {label:"📖 Eén recept, meerdere pagina’s",action:()=>combine(lastMultiResults||results)},
   {label:"📚 Meerdere recepten",action:()=>showBatch(lastMultiResults||results)}
  ]);
  setStatus("Kies alleen nog hoe de foto’s bij elkaar horen; de inhoud is al uitgelezen.");
 }catch(e){
  setStatus("Niet goed genoeg herkend: "+e.message+" Er is niets opgeslagen.");
  makeChoices("Wat wil je proberen?",[
   {label:"📖 Als receptpagina lezen",action:()=>files()[0]&&one(files()[0],"recipe_page").catch(x=>setStatus(x.message))},
   {label:"🍽️ Als gerechtfoto lezen",action:()=>files()[0]&&one(files()[0],"food_photo").catch(x=>setStatus(x.message))},
   {label:"📷 Andere foto kiezen",action:()=>{photo.value="";photo.click()}}
  ]);
 }finally{scan.disabled=false}
}
function resetForAnother(){
 clearChoices();lastMultiResults=null;setFiles([]);photo.value="";el("preview").removeAttribute("src");el("preview").classList.add("hide");
 for(const id of ["title","ingredients","steps","mainIngredient","author","source","foodname"])if(el(id))el(id).value="";
 el("method").value="Overig";el("category").value="Overig";el("kind").value="Kookboek";el("ack").checked=false;
 el("batch").classList.add("hide");el("batchlist").replaceChildren();el("savestatus").textContent="";
 try{updatePhotos()}catch(_){el("photocount").textContent="Nog geen foto’s geselecteerd.";scan.disabled=true}
 window.scrollTo({top:0,behavior:"smooth"});setTimeout(()=>photo.click(),350);
}
function installSaveAnother(){
 const saveStatus=el("savestatus");if(!saveStatus)return;
 const show=()=>{
  const ok=/Veilig online opgeslagen als/i.test(saveStatus.textContent||"");
  const existing=el("saveAnother");
  if(existing){
   existing.onclick=resetForAnother;
   existing.classList.toggle("hide",!ok);
   el("mbd-scan-another")?.remove();
   return;
  }
  let b=el("mbd-scan-another");
  if(!ok){b?.remove();return}
  if(b)return;b=document.createElement("button");b.id="mbd-scan-another";b.type="button";b.textContent="➕ Nog een recept opslaan";b.onclick=resetForAnother;saveStatus.insertAdjacentElement("afterend",b);
 };
 new MutationObserver(show).observe(saveStatus,{childList:true,subtree:true,characterData:true});show();
}
function boot(){
 if(!mode.querySelector('option[value="auto"]')){const o=document.createElement("option");o.value="auto";o.textContent="✨ Automatisch herkennen (aanbevolen)";mode.prepend(o)}
 mode.value="auto";scan.textContent="✨ Foto automatisch uitlezen";
 const label=mode.closest("label");if(label?.firstChild?.nodeType===3)label.firstChild.nodeValue="Herkenning";
 if(!el("mbd-auto-hint")){const p=document.createElement("p");p.id="mbd-auto-hint";p.className="note";p.textContent="Je hoeft niet vooraf aan te geven wat er op de foto staat. De app probeert dit zelf te herkennen en geeft alleen keuzes als hij twijfelt.";mode.closest("label").insertAdjacentElement("afterend",p)}
 el("foodnamewrap")?.classList.add("hide");
 const oldChange=photo.onchange,oldAdd=el("addphoto").onclick;
 photo.onchange=e=>{
  if(mode.value!=="auto"){appendNext=false;return oldChange?.call(photo,e)}
  const next=[...(e.target.files||[])];if(!next.length)return;
  const merged=appendNext?[...files(),...next]:next;appendNext=false;setFiles(merged);
  try{updatePhotos()}catch(_){}
  setStatus(merged.length+" foto('s) klaar. Ik bepaal zelf wat erop staat.");
 };
 el("addphoto").onclick=()=>{if(mode.value!=="auto")return oldAdd?.call(el("addphoto"));appendNext=true;photo.value="";photo.click()};
 mode.addEventListener("change",()=>{if(mode.value==="auto"){el("foodnamewrap")?.classList.add("hide");el("addphoto").classList.toggle("hide",!files().length);scan.textContent="✨ Foto automatisch uitlezen"}else scan.textContent="Tekst herkennen"});
 scan.onclick=()=>mode.value==="auto"?autoScan():oldScan?.call(scan);
 installSaveAnother();
}
boot();
})();