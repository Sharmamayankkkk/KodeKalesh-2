"use client";

import Link from "next/link";
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, AlertCircle, BarChart3, Settings, FileText, Pill } from 'lucide-react';
import { cn } from "@/lib/utils";

interface SidebarNavProps {
  userRole: string;
}

export default function SidebarNav({ userRole }: SidebarNavProps) {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["doctor", "nurse", "admin"],
    },
    {
      label: "Patients",
      href: "/dashboard/patients",
      icon: Users,
      roles: ["doctor", "nurse", "admin"],
    },
    {
      label: "Alerts",
      href: "/dashboard/alerts",
      icon: AlertCircle,
      roles: ["doctor", "nurse", "admin"],
    },
    {
      label: "Lab Results",
      href: "/dashboard/lab-results",
      icon: FileText,
      roles: ["doctor", "lab_technician", "admin"],
    },
    {
      label: "Prescriptions",
      href: "/dashboard/prescriptions",
      icon: Pill,
      roles: ["doctor", "admin"],
    },
    {
      label: "Analytics",
      href: "/dashboard/analytics",
      icon: BarChart3,
      roles: ["doctor", "admin"],
    },
    {
      label: "Admin",
      href: "/dashboard/admin",
      icon: Settings,
      roles: ["admin"],
    },
  ];

  const visibleItems = navItems.filter((item) => item.roles.includes(userRole));

  return (
    <nav className="flex-1 px-4 py-6 space-y-2">
      {visibleItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-2 rounded-lg transition font-medium text-sm",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted-background"
            )}
          >
            <Icon className="w-5 h-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
