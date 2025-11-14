"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { X } from 'lucide-react';
import { calculateBMI } from "@/lib/utils";

interface AddVitalsModalProps {
  patientId: string;
  onClose: () => void;
  onVitalAdded: () => void;
}

export default function AddVitalsModal({ patientId, onClose, onVitalAdded }: AddVitalsModalProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    temperature: "",
    systolicBP: "",
    diastolicBP: "",
    heartRate: "",
    respiratoryRate: "",
    oxygenSaturation: "",
    weight: "",
    height: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const bmi = formData.weight && formData.height
        ? calculateBMI(parseFloat(formData.weight), parseFloat(formData.height))
        : null;

      const { error: insertError } = await supabase.from("vital_signs").insert({
        patient_id: patientId,
        measured_at: new Date().toISOString(),
        temperature: formData.temperature ? parseFloat(formData.temperature) : null,
        systolic_bp: formData.systolicBP ? parseInt(formData.systolicBP) : null,
        diastolic_bp: formData.diastolicBP ? parseInt(formData.diastolicBP) : null,
        heart_rate: formData.heartRate ? parseInt(formData.heartRate) : null,
        respiratory_rate: formData.respiratoryRate ? parseInt(formData.respiratoryRate) : null,
        oxygen_saturation: formData.oxygenSaturation ? parseFloat(formData.oxygenSaturation) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        bmi,
        recorded_by_id: user?.id,
      });

      if (insertError) {
        setError(insertError.message);
      } else {
        onVitalAdded();
      }
    } catch (err) {
      setError("Failed to add vital signs");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background rounded-lg border border-border max-w-md w-full max-h-[90vh] overflow-y-auto shadow-lg">
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-background">
          <h2 className="text-xl font-bold text-foreground">Add Vital Signs</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted-background rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Temperature (°C)
              </label>
              <input
                type="number"
                name="temperature"
                step="0.1"
                value={formData.temperature}
                onChange={handleChange}
                placeholder="37.0"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Heart Rate (bpm)
              </label>
              <input
                type="number"
                name="heartRate"
                value={formData.heartRate}
                onChange={handleChange}
                placeholder="72"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Blood Pressure (Systolic/Diastolic)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                name="systolicBP"
                value={formData.systolicBP}
                onChange={handleChange}
                placeholder="120"
                className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="number"
                name="diastolicBP"
                value={formData.diastolicBP}
                onChange={handleChange}
                placeholder="80"
                className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Respiratory Rate (breaths/min)
              </label>
              <input
                type="number"
                name="respiratoryRate"
                value={formData.respiratoryRate}
                onChange={handleChange}
                placeholder="16"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                SpO2 (%)
              </label>
              <input
                type="number"
                name="oxygenSaturation"
                step="0.1"
                value={formData.oxygenSaturation}
                onChange={handleChange}
                placeholder="98"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                name="weight"
                step="0.1"
                value={formData.weight}
                onChange={handleChange}
                placeholder="70"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Height (cm)
              </label>
              <input
                type="number"
                name="height"
                step="0.1"
                value={formData.height}
                onChange={handleChange}
                placeholder="175"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive rounded-lg p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted-background font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 font-medium transition"
            >
              {loading ? "Adding..." : "Add Vitals"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
