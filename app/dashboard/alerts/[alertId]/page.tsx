
import { redirect } from 'next/navigation';
import { createClient } from "@/lib/supabase/server";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { AlertDetails } from "@/components/alerts/alert-details";

export default async function AlertDetailsPage({ params }: { params: { alertId: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch user profile with role
  const { data: userProfile } = await supabase
    .from("users")
    .select("*, roles(name)")
    .eq("id", user.id)
    .single();
    
  // Fetch alert with the patient's primary physician ID for the security check
  const { data: alert, error } = await supabase
    .from('alerts')
    .select(`
      *,
      patients(first_name, last_name, mrn, date_of_birth, primary_physician_id),
      assigned_user:users!assigned_to_id(full_name),
      acknowledged_user:users!acknowledged_by_id(full_name)
    `)
    .eq('id', params.alertId)
    .single();

  // Initial check for fetch error or if alert does not exist
  if (error || !alert) {
    console.error("Error fetching alert:", error);
    redirect("/dashboard/alerts");
  }
  
  // Security check: ensure non-admin users can only see alerts for their own patients
  const isAdmin = userProfile?.roles?.name === 'admin';
  if (!isAdmin && alert.patients.primary_physician_id !== user.id) {
      // Redirect if the user is not an admin and the patient is not assigned to them
      redirect("/dashboard/alerts");
  }

  return (
    <DashboardLayout user={userProfile}>
      <AlertDetails alert={alert} />
    </DashboardLayout>
  );
}
