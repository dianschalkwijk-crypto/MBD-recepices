import {createHash} from 'node:crypto';
const V='2026-03-11';
const R='9573eb17-06e1-49a7-80a9-aa03755ee3d3';
const B='7780dc25-2324-4c43-9457-944696411e18';
const DB='https://ywsdubincfabjhvjqkot.supabase.co';
const PUB='sb_publishable_sIPgFRcpRiszmq8vuWLkAg_K-C0gzfF';
const MAX_PER_BOOK=30;
const FIRST_NEW_BOOK=31;

function token(){
  const t=process.env.NOTION_TOKEN&&process.env.NOTION_TOKEN.trim();
  if(!t)throw new Error('NOTION_TOKEN ontbreekt');
  return t;
}
export async function notion(path:string,init:any={}){
  const r=await fetch('https://api.notion.com/v1'+path,{
    ...init,
    headers:{
      Authorization:'Bearer '+token(),
      'Notion-Version':V,
      'Content-Type':'application/json',
      ...(init.headers||{})
    }
  });
  const d=await r.json().catch(()=>({}));
  if(!r.ok){const e:any=new Error(d.message||('Notion HTTP '+r.status));e.status=r.status;e.code=d.code;throw e}
  return d;
}
export const query=(id:string,body:any)=>notion('/data_sources/'+id+'/query',{method:'POST',body:JSON.stringify(body)});
export const rt=(s:string)=>{
  const v=String(s||'').trim();if(!v)return[];
  const a:any[]=[];for(let i=0;i<v.length;i+=1800)a.push({type:'text',text:{content:v.slice(i,i+1800)}});
  return a;
};
export const tt=(s:string)=>[{type:'text',text:{content:String(s||'Naamloos recept').slice(0,1900)}}];
const plain=(p:any)=>p&&((p.title)||(p.rich_text)||[]).map((x:any)=>x.plain_text||(x.text&&x.text.content)||'').join('')||'';
const num=(p:any)=>typeof p?.number==='number'?p.number:null;
const platform=(u:string)=>{
  try{const h=new URL(u).hostname.toLowerCase();if(h.includes('instagram'))return'Instagram';if(h.includes('tiktok'))return'TikTok';if(h.includes('facebook'))return'Facebook';if(h.includes('pinterest')||h==='pin.it')return'Pinterest';if(h.includes('youtube')||h.includes('youtu.be'))return'YouTube';return'Website'}catch{return''}
};
const safeText=(v:any,max=2000)=>String(v||'').trim().slice(0,max);
const allowedKinds=new Set(['Kookboek','Screenshot','Eigen recept','Instagram','TikTok','Facebook','Pinterest','Website','YouTube','Anders','Social / link']);
// These checks are a preflight only. Cross-instance duplicate prevention must
// also be enforced in the database; a browser check is never an allocation lock.
export function canonicalSource(raw:any){
  try{
    const u=new URL(String(raw||'').trim());
    if(!['http:','https:'].includes(u.protocol)||u.username||u.password)return '';
    const ah=u.hostname.replace(/^www\./,'')==='ah.nl'?u.pathname.match(/^\/(?:r\/|allerhande\/recept\/R-R)(\d+)(?:\/|$)/)?.[1]:null;if(ah)return 'ah.nl/recipe/'+ah;
    u.hash='';u.hostname=u.hostname.toLowerCase().replace(/^www\./,'');
    for(const key of [...u.searchParams.keys()])if(/^(utm_.+|fbclid|igshid|igsh|gclid|si)$/i.test(key))u.searchParams.delete(key);
    u.searchParams.sort();
    return u.hostname+(u.port?':'+u.port:'')+u.pathname.replace(/\/+$/,'')+u.search;
  }catch{return ''}
}
const normalizedText=(v:any)=>String(Array.isArray(v)?v.join('\n'):v||'').normalize('NFKC').toLocaleLowerCase('nl').replace(/\s+/g,' ').trim();
export function recipeFingerprint(recipe:any){
  const parts=[recipe?.title,recipe?.ingredients,recipe?.steps].map(normalizedText);
  return parts.every(Boolean)?JSON.stringify(parts):'';
}
export async function readCatalog(){
  const rows:any[]=[];
  for(let offset=0;;){
    const r=await fetch(DB+'/rest/v1/mbd_catalog?select=mdb,recipe&order=mdb.asc&offset='+offset+'&limit=500',{
      headers:{apikey:PUB,Prefer:'count=exact'},cache:'no-store'
    });
    if(!r.ok)throw new Error('Receptcontrole mislukt: Supabase HTTP '+r.status);
    const page=await r.json();
    if(!Array.isArray(page))throw new Error('Receptcontrole gaf geen geldige catalogus');
    rows.push(...page);offset+=page.length;
    const totalPart=r.headers.get('content-range')?.split('/')[1];
    const total=totalPart&&/^\d+$/.test(totalPart)?Number(totalPart):null;
    if(total!==null&&offset>=total)return rows;
    if(!page.length){if(total!==null&&offset<total)throw new Error('Receptcontrole is onvolledig');return rows}
    // Continue even for short pages: the server may enforce a smaller row cap.
    if(offset>100000)throw new Error('Receptcontrole overschrijdt de veilige paginalimiet');
  }
}
export function findDuplicate(rows:any[],draft:any){
  const url=canonicalSource(draft.sourceURL),fingerprint=recipeFingerprint(draft);
  return rows.find(row=>{
    const r=row?.recipe;
    if(!r||r.syncStatus==='duplicate-quarantined')return false;
    return (url&&[r.sourceURL,r.contentURL,r.originalSourceURL].some(s=>canonicalSource(s)===url))||
      (fingerprint&&recipeFingerprint(r)===fingerprint);
  });
}
export async function reserveMDB(draft:any){
  const secret=process.env.MBD_SUPABASE_WRITE_SECRET?.trim();
  if(!secret)throw new Error('MBD_SUPABASE_WRITE_SECRET ontbreekt');
  const hash=(text:string)=>createHash('sha256').update(text).digest('hex');
  const source=canonicalSource(draft.sourceURL);
  const r=await fetch(DB+'/rest/v1/rpc/mbd_claim_recipe_save',{
    method:'POST',headers:{apikey:PUB,'Content-Type':'application/json'},
    body:JSON.stringify({p_secret:secret,p_fingerprint:hash(recipeFingerprint(draft)),p_source_key:source?hash(source):null}),cache:'no-store'
  });
  if(!r.ok)throw new Error('MDB-reservering mislukt: HTTP '+r.status);
  const claim=await r.json();
  if(!/^MDB-\d{4,}$/.test(claim?.mdb)||!['claimed','processing','stored'].includes(claim?.status))throw new Error('Ongeldige MDB-reservering');
  return claim;
}
async function createBook(number:number){
  const name='Boek '+number+' · Nieuwe recepten';
  const p=await notion('/pages',{method:'POST',body:JSON.stringify({
    parent:{type:'data_source_id',data_source_id:B},
    properties:{
      'Kookboek':{title:tt(name)},
      'Boeknr.':{number},
      'Status':{select:{name:'Actief'}},
      'Aantal recepten':{number:0}
    }
  })});
  return{id:p.id,name,number,count:0};
}
async function bookCount(bookId:string){
  let count=0,cursor:string|undefined;
  do{const d:any=await query(R,{page_size:100,filter:{property:'Kookboek',relation:{contains:bookId}},...(cursor?{start_cursor:cursor}:{})});count+=(d.results||[]).filter((p:any)=>!p.in_trash).length;cursor=d.has_more?d.next_cursor:undefined;if(d.has_more&&!cursor)throw Error('Boektelling onvolledig')}while(cursor);return count;
}
async function readAllBooks(){let all:any[]=[],cursor:string|undefined;do{const d:any=await query(B,{page_size:100,...(cursor?{start_cursor:cursor}:{})});all.push(...(d.results||[]).filter((p:any)=>!p.in_trash));cursor=d.has_more?d.next_cursor:undefined;if(d.has_more&&!cursor)throw Error('Kookboekencontrole onvolledig')}while(cursor);return all}

