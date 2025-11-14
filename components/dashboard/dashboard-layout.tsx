"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { Menu, X, LogOut, LayoutDashboard, Users, AlertCircle, BarChart3, Settings, ChevronDown } from 'lucide-react';
import { createClient } from "@/lib/supabase/client";
import MobileNav from "./mobile-nav";
import SidebarNav from "./sidebar-nav";

interface DashboardLayoutProps {
  children: React.ReactNode;
  user?: any;
}

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const userRole = user?.role || "doctor";

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-border bg-background flex-col">
        <div className="p-6 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-foreground">HealthPulse</h1>
              <p className="text-xs text-muted-foreground">Pro</p>
            </div>
          </Link>
        </div>

        <SidebarNav userRole={userRole} />

        {/* User Profile */}
        <div className="mt-auto p-6 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.full_name || "User"}
              </p>
              <p className="text-xs text-muted-foreground truncate capitalize">
                {userRole}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-muted-background rounded-lg transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-background border-b border-border z-40 flex items-center justify-between px-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-muted-background rounded-lg"
        >
          {sidebarOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>

        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <LayoutDashboard className="w-5 h-5 text-primary-foreground" />
        </div>

        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 px-3 py-2 hover:bg-muted-background rounded-lg"
          >
            <ChevronDown className="w-4 h-4" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-background border border-border rounded-lg shadow-lg">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-destructive hover:bg-muted-background rounded-lg"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <MobileNav
          userRole={userRole}
          onClose={() => setSidebarOpen(false)}
          user={user}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto pt-16 md:pt-0">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
