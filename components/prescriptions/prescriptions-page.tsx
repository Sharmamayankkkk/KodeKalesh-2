"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Search, Pill } from 'lucide-react';

export default function PrescriptionsPage() {
  const supabase = createClient();
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");

  useEffect(() => {
    fetchPrescriptions();
  }, [statusFilter]);

  const fetchPrescriptions = async () => {
    try {
      let query = supabase
        .from("prescriptions")
        .select("*, patients(first_name, last_name, mrn)")
        .order("start_date", { ascending: false })
        .limit(100);

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data } = await query;
      setPrescriptions(data || []);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPrescriptions = prescriptions.filter((prescription) =>
    [prescription.medication_name, prescription.patients?.first_name, prescription.patients?.last_name]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Prescriptions</h1>
        <p className="text-muted-foreground mt-2">
          Manage patient medications and prescriptions
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-3 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by medication or patient..."
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
          <option value="all">All Prescriptions</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="discontinued">Discontinued</option>
        </select>
      </div>

      <div className="bg-background border border-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin">
              <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full" />
            </div>
          </div>
        ) : filteredPrescriptions.length === 0 ? (
          <div className="p-12 text-center">
            <Pill className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-muted-foreground">No prescriptions found</p>
          </div>
        ) : (
          <div className="grid gap-4 p-4">
            {filteredPrescriptions.map((prescription) => (
              <div
                key={prescription.id}
                className="border border-border rounded-lg p-4 hover:bg-muted-background transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-foreground">
                      {prescription.medication_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {prescription.patients?.first_name} {prescription.patients?.last_name}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded capitalize ${
                      prescription.status === "active"
                        ? "bg-success/10 text-success"
                        : "bg-muted-background text-muted-foreground"
                    }`}
                  >
                    {prescription.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">Dosage</p>
                    <p className="text-foreground">{prescription.dosage}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">Frequency</p>
                    <p className="text-foreground">{prescription.frequency}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">Route</p>
                    <p className="text-foreground capitalize">{prescription.route}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">Refills</p>
                    <p className="text-foreground">{prescription.refills_remaining || 0}</p>
                  </div>
                </div>

                {prescription.indication && (
                  <p className="text-xs text-muted-foreground mt-3">
                    Indication: {prescription.indication}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