export async function activeBook(){
  const all=await readAllBooks(),nextNumber=Math.max(FIRST_NEW_BOOK-1,...all.map((p:any)=>num(p.properties?.['Boeknr.'])||0))+1;
  const active=all.filter((p:any)=>p.properties?.Status?.select?.name==='Actief'&&!/^AH\s*[–-]\s*Allerhande\s*[·-]\s*Deel\s+[1-9]\d*$/i.test(plain(p.properties?.Kookboek))).sort((a:any,b:any)=>(num(b.properties?.['Boeknr.'])||0)-(num(a.properties?.['Boeknr.'])||0));
  if(!active.length)return{createNumber:nextNumber};
  const highest=num(active[0].properties?.['Boeknr.'])||FIRST_NEW_BOOK,candidates=active.filter((p:any)=>(num(p.properties?.['Boeknr.'])||FIRST_NEW_BOOK)===highest);
  const counted=await Promise.all(candidates.map(async(p:any)=>({p,count:await bookCount(p.id)})));counted.sort((a,b)=>b.count-a.count);const {p,count}=counted[0];
  const name=plain(p.properties?.Kookboek)||('Boek '+highest+' · Nieuwe recepten');
  return count<MAX_PER_BOOK?{id:p.id,name,number:highest,count}:{createNumber:nextNumber,closeId:p.id,count};
}

