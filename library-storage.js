/* Transparent, lossless fallback for the one large recipe-library key only.
   Personal data, unrelated storage keys and existing backups are never deleted. */
(()=>{'use strict';
if(globalThis.MBDLibraryStorage||!globalThis.Storage||!globalThis.LZString)return;
const key='madebydian-recipes-filled-copy-v0.5',prefix='MBD-LZ1:',get=Storage.prototype.getItem,set=Storage.prototype.setItem;
const status={compressed:false};
function decode(value){if(!value?.startsWith(prefix))return value;const raw=LZString.decompressFromUTF16(value.slice(prefix.length));if(!raw)throw Error('Bibliotheekopslag kon niet worden gelezen; de opgeslagen kopie is behouden.');JSON.parse(raw);status.compressed=true;return raw}
Storage.prototype.getItem=function(k){const value=get.call(this,k);return String(k)===key?decode(value):value};
Storage.prototype.setItem=function(k,value){if(String(k)!==key)return set.call(this,k,value);const raw=String(value),previous=get.call(this,key);const compressed=previous?.startsWith(prefix);if(!compressed){try{return set.call(this,key,raw)}catch(err){if(!(err?.name==='QuotaExceededError'||err?.code===22||err?.code===1014))throw err}}
const packed=LZString.compressToUTF16(raw);if(LZString.decompressFromUTF16(packed)!==raw)throw Error('Opslagcontrole mislukt; bestaande bibliotheek behouden.');set.call(this,key,prefix+packed);status.compressed=true;
};
globalThis.MBDLibraryStorage=status;
})();
