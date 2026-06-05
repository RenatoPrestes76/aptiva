import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScoreRing } from "@/components/ui/score-ring";
import { ArrowRight, Lock } from "lucide-react";
import Link from "next/link";

const tests = [
  {
    id: "behavioral",
    title: "Perfil Comportamental",
    description: "Avalia dimensões como Liderança, Comunicação, Execução e Colaboração através de questões situacionais.",
    icon: "🧠",
    duration: "15-20 min",
    status: "completed",
    score: 79,
    color: "purple",
  },
  {
    id: "reasoning",
    title: "Raciocínio Lógico",
    description: "Testa lógica, sequências numéricas, raciocínio matemático e tomada de decisão sob pressão.",
    icon: "🔢",
    duration: "20 min",
    status: "completed",
    score: 82,
    color: "cyan",
  },
  {
    id: "execution",
    title: "Capacidade de Execução",
    description: "Tarefas repetitivas e precisas para identificar candidatos operacionais com alta disciplina.",
    icon: "⚡",
    duration: "10 min",
    status: "pending",
    score: null,
    color: "orange",
  },
  {
    id: "creativity",
    title: "Criatividade & Inovação",
    description: "Resolução aberta de problemas avaliada por IA: originalidade, inovação, complexidade e clareza.",
    icon: "��",
    duration: "25 min",
    status: "pending",
    score: null,
    color: "green",
  },
  {
    id: "attention",
    title: "Atenção & Memória Visual",
    description: "Identificação de padrões, memória visual e comparação de imagens para avaliar concentração.",
    icon: "👁️",
    duration: "15 min",
    status: "pending",
    score: null,
    color: "purple",
  },
];

const colorBg: Record<string, string> = {
  purple: "bg-purple-50 dark:bg-purple-900/20",
  cyan: "bg-cyan-50 dark:bg-cyan-900/20",
  orange: "bg-orange-50 dark:bg-orange-900/20",
  green: "bg-green-50 dark:bg-green-900/20",
};

export default function TestsPage() {
  const completed = tests.filter((t) => t.status === "completed").length;

  return (
    <DashboardShell role="CANDIDATE" pageTitle="Testes de Avaliação" userName="Carlos Mendes">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="p-6 rounded-xl bg-linear-to-r from-primary to-primary-light text-white">
          <h2 className="text-xl font-bold mb-1">Avaliação Multidimensional</h2>
          <p className="text-purple-200 text-sm mb-4">
            Conclua todos os módulos para obter seu perfil completo e aumentar sua compatibilidade com vagas.
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full bg-white/20 overflow-hidden">
              <div className="h-full rounded-full bg-white transition-all" style={{ width: `${(completed / tests.length) * 100}%` }} />
            </div>
            <span className="text-sm font-bold">{completed}/{tests.length}</span>
          </div>
        </div>

        {/* Test Grid */}
        <div className="grid sm:grid-cols-2 gap-4">
          {tests.map((test) => (
            <Card key={test.id} className={test.status === "completed" ? "border-green-200 dark:border-green-800" : ""}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-2xl ${colorBg[test.color]}`}>
                    {test.icon}
                  </div>
                  {test.status === "completed"
                    ? <Badge variant="success">Concluído</Badge>
                    : <Badge variant="outline">Pendente</Badge>
                  }
                </div>
                <CardTitle className="mt-3">{test.title}</CardTitle>
                <CardDescription>{test.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">⏱ {test.duration}</span>
                  {test.status === "completed" && test.score ? (
                    <div className="flex items-center gap-3">
                      <ScoreRing score={test.score} size={56} strokeWidth={6} />
                      <Link href={`/candidate/tests/${test.id}/result`}>
                        <Button variant="ghost" size="sm">Ver resultado</Button>
                      </Link>
                    </div>
                  ) : (
                    <Link href={`/candidate/tests/${test.id}`}>
                      <Button size="sm">
                        Iniciar <ArrowRight size={14} />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* AI Interview CTA */}
        <Card className="border-dashed border-2 border-slate-300 dark:border-slate-600">
          <CardContent className="pt-6 flex flex-col sm:flex-row items-center gap-4">
            <span className="text-4xl">🎤</span>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-bold text-slate-800 dark:text-slate-100">Entrevista com IA</h3>
              <p className="text-sm text-slate-500 mt-1">
                Responda perguntas ao vivo para o entrevistador virtual. Receba avaliação de comunicação, clareza e conhecimento técnico.
              </p>
            </div>
            <Link href="/candidate/interview">
              <Button className="shrink-0">
                Fazer entrevista <ArrowRight size={14} />
              </Button>
            </Link>
          </CardContent>
        </Card>

      </div>
    </DashboardShell>
  );
}
