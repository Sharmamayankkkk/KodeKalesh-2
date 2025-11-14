"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { ChevronLeft, Heart, Droplet, Pill, FileText, AlertCircle, Sparkles } from 'lucide-react';
import Link from "next/link";
import { calculateAge } from "@/lib/utils";
import PatientVitalsTab from "./tabs/patient-vitals-tab";
import PatientLabResultsTab from "./tabs/patient-lab-results-tab";
import PatientVisitsTab from "./tabs/patient-visits-tab";
import PatientPrescriptionsTab from "./tabs/patient-prescriptions-tab";
import { cn } from "@/lib/utils";

interface PatientDetailProps {
  patientId: string;
}

export default function PatientDetail({ patientId }: PatientDetailProps) {
  const supabase = createClient();
  const [patient, setPatient] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("vitals");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatient();
  }, [patientId]);

  const fetchPatient = async () => {
    try {
      const { data } = await supabase
        .from("patients")
        .select("*")
        .eq("id", patientId)
        .single();

      setPatient(data);
    } catch (error) {
      console.error("Error fetching patient:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="inline-block animate-spin">
          <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full" />
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground">Patient not found</p>
      </div>
    );
  }

  const age = calculateAge(patient.date_of_birth);

  const tabs = [
    { id: "vitals", label: "Vital Signs", icon: Heart },
    { id: "lab-results", label: "Lab Results", icon: FileText },
    { id: "visits", label: "Visits", icon: AlertCircle },
    { id: "prescriptions", label: "Prescriptions", icon: Pill },
    { id: "analysis", label: "AI Analysis", icon: Sparkles },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Link
              href="/dashboard/patients"
              className="flex items-center gap-1 text-primary hover:underline text-sm font-medium"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Patients
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            {patient.first_name} {patient.last_name}
          </h1>
          <p className="text-muted-foreground mt-1">
            MRN: {patient.mrn} • Age: {age} • {patient.gender === "M" ? "Male" : "Female"}
          </p>
        </div>
      </div>

      {/* Patient Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-background border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground font-medium mb-1">Blood Type</p>
          <p className="text-lg font-bold text-foreground">{patient.blood_type || "N/A"}</p>
        </div>
        <div className="bg-background border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground font-medium mb-1">Status</p>
          <span
            className={`inline-block text-sm font-medium px-2 py-1 rounded ${
              patient.status === "active"
                ? "bg-success/10 text-success"
                : "bg-muted-background text-muted-foreground"
            }`}
          >
            {patient.status}
          </span>
        </div>
        <div className="bg-background border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground font-medium mb-1">Insurance</p>
          <p className="text-sm text-foreground">{patient.insurance_provider || "N/A"}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-background border border-border rounded-lg">
        <div className="flex border-b border-border overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <div key={tab.id}>
                {tab.id === "analysis" ? (
                  <Link
                    href={`/dashboard/patients/${patientId}/analysis`}
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 font-medium text-sm whitespace-nowrap transition border-b-2",
                      "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </Link>
                ) : (
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 font-medium text-sm whitespace-nowrap transition border-b-2",
                      activeTab === tab.id
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-6">
          {activeTab === "vitals" && <PatientVitalsTab patientId={patientId} />}
          {activeTab === "lab-results" && <PatientLabResultsTab patientId={patientId} />}
          {activeTab === "visits" && <PatientVisitsTab patientId={patientId} />}
          {activeTab === "prescriptions" && <PatientPrescriptionsTab patientId={patientId} />}
        </div>
      </div>
    </div>
  );
}
