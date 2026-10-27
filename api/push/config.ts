export default function handler(req:any,res:any){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='GET')return res.status(405).json({ok:false,error:'Method not allowed'});
  const publicKey=String(process.env.MBD_VAPID_PUBLIC_KEY||'').trim();
  return res.status(200).json({
    ok:true,
    enabled:!!publicKey,
    publicKey,
    time:'08:40',
    timezone:'Europe/Amsterdam'
  });
}
