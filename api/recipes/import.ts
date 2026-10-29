import OpenAI from "openai";
import { z } from "zod";

const Request = z.object({
  sourceURL: z.string().url().nullable().optional(),
  sharedText: z.string().max(60000).optional().default(""),
  sourceAuthor: z.string().max(500).nullable().optional()
});
const Ingredient = z.object({
  original_line: z.string(),
  amount: z.number().nullable(),
  unit: z.string().nullable(),
  ingredient: z.string(),
  note: z.string().nullable()
});
const Recipe = z.object({
  title_nl: z.string(),
  source_url: z.string().nullable(),
  source_author: z.string().nullable(),
  servings_text: z.string().nullable().optional(),
  ingredients: z.array(Ingredient),
  steps: z.array(z.string()),
  collections: z.array(z.string()),
  warnings: z.array(z.string()),
  source_completeness: z.enum(["complete","partial","insufficient"])
});


function renderIngredientLine(x:z.infer<typeof Ingredient>){
  const amount=x.amount===null||x.amount===undefined?"":String(x.amount).replace(".",",");
  const unit=String(x.unit||"").trim();
  const ingredient=String(x.ingredient||"").trim();
  const note=String(x.note||"").trim();
  return [amount,unit,ingredient].filter(Boolean).join(" ")+(note?" ("+note+")":"");
}
function normalizeIngredientLines(result:z.infer<typeof Recipe>){
  result.ingredients=result.ingredients.map(x=>({...x,original_line:renderIngredientLine(x)||x.original_line}));
  return result;
}

