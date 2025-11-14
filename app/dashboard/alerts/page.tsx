import { redirect } from 'next/navigation';
import { createClient } from "@/lib/supabase/server";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import AlertsManagement from "@/components/alerts/alerts-management";

export default async function AlertsPage() {
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
      <AlertsManagement />
    </DashboardLayout>
  );
}
