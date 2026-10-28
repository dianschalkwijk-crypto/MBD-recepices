(()=>{
if(window.__mbdPhotoFixV10)return;window.__mbdPhotoFixV10=true;
const $=s=>document.querySelector(s),idOf=s=>(String(s||"").match(/MDB-[0-9]{4,}/i)||[])[0]?.toUpperCase()||"";
const categories=["Gezin","Airfryer","Borrel","Zomer","Seizoens","Lunch","Camping 1pans","Mealprep","Easy oven","Ontbijt","Vegetarisch","Aziatisch","Little Kids","Salades","Protein","Wraps","Toetjes","BBQ","Diepvries","Pasta","Overig"];
const selected=new Set();let timer,allTerms=true;
function recipes(){try{return typeof state!=="undefined"&&Array.isArray(state.recipes)?state.recipes:[]}catch(e){return []}}
const norm=s=>String(s??"").toLocaleLowerCase("nl").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g," ").trim();
const synonymGroups=[
 ["rijst","rice"],["kip","chicken"],["aardappel","aardappelen","potato","potatoes"],["kaas","cheese"],["ui","onion"],["knoflook","garlic"],
 ["zalm","salmon"],["tonijn","tuna"],["gehakt","minced","ground beef","ground meat"],["courgette","zucchini"],["aubergine","eggplant"],
 ["paprika","bell pepper","pepper"],["wortel","carrot"],["bloemkool","cauliflower"],["kikkererwt","kikkererwten","chickpea","chickpeas"],
 ["bonen","beans"],["melk","milk"],["room","cream"],["boter","butter"],["ei","eieren","egg","eggs"],["bloem","flour"],["suiker","sugar"]
].map(g=>g.map(norm));
function variants(t){const n=norm(t);const g=synonymGroups.find(x=>x.includes(n));return g||[n]}
function hasTerm(hay,t){return variants(t).some(v=>hay.includes(v))}
function ingredientText(r){const v=r?.ingredients;if(Array.isArray(v))return v.map(x=>typeof x==="string"?x:JSON.stringify(x||"")).join("\n");if(v&&typeof v==="object")return JSON.stringify(v);return String(v||"")}
function searchableText(r){return [r?.mdb,r?.title,r?.originalTitle,r?.category,r?.cuisine,r?.book,r?.bookPage,ingredientText(r),r?.steps,(r?.collections||[]).join(" ")].filter(Boolean).join(" ")}
function terms(){return ($("#mbd-ingredients")?.value||"").split(/[,;\n]+/).map(norm).filter(Boolean)}
function setup(){
const list=$("#recipeList"),search=$("#recipeSearch");if(!list||!search||$("#mbd-search-tools"))return;
const bar=document.createElement("section");bar.id="mbd-search-tools";bar.style.cssText="margin:12px 0;padding:12px;border:1px solid #e8dfd8;border-radius:14px;background:#fbf7f3";
const counter=document.createElement("div");counter.id="mbd-result-count";counter.setAttribute("aria-live","polite");counter.style.cssText="font-weight:750;margin-bottom:10px";
const label=document.createElement("label");label.textContent="Koken met wat ik heb";label.htmlFor="mbd-ingredients";label.style.cssText="display:block;font-weight:650;margin-bottom:6px";
const input=document.createElement("input");input.id="mbd-ingredients";input.placeholder="Bijv. kip, broccoli, rijst";input.style.cssText="width:100%;padding:11px;border:1px solid #e8dfd8;border-radius:10px;background:white";
const hint=document.createElement("div");hint.textContent="Scheid ingrediënten met een komma";hint.style.cssText="font-size:12px;color:#756e69;margin:5px 0";
const mode=document.createElement("label");mode.style.cssText="display:flex;align-items:center;gap:7px;font-size:13px;margin:8px 0";const check=document.createElement("input");check.type="checkbox";check.checked=true;mode.append(check,document.createTextNode("Alle ingrediënten moeten voorkomen"));check.onchange=()=>{allTerms=check.checked;update()};
const toggle=document.createElement("button");toggle.type="button";toggle.textContent="Categorieën kiezen ▾";toggle.style.cssText="padding:8px 12px;border-radius:10px;border:1px solid #e8dfd8;background:white;margin-bottom:8px";
const chips=document.createElement("div");chips.hidden=true;chips.style.cssText="display:none;flex-wrap:wrap;gap:6px";
toggle.onclick=()=>{chips.hidden=!chips.hidden;chips.style.display=chips.hidden?"none":"flex"};
for(const cat of categories){const b=document.createElement("button");b.type="button";b.textContent=cat;b.setAttribute("aria-pressed","false");b.style.cssText="padding:7px 10px;border:1px solid #e8dfd8;border-radius:20px;background:white;font-size:12px";b.onclick=()=>{selected.has(cat)?selected.delete(cat):selected.add(cat);b.setAttribute("aria-pressed",String(selected.has(cat)));b.style.background=selected.has(cat)?"#f4e5df":"white";update()};chips.append(b)}
bar.append(counter,label,input,hint,mode,toggle,chips);list.before(bar);
input.addEventListener("input",()=>{
 if(search.value){
  search.value="";
  search.dispatchEvent(new Event("input",{bubbles:true}));
 }
 clearTimeout(window.__mbdPantryRenderTimer);
 window.__mbdPantryRenderTimer=setTimeout(()=>{
  try{renderRecipes()}catch(_){}
  requestAnimationFrame(update);
 },35);
});
search.addEventListener("input",()=>setTimeout(update,0));
}
function update(){
const list=$("#recipeList"),counter=$("#mbd-result-count");if(!list||!counter)return;
const all=recipes(),byId=new Map(all.map(r=>[String(r.mdb||"").toUpperCase(),r])),byLocalId=new Map(all.map(r=>[String(r.id||""),r])),words=terms();
const q=words.length?"":norm($("#recipeSearch")?.value||""),queryWords=q.split(/\s+/).filter(Boolean);
const cards=[...list.querySelectorAll(".recipe-card")];
for(const card of cards){const localId=card.querySelector("[data-view]")?.getAttribute("data-view")||"";const r=byLocalId.get(String(localId))||byId.get(idOf(card.querySelector(".mdb-badge")?.textContent));const cats=[...(r?.collections||[]),r?.category||""].map(norm);const categoryOk=!selected.size||[...selected].some(c=>cats.includes(norm(c)));
const hay=norm(ingredientText(r));const ingredientsOk=!words.length||(allTerms?words.every(w=>hasTerm(hay,w)):words.some(w=>hasTerm(hay,w)));
const fullHay=norm(searchableText(r));const queryOk=!queryWords.length||queryWords.every(w=>hasTerm(fullHay,w));
const ok=categoryOk&&ingredientsOk&&queryOk; if(card.hidden!==!ok)card.hidden=!ok;const display=ok?"":"none";if(card.style.display!==display)card.style.display=display}
const count=cards.filter(c=>!c.hidden).length;
const query=words.length?words.join(" + "):q;const msg=count+" "+(count===1?"gerecht gevonden":"gerechten gevonden")+(query?" met "+query:"")+(selected.size?" · "+[...selected].join(", "):"");
if(counter.textContent!==msg)counter.textContent=msg;
}
function photos(){
for(const card of document.querySelectorAll(".recipe-card")){const localId=card.querySelector("[data-view]")?.getAttribute("data-view")||"";const r=recipes().find(x=>String(x.id||"")===String(localId));const id=String(r?.mdb||idOf(card.querySelector(".mdb-badge")?.textContent)||"").toUpperCase();if(!id||card.querySelector(".mbd-recipe-thumb"))continue;
const img=document.createElement("img");img.className="mbd-recipe-thumb";img.dataset.mdb=id;img.alt="Receptfoto";img.loading="lazy";img.style.cssText="width:84px;height:84px;object-fit:cover;border-radius:14px;margin:8px 12px 8px 0;float:left;background:#f5f1ed;border:1px solid #e8dfd8";
img.onerror=()=>{img.style.display="none";img.dataset.loadError="1"};img.src="/api/notion/photo?mdb="+encodeURIComponent(id)+"&v=11";
const title=card.querySelector(".recipe-title");title?title.before(img):card.prepend(img)}
const modal=$(".recipe-modal"),node=$("#modalRecipeMdb"),title=$("#modalRecipeTitle");if(!modal||!node||!title)return;const id=idOf(node.textContent);if(!id)return;
let img=modal.querySelector("#mbd-detail-photo");if(img&&img.dataset.mdb===id)return;if(img)img.remove();
img=document.createElement("img");img.id="mbd-detail-photo";img.dataset.mdb=id;img.alt="Receptfoto";img.style.cssText="width:100%;max-height:360px;object-fit:cover;border-radius:16px;margin:12px 0 16px;display:block;background:#f5f1ed;border:1px solid #e8dfd8";img.onerror=()=>{img.style.display="none";img.dataset.loadError="1"};img.src="/api/notion/photo?mdb="+encodeURIComponent(id)+"&v=11";title.after(img)}
function run(){setup();photos();update()}
new MutationObserver(m=>{if(m.every(x=>x.target.closest?.("#mbd-search-tools")))return;clearTimeout(timer);timer=setTimeout(run,100)}).observe(document.body,{childList:true,subtree:true});
document.addEventListener("DOMContentLoaded",run);run();
})();
;(()=>{
if(window.__mbdPinterestImport)return;window.__mbdPinterestImport=true;
const norm=s=>String(s||"").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g," ").trim();
const url=s=>/instagram\.com|pinterest\.|pin\.it|tiktok\.com|youtube\.com/i.test(s||"")?String(s).split("?")[0].replace(/\/$/,"").toLowerCase():"";
async function run(){
try{
const response=await fetch("/pinterest-books-23-29.json",{cache:"no-store"});if(!response.ok)throw Error("Bestand ontbreekt");
const data=await response.json();if(!Array.isArray(data.recipes))throw Error("Ongeldig bestand");
if(typeof state==="undefined"||!Array.isArray(state.recipes))return;
const knownUrls=new Set(state.recipes.map(r=>url(r.sourceURL)).filter(Boolean));
const knownTitles=new Set(state.recipes.map(r=>norm(r.title||r.originalTitle)).filter(x=>x.length>18));
const knownSlots=new Set(state.recipes.filter(r=>Number(r.bookNo)>=23&&Number(r.bookNo)<=29).map(r=>r.bookNo+":"+r.order));
const ids=new Set(state.recipes.map(r=>String(r.mdb||r.id).toUpperCase()));
let next=Math.max(353,...[...ids].map(x=>Number((x.match(/MDB-(\d+)/)||[])[1]||0)))+1,added=0,duplicates=0;
for(const r of data.recipes){
const slot=r.book+":"+r.number,u=url(r.sourceURL),title=norm(r.title);
if(knownSlots.has(slot)||(u&&knownUrls.has(u))||(!u&&title.length>18&&knownTitles.has(title))){duplicates++;continue}
while(ids.has("MDB-"+String(next).padStart(4,"0"))||next===182)next++;
const mdb="MDB-"+String(next++).padStart(4,"0"),full=String(r.originalText||"").trim();
state.recipes.push({id:mdb,mdb,title:r.title||"Pinterest recept "+r.number,originalTitle:r.title||"",book:"Pinterest · Kookboek "+r.book,bookNo:r.book,order:r.number,category:"Overig",collections:["Pinterest"],ingredients:r.ingredients||full,preparation:r.preparation||full,method:r.preparation||full,sourceText:full,sourceURL:r.sourceURL||"",contentSynced:true,warnings:[],notionURL:""});
ids.add(mdb);knownSlots.add(slot);if(u)knownUrls.add(u);if(title)knownTitles.add(title);added++;
}
if(added){persist();renderRecipes()}
const host=document.querySelector("#recipeList");if(host){let status=document.querySelector("#mbd-pinterest-status");if(!status){status=document.createElement("div");status.id="mbd-pinterest-status";status.style.cssText="padding:8px 0;font-size:12px;color:#65564f";host.before(status)}status.textContent="Pinterest kookboeken 23–29: "+added+" toegevoegd, "+duplicates+" al aanwezig of dubbel. Bewaard op dit apparaat."}
}catch(e){console.error("Pinterest import",e)}
}
document.addEventListener("DOMContentLoaded",run);if(document.readyState!=="loading")run();
})();
;(()=>{if(window.__mbdOriginTags)return;window.__mbdOriginTags=true;
function tag(){if(typeof state==="undefined"||!Array.isArray(state.recipes))return;
for(const r of state.recipes){const s=[r.sourceURL,r.sourceAuthor,r.platform,r.book,r.sourceText].filter(Boolean).join(" ").toLowerCase();const c=Array.isArray(r.collections)?r.collections:(r.collections=[]);
if(/instagram\.com|instagram|insta\b/.test(s)){if(!c.includes("Instagram"))c.push("Instagram");if(!c.includes("Insta"))c.push("Insta")}
if(/pinterest\.|pin\.it|pinterest/.test(s)&&!c.includes("Pinterest"))c.push("Pinterest");
if(/tiktok\.com|tiktok/.test(s)&&!c.includes("TikTok"))c.push("TikTok");
}}
document.addEventListener("input",e=>{if(e.target?.id==="recipeSearch")tag()},true);
document.addEventListener("DOMContentLoaded",()=>{tag();setTimeout(()=>{tag();if(typeof renderRecipes==="function")renderRecipes()},600)});
if(document.readyState!=="loading"){tag();setTimeout(tag,600)}
})();
;(()=>{if(window.__mbdCountFix)return;window.__mbdCountFix=true;
function update(){if(typeof state==="undefined"||!Array.isArray(state.recipes))return;
const count=state.recipes.length;
for(const el of document.querySelectorAll(".library-note"))el.innerHTML="<b>📚 Receptenbibliotheek · "+count+" recepten</b><p class=\"muted\">Actuele collectie uit je lokale en online bibliotheek. Ingrediënten, bereidingsstappen, bron- en Notion-links blijven bij het recept.</p>"
const status=document.querySelector("#mbd-pinterest-status");if(status)status.textContent="Totaal "+count+" recepten in deze browser · Pinterest kookboeken 23–29 inbegrepen waar nog niet aanwezig.";
}
document.addEventListener("DOMContentLoaded",()=>{setTimeout(update,900);setTimeout(update,2500)});if(document.readyState!=="loading")setTimeout(update,900);
})();

