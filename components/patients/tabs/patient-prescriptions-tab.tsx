"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Pill } from 'lucide-react';

interface PatientPrescriptionsTabProps {
  patientId: string;
}

export default function PatientPrescriptionsTab({ patientId }: PatientPrescriptionsTabProps) {
  const supabase = createClient();
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrescriptions();
  }, [patientId]);

  const fetchPrescriptions = async () => {
    try {
      const { data } = await supabase
        .from("prescriptions")
        .select("*")
        .eq("patient_id", patientId)
        .order("start_date", { ascending: false });

      setPrescriptions(data || []);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  const isActive = (prescription: any) => {
    if (prescription.status === "discontinued") return false;
    if (!prescription.end_date) return true;
    return new Date(prescription.end_date) > new Date();
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Prescriptions</h3>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin">
            <div className="w-6 h-6 border-3 border-border border-t-primary rounded-full" />
          </div>
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="text-center py-12 bg-muted-background rounded-lg">
          <Pill className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-muted-foreground">No prescriptions</p>
        </div>
      ) : (
        <div className="space-y-3">
          {prescriptions.map((prescription) => {
            const active = isActive(prescription);
            return (
              <div
                key={prescription.id}
                className={`border rounded-lg p-4 hover:bg-muted-background transition ${
                  active ? "border-border" : "border-muted-background opacity-60"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-foreground">
                      {prescription.medication_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {prescription.dosage} • {prescription.frequency}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded capitalize ${
                      active
                        ? "bg-success/10 text-success"
                        : "bg-muted-background text-muted-foreground"
                    }`}
                  >
                    {active ? "Active" : prescription.status}
                  </span>
                </div>

                {prescription.indication && (
                  <p className="text-xs text-muted-foreground mb-2">
                    Indication: {prescription.indication}
                  </p>
                )}

                <p className="text-xs text-muted-foreground">
                  Route: {prescription.route} • Refills: {prescription.refills_remaining || 0}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
