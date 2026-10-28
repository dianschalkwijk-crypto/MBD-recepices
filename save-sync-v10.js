(()=>{
 if(window.__mbdSaveSyncLoaderV30)return;window.__mbdSaveSyncLoaderV30=true;
 const load=(src,onload)=>{
  const s=document.createElement('script');s.async=false;s.src=src;if(onload)s.onload=onload;document.body.append(s);
 };
 load('/save-sync-original-v10.js?v=30',()=>{
  const files=[
   '/allergy-integration-v2.js?v=30',
   '/main-preferences-v1.js?v=30',
   '/week-select-fix-v1.js?v=30',
   '/friend-watch-v2.js?v=30',
   '/library-phase1-v1.js?v=30',
   '/account-library-backup-v1.js?v=30'
  ];
  let i=0;const next=()=>{if(i>=files.length)return;load(files[i++],next)};next();
 });
})();