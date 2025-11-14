'use client';

import { useState, useEffect, useCallback } from "react";
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

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: userProfile } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      let query = supabase
        .from("alerts")
        .select("*, patients!inner(first_name, last_name, mrn, primary_physician_id), users!assigned_to_id(full_name)");

      if (userProfile && userProfile.role !== 'admin') {
        query = query.eq("patients.primary_physician_id", user.id);
      }
      
      if (filter !== "all") {
        query = query.eq("status", filter);
      }

      if (severityFilter !== "all") {
        query = query.eq("severity", severityFilter);
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      
      if (error) throw error;
      
      setAlerts(data || []);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      setAlerts([]); // Clear alerts on error
    } finally {
      setLoading(false);
    }
  }, [supabase, filter, severityFilter]);

  useEffect(() => {
    fetchAlerts();

    const channel = supabase
      .channel('custom-all-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, (payload: any) => {
        console.log('Change received!', payload)
        fetchAlerts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAlerts]);

  const stats = {
    critical: alerts.filter((a) => a.severity === "critical" && a.status === "open").length,
    high: alerts.filter((a) => a.severity === "high" && a.status === "open").length,
    open: alerts.filter((a) => a.status === "open").length,
    resolved: alerts.filter((a) => a.status === "resolved").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Clinical Alerts</h1>
        <p className="text-muted-foreground mt-2">
          Manage and monitor critical patient alerts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={AlertCircle} title="Critical" value={stats.critical} color="text-destructive" />
        <StatCard icon={Zap} title="High Priority" value={stats.high} color="text-warning" />
        <StatCard icon={Clock} title="Open" value={stats.open} color="text-info" />
        <StatCard icon={CheckCircle2} title="Resolved" value={stats.resolved} color="text-success" />
      </div>

      <AlertFilters
        filter={filter}
        severityFilter={severityFilter}
        onFilterChange={setFilter}
        onSeverityChange={setSeverityFilter}
      />

      <AlertsTable alerts={alerts} loading={loading} onAlertsChange={fetchAlerts} />
    </div>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: number;
  color: string;
}

function StatCard({ icon: Icon, title, value, color }: StatCardProps) {
  return (
    <div className="bg-background border border-border rounded-lg p-4 flex items-center gap-4">
      <div className={`p-2 bg-muted rounded-lg ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
      </div>
    </div>
  );
}