function looksEnglish(value:any){
  const s=(typeof value==="string"?value:JSON.stringify(value||"")).toLowerCase();
  if(!s.trim())return false;
  const en=(s.match(/\b(chicken|beef|pork|flour|cup|cups|tablespoon|tablespoons|teaspoon|teaspoons|bake|baked|cook|cooked|fry|fried|add|mix|stir|minutes|onion|garlic|butter|cheese|rice|cream|eggs?|salt|pepper|oven|serve|until|with|and|into)\b/g)||[]).length;
  const nl=(s.match(/\b(kip|rund|varken|bloem|eetlepel|theelepel|bak|kook|voeg|meng|roer|minuten|ui|knoflook|boter|kaas|rijst|room|eieren?|zout|peper|oven|serveer|tot|met|en|in)\b/g)||[]).length;
  return en>=3&&en>nl;
}
async function ensureDutch(ai:OpenAI,model:string,result:z.infer<typeof Recipe>){
  const second=await ai.chat.completions.create({
    model,response_format:{type:"json_object"},messages:[
      {role:"system",content:"Vertaal uitsluitend de menselijk leesbare recepttekst in dit JSON-object naar natuurlijk Nederlands. Behoud source_url, source_author, hoeveelheden, getallen, merknamen, collections, warnings-structuur en source_completeness. Het woord mealprep mag blijven staan. Vertaal title_nl, servings_text, original_line, unit, ingredient, note, steps en waarschuwingstekst waar nodig. Zet tablespoon/tbsp naar el en teaspoon/tsp naar tl; zet alleen andere maten metrisch om als dat zonder inhoudelijk gokken kan. Voeg niets toe en laat niets weg. Antwoord uitsluitend met hetzelfde JSON-schema."},
      {role:"user",content:JSON.stringify(result)}
    ]
  });
  const raw=second.choices[0]?.message?.content;if(!raw)return result;
  const translated=Recipe.parse(JSON.parse(raw));
  translated.source_url=result.source_url;translated.source_author=result.source_author;
  return translated;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const parsed = Request.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Ongeldige of ontbrekende recepttekst." });
  if (!process.env.OPENAI_API_KEY) return res.status(503).json({ error: "Receptimport is niet geconfigureerd." });
  const {sourceURL,sourceAuthor} = parsed.data;
  let sharedText=parsed.data.sharedText.trim();
  if(!sharedText && sourceURL){
    try{
      const u=new URL(sourceURL);
      const allowed=["instagram.com","www.instagram.com","tiktok.com","www.tiktok.com","facebook.com","www.facebook.com"];
      if(!allowed.includes(u.hostname.toLowerCase()))return res.status(422).json({error:"Deze bron wordt nog niet automatisch ondersteund."});
      const response=await fetch(u.toString(),{headers:{"User-Agent":"Mozilla/5.0","Accept":"text/html"},signal:AbortSignal.timeout(12000),redirect:"error"});
      if(response.ok){
        const html=(await response.text()).slice(0,400000);
        const meta=html.match(/<meta[^>]+(?:og:description|twitter:description|name="description")[^>]*>/gi)||[];
        const descriptions=meta.map(tag=>(tag.match(/content=["']([^"']+)["']/i)||[])[1]||"");
        sharedText=descriptions.sort((a,b)=>b.length-a.length)[0]||"";
        sharedText=sharedText.replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&amp;/g,"&");
      }
    }catch(e){console.warn("Social source metadata unavailable",e);}
  }
  if(sharedText.length<10)return res.status(422).json({error:"Instagram geeft geen recepttekst vrij voor deze reel. Deel de caption of voeg een video toe; de bronlink blijft bewaard."});
  try {
    const ai = new OpenAI({apiKey:process.env.OPENAI_API_KEY});
    const completion = await ai.chat.completions.create({
      model:process.env.OPENAI_MODEL || "gpt-4.1-mini",
      response_format:{type:"json_object"},
      messages:[
        {role:"system",content:"Zet uitsluitend de aangeleverde recepttekst om naar een natuurlijk Nederlands recept. Vertaal de titel, alle ingrediëntnamen, eenheden, opmerkingen en alle bereidingsstappen naar natuurlijk Nederlands, ook wanneer de bron Engels is. Het woord mealprep mag blijven staan. Behoud merknamen, hoeveelheden en betekenis exact. Zet tablespoon/tbsp naar el en teaspoon/tsp naar tl; zet andere buitenlandse maten alleen metrisch om als dat betrouwbaar kan. Vul nooit ontbrekende ingrediënten, hoeveelheden of stappen zelf in. Antwoord uitsluitend met een JSON object met title_nl, source_url, source_author, servings_text (string of null; alleen als de bron expliciet het aantal personen/porties/servings noemt, nooit gokken), ingredients (array objecten met original_line, amount (getal of null), unit (string of null), ingredient, note (string of null)), steps (array strings), collections (array strings), warnings (array strings), source_completeness ('complete', 'partial' of 'insufficient'). Behoud de bronlink en auteur/accountnaam uit de input exact. Als informatie ontbreekt: geef een waarschuwing."},
        {role:"user",content:JSON.stringify({sourceURL,sourceAuthor,sharedText})}
      ]
    });
    const raw=completion.choices[0]?.message?.content;
    if(!raw)throw Error("Lege AI-respons");
    let result=normalizeIngredientLines(Recipe.parse(JSON.parse(raw)));
    result.source_url=sourceURL||null;
    result.source_author=sourceAuthor||result.source_author||null;
    const readable=[result.title_nl,result.servings_text,...result.ingredients.flatMap(x=>[x.original_line,x.unit,x.ingredient,x.note]),...result.steps].filter(Boolean).join(" ");
    if(looksEnglish(readable))result=normalizeIngredientLines(await ensureDutch(ai,process.env.OPENAI_MODEL || "gpt-4.1-mini",result));
    result.source_url=sourceURL||null;
    result.source_author=sourceAuthor||result.source_author||null;
    return res.status(200).json(result);
  } catch(e) {
    console.error("Recipe import failed",e);
    return res.status(502).json({error:"Recept kon niet betrouwbaar worden verwerkt."});
  }
}
