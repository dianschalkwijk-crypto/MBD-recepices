(()=>{'use strict';
if(window.__mbdIncompleteReview)return;window.__mbdIncompleteReview=true;
const KEY='mbd-incomplete-review-v1';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch{return {}}};
let decisions=load(),position=0;
const incomplete=()=>state.recipes.filter(r=>(!String(r.ingredients||'').trim()||!String(r.steps||'').trim())&&decisions[r.mdb||r.id]?.status!=='approved');
const save=()=>{localStorage.setItem(KEY,JSON.stringify(decisions));};
const key=r=>r.mdb||r.id;
function draw(){
 const root=document.getElementById('mbdIncompleteReview');if(!root)return;
 if(window.MBDRecipeReview){const scope=state.recipes.filter(r=>r.reviewAudit?.run==='2026-11-24'),c=MBDRecipeReview.counts(scope);let panel=document.getElementById('mbdControlCounter');if(!panel){panel=document.createElement('section');panel.id='mbdControlCounter';panel.className='card';root.before(panel)}panel.innerHTML='<h3>Actuele receptencontrole</h3><p>Catalogus: '+(window.MBDCatalogTotal||state.recipes.length)+' · actief op dit apparaat: '+state.recipes.length+' · controlewerkset: '+scope.length+'</p><dl>'+[['Volledig gecontroleerd',c.fully],['Onvolledig / controle open',c.incomplete],['Ontbrekende bron',c.missingSource],['Verkeerde bron afgezonderd',c.wrongSource],['Ontbrekende / ongecontroleerde afbeelding',c.missingImage],['Nog niet volledig met Notion gesynchroniseerd',c.notSynced],['Nog goed te keuren',c.awaitingApproval]].map(([k,v])=>'<dt>'+k+'</dt><dd>'+v+'</dd>').join('')+'</dl><p>Controlepunten kunnen overlappen. Een schatting of lokale beslissing geldt niet automatisch als volledige bron- en beeldgoedkeuring.</p>'}

 const all=state.recipes.filter(r=>!String(r.ingredients||'').trim()||!String(r.steps||'').trim());
 const list=incomplete();position=Math.max(0,Math.min(position,list.length-1));
 const approved=all.length-list.length;
 if(!list.length){root.innerHTML='<h3>Onvolledige recepten controleren</h3><p>Alle '+all.length+' recepten zijn beoordeeld of aangevuld.</p><button type="button" id="mbdReviewRefresh">Opnieuw controleren</button>';root.querySelector('#mbdReviewRefresh').onclick=draw;return;}
 const r=list[position],id=key(r),decision=decisions[id]||{};
 root.innerHTML='<h3>Onvolledige recepten controleren</h3><p class="muted">'+approved+' akkoord of aangevuld · '+list.length+' nog te beoordelen</p><p><b>'+(position+1)+' van '+list.length+'</b> · '+esc(id)+' · '+esc(r.title||r.originalTitle||'Naamloos')+'</p><p class="muted">Ontbreekt: '+(!String(r.ingredients||'').trim()?'ingrediënten ':'')+(!String(r.steps||'').trim()?'bereiding':'')+'</p><label>Ingrediënten<textarea id="mbdReviewIngredients" rows="5" style="width:100%;display:block">'+esc(r.ingredients||'')+'</textarea></label><label>Bereiding<textarea id="mbdReviewSteps" rows="5" style="width:100%;display:block">'+esc(r.steps||'')+'</textarea></label><p class="muted">Wijzigingen worden alleen op dit apparaat opgeslagen. Maak eerst een back-up. Bron en MBD-nummer blijven gelijk.</p><div style="display:flex;gap:6px;flex-wrap:wrap"><button type="button" id="mbdReviewApprove">Akkoord zoals het is</button><button type="button" id="mbdReviewEdit">Aanpassing opslaan</button><button type="button" id="mbdReviewLater">Later</button><button type="button" id="mbdReviewPrevious">Vorige</button></div>';
 root.querySelector('#mbdReviewApprove').onclick=()=>{decisions[id]={status:'approved',at:new Date().toISOString()};save();draw();};
 root.querySelector('#mbdReviewEdit').onclick=()=>{
  const ingredients=root.querySelector('#mbdReviewIngredients').value.trim(),steps=root.querySelector('#mbdReviewSteps').value.trim();
  const beforeI=r.ingredients,beforeS=r.steps;r.ingredients=ingredients;r.steps=steps;
  try{persist();decisions[id]={status:ingredients&&steps?'completed':'needs-review',at:new Date().toISOString()};save();if(typeof renderRecipes==='function')renderRecipes();draw();}
  catch(e){r.ingredients=beforeI;r.steps=beforeS;alert('Opslaan mislukt: '+e.message)}
 };
 root.querySelector('#mbdReviewLater').onclick=()=>{decisions[id]={status:'later',at:new Date().toISOString()};save();position=(position+1)%list.length;draw();};
 root.querySelector('#mbdReviewPrevious').onclick=()=>{position=(position-1+list.length)%list.length;draw();};
}
function init(){
 const screen=document.querySelector('[data-screen="settings"]');if(!screen)return;
 const div=document.createElement('section');div.id='mbdIncompleteReview';div.className='card';div.style.margin='16px 0';screen.querySelector('#mbdAudit')?.after(div)||screen.prepend(div);
 draw();window.addEventListener('mbd:recipes-rendered',draw);document.addEventListener('visibilitychange',()=>{if(!document.hidden)draw()});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();