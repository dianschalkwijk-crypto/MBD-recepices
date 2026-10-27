import webpush from 'web-push';

const DB='https://ywsdubincfabjhvjqkot.supabase.co';
const PUB='sb_publishable_sIPgFRcpRiszmq8vuWLkAg_K-C0gzfF';
const SUBJECT='https://madebydian-recipes-dian.vercel.app/';

function configured(){
  const publicKey=String(process.env.MBD_VAPID_PUBLIC_KEY||'').trim();
  const privateKey=String(process.env.MBD_VAPID_PRIVATE_KEY||'').trim();
  if(!publicKey||!privateKey)throw new Error('Web Push is niet geconfigureerd');
  webpush.setVapidDetails(SUBJECT,publicKey,privateKey);
}
async function userFromToken(token:string){
  const r=await fetch(DB+'/auth/v1/user',{headers:{apikey:PUB,Authorization:'Bearer '+token}});
  if(!r.ok)return null;
  return r.json();
}
export default async function handler(req:any,res:any){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='POST')return res.status(405).json({ok:false,error:'Method not allowed'});
  try{
    configured();
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

    let sent=0,failed=0;
    const errors:string[]=[];
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
            method:'DELETE',
            headers:{apikey:PUB,Authorization:'Bearer '+token}
          }).catch(()=>{});
        }
      }
    }
    return res.status(failed&&sent===0?502:200).json({ok:sent>0,sent,failed,errors});
  }catch(e:any){
    console.error('Push test failed',e);
    return res.status(500).json({ok:false,error:e?.message||String(e)});
  }
}
