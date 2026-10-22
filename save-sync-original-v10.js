(()=>{
  if(window.__mbdSaveSyncV10)return;
  window.__mbdSaveSyncV10=true;

  let pendingPhoto=null;
  let busy=false;
  const $=s=>document.querySelector(s);

  async function post(url,body){
    const r=await fetch(url,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(body)
    });
    const d=await r.json().catch(()=>({}));
    if(!r.ok)throw new Error(d.message||d.error||("HTTP "+r.status));
    return d;
  }

  function addPhotoBox(){
    const card=$("#reviewCard");
    const btn=$("#saveRecipeBtn");
    if(!card||!btn||$("#mbdPhotoInput"))return;

    const box=document.createElement("div");
    box.id="mbdPhotoBox";
    box.style.cssText="margin:14px 0;padding:12px;border:1px solid #e8dfd8;border-radius:14px;background:#fbf7f3";
    box.innerHTML=
      "<label for='mbdPhotoInput' style='display:block;font-weight:700'>Receptfoto</label>"+
      "<input id='mbdPhotoInput' type='file' accept='image/*' style='display:block;width:100%;margin-top:8px'>"+
      "<img id='mbdPhotoPreview' alt='Voorbeeld receptfoto' style='display:none;width:112px;height:112px;object-fit:cover;border-radius:12px;margin-top:8px'>"+
      "<div id='mbdPhotoStatus' style='font-size:12px;margin-top:6px'>Optioneel · wordt opgeslagen in Notion → Foto.</div>";

    btn.before(box);

    $("#mbdPhotoInput").addEventListener("change",function(){
      const file=this.files&&this.files[0];
      const status=$("#mbdPhotoStatus");
      const preview=$("#mbdPhotoPreview");
      pendingPhoto=null;

      if(!file){
        preview.removeAttribute("src");
        preview.style.display="none";
        status.textContent="Optioneel · wordt opgeslagen in Notion → Foto.";
        return;
      }

      if(!file.type.startsWith("image/")){
        this.value="";
        preview.style.display="none";
        status.textContent="Kies een afbeeldingsbestand.";
        return;
      }

      const reader=new FileReader();
      reader.onerror=()=>status.textContent="Foto kon niet worden gelezen.";
      reader.onload=()=>{
        const image=new Image();
        image.onerror=()=>status.textContent="Foto kon niet worden verwerkt.";
        image.onload=()=>{
          const scale=Math.min(1,1600/Math.max(image.width,image.height));
          const canvas=document.createElement("canvas");
          canvas.width=Math.max(1,Math.round(image.width*scale));
          canvas.height=Math.max(1,Math.round(image.height*scale));
          canvas.getContext("2d").drawImage(image,0,0,canvas.width,canvas.height);
          const data=canvas.toDataURL("image/jpeg",0.82);

          pendingPhoto={
            filename:"receptfoto-"+Date.now()+".jpg",
            contentType:"image/jpeg",
            base64:data.split(",")[1]
          };

          preview.src=data;
          preview.style.display="block";
          status.textContent="Foto klaar om mee op te slaan.";
        };
        image.src=String(reader.result);
      };
      reader.readAsDataURL(file);
    });
  }

  function fingerprint(title,ingredients){
    try{
      if(typeof recipeFingerprint==="function")return recipeFingerprint(title,ingredients);
    }catch(_){}
    return (String(title||"")+"|"+String(ingredients||""))
      .toLowerCase().replace(/\s+/g," ").trim();
  }

  function localDuplicate(title,ingredients,sourceURL){
    try{
      if(!state||!Array.isArray(state.recipes))return null;
      const exact=sourceURL&&state.recipes.find(r=>r.sourceURL===sourceURL);
      const fp=fingerprint(title,ingredients);
      const fuzzy=state.recipes.find(r=>fingerprint(r.title,r.ingredients)===fp);
      return exact||fuzzy||null;
    }catch(_){
      return null;
    }
  }

  async function saveNow(event){
    if(busy)return;
    if(typeof currentDraft==="undefined"||!currentDraft)return;

    event.preventDefault();
    event.stopImmediatePropagation();

    const title=($("#reviewTitle")?.value||currentDraft.title||"").trim();
    const author=($("#reviewAuthor")?.value||"").trim();
    const ingredients=($("#reviewIngredients")?.value||"").trim();
    const steps=($("#reviewSteps")?.value||"").trim();
    const sourceURL=currentDraft.sourceURL||"";
    const duplicate=localDuplicate(title,ingredients,sourceURL);

    if(duplicate&&!confirm('Dit lijkt al op “'+duplicate.title+'”. Toch als apart recept opslaan?'))return;

    const btn=$("#saveRecipeBtn");
    const msg=$("#importMessage");
    const status=$("#mbdPhotoStatus");
    const oldText=btn.textContent;

    busy=true;
    btn.disabled=true;
    btn.textContent="Opslaan in Notion…";

    try{
      const data=await post("/api/notion/save",{
        title,
        author,
        ingredients,
        steps,
        sourceURL:sourceURL||null,
        collections:typeof selectedCollections!=="undefined"?[...selectedCollections]:[],
        warnings:currentDraft.warnings||[]
      });

      const mdb=String(
        data.mdb||data.mdbId||data.recipe?.mdb||data.recipe?.mdbId||""
      ).toUpperCase();

      if(!/^MDB-[0-9]{4,}$/.test(mdb)){
        throw new Error("Notion gaf geen MDB-nummer terug.");
      }

      let photoOK=false;
      let photoError="";

      if(pendingPhoto){
        if(status)status.textContent="Foto uploaden naar Notion…";
        try{
          await post("/api/notion/photo",{mdb,...pendingPhoto});
          photoOK=true;
        }catch(e){
          photoError=e?.message||"foto upload mislukt";
        }
      }

      const notionURL=data.notionURL||data.notionUrl||data.url||data.recipe?.notionURL||"";
      const bookName=data.book?.name||data.bookName||"";
      const bookNo=data.book?.number||data.bookNo||null;

      try{
        if(state&&Array.isArray(state.recipes)){
          state.recipes.unshift({
            id:typeof uid==="function"?uid():("local-"+Date.now()),
            mdb,
            title,
            originalTitle:title,
            author,
            ingredients,
            steps,
            sourceURL,
            contentURL:sourceURL,
            notionURL,
            category:"",
            cuisine:"",
            portions:"",
            time:"",
            book:bookName,
            bookNo,
            collections:typeof selectedCollections!=="undefined"?[...selectedCollections]:[],
            warnings:currentDraft.warnings||[],
            seeded:false,
            contentSynced:true,
            hasPhoto:photoOK,
            createdAt:new Date().toISOString()
          });
          if(typeof persist==="function")persist();
        }
      }catch(_){}

      currentDraft=null;
      pendingPhoto=null;

      $("#reviewCard")?.classList.add("hidden");
      if($("#sourceUrl"))$("#sourceUrl").value="";
      if($("#sourceText"))$("#sourceText").value="";
      if($("#mbdPhotoInput"))$("#mbdPhotoInput").value="";
      if($("#mbdPhotoPreview")){
        $("#mbdPhotoPreview").removeAttribute("src");
        $("#mbdPhotoPreview").style.display="none";
      }

      const message=photoError
        ?"✓ "+mdb+" opgeslagen in Notion. Foto niet opgeslagen: "+photoError
        :"✓ "+mdb+" opgeslagen in Notion"+(bookName?" · "+bookName:"")+(photoOK?" · foto opgeslagen":"");

      if(typeof showMessage==="function"&&msg){
        showMessage(msg,message,photoError?"warn":"ok");
      }else if(msg){
        msg.textContent=message;
      }

      if(typeof renderAll==="function")renderAll();
    }catch(e){
      const message="⚠️ Niet opgeslagen: "+(e?.message||e);
      if(typeof showMessage==="function"&&msg){
        showMessage(msg,message,"warn");
      }else if(msg){
        msg.textContent=message;
      }
      if(status)status.textContent="Niet opgeslagen. Probeer opnieuw.";
    }finally{
      btn.disabled=false;
      btn.textContent=oldText;
      busy=false;
    }
  }

  function install(){
    addPhotoBox();
    const btn=$("#saveRecipeBtn");
    if(!btn||btn.dataset.mbdNotionSync==="1")return;
    btn.dataset.mbdNotionSync="1";
    btn.addEventListener("click",saveNow,true);
  }

  let timer;
  new MutationObserver(()=>{
    clearTimeout(timer);
    timer=setTimeout(install,40);
  }).observe(document.body,{subtree:true,childList:true});

  setInterval(install,700);
  install();
})();