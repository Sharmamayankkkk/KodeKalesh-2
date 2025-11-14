"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus } from 'lucide-react';
import AddVitalsModal from "../modals/add-vitals-modal";

interface PatientVitalsTabProps {
  patientId: string;
}

export default function PatientVitalsTab({ patientId }: PatientVitalsTabProps) {
  const supabase = createClient();
  const [vitals, setVitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchVitals();
  }, [patientId]);

  const fetchVitals = async () => {
    try {
      const { data } = await supabase
        .from("vital_signs")
        .select("*")
        .eq("patient_id", patientId)
        .order("measured_at", { ascending: false })
        .limit(10);

      setVitals(data || []);
    } catch (error) {
      console.error("Error fetching vitals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVitalAdded = () => {
    setShowModal(false);
    fetchVitals();
  };

  const getStatusColor = (metric: string, value: number) => {
    // Simple vital signs validation
    if (metric === "heart_rate" && (value < 60 || value > 100)) return "text-warning";
    if (metric === "systolic_bp" && value > 140) return "text-destructive";
    if (metric === "temperature" && (value < 36.5 || value > 37.5)) return "text-warning";
    return "text-foreground";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Vital Signs</h3>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm font-medium transition"
        >
          <Plus className="w-4 h-4" />
          Add Vitals
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin">
            <div className="w-6 h-6 border-3 border-border border-t-primary rounded-full" />
          </div>
        </div>
      ) : vitals.length === 0 ? (
        <div className="text-center py-12 bg-muted-background rounded-lg">
          <p className="text-muted-foreground">No vital signs recorded yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {vitals.map((vital) => (
            <div
              key={vital.id}
              className="border border-border rounded-lg p-4 hover:bg-muted-background transition"
            >
              <div className="flex items-start justify-between mb-3">
                <p className="text-sm text-muted-foreground">
                  {new Date(vital.measured_at).toLocaleString()}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {vital.heart_rate && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Heart Rate</p>
                    <p className={`text-lg font-semibold ${getStatusColor("heart_rate", vital.heart_rate)}`}>
                      {vital.heart_rate} bpm
                    </p>
                  </div>
                )}
                {vital.systolic_bp && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Blood Pressure</p>
                    <p className={`text-lg font-semibold ${getStatusColor("systolic_bp", vital.systolic_bp)}`}>
                      {vital.systolic_bp}/{vital.diastolic_bp} mmHg
                    </p>
                  </div>
                )}
                {vital.temperature && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Temperature</p>
                    <p className={`text-lg font-semibold ${getStatusColor("temperature", vital.temperature)}`}>
                      {vital.temperature}°C
                    </p>
                  </div>
                )}
                {vital.oxygen_saturation && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">SpO2</p>
                    <p className="text-lg font-semibold text-foreground">
                      {vital.oxygen_saturation}%
                    </p>
                  </div>
                )}
              </div>

              {vital.bmi && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-1">BMI</p>
                  <p className="text-sm font-medium text-foreground">{vital.bmi}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <AddVitalsModal
          patientId={patientId}
          onClose={() => setShowModal(false)}
          onVitalAdded={handleVitalAdded}
        />
      )}
    </div>
  );
}
