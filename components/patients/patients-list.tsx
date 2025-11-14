"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Plus, Search, ChevronRight } from 'lucide-react';
import AddPatientModal from "./add-patient-modal";

export default function PatientsList() {
  const supabase = createClient();
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data } = await supabase
        .from("patients")
        .select("*")
        .eq("primary_physician_id", user?.id)
        .order("created_at", { ascending: false });

      setPatients(data || []);
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Patients</h1>
        <p className="text-muted-foreground mt-2">
          Manage and view all your patients
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-3 w-4 h-4 text-muted-foreground" />
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
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium transition"
        >
          <Plus className="w-5 h-5" />
          Add Patient
        </button>
      </div>

      {/* Patients Table/List */}
      <div className="bg-background border border-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin">
              <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full" />
            </div>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">
              {searchTerm ? "No patients found" : "No patients yet. Add your first patient."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted-background">
                <tr>
                  <th className="text-left p-4 font-semibold text-foreground">Name</th>
                  <th className="text-left p-4 font-semibold text-foreground">MRN</th>
                  <th className="text-left p-4 font-semibold text-foreground hidden md:table-cell">Age</th>
                  <th className="text-left p-4 font-semibold text-foreground hidden md:table-cell">Status</th>
                  <th className="text-right p-4 font-semibold text-foreground w-12" />
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient, idx) => {
                  const age = new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear();
                  return (
                    <tr
                      key={patient.id}
                      className={`border-b border-border hover:bg-muted-background transition ${
                        idx % 2 === 1 ? "bg-muted-background/50" : ""
                      }`}
                    >
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-foreground">
                            {patient.first_name} {patient.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground md:hidden">
                            {patient.status}
                          </p>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">{patient.mrn}</td>
                      <td className="p-4 text-muted-foreground hidden md:table-cell">{age} yrs</td>
                      <td className="p-4 hidden md:table-cell">
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded ${
                            patient.status === "active"
                              ? "bg-success/10 text-success"
                              : "bg-muted-background text-muted-foreground"
                          }`}
                        >
                          {patient.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/dashboard/patients/${patient.id}`}
                          className="text-primary hover:text-primary/80 transition"
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

      {/* Add Patient Modal */}
      {showModal && (
        <AddPatientModal
          onClose={() => setShowModal(false)}
          onPatientAdded={handlePatientAdded}
        />
      )}
    </div>
  );
}
