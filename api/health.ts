export default function handler(_req: any, res: any) {
  res.status(200).json({
    ok: true,
    service: "madebydian-recipes-api",
    version: "0.7.0",
    aiConfigured: Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_MODEL)
  });
}