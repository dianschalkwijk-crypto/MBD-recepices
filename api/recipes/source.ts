import { lookup } from "node:dns/promises";
import net from "node:net";

function dec(s:string){
 return String(s||'').replace(/&#(x[0-9a-f]+|[0-9]+);/gi,(_:string,n:string)=>String.fromCodePoint(n[0].toLowerCase()==='x'?parseInt(n.slice(1),16):Number(n))).replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#39;/g,"'");
}
function privateIp(ip:string){
 if(net.isIPv4(ip)){
  const p=ip.split('.').map(Number);
  return p[0]===10||p[0]===127||p[0]===0||(p[0]===169&&p[1]===254)||(p[0]===172&&p[1]>=16&&p[1]<=31)||(p[0]===192&&p[1]===168)||(p[0]===100&&p[1]>=64&&p[1]<=127)||p[0]>=224;
 }
 if(net.isIPv6(ip)){
  const s=ip.toLowerCase();
  return s==='::1'||s==='::'||s.startsWith('fe80:')||s.startsWith('fc')||s.startsWith('fd')||s.startsWith('::ffff:127.')||s.startsWith('::ffff:10.')||s.startsWith('::ffff:192.168.');
 }
 return true;
}
async function safeUrl(raw:string){
 const u=new URL(raw);
 if(u.protocol!=='https:'||u.username||u.password||u.port)throw new Error('Niet ondersteunde link');
 const h=u.hostname.toLowerCase();
 if(h==='localhost'||h.endsWith('.localhost')||h.endsWith('.local')||h.endsWith('.internal'))throw new Error('Niet ondersteunde link');
 if(net.isIP(h)){if(privateIp(h))throw new Error('Niet ondersteunde link')}
 else{
  const rows=await lookup(h,{all:true,verbatim:true});
  if(!rows.length||rows.some(x=>privateIp(x.address)))throw new Error('Niet ondersteunde link');
 }
 return u;
}
async function fetchSafe(start:URL){
 let u=start;
 for(let i=0;i<4;i++){
  await safeUrl(u.toString());
  const c=new AbortController(),t=setTimeout(()=>c.abort(),12000);let r:Response;
  try{
   r=await fetch(u.toString(),{headers:{'User-Agent':'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1','Accept':'text/html,application/xhtml+xml'},redirect:'manual',signal:c.signal});
  }finally{clearTimeout(t)}
  if(r.status>=300&&r.status<400){
   const loc=r.headers.get('location');if(!loc)throw new Error('Bron verwijst door zonder geldig adres');
   u=await safeUrl(new URL(loc,u).toString());continue;
  }
  return {response:r,url:u};
 }
 throw new Error('Te veel doorverwijzingen');
}
function attr(tag:string,name:string){
 const m=tag.match(new RegExp(name+'\\s*=\\s*["\\\']([^"\\\']*)["\\\']','i'));
 return dec(m?.[1]||'');
}
function meta(html:string,key:string){
 for(const m of html.matchAll(/<meta\b[^>]*>/gi)){
  const tag=m[0],k=(attr(tag,'property')||attr(tag,'name')).toLowerCase();
  if(k===key.toLowerCase())return attr(tag,'content');
 }
 return '';
}
function walkRecipe(x:any):any{
 if(!x)return null;
 if(Array.isArray(x)){for(const v of x){const r=walkRecipe(v);if(r)return r}return null}
 if(typeof x!=='object')return null;
 const type=x['@type'],types=Array.isArray(type)?type:[type];
 if(types.map(String).some(t=>t.toLowerCase()==='recipe'))return x;
 if(x['@graph']){const r=walkRecipe(x['@graph']);if(r)return r}
 return null;
}
function parseLdRecipe(html:string){
 for(const m of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)){
  try{
   const r=walkRecipe(JSON.parse(dec(m[1]).trim()));if(!r)continue;
   const ingredients=Array.isArray(r.recipeIngredient)?r.recipeIngredient.map(String).filter(Boolean):[];
   const stepText=(v:any):string=>{
    if(typeof v==='string')return v;if(!v||typeof v!=='object')return'';
    if(typeof v.text==='string')return v.text;if(typeof v.name==='string')return v.name;
    if(Array.isArray(v.itemListElement))return v.itemListElement.map(stepText).filter(Boolean).join('\n');
    return'';
   };
   const instructions=Array.isArray(r.recipeInstructions)?r.recipeInstructions.map(stepText).filter(Boolean):stepText(r.recipeInstructions).split('\n').filter(Boolean);
   const author=typeof r.author==='string'?r.author:Array.isArray(r.author)?r.author.map((a:any)=>a?.name||a).filter(Boolean).join(', '):r.author?.name||'';
   return {title:String(r.name||''),ingredients,instructions,author:String(author||'')};
  }catch{}
 }
 return null;
}
function socialAuthor(text:string){
 return (text.match(/- ([a-z0-9_.]+) on (?:January|February|March|April|May|June|July|August|September|October|November|December)/i)||[])[1]||null;
}
export default async function handler(req:any,res:any){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST')return res.status(405).json({message:'POST required'});
 try{
  const start=await safeUrl(String(req.body?.url||''));
  const {response,url}=await fetchSafe(start);
  if(!response.ok)return res.status(422).json({message:'Bron niet bereikbaar'});
  const html=(await response.text()).slice(0,2200000);
  const ld=parseLdRecipe(html);
  if(ld&&(ld.ingredients.length||ld.instructions.length)){
   const text=[ld.title,ld.ingredients.length?'Ingrediënten:\n'+ld.ingredients.join('\n'):'',ld.instructions.length?'Bereiding:\n'+ld.instructions.join('\n'):''].filter(Boolean).join('\n\n');
   return res.status(200).json({sourceURL:url.toString(),sharedText:text,sourceAuthor:ld.author||null,text,author:ld.author||null,extraction:'recipe-jsonld'});
  }
  const description=meta(html,'og:description')||meta(html,'description')||meta(html,'twitter:description');
  const title=meta(html,'og:title')||meta(html,'twitter:title')||dec((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)||[])[1]||'');
  const text=[title,description].map(x=>String(x||'').replace(/\s+/g,' ').trim()).filter(Boolean).join('\n').trim();
  const author=socialAuthor(description);
  if(text.length<10)return res.status(422).json({message:'Geen bruikbare recepttekst gevonden'});
  return res.status(200).json({sourceURL:url.toString(),sharedText:text,sourceAuthor:author,text,author,extraction:'page-metadata'});
 }catch(e:any){
  if(e?.name==='AbortError')return res.status(504).json({message:'Bron ophalen duurde te lang'});
  const m=String(e?.message||'');
  if(m.includes('Niet ondersteunde'))return res.status(400).json({message:'Niet ondersteunde of onveilige link'});
  return res.status(422).json({message:'Link kon niet automatisch worden uitgelezen'});
 }
}
