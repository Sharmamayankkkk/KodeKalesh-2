
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import StatCard from "@/components/dashboard/stat-card";
import PatientListCard from "@/components/dashboard/patient-list-card";
import RecentAlertsCard from "@/components/dashboard/recent-alerts-card";
import { User, Activity, AlertTriangle, Star } from "lucide-react";

export default async function OverviewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: userProfile } = await supabase
    .from("users")
    .select("*, roles(name)")
    .eq("id", user.id)
    .single();

  const isAdmin = userProfile?.roles?.name === 'admin';

  // Fetch total patients
  let patientsQuery = supabase.from('patients').select('id', { count: 'exact', head: true });
  if (!isAdmin) {
    patientsQuery = patientsQuery.eq('primary_physician_id', user.id);
  }
  const { count: totalPatients } = await patientsQuery;

  // Fetch active alerts
  let alertsQuery = supabase.from('alerts').select('id, patients!inner(*)', { count: 'exact', head: true }).eq('status', 'open');
  if (!isAdmin) {
    alertsQuery = alertsQuery.eq('patients.primary_physician_id', user.id);
  }
  const { count: activeAlerts } = await alertsQuery;


  return (
    <DashboardLayout user={userProfile}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {userProfile?.full_name?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-muted-foreground mt-2">
            Here&apos;s what&apos;s happening with your patients today.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Patients" value={totalPatients || 0} icon={User} />
          <StatCard title="Active Alerts" value={activeAlerts || 0} icon={AlertTriangle} />
          <StatCard title="Patient Rating" value="4.8 / 5" icon={Star} />
          <StatCard title="Bed Occupancy" value="78%" icon={Activity} />
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <RecentAlertsCard />
          </div>
          <div className="md:col-span-1">
            <PatientListCard />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
