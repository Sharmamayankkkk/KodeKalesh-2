"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AlertCircle, TrendingUp, Sparkles } from 'lucide-react';
import Link from "next/link";

export default function RecentAlertsCard() {
  const supabase = createClient();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingAlert, setGeneratingAlert] = useState<string | null>(null);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const { data } = await supabase
        .from("alerts")
        .select("*, patients(first_name, last_name)")
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(5);

      setAlerts(data || []);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  const enhanceAlertWithAI = async (alertId: string) => {
    setGeneratingAlert(alertId);
    try {
      const alert = alerts.find((a) => a.id === alertId);
      const response = await fetch("/api/ai/generate-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alertData: alert,
          patientData: alert.patients,
        }),
      });

      if (response.ok) {
        const { alertMessage } = await response.json();
        // Update alert description with AI-enhanced message
        await supabase
          .from("alerts")
          .update({ description: alertMessage })
          .eq("id", alertId);
        fetchAlerts();
      }
    } catch (error) {
      console.error("Error enhancing alert:", error);
    } finally {
      setGeneratingAlert(null);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-destructive bg-destructive/10";
      case "high":
        return "text-warning bg-warning/10";
      case "medium":
        return "text-info bg-info/10";
      default:
        return "text-muted-foreground bg-muted-background";
    }
  };

  return (
    <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-foreground">Recent Alerts</h2>
        <Link
          href="/dashboard/alerts"
          className="text-sm text-primary hover:underline font-medium"
        >
          View All
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-muted-background rounded-lg animate-pulse" />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className="py-12 text-center">
          <TrendingUp className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No active alerts</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-start gap-3 p-3 border border-border rounded-lg hover:bg-muted-background transition group"
            >
              <div className={`w-2 h-2 mt-1.5 rounded-full ${getSeverityColor(alert.severity)}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {alert.title}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Patient: {alert.patients?.first_name} {alert.patients?.last_name}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => enhanceAlertWithAI(alert.id)}
                  disabled={generatingAlert === alert.id}
                  className="p-1 hover:bg-primary/10 rounded text-primary disabled:opacity-50 transition"
                  title="Enhance with AI"
                >
                  <Sparkles className={`w-4 h-4 ${generatingAlert === alert.id ? "animate-spin" : ""}`} />
                </button>
                <span className={`text-xs font-medium px-2 py-1 rounded ${getSeverityColor(alert.severity)}`}>
                  {alert.severity}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
