(()=>{
 if(window.__mbdSaveSyncLoaderV35)return;window.__mbdSaveSyncLoaderV35=true;
 const load=(src,onload)=>{
  const s=document.createElement('script');s.async=false;s.src=src;if(onload)s.onload=onload;document.body.append(s);
 };
 load('/save-sync-original-v10.js?v=35',()=>{
  const files=[
   '/allergy-integration-v2.js?v=35',
   '/main-preferences-v1.js?v=35',
   '/week-select-fix-v1.js?v=35',
   '/friend-watch-v2.js?v=35',
   '/library-phase1-v1.js?v=35',
   '/account-library-backup-v1.js?v=35'
  ];
  let i=0;const next=()=>{if(i>=files.length)return;load(files[i++],next)};next();
 });
})();