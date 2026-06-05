import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  trend?: { value: number; label: string };
  color?: "purple" | "cyan" | "orange" | "green";
  className?: string;
}

const colorMap = {
  purple: "from-[#5B21B6] to-[#7C3AED]",
  cyan: "from-[#0891B2] to-[#00D4FF]",
  orange: "from-[#EA580C] to-[#F97316]",
  green: "from-[#16A34A] to-[#22C55E]",
};

export function StatCard({ title, value, description, icon, trend, color = "purple", className }: StatCardProps) {
  return (
    <div className={cn("rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 shadow-sm", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{title}</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">{value}</p>
          {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
          {trend && (
            <p className={cn("text-xs mt-2 font-medium", trend.value >= 0 ? "text-green-500" : "text-red-500")}>
              {trend.value >= 0 ? "+" : ""}{trend.value}% {trend.label}
            </p>
          )}
        </div>
        {icon && (
          <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center bg-gradient-to-br text-white", colorMap[color])}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
