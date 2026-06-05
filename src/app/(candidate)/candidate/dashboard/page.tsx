import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatCard } from "@/components/ui/stat-card";
import { ScoreRing } from "@/components/ui/score-ring";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BEHAVIORAL_DIMENSIONS, PROFILE_LABELS, scoreToColor } from "@/lib/utils";
import {
  ClipboardList, MessageSquare, Briefcase, Trophy,
  ArrowRight, CheckCircle2, Clock, AlertCircle
} from "lucide-react";
import Link from "next/link";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  Tooltip
} from "recharts";

// Mock data — replace with real DB calls via server component
const mockCandidate = {
  name: "Carlos Mendes",
  email: "carlos@email.com",
  headline: "Desenvolvedor Full Stack",
  primaryProfile: "TECHNICAL_SPECIALIST" as const,
  secondaryProfile: "ANALYST" as const,
  overallScore: 74,
  scores: {
    scoreLeadership: 65,
    scoreOrganization: 80,
    scoreCommunication: 72,
    scoreCreativity: 58,
    scoreExecution: 88,
    scoreCollaboration: 75,
    scoreResilience: 70,
    scoreAdaptability: 68,
  },
  testsCompleted: 3,
  interviewsCompleted: 1,
  applicationsCount: 5,
  achievements: 2,
};

const radarData = BEHAVIORAL_DIMENSIONS.map((d) => ({
  dimension: d.label,
  score: mockCandidate.scores[d.key as keyof typeof mockCandidate.scores] ?? 0,
}));

const recentActivity = [
  { type: "test", label: "Teste de Raciocínio concluído", score: 82, time: "há 2 dias", status: "done" },
  { type: "interview", label: "Entrevista IA concluída", score: 74, time: "há 4 dias", status: "done" },
  { type: "application", label: "Candidatura: Dev Sênior — TechCorp", time: "há 1 semana", status: "reviewing" },
  { type: "test", label: "Teste Comportamental concluído", score: 79, time: "há 2 semanas", status: "done" },
];

const pendingActions = [
  { label: "Complete o teste de Criatividade", href: "/candidate/tests/creativity", urgent: false },
  { label: "Adicione suas experiências profissionais", href: "/candidate/profile", urgent: true },
  { label: "Faça o teste de Atenção", href: "/candidate/tests/attention", urgent: false },
];

export default function CandidateDashboard() {
  return (
    <DashboardShell role="CANDIDATE" pageTitle="Dashboard" userName={mockCandidate.name} userEmail={mockCandidate.email}>
      <div className="space-y-8">

        {/* Welcome */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Olá, {mockCandidate.name.split(" ")[0]}! 👋
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Seu perfil está {mockCandidate.overallScore}% completo. Continue evoluindo!
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/candidate/tests">
              <Button variant="outline" size="sm">
                <ClipboardList size={14} /> Fazer Teste
              </Button>
            </Link>
            <Link href="/candidate/interview">
              <Button size="sm">
                <MessageSquare size={14} /> Entrevista IA
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Score Geral" value={`${mockCandidate.overallScore}/100`} icon={<Trophy size={22} />} color="purple" />
          <StatCard title="Testes Feitos" value={mockCandidate.testsCompleted} description="de 5 disponíveis" icon={<ClipboardList size={22} />} color="cyan" />
          <StatCard title="Entrevistas" value={mockCandidate.interviewsCompleted} icon={<MessageSquare size={22} />} color="orange" />
          <StatCard title="Candidaturas" value={mockCandidate.applicationsCount} icon={<Briefcase size={22} />} color="green" />
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Behavioral Radar */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Perfil Comportamental</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row items-center gap-6">
                <div className="w-full lg:w-1/2 h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#E2E8F0" />
                      <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11, fill: "#64748B" }} />
                      <Radar
                        name="Score"
                        dataKey="score"
                        stroke="#5B21B6"
                        fill="#5B21B6"
                        fillOpacity={0.25}
                        strokeWidth={2}
                      />
                      <Tooltip formatter={(v: number) => [`${v}/100`]} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full lg:w-1/2 space-y-3">
                  {BEHAVIORAL_DIMENSIONS.map((d) => {
                    const val = mockCandidate.scores[d.key as keyof typeof mockCandidate.scores] ?? 0;
                    return (
                      <div key={d.key}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-600 dark:text-slate-400">{d.icon} {d.label}</span>
                          <span className="font-semibold" style={{ color: scoreToColor(val) }}>{val}</span>
                        </div>
                        <Progress value={val} color={scoreToColor(val)} size="sm" />
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Score + Profiles */}
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6 flex flex-col items-center gap-3">
                <ScoreRing score={mockCandidate.overallScore} label="Score Geral" sublabel="Baseado em todos os testes" />
                <div className="w-full space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Perfil principal</span>
                    <Badge variant="default">{PROFILE_LABELS[mockCandidate.primaryProfile]}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Perfil secundário</span>
                    <Badge variant="secondary">{PROFILE_LABELS[mockCandidate.secondaryProfile]}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pending Actions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Ações Pendentes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {pendingActions.map((a) => (
                  <Link key={a.href} href={a.href}>
                    <div className="flex items-start gap-2 p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                      {a.urgent
                        ? <AlertCircle size={14} className="text-orange-500 mt-0.5 shrink-0" />
                        : <CheckCircle2 size={14} className="text-slate-400 mt-0.5 shrink-0" />
                      }
                      <span className="text-xs text-slate-600 dark:text-slate-300">{a.label}</span>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Atividade Recente</CardTitle>
            <Link href="/candidate/tests">
              <Button variant="ghost" size="sm" className="text-xs">Ver tudo <ArrowRight size={12} /></Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((a, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm
                    ${a.type === "test" ? "bg-purple-100 dark:bg-purple-900/30" :
                      a.type === "interview" ? "bg-cyan-100 dark:bg-cyan-900/30" :
                        "bg-orange-100 dark:bg-orange-900/30"}`}>
                    {a.type === "test" ? "📋" : a.type === "interview" ? "🎤" : "💼"}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{a.label}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1"><Clock size={10} />{a.time}</p>
                  </div>
                  {a.score && (
                    <span className="text-sm font-bold" style={{ color: scoreToColor(a.score) }}>
                      {a.score}/100
                    </span>
                  )}
                  {a.status === "reviewing" && <Badge variant="warning">Em análise</Badge>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </DashboardShell>
  );
}
