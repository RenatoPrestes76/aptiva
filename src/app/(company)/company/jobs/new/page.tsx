"use client";
import { useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { BEHAVIORAL_DIMENSIONS } from "@/lib/utils";
import { Save, Send } from "lucide-react";

const contractTypes = ["CLT", "PJ", "Freelance", "Estágio", "Trainee"];
const experienceLevels = ["Júnior", "Pleno", "Sênior", "Especialista", "Gerência"];

export default function NewJobPage() {
  const [form, setForm] = useState({
    title: "", location: "", remote: false, contractType: "CLT",
    experienceLevel: "Pleno", salaryMin: "", salaryMax: "",
    description: "", requirements: "", benefits: "",
  });
  const [behavioralReqs, setBehavioralReqs] = useState<Record<string, number>>({
    reqLeadership: 50, reqOrganization: 50, reqCommunication: 50,
    reqCreativity: 50, reqExecution: 50, reqCollaboration: 50,
    reqResilience: 50, reqAdaptability: 50,
  });
  const [saving, setSaving] = useState(false);

  const reqKey: Record<string, string> = {
    scoreLeadership: "reqLeadership", scoreOrganization: "reqOrganization",
    scoreCommunication: "reqCommunication", scoreCreativity: "reqCreativity",
    scoreExecution: "reqExecution", scoreCollaboration: "reqCollaboration",
    scoreResilience: "reqResilience", scoreAdaptability: "reqAdaptability",
  };

  async function handleSave(status: "DRAFT" | "PUBLISHED") {
    setSaving(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, ...behavioralReqs, status }),
      });
      if (res.ok) {
        const { id } = await res.json();
        window.location.href = `/company/jobs/${id}`;
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardShell role="COMPANY" pageTitle="Nova Vaga" userName="TechCorp">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Basic Info */}
        <Card>
          <CardHeader><CardTitle>Informações Básicas</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input label="Título do cargo *" placeholder="ex: Desenvolvedor Full Stack Sênior"
              value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Localização" placeholder="São Paulo, SP"
                value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Modelo</label>
                <div className="flex gap-2">
                  {["Presencial", "Remoto", "Híbrido"].map((m) => (
                    <button key={m} type="button"
                      onClick={() => setForm({ ...form, remote: m === "Remoto" })}
                      className={`flex-1 py-2 rounded-lg border text-sm transition-colors ${
                        (m === "Remoto") === form.remote
                          ? "border-primary bg-primary/10 text-primary font-semibold"
                          : "border-slate-200 dark:border-slate-600 text-slate-500 hover:border-slate-300"
                      }`}
                    >{m}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Tipo de contrato</label>
                <div className="flex flex-wrap gap-2">
                  {contractTypes.map((t) => (
                    <button key={t} type="button" onClick={() => setForm({ ...form, contractType: t })}
                      className={`px-3 py-1.5 rounded-lg border text-xs transition-colors ${
                        form.contractType === t ? "border-primary bg-primary/10 text-primary font-semibold" : "border-slate-200 dark:border-slate-600 text-slate-500"
                      }`}
                    >{t}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Nível de experiência</label>
                <div className="flex flex-wrap gap-2">
                  {experienceLevels.map((l) => (
                    <button key={l} type="button" onClick={() => setForm({ ...form, experienceLevel: l })}
                      className={`px-3 py-1.5 rounded-lg border text-xs transition-colors ${
                        form.experienceLevel === l ? "border-primary bg-primary/10 text-primary font-semibold" : "border-slate-200 dark:border-slate-600 text-slate-500"
                      }`}
                    >{l}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Salário mínimo (R$)" type="number" placeholder="5000"
                value={form.salaryMin} onChange={(e) => setForm({ ...form, salaryMin: e.target.value })} />
              <Input label="Salário máximo (R$)" type="number" placeholder="10000"
                value={form.salaryMax} onChange={(e) => setForm({ ...form, salaryMax: e.target.value })} />
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader><CardTitle>Descrição da Vaga</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: "description", label: "Descrição *", placeholder: "Descreva as responsabilidades e o contexto da vaga..." },
              { key: "requirements", label: "Requisitos", placeholder: "Liste os requisitos obrigatórios e desejáveis..." },
              { key: "benefits", label: "Benefícios", placeholder: "Vale refeição, plano de saúde, home office..." },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{f.label}</label>
                <textarea
                  placeholder={f.placeholder}
                  rows={4}
                  value={form[f.key as keyof typeof form] as string}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Behavioral Requirements */}
        <Card>
          <CardHeader>
            <CardTitle>Requisitos Comportamentais</CardTitle>
            <p className="text-sm text-slate-400 mt-1">
              Defina o peso de cada dimensão para o algoritmo de match encontrar o candidato ideal.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {BEHAVIORAL_DIMENSIONS.map((d) => {
              const rKey = reqKey[d.key];
              const val = behavioralReqs[rKey] ?? 50;
              return (
                <div key={d.key} className="flex items-center gap-4">
                  <span className="w-36 text-sm text-slate-600 dark:text-slate-300 shrink-0">{d.icon} {d.label}</span>
                  <input
                    type="range" min={0} max={100} step={5} value={val}
                    onChange={(e) => setBehavioralReqs({ ...behavioralReqs, [rKey]: Number(e.target.value) })}
                    className="flex-1 accent-primary"
                  />
                  <span className="w-10 text-right text-sm font-semibold text-primary">{val}</span>
                  <div className="w-32">
                    <Progress value={val} size="sm" />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => handleSave("DRAFT")} loading={saving}>
            <Save size={14} /> Salvar rascunho
          </Button>
          <Button onClick={() => handleSave("PUBLISHED")} loading={saving}>
            <Send size={14} /> Publicar vaga
          </Button>
        </div>

      </div>
    </DashboardShell>
  );
}
