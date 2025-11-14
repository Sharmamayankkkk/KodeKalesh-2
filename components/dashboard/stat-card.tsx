import { type LucideIcon } from 'lucide-react';
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: number;
  color?: "primary" | "destructive" | "success" | "info";
  suffix?: string;
  loading?: boolean;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  color = "primary",
  suffix = "",
  loading = false,
}: StatCardProps) {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    destructive: "bg-destructive/10 text-destructive",
    success: "bg-success/10 text-success",
    info: "bg-info/10 text-info",
  };

  const trendColor = (trend ?? 0) >= 0 ? "text-success" : "text-destructive";

  return (
    <div className="bg-background border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", colorClasses[color])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-foreground">
          {loading ? "-" : value}
        </span>
        {suffix && <span className="text-muted-foreground">{suffix}</span>}
      </div>

      {/* Trend */}
      {trend !== undefined && (
        <p className={cn("text-xs mt-2 font-medium", trendColor)}>
          {trend > 0 ? "+" : ""}{trend}% from last month
        </p>
      )}
    </div>
  );
}
