import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    // Verify API key is configured
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return Response.json(
        { error: "Google Generative AI API key is not configured" },
        { status: 500 }
      );
    }

    const { alertData, patientData } = await request.json();

    const prompt = `Generate a clinical alert notification. Be concise and professional.

Alert Type: ${alertData.alert_type}
Severity: ${alertData.severity}
Patient: ${patientData.first_name} ${patientData.last_name}
Description: ${alertData.description}

Generate a clear, actionable alert message (1-2 sentences) that a healthcare professional would understand.`;

    const { text } = await generateText({
      model: google('models/gemini-1.5-flash-latest'),
      prompt,
      temperature: 0.5,
      maxOutputTokens: 150,
    });

    return Response.json({
      alertMessage: text,
    });
  } catch (error) {
    console.error("Alert Generation Error:", error);
    return Response.json(
      { error: "Failed to generate alert message" },
      { status: 500 }
    );
  }
}