export async function materializeBook(plan:any){
  if(!plan.createNumber)return plan;
  if(plan.closeId)await notion('/pages/'+plan.closeId,{method:'PATCH',body:JSON.stringify({properties:{'Status':{select:{name:'Vol / gereed'}},'Aantal recepten':{number:plan.count}}})});
  return createBook(plan.createNumber);
}
async function supabaseWrite(mdb:string,recipe:any){
  const secret=process.env.MBD_SUPABASE_WRITE_SECRET&&process.env.MBD_SUPABASE_WRITE_SECRET.trim();
  if(!secret)throw new Error('MBD_SUPABASE_WRITE_SECRET ontbreekt');
  const r=await fetch(DB+'/rest/v1/rpc/mbd_catalog_server_write',{
    method:'POST',
    headers:{apikey:PUB,'Content-Type':'application/json'},
    body:JSON.stringify({p_secret:secret,p_mdb:mdb,p_recipe:recipe,p_expected_updated_at:null})
  });
  const d=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(d.message||('Supabase write HTTP '+r.status));
  if(!d?.ok) {const e:any=new Error('Supabase conflict: '+(d?.reason||'onbekend'));e.conflict=true;e.details=d;throw e}
  return d;
}
async function confirmStored(mdb:string,recipe:any){
  const r=await fetch(DB+'/rest/v1/mbd_catalog?select=mdb,recipe&mdb=eq.'+encodeURIComponent(mdb)+'&limit=1',{
    headers:{apikey:PUB},cache:'no-store'
  });
  if(!r.ok)throw new Error('Teruglezen van opgeslagen recept mislukt');
  const rows=await r.json();
  if(!Array.isArray(rows)||rows[0]?.mdb!==mdb||recipeFingerprint(rows[0]?.recipe)!==recipeFingerprint(recipe)||rows[0]?.recipe?.notionURL!==recipe.notionURL)
    throw new Error('Opgeslagen recept nog niet bevestigd');
}
async function trash(pageId:string){
  try{await notion('/pages/'+pageId,{method:'PATCH',body:JSON.stringify({in_trash:true})});return true}
  catch{console.error('Rollback Notion mislukt');return false}
}

