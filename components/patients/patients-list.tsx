"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Plus, Search, ChevronRight, User } from 'lucide-react';
import AddPatientModal from "./add-patient-modal";
import { Spinner } from "@/components/ui/spinner";
import { Empty } from "@/components/ui/empty";

export default function PatientsList() {
  const supabase = createClient();
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);

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

      let query = supabase.from("patients").select("*");

      if (userProfile && userProfile.role !== 'admin') {
        query = query.eq("primary_physician_id", user.id);
      }

      const { data } = await query.order("created_at", { ascending: false });
      setPatients(data || []);

    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const filteredPatients = patients.filter((patient) =>
    [patient.first_name, patient.last_name, patient.mrn]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handlePatientAdded = () => {
    setShowModal(false);
    fetchPatients();
  };
  
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Patients</h1>
        <p className="text-muted-foreground mt-2">
          Manage and view details for all your patients.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or MRN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium transition shrink-0"
        >
          <Plus className="w-5 h-5" />
          Add Patient
        </button>
      </div>

      <div className="bg-background border border-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center flex justify-center items-center">
            <Spinner size="large" />
          </div>
        ) : filteredPatients.length === 0 ? (
          <Empty
            icon={<User />}
            title={searchTerm ? "No patients found" : "No patients yet"}
            description={searchTerm ? "Try adjusting your search query." : "Add your first patient to get started."}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left p-4 font-semibold text-foreground">Name</th>
                  <th className="text-left p-4 font-semibold text-foreground hidden md:table-cell">MRN</th>
                  <th className="text-left p-4 font-semibold text-foreground hidden md:table-cell">Age</th>
                  <th className="text-left p-4 font-semibold text-foreground hidden sm:table-cell">Status</th>
                  <th className="text-right p-4 font-semibold text-foreground w-12" />
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => {
                  const age = new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear();
                  return (
                    <tr
                      key={patient.id}
                      className="border-b border-border hover:bg-muted/50 transition"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-foreground">
                            {getInitials(patient.first_name, patient.last_name)}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {patient.first_name} {patient.last_name}
                            </p>
                             <p className="text-xs text-muted-foreground md:hidden">
                              {patient.mrn}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground hidden md:table-cell">{patient.mrn}</td>
                      <td className="p-4 text-muted-foreground hidden md:table-cell">{age} yrs</td>
                      <td className="p-4 hidden sm:table-cell">
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${
                            patient.status === "active"
                              ? "bg-success/10 text-success"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {patient.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/dashboard/patients/${patient.id}`}
                          className="text-primary hover:text-primary/80 transition"
                          title="View Details"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <AddPatientModal
          onClose={() => setShowModal(false)}
          onPatientAdded={handlePatientAdded}
        />
      )}
    </div>
  );
}
