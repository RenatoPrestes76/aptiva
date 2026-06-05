import Link from "next/link";
import { Brain, Zap, Target, Users, BarChart3, Shield, ArrowRight, CheckCircle2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: <Brain className="h-6 w-6" />,
    title: "Perfil Cognitivo & Comportamental",
    description: "Análise completa baseada em metodologias de psicologia organizacional. Identifique Liderança, Criatividade, Execução e muito mais.",
    color: "purple",
  },
  {
    icon: <Target className="h-6 w-6" />,
    title: "Motor de Match Inteligente",
    description: "Algoritmo proprietário que compara perfis de candidatos com requisitos da vaga, gerando ranking automático de 0 a 100%.",
    color: "cyan",
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Entrevista IA",
    description: "Entrevistador virtual que conduz, avalia e gera relatório detalhado de cada candidato com métricas de comunicação e conhecimento técnico.",
    color: "orange",
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: "Relatórios Executivos",
    description: "Dashboards em tempo real, relatórios em PDF, Excel e PowerPoint gerados automaticamente para tomada de decisão.",
    color: "green",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Multi-tenant & Escalável",
    description: "Arquitetura preparada para milhares de empresas com isolamento total de dados via Row Level Security.",
    color: "purple",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Segurança & LGPD",
    description: "JWT, RLS, Rate Limiting, auditoria completa e consentimento explícito em conformidade com a Lei Geral de Proteção de Dados.",
    color: "cyan",
  },
];

const profiles = [
  "Executor", "Analista", "Criador", "Líder",
  "Estrategista", "Comunicador", "Investigador", "Especialista Técnico",
];

const stats = [
  { value: "8", label: "Dimensões comportamentais" },
  { value: "5", label: "Módulos de avaliação" },
  { value: "100%", label: "Compatibilidade por IA" },
  { value: "∞", label: "Empresas suportadas" },
];

const colorBorder: Record<string, string> = {
  purple: "border-t-primary",
  cyan: "border-t-secondary",
  orange: "border-t-accent",
  green: "border-t-success",
};

const colorIcon: Record<string, string> = {
  purple: "bg-primary/10 text-primary",
  cyan: "bg-secondary/10 text-cyan-600",
  orange: "bg-accent/10 text-orange-600",
  green: "bg-success/10 text-green-600",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-dark-bg text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800 bg-dark-bg/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-linear-to-br from-primary to-secondary flex items-center justify-center">
              <Brain size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg">Aptiva <span className="text-secondary">AI</span></span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            <Link href="#features" className="hover:text-white transition-colors">Funcionalidades</Link>
            <Link href="#profiles" className="hover:text-white transition-colors">Perfis</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Planos</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">Entrar</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-linear-to-r from-primary to-primary-light hover:opacity-90">
                Começar grátis
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <Badge variant="secondary" className="mb-6 bg-primary/20 text-purple-300 border-primary/30">
            <Star size={12} /> Plataforma de Talentos com IA
          </Badge>
          <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
            Onde aptidão<br />
            <span className="gradient-text">encontra oportunidade.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            Identifique perfis cognitivos, comportamentais, técnicos e profissionais com Inteligência Artificial.
            Contratações mais inteligentes, resultados mais consistentes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register?role=company">
              <Button size="xl" className="bg-linear-to-r from-primary to-primary-light hover:opacity-90 w-full sm:w-auto">
                Sou Empresa <ArrowRight size={18} />
              </Button>
            </Link>
            <Link href="/register?role=candidate">
              <Button size="xl" variant="outline" className="border-secondary text-secondary hover:bg-secondary/10 w-full sm:w-auto">
                Sou Candidato
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-4xl mx-auto mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center p-6 rounded-xl border border-slate-800 bg-slate-900/50">
              <p className="text-4xl font-black text-white mb-1">{stat.value}</p>
              <p className="text-sm text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 bg-secondary/10 text-secondary">Funcionalidades</Badge>
            <h2 className="text-4xl font-bold mb-4">Tudo que o recrutamento moderno precisa</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Uma plataforma completa que une ciência comportamental, IA generativa e dados para decisões de contratação mais inteligentes.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className={`p-6 rounded-xl bg-slate-900 border border-slate-800 border-t-2 ${colorBorder[f.color]} hover:border-slate-700 transition-colors`}
              >
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-4 ${colorIcon[f.color]}`}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Profiles */}
      <section id="profiles" className="py-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4 bg-accent/10 text-accent">Perfis Profissionais</Badge>
          <h2 className="text-4xl font-bold mb-4">8 arquétipos profissionais identificados por IA</h2>
          <p className="text-slate-400 mb-12">Com suporte a perfis híbridos para uma classificação ainda mais precisa.</p>
          <div className="flex flex-wrap justify-center gap-3">
            {profiles.map((p) => (
              <div key={p} className="flex items-center gap-2 px-5 py-3 rounded-full border border-slate-700 bg-slate-900 text-sm font-medium hover:border-primary transition-colors">
                <CheckCircle2 size={14} className="text-success" />
                {p}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tests Section */}
      <section className="py-24 px-6 bg-slate-900/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 bg-primary/20 text-purple-300">Módulos de Avaliação</Badge>
            <h2 className="text-4xl font-bold">Avaliação multidimensional</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: "🧠", title: "Perfil Comportamental", desc: "DISC + Big Five adaptado" },
              { icon: "⚡", title: "Execução", desc: "Memória, disciplina e precisão" },
              { icon: "💡", title: "Criatividade", desc: "Originalidade e inovação analisadas por IA" },
              { icon: "🔢", title: "Raciocínio", desc: "Lógica, sequências e matemática" },
              { icon: "👁️", title: "Atenção", desc: "Memória visual e padrões" },
              { icon: "🎤", title: "Entrevista IA", desc: "Entrevistador virtual com relatório completo" },
            ].map((t) => (
              <div key={t.title} className="flex items-start gap-4 p-5 rounded-xl border border-slate-800 bg-slate-900/50">
                <span className="text-2xl">{t.icon}</span>
                <div>
                  <p className="font-semibold text-sm mb-1">{t.title}</p>
                  <p className="text-xs text-slate-400">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="p-12 rounded-2xl bg-linear-to-br from-primary to-primary-dark border border-primary-light/30">
            <h2 className="text-4xl font-black mb-4">Pronto para contratar melhor?</h2>
            <p className="text-purple-200 mb-8">
              Junte-se às empresas que já usam IA para encontrar os talentos certos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register?role=company">
                <Button size="lg" className="bg-white text-primary hover:bg-slate-100 font-bold">
                  Criar conta empresa
                </Button>
              </Link>
              <Link href="/register?role=candidate">
                <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10">
                  Criar perfil candidato
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-linear-to-br from-primary to-secondary flex items-center justify-center">
              <Brain size={12} className="text-white" />
            </div>
            <span className="font-bold text-sm">Aptiva AI</span>
          </div>
          <p className="text-xs text-slate-500">© 2025 Aptiva AI. Todos os direitos reservados.</p>
          <div className="flex gap-6 text-xs text-slate-400">
            <Link href="/privacy" className="hover:text-white">Privacidade</Link>
            <Link href="/terms" className="hover:text-white">Termos</Link>
            <Link href="/lgpd" className="hover:text-white">LGPD</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
