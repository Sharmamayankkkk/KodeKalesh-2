import { createGoogle } from '@ai-sdk/google';
import { generateText } from 'ai';
import { z } from 'zod';

export const maxDuration = 30;

const patientDataSchema = z.object({
  patient: z.object({
    first_name: z.string(),
    last_name: z.string(),
    date_of_birth: z.string(),
    vitals: z.array(z.any()), // Keeping vitals flexible for now
    medical_history: z.array(z.any()),
    medications: z.array(z.any()),
    lab_results: z.array(z.any()),
    alerts: z.array(z.any()),
  }),
});

export async function POST(req: Request) {
  try {
    // Verify API key is configured
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return Response.json(
        { error: "Google Generative AI API key is not configured" },
        { status: 500 }
      );
    }

    const { patient } = patientDataSchema.parse(await req.json());

    // Construct a detailed prompt for the AI
    const prompt = `Based on the following patient data, generate a clinical analysis.
Data:
- Name: ${patient.first_name} ${patient.last_name}
- DOB: ${patient.date_of_birth}
- Recent Vitals: ${JSON.stringify(patient.vitals.slice(0, 5))}
- Medical History: ${JSON.stringify(patient.medical_history)}
- Current Medications: ${JSON.stringify(patient.medications)}
- Recent Lab Results: ${JSON.stringify(patient.lab_results.slice(0, 5))}
- Active Alerts: ${JSON.stringify(patient.alerts)}

Provide:
1. Clinical Summary (2-3 sentences)
2. Key Findings (3-5 bullet points)
3. Risk Assessment (Low/Medium/High)
4. Recommendations (3-4 actionable items)`;
    
    const { text } = await generateText({
      model: createGoogle()("models/gemini-1.5-flash-latest"),
      prompt,
      temperature: 0.7,
      maxOutputTokens: 500,
    });

    return Response.json({
      analysis: text,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return Response.json(
      { error: "Failed to generate clinical analysis" },
      { status: 500 }
    );
  }
}
