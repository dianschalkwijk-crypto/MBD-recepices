const V='2026-03-11';
const R='9573eb17-06e1-49a7-80a9-aa03755ee3d3';

function token(){
 const t=process.env.NOTION_TOKEN?.trim();
 if(!t) throw new Error('NOTION_TOKEN ontbreekt');
 return t;
}
async function notion(path:string,init:RequestInit={}){
 const r=await fetch('https://api.notion.com/v1'+path,{
  ...init,
  headers:{
   Authorization:'Bearer '+token(),
   'Notion-Version':V,
   'Content-Type':'application/json',
   ...(init.headers||{})
  }
 });
 const data=await r.json().catch(()=>({}));
 if(!r.ok){
  const e:any=new Error((data as any)?.message||('Notion HTTP '+r.status));
  e.status=r.status;
  throw e;
 }
 return data as any;
}
async function pageFor(mdb:string){
 const d=await notion('/data_sources/'+R+'/query',{
  method:'POST',
  body:JSON.stringify({page_size:5,filter:{property:'MDB-ID',rich_text:{equals:mdb}}})
 });
 return (d.results||[])[0]||null;
}
export default async function handler(req:any,res:any){
 res.setHeader('Cache-Control','no-store, no-cache, must-revalidate');
 res.setHeader('X-Content-Type-Options','nosniff');
 if(req.method!=='GET') return res.status(405).json({message:'Alleen foto lezen is hier beschikbaar.'});
 const requestUrl=new URL(String(req.url||'/'),'http://localhost');
 const mdb=String(requestUrl.searchParams.get('mdb')||'').trim().toUpperCase();
 if(!/^MDB-\d{4,}$/.test(mdb)) return res.status(400).json({message:'Ongeldig MDB-nummer.'});
 try{
  const page=await pageFor(mdb);
  if(!page) return res.status(404).json({message:'Recept niet gevonden.'});
  const files=page.properties?.Foto?.files||[];
  const first=files[0];
  const url=first?.file?.url||first?.external?.url||'';
  if(!url) return res.status(404).json({message:'Geen foto opgeslagen.'});
  res.setHeader('Location',url);
  return res.status(302).end();
 }catch(e:any){
  console.error('Notion photo read failed',e);
  return res.status(e?.status||500).json({message:e?.message||'Foto kon niet worden geladen.'});
 }
}
