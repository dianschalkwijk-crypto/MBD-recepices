const V='2026-03-11';
const R='9573eb17-06e1-49a7-80a9-aa03755ee3d3';
function token(){const t=process.env.NOTION_TOKEN&&process.env.NOTION_TOKEN.trim();if(!t)throw new Error('NOTION_TOKEN ontbreekt');return t}
async function notion(path:string,init:any={}){
  const r=await fetch('https://api.notion.com/v1'+path,{...init,headers:{Authorization:'Bearer '+token(),'Notion-Version':V,'Content-Type':'application/json',...(init.headers||{})}});
  const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.message||('Notion HTTP '+r.status));return d;
}
const read=(p:any)=>{
  if(!p)return'';if(typeof p.url==='string')return p.url;if(p.select?.name)return String(p.select.name);if(p.status?.name)return String(p.status.name);
  const a=p.title||p.rich_text||[];return a.map((x:any)=>x.plain_text||(x.text&&x.text.content)||'').join('');
};
const present=(x:any)=>x!==null&&x!==undefined&&String(x).trim()!=='';
const score=(p:any)=>{
  let s=0;for(const k of ['Recept','Publiekstitel','Ingrediënten','Bereidingswijze','Oorspronkelijke bron','Inhoudsbron','Categorie','Porties','Tijd','Bronplatform'])if(present(read(p?.[k])))s++;
  if(Array.isArray(p?.Kookboek?.relation)&&p.Kookboek.relation.length)s+=2;if(Array.isArray(p?.Foto?.files)&&p.Foto.files.length)s+=2;return s;
};
export default async function handler(req:any,res:any){
  res.setHeader('Cache-Control','no-store, no-cache, must-revalidate');res.setHeader('X-Content-Type-Options','nosniff');
  if(req.method!=='GET')return res.status(405).json({ok:false,error:'Method not allowed'});
  const requestUrl=new URL(String(req.url||'/'),'http://localhost');
  const mdb=String(requestUrl.searchParams.get('mdb')||'').toUpperCase().trim();if(!/^MDB-\d{4}$/.test(mdb))return res.status(400).json({ok:false,error:'Bad id'});
  try{
    const d=await notion('/data_sources/'+R+'/query',{method:'POST',body:JSON.stringify({page_size:20,filter:{property:'MDB-ID',rich_text:{equals:mdb}}})});
    const pages=(d.results||[]).filter((x:any)=>!x.in_trash);
    if(!pages.length)return res.status(404).json({ok:false,error:'Niet gevonden'});
    pages.sort((a:any,b:any)=>score(b.properties)-score(a.properties));
    const p=pages[0],q=p.properties||{};
    const title=read(q['Publiekstitel'])||read(q['Recept'])||mdb;
    const ingredients=read(q['Ingrediënten']),steps=read(q['Bereidingswijze']);
    const sourceURL=read(q['Oorspronkelijke bron']);
    const contentSourceURL=read(q['Inhoudsbron']);
    const files=Array.isArray(q?.Foto?.files)?q.Foto.files:[];
    return res.status(200).json({ok:true,duplicateCount:pages.length,recipe:{
      id:mdb,mdb,title,originalTitle:read(q['Recept'])||title,ingredients,steps,
      sourceURL,sourcePlatform:read(q['Bronplatform']),originalSourceRef:sourceURL,
      contentSourceURL,notionURL:p.url||'',category:read(q['Categorie']),
      portions:read(q['Porties']),time:read(q['Tijd']),
      photoURL:files.length?('/api/notion/photo?mdb='+encodeURIComponent(mdb)):'',
      hasPhoto:files.length>0,contentSynced:!!(ingredients&&steps)
    }});
  }catch(e:any){console.error('Notion full failed',e);return res.status(500).json({ok:false,error:e?.message||String(e)})}
}
