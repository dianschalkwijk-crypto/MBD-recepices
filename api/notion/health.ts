const V='2026-03-11';
const R='9573eb17-06e1-49a7-80a9-aa03755ee3d3';
const B='7780dc25-2324-4c43-9457-944696411e18';
function token(){const t=process.env.NOTION_TOKEN&&process.env.NOTION_TOKEN.trim();if(!t)throw new Error('NOTION_TOKEN ontbreekt');return t}
async function query(id:string,body:any){const r=await fetch('https://api.notion.com/v1/data_sources/'+id+'/query',{method:'POST',headers:{Authorization:'Bearer '+token(),'Notion-Version':V,'Content-Type':'application/json'},body:JSON.stringify(body)});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.message||('Notion HTTP '+r.status));return d}
const read=(p:any)=>((p?.title||p?.rich_text||[]).map((x:any)=>x.plain_text||(x.text&&x.text.content)||'').join(''));
export default async function handler(req:any,res:any){
  if(req.method!=='GET')return res.status(405).json({ok:false,error:'Method not allowed'});
  try{
    const d=await query(B,{page_size:20,sorts:[{property:'Boeknr.',direction:'descending'}],filter:{property:'Status',select:{equals:'Actief'}}});
    const activeBooks=(d.results||[]).map((p:any)=>({name:read(p.properties?.Kookboek),number:p.properties?.['Boeknr.']?.number||null}));
    return res.status(200).json({ok:true,notionConfigured:!!process.env.NOTION_TOKEN,recipeDataSource:!!R,supabaseWriteConfigured:!!process.env.MBD_SUPABASE_WRITE_SECRET,activeBooks});
  }catch(e:any){return res.status(500).json({ok:false,error:e?.message||String(e)})}
}
