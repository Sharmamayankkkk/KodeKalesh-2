"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { X } from 'lucide-react';

interface AddLabResultModalProps {
  patientId: string;
  onClose: () => void;
  onLabResultAdded: () => void;
}

export default function AddLabResultModal({
  patientId,
  onClose,
  onLabResultAdded,
}: AddLabResultModalProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    testName: "",
    testCategory: "chemistry",
    resultValue: "",
    unit: "",
    referenceRange: "",
    status: "normal",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

      const { error: insertError } = await supabase.from("lab_results").insert({
        patient_id: patientId,
        test_name: formData.testName,
        test_category: formData.testCategory,
        result_value: formData.resultValue ? parseFloat(formData.resultValue) : null,
        unit: formData.unit,
        reference_range: formData.referenceRange,
        status: formData.status,
        ordered_by_id: user?.id,
        ordered_at: new Date().toISOString(),
        result_at: new Date().toISOString(),
      });

      if (insertError) {
        setError(insertError.message);
      } else {
        onLabResultAdded();
      }
    } catch (err) {
      setError("Failed to add lab result");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background rounded-lg border border-border max-w-md w-full max-h-[90vh] overflow-y-auto shadow-lg">
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-background">
          <h2 className="text-xl font-bold text-foreground">Add Lab Result</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted-background rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Test Name
            </label>
            <input
              type="text"
              name="testName"
              value={formData.testName}
              onChange={handleChange}
              placeholder="e.g., Blood Glucose"
              required
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Test Category
            </label>
            <select
              name="testCategory"
              value={formData.testCategory}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="chemistry">Chemistry</option>
              <option value="hematology">Hematology</option>
              <option value="microbiology">Microbiology</option>
              <option value="imaging">Imaging</option>
              <option value="urinalysis">Urinalysis</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Result Value
            </label>
            <input
              type="number"
              name="resultValue"
              step="0.01"
              value={formData.resultValue}
              onChange={handleChange}
              placeholder="95"
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Unit
            </label>
            <input
              type="text"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              placeholder="mg/dL"
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Reference Range
            </label>
            <input
              type="text"
              name="referenceRange"
              value={formData.referenceRange}
              onChange={handleChange}
              placeholder="70-100"
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="normal">Normal</option>
              <option value="abnormal">Abnormal</option>
              <option value="critical">Critical</option>
            </select>
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
              {loading ? "Adding..." : "Add Result"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
