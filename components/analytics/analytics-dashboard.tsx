"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { BarChart3, TrendingUp, Users, AlertCircle } from 'lucide-react';
import PatientTrendsChart from "./charts/patient-trends-chart";
import AlertsSeverityChart from "./charts/alerts-severity-chart";
import LabResultsDistributionChart from "./charts/lab-results-distribution-chart";
import VitalSignsOverTimeChart from "./charts/vital-signs-over-time-chart";

export default function AnalyticsDashboard() {
  const supabase = createClient();
  const [metrics, setMetrics] = useState({
    totalPatients: 0,
    totalAlerts: 0,
    averageAlertResolutionTime: 0,
    criticalAlertsThisWeek: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Total Patients
        const { count: patientCount } = await supabase
          .from("patients")
          .select("*", { count: "exact", head: true });

        // Total Alerts
        const { count: alertCount } = await supabase
          .from("alerts")
          .select("*", { count: "exact", head: true });

        // Critical Alerts This Week
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const { count: criticalCount } = await supabase
          .from("alerts")
          .select("*", { count: "exact", head: true })
          .eq("severity", "critical")
          .gte("created_at", weekAgo.toISOString());

        setMetrics({
          totalPatients: patientCount || 0,
          totalAlerts: alertCount || 0,
          averageAlertResolutionTime: 2.5, // Mock data
          criticalAlertsThisWeek: criticalCount || 0,
        });
      } catch (error) {
        console.error("Error fetching metrics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics & Reports</h1>
        <p className="text-muted-foreground mt-2">
          Clinical data insights and performance metrics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-background border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Total Patients</h3>
            <Users className="w-5 h-5 text-primary" />
          </div>
          <p className="text-3xl font-bold text-foreground">{metrics.totalPatients}</p>
          <p className="text-xs text-success mt-2">+5% from last month</p>
        </div>

        <div className="bg-background border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Total Alerts</h3>
            <AlertCircle className="w-5 h-5 text-warning" />
          </div>
          <p className="text-3xl font-bold text-foreground">{metrics.totalAlerts}</p>
          <p className="text-xs text-muted-foreground mt-2">All time</p>
        </div>

        <div className="bg-background border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Avg. Resolution Time</h3>
            <TrendingUp className="w-5 h-5 text-info" />
          </div>
          <p className="text-3xl font-bold text-foreground">{metrics.averageAlertResolutionTime}h</p>
          <p className="text-xs text-success mt-2">-12% improvement</p>
        </div>

        <div className="bg-background border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Critical Alerts (Week)</h3>
            <BarChart3 className="w-5 h-5 text-destructive" />
          </div>
          <p className="text-3xl font-bold text-foreground">{metrics.criticalAlertsThisWeek}</p>
          <p className="text-xs text-destructive mt-2">Action required</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PatientTrendsChart />
        <AlertsSeverityChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LabResultsDistributionChart />
        <VitalSignsOverTimeChart />
      </div>
    </div>
  );
}
