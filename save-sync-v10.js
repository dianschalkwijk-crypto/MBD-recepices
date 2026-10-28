(()=>{
 if(window.__mbdSaveSyncLoaderV33)return;window.__mbdSaveSyncLoaderV33=true;
 const load=(src,onload)=>{
  const s=document.createElement('script');s.async=false;s.src=src;if(onload)s.onload=onload;document.body.append(s);
 };
 load('/save-sync-original-v10.js?v=33',()=>{
  const files=[
   '/allergy-integration-v2.js?v=33',
   '/main-preferences-v1.js?v=33',
   '/week-select-fix-v1.js?v=33',
   '/friend-watch-v2.js?v=33',
   '/library-phase1-v1.js?v=33',
   '/account-library-backup-v1.js?v=33'
  ];
  let i=0;const next=()=>{if(i>=files.length)return;load(files[i++],next)};next();
 });
})();