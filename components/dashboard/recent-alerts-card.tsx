'use client';

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { AlertTriangle } from 'lucide-react';

export default function RecentAlertsCard() {
  const supabase = createClient();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecentAlerts = useCallback(async () => {
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
        .select("*, patients!inner(first_name, last_name, primary_physician_id)")
        .eq("status", "open");

      if (userProfile && userProfile.role !== 'admin') {
        query = query.eq("patients.primary_physician_id", user.id);
      }

      const { data, error } = await query
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;

      setAlerts(data || []);
    } catch (error) {
      console.error("Error fetching recent alerts:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchRecentAlerts();
  }, [fetchRecentAlerts]);


  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-destructive';
      case 'high':
        return 'text-warning';
      case 'medium':
        return 'text-info';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-foreground">Recent Alerts</h2>
        <Link href="/dashboard/alerts" className="text-sm text-primary hover:underline font-medium">
          View All
        </Link>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
        </div>
      ) : alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-center">
          <AlertTriangle className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="font-medium text-foreground">No recent alerts</p>
          <p className="text-sm text-muted-foreground">Active alerts for your patients will appear here.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {alerts.map((alert) => (
            <li key={alert.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${getSeverityClass(alert.severity)}`}>
                </div>
                <div>
                  <Link href={`/dashboard/alerts/${alert.id}`} className="font-medium text-foreground hover:underline">
                    {alert.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    Patient: {alert.patients.first_name} {alert.patients.last_name}
                  </p>
                </div>
              </div>
              <span className={`text-xs font-semibold capitalize px-2 py-1 rounded-full ${getSeverityClass(alert.severity)} bg-opacity-10`}>
                {alert.severity}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
