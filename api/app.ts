export default async function handler(req:any,res:any){try{
 const host=String(req.headers.host||'');if(!host)throw Error('Missing host');
 const r=await fetch('https://'+host+'/index.html',{cache:'no-store'});if(!r.ok)throw Error('index.html '+r.status);
 let html=await r.text();
 html=html.replace(/<script[^>]+src=['"]\/(?:photo-fix|save-sync|catalog-sync|detail-rescue|notion-force-sync)[^'"]*['"][^>]*><\/script>/g,'');
 html=html.replace('</body>',"<script src='/photo-fix-v10.js?v=16'></script><script src='/save-sync-v10.js?v=16'></script><script src='/catalog-sync-v2.js?v=16'></script><script src='/detail-rescue-v2.js?v=16'></script><script src='/notion-force-sync-v1.js?v=16'></script></body>");
 res.setHeader('Content-Type','text/html; charset=utf-8');
 res.setHeader('Cache-Control','no-store, no-cache, must-revalidate');
 return res.status(200).send(html)
}catch(e){console.error('App wrapper',e);return res.status(500).send('App load error')}}