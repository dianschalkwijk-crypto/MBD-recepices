import webpush from 'web-push';

const DB='https://ywsdubincfabjhvjqkot.supabase.co';
const PUB='sb_publishable_sIPgFRcpRiszmq8vuWLkAg_K-C0gzfF';
const SUBJECT='https://madebydian-recipes-dian.vercel.app/';

function keys(){
  const publicKey=String(process.env.MBD_VAPID_PUBLIC_KEY||'').trim();
  const privateKey=String(process.env.MBD_VAPID_PRIVATE_KEY||'').trim();
  return {publicKey,privateKey,enabled:!!publicKey&&!!privateKey};
}
function setup(){
  const k=keys();
  if(!k.enabled)throw new Error('Web Push is niet geconfigureerd');
  webpush.setVapidDetails(SUBJECT,k.publicKey,k.privateKey);
  return k;
}
function amsterdamNow(){
  const parts=new Intl.DateTimeFormat('en-CA',{
    timeZone:'Europe/Amsterdam',year:'numeric',month:'2-digit',day:'2-digit',
    hour:'2-digit',minute:'2-digit',hour12:false
  }).formatToParts(new Date());
  const v=(type:string)=>parts.find(p=>p.type===type)?.value||'';
  return {date:`${v('year')}-${v('month')}-${v('day')}`,hour:v('hour'),minute:v('minute')};
}
async function userFromToken(token:string){
  const r=await fetch(DB+'/auth/v1/user',{headers:{apikey:PUB,Authorization:'Bearer '+token}});
  if(!r.ok)return null;
  return r.json();
}
async function serverRpc(name:string,body:any){
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
async function testForUser(req:any,res:any){
  setup();
  const auth=String(req.headers.authorization||'');
  const token=auth.startsWith('Bearer ')?auth.slice(7).trim():'';
  if(!token)return res.status(401).json({ok:false,error:'Niet ingelogd'});
  const user=await userFromToken(token);
  if(!user?.id)return res.status(401).json({ok:false,error:'Sessie ongeldig'});
  const q=new URLSearchParams({
    select:'id,endpoint,p256dh,auth_key',
    enabled:'eq.true',
    user_id:'eq.'+user.id
  });
  const rr=await fetch(DB+'/rest/v1/mbd_push_subscriptions?'+q.toString(),{
    headers:{apikey:PUB,Authorization:'Bearer '+token}
  });
  if(!rr.ok)throw new Error('Abonnementen ophalen mislukt ('+rr.status+')');
  const rows:any[]=await rr.json();
  if(!rows.length)return res.status(404).json({ok:false,error:'Nog geen pushabonnement op dit apparaat'});
  let sent=0,failed=0;const errors:string[]=[];
  for(const row of rows.slice(0,10)){
    try{
      await webpush.sendNotification(
        {endpoint:row.endpoint,keys:{p256dh:row.p256dh,auth:row.auth_key}},
        JSON.stringify({
          title:'MadeByDian Recepten',
          body:'Testmelding gelukt. Je ochtendmelding kan op dit apparaat worden ontvangen.',
          url:'/',
          tag:'mbd-push-test'
        }),
        {TTL:3600,urgency:'normal'}
      );
      sent++;
    }catch(e:any){
      failed++;
      const status=Number(e?.statusCode||e?.status||0);
      errors.push(String(status||e?.message||'send failed'));
      if(status===404||status===410){
        await fetch(DB+'/rest/v1/mbd_push_subscriptions?id=eq.'+encodeURIComponent(row.id),{
          method:'DELETE',headers:{apikey:PUB,Authorization:'Bearer '+token}
        }).catch(()=>{});
      }
    }
  }
  return res.status(failed&&sent===0?502:200).json({ok:sent>0,sent,failed,errors});
}
async function morning(res:any){
  const t=amsterdamNow();
  if(t.hour!=='08'||t.minute!=='40'){
    return res.status(200).json({ok:true,skipped:true,reason:'outside_window',localTime:t.hour+':'+t.minute});
  }
  setup();
  const rows:any[]=await serverRpc('mbd_push_server_claim',{p_local_date:t.date});
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
      await serverRpc('mbd_push_server_result',{p_id:row.id,p_success:true,p_error:null});
    }catch(e:any){
      failed++;
      const status=Number(e?.statusCode||e?.status||0);
      await serverRpc('mbd_push_server_result',{
        p_id:row.id,p_success:false,p_error:String(status||e?.message||'send failed')
      }).catch(()=>{});
    }
  }
  return res.status(200).json({ok:true,date:t.date,sent,failed,claimed:(rows||[]).length});
}
export default async function handler(req:any,res:any){
  res.setHeader('Cache-Control','no-store');
  const action=String(req.query?.action||req.body?.action||'config');
  try{
    if(req.method==='GET'){
      const t=amsterdamNow(),k=keys();
      return res.status(200).json({
        ok:true,enabled:k.enabled,publicKey:k.publicKey,
        time:'08:40',timezone:'Europe/Amsterdam',
        localDate:t.date,localTime:t.hour+':'+t.minute
      });
    }
    if(req.method!=='POST')return res.status(405).json({ok:false,error:'Method not allowed'});
    if(action==='test')return await testForUser(req,res);
    if(action==='morning')return await morning(res);
    return res.status(400).json({ok:false,error:'Onbekende pushactie'});
  }catch(e:any){
    console.error('Push action failed',action,e);
    return res.status(500).json({ok:false,error:e?.message||String(e)});
  }
}
