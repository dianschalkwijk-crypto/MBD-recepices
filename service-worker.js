const CACHE="madebydian-recipes-v0.10.38";
const INJECT="<script src='/photo-fix-v10.js?v=38'></script><script src='/save-sync-v10.js?v=38'></script><script src='/catalog-sync-v2.js?v=38'></script><script src='/allergy-integration-v2.js?v=38'></script><script src='/push-notifications-v1.js?v=38'></script><script src='/ux-finishing-v1.js?v=38'></script><script src='/scan-enhance-v1.js?v=38'></script>";
async function inject(r){if(!r)return r;const ct=r.headers.get("content-type")||"";if(!ct.includes("text/html"))return r;let html=await r.text();html=html.replace(/<script[^>]+src=['"]\/(?:photo-fix|save-sync|catalog-sync|allergy-integration|push-notifications|ux-finishing|scan-enhance|detail-rescue|notion-force-sync)[^'"]*['"][^>]*><\/script>/g,"");html=html.replace("setTimeout(syncCatalogRecipes,1800);","/* Disabled duplicate inline catalog sync: catalog-sync-v2.js is authoritative. */");html=html.replace("</body>",INJECT+"</body>");const h=new Headers(r.headers);h.delete("content-length");h.delete("content-encoding");h.delete("etag");h.set("cache-control","no-store");return new Response(html,{status:r.status,statusText:r.statusText,headers:h})}
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(["/index.html","/manifest.webmanifest","/assets/icon-192.png","/assets/icon-512.png","/assets/apple-touch-icon.png","/recipe-filters.js?v=38","/photo-crop.js?v=38","/photo-fix-v10.js?v=38","/save-sync-v10.js?v=38","/save-sync-original-v10.js?v=38","/catalog-sync-v2.js?v=38","/allergy-integration-v2.js?v=38","/push-notifications-v1.js?v=38","/ux-finishing-v1.js?v=38","/scan-enhance-v1.js?v=38","/main-preferences-v1.js?v=38","/week-select-fix-v1.js?v=38","/friend-watch-v2.js?v=38","/library-phase1-v1.js?v=38","/account-library-backup-v1.js?v=38"])).catch(()=>{}))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{const r=e.request;if(r.method!=="GET")return;const u=new URL(r.url);if(u.origin!==self.location.origin)return;if(r.mode==="navigate"||u.pathname==="/"||u.pathname==="/index.html"){e.respondWith((async()=>{try{return await inject(await fetch(r,{cache:"no-store"}))}catch{const c=await caches.match("/index.html");return c?inject(c):Response.error()}})())}});

// Static dependencies must remain available when reopening local concepts offline.
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith('/api/')||!(/\.(?:js|css|png|webp|svg)$/.test(url.pathname)))return;
 event.respondWith((async()=>{
  try{const response=await fetch(request);if(response.ok){const cache=await caches.open(CACHE);await cache.put(request,response.clone());}return response;}
  catch{const cached=await caches.match(request);return cached||Response.error();}
 })());
});

self.addEventListener("push",event=>{
 let data={};try{data=event.data?event.data.json():{}}catch{data={body:event.data?.text?.()||""}}
 const title=data.title||"MadeByDian Recepten";
 const options={
  body:data.body||"Bekijk je recepten en planning.",
  icon:"/assets/icon-192.png",
  badge:"/assets/icon-192.png",
  tag:data.tag||"mbd-recipes",
  data:{url:data.url||"/"}
 };
 event.waitUntil(self.registration.showNotification(title,options));
});
self.addEventListener("notificationclick",event=>{
 event.notification.close();
 const target=new URL(event.notification.data?.url||"/",self.location.origin).href;
 event.waitUntil(self.clients.matchAll({type:"window",includeUncontrolled:true}).then(list=>{
  for(const client of list){if(client.url.startsWith(self.location.origin)&&"focus" in client){client.navigate?.(target);return client.focus()}}
  return self.clients.openWindow?self.clients.openWindow(target):undefined;
 }));
});
