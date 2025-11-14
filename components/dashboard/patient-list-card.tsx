'use client';

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Users } from 'lucide-react';

export default function PatientListCard() {
  const supabase = createClient();
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: userProfile } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      let query = supabase.from("patients").select("id, first_name, last_name, mrn, status");

      if (userProfile && userProfile.role !== 'admin') {
        query = query.eq("primary_physician_id", user.id);
      }

      const { data } = await query.order("created_at", { ascending: false }).limit(5);

      setPatients(data || []);
    } catch (error) {
      console.error("Error fetching recent patients:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
  };

  return (
    <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-foreground">My Patients</h2>
        <Link href="/dashboard/patients" className="text-sm text-primary hover:underline font-medium">
          View All
        </Link>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
        </div>
      ) : patients.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-center">
          <Users className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="font-medium text-foreground">No patients yet</p>
          <p className="text-sm text-muted-foreground">Assigned patients will appear here.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {patients.map((patient) => (
            <li key={patient.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-foreground">
                  {getInitials(patient.first_name, patient.last_name)}
                </div>
                <div>
                  <p className="font-medium text-foreground">{patient.first_name} {patient.last_name}</p>
                  <p className="text-sm text-muted-foreground">MRN: {patient.mrn}</p>
                </div>
              </div>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${
                  patient.status === 'active'
                    ? 'bg-success/10 text-success'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {patient.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
