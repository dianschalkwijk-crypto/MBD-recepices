const V='2026-03-11';
const R='9573eb17-06e1-49a7-80a9-aa03755ee3d3';
const B='7780dc25-2324-4c43-9457-944696411e18';
function token(){const t=process.env.NOTION_TOKEN?.trim();if(!t)throw new Error('NOTION_TOKEN ontbreekt');return t}
async function api(path:string,body:any){
 const r=await fetch('https://api.notion.com/v1'+path,{method:'POST',headers:{Authorization:'Bearer '+token(),'Notion-Version':V,'Content-Type':'application/json'},body:JSON.stringify(body)});
 const d=await r.json().catch(()=>({}));if(!r.ok){const e:any=new Error(d?.message||('Notion HTTP '+r.status));e.status=r.status;e.code=d?.code;throw e}return d;
}
const plain=(p:any)=>(p&&((p.title)||(p.rich_text))||[]).map((x:any)=>x?.plain_text||(x?.text&&x.text.content)||'').join('');
const norm=(s:string)=>String(s||'').replace(/-/g,'').toLowerCase();
async function all(id:string,filter:any=null){let a:any[]=[],c:any;do{const b:any={page_size:100};if(filter)b.filter=filter;if(c)b.start_cursor=c;const d=await api('/data_sources/'+id+'/query',b);a=a.concat(d.results||[]);c=d.has_more?d.next_cursor:null}while(c);return a}
export default async function handler(req:any,res:any){
 res.setHeader('Cache-Control','no-store, no-cache, must-revalidate');
 if(req.method!=='GET')return res.status(405).json({ok:false,error:'Method not allowed'});
 try{
  const books=await all(B),bm:any={};
  for(const p of books)bm[norm(p.id)]={name:plain(p.properties?.Kookboek),number:p.properties?.['Boeknr.']?.number??null};
  const pages=await all(R,{property:'MDB-ID',rich_text:{is_not_empty:true}});
  const items=pages.filter((p:any)=>!p.in_trash).map((p:any)=>{
   const q=p.properties||{},rel=Array.isArray(q?.Kookboek?.relation)?q.Kookboek.relation:[],bk=rel.length?bm[norm(rel[0]?.id)]:null,mdb=plain(q['MDB-ID']).toUpperCase();
   return{mdb,title:plain(q['Publiekstitel'])||plain(q.Recept)||mdb,book:bk?.name||'',bookNo:q['Boeknr.']?.number??bk?.number??null,notionURL:p.url||'',hasPhoto:Array.isArray(q?.Foto?.files)&&q.Foto.files.length>0};
  }).filter((x:any)=>/^MDB-\d{4}$/.test(x.mdb));
  return res.status(200).json({ok:true,items});
 }catch(e:any){return res.status(e?.status&&e.status<500?e.status:500).json({ok:false,error:e?.message||String(e),code:e?.code||null})}
}
