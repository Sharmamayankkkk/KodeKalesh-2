import { redirect } from 'next/navigation';
import { createClient } from "@/lib/supabase/server";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import OverviewTab from "@/components/dashboard/overview-tab";

// Role-specific dashboard redirects
const ROLE_DASHBOARDS: Record<string, string> = {
  admin: "/dashboard/admin",
  doctor: "/dashboard/overview",
  nurse: "/dashboard/overview",
  lab_technician: "/dashboard/lab-results",
  pharmacist: "/dashboard/prescriptions",
  receptionist: "/dashboard/patients",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch user profile
  const { data: userProfile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  // Redirect to role-specific dashboard if configured
  if (userProfile?.role && ROLE_DASHBOARDS[userProfile.role]) {
    redirect(ROLE_DASHBOARDS[userProfile.role]);
  }

  // Default fallback to overview
  return (
    <DashboardLayout user={userProfile}>
      <OverviewTab user={userProfile} />
    </DashboardLayout>
  );
}
