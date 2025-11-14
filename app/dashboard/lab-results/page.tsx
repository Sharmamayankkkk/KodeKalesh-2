import { redirect } from 'next/navigation';
import { createClient } from "@/lib/supabase/server";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import LabResultsPage from "@/components/lab-results/lab-results-page";

export default async function LabResultsRoute() {
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

  return (
    <DashboardLayout user={userProfile}>
      <LabResultsPage />
    </DashboardLayout>
  );
}
