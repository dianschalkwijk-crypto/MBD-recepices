const V='2026-03-11';
const R='9573eb17-06e1-49a7-80a9-aa03755ee3d3';
const B='7780dc25-2324-4c43-9457-944696411e18';
const IDS=new Set(['MDB-0673','MDB-0674','MDB-0675']);
const PREFIX='MBD E2E TEST 2026-10-27 ';

function token(){const t=process.env.NOTION_TOKEN&&process.env.NOTION_TOKEN.trim();if(!t)throw new Error('NOTION_TOKEN ontbreekt');return t}
async function notion(path:string,init:any={}){
 const r=await fetch('https://api.notion.com/v1'+path,{...init,headers:{Authorization:'Bearer '+token(),'Notion-Version':V,'Content-Type':'application/json',...(init.headers||{})}});
 const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.message||('Notion HTTP '+r.status));return d;
}
const query=(id:string,body:any)=>notion('/data_sources/'+id+'/query',{method:'POST',body:JSON.stringify(body)});
const plain=(p:any)=>((p?.title||p?.rich_text||[]).map((x:any)=>x.plain_text||(x.text&&x.text.content)||'').join(''));

export default async function handler(req:any,res:any){
 res.setHeader('Cache-Control','no-store');
 if(process.env.VERCEL_ENV!=='preview')return res.status(404).json({ok:false,error:'Not found'});
 if(req.method!=='GET'||String(req.query?.confirm||'')!=='cleanup-20261027')return res.status(405).json({ok:false,error:'Not allowed'});
 try{
   const d=await query(R,{page_size:100,filter:{or:[
     {property:'MDB-ID',rich_text:{equals:'MDB-0673'}},
     {property:'MDB-ID',rich_text:{equals:'MDB-0674'}},
     {property:'MDB-ID',rich_text:{equals:'MDB-0675'}}
   ]}});
   const removed:any[]=[];
   for(const p of d.results||[]){
     const id=plain(p.properties?.['MDB-ID']).toUpperCase();
     const title=plain(p.properties?.['Recept']);
     if(!IDS.has(id)||!title.startsWith(PREFIX))continue;
     await notion('/pages/'+p.id,{method:'PATCH',body:JSON.stringify({in_trash:true})});
     removed.push({mdb:id,id:p.id});
   }

   const books=await query(B,{page_size:10,filter:{property:'Boeknr.',number:{equals:31}}});
   let activeCount:number|null=null;
   if((books.results||[]).length){
     const book=books.results[0];
     const rows=await query(R,{page_size:100,filter:{property:'Kookboek',relation:{contains:book.id}}});
     activeCount=(rows.results||[]).filter((p:any)=>!p.in_trash).length;
     await notion('/pages/'+book.id,{method:'PATCH',body:JSON.stringify({properties:{'Aantal recepten':{number:activeCount}}})});
   }
   return res.status(200).json({ok:true,removed,book31ActiveCount:activeCount});
 }catch(e:any){return res.status(500).json({ok:false,error:e?.message||String(e)})}
}
