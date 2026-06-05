import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

interface DashboardShellProps {
  children: React.ReactNode;
  role?: "CANDIDATE" | "COMPANY" | "ADMIN";
  pageTitle?: string;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
}

export function DashboardShell({ children, role, pageTitle, userName, userEmail, userAvatar }: DashboardShellProps) {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#0F172A] overflow-hidden">
      <Sidebar role={role} userName={userName} userEmail={userEmail} userAvatar={userAvatar} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar title={pageTitle} userName={userName} userAvatar={userAvatar} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
