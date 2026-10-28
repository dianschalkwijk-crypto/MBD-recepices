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
  ingredients: z.array(Ingredient),
  steps: z.array(z.string()),
  collections: z.array(z.string()),
  warnings: z.array(z.string()),
  source_completeness: z.enum(["complete","partial","insufficient"])
});

export default async function handler(req: any, res: any) {
  if(req.method==="GET"&&process.env.VERCEL_ENV==="preview"&&req.query?.smoke){
    req.method="POST";
    req.body={sourceURL:null,sourceAuthor:"Preview test",sharedText:"Chicken rice bowl\nIngredients: 200 g chicken breast, 150 g cooked rice, 1 tbsp olive oil, 1 tsp garlic powder.\nInstructions: Cook the rice. Fry the chicken in olive oil. Add garlic powder. Serve with the rice."};
  }
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
        {role:"system",content:"Zet uitsluitend de aangeleverde recepttekst om naar een natuurlijk Nederlands recept. Vertaal de titel, alle ingrediëntnamen, opmerkingen en alle bereidingsstappen naar Nederlands, ook wanneer de bron Engels is. Behoud merknamen, hoeveelheden en betekenis exact. Vul nooit ontbrekende ingrediënten, hoeveelheden of stappen zelf in. Antwoord uitsluitend met een JSON object met title_nl, source_url, source_author, ingredients (array objecten met original_line, amount (getal of null), unit (string of null), ingredient, note (string of null)), steps (array strings), collections (array strings), warnings (array strings), source_completeness ('complete', 'partial' of 'insufficient'). Behoud de bronlink en auteur uit de input. Als informatie ontbreekt: geef een waarschuwing."},
        {role:"user",content:JSON.stringify({sourceURL,sourceAuthor,sharedText})}
      ]
    });
    const raw=completion.choices[0]?.message?.content;
    if(!raw)throw Error("Lege AI-respons");
    const result=Recipe.parse(JSON.parse(raw));
    result.source_url=sourceURL||null;
    result.source_author=sourceAuthor||result.source_author||null;
    return res.status(200).json(result);
  } catch(e) {
    console.error("Recipe import failed",e);
    return res.status(502).json({error:"Recept kon niet betrouwbaar worden verwerkt."});
  }
}
