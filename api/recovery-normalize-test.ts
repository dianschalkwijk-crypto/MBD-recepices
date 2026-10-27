import normalizeHandler from './admin/normalize-recipes.js';

export default async function handler(req:any,res:any){
  if(process.env.VERCEL_ENV!=='preview')return res.status(404).json({ok:false});
  if(req.method!=='GET')return res.status(405).json({ok:false});
  const key=String(process.env.MBD_NORMALIZE_KEY||'');
  let code=200,data:any=null;
  const mock:any={
    status:(n:number)=>{code=n;return mock},
    setHeader:()=>mock,
    end:(v:any)=>{try{data=JSON.parse(String(v))}catch{data=v};return v}
  };
  await normalizeHandler({
    method:'POST',
    headers:{'x-mbd-key':key},
    body:{recipes:[{mdb:'MDB-0001',title:'Chicken pasta',ingredients:'200 g chicken, 100 g pasta',steps:'Cook pasta. Fry chicken.'}]}
  },mock);
  return res.status(200).json({ok:true,normalizerStatus:code,result:data});
}
