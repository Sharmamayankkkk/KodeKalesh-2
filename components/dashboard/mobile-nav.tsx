"use client";

import Link from "next/link";
import { usePathname, useRouter } from 'next/navigation';
import { X, LogOut } from 'lucide-react';
import { createClient } from "@/lib/supabase/client";
import SidebarNav from "./sidebar-nav";

interface MobileNavProps {
  userRole: string;
  onClose: () => void;
  user?: any;
}

export default function MobileNav({ userRole, onClose, user }: MobileNavProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <div className="fixed inset-0 z-30 md:hidden">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside className="absolute left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-background border-r border-border flex flex-col overflow-y-auto">
        <SidebarNav userRole={userRole} />

        {/* User Profile */}
        <div className="mt-auto p-6 border-t border-border space-y-4">
          <div>
            <p className="text-sm font-medium text-foreground">
              {user?.full_name || "User"}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {userRole}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition font-medium text-sm"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>
    </div>
  );
}
