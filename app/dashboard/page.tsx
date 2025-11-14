import { redirect } from 'next/navigation';
import { createClient } from "@/lib/supabase/server";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import OverviewTab from "@/components/dashboard/overview-tab";

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

  return (
    <DashboardLayout user={userProfile}>
      <OverviewTab user={userProfile} />
    </DashboardLayout>
  );
}
