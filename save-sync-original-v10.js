(()=>{
  if(window.__mbdSaveSyncV10)return;
  window.__mbdSaveSyncV10=true;

  let pendingPhoto=null;
  let busy=false;
  const $=s=>document.querySelector(s);
  function sourceKindFromUrl(raw){
    try{const h=new URL(raw).hostname.toLowerCase();if(h.includes("instagram"))return"Instagram";if(h.includes("tiktok"))return"TikTok";if(h.includes("facebook"))return"Facebook";if(h.includes("pinterest")||h==="pin.it")return"Pinterest";if(h.includes("youtube")||h.includes("youtu.be"))return"YouTube";return"Website"}catch{return"Social / link"}
  }
  function likelyEnglishRecipe(...values){
    const s=values.join(" ").toLowerCase();
    const en=(s.match(/\b(chicken|beef|pork|flour|tablespoons?|teaspoons?|bake|cook|stir|onion|garlic|butter|cheese|rice|cream|eggs?|salt|pepper|serve|minutes|with|and|into)\b/g)||[]).length;
    const nl=(s.match(/\b(kip|rund|varken|bloem|eetlepels?|theelepels?|bak|kook|roer|ui|knoflook|boter|kaas|rijst|room|eieren?|zout|peper|serveer|minuten|met|en|in)\b/g)||[]).length;
    return en>=5&&en>nl+2;
  }

  async function post(url,body){
    const r=await fetch(url,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(body)
    });
    const d=await r.json().catch(()=>({}));
    if(!r.ok||d.ok===false)throw Object.assign(new Error(d.message||d.error||("HTTP "+r.status)),{reconciliationRequired:!!d.reconciliationRequired,mdb:d.mdb});
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

    $("#mbdPhotoInput").addEventListener("change",async function(){
      const photoDraftId=editingDraftId;
      const photoIsCurrent=()=>editingDraftId===photoDraftId;
      let file=this.files&&this.files[0];
      const status=$("#mbdPhotoStatus");
      const preview=$("#mbdPhotoPreview");
      if(file&&file.type.startsWith('image/')&&globalThis.MBDPhotoCrop){
        try{file=await MBDPhotoCrop.choose(file);if(!file)return;}
        catch{if(photoIsCurrent())status.textContent='Foto kon niet worden bijgesneden. Bestaande invoer blijft bewaard.';return;}
      }
      if(photoIsCurrent())pendingPhoto=null;

      if(!file){
        updateSavedDraft(photoDraftId,{photo:null});
        if(!photoIsCurrent())return;
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
      reader.onerror=()=>{if(photoIsCurrent())status.textContent="Foto kon niet worden gelezen.";};
      reader.onload=()=>{
        const image=new Image();
        image.onerror=()=>{if(photoIsCurrent())status.textContent="Foto kon niet worden verwerkt.";};
        image.onload=()=>{
          const scale=Math.min(1,1600/Math.max(image.width,image.height));
          const canvas=document.createElement("canvas");
          canvas.width=Math.max(1,Math.round(image.width*scale));
          canvas.height=Math.max(1,Math.round(image.height*scale));
          canvas.getContext("2d").drawImage(image,0,0,canvas.width,canvas.height);
          const data=canvas.toDataURL("image/jpeg",0.82);

          const photo={
            filename:"receptfoto-"+Date.now()+".jpg",
            contentType:"image/jpeg",
            base64:data.split(",")[1]
          };

          updateSavedDraft(photoDraftId,{photo});
          if(!photoIsCurrent())return;
          pendingPhoto=photo;
          preview.src=data;
          preview.style.display="block";
          status.textContent="Foto klaar om mee op te slaan.";
        };
        image.src=String(reader.result);
      };
      reader.readAsDataURL(file);
    });
  }

  function saveAnotherButton(){
    let b=$("#mbdSaveAnother");
    if(b)return b;
    const msg=$("#importMessage");
    if(!msg)return null;
    b=document.createElement("button");
    b.id="mbdSaveAnother";
    b.type="button";
    b.className="secondary";
    b.textContent="➕ Nog een recept opslaan";
    b.style.display="none";
    b.style.marginTop="10px";
    b.onclick=()=>{
      try{currentDraft=null}catch(_){}
      pendingPhoto=null;
      if($("#sourceUrl"))$("#sourceUrl").value="";
      if($("#sourceText"))$("#sourceText").value="";
      if($("#reviewTitle"))$("#reviewTitle").value="";
      if($("#reviewAuthor"))$("#reviewAuthor").value="";
      if($("#reviewPortions"))$("#reviewPortions").value="";
      if($("#reviewIngredients"))$("#reviewIngredients").value="";
      if($("#reviewSteps"))$("#reviewSteps").value="";
      if($("#mbdPhotoInput"))$("#mbdPhotoInput").value="";
      if($("#mbdPhotoPreview")){$("#mbdPhotoPreview").removeAttribute("src");$("#mbdPhotoPreview").style.display="none";}
      $("#reviewCard")?.classList.add("hidden");
      b.style.display="none";
      const view=$("#mbdViewSaved");if(view)view.style.display="none";
      if(typeof setScreen==="function")setScreen("inbox");
      if(typeof showMessage==="function"&&msg)showMessage(msg,"Klaar voor het volgende recept. Plak een link, tekst of voeg een foto toe.","ok");
      $("#sourceUrl")?.focus();
      window.scrollTo({top:0,behavior:"smooth"});
    };
    msg.after(b);
    return b;
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
    if(busy){event.preventDefault();event.stopImmediatePropagation();return;}
    if(typeof currentDraft==="undefined"||!currentDraft)return;

    event.preventDefault();
    event.stopImmediatePropagation();

    const title=($("#reviewTitle")?.value||currentDraft.title||"").trim();
    const author=($("#reviewAuthor")?.value||"").trim();
    const portions=($("#reviewPortions")?.value||currentDraft.portions||"").trim();
    const ingredients=($("#reviewIngredients")?.value||"").trim();
    const steps=($("#reviewSteps")?.value||"").trim();
    const sourceURL=currentDraft.sourceURL||"";
    if(likelyEnglishRecipe(title,ingredients,steps)){
      const msg=$("#importMessage");
      if(typeof showMessage==="function"&&msg)showMessage(msg,"Nog niet opgeslagen: de recepttekst lijkt nog grotendeels Engels. Laat de vertaling opnieuw uitvoeren of corrigeer de tekst eerst.","warn");
      return;
    }
    const duplicate=currentDraft.savedMdb?null:localDuplicate(title,ingredients,sourceURL);

    if(duplicate){
      const message='Dit recept bestaat al'+(duplicate.mdb?' als '+duplicate.mdb:'')+'. Open het bestaande recept om het aan te passen.';
      if(typeof showMessage==='function')showMessage($('#importMessage'),message,'warn');
      return;
    }

    if(!title||!ingredients||!steps){showMessage($('#importMessage'),'Vul titel, ingrediënten en bereidingsstappen in. Je concept blijft bewaard.','warn');return;}
    if(currentDraft.reconciliationRequired){showMessage($('#importMessage'),'Controleer eerst de opslagstatus van '+currentDraft.savedMdb+'. Je concept blijft bewaard.','warn');return;}
    if(typeof saveLocalDraft==='function'&&!saveLocalDraft(true))return;
    const submittedId=editingDraftId;
    const submitted=structuredClone(currentDraft);
    const submittedPhoto=submitted.photo||null;
    const submittedCollections=[...selectedCollections];
    const isCurrent=()=>editingDraftId===submittedId;
    const patchSubmission=patch=>{Object.assign(submitted,patch);updateSavedDraft(submittedId,patch);};
    const btn=$("#saveRecipeBtn");
    const msg=$("#importMessage");
    const status=$("#mbdPhotoStatus");
    let reconciliationRequired=false;

    busy=true;window.mbdSavingDraftId=submittedId;
    updateReviewLocks();
    btn.disabled=true;
    btn.textContent="Opslaan in Notion…";

    try{
      const data=submitted.savedMdb?{mdb:submitted.savedMdb,notionURL:submitted.savedNotionURL}:await post("/api/notion/save",{
        title,
        author,
        ingredients,
        steps,
        sourceURL:sourceURL||null,
        collections:submittedCollections,
        warnings:submitted.warnings||[],
        extra:{
          sourceKind:submitted.sourceKind||sourceKindFromUrl(sourceURL),
          sourceAuthor:author,
          method:submitted.method||"",
          category:submitted.category||"",
          portions,sourceText:submitted.sourceText||"",sourceMetadata:submitted.sourceMetadata||{}
        }
      });

      const mdb=String(
        data.mdb||data.mdbId||data.recipe?.mdb||data.recipe?.mdbId||""
      ).toUpperCase();

      if(!/^MDB-[0-9]{4,}$/.test(mdb)){
        throw new Error("Notion gaf geen MDB-nummer terug.");
      }

      patchSubmission({savedMdb:mdb,savedNotionURL:data.notionURL||submitted.savedNotionURL||''});
      let photoOK=false;
      let photoError="";

      if(submittedPhoto){
        if(isCurrent()&&status)status.textContent="Foto uploaden naar Notion…";
        try{
          await post("/api/notion/photo",{mdb,...submittedPhoto});
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
          if(!state.recipes.some(r=>r.mdb===mdb))state.recipes.unshift({
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
            category:submitted.category||"",
            cuisine:"",
            portions,
            time:"",
            book:bookName,
            bookNo,
            sourceKind:submitted.sourceKind||sourceKindFromUrl(sourceURL),
            sourceAuthor:author,
            collections:submittedCollections,
            warnings:submitted.warnings||[],
            seeded:false,
            contentSynced:true,
            hasPhoto:photoOK,
            createdAt:new Date().toISOString()
          });
          if(typeof persist==="function")persist();
        }
      }catch(_){}

      if(photoError){
        showMessage(msg,'Recept opgeslagen als '+mdb+'. Foto niet opgeslagen: '+photoError+'. Je concept en foto blijven bewaard; probeer de foto opnieuw.','warn');
        if(isCurrent())fillReview();
        btn.textContent='Foto opnieuw opslaan';return;
      }
      const viewUnchanged=isCurrent();
      await retireDraft(submittedId);
      if(viewUnchanged){
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
      }
      const message=photoError
        ?"✅ Recept opgeslagen · "+mdb+". Foto niet opgeslagen: "+photoError
        :"✅ Recept opgeslagen · "+mdb+(bookName?" · "+bookName:"")+(photoOK?" · foto opgeslagen":"");

      if(typeof showMessage==="function"&&msg){
        showMessage(msg,message,photoError?"warn":"ok");
      }else if(msg){
        msg.textContent=message;
      }

      const again=saveAnotherButton();if(again)again.style.display="block";
      let view=$("#mbdViewSaved");
      if(!view&&again){
        view=document.createElement("button");view.id="mbdViewSaved";view.type="button";view.className="secondary";view.textContent="Bekijk opgeslagen recept";view.style.marginTop="8px";again.insertAdjacentElement("afterend",view);
      }
      if(view){
        view.style.display="block";
        view.onclick=()=>{
          const found=state?.recipes?.find?.(r=>String(r.mdb||"").toUpperCase()===mdb);
          if(typeof setScreen==="function")setScreen("recipes");
          if(found&&typeof showRecipeDetails==="function")setTimeout(()=>showRecipeDetails(found.id),80);
        };
      }
      if(typeof renderAll==="function")renderAll();
    }catch(e){
      reconciliationRequired=!!e?.reconciliationRequired;
      if(reconciliationRequired)patchSubmission({reconciliationRequired:true,savedMdb:e.mdb});
      const message=(reconciliationRequired?"⚠️ Controle nodig: ":"⚠️ Niet opgeslagen: ")+(e?.message||e);
      if(typeof showMessage==="function"&&msg){
        showMessage(msg,message,"warn");
      }else if(msg){
        msg.textContent=message;
      }
      if(isCurrent()&&status)status.textContent=reconciliationRequired?"Controleer eerst de opslagstatus van "+e.mdb+". Niet opnieuw uploaden.":"Recept niet opgeslagen: "+(e?.message||e)+". Je invoer en gekozen foto zijn behouden.";
    }finally{
      busy=false;window.mbdSavingDraftId=null;
      updateReviewLocks();
    }
  }

  function install(){
    addPhotoBox();
    saveAnotherButton();
    const btn=$("#saveRecipeBtn");
    if(!btn||btn.dataset.mbdNotionSync==="1")return;
    btn.dataset.mbdNotionSync="1";
    btn.addEventListener("click",saveNow,true);
  }

  document.addEventListener('mbd:draft-opened',()=>{
    pendingPhoto=currentDraft?.photo||null;
    const input=$('#mbdPhotoInput'),preview=$('#mbdPhotoPreview'),status=$('#mbdPhotoStatus');
    if(input)input.value='';
    if(preview){if(pendingPhoto){preview.src='data:'+pendingPhoto.contentType+';base64,'+pendingPhoto.base64;preview.style.display='block';}else{preview.removeAttribute('src');preview.style.display='none';}}
    if(status)status.textContent=pendingPhoto?'Foto klaar om mee op te slaan.':'Optioneel · wordt opgeslagen in Notion → Foto.';
  });

  let timer;
  new MutationObserver(()=>{
    clearTimeout(timer);
    timer=setTimeout(install,40);
  }).observe(document.body,{subtree:true,childList:true});

  setInterval(install,700);
  install();
})();