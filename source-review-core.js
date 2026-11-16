// Review metadata is deliberately separate from recipe data. No recipe writes here.
export const LIBRARY_KEY='madebydian-recipes-filled-copy-v0.5';
export const DRAFT_KEY='mbd-recipe-import-drafts-v1';
export const fields=['validatedSource','sourceType','exactOriginalURL','originalEvidence','sourceStatus','replacementSource','sourceEvidence','qrTarget','testStatus','round','decision','note','openCheck','nextStep'];
export const labels={sourceStatus:{'':'Nog te controleren',verified:'Bron gecontroleerd',replaced:'Vervangende bron',restricted:'Afgeschermd',uncheckable:'Niet controleerbaar',missing:'Bron ontbreekt',broken:'Aantoonbaar kapot'},testStatus:{'':'Nog te testen',pending:'In uitvoering',failed:'Niet geslaagd',restricted:'Niet controleerbaar',passed:'Gecontroleerd'},decision:{'':'Nog te beslissen',investigate:'Verder onderzoeken',keep:'Bron behouden',replace:'Vervanging gebruiken',hold:'Aanhouden',ready:'Klaar voor eindcontrole'}};
export function httpURL(value){
 if(typeof value!=='string'||!/^https?:\/\//i.test(value)||/\s/.test(value))return false;
 try{const u=new URL(value);return !!u.hostname&&!u.username&&!u.password;}catch{return false;}
}
export function originalFields(recipe){return Object.fromEntries(['sourceURL','originalSourceURL','contentURL','originalSourceRef','sourceKind','sourceNotes','sourcePlatform','platform'].map(k=>[k,recipe?.[k]??'']));}
export function recordSnapshot(row){return JSON.stringify({mdb:row.mdb,title:row.title,original:originalFields(row.recipe),ingredients:row.recipe.ingredients??'',steps:row.recipe.steps??row.recipe.instructions??''});}
export function sourceExists(row,review={}){return ['sourceURL','originalSourceURL','contentURL','originalSourceRef'].some(k=>String(row.recipe[k]??'').trim())||['validatedSource','replacementSource','exactOriginalURL'].some(k=>String(review[k]??'').trim());}
export function normalizeRows(data,dataset){
 if(!Array.isArray(data))throw Error('Geen geldige receptenlijst ontvangen.');
 const rows=data.map(entry=>{const r=dataset==='catalog'?entry.recipe:dataset==='drafts'?entry.draft:entry;
  if(!r||typeof r!=='object'||Array.isArray(r))throw Error('Een receptrecord kan niet veilig worden gelezen.');
  const mdb=dataset==='catalog'?String(entry.mdb??''):String(r.mdb??'');
  const id=dataset==='catalog'?mdb:String(entry.id??r.id??mdb);
  return {key:dataset+':'+id,dataset,mdb,title:String(r.title??r.originalTitle??''),recipe:r,quarantined:r.syncStatus==='duplicate-quarantined',identityWarning:dataset==='catalog'&&!!r.mdb&&r.mdb!==mdb,stable:!!id};
 });
 const counts=new Map();for(const r of rows)counts.set(r.key,(counts.get(r.key)||0)+1);
 return rows.map((r,i)=>({...r,stable:r.stable&&counts.get(r.key)===1,viewId:String(i)}));
}
export function freshReview(){return Object.fromEntries(fields.map(k=>[k,'']));}
export function qrState(review){
 if(review.qrReadError)return 'unreadable';
 const value=review.qrEvidence?.decoded??'';
 if(!value)return review.qrTarget?'untested':'missing';
 if(/^MDB-\d+$/i.test(value.trim()))return 'placeholder';
 if(!httpURL(value))return 'not-url';
 if(!review.qrTarget||value!==review.qrTarget)return 'mismatch';
 const e=review.qrEvidence;
 if(e.destination==='restricted')return 'restricted';
 if(e.destination==='wrong')return 'wrong';
 return e.destination==='matched'&&e.checkedURL===value&&!!e.destinationNote&&!!e.checkedAt&&!!e.openedAt?'verified':'decoded';
}
export const qrLabels={unreadable:'Niet decodeerbaar',untested:'Nog niet gescand',missing:'QR ontbreekt',placeholder:'Placeholder op MDB-ID','not-url':'Geen doel-URL',mismatch:'QR wijkt af van doel-URL',restricted:'Bestemming afgeschermd',wrong:'Verkeerd recept',decoded:'Gedecodeerd; bestemming nog controleren',verified:'QR en receptbestemming gecontroleerd'};
export function stale(row,review){return !!review.recordSnapshot&&review.recordSnapshot!==recordSnapshot(row);}
export function ready(row,review){return !stale(row,review)&&!review.openCheck&&['verified','replaced'].includes(review.sourceStatus)&&review.testStatus==='passed'&&qrState(review)==='verified'&&review.decision==='ready';}
export function matches(row,review,filters={}){
 if(filters.query&&!`${row.mdb} ${row.title}`.toLocaleLowerCase('nl').includes(filters.query.toLocaleLowerCase('nl')))return false;
 if(filters.round&&review.round!==filters.round)return false;
 const f=filters.filter;
 return !f||(f==='no-exact'&&!review.exactOriginalURL)||(f==='source-pending'&&(!['verified','replaced'].includes(review.sourceStatus)||stale(row,review)))||(f==='replaced'&&(review.sourceStatus==='replaced'||!!review.replacementSource))||(f==='qr-pending'&&(qrState(review)!=='verified'||stale(row,review)))||(f==='untested'&&(review.testStatus!=='passed'||stale(row,review)))||(f==='ready'&&ready(row,review))||(f==='missing-source'&&!sourceExists(row,review));
}
export function dashboard(rows,reviews){
 const result={total:rows.length,missingSources:0,missingExact:0,qrPending:0,openDecisions:0,rounds:{}};
 for(const row of rows){const r=reviews.get(row.key)||freshReview();if(!sourceExists(row,r))result.missingSources++;if(!r.exactOriginalURL)result.missingExact++;if(qrState(r)!=='verified'||stale(row,r))result.qrPending++;if(!r.decision||r.openCheck||stale(row,r)||!['verified','replaced'].includes(r.sourceStatus)||['investigate','hold'].includes(r.decision))result.openDecisions++;
  const round=r.round||'Nog geen herstelronde';const bucket=result.rounds[round]??={total:0,ready:0};bucket.total++;if(ready(row,r))bucket.ready++;
 }return result;
}
export function validateReview(row,review){
 if(!row.stable)throw Error('Dit record heeft geen unieke vaste sleutel. Opslaan is geblokkeerd om verwisseling te voorkomen.');
 for(const k of fields)if(typeof review[k]!=='string'||review[k].length>12000)throw Error('Ongeldige of te lange controle-invoer.');
 for(const k of ['sourceStatus','testStatus','decision'])if(!Object.hasOwn(labels[k],review[k]))throw Error('Onbekende controlestatus.');
 for(const k of ['exactOriginalURL','replacementSource','qrTarget'])if(review[k]&&!httpURL(review[k]))throw Error('Gebruik een volledige http(s)-URL zonder inloggegevens bij '+k+'.');
 if(review.exactOriginalURL&&!review.originalEvidence.trim())throw Error('Leg vast waaruit blijkt dat dit de exacte oorspronkelijke URL is.');
 if(review.sourceStatus==='verified'&&(!review.validatedSource.trim()||!review.sourceEvidence.trim()))throw Error('Vul de gecontroleerde bron en de inhoudelijke controle toe.');
 if(review.sourceStatus==='replaced'&&(!review.replacementSource||!review.sourceEvidence.trim()))throw Error('Een vervanging vereist een aparte vervangende URL en een onderbouwde beslissing.');
 if(review.sourceStatus==='broken'&&!review.sourceEvidence.trim())throw Error('Leg bewijs vast voordat je een bron als kapot markeert.');
 if(review.testStatus==='passed'&&(!['verified','replaced'].includes(review.sourceStatus)||qrState(review)!=='verified'||review.qrEvidence?.recipeSnapshot!==recordSnapshot(row)))throw Error('Geslaagd vereist een gecontroleerde bron én een gedecodeerde QR met inhoudelijk bevestigde receptbestemming bij deze receptversie.');
 if(review.decision==='ready'&&!ready(row,{...review,recordSnapshot:recordSnapshot(row)}))throw Error('Eindcontrole vereist een geslaagde test, gecontroleerde bron en QR en geen openstaande controle.');
 return review;
}
