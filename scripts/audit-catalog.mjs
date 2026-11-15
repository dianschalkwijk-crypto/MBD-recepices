// Read-only: no database or Notion writes, allocation, repair, or renumbering.
import {canonicalSource,recipeFingerprint,readCatalog} from '../api/notion/save.ts';
import {readFile,writeFile} from 'node:fs/promises';

export function auditCatalog(rows){
  if(!Array.isArray(rows))throw new Error('Expected catalog rows');
  const ids=new Map(),links=new Map(),contents=new Map();
  const report={checkedAt:new Date().toISOString(),totalRows:rows.length,canonicalRecipes:0,quarantined:0,highestMDB:null,invalidMDB:[],conflictingMDB:[],identityMismatches:[],sameSource:[],sameContent:[],incomplete:[],withoutNotion:[]};
  let highest=-1;
  for(const row of rows){
    const mdb=String(row?.mdb||'');
    if(!/^MDB-\d{4,}$/.test(mdb))report.invalidMDB.push(mdb);
    else if(Number(mdb.slice(4))>highest){highest=Number(mdb.slice(4));report.highestMDB=mdb}
    if(ids.has(mdb))report.conflictingMDB.push(mdb);ids.set(mdb,true);
    const r=row?.recipe;
    if(r?.mdb&&r.mdb!==mdb)report.identityMismatches.push({mdb,recipeMDB:r.mdb});
    if(r?.syncStatus==='duplicate-quarantined'){report.quarantined++;continue}
    report.canonicalRecipes++;
    if(!r||!String(r.title||'').trim()||!String(r.ingredients||'').trim()||!String(r.steps||'').trim())report.incomplete.push(mdb);
    if(!r?.notionURL)report.withoutNotion.push(mdb);
    for(const key of new Set([r?.sourceURL,r?.contentURL,r?.originalSourceURL].map(canonicalSource).filter(Boolean))){
      if(links.has(key))report.sameSource.push({mdb,existingMDB:links.get(key)});else links.set(key,mdb);
    }
    const fingerprint=recipeFingerprint(r);
    if(fingerprint){if(contents.has(fingerprint))report.sameContent.push({mdb,existingMDB:contents.get(fingerprint)});else contents.set(fingerprint,mdb)}
  }
  return report;
}

if(import.meta.url===new URL(process.argv[1],'file:').href){
  try{
    const input=process.argv.indexOf('--input');
    const rows=input>=0?JSON.parse(await readFile(process.argv[input+1],'utf8')):await readCatalog();
    const report={...auditCatalog(rows),source:input>=0?'local-file':'live-supabase-read-only'};
    const output=process.argv.indexOf('--output');
    if(output>=0)await writeFile(process.argv[output+1],JSON.stringify(report,null,2)+'\n');
    console.log(JSON.stringify(report,null,2));
    if(report.invalidMDB.length||report.conflictingMDB.length||report.identityMismatches.length)process.exitCode=1;
  }catch(e){console.error('Audit not completed:',e.message);process.exitCode=1}
}
