"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Sparkles, RefreshCw, Download, AlertCircle } from 'lucide-react';
import Link from "next/link";

interface PatientAIAnalysisProps {
  patientId: string;
}

export default function PatientAIAnalysis({ patientId }: PatientAIAnalysisProps) {
  const supabase = createClient();
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patient, setPatient] = useState<any>(null);

  useEffect(() => {
    fetchPatientData();
  }, [patientId]);

  const fetchPatientData = async () => {
    try {
      const { data: patientData } = await supabase
        .from("patients")
        .select("*")
        .eq("id", patientId)
        .single();

      setPatient(patientData);
    } catch (error) {
      console.error("Error fetching patient:", error);
    }
  };

  const generateAnalysis = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: vitalSigns } = await supabase
        .from("vital_signs")
        .select("*")
        .eq("patient_id", patientId)
        .order("measured_at", { ascending: false })
        .limit(10);

      const { data: labResults } = await supabase
        .from("lab_results")
        .select("*")
        .eq("patient_id", patientId)
        .order("result_at", { ascending: false })
        .limit(10);

      const response = await fetch("/api/ai/analyze-patient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientData: patient,
          vitalSigns: vitalSigns || [],
          labResults: labResults || [],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate analysis");
      }

      const { analysis: aiAnalysis } = await response.json();
      setAnalysis(aiAnalysis);
    } catch (err) {
      setError("Failed to generate AI analysis. Please try again.");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const downloadAnalysis = () => {
    const element = document.createElement("a");
    const file = new Blob([analysis || ""], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `patient-analysis-${patientId}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            AI Clinical Analysis
          </h1>
          <p className="text-muted-foreground mt-2">
            {patient?.first_name} {patient?.last_name} - AI-Powered Insights
          </p>
        </div>
        <Link
          href={`/dashboard/patients/${patientId}`}
          className="text-primary hover:underline text-sm font-medium"
        >
          Back to Patient
        </Link>
      </div>

      {/* Analysis Panel */}
      <div className="bg-background border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              Clinical Assessment
            </h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={generateAnalysis}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 font-medium transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Analyzing..." : "Generate Analysis"}
            </button>

            {analysis && (
              <button
                onClick={downloadAnalysis}
                className="flex items-center gap-2 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted-background font-medium transition"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-destructive/10 border border-destructive rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-destructive">Error</p>
              <p className="text-sm text-destructive/80 mt-1">{error}</p>
            </div>
          </div>
        )}

        {analysis ? (
          <div className="bg-muted-background rounded-lg p-6 whitespace-pre-wrap font-mono text-sm text-foreground leading-relaxed">
            {analysis}
          </div>
        ) : (
          <div className="py-12 text-center bg-muted-background rounded-lg">
            <Sparkles className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">
              Click "Generate Analysis" to get AI-powered clinical insights
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Analysis uses patient vitals, lab results, and medical history
            </p>
          </div>
        )}
      </div>

      {/* Information */}
      <div className="bg-info/10 border border-info/20 rounded-lg p-4">
        <p className="text-sm text-info font-medium mb-1">AI-Powered Clinical Assistant</p>
        <p className="text-xs text-info/80">
          This analysis is generated by Google's Gemini AI and should be reviewed by qualified healthcare professionals before clinical decisions are made.
        </p>
      </div>
    </div>
  );
}
