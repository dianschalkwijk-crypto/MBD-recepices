import saveHandler from './save';

export default async function handler(req:any,res:any){
  res.setHeader('Cache-Control','no-store');
  if(process.env.VERCEL_ENV!=='preview')return res.status(404).json({ok:false,error:'Not found'});
  if(req.method!=='GET')return res.status(405).json({ok:false,error:'Method not allowed'});

  let statusCode=200;
  let payload:any=null;
  const mockRes={
    setHeader:(_k:string,_v:string)=>{},
    status:(n:number)=>{statusCode=n;return mockRes},
    json:(v:any)=>{payload=v;return v}
  };
  const marker='MBD E2E TEST 2026-10-27 '+Date.now();
  await saveHandler({
    method:'POST',
    body:{
      title:marker,
      author:'Systeemtest',
      ingredients:'1 testingrediënt',
      steps:'1. Teststap uitvoeren.',
      sourceURL:null,
      collections:['E2E-test'],
      warnings:['Tijdelijk systeemtestrecord; verwijderen na verificatie.']
    }
  },mockRes);
  return res.status(statusCode).json({test:true,marker,result:payload});
}
