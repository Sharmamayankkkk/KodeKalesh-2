"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function LabResultsDistributionChart() {
  const supabase = createClient();
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: results } = await supabase.from("lab_results").select("*");

        // Group by test category
        const categoryData: { [key: string]: { normal: number; abnormal: number; critical: number } } = {};

        results?.forEach((result) => {
          const category = result.test_category;
          if (!categoryData[category]) {
            categoryData[category] = { normal: 0, abnormal: 0, critical: 0 };
          }
          categoryData[category][result.status]++;
        });

        const chartData = Object.entries(categoryData).map(([category, counts]) => ({
          category,
          ...counts,
        }));

        setData(chartData);
      } catch (error) {
        console.error("Error fetching lab results data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-background border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Lab Results by Category</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="category" stroke="var(--color-muted-foreground)" />
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
          <Bar dataKey="normal" fill="#10b981" />
          <Bar dataKey="abnormal" fill="#f59e0b" />
          <Bar dataKey="critical" fill="#ef4444" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
