const BOOKS='7780dc25-2324-4c43-9457-944696411e18',RECIPES='9573eb17-06e1-49a7-80a9-aa03755ee3d3';
export const AH_BOOK_CAPACITY=30;
const plain=(p:any)=>(p?.title||p?.rich_text||[]).map((x:any)=>x.plain_text||x.text?.content||'').join('');
export function ahBookPart(name:string){const m=String(name||'').match(/^AH\s*[–-]\s*Allerhande\s*[·-]\s*Deel\s+([1-9]\d*)$/i);return m?Number(m[1]):null}
export async function readCookbooks(query:any){const pages:any[]=[];let cursor:string|null|undefined;do{const d:any=await query(BOOKS,{page_size:100,...(cursor?{start_cursor:cursor}:{})});if(!Array.isArray(d.results))throw Error('Kookboekencontrole mislukt');pages.push(...d.results.filter((p:any)=>!p.in_trash));cursor=d.has_more?d.next_cursor:null;if(d.has_more&&!cursor)throw Error('Kookboekencontrole is onvolledig');}while(cursor);return pages}
export async function countBookRecipes(query:any,id:string){let count=0,cursor:string|null|undefined;do{const d:any=await query(RECIPES,{page_size:100,filter:{property:'Kookboek',relation:{contains:id}},...(cursor?{start_cursor:cursor}:{})});if(!Array.isArray(d.results))throw Error('Boektelling mislukt');count+=d.results.filter((p:any)=>!p.in_trash).length;cursor=d.has_more?d.next_cursor:null;if(d.has_more&&!cursor)throw Error('Recepttelling voor kookboek is onvolledig')}while(cursor);return count}
export async function selectAHCookbook(query:any,notion:any,currentPage:any=null,hooks:{beforeCreate?:(part:number,number:number)=>Promise<void>}={}){
 const all=await readCookbooks(query),books=all.map(p=>({id:p.id,name:plain(p.properties?.Kookboek),number:p.properties?.['Boeknr.']?.number,part:ahBookPart(plain(p.properties?.Kookboek))})),ah=books.filter(b=>b.part!==null).sort((a,b)=>b.part!-a.part!);
 if(new Set(ah.map(b=>b.part)).size!==ah.length)throw Error('Meerdere AH-kookboeken met hetzelfde deelnummer; eerst controleren, geen nieuw boek gemaakt.');
 const current=(currentPage?.properties?.Kookboek?.relation||[]).map((r:any)=>r.id.replaceAll('-',''));
 const same=ah.find(b=>current.includes(b.id.replaceAll('-','')));if(same)return {...same,count:await countBookRecipes(query,same.id)};
 const latest=ah[0];if(latest){const count=await countBookRecipes(query,latest.id);if(count<AH_BOOK_CAPACITY)return {...latest,count};}
 const part=(latest?.part||0)+1,number=Math.max(0,...books.map(b=>Number(b.number)||0))+1,name='AH – Allerhande · Deel '+part;
 await hooks.beforeCreate?.(part,number);
 const created=await notion('/pages',{method:'POST',body:JSON.stringify({parent:{type:'data_source_id',data_source_id:BOOKS},properties:{'Kookboek':{title:[{type:'text',text:{content:name}}]},'Boeknr.':{number},'Status':{select:{name:'Actief'}},'Aantal recepten':{number:0}}})});
 if(!created.id)throw Error('Aanmaak AH-kookboek niet bevestigd; controleer de bestaande boeken voor hervatten.');
 if(latest)await notion('/pages/'+latest.id,{method:'PATCH',body:JSON.stringify({properties:{'Status':{select:{name:'Vol / gereed'}},'Aantal recepten':{number:await countBookRecipes(query,latest.id)}}})});
 return {id:created.id,name,number,part,count:0};
}
export async function refreshCookbookCounts(query:any,notion:any,ids:string[]){for(const id of [...new Set(ids)].filter(Boolean)){const count=await countBookRecipes(query,id);await notion('/pages/'+id,{method:'PATCH',body:JSON.stringify({properties:{'Aantal recepten':{number:count}}})})}}
