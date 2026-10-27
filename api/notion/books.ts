const NOTION_VERSION='2026-03-11';
const COOKBOOK_DS='7780dc25-2324-4c43-9457-944696411e18';
function token(){const t=process.env.NOTION_TOKEN?.trim();if(!t)throw new Error('NOTION_TOKEN ontbreekt');return t}
async function notion(path:string,init:any={}){
 const r=await fetch('https://api.notion.com/v1'+path,{...init,headers:{Authorization:'Bearer '+token(),'Notion-Version':NOTION_VERSION,'Content-Type':'application/json',...(init.headers||{})}});
 const d=await r.json().catch(()=>({}));if(!r.ok){const e:any=new Error(d?.message||('Notion HTTP '+r.status));e.status=r.status;e.code=d?.code;throw e}return d;
}
async function queryDS(id:string,body:any){return notion('/data_sources/'+id+'/query',{method:'POST',body:JSON.stringify(body||{})})}
function plain(p:any){const a=p?.title||p?.rich_text||[];return a.map((x:any)=>x?.plain_text||x?.text?.content||'').join('')}
function num(p:any){return typeof p?.number==='number'?p.number:null}
function sel(p:any){return p?.select?.name||''}
export default async function handler(req:any,res:any){
 res.setHeader('Cache-Control','no-store, no-cache, must-revalidate');
 if(req.method!=='GET')return res.status(405).json({ok:false,error:'Method not allowed'});
 try{
  let all:any[]=[],cursor:any;
  do{const body:any={page_size:100,sorts:[{property:'Boeknr.',direction:'ascending'}]};if(cursor)body.start_cursor=cursor;const q=await queryDS(COOKBOOK_DS,body);all=all.concat(q.results||[]);cursor=q.has_more?q.next_cursor:undefined;}while(cursor);
  const books=all.map((p:any)=>{const rel=p.properties?.Recepten;return{id:p.id,name:plain(p.properties?.Kookboek),number:num(p.properties?.['Boeknr.']),status:sel(p.properties?.Status),storedCount:num(p.properties?.['Aantal recepten'])||0,relationVisible:Array.isArray(rel?.relation)?rel.relation.length:0,relationHasMore:!!rel?.has_more}});
  return res.status(200).json({ok:true,books});
 }catch(e:any){return res.status(e?.status&&e.status<500?e.status:500).json({ok:false,error:e?.message||String(e),code:e?.code||null})}
}
