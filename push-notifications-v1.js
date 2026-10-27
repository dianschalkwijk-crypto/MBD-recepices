(()=>{
if(window.__mbdPushIntegrated)return;window.__mbdPushIntegrated=true;
const DB='https://ywsdubincfabjhvjqkot.supabase.co';
const PUB='sb_publishable_sIPgFRcpRiszmq8vuWLkAg_K-C0gzfF';
const $=q=>document.querySelector(q);
const b64urlToBytes=s=>{
  const pad='='.repeat((4-s.length%4)%4),base=(s+pad).replace(/-/g,'+').replace(/_/g,'/');
  const raw=atob(base);return Uint8Array.from([...raw].map(c=>c.charCodeAt(0)));
};
const client=window.supabase?.createClient?.(DB,PUB);
let config=null;

function addCard(){
  const screen=$('[data-screen="settings"]');if(!screen||$('#mbdPushSettings'))return;
  const card=document.createElement('div');card.className='card';card.id='mbdPushSettings';
  card.innerHTML=`
    <div class="eyebrow">Ochtendmelding</div>
    <h2>🔔 Pushmelding om 08:40</h2>
    <p class="muted">Ontvang op dit apparaat iedere ochtend om 08:40 een korte MadeByDian-melding.</p>
    <div class="row gap8" style="flex-wrap:wrap">
      <button type="button" class="secondary" id="mbdPushEnable">Meldingen aanzetten</button>
      <button type="button" class="secondary" id="mbdPushTest">Stuur testmelding</button>
      <button type="button" class="ghost" id="mbdPushDisable">Meldingen uitzetten</button>
    </div>
    <p class="muted" id="mbdPushStatus">Status wordt gecontroleerd…</p>
  `;
  screen.prepend(card);
  $('#mbdPushEnable').onclick=enable;
  $('#mbdPushTest').onclick=test;
  $('#mbdPushDisable').onclick=disable;
  refresh();
}
async function session(){
  if(!client)throw Error('Accountverbinding niet beschikbaar');
  const {data:{session},error}=await client.auth.getSession();
  if(error||!session)throw Error('Log eerst in via Account');
  return session;
}
async function getConfig(){
  if(config)return config;
  const r=await fetch('/api/push/config',{cache:'no-store'});
  const d=await r.json().catch(()=>({}));
  if(!r.ok||!d.enabled||!d.publicKey)throw Error(d.error||'Push is nog niet geconfigureerd');
  config=d;return d;
}
async function readyRegistration(){
  if(!('serviceWorker' in navigator))throw Error('Serviceworker wordt niet ondersteund');
  let reg=await navigator.serviceWorker.getRegistration('/');
  if(!reg)reg=await navigator.serviceWorker.register('/service-worker.js',{scope:'/'});
  return navigator.serviceWorker.ready;
}
function status(text,bad=false){
  const el=$('#mbdPushStatus');if(el){el.textContent=text;el.style.color=bad?'#993b3b':''}
}
async function refresh(){
  try{
    if(!('Notification' in window)||!('PushManager' in window)||!('serviceWorker' in navigator)){
      status('Pushmeldingen worden in deze browser niet ondersteund.',true);return;
    }
    const reg=await navigator.serviceWorker.getRegistration('/');
    const sub=reg?await reg.pushManager.getSubscription():null;
    const permission=Notification.permission;
    status(sub&&permission==='granted'?'Meldingen staan op dit apparaat aan voor 08:40.':permission==='denied'?'Meldingen zijn door de browser geweigerd. Pas dit aan in Instellingen → Meldingen.':'Meldingen staan nog niet aan.');
  }catch(e){status('Status kon niet worden gecontroleerd: '+e.message,true)}
}
async function enable(){
  try{
    const ios=/iPad|iPhone|iPod/.test(navigator.userAgent);
    const standalone=window.matchMedia?.('(display-mode: standalone)').matches||window.navigator.standalone===true;
    if(ios&&!standalone)throw Error('Zet MadeByDian eerst op je beginscherm en open de app vanaf het pictogram.');
    const s=await session();
    const cfg=await getConfig();
    const permission=await Notification.requestPermission();
    if(permission!=='granted')throw Error('Meldingen zijn niet toegestaan');
    const reg=await readyRegistration();
    let sub=await reg.pushManager.getSubscription();
    if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64urlToBytes(cfg.publicKey)});
    const j=sub.toJSON(),keys=j.keys||{};
    if(!j.endpoint||!keys.p256dh||!keys.auth)throw Error('Pushabonnement is onvolledig');
    const {error}=await client.from('mbd_push_subscriptions').upsert({
      user_id:s.user.id,
      endpoint:j.endpoint,
      p256dh:keys.p256dh,
      auth_key:keys.auth,
      enabled:true,
      timezone:'Europe/Amsterdam',
      updated_at:new Date().toISOString()
    },{onConflict:'endpoint'});
    if(error)throw error;
    status('Meldingen staan aan. Gepland voor 08:40.');
  }catch(e){status('Niet aangezet: '+e.message,true)}
}
async function disable(){
  try{
    const s=await session();
    const reg=await navigator.serviceWorker.getRegistration('/');
    const sub=reg?await reg.pushManager.getSubscription():null;
    if(sub){
      await client.from('mbd_push_subscriptions').delete().eq('endpoint',sub.endpoint).eq('user_id',s.user.id);
      await sub.unsubscribe();
    }
    status('Meldingen staan uit.');
  }catch(e){status('Uitzetten mislukt: '+e.message,true)}
}
async function test(){
  try{
    const s=await session();
    const reg=await navigator.serviceWorker.getRegistration('/');
    const sub=reg?await reg.pushManager.getSubscription():null;
    if(!sub)throw Error('Zet eerst meldingen aan');
    status('Testmelding wordt verstuurd…');
    const r=await fetch('/api/push/test',{
      method:'POST',
      headers:{Authorization:'Bearer '+s.access_token,'Content-Type':'application/json'},
      body:'{}'
    });
    const d=await r.json().catch(()=>({}));
    if(!r.ok||!d.ok)throw Error(d.error||('HTTP '+r.status));
    status('Testmelding verstuurd naar '+d.sent+' apparaat'+(d.sent===1?'':'en')+'.');
  }catch(e){status('Testmelding mislukt: '+e.message,true)}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',addCard);else addCard();
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
})();