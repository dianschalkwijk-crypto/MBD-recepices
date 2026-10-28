const DB='https://ywsdubincfabjhvjqkot.supabase.co';
const PUB='sb_publishable_sIPgFRcpRiszmq8vuWLkAg_K-C0gzfF';

const cleanMdb=(v:any)=>String(v||'').trim().toUpperCase();
const cleanPaths=(v:any,mdb:string)=>{
  const list=Array.isArray(v)?v.map(String).map(x=>x.trim()).filter(Boolean):[];
  return [...new Set(list)].filter(x=>x.startsWith(mdb+'/')&&!x.includes('..')).slice(0,10);
};
async function getCurrent(mdb:string){
  const r=await fetch(DB+'/rest/v1/mbd_catalog?select=recipe,updated_at&mdb=eq.'+encodeURIComponent(mdb)+'&limit=1',{
    headers:{apikey:PUB},cache:'no-store'
  });
  if(!r.ok)throw new Error('Catalogus lezen mislukt');
  const rows:any[]=await r.json();
  return rows[0]||null;
}
async function write(mdb:string,recipe:any,expected:string){
  const secret=String(process.env.MBD_SUPABASE_WRITE_SECRET||'').trim();
  if(!secret)throw new Error('Server-write is niet geconfigureerd');
  const r=await fetch(DB+'/rest/v1/rpc/mbd_catalog_server_write',{
    method:'POST',headers:{apikey:PUB,'Content-Type':'application/json'},
    body:JSON.stringify({p_secret:secret,p_mdb:mdb,p_recipe:recipe,p_expected_updated_at:expected})
  });
  const data=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(data?.message||('Supabase HTTP '+r.status));
  return data;
}
export default async function handler(req:any,res:any){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='POST')return res.status(405).json({ok:false,error:'Methode niet toegestaan'});
  try{
    const mdb=cleanMdb(req.body?.mdb);
    if(!/^MDB-\d{4}$/.test(mdb))return res.status(400).json({ok:false,error:'Ongeldig receptnummer'});
    const paths=cleanPaths(req.body?.paths,mdb);
    if(!paths.length)return res.status(400).json({ok:false,error:'Geen geldige bronfoto ontvangen'});
    const current=await getCurrent(mdb);
    if(!current)return res.status(404).json({ok:false,error:'Recept niet gevonden'});
    const recipe={...(current.recipe||{})};
    const existing=Array.isArray(recipe.sourcePhotoPaths)?recipe.sourcePhotoPaths.map(String):[];
    recipe.sourcePhotoPaths=[...new Set([...existing,...paths])];
    recipe.sourcePhotoPrivate=true;
    const kind=String(req.body?.sourceKind||recipe.sourceKind||'').trim();
    recipe.sourcePhotoCredit=kind==='Kookboek'?'Bronfoto uit kookboek – niet van MadeByDian':'Bronafbeelding of screenshot – niet van MadeByDian';
    const result=await write(mdb,recipe,String(current.updated_at||''));
    if(!result?.ok)return res.status(409).json({ok:false,error:'Het recept is intussen gewijzigd. De bronfoto is niet gekoppeld; probeer opnieuw.',conflict:true});
    return res.status(200).json({ok:true,mdb,paths:recipe.sourcePhotoPaths,updatedAt:result.updated_at||null});
  }catch(e:any){
    console.error('Attach source photo failed',e);
    return res.status(502).json({ok:false,error:'Bronfoto kon niet veilig aan het recept worden gekoppeld.'});
  }
}
