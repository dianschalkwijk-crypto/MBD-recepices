import OpenAI from "openai";
export default async function handler(req:any,res:any){
 if(req.method!=="POST")return res.status(405).json({error:"Methode niet toegestaan"});
 const {image}=req.body||{};
 if(typeof image!=="string"||!/^data:image\/(jpeg|png|webp);base64,/.test(image)||image.length>9000000)return res.status(400).json({error:"Upload een JPG, PNG of WebP kleiner dan ongeveer 6 MB."});
 if(!process.env.OPENAI_API_KEY)return res.status(503).json({error:"Fotoherkenning is nog niet geconfigureerd."});
 try{
 const ai=new OpenAI({apiKey:process.env.OPENAI_API_KEY});
 const completion=await ai.chat.completions.create({model:"gpt-4.1-mini",response_format:{type:"json_object"},messages:[{role:"system",content:"Analyseer de afbeelding als mogelijk recept of gerecht. Antwoord in Nederlands als JSON met title (string), ingredients (array strings), steps (array strings), confidence (low/medium/high), notes (string), method (string: Airfryer, Oven, Pan, Koken of Overig), category (string: Ontbijt, Lunch, Avondeten, Snack of Bijgerecht), mainIngredient (string). Bij een gefotografeerde receptpagina: neem uitsluitend daadwerkelijk zichtbare ingrediënten en instructies over; verzin niets. Bij een foto van bereid eten zonder recepttekst: maak een plausibel VOORSTEL, noem geschatte ingrediënten en bereidingswijze, vermeld in notes duidelijk dat hoeveelheden en samenstelling onzeker zijn. Als geen gerecht zichtbaar is, geef lege arrays en een uitleg."},{role:"user",content:[{type:"text",text:"Herken dit recept of maak bij een foto van een gerecht een voorstel."},{type:"image_url",image_url:{url:image,detail:"high"}}]}]});
 const result=JSON.parse(completion.choices[0]?.message?.content||"{}");
 return res.status(200).json({title:String(result.title||"").slice(0,300),ingredients:Array.isArray(result.ingredients)?result.ingredients.map(String):[],steps:Array.isArray(result.steps)?result.steps.map(String):[],notes:String(result.notes||""),confidence:result.confidence||"low",method:String(result.method||""),category:String(result.category||""),mainIngredient:String(result.mainIngredient||"")});
 }catch(e){console.error("Image recipe recognition failed",e);return res.status(502).json({error:"De foto kon niet worden herkend."})}
}