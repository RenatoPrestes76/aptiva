"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, User, Briefcase, ClipboardList, MessageSquare,
  Settings, LogOut, Brain, Building2, Shield, ChevronLeft, ChevronRight,
  Trophy, Search, FileText, Star, BarChart3
} from "lucide-react";
import { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const candidateNav: NavItem[] = [
  { label: "Dashboard", href: "/candidate/dashboard", icon: <LayoutDashboard size={18} /> },
  { label: "Meu Perfil", href: "/candidate/profile", icon: <User size={18} /> },
  { label: "Testes", href: "/candidate/tests", icon: <ClipboardList size={18} /> },
  { label: "Entrevista IA", href: "/candidate/interview", icon: <MessageSquare size={18} /> },
  { label: "Vagas", href: "/candidate/jobs", icon: <Briefcase size={18} /> },
  { label: "Minhas Candidaturas", href: "/candidate/applications", icon: <FileText size={18} /> },
  { label: "Conquistas", href: "/candidate/achievements", icon: <Trophy size={18} /> },
  { label: "Configurações", href: "/candidate/settings", icon: <Settings size={18} /> },
];

const companyNav: NavItem[] = [
  { label: "Dashboard", href: "/company/dashboard", icon: <LayoutDashboard size={18} /> },
  { label: "Buscar Talentos", href: "/company/search", icon: <Search size={18} /> },
  { label: "Vagas", href: "/company/jobs", icon: <Briefcase size={18} /> },
  { label: "Candidaturas", href: "/company/applications", icon: <ClipboardList size={18} /> },
  { label: "Salvos", href: "/company/saved", icon: <Star size={18} /> },
  { label: "Relatórios", href: "/company/reports", icon: <BarChart3 size={18} /> },
  { label: "Perfil Empresa", href: "/company/profile", icon: <Building2 size={18} /> },
  { label: "Configurações", href: "/company/settings", icon: <Settings size={18} /> },
];

const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard size={18} /> },
  { label: "Usuários", href: "/admin/users", icon: <User size={18} /> },
  { label: "Empresas", href: "/admin/companies", icon: <Building2 size={18} /> },
  { label: "Vagas", href: "/admin/jobs", icon: <Briefcase size={18} /> },
  { label: "Configurações IA", href: "/admin/ai", icon: <Brain size={18} /> },
  { label: "Métricas", href: "/admin/metrics", icon: <BarChart3 size={18} /> },
  { label: "Segurança", href: "/admin/security", icon: <Shield size={18} /> },
  { label: "Configurações", href: "/admin/settings", icon: <Settings size={18} /> },
];

interface SidebarProps {
  role?: "CANDIDATE" | "COMPANY" | "ADMIN";
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
}

export function Sidebar({ role = "CANDIDATE", userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = role === "COMPANY" ? companyNav : role === "ADMIN" ? adminNav : candidateNav;
  const roleLabel = role === "COMPANY" ? "Empresa" : role === "ADMIN" ? "Administrador" : "Candidato";
  const roleIcon = role === "COMPANY" ? <Building2 size={14} /> : role === "ADMIN" ? <Shield size={14} /> : <User size={14} />;

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-dark-bg border-r border-slate-800 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-linear-to-br from-primary to-secondary flex items-center justify-center">
              <Brain size={16} className="text-white" />
            </div>
            <span className="font-bold text-white text-sm">Aptiva</span>
          </Link>
        )}
        {collapsed && (
          <div className="h-8 w-8 rounded-lg bg-linear-to-br from-primary to-secondary flex items-center justify-center mx-auto">
            <Brain size={16} className="text-white" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-slate-400 hover:text-white transition-colors ml-auto"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Role Badge */}
      {!collapsed && (
        <div className="px-4 py-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800 rounded-lg px-3 py-2">
            {roleIcon}
            <span>{roleLabel}</span>
          </div>
        </div>
      )}

      {/* Nav Items */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
                active
                  ? "bg-primary text-white shadow-lg shadow-purple-900/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800",
                collapsed && "justify-center"
              )}
            >
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-3 border-t border-slate-800">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold shrink-0">
              {userName ? userName[0].toUpperCase() : "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{userName ?? "Usuário"}</p>
              <p className="text-xs text-slate-400 truncate">{userEmail ?? ""}</p>
            </div>
            <button className="text-slate-400 hover:text-red-400 transition-colors">
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <button className="w-full flex justify-center text-slate-400 hover:text-red-400 transition-colors">
            <LogOut size={16} />
          </button>
        )}
      </div>
    </aside>
  );
}