;(()=>{if(window.__mbdAutoImportV1)return;window.__mbdAutoImportV1=true;
const normalize=u=>String(u||"").split("?")[0].replace(/\/$/,"");
async function importRecipe(url,r){
const s=await fetch("/api/recipes/source",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url})});const d=await s.json();if(!s.ok)throw Error(d.message||"Link niet uitleesbaar");
const response=await fetch("/api/recipes/import",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sourceURL:url,sharedText:d.text,sourceAuthor:d.author})});let x;try{x=await response.json()}catch{};if(!response.ok||!x){
const lines=d.text.split("\n").map(v=>v.trim()).filter(Boolean);const ing=[],steps=[];let mode="";
for(const line of lines){if(/^ingredients?\s*:?$/i.test(line)){mode="ing";continue}if(/^(directions?|instructions?|method|bereiding)\s*:?$/i.test(line)){mode="steps";continue}if(mode==="ing"&&/^[-•]/.test(line))ing.push({amount:null,unit:null,ingredient:line.replace(/^[-•]\s*/,""),note:null});if(mode==="steps"&&/^\d+[.)]/.test(line))steps.push(line.replace(/^\d+[.)]\s*/,"").replace(/425\s*°?F/gi,"220 °C"))}
x={title_nl:(lines[0]||"Instagram recept").replace(/[🍗🍕]/g,"").trim(),ingredients:ing,steps,source_author:d.author,warnings:["Automatisch uit originele caption gehaald; controleer ontbrekende hoeveelheden"],source_completeness:"partial"};}

