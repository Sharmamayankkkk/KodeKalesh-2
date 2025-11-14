"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function PatientTrendsChart() {
  const supabase = createClient();
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: patients } = await supabase
          .from("patients")
          .select("created_at")
          .order("created_at", { ascending: true });

        // Group by month
        const monthData: { [key: string]: number } = {};
        patients?.forEach((patient) => {
          const date = new Date(patient.created_at);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
            2,
            "0"
          )}`;
          monthData[monthKey] = (monthData[monthKey] || 0) + 1;
        });

        const chartData = Object.entries(monthData)
          .map(([month, count]) => ({
            month,
            patients: count,
          }))
          .slice(-12); // Last 12 months

        setData(chartData);
      } catch (error) {
        console.error("Error fetching patient data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-background border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Patient Enrollment Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
          <YAxis stroke="var(--color-muted-foreground)" />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-background)",
              border: "1px solid var(--color-border)",
              borderRadius: "0.5rem",
            }}
            labelStyle={{ color: "var(--color-foreground)" }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="patients"
            stroke="var(--color-primary)"
            strokeWidth={2}
            dot={{ fill: "var(--color-primary)" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
