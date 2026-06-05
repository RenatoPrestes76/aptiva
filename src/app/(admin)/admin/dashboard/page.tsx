import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Building2, Briefcase, Brain, TrendingUp, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const monthlyData = [
  { month: "Jan", usuarios: 120, empresas: 8 }, { month: "Fev", usuarios: 180, empresas: 12 },
  { month: "Mar", usuarios: 240, empresas: 15 }, { month: "Abr", usuarios: 320, empresas: 22 },
  { month: "Mai", usuarios: 410, empresas: 28 }, { month: "Jun", usuarios: 520, empresas: 35 },
];

const profileDist = [
  { name: "Executor", value: 28, color: "#5B21B6" },
  { name: "Técnico", value: 22, color: "#00D4FF" },
  { name: "Analista", value: 18, color: "#F97316" },
  { name: "Comunicador", value: 15, color: "#22C55E" },
  { name: "Líder", value: 10, color: "#EF4444" },
  { name: "Outros", value: 7, color: "#94A3B8" },
];

const recentAlerts = [
  { type: "warning", msg: "Taxa de abandono de testes acima de 40% nesta semana" },
  { type: "info", msg: "5 novas empresas aguardam aprovação do plano Pro" },
  { type: "warning", msg: "Uso da API OpenAI em 78% do limite mensal" },
];

export default function AdminDashboard() {
  return (
    <DashboardShell role="ADMIN" pageTitle="Painel Administrativo" userName="Admin">
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Visão Geral da Plataforma</h2>
          <p className="text-slate-500 text-sm mt-1">Métricas em tempo real de toda a plataforma Aptiva AI</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total de Usuários" value="1.847" trend={{ value: 18, label: "este mês" }} icon={<Users size={22} />} color="purple" />
          <StatCard title="Empresas Ativas" value="143" trend={{ value: 12, label: "vs. anterior" }} icon={<Building2 size={22} />} color="cyan" />
          <StatCard title="Vagas Publicadas" value="389" description="52 fechadas este mês" icon={<Briefcase size={22} />} color="orange" />
          <StatCard title="Entrevistas IA" value="2.341" trend={{ value: 34, label: "este mês" }} icon={<Brain size={22} />} color="green" />
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Crescimento de Usuários</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="usuarios" fill="#5B21B6" radius={[4, 4, 0, 0]} name="Usuários" />
                  <Bar dataKey="empresas" fill="#00D4FF" radius={[4, 4, 0, 0]} name="Empresas" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Distribuição de Perfis</CardTitle></CardHeader>
            <CardContent className="flex items-center gap-6">
              <PieChart width={160} height={160}>
                <Pie data={profileDist} cx={75} cy={75} innerRadius={45} outerRadius={70} dataKey="value" strokeWidth={0}>
                  {profileDist.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
              </PieChart>
              <div className="space-y-2 flex-1">
                {profileDist.map((p) => (
                  <div key={p.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                      <span className="text-slate-600 dark:text-slate-400">{p.name}</span>
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{p.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <AlertTriangle size={18} className="text-orange-500" />
            <CardTitle>Alertas do Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentAlerts.map((a, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${
                a.type === "warning" ? "bg-orange-50 border-orange-200 dark:bg-orange-900/10 dark:border-orange-800" : "bg-blue-50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800"
              }`}>
                <AlertTriangle size={14} className={a.type === "warning" ? "text-orange-500 mt-0.5" : "text-blue-500 mt-0.5"} />
                <p className="text-sm text-slate-700 dark:text-slate-200">{a.msg}</p>
                <Badge variant={a.type === "warning" ? "warning" : "secondary"} className="ml-auto shrink-0">
                  {a.type === "warning" ? "Atenção" : "Info"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: <Users size={20} />, label: "Gerenciar Usuários", href: "/admin/users", color: "purple" },
            { icon: <Brain size={20} />, label: "Configurar IA", href: "/admin/ai", color: "cyan" },
            { icon: <TrendingUp size={20} />, label: "Ver Métricas", href: "/admin/metrics", color: "orange" },
          ].map((a) => (
            <a key={a.href} href={a.href} className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary transition-colors">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                {a.icon}
              </div>
              <span className="font-medium text-sm text-slate-700 dark:text-slate-200">{a.label}</span>
            </a>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
