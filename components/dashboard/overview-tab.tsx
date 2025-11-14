"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Users, AlertCircle, TrendingUp, Heart } from 'lucide-react';
import StatCard from "./stat-card";
import RecentAlertsCard from "./recent-alerts-card";
import PatientListCard from "./patient-list-card";

interface OverviewTabProps {
  user?: any;
}

export default function OverviewTab({ user }: OverviewTabProps) {
  const supabase = createClient();
  const [stats, setStats] = useState({
    totalPatients: 0,
    activeAlerts: 0,
    avgPatientRating: 0,
    bedOccupancy: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch patient count
        const { count: patientCount } = await supabase
          .from("patients")
          .select("*", { count: "exact", head: true })
          .eq("primary_physician_id", user?.id);

        // Fetch active alerts count
        const { count: alertCount } = await supabase
          .from("alerts")
          .select("*", { count: "exact", head: true })
          .eq("status", "open");

        setStats({
          totalPatients: patientCount || 0,
          activeAlerts: alertCount || 0,
          avgPatientRating: 4.8,
          bedOccupancy: 78,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchStats();
    }
  }, [user?.id, supabase]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {user?.full_name?.split(" ")[0] || "Doctor"}
        </h1>
        <p className="text-muted-foreground mt-2">
          Here's what's happening with your patients today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Patients"
          value={stats.totalPatients}
          icon={Users}
          trend={12}
          color="primary"
          loading={loading}
        />
        <StatCard
          title="Active Alerts"
          value={stats.activeAlerts}
          icon={AlertCircle}
          trend={-5}
          color="destructive"
          loading={loading}
        />
        <StatCard
          title="Patient Rating"
          value={`${stats.avgPatientRating}`}
          icon={Heart}
          trend={3}
          color="success"
          suffix="/5"
          loading={loading}
        />
        <StatCard
          title="Bed Occupancy"
          value={`${stats.bedOccupancy}%`}
          icon={TrendingUp}
          trend={8}
          color="info"
          loading={loading}
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentAlertsCard />
        </div>
        <div>
          <PatientListCard />
        </div>
      </div>
    </div>
  );
}
