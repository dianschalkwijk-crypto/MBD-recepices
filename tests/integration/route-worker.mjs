// A separate server instance. All upstream requests are redirected to the isolated fixture bridge.
import handler from '../../api/notion/save.ts';
const input=JSON.parse(await new Promise(resolve=>{let text='';process.stdin.on('data',c=>text+=c);process.stdin.on('end',()=>resolve(text));}));
const bridge=new URL(input.bridge);if(bridge.hostname!=='127.0.0.1')throw Error('Integration bridge must be loopback');
const nativeFetch=globalThis.fetch;
process.env.NOTION_TOKEN='integration-notion-fixture';process.env.MBD_SUPABASE_WRITE_SECRET='mbd-local-integration-secret';
globalThis.fetch=async(url,options={})=>{
 const upstream=new URL(url);if(!['ywsdubincfabjhvjqkot.supabase.co','api.notion.com'].includes(upstream.hostname))throw Error('Unexpected upstream; real network blocked');
 return nativeFetch(bridge,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:String(url),method:options.method||'GET',body:options.body?JSON.parse(options.body):null,instance:process.pid})});
};
const res={statusCode:200,setHeader(){return this;},status(code){this.statusCode=code;return this;},json(data){this.data=data;return this;}};
await handler({method:input.method||'POST',body:input.draft,query:input.query||{}},res);
process.stdout.write(JSON.stringify({instance:process.pid,status:res.statusCode,data:res.data}));
