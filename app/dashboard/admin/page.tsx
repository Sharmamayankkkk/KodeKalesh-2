import { redirect } from 'next/navigation';
import { createClient } from "@/lib/supabase/server";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import AdminDashboard from "@/components/admin/admin-dashboard";

export default async function AdminPage() {
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

  // Check if user is admin
  if (userProfile?.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <DashboardLayout user={userProfile}>
      <AdminDashboard />
    </DashboardLayout>
  );
}
