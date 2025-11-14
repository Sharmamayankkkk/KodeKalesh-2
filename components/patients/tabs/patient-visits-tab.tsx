"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Calendar } from 'lucide-react';

interface PatientVisitsTabProps {
  patientId: string;
}

export default function PatientVisitsTab({ patientId }: PatientVisitsTabProps) {
  const supabase = createClient();
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVisits();
  }, [patientId]);

  const fetchVisits = async () => {
    try {
      const { data } = await supabase
        .from("visits")
        .select("*, physician:users(full_name)")
        .eq("patient_id", patientId)
        .order("visit_date", { ascending: false });

      setVisits(data || []);
    } catch (error) {
      console.error("Error fetching visits:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Visit History</h3>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin">
            <div className="w-6 h-6 border-3 border-border border-t-primary rounded-full" />
          </div>
        </div>
      ) : visits.length === 0 ? (
        <div className="text-center py-12 bg-muted-background rounded-lg">
          <Calendar className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-muted-foreground">No visit records yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {visits.map((visit) => (
            <div
              key={visit.id}
              className="border border-border rounded-lg p-4 hover:bg-muted-background transition"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-foreground capitalize">
                    {visit.visit_type} Visit
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(visit.visit_date).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded capitalize ${
                    visit.status === "completed"
                      ? "bg-success/10 text-success"
                      : "bg-muted-background text-muted-foreground"
                  }`}
                >
                  {visit.status}
                </span>
              </div>

              {visit.chief_complaint && (
                <div className="mb-3">
                  <p className="text-xs text-muted-foreground font-medium mb-1">Chief Complaint</p>
                  <p className="text-sm text-foreground">{visit.chief_complaint}</p>
                </div>
              )}

              {visit.clinical_notes && (
                <div className="mb-3">
                  <p className="text-xs text-muted-foreground font-medium mb-1">Clinical Notes</p>
                  <p className="text-sm text-foreground">{visit.clinical_notes}</p>
                </div>
              )}

              {visit.diagnosis && visit.diagnosis.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-muted-foreground font-medium mb-1">Diagnosis</p>
                  <div className="flex flex-wrap gap-2">
                    {visit.diagnosis.map((diag, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
                      >
                        {diag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Physician: {visit.physician?.full_name}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