const ingredients=(x.ingredients||[]).map(i=>[i.amount==null?"":i.amount,i.unit||"",i.ingredient||""].filter(Boolean).join(" ")).join("\n");
const steps=(x.steps||[]).map((v,i)=>(i+1)+". "+v).join("\n");if(!ingredients&&!steps)throw Error("Geen receptinhoud gevonden");
if(r){r.title=x.title_nl||r.title;r.originalTitle=r.title;r.ingredients=ingredients||r.ingredients;r.steps=steps||r.steps;r.preparation=steps||r.preparation;r.method=steps||r.method;r.sourceText=d.text;r.sourceURL=url;r.author=x.source_author||d.author||r.author;r.contentSynced=true;r.warnings=x.warnings||[];if(x.servings_text)r.portions=x.servings_text;if(x.prep_minutes||x.cook_minutes)r.time=((x.prep_minutes||0)+(x.cook_minutes||0))+" min";persist();renderRecipes();return r.title}
document.querySelector("#sourceText").value=d.text;await analyze();return x.title_nl||"Recept"}
function install(){const input=document.querySelector("#sourceUrl");if(input&&!document.querySelector("#mbd-auto-link")){const b=document.createElement("button");b.id="mbd-auto-link";b.type="button";b.textContent="✨ Recept automatisch uit link halen";b.onclick=async()=>{b.disabled=true;b.textContent="Bezig met uitlezen…";try{const name=await importRecipe(input.value.trim(),null);alert("Recept uitgelezen: "+name+". Controleer en sla op.")}catch(e){alert(e.message+"; voeg zo nodig de video of caption toe.")}finally{b.disabled=false;b.textContent="✨ Recept automatisch uit link halen"}};input.parentNode.appendChild(b)}
const box=document.querySelector("#recipeList");if(!box)return;for(const card of box.querySelectorAll(".recipe-card")){const id=card.querySelector("[data-view]")?.getAttribute("data-view");const r=state.recipes.find(x=>String(x.id)===id);if(!r?.sourceURL||card.querySelector("[data-mbd-auto]"))continue;if(r.contentSynced&&!/uitwerken|nog aanvullen/i.test(r.title||""))continue;const actions=card.querySelector(".recipe-actions");if(!actions)continue;const b=document.createElement("button");b.textContent="✨ Recept uitwerken";b.setAttribute("data-mbd-auto",id);b.onclick=async()=>{b.disabled=true;b.textContent="Bezig…";try{alert("Bijgewerkt: "+await importRecipe(r.sourceURL,r))}catch(e){alert(e.message)}finally{b.disabled=false}};actions.prepend(b)}}
document.addEventListener("DOMContentLoaded",()=>{install();new MutationObserver(()=>{clearTimeout(window.__mbdAutoTimer);window.__mbdAutoTimer=setTimeout(install,120)}).observe(document.body,{childList:true,subtree:true})});if(document.readyState!=="loading")install();
})();

