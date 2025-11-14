"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Users, Settings, Shield, TrendingUp } from 'lucide-react';
import UserManagementTab from "./tabs/user-management-tab";
import SystemSettingsTab from "./tabs/system-settings-tab";

export default function AdminDashboard() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState("users");
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPatients: 0,
    systemHealth: 98,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { count: userCount } = await supabase
          .from("users")
          .select("*", { count: "exact", head: true });

        const { count: patientCount } = await supabase
          .from("patients")
          .select("*", { count: "exact", head: true });

        setStats({
          totalUsers: userCount || 0,
          totalPatients: patientCount || 0,
          systemHealth: 98,
        });
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      }
    };

    fetchStats();
  }, []);

  const tabs = [
    { id: "users", label: "User Management", icon: Users },
    { id: "settings", label: "System Settings", icon: Settings },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Administration</h1>
        <p className="text-muted-foreground mt-2">
          System management and user administration
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-background border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Total Users</h3>
            <Users className="w-5 h-5 text-primary" />
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.totalUsers}</p>
        </div>

        <div className="bg-background border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Total Patients</h3>
            <Shield className="w-5 h-5 text-info" />
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.totalPatients}</p>
        </div>

        <div className="bg-background border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">System Health</h3>
            <TrendingUp className="w-5 h-5 text-success" />
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.systemHealth}%</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-background border border-border rounded-lg">
        <div className="flex border-b border-border overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-medium text-sm whitespace-nowrap transition border-b-2 ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {activeTab === "users" && <UserManagementTab />}
          {activeTab === "settings" && <SystemSettingsTab />}
        </div>
      </div>
    </div>
  );
}
