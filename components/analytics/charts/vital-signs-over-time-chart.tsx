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

export default function VitalSignsOverTimeChart() {
  const supabase = createClient();
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: vitals } = await supabase
          .from("vital_signs")
          .select("*")
          .order("measured_at", { ascending: true })
          .limit(30);

        const chartData = vitals?.map((vital) => ({
          time: new Date(vital.measured_at).toLocaleDateString(),
          heartRate: vital.heart_rate,
          temp: vital.temperature,
        })) || [];

        setData(chartData);
      } catch (error) {
        console.error("Error fetching vital signs data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-background border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Vital Signs Trends</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="time" stroke="var(--color-muted-foreground)" />
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
            dataKey="heartRate"
            stroke="#ef4444"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="temp"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
