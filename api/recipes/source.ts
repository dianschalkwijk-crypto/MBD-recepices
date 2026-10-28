import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

function dec(s:string){
  return String(s||"")
    .replace(/&#(x[0-9a-f]+|[0-9]+);/gi,(_:string,n:string)=>String.fromCodePoint(n[0].toLowerCase()==="x"?parseInt(n.slice(1),16):Number(n)))
    .replace(/&quot;/g,'"').replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&#39;/g,"'");
}
function clean(s:any){return dec(String(s||"")).replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim()}
function blockedIp(ip:string){
  const v=isIP(ip);
  if(v===4){
    const p=ip.split(".").map(Number),a=p[0],b=p[1];
    return a===0||a===10||a===127||a>=224||(a===100&&b>=64&&b<=127)||(a===169&&b===254)||(a===172&&b>=16&&b<=31)||(a===192&&b===168)||(a===198&&(b===18||b===19));
  }
  if(v===6){
    const x=ip.toLowerCase();
    return x==="::1"||x==="::"||x.startsWith("fc")||x.startsWith("fd")||x.startsWith("fe80")||x.startsWith("::ffff:127.")||x.startsWith("::ffff:10.")||x.startsWith("::ffff:192.168.");
  }
  return true;
}
async function safeUrl(raw:string){
  const u=new URL(raw);
  if(u.protocol!=="https:"||u.username||u.password||u.port)throw Error("Alleen openbare HTTPS-links worden ondersteund");
  const h=u.hostname.toLowerCase();
  if(h==="localhost"||h.endsWith(".local"))throw Error("Lokale links worden niet ondersteund");
  const addrs=await lookup(h,{all:true,verbatim:true});
  if(!addrs.length||addrs.some(x=>blockedIp(x.address)))throw Error("Deze link kan niet veilig worden geopend");
  return u;
}
function attr(tag:string,name:string){
  const m=tag.match(new RegExp('\\b'+name+'\\s*=\\s*["\\\']([^"\\\']*)["\\\']','i'));
  return m?.[1]||"";
}
function meta(html:string,key:string){
  for(const tag of html.match(/<meta\b[^>]*>/gi)||[]){
    const n=(attr(tag,"property")||attr(tag,"name")).toLowerCase();
    if(n===key.toLowerCase())return clean(attr(tag,"content"));
  }
  return "";
}
function instructionText(v:any):string[]{
  if(!v)return[];
  if(typeof v==="string")return[clean(v)].filter(Boolean);
  if(Array.isArray(v))return v.flatMap(instructionText);
  if(typeof v==="object"){
    if(v.text)return[clean(v.text)].filter(Boolean);
    if(v.itemListElement)return instructionText(v.itemListElement);
  }
  return[];
}
function findRecipeJson(x:any):any{
  if(!x)return null;
  if(Array.isArray(x)){for(const y of x){const z=findRecipeJson(y);if(z)return z}return null}
  if(typeof x!=="object")return null;
  const t=x["@type"];
  if(t==="Recipe"||(Array.isArray(t)&&t.includes("Recipe")))return x;
  if(x["@graph"]){const z=findRecipeJson(x["@graph"]);if(z)return z}
  for(const v of Object.values(x)){const z=findRecipeJson(v);if(z)return z}
  return null;
}
function jsonLdRecipe(html:string){
  const scripts=html.match(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi)||[];
  for(const tag of scripts){
    const body=tag.replace(/^.*?>/s,"").replace(/<\/script>\s*$/i,"").trim();
    try{
      const r=findRecipeJson(JSON.parse(body));
      if(!r)continue;
      const ingredients=Array.isArray(r.recipeIngredient)?r.recipeIngredient.map(clean).filter(Boolean):[];
      const steps=instructionText(r.recipeInstructions);
      const author=typeof r.author==="string"?clean(r.author):Array.isArray(r.author)?clean(r.author[0]?.name||""):clean(r.author?.name||"");
      const title=clean(r.name||"");
      const description=clean(r.description||"");
      const parts=[title];
      if(author)parts.push("Maker: "+author);
      if(description)parts.push(description);
      if(ingredients.length)parts.push("Ingrediënten:\n"+ingredients.map(x=>"• "+x).join("\n"));
      if(steps.length)parts.push("Bereiding:\n"+steps.map((x,i)=>(i+1)+". "+x).join("\n"));
      return {text:parts.filter(Boolean).join("\n\n"),author,title};
    }catch{}
  }
  return null;
}
function socialKind(host:string){
  if(host.includes("instagram"))return"Instagram";
  if(host.includes("tiktok"))return"TikTok";
  if(host.includes("facebook"))return"Facebook";
  if(host.includes("pinterest")||host==="pin.it")return"Pinterest";
  if(host.includes("youtube")||host==="youtu.be")return"YouTube";
  return"Website";
}

export default async function handler(req:any,res:any){
  res.setHeader("Cache-Control","no-store");
  if(req.method!=="POST")return res.status(405).json({message:"POST required"});
  try{
    const start=await safeUrl(String(req.body?.url||""));
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
    let response:Response;
    try{
      response=await fetch(start.toString(),{
        headers:{
          "User-Agent":"Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1",
          "Accept":"text/html,application/xhtml+xml",
          "Accept-Language":"nl-NL,nl;q=0.9,en;q=0.8"
        },
        redirect:"follow",
        signal:controller.signal
      });
    }finally{clearTimeout(timer)}
    if(!response.ok)return res.status(422).json({message:"Bron niet bereikbaar"});
    const finalUrl=await safeUrl(response.url||start.toString());
    const ct=response.headers.get("content-type")||"";
    if(!/text\/html|application\/xhtml\+xml/i.test(ct))return res.status(422).json({message:"Deze link bevat geen leesbare receptpagina"});
    const len=Number(response.headers.get("content-length")||0);
    if(len>5000000)return res.status(422).json({message:"Deze pagina is te groot om veilig uit te lezen"});
    const html=(await response.text()).slice(0,2500000);
    const ld=jsonLdRecipe(html);
    if(ld?.text&&ld.text.length>=10){
      return res.status(200).json({sourceURL:start.toString(),resolvedURL:finalUrl.toString(),sharedText:ld.text,text:ld.text,sourceAuthor:ld.author||null,author:ld.author||null,title:ld.title||null,sourceType:socialKind(finalUrl.hostname)});
    }
    const description=meta(html,"og:description")||meta(html,"twitter:description")||meta(html,"description");
    const title=meta(html,"og:title")||meta(html,"twitter:title")||clean((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)||[])[1]);
    const author=(description.match(/-\s+([a-z0-9_.@]+)\s+on\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)/i)||[])[1]||null;
    const text=[title,description].filter(Boolean).join("\n\n").trim();
    if(text.length<10){
      const kind=socialKind(finalUrl.hostname);
      return res.status(422).json({message:kind!=="Website"?"Deze socialmedia-caption is door het platform afgeschermd. Voeg een screenshot of foto toe; de bronlink kan wel bewaard blijven.":"Geen bruikbare recepttekst op deze website gevonden."});
    }
    return res.status(200).json({sourceURL:start.toString(),resolvedURL:finalUrl.toString(),sharedText:text,text,sourceAuthor:author,author,title:title||null,sourceType:socialKind(finalUrl.hostname)});
  }catch(e:any){
    if(e?.name==="AbortError")return res.status(504).json({message:"Bron ophalen duurde te lang"});
    return res.status(400).json({message:e?.message||"Link kon niet worden verwerkt"});
  }
}
