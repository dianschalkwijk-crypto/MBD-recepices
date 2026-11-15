globalThis.MBDPhotoCrop={async choose(file){
 const url=URL.createObjectURL(file),image=new Image();image.src=url;
 try{
  await image.decode();
  return await new Promise(resolve=>{
   const dialog=document.createElement('dialog');dialog.style.cssText='width:min(92vw,600px);max-height:90vh;overflow:auto;border:1px solid #e5d8ce;border-radius:16px;padding:18px';
   dialog.innerHTML='<h2>Foto bijsnijden</h2><p>Kies het zichtbare deel en controleer het voorbeeld.</p><canvas aria-label="Voorbeeld van uitsnede" style="display:block;max-width:100%;max-height:40vh;margin:auto"></canvas>';
   const controls={};
   for(const [key,label,value] of [['x','Links',0],['y','Boven',0],['w','Breedte',100],['h','Hoogte',100]]){
    const row=document.createElement('label');row.style.display='block';row.textContent=label;
    const input=document.createElement('input');input.type='range';input.min=key==='w'||key==='h'?'5':'0';input.max=key==='x'||key==='y'?'95':'100';input.value=String(value);input.setAttribute('aria-label',label);input.style.width='100%';controls[key]=input;row.append(input);dialog.append(row);input.oninput=draw;
   }
   const canvas=dialog.querySelector('canvas');
   function draw(){
    const x=Number(controls.x.value)/100,y=Number(controls.y.value)/100;
    const w=Math.min(Number(controls.w.value)/100,1-x),h=Math.min(Number(controls.h.value)/100,1-y);
    const sw=Math.max(1,Math.round(image.naturalWidth*w)),sh=Math.max(1,Math.round(image.naturalHeight*h));
    const scale=Math.min(1,1600/Math.max(sw,sh));canvas.width=Math.max(1,Math.round(sw*scale));canvas.height=Math.max(1,Math.round(sh*scale));
    canvas.getContext('2d').drawImage(image,Math.round(x*image.naturalWidth),Math.round(y*image.naturalHeight),sw,sh,0,0,canvas.width,canvas.height);
   }
   const confirm=document.createElement('button');confirm.type='button';confirm.textContent='Gebruik uitsnede';
   const cancel=document.createElement('button');cancel.type='button';cancel.textContent='Annuleren';cancel.style.marginLeft='8px';
   const finish=result=>{dialog.close();dialog.remove();resolve(result)};
   confirm.onclick=()=>canvas.toBlob(blob=>{if(blob)finish(new File([blob],file.name.replace(/\.[^.]+$/,'')+'-uitsnede.jpg',{type:'image/jpeg'}));},'image/jpeg',.85);
   cancel.onclick=()=>finish(null);dialog.oncancel=event=>{event.preventDefault();finish(null)};
   dialog.append(confirm,cancel);document.body.append(dialog);draw();dialog.showModal();
  });
 }finally{URL.revokeObjectURL(url)}
}};
// The scanner's existing file handlers receive only confirmed crops.
document.addEventListener('change',async event=>{
 if(event.target?.id!=='photo'||event.mbdCropped)return;
 const input=event.target,files=[...(input.files||[])];if(!files.length)return;
 event.stopImmediatePropagation();
 try{
  const cropped=[];for(const file of files){const result=await MBDPhotoCrop.choose(file);if(!result){input.value='';return;}cropped.push(result);}
  const transfer=new DataTransfer();cropped.forEach(file=>transfer.items.add(file));input.files=transfer.files;
  const next=new Event('change',{bubbles:true});next.mbdCropped=true;input.dispatchEvent(next);
 }catch{const status=document.querySelector('#status');if(status)status.textContent='Foto kon niet worden bijgesneden. Je bestaande invoer blijft bewaard.';}
},true);
