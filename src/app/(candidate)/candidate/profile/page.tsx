import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { PROFILE_LABELS } from "@/lib/utils";
import { Pencil, Plus, Linkedin, Github, Globe, MapPin, Phone, FileText } from "lucide-react";

const mock = {
  name: "Carlos Mendes",
  email: "carlos@email.com",
  headline: "Desenvolvedor Full Stack | React · Node.js · TypeScript",
  bio: "Apaixonado por construir produtos que escalam. 5+ anos de experiência em startups e empresas de médio porte.",
  location: "São Paulo, SP",
  phone: "+55 11 99999-9999",
  linkedinUrl: "linkedin.com/in/carlosmendes",
  githubUrl: "github.com/carlosmendes",
  primaryProfile: "TECHNICAL_SPECIALIST",
  secondaryProfile: "ANALYST",
  experiences: [
    { company: "TechStart", role: "Senior Dev", start: "2022", end: null, current: true, description: "Lidero time de 4 devs, arquitetura de microserviços." },
    { company: "PixelCraft", role: "Full Stack Dev", start: "2020", end: "2022", current: false, description: "Desenvolvimento de e-commerce com Next.js e Node." },
  ],
  education: [
    { institution: "USP", degree: "Bacharelado em Ciência da Computação", field: "Computação", start: 2016, end: 2020 },
  ],
  skills: [
    { name: "React", level: 5 }, { name: "TypeScript", level: 5 }, { name: "Node.js", level: 4 },
    { name: "PostgreSQL", level: 4 }, { name: "Docker", level: 3 }, { name: "AWS", level: 3 },
  ],
  certifications: [
    { name: "AWS Certified Developer", issuer: "Amazon", issueDate: "2023" },
    { name: "React Avançado", issuer: "Rocketseat", issueDate: "2022" },
  ],
};

const levelLabel = ["", "Básico", "Básico+", "Intermediário", "Avançado", "Expert"];

export default function CandidateProfilePage() {
  return (
    <DashboardShell role="CANDIDATE" pageTitle="Meu Perfil" userName={mock.name} userEmail={mock.email}>
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <Avatar name={mock.name} size="xl" />
              <div className="flex-1">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{mock.name}</h2>
                    <p className="text-slate-500 text-sm mt-0.5">{mock.headline}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="default">{PROFILE_LABELS[mock.primaryProfile]}</Badge>
                      <Badge variant="secondary">{PROFILE_LABELS[mock.secondaryProfile]}</Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm"><Pencil size={13} /> Editar</Button>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">{mock.bio}</p>
                <div className="flex flex-wrap gap-4 mt-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><MapPin size={12} />{mock.location}</span>
                  <span className="flex items-center gap-1"><Phone size={12} />{mock.phone}</span>
                  {mock.linkedinUrl && <span className="flex items-center gap-1 text-blue-500"><Linkedin size={12} />{mock.linkedinUrl}</span>}
                  {mock.githubUrl && <span className="flex items-center gap-1"><Github size={12} />{mock.githubUrl}</span>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Two col layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            {/* Experience */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>Experiências</CardTitle>
                <Button variant="ghost" size="sm"><Plus size={14} /> Adicionar</Button>
              </CardHeader>
              <CardContent className="space-y-5">
                {mock.experiences.map((exp, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="mt-1 h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                      {exp.company[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">{exp.role}</p>
                          <p className="text-xs text-slate-500">{exp.company}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">{exp.start} – {exp.current ? "Atual" : exp.end}</span>
                          {exp.current && <Badge variant="success" className="text-xs">Atual</Badge>}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{exp.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Education */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>Formação Acadêmica</CardTitle>
                <Button variant="ghost" size="sm"><Plus size={14} /> Adicionar</Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {mock.education.map((edu, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="mt-1 h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-xs font-bold text-blue-600 shrink-0">
                      🎓
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">{edu.degree}</p>
                      <p className="text-xs text-slate-500">{edu.institution} · {edu.field}</p>
                      <p className="text-xs text-slate-400">{edu.start} – {edu.end ?? "Atual"}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

          </div>

          <div className="space-y-6">
            {/* Skills */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>Habilidades</CardTitle>
                <Button variant="ghost" size="sm"><Plus size={14} /></Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {mock.skills.map((s) => (
                  <div key={s.name} className="flex items-center justify-between">
                    <span className="text-sm text-slate-700 dark:text-slate-200">{s.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map((l) => (
                          <div key={l} className={`h-1.5 w-4 rounded-full ${l <= s.level ? "bg-primary" : "bg-slate-200 dark:bg-slate-600"}`} />
                        ))}
                      </div>
                      <span className="text-xs text-slate-400 w-20 text-right">{levelLabel[s.level]}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Certifications */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>Certificações</CardTitle>
                <Button variant="ghost" size="sm"><Plus size={14} /></Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {mock.certifications.map((c, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                    <span className="text-lg">���</span>
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{c.name}</p>
                      <p className="text-xs text-slate-400">{c.issuer} · {c.issueDate}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Resume */}
            <Card>
              <CardContent className="pt-6 text-center space-y-3">
                <FileText size={32} className="mx-auto text-slate-300" />
                <p className="text-sm text-slate-600 dark:text-slate-400">Currículo em PDF</p>
                <Button variant="outline" size="sm" className="w-full">Fazer upload</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
