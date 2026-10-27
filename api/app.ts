export default function handler(_req:any,res:any){
 res.setHeader('Cache-Control','no-store, no-cache, must-revalidate');
 res.setHeader('Location','/index.html');
 return res.status(307).end();
}
