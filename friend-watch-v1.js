(()=>{
if(window.__mbdFriendWatch)return;window.__mbdFriendWatch=true;
const get=(k,f)=>{try{return JSON.parse(localStorage.getItem(k)||'null')??f}catch{return f}};
let client=null;
async function check(){if(!client||document.hidden)return;try{
const {data:{user}}=await client.auth.getUser();if(!user)return;
const {data,error}=await client.from('recipes').select('id,owner_id,title,ingredients,instructions,created_at').neq('owner_id',user.id).is('deleted_at',null).order('created_at',{ascending:false}).limit(1000);
if(error)return;
const p=get('mbd_allergy_prefs_v1',{}),risk=(data||[]).filter(r=>{const s=[r.title,JSON.stringify(r.ingredients),JSON.stringify(r.instructions)].join(' ').toLowerCase();if(p.shrimp!==false&&/garnal|garnaal|gamba|scampi|shrimp|prawn/i.test(s))return true;for(const x of p.custom||[])if(x&&s.includes(x.toLowerCase()))return true;return false});
const seen=get('mbd_friend_seen_v1',[]),unseen=risk.filter(r=>!seen.includes(r.id));
let card=document.querySelector('#mbdFriendWatch');if(!card){card=document.createElement('div');card.id='mbdFriendWatch';card.className='card';document.querySelector('[data-screen="settings"]')?.prepend(card)}
if(!card)return;card.replaceChildren();const title=document.createElement('h2');title.textContent='Nieuwe recepten van andere accounts';const desc=document.createElement('p');desc.className='muted';desc.textContent=risk.length+' met mogelijke garnalen of eigen allergenen · '+unseen.length+' nog te beoordelen. Niets is toegevoegd.';card.append(title,desc);const link=document.createElement('a');link.href='/allergieen.html';link.textContent='Bekijk controlelijst →';card.append(link);
if(unseen.length){const ul=document.createElement('ul');for(const r of unseen.slice(0,15)){const li=document.createElement('li');li.textContent=r.title;ul.append(li)}card.append(ul);const btn=document.createElement('button');btn.textContent='Markeer als bekeken';btn.onclick=()=>{localStorage.setItem('mbd_friend_seen_v1',JSON.stringify([...new Set([...seen,...risk.map(r=>r.id)])]));check()};card.append(btn)}
}catch(e){console.warn('Controle accountrecepten',e)}}
async function start(){try{if(!window.supabase)await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';s.onload=resolve;s.onerror=reject;document.head.append(s)});client=window.supabase.createClient('https://ywsdubincfabjhvjqkot.supabase.co','sb_publishable_sIPgFRcpRiszmq8vuWLkAg_K-C0gzfF');await check();setInterval(check,120000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)check()})}catch(e){console.warn('Accountcontrole niet beschikbaar',e)}}
start();
})();