import { redirect } from 'next/navigation';
import { createClient } from "@/lib/supabase/server";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import PatientAIAnalysis from "@/components/ai/patient-ai-analysis";

interface PatientAnalysisPageProps {
  params: Promise<{ id: string }>;
}

export default async function PatientAnalysisPage({ params }: PatientAnalysisPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: userProfile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  const { id } = await params;

  return (
    <DashboardLayout user={userProfile}>
      <PatientAIAnalysis patientId={id} />
    </DashboardLayout>
  );
}
