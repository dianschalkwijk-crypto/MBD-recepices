import OpenAI from "openai";
import { z } from "zod";

const Request = z.object({
  sourceURL: z.string().url().nullable().optional(),
  sharedText: z.string().min(10).max(60000),
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
      {role:"system",content:"Vertaal uitsluitend de menselijk leesbare recepttekst in dit JSON-object naar natuurlijk Nederlands. Behoud source_url, source_author, hoeveelheden, getallen, merknamen, collections, warnings-structuur en source_completeness. Vertaal title_nl, servings_text, original_line, ingredient, note, steps en waarschuwingstekst waar nodig. Voeg niets toe en laat niets weg. Antwoord uitsluitend met hetzelfde JSON-schema."},
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
  const {sourceURL,sharedText,sourceAuthor} = parsed.data;
  try {
    const ai = new OpenAI({apiKey:process.env.OPENAI_API_KEY});
    const completion = await ai.chat.completions.create({
      model:process.env.OPENAI_MODEL || "gpt-4.1-mini",
      response_format:{type:"json_object"},
      messages:[
        {role:"system",content:"Zet uitsluitend de aangeleverde recepttekst om naar een natuurlijk Nederlands recept. Vertaal de titel, alle ingrediëntnamen, opmerkingen en alle bereidingsstappen naar Nederlands, ook wanneer de bron Engels is. Behoud merknamen, hoeveelheden en betekenis exact. Vul nooit ontbrekende ingrediënten, hoeveelheden of stappen zelf in. Antwoord uitsluitend met een JSON object met title_nl, source_url, source_author, servings_text (string of null; alleen als de bron expliciet het aantal personen/porties/servings noemt, nooit gokken), ingredients (array objecten met original_line, amount (getal of null), unit (string of null), ingredient, note (string of null)), steps (array strings), collections (array strings), warnings (array strings), source_completeness ('complete', 'partial' of 'insufficient'). Behoud de bronlink en auteur uit de input. Als informatie ontbreekt: geef een waarschuwing."},
        {role:"user",content:JSON.stringify({sourceURL,sourceAuthor,sharedText})}
      ]
    });
    const raw=completion.choices[0]?.message?.content;
    if(!raw)throw Error("Lege AI-respons");
    let result=Recipe.parse(JSON.parse(raw));
    result.source_url=sourceURL||null;
    result.source_author=sourceAuthor||result.source_author||null;
    result=await ensureDutch(ai,process.env.OPENAI_MODEL || "gpt-4.1-mini",result);
    result.source_url=sourceURL||null;
    result.source_author=sourceAuthor||result.source_author||null;
    return res.status(200).json(result);
  } catch(e) {
    console.error("Recipe import failed",e);
    return res.status(502).json({error:"Recept kon niet betrouwbaar worden verwerkt."});
  }
}
