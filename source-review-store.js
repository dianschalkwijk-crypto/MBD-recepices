const DB='madebydian-source-reviews-v1';
export function openStore(){return new Promise((resolve,reject)=>{
 const request=indexedDB.open(DB,1);
 request.onupgradeneeded=()=>{request.result.createObjectStore('reviews',{keyPath:'key'});request.result.createObjectStore('history',{keyPath:'id',autoIncrement:true});};
 request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(Error('Controleopslag is niet beschikbaar: '+request.error.message));request.onblocked=()=>reject(Error('Sluit andere controlevensters en probeer opnieuw.'));
});}
export function readReviews(db){return new Promise((resolve,reject)=>{const r=db.transaction('reviews').objectStore('reviews').getAll();r.onsuccess=()=>resolve(new Map(r.result.map(v=>[v.key,v])));r.onerror=()=>reject(r.error);});}
export function saveReview(db,record,expectedRevision){return new Promise((resolve,reject)=>{
 const tx=db.transaction(['reviews','history'],'readwrite');let saved,reason;
 const store=tx.objectStore('reviews');const read=store.get(record.key);
 read.onsuccess=()=>{const previous=read.result;if((previous?.revision||0)!==expectedRevision){reason=Error('Dit recept is in een ander venster gewijzigd. Heropen het recept en controleer de laatste versie.');tx.abort();return;}
  if(previous)tx.objectStore('history').add({key:record.key,previous,archivedAt:new Date().toISOString()});
  saved={...record,revision:expectedRevision+1,updatedAt:new Date().toISOString()};store.put(saved);
 };
 tx.oncomplete=()=>resolve(saved);tx.onabort=()=>reject(reason||Error('Niet opgeslagen. De vorige controle is behouden.'));tx.onerror=()=>{reason=Error('Opslag mislukt: '+(tx.error?.message||'onbekende fout'));};
});}
export function exportStore(db){return new Promise((resolve,reject)=>{const tx=db.transaction(['reviews','history']);let reviews,history;const a=tx.objectStore('reviews').getAll(),b=tx.objectStore('history').getAll();a.onsuccess=()=>reviews=a.result;b.onsuccess=()=>history=b.result;tx.oncomplete=()=>resolve({format:'MadeByDian-source-reviews',version:1,exportedAt:new Date().toISOString(),reviews,history});tx.onerror=()=>reject(tx.error);});}
