import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { scoreToColor, PROFILE_LABELS } from "@/lib/utils";
import { Briefcase, Users, TrendingUp, Target, Plus, ArrowRight, Eye } from "lucide-react";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from "recharts";

const hiringData = [
  { month: "Jan", contratados: 2, candidatos: 45 },
  { month: "Fev", contratados: 3, candidatos: 60 },
  { month: "Mar", contratados: 1, candidatos: 38 },
  { month: "Abr", contratados: 4, candidatos: 72 },
  { month: "Mai", contratados: 2, candidatos: 55 },
  { month: "Jun", contratados: 5, candidatos: 89 },
];

const topCandidates = [
  { name: "Ana Souza", role: "UX Designer", match: 94, profile: "CREATOR", score: 88 },
  { name: "Bruno Lima", role: "Dev Sênior", match: 91, profile: "TECHNICAL_SPECIALIST", score: 85 },
  { name: "Carla Matos", role: "Product Manager", match: 87, profile: "STRATEGIST", score: 82 },
  { name: "Diego Neves", role: "Data Analyst", match: 85, profile: "ANALYST", score: 80 },
  { name: "Elena Castro", role: "Dev Backend", match: 83, profile: "TECHNICAL_SPECIALIST", score: 79 },
];

const activeJobs = [
  { title: "Dev Full Stack Sênior", applicants: 34, match: 78, status: "PUBLISHED", days: 5 },
  { title: "UX/UI Designer", applicants: 22, match: 85, status: "PUBLISHED", days: 8 },
  { title: "Product Manager", applicants: 15, match: 71, status: "PUBLISHED", days: 12 },
];

export default function CompanyDashboard() {
  return (
    <DashboardShell role="COMPANY" pageTitle="Dashboard Executivo" userName="TechCorp" userEmail="rh@techcorp.com">
      <div className="space-y-8">

        {/* Welcome */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Painel Executivo</h2>
            <p className="text-slate-500 text-sm mt-1">Visão geral das suas vagas e candidatos</p>
          </div>
          <Link href="/company/jobs/new">
            <Button><Plus size={14} /> Nova Vaga</Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Vagas Ativas"
            value={3}
            trend={{ value: 12, label: "este mês" }}
            icon={<Briefcase size={22} />}
            color="purple"
          />
          <StatCard
            title="Total de Candidatos"
            value={171}
            trend={{ value: 23, label: "vs. mês anterior" }}
            icon={<Users size={22} />}
            color="cyan"
          />
          <StatCard
            title="Taxa de Match Média"
            value="78%"
            trend={{ value: 5, label: "vs. mês anterior" }}
            icon={<Target size={22} />}
            color="orange"
          />
          <StatCard
            title="Contratações"
            value={17}
            description="acumulado no ano"
            icon={<TrendingUp size={22} />}
            color="green"
          />
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Candidatos por Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={hiringData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="candidatos" fill="#5B21B6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Evolução de Contratações</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={hiringData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="contratados" stroke="#00D4FF" strokeWidth={2} dot={{ fill: "#00D4FF" }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Grid */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Top Candidates */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Ranking de Candidatos</CardTitle>
              <Link href="/company/search">
                <Button variant="ghost" size="sm">Ver todos <ArrowRight size={12} /></Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topCandidates.map((c, i) => (
                  <div key={c.name} className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <span className="text-lg font-black text-slate-300 w-6 text-center">{i + 1}</span>
                    <Avatar name={c.name} size="default" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate">{c.name}</p>
                      <p className="text-xs text-slate-400 truncate">{c.role}</p>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">{PROFILE_LABELS[c.profile]}</Badge>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold" style={{ color: scoreToColor(c.match) }}>{c.match}%</p>
                      <p className="text-xs text-slate-400">match</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                      <Eye size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Active Jobs */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Vagas Ativas</CardTitle>
              <Link href="/company/jobs">
                <Button variant="ghost" size="sm"><ArrowRight size={12} /></Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeJobs.map((job) => (
                <div key={job.title} className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-tight">{job.title}</p>
                    <Badge variant="success" className="text-xs shrink-0">Ativa</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{job.applicants} candidatos</span>
                    <span>{job.days} dias</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={job.match} color={scoreToColor(job.match)} size="sm" className="flex-1" />
                    <span className="text-xs font-semibold w-10 text-right" style={{ color: scoreToColor(job.match) }}>
                      {job.match}%
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

        </div>
      </div>
    </DashboardShell>
  );
}
