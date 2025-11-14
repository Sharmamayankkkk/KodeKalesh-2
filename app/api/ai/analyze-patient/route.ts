// route.ts
import type { NextRequest } from "next/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

const PRIMARY_MODELS = ["models/gemini-2.5-flash"];
const FALLBACK_MODELS = ["models/gemini-2.0-flash", "models/gemini-1.5-flash"];
const ALL_MODELS = [...PRIMARY_MODELS, ...FALLBACK_MODELS];

const DEFAULT_MAX_OUTPUT_TOKENS = 700;
const DEFAULT_TEMPERATURE = 0.2; // low temp to improve deterministic JSON

/* Zod schema for the JSON we expect from the model */
const AnalysisSchema = z.object({
  summary: z.string().min(1),
  findings: z.array(z.string()).optional().default([]),
  risk: z.object({
    level: z.enum(["Low", "Medium", "High"]).or(z.string()), // allow other text but prefer these
    justification: z.string().optional().nullable(),
  }).optional().default({ level: "Medium", justification: "" }),
  recommendations: z.array(z.string()).optional().default([]),
});

type AnalysisType = z.infer<typeof AnalysisSchema>;

async function callModel(modelId: string, prompt: string) {
  // minimal wrapper - uses generateText; adjust if your SDK returns different shape
  const response = await generateText({
    model: google(modelId),
    prompt,
    temperature: DEFAULT_TEMPERATURE,
    maxOutputTokens: DEFAULT_MAX_OUTPUT_TOKENS,
  });
  // the SDK may return { text } or other shapes — normalize carefully:
  const text =
    (response as any)?.text ??
    (response as any)?.outputText ??
    (response as any)?.output?.[0]?.content ??
    null;
  return { text: typeof text === "string" ? text : String(text ?? "") };
}

/** Extract JSON substring from text if the model returns extra commentary.
 *  This looks for the first `{` and last `}` and tries JSON.parse; repeat attempts if needed.
 */
function extractJsonFromText(text: string): string | null {
  if (!text) return null;
  // quick attempt: direct parse
  try {
    JSON.parse(text);
    return text;
  } catch { /* fallthrough */ }

  // try to find JSON object in between braces
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const candidate = text.substring(firstBrace, lastBrace + 1);
    try {
      JSON.parse(candidate);
      return candidate;
    } catch (e) {
      // if fails, try looser extraction (could be array wrapper or code block)
    }
  }

  // try triple-backtick block with JSON
  const mdJsonMatch = text.match(/```(?:json)?\s*({[\s\S]*})\s*```/i);
  if (mdJsonMatch && mdJsonMatch[1]) {
    try {
      JSON.parse(mdJsonMatch[1]);
      return mdJsonMatch[1];
    } catch {}
  }

  return null;
}

/** Build prompt that STRICTLY instructs the model to return JSON (no prose). */
function buildJsonPrompt(patient: any) {
  // keep PHI minimal in logs; do not log back entire patient in production
  const safePatient = {
    age: patient.age ?? "unknown",
    sex: patient.sex ?? "unknown",
    chronic_conditions: patient.chronic_conditions ?? [],
    vitals: Array.isArray(patient.vitals) ? patient.vitals.slice(0, 10) : [],
    labs: Array.isArray(patient.lab_results) ? patient.lab_results.slice(0, 10) : [],
    medications: patient.medications ?? [],
  };

  return `You are a clinical assistant. Based on the provided patient data, return ONLY valid JSON matching the schema below.  
Do NOT include any additional explanation, commentary, or markdown. The output must be strict JSON.

Schema:
{
  "summary": "short 2-3 sentence clinical summary",
  "findings": ["key finding 1", "key finding 2", "..."],
  "risk": {
    "level": "Low|Medium|High",
    "justification": "one-line justification for the risk level"
  },
  "recommendations": ["actionable recommendation 1", "actionable recommendation 2", "..."]
}

Patient data (for context):
${JSON.stringify(safePatient, null, 2)}

Return the JSON now. Ensure it is parseable by JSON.parse.`;
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GOOGLE_API_KEY && !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Google Generative AI API key not configured on server." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || !body.patient) {
      return new Response(JSON.stringify({ error: "Missing patient payload" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const patient = body.patient;
    const prompt = buildJsonPrompt(patient);

    // Try models in priority order
    let lastError: any = null;
    for (const modelId of ALL_MODELS) {
      try {
        const { text } = await callModel(modelId, prompt);
        if (!text || text.trim().length === 0) {
          lastError = { model: modelId, message: "Empty response" };
          continue; // try next
        }

        // Try to extract JSON substring if not strict JSON
        const jsonString = extractJsonFromText(text) ?? null;
        if (!jsonString) {
          lastError = { model: modelId, message: "No JSON found in response", raw: text };
          continue; // try next model
        }

        // Parse JSON
        let parsed: any;
        try {
          parsed = JSON.parse(jsonString);
        } catch (parseErr) {
          lastError = { model: modelId, message: "JSON parse error", raw: jsonString, err: String(parseErr) };
          continue; // try next model
        }

        // Validate schema
        const parsedValidated = AnalysisSchema.safeParse(parsed);
        if (!parsedValidated.success) {
          // If validation fails, don't immediately bail — try next model if available
          lastError = { model: modelId, message: "Schema validation failed", issues: parsedValidated.error.format(), raw: parsed };
          continue;
        }

        const analysisJson: AnalysisType = parsedValidated.data;
        const responsePayload = {
          analysisText: JSON.stringify(analysisJson, null, 2),
          analysisJson,
          modelUsed: modelId,
          timestamp: new Date().toISOString(),
        };

        return new Response(JSON.stringify(responsePayload), { status: 200, headers: { "Content-Type": "application/json" } });
      } catch (err: any) {
        // If model is not found or unrecoverable, continue to next
        lastError = { model: modelId, message: err?.message ?? String(err) };
        // continue
      }
    }

    // If we get here, none of the models produced valid JSON
    return new Response(
      JSON.stringify({
        error: "No model produced valid JSON matching schema",
        lastError,
      }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("AI Analysis Error:", err);
    return new Response(JSON.stringify({ error: "Failed to generate clinical analysis" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}