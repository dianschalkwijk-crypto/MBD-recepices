function dec(s:string){
 return String(s||'').replace(/&#(x[0-9a-f]+|[0-9]+);/gi,(_:string,n:string)=>String.fromCodePoint(n[0].toLowerCase()==='x'?parseInt(n.slice(1),16):Number(n))).replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#39;/g,"'");
}
const ALLOWED=new Set(['instagram.com','pinterest.com','pin.it','tiktok.com','facebook.com','youtube.com','youtu.be']);
export default async function handler(req:any,res:any){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST')return res.status(405).json({message:'POST required'});
 try{
  const url=new URL(String(req.body?.url||'')),host=url.hostname.replace(/^www\./,'').toLowerCase();
  if(url.protocol!=='https:'||!ALLOWED.has(host)||url.username||url.password||url.port)return res.status(400).json({message:'Niet ondersteunde link'});
  const c=new AbortController(),t=setTimeout(()=>c.abort(),12000);let response:Response;
  try{response=await fetch(url.toString(),{headers:{'User-Agent':'Mozilla/5.0','Accept':'text/html'},redirect:'error',signal:c.signal})}finally{clearTimeout(t)}
  if(!response.ok)return res.status(422).json({message:'Bron niet bereikbaar'});
  const html=(await response.text()).slice(0,1800000);
  const match=html.match(/<meta[^>]+(?:property|name)=["']og:description["'][^>]+content=["']([^"']*)["']/i)||html.match(/<meta[^>]+(?:name|property)=["']description["'][^>]+content=["']([^"']*)["']/i);
  const text=dec(match?.[1]||'').replace(/\s+/g,' ').trim();
  const author=(text.match(/- ([a-z0-9_.]+) on (?:January|February|March|April|May|June|July|August|September|October|November|December)/i)||[])[1]||null;
  if(!text)return res.status(422).json({message:'Geen bruikbare recepttekst gevonden'});
  return res.status(200).json({sourceURL:url.toString(),sharedText:text,sourceAuthor:author,text,author});
 }catch(e:any){
  if(e?.name==='AbortError')return res.status(504).json({message:'Bron ophalen duurde te lang'});
  return res.status(400).json({message:'Link kon niet worden verwerkt'});
 }
}
