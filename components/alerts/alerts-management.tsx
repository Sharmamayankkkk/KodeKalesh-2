"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { AlertCircle, CheckCircle2, Clock, Zap } from 'lucide-react';
import AlertsTable from "./alerts-table";
import AlertFilters from "./alert-filters";

export default function AlertsManagement() {
  const supabase = createClient();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("open");
  const [severityFilter, setSeverityFilter] = useState("all");

  useEffect(() => {
    fetchAlerts();
    
    // Subscribe to real-time updates
    const subscription = supabase
      .channel("alerts_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "alerts" },
        () => fetchAlerts()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchAlerts = async () => {
    try {
      let query = supabase
        .from("alerts")
        .select("*, patients(first_name, last_name, mrn), users(full_name)")
        .order("created_at", { ascending: false });

      if (filter !== "all") {
        query = query.eq("status", filter);
      }

      if (severityFilter !== "all") {
        query = query.eq("severity", severityFilter);
      }

      const { data } = await query;
      setAlerts(data || []);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [filter, severityFilter]);

  const stats = {
    critical: alerts.filter((a) => a.severity === "critical").length,
    high: alerts.filter((a) => a.severity === "high").length,
    acknowledged: alerts.filter((a) => a.status === "acknowledged").length,
    resolved: alerts.filter((a) => a.status === "resolved").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Clinical Alerts</h1>
        <p className="text-muted-foreground mt-2">
          Manage patient alerts and critical findings
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-background border border-border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <p className="text-xs text-muted-foreground font-medium">Critical</p>
          </div>
          <p className="text-2xl font-bold text-destructive">{stats.critical}</p>
        </div>

        <div className="bg-background border border-border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-5 h-5 text-warning" />
            <p className="text-xs text-muted-foreground font-medium">High Priority</p>
          </div>
          <p className="text-2xl font-bold text-warning">{stats.high}</p>
        </div>

        <div className="bg-background border border-border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-info" />
            <p className="text-xs text-muted-foreground font-medium">Acknowledged</p>
          </div>
          <p className="text-2xl font-bold text-info">{stats.acknowledged}</p>
        </div>

        <div className="bg-background border border-border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <p className="text-xs text-muted-foreground font-medium">Resolved</p>
          </div>
          <p className="text-2xl font-bold text-success">{stats.resolved}</p>
        </div>
      </div>

      {/* Filters */}
      <AlertFilters
        filter={filter}
        severityFilter={severityFilter}
        onFilterChange={setFilter}
        onSeverityChange={setSeverityFilter}
      />

      {/* Alerts Table */}
      <AlertsTable alerts={alerts} loading={loading} onAlertsChange={fetchAlerts} />
    </div>
  );
}
