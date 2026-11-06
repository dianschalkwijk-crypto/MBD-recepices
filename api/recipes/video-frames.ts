import OpenAI from "openai";
export default async function handler(req:any,res:any){
  if(req.method!=="POST")return res.status(405).json({error:"Methode niet toegestaan"});
  const images=req.body?.images;
  if(!Array.isArray(images)||images.length<1||images.length>4||images.some((x:any)=>typeof x!=="string"||!/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(x)||x.length>900000))return res.status(400).json({error:"Ongeldige of te grote videobeelden"});
  if(!process.env.OPENAI_API_KEY)return res.status(503).json({error:"AI-sleutel ontbreekt"});
  try{
    const ai=new OpenAI({apiKey:process.env.OPENAI_API_KEY});
    const result=await ai.chat.completions.create({model:process.env.OPENAI_MODEL||"gpt-4.1-mini",temperature:0,max_tokens:1600,messages:[{role:"system",content:"Lees uitsluitend werkelijk zichtbare recepttekst uit deze videobeelden. Geef tekst in de oorspronkelijke taal, met ingrediënten en stappen als die zichtbaar zijn. Verzin geen ingrediënten, hoeveelheden of stappen. Als geen recepttekst zichtbaar is, geef een lege tekst terug."},{role:"user",content:[{type:"text",text:"Transcribeer alle zichtbare recepttekst. Vermijd duplicaten tussen frames."},...images.map((url:string)=>({type:"image_url" as const,image_url:{url,detail:"low" as const}}))]}]});
    const text=String(result.choices?.[0]?.message?.content||"").trim();
    return res.status(200).json({text});
  }catch(e:any){
    console.error("Video frame extraction failed",e?.status||"",e?.code||"");
    return res.status(e?.status===429?429:502).json({error:e?.status===429?"AI-tegoed of limiet bereikt.": "Videobeelden konden niet worden verwerkt. Probeer een caption of screenshots."});
  }
}