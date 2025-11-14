"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

export default function AlertsSeverityChart() {
  const supabase = createClient();
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const severities = ["critical", "high", "medium", "low"];
        const counts: any[] = [];

        for (const severity of severities) {
          const { count } = await supabase
            .from("alerts")
            .select("*", { count: "exact", head: true })
            .eq("severity", severity);

          counts.push({
            name: severity,
            value: count || 0,
          });
        }

        setData(counts);
      } catch (error) {
        console.error("Error fetching alert data:", error);
      }
    };

    fetchData();
  }, []);

  const colors = {
    critical: "#ef4444",
    high: "#f59e0b",
    medium: "#3b82f6",
    low: "#10b981",
  };

  return (
    <div className="bg-background border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Alert Distribution by Severity</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[entry.name as keyof typeof colors]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-background)",
              border: "1px solid var(--color-border)",
              borderRadius: "0.5rem",
            }}
            labelStyle={{ color: "var(--color-foreground)" }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
