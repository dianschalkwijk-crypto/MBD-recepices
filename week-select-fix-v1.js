(()=>{
if(window.__mbdWeekSelectFixV2)return;window.__mbdWeekSelectFixV2=true;
const search=document.querySelector('#recipeSearch');if(search)search.oninput=()=>renderRecipes();
const shopping=document.querySelector('#shoppingBtn');if(shopping)shopping.onclick=()=>makeShopping();
const copy=document.querySelector('#copyShoppingBtn');if(copy)copy.onclick=()=>copyShopping();
document.addEventListener('change',e=>{
 const s=e.target;if(!s?.matches?.('#weekPlanner select'))return;
 e.stopImmediatePropagation();
 const day=s.getAttribute('aria-label')?.replace(' avondeten','')||s.dataset.day;if(!day)return;
 let a={};try{a=JSON.parse(localStorage.getItem('mbd_week_package_assignments_v1')||'{}')||{}}catch{}
 const v=s.value;
 if(v.startsWith('p:')){a[day]=v.slice(2);delete state.week[day]}
 else{delete a[day];if(v.startsWith('r:'))state.week[day]=v.slice(2);else delete state.week[day]}
 localStorage.setItem('mbd_week_package_assignments_v1',JSON.stringify(a));persist();
 try{document.dispatchEvent(new CustomEvent('mbd:week-choice',{detail:{day,value:v}}))}catch{}
},true);
})();