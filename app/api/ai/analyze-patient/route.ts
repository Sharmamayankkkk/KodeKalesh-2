import { generateText } from "ai";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { patientData, vitalSigns, labResults } = await request.json();

    const prompt = `You are a clinical assistant analyzing patient data. Provide a concise clinical assessment.

Patient: ${patientData.first_name} ${patientData.last_name}
Age: ${new Date().getFullYear() - new Date(patientData.date_of_birth).getFullYear()}
Blood Type: ${patientData.blood_type}
Chronic Conditions: ${patientData.chronic_conditions?.join(", ") || "None"}
Allergies: ${patientData.allergies?.join(", ") || "None"}

Recent Vital Signs:
${vitalSigns
  .slice(0, 3)
  .map((v: any) => `- Heart Rate: ${v.heart_rate} bpm, BP: ${v.systolic_bp}/${v.diastolic_bp}, Temp: ${v.temperature}°C`)
  .join("\n")}

Recent Lab Results:
${labResults
  .slice(0, 5)
  .map((l: any) => `- ${l.test_name}: ${l.result_value} ${l.unit} (${l.status})`)
  .join("\n")}

Provide:
1. Clinical Summary (2-3 sentences)
2. Key Findings (3-5 bullet points)
3. Risk Assessment (Low/Medium/High)
4. Recommendations (3-4 actionable items)`;

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
      temperature: 0.7,
      maxTokens: 500,
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
