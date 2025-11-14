import { createClient } from "@/lib/supabase/middleware";
import { NextResponse, type NextRequest } from "next/server";

// Define role-based route permissions
const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: [
    "/dashboard/admin",
    "/dashboard/admin/users",
    "/dashboard/analytics",
    "/dashboard/patients",
    "/dashboard/lab-results",
    "/dashboard/prescriptions",
    "/dashboard/alerts",
    "/dashboard/devices",
  ],
  doctor: [
    "/dashboard",
    "/dashboard/overview",
    "/dashboard/patients",
    "/dashboard/lab-results",
    "/dashboard/prescriptions",
    "/dashboard/alerts",
    "/dashboard/analytics",
    "/dashboard/devices",
  ],
  nurse: [
    "/dashboard",
    "/dashboard/overview",
    "/dashboard/patients",
    "/dashboard/alerts",
  ],
  lab_technician: [
    "/dashboard",
    "/dashboard/lab-results",
    "/dashboard/patients",
  ],
  pharmacist: [
    "/dashboard",
    "/dashboard/prescriptions",
    "/dashboard/patients",
  ],
  receptionist: [
    "/dashboard",
    "/dashboard/patients",
  ],
};

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);

  // Refresh session if expired - required for Server Components
  // https://supabase.com/docs/guides/auth/auth-helpers/nextjs#managing-session-with-middleware
  const { data: { session } } = await supabase.auth.getSession();

  const path = request.nextUrl.pathname;

  // If accessing dashboard routes, check authentication and role permissions
  if (path.startsWith("/dashboard")) {
    // Redirect to login if not authenticated
    if (!session) {
      const redirectUrl = new URL("/auth/login", request.url);
      redirectUrl.searchParams.set("redirect", path);
      return NextResponse.redirect(redirectUrl);
    }

    // Get user profile to check role
    const { data: userProfile } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (userProfile?.role) {
      const userRole = userProfile.role;
      const allowedPaths = ROLE_PERMISSIONS[userRole] || [];

      // Check if user has permission to access this path
      const hasPermission = allowedPaths.some((allowedPath) => {
        // Exact match or starts with allowed path
        return path === allowedPath || path.startsWith(allowedPath + "/");
      });

      // If user doesn't have permission, redirect to their default dashboard
      if (!hasPermission && path !== "/dashboard") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