export default async function handler(req:any,res:any){
  res.setHeader('Cache-Control','no-store, no-cache, must-revalidate');
  if(req.method==='GET'){
    if(req.query?.verify==='1'){
      try{
        const r=await fetch(DB+'/rest/v1/rpc/mbd_claim_recipe_save',{method:'POST',headers:{apikey:PUB,'Content-Type':'application/json'},
          body:JSON.stringify({p_secret:process.env.MBD_SUPABASE_WRITE_SECRET?.trim()||'',p_fingerprint:null,p_source_key:null}),cache:'no-store'});
        const check=await r.json().catch(()=>({}));
        if(!r.ok||check.status!=='authorized')return res.status(502).json({ok:false,writeAuthorized:false,error:'Schrijftoegang niet bevestigd'});
        await query(R,{page_size:1});await query(B,{page_size:1});
        return res.status(200).json({ok:true,writeAuthorized:true,notionReadable:true,mutationPerformed:false});
      }catch{return res.status(502).json({ok:false,error:'Opslagverbinding niet bevestigd',mutationPerformed:false})}
    }
    return res.status(200).json({ok:true,notionConfigured:!!process.env.NOTION_TOKEN,supabaseWriteConfigured:!!process.env.MBD_SUPABASE_WRITE_SECRET,firstNewBook:FIRST_NEW_BOOK,maxPerBook:MAX_PER_BOOK});
  }
  if(req.method!=='POST')return res.status(405).json({ok:false,error:'Method not allowed'});
  try{
    const b=req.body||{};
    const title=String(b.title||'').trim();
    const ingredients=String(b.ingredients||'').trim();
    const steps=String(b.steps||'').trim();
    const sourceURL=b.sourceURL?String(b.sourceURL).trim():'';
    const author=String(b.author||'').trim();
    const collections=Array.isArray(b.collections)?b.collections.map(String):[];
    const warnings=Array.isArray(b.warnings)?b.warnings.map(String):[];
    const extra=(b.extra&&typeof b.extra==='object'&&!Array.isArray(b.extra))?b.extra:{};
    const sourceKind=allowedKinds.has(String(extra.sourceKind||''))?String(extra.sourceKind):'Social / link';
    const sourceAuthor=safeText(extra.sourceAuthor||author,500);
    const method=safeText(extra.method,120);
    const category=safeText(extra.category,200);
    const mainIngredient=safeText(extra.mainIngredient,300);
    const portions=safeText(extra.portions,100);
    const sourceNotes=safeText(extra.sourceNotes,2000);
    const bookPageRaw=safeText(extra.bookPage,30);
    const bookPage=/^\d+(?:\s*[-–,]\s*\d+)*$/.test(bookPageRaw)?bookPageRaw:'';
    const sourcePlatform=sourceURL?platform(sourceURL):(sourceKind==='Social / link'?'':sourceKind);
    if(!title)return res.status(400).json({ok:false,error:'Titel ontbreekt'});
    if(!ingredients||!steps)return res.status(400).json({ok:false,error:'Ingrediënten en bereidingsstappen zijn verplicht.'});
    if(title.length>1000||ingredients.length>60000||steps.length>60000)return res.status(400).json({ok:false,error:'Recept is te groot'});
    if(sourceURL){try{const u=new URL(sourceURL);if(u.protocol!=='https:'&&u.protocol!=='http:')throw 0}catch{return res.status(400).json({ok:false,error:'Bronlink is ongeldig'})}}

    // Fail before any number allocation or Notion mutation if prerequisites or
    // the read-only duplicate check are unavailable.
    token();
    if(!process.env.MBD_SUPABASE_WRITE_SECRET?.trim())throw new Error('MBD_SUPABASE_WRITE_SECRET ontbreekt');
    const duplicate=findDuplicate(await readCatalog(),{title,ingredients,steps,sourceURL});
    if(duplicate)return res.status(409).json({ok:false,code:'duplicate_recipe',mdb:duplicate.mdb,
      notionURL:duplicate.recipe.notionURL||'',error:'Dit recept bestaat al als '+duplicate.mdb+'. Er is geen nieuw nummer aangemaakt.'});
    const bookPlan=await activeBook();
    const claim=await reserveMDB({title,ingredients,steps,sourceURL});
    const mdb=claim.mdb;
    if(claim.status!=='claimed')return res.status(409).json({ok:false,code:claim.status==='stored'?'duplicate_recipe':'save_in_progress',mdb,
      reconciliationRequired:claim.status==='processing',error:'Dit recept heeft al nummer '+mdb+'. Controleer de bestaande opslag; er is geen nieuw nummer aangemaakt.'});
    let book:any;
    try{book=await materializeBook(bookPlan)}
    catch{return res.status(502).json({ok:false,code:'save_outcome_unknown',mdb,reconciliationRequired:true,rolledBackNotion:false,
      error:'De opslagstatus van '+mdb+' is onzeker. Controleer dit nummer voordat je opnieuw opslaat.'})}
    const props:any={
      'Recept':{title:tt(title)},
      'Publiekstitel':{rich_text:rt(title)},
      'MDB-ID':{rich_text:rt(mdb)},
      'Ingrediënten':{rich_text:rt(ingredients)},
      'Bereidingswijze':{rich_text:rt(steps)},
      'Kookboek':{relation:[{id:book.id}]},
      'Boeknr.':{number:book.number}
    };
    if(sourceURL){props['Oorspronkelijke bron']={url:sourceURL};props['Inhoudsbron']={url:sourceURL}}
    if(sourcePlatform)props['Bronplatform']={rich_text:rt(sourcePlatform)};
    if(category)props['Categorie']={rich_text:rt(category)};
    if(portions)props['Porties']={rich_text:rt(portions)};
    if(bookPage&&/^\d+$/.test(bookPage))props['Pagina']={number:Number(bookPage)};

    let page:any;
    try{page=await notion('/pages',{method:'POST',body:JSON.stringify({parent:{type:'data_source_id',data_source_id:R},properties:props})})}
    catch{return res.status(502).json({ok:false,code:'save_outcome_unknown',mdb,reconciliationRequired:true,rolledBackNotion:false,
      error:'De opslagstatus van '+mdb+' is onzeker. Controleer dit nummer voordat je opnieuw opslaat.'})}
    const notionURL=String(page.url||'');
    const recipe={
      id:mdb,mdb,title,originalTitle:title,author:sourceAuthor||author,ingredients,steps,
      sourceURL,contentURL:sourceURL,notionURL,
      sourceKind,sourceAuthor,platform:sourcePlatform,method,category,cuisine:'',mainIngredient,
      book:(sourceKind==='Kookboek'&&sourceAuthor)?sourceAuthor:book.name,bookNo:sourceKind==='Kookboek'?null:book.number,bookPage,sourceNotes,notionBook:book.name,notionBookNo:book.number,
      portions,time:'',collections,warnings,seeded:false,
      contentSynced:!!(ingredients&&steps),hasPhoto:false,createdAt:new Date().toISOString(),
      syncedFrom:'App → Notion → Supabase'
    };

    let sw:any;
    try{sw=await supabaseWrite(mdb,recipe);await confirmStored(mdb,recipe)}
    catch(e:any){
      // Only an explicit database rejection proves this write did not commit.
      // A timeout/invalid response can occur AFTER commit. Never trash its
      // Notion page or report a verified rollback in that ambiguous case.
      if(e?.conflict){
        const rolledBackNotion=await trash(page.id);
        return res.status(409).json({ok:false,error:e.message,rolledBackNotion,reconciliationRequired:!rolledBackNotion,mdb,notionURL});
      }
      return res.status(502).json({ok:false,code:'save_outcome_unknown',
        error:'Opslagstatus van '+mdb+' is nog onzeker. Niet opnieuw uploaden: controleer dit nummer eerst in Notion en de receptenapp.',
        rolledBackNotion:false,reconciliationRequired:true,mdb,notionURL});
    }

    try{await notion('/pages/'+book.id,{method:'PATCH',body:JSON.stringify({properties:{'Aantal recepten':{number:book.count+1}}})})}
    catch(e){console.warn('Boekteller kon niet worden bijgewerkt',e)}

    return res.status(200).json({ok:true,mdb,notionURL,book:{name:book.name,number:book.number},recipe,supabase:sw});
  }catch(e:any){
    console.error('Notion/Supabase save failed',e);
    return res.status(e?.status&&e.status<500?e.status:500).json({ok:false,error:e?.message||String(e),code:e?.code||null});
  }
}
