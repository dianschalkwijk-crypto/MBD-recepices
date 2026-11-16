import {LIBRARY_KEY,DRAFT_KEY,fields,labels,httpURL,originalFields,recordSnapshot,normalizeRows,freshReview,qrState,qrLabels,stale,ready,matches,dashboard,validateReview} from './source-review-core.js';
import {openStore,readReviews,saveReview,exportStore} from './source-review-store.js';
const $=id=>document.getElementById(id);
const sourceNames={catalog:'Live Supabase-catalogus',local:'Lokale recepten in deze browser',drafts:'Lokale importconcepten in deze browser'};
const fieldNames={sourceURL:'sourceURL · bestaand bronveld',originalSourceURL:'originalSourceURL · bestaande oorspronkelijke URL',contentURL:'contentURL · inhoudsbron, niet automatisch gevalideerd',originalSourceRef:'originalSourceRef · bestaande verwijzing',sourceKind:'Bestaand brontype',sourceNotes:'Bestaande bronnotitie',sourcePlatform:'Bestaand bronplatform',platform:'Bestaand platform'};
let db,rows=[],reviews=new Map(),selected=null,current=null,dirty=false,revision=0,limit=40,dataset='catalog',decodeVersion=0,loading=false,busy=false,decoding=false,storageFailure='';
function message(text,error=false){$('message').textContent=text;$('message').className=error?'error':'notice';}
function node(tag,text,className){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(className)n.className=className;return n;}
function pair(dl,label,value){dl.append(node('dt',label),node('dd',value||''));}
function listOptions(id,options){for(const [value,label] of Object.entries(options)){const o=node('option',label);o.value=value;$(id).append(o);}}
for(const k of ['sourceStatus','testStatus','decision'])listOptions(k,labels[k]);
function readLocal(key){const data=JSON.parse(localStorage.getItem(key)||'null');return data;}
async function catalog(){
 const response=await fetch('/api/notion/catalog?sourceReview=1',{cache:'no-store',signal:AbortSignal.timeout(55000)});
 if(!response.ok)throw Error('Live catalogus niet gelezen (HTTP '+response.status+'). Geen oude lijst als actueel gebruikt.');
 const data=await response.json();if(!data.ok||data.source!=='public.mbd_catalog'||!Array.isArray(data.items))throw Error('Geen geldig antwoord van de live catalogus.');
 if(new Set(data.items.map(r=>r.mdb)).size!==data.items.length)throw Error('Dubbele tabelsleutels ontvangen; geen automatische samenvoeging.');
 return data.items;
}
function mayLeave(){return !busy&&(!dirty||confirm('Er zijn nog niet opgeslagen controlewijzigingen. Wil je die verlaten?'));}
async function load(){
 if(loading||busy)return;
 const choice=$('dataset').value;
 if(!mayLeave()){$('dataset').value=dataset;return;}
 loading=true;dataset=choice;selected=null;dirty=false;decodeVersion++;$('editor').hidden=true;rows=[];render();$('refresh').disabled=true;$('dataset').disabled=true;message('Gegevens worden alleen-lezen opgehaald…');
 try{
  let data;
  if(dataset==='catalog')data=await catalog();
  else if(dataset==='local'){const state=readLocal(LIBRARY_KEY);data=state===null?[]:state.recipes;if(!Array.isArray(data))throw Error('Lokale bibliotheek kan niet veilig worden gelezen.');}
  else{data=readLocal(DRAFT_KEY)||[];if(!Array.isArray(data))throw Error('Lokale conceptopslag is onleesbaar.');data=data.filter(r=>!r.ownerId&&!r.user_id&&!r.deletedAt&&!r.draft?._deleted);}
  rows=normalizeRows(data,dataset);reviews=db?await readReviews(db):new Map();
  $('source-info').textContent=`${sourceNames[dataset]} · ${rows.length} records · gelezen ${new Date().toLocaleString('nl-NL')}. ${rows.filter(r=>r.quarantined).length} in quarantaine. Gegevensbronnen zijn niet samengevoegd.`+(dataset==='drafts'?' Alleen niet-accountgebonden lokale concepten zijn zichtbaar. Accountconcepten blijven in de beveiligde accountworkflow.':'');
  message(storageFailure?'Gegevens gelezen, maar controleopslag is niet beschikbaar. Alleen lezen: '+storageFailure:'Gegevens gelezen. Open één recept om een controle vast te leggen.',!!storageFailure);
  $('round').value='';limit=40;render();
  const mdb=new URLSearchParams(location.search).get('mdb');if(mdb){const r=rows.find(r=>r.mdb===mdb);if(r)openEditor(r);}
 }catch(e){$('source-info').textContent='Geen actuele gegevens beschikbaar voor '+sourceNames[dataset]+'.';message(e.message,true);render();}
 finally{loading=false;$('refresh').disabled=false;$('dataset').disabled=false;}
}
function filters(){return {query:$('query').value,filter:$('filter').value,round:$('round').value};}
function filtered(){return rows.filter(row=>matches(row,reviews.get(row.key)||freshReview(),filters()));}
function render(){
 const stats=dashboard(rows,reviews),dash=$('dashboard');dash.replaceChildren();
 for(const [label,value] of [['Receptrecords in gegevensbron',stats.total],['Bron ontbreekt',stats.missingSources],['Exacte originele URL nog niet bevestigd',stats.missingExact],['QR’s te controleren',stats.qrPending],['Open bronbeslissingen',stats.openDecisions]]){const div=node('div',undefined,'metric');div.append(node('strong',String(value)),node('span',label));dash.append(div);}
 const rounds=$('rounds');rounds.replaceChildren(node('h2','Voortgang per herstelronde'));
 for(const [name,b] of Object.entries(stats.rounds))rounds.append(node('p',`${name}: ${b.ready} van ${b.total} klaar voor eindcontrole`));
 const roundValue=$('round').value;$('round').replaceChildren();listOptions('round',{'':'Alle herstelrondes'});
 for(const name of [...new Set(rows.map(r=>reviews.get(r.key)?.round).filter(Boolean))].sort()){const o=node('option',name);o.value=name;$('round').append(o);}$('round').value=roundValue;
 const items=filtered();$('selection-count').textContent=`${items.length} van ${rows.length} records in de selectie. Dashboard: de volledige gekozen gegevensbron.`;
 const list=$('list');list.replaceChildren();
 for(const row of items.slice(0,limit)){
  const review=reviews.get(row.key)||freshReview(),article=node('article',undefined,'recipe');article.append(node('span',row.mdb||'Zonder MDB · concept/lokaal','badge'),node('h2',row.title));
  if(row.quarantined)article.append(node('span','Quarantaine · geen samenvoeging','badge warn'));
  if(row.identityWarning)article.append(node('span','Afwijkend intern MDB-veld · tabelnummer behouden','badge warn'));
  article.append(node('span',labels.sourceStatus[review.sourceStatus]||'Nog te controleren','badge'),node('span',qrLabels[qrState(review)],'badge'));
  if(stale(row,review))article.append(node('span','Recept gewijzigd sinds controle · opnieuw controleren','badge warn'));
  if(ready(row,review))article.append(node('span','Klaar voor eindcontrole','badge'));
  const open=node('button','Controle openen');open.type='button';open.onclick=()=>{if(mayLeave())openEditor(row);};const actions=node('div');actions.append(open);article.append(actions);list.append(article);
 }
 if(!items.length)list.append(node('p','Geen recepten voor deze selectie.'));
 $('more').hidden=items.length<=limit;$('print-selection').disabled=!items.length;
}
function setDirty(){dirty=true;$('save-state').textContent='Nog niet opgeslagen.';}
function invalidateQR(){if(current?.qrEvidence){current.qrEvidence={...current.qrEvidence,destination:'',destinationNote:'',checkedAt:'',checkedURL:'',openedAt:''};}$('destination').value='';$('destination-note').value='';}
function openEditor(row,restore){
 selected=row;const saved=reviews.get(row.key);revision=saved?.revision||0;current=structuredClone(restore||saved||freshReview());current={...freshReview(),...current};decodeVersion++;decoding=false;dirty=!!restore;
 const wasStale=stale(row,current);if(wasStale){current.qrEvidence=null;current.qrReadError='';current.sourceStatus='';current.testStatus='';current.decision='';}
 $('editor').hidden=false;$('editor-title').textContent=(row.mdb||'Zonder MDB')+' · '+row.title;
 const warnings=[!row.stable?'Geen unieke vaste sleutel: opslaan geblokkeerd.':'',row.quarantined?'Dit is een quarantainerecord. Het blijft afzonderlijk bestaan.':'',row.identityWarning?'Het interne MDB-veld wijkt af van de tabelsleutel. Het bestaande tabelnummer wordt exact behouden.':'',wasStale?'De receptgegevens verschillen van de vorige controle. Bronstatus, QR-controle en testgoedkeuring zijn in dit formulier teruggezet; controleer opnieuw.':''].filter(Boolean);
 $('editor-warning').hidden=!warnings.length;$('editor-warning').textContent=warnings.join(' ');
 const original=$('original');original.replaceChildren();pair(original,'Bestaand MDB-nummer',row.mdb);pair(original,'Titel',row.title);for(const [k,v] of Object.entries(originalFields(row.recipe))){pair(original,fieldNames[k],String(v));if(httpURL(v)){const a=node('a',v);a.href=v;a.target='_blank';a.rel='noopener noreferrer';original.lastChild.replaceChildren(a);}}
 $('recipe-text').textContent='Ingrediënten\n'+String(row.recipe.ingredients||'')+'\n\nBereiding\n'+String(row.recipe.steps||row.recipe.instructions||'');
 for(const key of fields){const el=$(key==='round'?'round-field':key);el.value=current[key];}
 $('destination').value=current.qrEvidence?.destination||'';$('destination-note').value=current.qrEvidence?.destinationNote||'';$('qr-file').value='';
 $('save').disabled=!db||!row.stable;$('save-state').textContent=restore?'Uit back-up/vorige versie geladen; nog niet opgeslagen.':saved?'Opgeslagen op '+new Date(saved.updatedAt).toLocaleString('nl-NL')+' · versie '+revision:'Nog geen controle opgeslagen. Onbekende gegevens zijn leeg.';
 showQR();$('editor').scrollIntoView({behavior:'instant',block:'start'});
}
function gather(){for(const key of fields)current[key]=$(key==='round'?'round-field':key).value;return current;}
function showQR(){
 if(!current)return;
 const r={...current,qrTarget:$('qrTarget').value};$('qr-result').textContent=qrLabels[qrState(r)]+(current.qrEvidence?.decoded?' · QR-inhoud: '+current.qrEvidence.decoded:'');
 const box=$('qr-open');box.replaceChildren();const url=current.qrEvidence?.decoded;if(httpURL(url)){const a=node('a','Open gedecodeerde QR-bestemming');a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.onclick=()=>{current.qrEvidence.openedAt=new Date().toISOString();setDirty();};box.append(a);}
}
for(const key of fields){const el=$(key==='round'?'round-field':key);el.addEventListener('input',()=>{if(!current)return;if(['qrTarget','validatedSource','exactOriginalURL','replacementSource'].includes(key))invalidateQR();setDirty();if(key==='qrTarget')showQR();});}
for(const id of ['destination','destination-note'])$(id).oninput=()=>{if(current?.qrEvidence){current.qrEvidence={...current.qrEvidence,destination:'',checkedAt:'',checkedURL:''};showQR();}setDirty();};
$('qr-file').onchange=async()=>{
 const file=$('qr-file').files[0];if(!file||!selected)return;
 const version=++decodeVersion,row=selected;decoding=true;current.qrEvidence=null;current.qrReadError='';invalidateQR();setDirty();$('qr-result').textContent='QR wordt lokaal gedecodeerd…';$('save').disabled=true;
 try{
  if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>12*1024*1024)throw Error('Gebruik een PNG-, JPEG- of WebP-afbeelding van maximaal 12 MB.');
  const bytes=await file.arrayBuffer(),hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),x=>x.toString(16).padStart(2,'0')).join('');
  const image=await createImageBitmap(file);if(image.width*image.height>40000000){image.close();throw Error('Afbeelding is te groot. Gebruik een uitsnede van de QR.');}
  const scale=Math.min(1,3000/Math.max(image.width,image.height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.width*scale));canvas.height=Math.max(1,Math.round(image.height*scale));
  const context=canvas.getContext('2d',{willReadFrequently:true});context.drawImage(image,0,0,canvas.width,canvas.height);image.close();const pixels=context.getImageData(0,0,canvas.width,canvas.height);
  const result=window.jsQR(pixels.data,pixels.width,pixels.height,{inversionAttempts:'attemptBoth'});
  if(version!==decodeVersion||row!==selected)return;
  if(!result)throw Error('Geen decodeerbare QR gevonden. Gebruik een scherpe uitsnede met de volledige witte rand.');
  current.qrEvidence={decoded:result.data,imageHash:hash,decodedAt:new Date().toISOString(),recipeSnapshot:recordSnapshot(row),destination:'',destinationNote:'',checkedURL:'',checkedAt:''};
 }catch(e){if(version===decodeVersion&&row===selected){current.qrReadError=e.message;message(e.message,true);}}
 finally{if(version===decodeVersion&&row===selected){decoding=false;showQR();$('save').disabled=!db||!row.stable;}}
};
$('confirm-destination').onclick=()=>{
 if(!selected||!current)return;gather();const e=current.qrEvidence,destination=$('destination').value,note=$('destination-note').value.trim();
 if(!e||!httpURL(e.decoded)||e.decoded!==current.qrTarget){message('Scan eerst de QR-afbeelding. De gedecodeerde URL moet exact gelijk zijn aan de bewust ingevulde doel-URL.',true);return;}
 if(!e.openedAt){message('Open eerst de gedecodeerde QR-bestemming om de inhoud te vergelijken.',true);return;}
 if(!destination||!note){message('Kies de werkelijk waargenomen bestemming en beschrijf de inhoudelijke vergelijking.',true);return;}
 current.qrEvidence={...e,destination,destinationNote:note,checkedURL:e.decoded,checkedAt:new Date().toISOString()};setDirty();showQR();message('Bestemmingscontrole vastgelegd in het formulier. Sla de controle bij dit recept bewust op.');
};
$('review-form').onsubmit=async event=>{
 event.preventDefault();if(!db||!selected||busy||decoding)return;
 const row=selected;gather();const record=structuredClone(current);
 try{
  validateReview(row,record);
  if(stale(row,record)&&record.testStatus==='passed')throw Error('Het recept is gewijzigd sinds de controle. Scan de QR opnieuw en voer de broncontrole opnieuw uit.');
  record.key=row.key;record.dataset=dataset;record.mdb=row.mdb;record.title=row.title;record.recordSnapshot=recordSnapshot(row);
  busy=true;document.querySelectorAll('#review-form input,#review-form textarea,#review-form select,#review-form button').forEach(e=>e.disabled=true);$('close').disabled=true;$('dataset').disabled=true;$('refresh').disabled=true;
  const saved=await saveReview(db,record,revision);reviews=await readReviews(db);
  if(reviews.get(row.key)?.revision!==saved.revision)throw Error('Opslag is gewijzigd door een ander venster. Heropen het recept.');
  current=structuredClone(saved);revision=saved.revision;dirty=false;$('save-state').textContent='Opgeslagen en teruggelezen op dit apparaat · versie '+revision+'.';message('Controle opgeslagen. Recept, oorspronkelijke bronvelden en MDB-nummer zijn niet gewijzigd.');render();
 }catch(e){$('save-state').textContent='Niet opgeslagen: '+e.message;message(e.message,true);}
 finally{busy=false;document.querySelectorAll('#review-form input,#review-form textarea,#review-form select,#review-form button').forEach(e=>e.disabled=false);$('save').disabled=!db||!row.stable;$('close').disabled=false;$('dataset').disabled=false;$('refresh').disabled=false;}
};
function printRows(items){
 const area=$('print-area');area.replaceChildren(node('h1','MadeByDian · Bron- en QR-controlelijst'),node('p',sourceNames[dataset]+' · '+items.length+' records · '+new Date().toLocaleString('nl-NL')),node('p','Alleen opgeslagen controlebeslissingen. Lege velden zijn onbekend. Recepten, bronnen en nummers zijn niet gewijzigd.'));
 for(const row of items){const r=reviews.get(row.key)||freshReview(),section=node('section',undefined,'print-entry'),dl=document.createElement('dl');section.append(node('h2',(row.mdb||'Zonder MDB')+' · '+row.title));
  for(const [k,v] of Object.entries(originalFields(row.recipe)))pair(dl,fieldNames[k],String(v));
  for(const [label,value] of [['Gevalideerde bron',r.validatedSource],['Type bron',r.sourceType],['Exacte originele URL',r.exactOriginalURL],['Bewijs oorspronkelijke URL',r.originalEvidence],['Bronstatus',labels.sourceStatus[r.sourceStatus]],['Vervanging',r.replacementSource],['Broncontrole',r.sourceEvidence],['QR-doel',r.qrTarget],['Gedecodeerde QR',r.qrEvidence?.decoded],['QR-status',qrLabels[qrState(r)]],['Bestemmingswaarneming',r.qrEvidence?.destinationNote],['Teststatus',labels.testStatus[r.testStatus]],['Herstelronde',r.round],['Beslissing',labels.decision[r.decision]],['Notitie',r.note],['Openstaande controle',r.openCheck],['Volgende veilige stap',r.nextStep],['Sinds controle gewijzigd',stale(row,r)?'Ja':'']])pair(dl,label,value);section.append(dl);area.append(section);
 }area.hidden=false;window.print();
}
$('print-selection').onclick=()=>printRows(filtered());$('print-one').onclick=()=>{if(selected)printRows([selected]);};
$('export').onclick=async()=>{try{if(!db)throw Error('Controleopslag niet beschikbaar.');const data=await exportStore(db),blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=node('a');a.href=url;a.download='MadeByDian-broncontroles-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);message('Controleback-up gedownload, inclusief vorige opgeslagen versies. Bewaar dit bestand privé.');}catch(e){message(e.message,true);}};
$('restore-file').onchange=async()=>{
 try{const file=$('restore-file').files[0];if(!file)return;if(file.size>20*1024*1024)throw Error('Back-up is te groot (maximaal 20 MB).');const data=JSON.parse(await file.text());if(data.format!=='MadeByDian-source-reviews'||data.version!==1||!Array.isArray(data.reviews))throw Error('Dit is geen controleback-up. Receptenbestanden worden niet geïmporteerd.');
  const box=$('restore-list');box.replaceChildren(node('p',data.reviews.length+' controles in back-up. Selecteer één controle; nog niets wordt opgeslagen.'));
  for(const saved of data.reviews){if(typeof saved.key!=='string'||!saved.key.startsWith(dataset+':'))continue;const row=rows.find(r=>r.key===saved.key);if(!row)continue;const b=node('button',(row.mdb||'Zonder MDB')+' · '+row.title+' · controle uit back-up openen');b.type='button';b.onclick=()=>{if(mayLeave())try{const copy={...freshReview(),...saved};validateReview(row,copy);openEditor(row,copy);}catch(e){message('Controle uit back-up niet geopend: '+e.message,true);}};box.append(b);}
 }catch(e){message(e.message,true);}
};
$('history').onclick=async()=>{try{if(!selected||!db)return;const data=await exportStore(db),previous=data.history.filter(v=>v.key===selected.key).at(-1)?.previous;if(!previous){message('Er is nog geen vorige opgeslagen versie van deze controle.');return;}if(mayLeave())openEditor(selected,previous);}catch(e){message(e.message,true);}};
$('close').onclick=()=>{if(mayLeave()){selected=null;current=null;dirty=false;decodeVersion++;$('editor').hidden=true;}};
$('dataset').onchange=load;$('refresh').onclick=load;
for(const id of ['query','filter','round'])$(id).addEventListener('input',()=>{limit=40;render();});
$('more').onclick=()=>{limit+=40;render();};
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
window.addEventListener('focus',async()=>{if(db&&!busy){try{reviews=await readReviews(db);render();}catch(e){message('Controles niet opnieuw gelezen: '+e.message,true);}}});
try{db=await openStore();}catch(e){storageFailure=e.message;message(e.message+' Alleen lezen is mogelijk.',true);$('export').disabled=true;}
await load();
