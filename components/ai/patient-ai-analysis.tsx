// PatientAIAnalysis.structured.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Sparkles, RefreshCw, Download, AlertCircle, ChevronLeft } from "lucide-react";

interface PatientAIAnalysisProps {
  patientId: string;
}

/** typed to match server AnalysisSchema */
type AnalysisJson = {
  summary: string;
  findings?: string[];
  risk?: { level: string; justification?: string | null; confidence?: number };
  recommendations?: Array<{
    text: string;
    confidence?: number;
    data_sources?: string[];
  }>;
  lifestyle_insights?: {
    activity_summary?: string;
    nutrition_summary?: string;
    sleep_summary?: string;
    correlations?: string[];
  };
};

export default function PatientAIAnalysis({ patientId }: PatientAIAnalysisProps) {
  const supabase = createClient();

  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisJson, setAnalysisJson] = useState<AnalysisJson | null>(null);
  const [analysisText, setAnalysisText] = useState<string | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);

  useEffect(() => {
    fetchPatientData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  const fetchPatientData = async () => {
    try {
      const { data: patientData, error } = await supabase.from("patients").select("*").eq("id", patientId).single();
      if (error) throw error;
      setPatient(patientData);
    } catch (err: any) {
      console.error("Error fetching patient:", err);
      setError("Unable to load patient data. Please refresh.");
    }
  };

  const generateAnalysis = useCallback(async () => {
    if (!patient) {
      setError("Patient data not loaded yet.");
      return;
    }
    setLoading(true);
    setError(null);
    setAnalysisJson(null);
    setAnalysisText(null);
    setModelUsed(null);
    setGeneratedAt(null);

    try {
      const [{ data: vitalSigns }, { data: labResults }, { data: alerts }] = await Promise.all([
        supabase.from("vital_signs").select("*").eq("patient_id", patientId).order("measured_at", { ascending: false }).limit(10),
        supabase.from("lab_results").select("*").eq("patient_id", patientId).order("result_at", { ascending: false }).limit(10),
        supabase.from("alerts").select("*").eq("patient_id", patientId).eq("status", "active").order("created_at", { ascending: false }).limit(10),
      ]);

      const response = await fetch("/api/ai/analyze-patient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient: {
            ...patient,
            vitals: vitalSigns || [],
            lab_results: labResults || [],
            alerts: alerts || [],
          },
        }),
      });

      const raw = await response.text();
      let parsed: any = null;
      try {
        parsed = raw ? JSON.parse(raw) : null;
      } catch (e) {
        parsed = raw;
      }

      if (!response.ok) {
        const serverMessage = (parsed && (parsed.error || parsed.message)) || `AI service responded with status ${response.status}`;
        throw new Error(serverMessage);
      }

      // Prefer structured JSON returned by server
      if (parsed?.analysisJson) {
        setAnalysisJson(parsed.analysisJson);
        setAnalysisText(parsed.analysisText ?? JSON.stringify(parsed.analysisJson, null, 2));
        setModelUsed(parsed.modelUsed ?? null);
        setGeneratedAt(parsed.timestamp ?? new Date().toISOString());
      } else if (parsed?.analysisText) {
        // fallback if server only returned stringified JSON
        try {
          const asJson = JSON.parse(parsed.analysisText);
          setAnalysisJson(asJson);
          setAnalysisText(parsed.analysisText);
        } catch {
          // not parseable as JSON: show as plain text
          setAnalysisText(parsed.analysisText ?? String(parsed));
        }
        setModelUsed(parsed.modelUsed ?? null);
        setGeneratedAt(parsed.timestamp ?? new Date().toISOString());
      } else {
        // server returned some other shape — try to parse raw as JSON
        try {
          const maybe = typeof parsed === "string" ? JSON.parse(parsed) : parsed;
          if (maybe && maybe.summary) {
            setAnalysisJson(maybe);
            setAnalysisText(JSON.stringify(maybe, null, 2));
          } else {
            setAnalysisText(typeof parsed === "string" ? parsed : JSON.stringify(parsed, null, 2));
          }
        } catch {
          setAnalysisText(typeof parsed === "string" ? parsed : JSON.stringify(parsed, null, 2));
        }
      }
    } catch (err: any) {
      console.error("Error generating analysis:", err);
      setError(err?.message || "Failed to generate AI analysis. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [patient, patientId, supabase]);

  const downloadJson = () => {
    const payload = analysisJson ? JSON.stringify(analysisJson, null, 2) : analysisText ?? "";
    const blob = new Blob([payload], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `patient-${patientId}-analysis.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadTxt = () => {
    const payload = analysisText ?? (analysisJson ? JSON.stringify(analysisJson, null, 2) : "");
    const blob = new Blob([payload], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `patient-${patientId}-analysis.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header Section - Responsive stack */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold truncate">AI Clinical Analysis</h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base truncate">
            {patient?.first_name} {patient?.last_name}
          </p>
        </div>
        <Link 
          href={`/dashboard/patients/${patientId}`} 
          className="text-primary hover:underline text-sm font-medium flex items-center gap-1 self-start sm:self-auto whitespace-nowrap"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Patient</span>
          <span className="sm:hidden">Back</span>
        </Link>
      </div>

      {/* Main Content Card */}
      <div className="bg-white border rounded-lg p-4 sm:p-6">
        {/* Card Header - Responsive */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          {/* Title and Metadata */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
              <h2 className="text-base sm:text-lg font-semibold">Clinical Assessment</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {modelUsed && (
                <span className="px-2 py-1 bg-gray-100 rounded whitespace-nowrap">
                  {modelUsed}
                </span>
              )}
              {generatedAt && (
                <time 
                  className="text-muted-foreground/70 whitespace-nowrap" 
                  dateTime={generatedAt}
                >
                  {new Date(generatedAt).toLocaleString()}
                </time>
              )}
            </div>
          </div>

          {/* Action Buttons - Responsive */}
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={generateAnalysis} 
              disabled={loading} 
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50 text-sm sm:text-base flex items-center justify-center gap-2 min-w-0"
            >
              <RefreshCw className={`w-4 h-4 flex-shrink-0 ${loading ? "animate-spin" : ""}`} />
              <span className="truncate">{loading ? "Analyzing..." : "Generate"}</span>
            </button>
            <button 
              onClick={downloadTxt} 
              disabled={!analysisText && !analysisJson} 
              className="px-3 sm:px-4 py-2 border rounded text-sm sm:text-base disabled:opacity-50 hover:bg-gray-50 flex items-center gap-2"
            >
              <Download className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Download</span>
            </button>
            <button 
              onClick={downloadJson} 
              disabled={!analysisJson} 
              className="px-3 sm:px-4 py-2 border rounded text-sm sm:text-base disabled:opacity-50 hover:bg-gray-50 whitespace-nowrap"
            >
              <span className="hidden sm:inline">Download JSON</span>
              <span className="sm:hidden">JSON</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 sm:p-4 bg-destructive/10 border border-destructive/20 rounded flex items-start gap-2 sm:gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <div className="font-medium text-destructive text-sm sm:text-base">Error</div>
              <div className="text-xs sm:text-sm text-destructive break-words">{error}</div>
            </div>
          </div>
        )}

        {/* Analysis Content - Responsive sections */}
        {analysisJson ? (
          <div className="space-y-3 sm:space-y-4">
            <section className="bg-gray-50 p-3 sm:p-4 rounded">
              <h3 className="text-sm font-semibold mb-2">Summary</h3>
              <p className="text-xs sm:text-sm leading-relaxed">{analysisJson.summary}</p>
            </section>

            <section className="bg-white p-3 sm:p-4 rounded border">
              <h3 className="text-sm font-semibold mb-2">Key Findings</h3>
              {analysisJson.findings && analysisJson.findings.length > 0 ? (
                <ul className="list-disc pl-4 sm:pl-5 space-y-1 text-xs sm:text-sm">
                  {analysisJson.findings.map((f, i) => (
                    <li key={i} className="leading-relaxed">{f}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs sm:text-sm text-muted-foreground">No discrete findings provided.</p>
              )}
            </section>

            <section className="bg-white p-3 sm:p-4 rounded border">
              <h3 className="text-sm font-semibold mb-2">Risk Assessment</h3>
              <div className="text-xs sm:text-sm leading-relaxed">
                <div>
                  <strong className="text-sm sm:text-base">{analysisJson.risk?.level ?? "Unknown"}</strong>
                  {analysisJson.risk?.confidence !== undefined && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      (Confidence: {analysisJson.risk.confidence}%)
                    </span>
                  )}
                </div>
                {analysisJson.risk?.justification && (
                  <p className="mt-1">{analysisJson.risk.justification}</p>
                )}
              </div>
            </section>

            <section className="bg-white p-3 sm:p-4 rounded border">
              <h3 className="text-sm font-semibold mb-2">Recommendations</h3>
              {analysisJson.recommendations && analysisJson.recommendations.length > 0 ? (
                <ol className="list-decimal pl-4 sm:pl-5 space-y-2 text-xs sm:text-sm">
                  {analysisJson.recommendations.map((r, i) => (
                    <li key={i} className="leading-relaxed">
                      <div>{typeof r === 'string' ? r : r.text}</div>
                      {typeof r === 'object' && r.confidence !== undefined && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Confidence: {r.confidence}%
                          {r.data_sources && r.data_sources.length > 0 && (
                            <span className="ml-2">• Sources: {r.data_sources.join(', ')}</span>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-xs sm:text-sm text-muted-foreground">No recommendations provided.</p>
              )}
            </section>

            {/* Lifestyle Insights Section */}
            {analysisJson.lifestyle_insights && (
              <section className="bg-white p-3 sm:p-4 rounded border">
                <h3 className="text-sm font-semibold mb-2">Lifestyle Insights</h3>
                <div className="space-y-2 text-xs sm:text-sm">
                  {analysisJson.lifestyle_insights.activity_summary && (
                    <div>
                      <strong className="text-muted-foreground">Activity:</strong>{' '}
                      {analysisJson.lifestyle_insights.activity_summary}
                    </div>
                  )}
                  {analysisJson.lifestyle_insights.nutrition_summary && (
                    <div>
                      <strong className="text-muted-foreground">Nutrition:</strong>{' '}
                      {analysisJson.lifestyle_insights.nutrition_summary}
                    </div>
                  )}
                  {analysisJson.lifestyle_insights.sleep_summary && (
                    <div>
                      <strong className="text-muted-foreground">Sleep:</strong>{' '}
                      {analysisJson.lifestyle_insights.sleep_summary}
                    </div>
                  )}
                  {analysisJson.lifestyle_insights.correlations && analysisJson.lifestyle_insights.correlations.length > 0 && (
                    <div>
                      <strong className="text-muted-foreground">Correlations:</strong>
                      <ul className="list-disc pl-5 mt-1 space-y-1">
                        {analysisJson.lifestyle_insights.correlations.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        ) : analysisText ? (
          <pre className="bg-gray-50 p-3 sm:p-4 rounded text-xs sm:text-sm whitespace-pre-wrap overflow-auto max-h-96">
            {analysisText}
          </pre>
        ) : (
          <div className="py-8 sm:py-12 text-center bg-gray-50 rounded">
            <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground/30 mx-auto mb-2 sm:mb-3" />
            <p className="text-muted-foreground text-sm sm:text-base px-4">
              Click "Generate Analysis" to get structured clinical findings.
            </p>
          </div>
        )}
      </div>

      {/* Disclaimer - Responsive */}
      <div className="bg-info/10 border border-info/20 rounded p-3 sm:p-4 text-xs sm:text-sm">
        <strong className="block mb-1">AI-Powered Clinical Assistant</strong>
        <div className="leading-relaxed">
          This analysis is generated by an AI assistant and should be reviewed by qualified healthcare professionals before clinical decisions are made.
        </div>
      </div>
    </div>
  );
}