import OpenAI from "openai";

function looksEnglish(value:any){
 const s=(typeof value==="string"?value:JSON.stringify(value||"")).toLowerCase();
 const en=(s.match(/\b(chicken|beef|pork|flour|cup|cups|tablespoon|tablespoons|teaspoon|teaspoons|bake|cook|fry|add|mix|stir|minutes|onion|garlic|butter|cheese|rice|cream|eggs?|salt|pepper|serve|until|with|and)\b/g)||[]).length;
 const nl=(s.match(/\b(kip|rund|varken|bloem|eetlepel|theelepel|bak|kook|voeg|meng|roer|minuten|ui|knoflook|boter|kaas|rijst|room|eieren?|zout|peper|serveer|tot|met|en)\b/g)||[]).length;
 return en>=3&&en>nl;
}
async function translateRecognition(ai:OpenAI,result:any){
 const completion=await ai.chat.completions.create({
  model:process.env.OPENAI_MODEL||"gpt-4.1-mini",response_format:{type:"json_object"},messages:[
   {role:"system",content:"Vertaal alleen de menselijk leesbare tekstvelden van dit fotoherkennings-JSON naar natuurlijk Nederlands. Vertaal title, ingredients, steps, notes, alternatives en mainIngredient. Behoud confidence en imageType exact. Gebruik voor method alleen Airfryer, Oven, Pan, Koken of Overig; voor category alleen Ontbijt, Lunch, Avondeten, Snack of Bijgerecht. Behoud book als eigennaam en bookPage exact. Verzin niets. Antwoord uitsluitend als JSON."},
   {role:"user",content:JSON.stringify(result)}
  ]
 });
 const raw=completion.choices[0]?.message?.content;if(!raw)return result;
 try{return {...result,...JSON.parse(raw),confidence:result.confidence,imageType:result.imageType,book:result.book,bookPage:result.bookPage}}catch{return result}
}

export default async function handler(req:any,res:any){
 if(req.method!=="POST")return res.status(405).json({error:"Methode niet toegestaan"});
 const {image,hint}=req.body||{};
 if(typeof image!=="string"||!/^data:image\/(jpeg|png|webp);base64,/.test(image)||image.length>9000000)return res.status(400).json({error:"Upload een JPG, PNG of WebP kleiner dan ongeveer 6 MB."});
 if(!process.env.OPENAI_API_KEY)return res.status(503).json({error:"Fotoherkenning is nog niet geconfigureerd."});
 const typeHint=hint==="recipe_page"?"Behandel de afbeelding als receptpagina en lees uitsluitend zichtbare tekst.":hint==="food_photo"?"Behandel de afbeelding als foto van een bereid gerecht. Maak alleen een voorzichtig voorstel en benoem onzekerheid.":"Bepaal eerst zelf of dit een receptpagina, een foto van een bereid gerecht of iets onduidelijks is.";
 try{
  const ai=new OpenAI({apiKey:process.env.OPENAI_API_KEY});
  const completion=await ai.chat.completions.create({
   model:process.env.OPENAI_MODEL||"gpt-5.6-luna",
   response_format:{type:"json_object"},
   messages:[
    {role:"system",content:"Analyseer de afbeelding als mogelijk recept of gerecht. Antwoord volledig in natuurlijk Nederlands als JSON met: title (string), ingredients (array strings), steps (array strings), confidence (low/medium/high), notes (string), imageType (recipe_page, food_photo of unclear), alternatives (array met maximaal 3 korte mogelijke gerechtstitels, alleen bij twijfel; anders leeg), method (Airfryer, Oven, Pan, Koken of Overig), category (Ontbijt, Lunch, Avondeten, Snack of Bijgerecht), mainIngredient (string), bookPage (alleen duidelijk zichtbaar paginanummer, anders leeg), book (alleen als boeknaam zichtbaar, anders leeg). Bij een receptpagina: gebruik uitsluitend daadwerkelijk zichtbare ingrediënten en instructies en verzin niets, maar vertaal titel, ingrediëntnamen, opmerkingen en bereidingsstappen naar natuurlijk Nederlands wanneer de zichtbare bron een andere taal gebruikt. Behoud hoeveelheden, merknamen en betekenis exact. Zoek paginanummers onderaan of bovenaan de pagina, ook in een gekleurd rondje. Verwar paginanummers niet met bereidingstijden of hoeveelheden. Bij een foto van bereid eten zonder recepttekst: maak een plausibel voorstel, maar vermeld in notes duidelijk dat hoeveelheden en samenstelling onzeker zijn. Geef bij lage of middelhoge zekerheid 2 of 3 korte, duidelijk verschillende mogelijke gerechtstitels in alternatives. Als niet duidelijk is wat er staat, kies imageType unclear en geef zo mogelijk 2 of 3 mogelijke titels in alternatives, maar laat ingrediënten en stappen leeg of beperkt in plaats van te gokken."},
    {role:"user",content:[{type:"text",text:typeHint},{type:"image_url",image_url:{url:image,detail:"high"}}]}
   ]
  });
  let result=JSON.parse(completion.choices[0]?.message?.content||"{}");
  result=await translateRecognition(ai,result);
  const imageType=["recipe_page","food_photo","unclear"].includes(String(result.imageType))?String(result.imageType):"unclear";
  const alternatives=Array.isArray(result.alternatives)?result.alternatives.map(String).map((x:string)=>x.trim()).filter(Boolean).slice(0,3):[];
  return res.status(200).json({
   title:String(result.title||"").slice(0,300),
   ingredients:Array.isArray(result.ingredients)?result.ingredients.map(String):[],
   steps:Array.isArray(result.steps)?result.steps.map(String):[],
   notes:String(result.notes||""),
   confidence:["low","medium","high"].includes(String(result.confidence))?String(result.confidence):"low",
   imageType,alternatives,
   method:String(result.method||""),
   category:String(result.category||""),
   mainIngredient:String(result.mainIngredient||""),
   bookPage:String(result.bookPage||"").slice(0,30),
   book:String(result.book||"").slice(0,200)
  });
 }catch(e:any){
  const code=Number(e?.status||0);
  console.error("Image recipe recognition failed",{status:code,code:e?.code,type:e?.type});
  if(code===429&&["insufficient_quota","credits_exhausted"].includes(String(e?.code||"")))return res.status(503).json({error:"De AI-fotoherkenning is tijdelijk niet beschikbaar: het OpenAI-project van deze app heeft geen bruikbaar API-tegoed. Je kunt het recept wel handmatig invullen en opslaan."});
  if(code===429)return res.status(429).json({error:"De AI-dienst is tijdelijk te druk. Probeer het later opnieuw of vul het recept handmatig in."});
  if(code===401||code===403)return res.status(503).json({error:"De AI-fotoherkenning is niet correct gekoppeld. Vul het recept voorlopig handmatig in."});
  return res.status(502).json({error:"De foto kon niet worden herkend. Probeer opnieuw of vul het recept handmatig in."});
 }
}