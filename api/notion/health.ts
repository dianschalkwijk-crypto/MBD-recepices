const V='2026-03-11';
const R='9573eb17-06e1-49a7-80a9-aa03755ee3d3';
const B='7780dc25-2324-4c43-9457-944696411e18';
function token(){const t=process.env.NOTION_TOKEN&&process.env.NOTION_TOKEN.trim();if(!t)throw new Error('NOTION_TOKEN ontbreekt');return t}
async function query(id:string,body:any){const r=await fetch('https://api.notion.com/v1/data_sources/'+id+'/query',{method:'POST',headers:{Authorization:'Bearer '+token(),'Notion-Version':V,'Content-Type':'application/json'},body:JSON.stringify(body)});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.message||('Notion HTTP '+r.status));return d}
const read=(p:any)=>((p?.title||p?.rich_text||[]).map((x:any)=>x.plain_text||(x.text&&x.text.content)||'').join(''));
// An invalid MDB is rejected after credential validation and before any write.
export async function checkWriteCredential(){
  const secret=process.env.MBD_SUPABASE_WRITE_SECRET?.trim();
  if(!secret)return {ready:false,error:'Serversleutel voor receptopslag ontbreekt'};
  try{
    const r=await fetch('https://ywsdubincfabjhvjqkot.supabase.co/rest/v1/rpc/mbd_catalog_server_write',{
      method:'POST',headers:{apikey:'sb_publishable_sIPgFRcpRiszmq8vuWLkAg_K-C0gzfF','Content-Type':'application/json'},
      body:JSON.stringify({p_secret:secret,p_mdb:'health-check-invalid',p_recipe:{},p_expected_updated_at:null}),signal:AbortSignal.timeout(10000)
    });
    const d=await r.json().catch(()=>({}));
    if(!r.ok&&d.message==='invalid_mdb')return {ready:true};
    return {ready:false,error:r.status===401||r.status===403?'Database weigert de serversleutel voor receptopslag':'Opslagcontrole mislukt (HTTP '+r.status+')'};
  }catch{return {ready:false,error:'Opslagcontrole niet bereikbaar'}}
}
export default async function handler(req:any,res:any){
  if(req.method!=='GET')return res.status(405).json({ok:false,error:'Method not allowed'});
  try{
    const d=await query(B,{page_size:20,sorts:[{property:'Boeknr.',direction:'descending'}],filter:{property:'Status',select:{equals:'Actief'}}});
    const activeBooks=(d.results||[]).map((p:any)=>({name:read(p.properties?.Kookboek),number:p.properties?.['Boeknr.']?.number||null}));
    const write=await checkWriteCredential();
    res.setHeader('Cache-Control','no-store');
    return res.status(200).json({ok:write.ready,supabaseWriteReady:write.ready,supabaseWriteError:write.error||null,notionConfigured:!!process.env.NOTION_TOKEN,recipeDataSource:!!R,supabaseWriteConfigured:!!process.env.MBD_SUPABASE_WRITE_SECRET,activeBooks});
  }catch(e:any){return res.status(500).json({ok:false,error:e?.message||String(e)})}
}
