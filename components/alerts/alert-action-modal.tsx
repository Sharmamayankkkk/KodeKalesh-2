"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { X } from 'lucide-react';

interface AlertActionModalProps {
  alert: any;
  actionType: "acknowledge" | "resolve";
  onClose: () => void;
  onActionComplete: () => void;
}

export default function AlertActionModal({
  alert,
  actionType,
  onClose,
  onActionComplete,
}: AlertActionModalProps) {
  const supabase = createClient();
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const updateData =
        actionType === "acknowledge"
          ? {
              status: "acknowledged",
              acknowledged_at: new Date().toISOString(),
              acknowledged_by_id: user?.id,
            }
          : {
              status: "resolved",
              resolved_at: new Date().toISOString(),
              resolution_notes: notes,
            };

      const { error: updateError } = await supabase
        .from("alerts")
        .update(updateData)
        .eq("id", alert.id);

      if (updateError) {
        setError(updateError.message);
      } else {
        onActionComplete();
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const title =
    actionType === "acknowledge"
      ? "Acknowledge Alert"
      : "Resolve Alert";
  const buttonLabel =
    actionType === "acknowledge" ? "Acknowledge" : "Resolve";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background rounded-lg border border-border max-w-md w-full shadow-lg">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted-background rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <p className="text-sm text-foreground font-medium mb-2">Alert Details</p>
            <div className="bg-muted-background rounded-lg p-3">
              <p className="text-sm font-medium text-foreground">{alert.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
            </div>
          </div>

          {actionType === "resolve" && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Resolution Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe the resolution..."
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>
          )}

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
              className={`flex-1 px-4 py-2 text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 font-medium transition ${
                actionType === "acknowledge"
                  ? "bg-info hover:bg-info/90"
                  : "bg-success hover:bg-success/90"
              }`}
            >
              {loading ? `${buttonLabel}ing...` : buttonLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
