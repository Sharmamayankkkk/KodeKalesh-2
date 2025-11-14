import { redirect } from 'next/navigation';
import { createClient } from "@/lib/supabase/server";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import UserManagement from "@/components/admin/user-management";

export default async function UserManagementPage() {
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

  // Fetch all users
  const { data: allUsers } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  // Fetch pending invitations
  const { data: invitations } = await supabase
    .from("user_invitations")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  return (
    <DashboardLayout user={userProfile}>
      <UserManagement users={allUsers || []} invitations={invitations || []} />
    </DashboardLayout>
  );
}
