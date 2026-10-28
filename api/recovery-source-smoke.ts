import sourceHandler from './recipes/source.js';

function mock(){
 let statusCode=200,body:any=null;
 const res:any={setHeader:()=>res,status:(n:number)=>{statusCode=n;return res},json:(v:any)=>{body=v;return v}};
 return {res,get:()=>({statusCode,body})};
}
async function run(url:string){
 const m=mock();
 await sourceHandler({method:'POST',body:{url}},m.res);
 const x=m.get();
 return {status:x.statusCode,ok:x.statusCode===200,sourceType:x.body?.sourceType||null,title:x.body?.title||null,textLength:String(x.body?.sharedText||x.body?.text||'').length,message:x.body?.message||null};
}
export default async function handler(req:any,res:any){
 if(process.env.VERCEL_ENV!=='preview')return res.status(404).json({ok:false});
 if(req.method!=='GET')return res.status(405).json({ok:false});
 const website=await run('https://sterkindekeuken.nl/big-mac-burrito');
 const instagram=await run('https://www.instagram.com/reel/DPV8gO9jKBt/');
 return res.status(200).json({ok:true,website,instagram});
}
