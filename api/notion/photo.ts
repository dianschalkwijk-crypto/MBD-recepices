const V='2026-03-11';
const R='9573eb17-06e1-49a7-80a9-aa03755ee3d3';
const DB='https://ywsdubincfabjhvjqkot.supabase.co';
const PUB='sb_publishable_sIPgFRcpRiszmq8vuWLkAg_K-C0gzfF';

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
function cleanMdb(v:any){return String(v||'').trim().toUpperCase()}
function validMdb(v:string){return /^MDB-\d{4,}$/.test(v)}
function cleanPaths(v:any,mdb:string){
 const list=Array.isArray(v)?v.map(String).map(x=>x.trim()).filter(Boolean):[];
 return [...new Set(list)].filter(x=>x.startsWith(mdb+'/')&&!x.includes('..')).slice(0,10);
}
async function catalogCurrent(mdb:string){
 const r=await fetch(DB+'/rest/v1/mbd_catalog?select=recipe,updated_at&mdb=eq.'+encodeURIComponent(mdb)+'&limit=1',{
  headers:{apikey:PUB},cache:'no-store'
 });
 if(!r.ok)throw new Error('Catalogus lezen mislukt');
 const rows:any[]=await r.json();
 return rows[0]||null;
}
async function catalogWrite(mdb:string,recipe:any,expected:string){
 const secret=String(process.env.MBD_SUPABASE_WRITE_SECRET||'').trim();
 if(!secret)throw new Error('Server-write is niet geconfigureerd');
 const r=await fetch(DB+'/rest/v1/rpc/mbd_catalog_server_write',{
  method:'POST',
  headers:{apikey:PUB,'Content-Type':'application/json'},
  body:JSON.stringify({p_secret:secret,p_mdb:mdb,p_recipe:recipe,p_expected_updated_at:expected})
 });
 const data=await r.json().catch(()=>({}));
 if(!r.ok)throw new Error(data?.message||('Supabase HTTP '+r.status));
 return data;
}
async function attachCatalogPhoto(req:any,res:any){
 const mdb=cleanMdb(req.body?.mdb);
 if(!validMdb(mdb))return res.status(400).json({ok:false,error:'Ongeldig receptnummer'});
 const paths=cleanPaths(req.body?.paths,mdb);
 const photoKind=req.body?.photoKind==='own'?'own':'source';
 if(!paths.length)return res.status(400).json({ok:false,error:'Geen geldige foto ontvangen'});
 const current=await catalogCurrent(mdb);
 if(!current)return res.status(404).json({ok:false,error:'Recept niet gevonden'});
 const recipe={...(current.recipe||{})};
 if(photoKind==='own'){
  recipe.ownPhotoPath=paths[paths.length-1];
 }else{
  const existing=Array.isArray(recipe.sourcePhotoPaths)?recipe.sourcePhotoPaths.map(String):[];
  recipe.sourcePhotoPaths=[...new Set([...existing,...paths])];
  recipe.sourcePhotoPrivate=true;
  const kind=String(req.body?.sourceKind||recipe.sourceKind||'').trim();
  recipe.sourcePhotoCredit=kind==='Kookboek'?'Bronfoto uit kookboek – niet van MadeByDian':'Bronafbeelding of screenshot – niet van MadeByDian';
 }
 const result=await catalogWrite(mdb,recipe,String(current.updated_at||''));
 if(!result?.ok)return res.status(409).json({ok:false,error:'Het recept is intussen gewijzigd. De foto is niet gekoppeld; probeer opnieuw.',conflict:true});
 return res.status(200).json({ok:true,mdb,photoKind,paths:photoKind==='own'?[recipe.ownPhotoPath]:recipe.sourcePhotoPaths,updatedAt:result.updated_at||null});
}
function base64Bytes(value:string){
 const raw=atob(value);
 const out=new Uint8Array(raw.length);
 for(let i=0;i<raw.length;i++)out[i]=raw.charCodeAt(i);
 return out;
}
async function uploadNotionPhoto(req:any,res:any){
 const mdb=cleanMdb(req.body?.mdb);
 if(!validMdb(mdb))return res.status(400).json({ok:false,error:'Ongeldig MDB-nummer.'});
 const filename=String(req.body?.filename||'receptfoto.jpg').replace(/[^a-zA-Z0-9._-]+/g,'-').slice(0,160)||'receptfoto.jpg';
 const contentType=String(req.body?.contentType||'image/jpeg').toLowerCase();
 const base64=String(req.body?.base64||'').replace(/^data:image\/[^;]+;base64,/i,'').trim();
 if(!['image/jpeg','image/png','image/webp'].includes(contentType))return res.status(400).json({ok:false,error:'Gebruik een JPG, PNG of WebP.'});
 if(!base64||base64.length>9000000)return res.status(400).json({ok:false,error:'Foto ontbreekt of is te groot.'});
 const page=await pageFor(mdb);
 if(!page)return res.status(404).json({ok:false,error:'Recept niet gevonden in Notion.'});

 const created=await notion('/file_uploads',{
  method:'POST',
  body:JSON.stringify({mode:'single_part',filename,content_type:contentType})
 });
 if(!created?.id)throw new Error('Notion maakte geen bestandsupload aan');

 const form=new FormData();
 form.append('file',new Blob([base64Bytes(base64)],{type:contentType}),filename);
 const sent=await fetch('https://api.notion.com/v1/file_uploads/'+encodeURIComponent(created.id)+'/send',{
  method:'POST',
  headers:{Authorization:'Bearer '+token(),'Notion-Version':V},
  body:form
 });
 const sentData=await sent.json().catch(()=>({}));
 if(!sent.ok){
  const e:any=new Error(sentData?.message||('Notion upload HTTP '+sent.status));
  e.status=sent.status;throw e;
 }

 await notion('/pages/'+page.id,{
  method:'PATCH',
  body:JSON.stringify({properties:{Foto:{files:[{type:'file_upload',file_upload:{id:created.id}}]}}})
 });
 return res.status(200).json({ok:true,mdb,fileUploadId:created.id});
}
export default async function handler(req:any,res:any){
 res.setHeader('Cache-Control','no-store, no-cache, must-revalidate');
 res.setHeader('X-Content-Type-Options','nosniff');
 if(req.method==='POST'){
  try{
   if(req.body?.action==='attachCatalogPhoto')return await attachCatalogPhoto(req,res);
   return await uploadNotionPhoto(req,res);
  }catch(e:any){
   console.error('Notion photo write failed',e);
   return res.status(e?.status||500).json({ok:false,error:e?.message||'Foto kon niet worden opgeslagen.'});
  }
 }
 if(req.method!=='GET')return res.status(405).json({message:'Methode niet toegestaan.'});
 const requestUrl=new URL(String(req.url||'/'),'http://localhost');
 const mdb=cleanMdb(requestUrl.searchParams.get('mdb'));
 if(!validMdb(mdb))return res.status(400).json({message:'Ongeldig MDB-nummer.'});
 try{
  const page=await pageFor(mdb);
  if(!page)return res.status(404).json({message:'Recept niet gevonden.'});
  const files=page.properties?.Foto?.files||[];
  const first=files[0];
  const url=first?.file?.url||first?.external?.url||'';
  if(!url)return res.status(404).json({message:'Geen foto opgeslagen.'});
  res.setHeader('Location',url);
  return res.status(302).end();
 }catch(e:any){
  console.error('Notion photo read failed',e);
  return res.status(e?.status||500).json({message:e?.message||'Foto kon niet worden geladen.'});
 }
}
