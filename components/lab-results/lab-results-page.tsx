"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Search, AlertCircle } from 'lucide-react';

export default function LabResultsPage() {
  const supabase = createClient();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchLabResults();
  }, [statusFilter]);

  const fetchLabResults = async () => {
    try {
      let query = supabase
        .from("lab_results")
        .select("*, patients(first_name, last_name, mrn)")
        .order("result_at", { ascending: false })
        .limit(100);

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data } = await query;
      setResults(data || []);
    } catch (error) {
      console.error("Error fetching lab results:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = results.filter((result) =>
    [result.test_name, result.patients?.first_name, result.patients?.last_name]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "bg-destructive/10 text-destructive";
      case "abnormal":
        return "bg-warning/10 text-warning";
      case "normal":
        return "bg-success/10 text-success";
      default:
        return "bg-muted-background text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Lab Results</h1>
        <p className="text-muted-foreground mt-2">
          View all patient lab results and findings
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-3 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by test name or patient..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Results</option>
          <option value="normal">Normal</option>
          <option value="abnormal">Abnormal</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      <div className="bg-background border border-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin">
              <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full" />
            </div>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-muted-foreground">No lab results found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted-background">
                <tr>
                  <th className="text-left p-4 font-semibold text-foreground">Patient</th>
                  <th className="text-left p-4 font-semibold text-foreground">Test Name</th>
                  <th className="text-left p-4 font-semibold text-foreground">Result</th>
                  <th className="text-left p-4 font-semibold text-foreground hidden md:table-cell">Status</th>
                  <th className="text-left p-4 font-semibold text-foreground hidden lg:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((result, idx) => (
                  <tr
                    key={result.id}
                    className={`border-b border-border hover:bg-muted-background transition ${
                      idx % 2 === 1 ? "bg-muted-background/50" : ""
                    }`}
                  >
                    <td className="p-4 font-medium text-foreground">
                      {result.patients?.first_name} {result.patients?.last_name}
                    </td>
                    <td className="p-4 text-foreground">{result.test_name}</td>
                    <td className="p-4 font-medium text-foreground">
                      {result.result_value} {result.unit}
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded capitalize ${getStatusColor(
                          result.status
                        )}`}
                      >
                        {result.status}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground hidden lg:table-cell text-xs">
                      {result.result_at
                        ? new Date(result.result_at).toLocaleDateString()
                        : new Date(result.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
