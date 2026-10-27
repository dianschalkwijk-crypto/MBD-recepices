import OpenAI from 'openai';

const env=((globalThis as any).process?.env||{});
function cleanJsonText(s:string){
 let t=String(s||'').trim();
 if(t.startsWith('```'))t=t.replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'');
 return t.trim();
}
function json(res:any,status:number,data:any){
 res.status(status).setHeader('Cache-Control','no-store');
 res.setHeader('Content-Type','application/json; charset=utf-8');
 return res.end(JSON.stringify(data));
}
export default async function handler(req:any,res:any){
 const selftest=process.env.VERCEL_ENV==='preview'&&req.method==='GET'&&String(req.query?.selftest||'')==='1';
 if(!selftest&&req.method!=='POST')return json(res,405,{ok:false,error:'method'});
 const access=String(env.MBD_NORMALIZE_KEY||'').trim();
 if(!access)return json(res,503,{ok:false,error:'normalizer_not_configured'});
 if(!selftest&&String(req.headers['x-mbd-key']||'')!==access)return json(res,403,{ok:false,error:'forbidden'});
 if(!env.OPENAI_API_KEY)return json(res,503,{ok:false,error:'openai_not_configured'});
 const recipes=selftest?[{mdb:'MDB-9999',title:'Chicken pasta',ingredients:'1 cup pasta\n1 tbsp olive oil',steps:'Cook pasta. Add olive oil.'}]:(Array.isArray(req.body?.recipes)?req.body.recipes:[]);
 if(!recipes.length||recipes.length>10)return json(res,400,{ok:false,error:'recipes must contain 1-10 items'});
 const input=recipes.map((r:any)=>({mdb:String(r.mdb||''),title:String(r.title||'').slice(0,500),ingredients:String(r.ingredients||'').slice(0,12000),steps:String(r.steps||'').slice(0,12000)}));
 const instructions='Je redigeert recepten voor een Nederlandse privé-receptenbibliotheek. Geef uitsluitend geldige JSON zonder markdown met vorm {"recipes":[{"mdb":"MDB-0001","is_recipe":true,"title":"...","ingredients":"...","steps":"...","notes":[]}]}. Behoud ieder MDB-nummer exact. Vertaal Engelse recepttekst naar natuurlijk Nederlands; het woord mealprep mag blijven staan. Corrigeer duidelijke encoding- en spelfouten. Verzin geen ontbrekende ingrediënten, hoeveelheden of bereidingsstappen. Houd ingrediënten en stappen inhoudelijk gelijk aan de bron. Zet is_recipe op false als de invoer geen werkelijk recept bevat. Gebruik notes voor onzekerheden of ontbrekende informatie.';
 try{
  const client=new OpenAI({apiKey:env.OPENAI_API_KEY});
  const completion=await client.chat.completions.create({
   model:env.OPENAI_MODEL||'gpt-5.6-luna',
   response_format:{type:'json_object'},
   messages:[{role:'system',content:instructions},{role:'user',content:JSON.stringify({recipes:input})}]
  });
  const raw=completion.choices[0]?.message?.content;
  if(!raw)throw new Error('Lege AI-respons');
  const out=JSON.parse(cleanJsonText(raw));
  if(!Array.isArray(out?.recipes))throw new Error('Ongeldig AI-formaat');
  const allowed=new Set(input.map((x:any)=>x.mdb));
  const cleaned=out.recipes.filter((x:any)=>allowed.has(String(x?.mdb||''))).map((x:any)=>({
   mdb:String(x.mdb),is_recipe:x.is_recipe!==false,title:String(x.title||'').slice(0,1000),
   ingredients:String(x.ingredients||'').slice(0,30000),steps:String(x.steps||'').slice(0,30000),
   notes:Array.isArray(x.notes)?x.notes.map(String).slice(0,20):[]
  }));
  return json(res,200,{ok:true,selftest,recipes:cleaned});
 }catch(e:any){
  console.error('Normalize recipes failed',e);
  return json(res,502,{ok:false,error:'normalize_failed',message:e?.message||String(e)});
 }
}
