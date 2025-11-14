import { createClient } from "@/lib/supabase/server";
import LandingPage from "@/components/landing/landing-page";
import { redirect } from 'next/navigation';

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is already logged in, redirect to dashboard
  if (user) {
    redirect("/dashboard");
  }

  // Show landing page for non-authenticated users
  return <LandingPage />;
}
