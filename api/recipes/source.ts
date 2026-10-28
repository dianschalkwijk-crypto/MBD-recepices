import {lookup} from "node:dns/promises";
import {isIP} from "node:net";

function dec(s:string){
 return String(s||"")
  .replace(/&#(x[0-9a-f]+|[0-9]+);/gi,(_:string,n:string)=>String.fromCodePoint(n[0].toLowerCase()==="x"?parseInt(n.slice(1),16):Number(n)))
  .replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#39;/g,"'");
}
function privateAddress(addr:string){
 const a=String(addr||"").toLowerCase();
 if(!a)return true;
 if(a==="::"||a==="::1"||a.startsWith("fc")||a.startsWith("fd")||a.startsWith("fe8")||a.startsWith("fe9")||a.startsWith("fea")||a.startsWith("feb")||a.startsWith("ff")||a.startsWith("2001:db8:"))return true;
 const v4=a.startsWith("::ffff:")?a.slice(7):a;
 if(isIP(v4)!==4)return false;
 const p=v4.split(".").map(Number),x=p[0],y=p[1];
 return x===0||x===10||x===127||x>=224||x>=240||
  (x===100&&y>=64&&y<=127)||(x===169&&y===254)||(x===172&&y>=16&&y<=31)||
  (x===192&&y===168)||(x===192&&y===0)||(x===192&&y===2)||
  (x===198&&(y===18||y===19||y===51))||(x===203&&y===0);
}
async function validate(raw:string){
 const u=new URL(raw);
 if(u.protocol!=="https:"||u.username||u.password||u.port)throw new Error("Alleen openbare HTTPS-links zijn toegestaan");
 const host=u.hostname.replace(/\.$/,"").toLowerCase();
 if(!host||host==="localhost"||host.endsWith(".localhost")||host.endsWith(".local"))throw new Error("Deze host is niet toegestaan");
 const records=await lookup(host,{all:true,verbatim:true});
 if(!records.length||records.some(r=>privateAddress(r.address)))throw new Error("Deze host is niet openbaar bereikbaar");
 return u;
}
async function fetchHtml(raw:string){
 let u=await validate(raw);
 for(let i=0;i<4;i++){
  const c=new AbortController(),t=setTimeout(()=>c.abort(),12000);
  let r:Response;
  try{
   r=await fetch(u.toString(),{
    headers:{
     "User-Agent":"Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1",
     "Accept":"text/html,application/xhtml+xml;q=0.9,text/plain;q=0.7,*/*;q=0.2",
     "Accept-Language":"nl-NL,nl;q=0.9,en;q=0.7"
    },
    redirect:"manual",signal:c.signal
   });
  }finally{clearTimeout(t)}
  if(r.status>=300&&r.status<400){
   const loc=r.headers.get("location");if(!loc)throw new Error("Bron stuurde door zonder doel");
   u=await validate(new URL(loc,u).toString());continue;
  }
  if(!r.ok)throw new Error("Bron niet bereikbaar (HTTP "+r.status+")");
  const type=(r.headers.get("content-type")||"").toLowerCase();
  if(type&&!type.includes("text/html")&&!type.includes("text/plain")&&!type.includes("application/xhtml"))throw new Error("Bron bevat geen leesbare webpagina");
  return{url:u,html:(await r.text()).slice(0,1800000)};
 }
 throw new Error("Te veel doorverwijzingen");
}
function meta(html:string,key:string){
 const escaped=key.replace(/[.*+?^$()|[\]\\{}]/g,"\\$&");
 const a=new RegExp('<meta[^>]+(?:property|name)=["\\\']'+escaped+'["\\\'][^>]+content=["\\\']([^"\\\']*)["\\\']','i').exec(html);
 if(a?.[1])return dec(a[1]).trim();
 const b=new RegExp('<meta[^>]+content=["\\\']([^"\\\']*)["\\\'][^>]+(?:property|name)=["\\\']'+escaped+'["\\\']','i').exec(html);
 return dec(b?.[1]||"").trim();
}
function textOf(v:any):string{
 if(typeof v==="string")return v.trim();
 if(Array.isArray(v))return v.map(textOf).filter(Boolean).join("\n");
 if(!v||typeof v!=="object")return"";
 if(v.text)return textOf(v.text);
 if(v.name)return textOf(v.name);
 if(v.itemListElement)return textOf(v.itemListElement);
 return"";
}
function findRecipe(v:any):any{
 if(Array.isArray(v)){for(const x of v){const r=findRecipe(x);if(r)return r}return null}
 if(!v||typeof v!=="object")return null;
 const t=v["@type"],types=Array.isArray(t)?t:[t];
 if(types.some((x:any)=>String(x).toLowerCase()==="recipe"))return v;
 if(v["@graph"]){const r=findRecipe(v["@graph"]);if(r)return r}
 for(const k of Object.keys(v)){if(k==="@context")continue;const r=findRecipe(v[k]);if(r)return r}
 return null;
}
function structuredRecipe(html:string){
 const re=/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
 let m:RegExpExecArray|null;
 while((m=re.exec(html))){
  try{
   const json=JSON.parse(m[1].trim()),r=findRecipe(json);if(!r)continue;
   const title=textOf(r.name),ings=Array.isArray(r.recipeIngredient)?r.recipeIngredient.map(textOf).filter(Boolean):[];
   const rawSteps=r.recipeInstructions,steps=Array.isArray(rawSteps)?rawSteps.map(textOf).filter(Boolean):textOf(rawSteps).split("\n").filter(Boolean);
   const author=textOf(r.author);
   if(title||ings.length||steps.length){
    const lines=[title,author?"Maker: "+author:"",ings.length?"Ingrediënten:\n"+ings.map((x:string)=>"• "+x).join("\n"):"",steps.length?"Bereiding:\n"+steps.map((x:string,i:number)=>(i+1)+". "+x).join("\n"):""].filter(Boolean);
    return{text:lines.join("\n\n"),author};
   }
  }catch{}
 }
 return null;
}
function cleanTitle(s:string){return dec(String(s||"").replace(/\s+/g," ").trim()).slice(0,300)}
function socialAuthor(text:string){
 return (text.match(/@([a-z0-9_.]{2,40})/i)||text.match(/- ([a-z0-9_.]+) on (?:January|February|March|April|May|June|July|August|September|October|November|December)/i)||[])[1]||null;
}
export default async function handler(req:any,res:any){
 res.setHeader("Cache-Control","no-store");
 if(req.method!=="POST")return res.status(405).json({message:"POST required"});
 try{
  const raw=String(req.body?.url||"").trim();if(!raw)return res.status(400).json({message:"Vul een bronlink in"});
  const {url,html}=await fetchHtml(raw);
  const structured=structuredRecipe(html);
  const ogTitle=cleanTitle(meta(html,"og:title")||meta(html,"twitter:title")||"");
  const description=dec(meta(html,"og:description")||meta(html,"description")||meta(html,"twitter:description")||"").replace(/\s+/g," ").trim();
  let text=structured?.text||[ogTitle,description].filter(Boolean).join("\n\n");
  const author=structured?.author||socialAuthor(description)||socialAuthor(ogTitle);
  if(text.length<10)return res.status(422).json({message:"Geen bruikbare recepttekst gevonden op deze link"});
  if(text.length>60000)text=text.slice(0,60000);
  return res.status(200).json({sourceURL:url.toString(),sharedText:text,text,sourceAuthor:author,author,title:ogTitle||null,structured:!!structured});
 }catch(e:any){
  const msg=e?.name==="AbortError"?"Bron ophalen duurde te lang":e?.message||"Link kon niet worden verwerkt";
  return res.status(422).json({message:msg});
 }
}
