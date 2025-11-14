"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus } from 'lucide-react';
import AddLabResultModal from "../modals/add-lab-result-modal";

interface PatientLabResultsTabProps {
  patientId: string;
}

export default function PatientLabResultsTab({ patientId }: PatientLabResultsTabProps) {
  const supabase = createClient();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchLabResults();
  }, [patientId]);

  const fetchLabResults = async () => {
    try {
      const { data } = await supabase
        .from("lab_results")
        .select("*")
        .eq("patient_id", patientId)
        .order("result_at", { ascending: false })
        .limit(20);

      setResults(data || []);
    } catch (error) {
      console.error("Error fetching lab results:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLabResultAdded = () => {
    setShowModal(false);
    fetchLabResults();
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "critical":
        return "bg-destructive/10 text-destructive";
      case "abnormal":
        return "bg-warning/10 text-warning";
      case "normal":
        return "bg-success/10 text-success";
      default:
        return "bg-muted-background text-muted-foreground";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Lab Results</h3>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm font-medium transition"
        >
          <Plus className="w-4 h-4" />
          Add Result
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin">
            <div className="w-6 h-6 border-3 border-border border-t-primary rounded-full" />
          </div>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-12 bg-muted-background rounded-lg">
          <p className="text-muted-foreground">No lab results yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted-background">
              <tr>
                <th className="text-left p-3 font-semibold text-foreground">Test</th>
                <th className="text-left p-3 font-semibold text-foreground">Result</th>
                <th className="text-left p-3 font-semibold text-foreground hidden md:table-cell">Reference</th>
                <th className="text-left p-3 font-semibold text-foreground">Status</th>
                <th className="text-left p-3 font-semibold text-foreground hidden md:table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, idx) => (
                <tr
                  key={result.id}
                  className={`border-b border-border hover:bg-muted-background transition ${
                    idx % 2 === 1 ? "bg-muted-background/50" : ""
                  }`}
                >
                  <td className="p-3">
                    <div>
                      <p className="font-medium text-foreground">{result.test_name}</p>
                      <p className="text-xs text-muted-foreground">{result.test_category}</p>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="font-medium text-foreground">
                      {result.result_value} {result.unit}
                    </span>
                  </td>
                  <td className="p-3 hidden md:table-cell text-muted-foreground text-xs">
                    {result.reference_range}
                  </td>
                  <td className="p-3">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded capitalize ${getStatusBadgeColor(
                        result.status
                      )}`}
                    >
                      {result.status}
                    </span>
                  </td>
                  <td className="p-3 text-muted-foreground hidden md:table-cell text-xs">
                    {result.result_at
                      ? new Date(result.result_at).toLocaleDateString()
                      : new Date(result.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <AddLabResultModal
          patientId={patientId}
          onClose={() => setShowModal(false)}
          onLabResultAdded={handleLabResultAdded}
        />
      )}
    </div>
  );
}
