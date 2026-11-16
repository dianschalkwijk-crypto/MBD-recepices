// Local feature test server. Real read-only Supabase catalog; no production writes.
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import handler from '../api/notion/catalog.ts';
const root=process.cwd(),port=Number(process.env.MBD_REVIEW_PORT||4174);
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml'};
createServer(async(req,res)=>{
 const url=new URL(req.url,'http://127.0.0.1');
 if(url.pathname==='/api/notion/catalog'&&url.searchParams.get('sourceReview')==='1'){
  const response={setHeader:(...args)=>res.setHeader(...args),status(code){res.statusCode=code;return this;},json(value){res.setHeader('Content-Type','application/json');res.end(JSON.stringify(value));return this;}};
  try{await handler({method:req.method,query:{sourceReview:'1'}},response);}catch(e){res.statusCode=500;res.end(JSON.stringify({ok:false,error:e.message}));}return;
 }
 try{const path=resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));if(!path.startsWith(root+sep)||path.split(sep).some(p=>p.startsWith('.')))throw Error('Not found');const bytes=await readFile(path);res.setHeader('Content-Type',mime[extname(path)]||'application/octet-stream');res.end(bytes);}catch{res.statusCode=404;res.end('Not found');}
}).listen(port,'127.0.0.1');
