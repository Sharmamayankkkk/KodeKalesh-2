"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Users } from 'lucide-react';

export default function PatientListCard() {
  const supabase = createClient();
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        const { data } = await supabase
          .from("patients")
          .select("id, first_name, last_name, mrn, status")
          .eq("primary_physician_id", user?.id)
          .order("created_at", { ascending: false })
          .limit(5);

        setPatients(data || []);
      } catch (error) {
        console.error("Error fetching patients:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [supabase]);

  return (
    <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-foreground">My Patients</h2>
        <Link
          href="/dashboard/patients"
          className="text-sm text-primary hover:underline font-medium"
        >
          View All
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-muted-background rounded-lg animate-pulse" />
          ))}
        </div>
      ) : patients.length === 0 ? (
        <div className="py-8 text-center">
          <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No patients yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {patients.map((patient) => (
            <Link
              key={patient.id}
              href={`/dashboard/patients/${patient.id}`}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted-background transition group"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition">
                  {patient.first_name} {patient.last_name}
                </p>
                <p className="text-xs text-muted-foreground">MRN: {patient.mrn}</p>
              </div>
              <span className="text-xs px-2 py-1 rounded bg-success/10 text-success whitespace-nowrap ml-2">
                {patient.status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
