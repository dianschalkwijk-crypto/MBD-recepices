(()=>{
if(window.__mbdSafeDislikes)return;window.__mbdSafeDislikes=true;
const KEY='mbd_dislikes_v1',get=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}};
function dislikes(r){const p=get(),terms=[...(p.standard||[]),...(p.custom||[]),...(p.week||[])].map(x=>x.toLowerCase().trim()).filter(Boolean),s=((r.title||'')+' '+(r.ingredients||'')).toLowerCase();return terms.some(x=>s.split(/[^a-zà-ÿ]+/).includes(x)||s.includes(' '+x+' ')||s.startsWith(x+' '))}
const original=renderWeek;
renderWeek=function(){original();const selects=[...document.querySelectorAll('#weekPlanner select')],days=['Maandag','Dinsdag','Woensdag','Donderdag','Vrijdag'];let changed=false;
for(const select of selects){const day=select.getAttribute('aria-label')?.replace(' avondeten','');for(const opt of [...select.options]){if(!opt.value.startsWith('r:'))continue;const r=state.recipes.find(x=>String(x.id)===opt.value.slice(2));if(r&&dislikes(r)){if(select.value===opt.value&&day){delete state.week[day];changed=true}opt.remove()}}if(changed)select.value=''}
if(changed)persist();
const btn=document.querySelector('#mbdWeekExtras button');if(btn)btn.onclick=()=>{const allowed=[...selects[0].options].filter(o=>o.value.startsWith('r:')).map(o=>state.recipes.find(r=>String(r.id)===o.value.slice(2))).filter(Boolean),used=new Set(),themes=[/soep/i,/wrap|taco|burrito/i,/rijst|aardappel|soep|restjes/i,/oven|traybake|ovenschotel/i,/pasta|kip|zalm|vis|burger/i],a={};try{Object.assign(a,JSON.parse(localStorage.getItem('mbd_week_package_assignments_v1')||'{}'))}catch{}
for(let i=0;i<days.length;i++){const available=allowed.filter(r=>!used.has(r.id)),matches=available.filter(r=>themes[i].test(r.title||'')),pool=matches.length?matches:available,pick=pool[Math.floor(Math.random()*pool.length)];delete a[days[i]];if(pick){state.week[days[i]]=pick.id;used.add(pick.id)}else delete state.week[days[i]]}
localStorage.setItem('mbd_week_package_assignments_v1',JSON.stringify(a));persist();renderWeek();makeShopping()};
};
try{renderWeek()}catch(e){console.warn('Eetvoorkeuren',e)}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)try{renderWeek()}catch{}});
})();