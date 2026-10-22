(()=>{
if(window.__mbdAccountBackupV1)return;window.__mbdAccountBackupV1=true;
const LIB='madebydian-recipes-filled-copy-v0.5',PREFS=['mbd_allergy_prefs_v1','mbd_dislikes_v1','mbd_recipe_ratings_history_v1'];
const $=s=>document.querySelector(s);let client=null;
function msg(t){const e=$('#mbdCloudStatus');if(e)e.textContent=t}
async function auth(){
 if(!window.supabase)await new Promise((ok,no)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';s.onload=ok;s.onerror=no;document.head.append(s)});
 if(!client)client=window.supabase.createClient('https://ywsdubincfabjhvjqkot.supabase.co','sb_publishable_sIPgFRcpRiszmq8vuWLkAg_K-C0gzfF');
 const {data:{user},error}=await client.auth.getUser();if(error||!user){msg('Log eerst in via Account in dezelfde browser.');return null}return user
}
function makeBackup(){
 const storage={};for(const k of [LIB,...PREFS]){const v=localStorage.getItem(k);if(v!==null)storage[k]=v}
 return {schema:'mbd-account-backup-v1',createdAt:new Date().toISOString(),storage}
}
async function upload(){
 const user=await auth();if(!user)return;
 const backup=makeBackup(),count=(JSON.parse(backup.storage[LIB]||'{}').recipes||[]).length;
 if(!count){msg('Geen lokale recepten gevonden. Er is niets naar je account verstuurd.');return}
 if(!confirm('Sla een privékopie van '+count+' recepten en je lokale voorkeuren/beoordelingen op in je account? Een bestaande accountkopie wordt hiermee vervangen.'))return;
 msg('Privéaccountkopie opslaan…');
 const {error}=await client.from('recipe_library_backups').upsert({owner_id:user.id,backup,recipe_count:count,updated_at:new Date().toISOString()},{onConflict:'owner_id'});
 msg(error?'Opslaan mislukt: '+error.message:count+' recepten veilig als accountkopie opgeslagen. Je lokale bibliotheek blijft ongewijzigd.');
}
async function inspect(){
 const user=await auth();if(!user)return;
 const {data,error}=await client.from('recipe_library_backups').select('backup,recipe_count,updated_at').eq('owner_id',user.id).maybeSingle();
 if(error){msg('Accountkopie niet bereikbaar: '+error.message);return}
 if(!data){msg('Er is nog geen privéaccountkopie.');return}
 const remote=data.backup?.storage;const from=JSON.parse(remote?.[LIB]||'{}'),rr=Array.isArray(from.recipes)?from.recipes:[];
 const local=JSON.parse(localStorage.getItem(LIB)||'{}'),lr=Array.isArray(local.recipes)?local.recipes:[];
 const IDs=new Set(lr.map(r=>String(r.id))),MDBs=new Set(lr.map(r=>String(r.mdb||'').toUpperCase()).filter(Boolean));
 const additions=rr.filter(r=>!IDs.has(String(r.id))&&(!r.mdb||!MDBs.has(String(r.mdb).toUpperCase())));
 const conflicts=rr.filter(r=>!IDs.has(String(r.id))&&r.mdb&&MDBs.has(String(r.mdb).toUpperCase()));
 msg('Accountkopie van '+new Date(data.updated_at).toLocaleDateString('nl-NL')+': '+rr.length+' recepten. Op dit apparaat '+lr.length+'. '+additions.length+' toe te voegen zonder nummerconflict; '+conflicts.length+' nummerconflicten blijven ter beoordeling.');
 const b=$('#mbdCloudMerge');if(!b)return;b.hidden=!additions.length;
 b.onclick=()=>{
 if(!confirm('Voeg '+additions.length+' ontbrekende accountrecepten toe aan dit apparaat? Bestaande recepten en voorkeuren blijven behouden.'))return;
 const now=JSON.parse(localStorage.getItem(LIB)||'{}');if(!Array.isArray(now.recipes)){msg('De lokale bibliotheek is niet geldig. Er is niets gewijzigd.');return}
 const ids=new Set(now.recipes.map(r=>String(r.id))),codes=new Set(now.recipes.map(r=>String(r.mdb||'').toUpperCase()).filter(Boolean));
 const safe=additions.filter(r=>!ids.has(String(r.id))&&(!r.mdb||!codes.has(String(r.mdb).toUpperCase())));
 now.recipes.push(...safe);localStorage.setItem(LIB,JSON.stringify(now));
 if(typeof state!=='undefined'){state=now;renderAll()}
 msg(safe.length+' accountrecepten toegevoegd. Bestaande recepten, beoordelingen en voorkeuren zijn behouden. Herlaad de app indien nodig.');b.hidden=true;
 };
}
function install(){
 const parent=$('[data-screen="settings"]');if(!parent||$('#mbdCloudBackup'))return;
 const div=document.createElement('div');div.className='card';div.id='mbdCloudBackup';
 div.innerHTML='<div class="eyebrow">Fase 1 · Privéaccount</div><h2>Recepten veilig bewaren</h2><p class="muted">Handmatig een privéaccountkopie maken of recepten terughalen op een ander apparaat. Niets wordt automatisch overschreven.</p><button class="secondary upload">Bewaar accountkopie</button><button class="secondary inspect">Controleer accountkopie</button><button class="secondary" id="mbdCloudMerge" hidden>Voeg ontbrekende recepten toe</button><p id="mbdCloudStatus" class="muted"></p><p class="muted">Je moet zijn ingelogd. Bestaande beoordelingsgegevens worden in de accountkopie bewaard; terughalen van beoordelingen gebeurt niet automatisch.</p>';parent.prepend(div);div.querySelector('.upload').onclick=()=>upload().catch(e=>msg('Opslaan mislukt: '+e.message));div.querySelector('.inspect').onclick=()=>inspect().catch(e=>msg('Controle mislukt: '+e.message));
}
install();
})();