;(()=>{if(window.__mbdExtrasV1)return;window.__mbdExtrasV1=true;
const escX=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const key="mbd-extra-settings-v1",get=()=>{try{return JSON.parse(localStorage.getItem(key))||{}}catch{return {}}},put=x=>localStorage.setItem(key,JSON.stringify(x));
const patterns=[/soep|bouillon|bisque/i,/wrap|taco|burrito|quesadilla/i,/restjes|tosti|brood|omelet|ei |diepvries|gyoza/i,/oven|gratin|schotel|lasagne/i,/kip|zalm|pizza|pesto|burger|broccoli|rijst/i];
function chooseWeek(){const saved=get(),used=new Set(),last=new Set(saved.lastWeek||[]),next={};const all=state.recipes.filter(r=>r.title&&r.ingredients&&!/nog uitwerken|nog aanvullen/i.test(r.title));let pasta=0;
['Maandag','Dinsdag','Woensdag','Donderdag','Vrijdag'].forEach((day,i)=>{let candidates=all.filter(r=>patterns[i].test(r.title+" "+(r.collections||[]).join(" ")));if(!candidates.length)candidates=all.filter(r=>i!==0||/soep/i.test(r.title));candidates=candidates.filter(r=>!used.has(r.id)&&(!/pasta|orzo/i.test(r.title)||pasta===0));candidates.sort((a,b)=>Number(last.has(a.id))-Number(last.has(b.id))||((a.title||"").localeCompare(b.title||"")));if(candidates.length){const seed=Math.floor(Date.now()/604800000),r=candidates[(seed+i*7)%candidates.length];next[day]=r.id;used.add(r.id);if(/pasta|orzo/i.test(r.title))pasta++}});state.week=next;persist();put({...saved,lastWeek:Object.values(next)});renderWeek();makeShopping();alert("Weekmenu gemaakt. Controleer de gerechten en boodschappenlijst.");}
function addSection(){if(document.getElementById("mbd-extras"))return;const host=document.querySelector('[data-screen="recipes"]')||document.querySelector("#recipeList")?.parentNode;if(!host)return;const wrap=document.createElement("div");wrap.id="mbd-extras";wrap.className="card";wrap.style="margin:16px 0;padding:16px";wrap.innerHTML='<h2>MadeByDian extra functies</h2><div style="display:flex;flex-wrap:wrap;gap:8px"><button id="mbd-open-batch">📥 Socials in bulk</button><button id="mbd-open-products">🛒 Mijn producten</button><button id="mbd-open-community">👥 Recepten van anderen</button></div><div id="mbd-extra-panel" style="margin-top:12px"></div>';host.prepend(wrap);wrap.querySelector("#mbd-open-batch").onclick=batchPanel;wrap.querySelector("#mbd-open-products").onclick=productPanel;wrap.querySelector("#mbd-open-community").onclick=communityPanel;}
function panel(html){document.querySelector("#mbd-extra-panel").innerHTML=html;return document.querySelector("#mbd-extra-panel")}
function urls(text){return [...new Set((text.match(/https?:\/\/[^\s"'<>]+/g)||[]).map(s=>s.replace(/[),.;]+$/,"")))].filter(u=>/instagram\.com|pinterest\.|pin\.it|tiktok\.com|facebook\.com/i.test(u))}
function batchPanel(){const p=panel('<h3>Socialmedia-recepten importeren</h3><p>Upload een export met links (.txt, .csv, .json of .html) of plak meerdere links. Je beoordeelt de recepten vóór het opslaan.</p><input id="mbd-batch-file" type="file" accept=".txt,.csv,.json,.html" multiple><textarea id="mbd-batch-text" rows="4" placeholder="Plak Instagram-, Pinterest- of TikTok-links, één per regel" style="width:100%;margin-top:8px"></textarea><button id="mbd-batch-read">Links verzamelen</button><div id="mbd-batch-list"></div>');p.querySelector("#mbd-batch-read").onclick=async()=>{let text=p.querySelector("#mbd-batch-text").value;for(const f of p.querySelector("#mbd-batch-file").files){text+="\n"+await f.text()}const links=urls(text);const box=p.querySelector("#mbd-batch-list");box.innerHTML="<p>"+links.length+" links gevonden</p>"+links.map((u,i)=>'<label style="display:block;padding:7px"><input type="checkbox" checked data-url="'+escX(u)+'"> <a target="_blank" rel="noopener" href="'+escX(u)+'">Link '+(i+1)+'</a></label>').join("")+'<button id="mbd-batch-queue">Geselecteerde links verwerken</button><p id="mbd-batch-status"></p>';box.querySelector("#mbd-batch-queue").onclick=async()=>{const chosen=[...box.querySelectorAll("[data-url]:checked")].map(x=>x.dataset.url);const status=box.querySelector("#mbd-batch-status");for(let i=0;i<chosen.length;i++){const url=chosen[i];status.textContent=(i+1)+"/"+chosen.length+" wordt gelezen";if(state.recipes.some(r=>r.sourceURL?.split("?")[0]===url.split("?")[0]))continue;try{const response=await fetch("/api/recipes/source",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url})});const data=await response.json();if(!response.ok)throw Error(data.message);const name=(data.text||"").split("\n")[0].slice(0,100);const ok=confirm("Recept toevoegen als concept?\n"+name+"\n"+url);if(ok){state.recipes.unshift({id:crypto.randomUUID(),mdb:"",title:name||"Socialmedia-recept",sourceURL:url,ingredients:"",steps:"",author:data.author||"",sourceText:data.text,collections:["Overig"],contentSynced:false,createdAt:new Date().toISOString()});persist()}}catch(e){status.textContent="Niet gelezen: "+url+" — "+e.message}}renderRecipes();status.textContent="Klaar. Open de conceptrecepten en tik op Recept uitwerken."}}}
function productPanel(){const d=get();const p=panel('<h3>Mijn vaste producten</h3><p>Voeg merk, voedingswaarden en productlink toe. Vergelijking gebeurt alleen met controleerbare gegevens.</p><input id="mbd-prod-name" placeholder="Productnaam / merk" style="width:100%"><input id="mbd-prod-url" placeholder="Link naar product" style="width:100%"><input id="mbd-prod-image" placeholder="Link naar productfoto" style="width:100%"><textarea id="mbd-prod-nutrition" placeholder="Voedingswaarden per 100 g (suiker, eiwit, vezels, zout, verzadigd vet)" style="width:100%" rows="3"></textarea><button id="mbd-prod-save">Product bewaren</button><div id="mbd-products-list"></div>');const draw=()=>{p.querySelector("#mbd-products-list").innerHTML=(get().products||[]).map((x,i)=>'<div style="border-top:1px solid #ddd;padding:10px 0">'+(x.image?'<img alt="" src="'+escX(x.image)+'" style="width:65px;max-height:65px;object-fit:contain">':"")+'<b>'+escX(x.name)+'</b> '+(x.url?'<a href="'+escX(x.url)+'" target="_blank">Bron</a>':"")+'<p>'+escX(x.nutrition)+'</p><button data-remove-product="'+i+'">Verwijder</button></div>').join("");p.querySelectorAll("[data-remove-product]").forEach(b=>b.onclick=()=>{const d=get();d.products.splice(+b.dataset.removeProduct,1);put(d);draw()})};p.querySelector("#mbd-prod-save").onclick=()=>{const name=p.querySelector("#mbd-prod-name").value.trim();if(!name)return alert("Vul een productnaam in");const d=get();d.products=d.products||[];d.products.push({name,url:p.querySelector("#mbd-prod-url").value,image:p.querySelector("#mbd-prod-image").value,nutrition:p.querySelector("#mbd-prod-nutrition").value});put(d);productPanel()};draw()}
function communityPanel(){const p=panel('<h3>Recepten van anderen</h3><p>Je kunt hier een receptenexport van iemand anders bekijken zonder je eigen MDB-recepten te veranderen. Automatisch delen tussen accounts vereist nog beveiligde accounts en toestemming.</p><input id="mbd-friend-file" type="file" accept=".json"><div id="mbd-friend-list"></div>');p.querySelector("#mbd-friend-file").onchange=async e=>{try{const data=JSON.parse(await e.target.files[0].text());const recipes=Array.isArray(data)?data:data.recipes;if(!Array.isArray(recipes))throw Error("Geen receptenlijst");const box=p.querySelector("#mbd-friend-list");box.innerHTML=recipes.slice(0,500).map((r,i)=>'<div style="border-bottom:1px solid #ddd;padding:8px"><b>'+escX(r.title)+'</b><button data-friend="'+i+'">Toevoegen</button></div>').join("");box.querySelectorAll("[data-friend]").forEach(b=>b.onclick=()=>{const r=recipes[+b.dataset.friend];if(!confirm("Dit recept aan Mijn recepten toevoegen?"))return;if(state.recipes.some(x=>r.sourceURL&&x.sourceURL===r.sourceURL))return alert("Bron bestaat al");state.recipes.unshift({...r,id:crypto.randomUUID(),mdb:"",seeded:false});persist();renderRecipes();b.disabled=true;b.textContent="Toegevoegd"})}catch(err){alert("Kan bestand niet lezen: "+err.message)}}}
function extras(){addSection();const planner=document.querySelector("#weekPlanner");if(planner&&!document.querySelector("#mbd-week-auto")){const b=document.createElement("button");b.id="mbd-week-auto";b.textContent="✨ Maak mijn weekmenu";b.onclick=chooseWeek;planner.parentNode.insertBefore(b,planner)}const modal=document.querySelector("#modalRecipeBody");if(modal&&!modal.querySelector("#mbd-modal-extract")){const code=document.querySelector("#modalRecipeMdb")?.textContent;const r=state.recipes.find(x=>x.mdb===code?.split(" · ")[0]);if(r?.sourceURL&&(!r.contentSynced||/nog uitwerken/i.test(r.title||""))){const b=document.createElement("button");b.id="mbd-modal-extract";b.textContent="✨ Recept uitwerken";b.style="margin:10px 0";b.onclick=async()=>{b.disabled=true;b.textContent="Recept wordt uitgelezen…";try{const s=await fetch("/api/recipes/source",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url:r.sourceURL})});const d=await s.json();if(!s.ok)throw Error(d.message);const lines=d.text.split("\n").map(x=>x.trim());let section="",ings=[],steps=[];for(const line of lines){if(/^ingredients/i.test(line)){section="i";continue}if(/^directions|^instructions/i.test(line)){section="s";continue}if(section==="i"&&/^[-•]/.test(line))ings.push(line.replace(/^[-•]\s*/,""));if(section==="s"&&/^\d+[.)]/.test(line))steps.push(line.replace(/^\d+[.)]\s*/,"").replace(/425°F/g,"220 °C"))}if(!ings.length&&!steps.length)throw Error("Geen ingrediënten of stappen in caption");r.title=lines[0].replace(/[🍗🍕]/g,"").trim();r.ingredients=ings.join("\n");r.steps=steps.map((x,i)=>(i+1)+". "+x).join("\n");r.preparation=r.steps;r.author=d.author;r.contentSynced=true;persist();renderRecipes();showRecipeDetails(r.id)}catch(e){alert(e.message)}finally{b.disabled=false}};modal.prepend(b)}}}
document.addEventListener("DOMContentLoaded",()=>{extras();new MutationObserver(()=>{clearTimeout(window.__mbdExtrasTimer);window.__mbdExtrasTimer=setTimeout(extras,200)}).observe(document.body,{childList:true,subtree:true})});if(document.readyState!=="loading")extras();
})();