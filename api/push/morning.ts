import webpush from 'web-push';

const DB='https://ywsdubincfabjhvjqkot.supabase.co';
const PUB='sb_publishable_sIPgFRcpRiszmq8vuWLkAg_K-C0gzfF';
const SUBJECT='https://madebydian-recipes-dian.vercel.app/';

function amsterdamNow(){
  const parts=new Intl.DateTimeFormat('en-CA',{
    timeZone:'Europe/Amsterdam',year:'numeric',month:'2-digit',day:'2-digit',
    hour:'2-digit',minute:'2-digit',hour12:false
  }).formatToParts(new Date());
  const v=(type:string)=>parts.find(p=>p.type===type)?.value||'';
  return {date:`${v('year')}-${v('month')}-${v('day')}`,hour:v('hour'),minute:v('minute')};
}
async function rpc(name:string,body:any){
  const secret=String(process.env.MBD_SUPABASE_WRITE_SECRET||'').trim();
  if(!secret)throw new Error('Serververbinding ontbreekt');
  const r=await fetch(DB+'/rest/v1/rpc/'+name,{
    method:'POST',
    headers:{apikey:PUB,'Content-Type':'application/json'},
    body:JSON.stringify({...body,p_secret:secret})
  });
  const d=await r.json().catch(()=>null);
  if(!r.ok)throw new Error((d&&d.message)||('Supabase '+r.status));
  return d;
}
export default async function handler(req:any,res:any){
  res.setHeader('Cache-Control','no-store');
  if(req.method==='GET'){
    const t=amsterdamNow();
    return res.status(200).json({
      ok:true,
      configured:!!process.env.MBD_VAPID_PUBLIC_KEY&&!!process.env.MBD_VAPID_PRIVATE_KEY&&!!process.env.MBD_SUPABASE_WRITE_SECRET,
      timezone:'Europe/Amsterdam',
      localDate:t.date,
      localTime:t.hour+':'+t.minute,
      sendTime:'08:40'
    });
  }
  if(req.method!=='POST')return res.status(405).json({ok:false,error:'Method not allowed'});
  try{
    const t=amsterdamNow();
    if(t.hour!=='08'||t.minute!=='40')return res.status(200).json({ok:true,skipped:true,reason:'outside_window',localTime:t.hour+':'+t.minute});

    const publicKey=String(process.env.MBD_VAPID_PUBLIC_KEY||'').trim();
    const privateKey=String(process.env.MBD_VAPID_PRIVATE_KEY||'').trim();
    if(!publicKey||!privateKey)throw new Error('Web Push is niet geconfigureerd');
    webpush.setVapidDetails(SUBJECT,publicKey,privateKey);

    const rows:any[]=await rpc('mbd_push_server_claim',{p_local_date:t.date});
    let sent=0,failed=0;
    for(const row of rows||[]){
      try{
        await webpush.sendNotification(
          {endpoint:row.endpoint,keys:{p256dh:row.p256dh,auth:row.auth_key}},
          JSON.stringify({
            title:'MadeByDian Recepten',
            body:'Goedemorgen. Bekijk je planning en recepten voor vandaag.',
            url:'/',
            tag:'mbd-morning-'+t.date
          }),
          {TTL:7200,urgency:'normal'}
        );
        sent++;
        await rpc('mbd_push_server_result',{p_id:row.id,p_success:true,p_error:null});
      }catch(e:any){
        failed++;
        const status=Number(e?.statusCode||e?.status||0);
        await rpc('mbd_push_server_result',{
          p_id:row.id,p_success:false,p_error:String(status||e?.message||'send failed')
        }).catch(()=>{});
      }
    }
    return res.status(200).json({ok:true,date:t.date,sent,failed,claimed:(rows||[]).length});
  }catch(e:any){
    console.error('Morning push failed',e);
    return res.status(500).json({ok:false,error:e?.message||String(e)});
  }
}
