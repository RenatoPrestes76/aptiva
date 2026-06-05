"use client";
import { Bell, Search } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";

interface TopbarProps {
  title?: string;
  userName?: string;
  userAvatar?: string;
}

export function Topbar({ title, userName, userAvatar }: TopbarProps) {
  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-between px-6 shrink-0">
      <div>
        {title && <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h1>}
      </div>
      <div className="flex items-center gap-4">
        <button className="h-9 w-9 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-[#5B21B6] transition-colors">
          <Search size={16} />
        </button>
        <button className="h-9 w-9 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-[#5B21B6] relative transition-colors">
          <Bell size={16} />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#F97316]" />
        </button>
        <Avatar name={userName} src={userAvatar} size="sm" />
      </div>
    </header>
  );
}
