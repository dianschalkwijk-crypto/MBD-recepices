import OpenAI from "openai";
import { z } from "zod";

const collections = [
  "Gezin", "Airfryer", "Borrel", "Zomer", "Seizoens", "Lunch", "Camping 1pans",
  "Mealprep", "Easy oven", "Ontbijt", "Vegetarisch", "Aziatisch", "Little Kids",
  "Salades", "Protein", "Wraps", "Toetjes", "BBQ", "Diepvries", "Pasta", "Overig"
] as const;

const ImportRequest = z.object({
  sourceURL: z.string().url().optional().nullable(),
  sharedText: z.string().max(60000).optional().nullable(),
  sourceAuthor: z.string().max(500).optional().nullable()
});

const IngredientSchema = z.object({
  original_line: z.string(),
  amount: z.number().nullable(),
  unit: z.string().nullable(),
  ingredient: z.string(),
  note: z.string().nullable()
});

const RecipeSchema = z.object({
  title_nl: z.string(),
  source_url: z.string().nullable(),
  source_author: z.string().nullable(),
  source_platform: z.enum(["instagram", "tiktok", "facebook", "web", "unknown"]),
  source_completeness: z.enum(["complete", "partial", "insufficient"]),
  ingredients: z.array(IngredientSchema),
  steps: z.array(z.string()),
  servings_text: z.string().nullable(),
  prep_minutes: z.number().int().nullable(),
  cook_minutes: z.number().int().nullable(),
  collections: z.array(z.enum(collections)),
  warnings: z.array(z.string())
});

const recipeJSONSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    title_nl: { type: "string" },
    source_url: { type: ["string", "null"] },
    source_author: { type:ֻǱ˞