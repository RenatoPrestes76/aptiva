"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  color?: string;
  showLabel?: boolean;
  size?: "sm" | "default" | "lg";
}

function Progress({ className, value = 0, color, showLabel, size = "default", ...props }: ProgressProps) {
  const heights = { sm: "h-1.5", default: "h-2.5", lg: "h-4" };
  const bgColor = color ?? "#5B21B6";

  return (
    <div className={cn("w-full", className)} {...props}>
      <div className={cn("w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden", heights[size])}>
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, value))}%`, backgroundColor: bgColor }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-slate-500 mt-1 text-right">{Math.round(value)}%</p>
      )}
    </div>
  );
}

export { Progress };
