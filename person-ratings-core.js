(()=>{'use strict';
const valid=mdb=>/^MDB-\d{4,}$/.test(mdb);
const object=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};
function merge(remote,local,dirty={}){const result=structuredClone(object(local));for(const [mdb,people] of Object.entries(object(remote))){if(!valid(mdb))continue;result[mdb]||={};for(const [person,fields] of Object.entries(object(people))){if(['__proto__','constructor','prototype'].includes(person))continue;result[mdb][person]={...object(result[mdb][person]),...object(fields),...object(dirty[mdb]?.[person])}}}return result}
function changes(before,after){const out={};for(const [mdb,people] of Object.entries(object(after))){if(!valid(mdb))continue;for(const [person,fields] of Object.entries(object(people))){if(['__proto__','constructor','prototype'].includes(person))continue;for(const [field,value] of Object.entries(object(fields))){if(!['stars','name','note'].includes(field)||JSON.stringify(before?.[mdb]?.[person]?.[field])===JSON.stringify(value))continue;if(field==='stars'&&(!Number.isInteger(value)||value<0||value>5))continue;out[mdb]||={};out[mdb][person]||={};out[mdb][person][field]=value}}}return out}
function patch(remote,dirty){const result=structuredClone(object(remote));for(const [person,fields] of Object.entries(object(dirty))){if(['__proto__','constructor','prototype'].includes(person))continue;result[person]={...object(result[person]),...object(fields)}}return result}
globalThis.MBDPersonRatings={valid,merge,changes,patch};
})();
