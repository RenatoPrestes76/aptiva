import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScoreRing } from "@/components/ui/score-ring";
import { Progress } from "@/components/ui/progress";
import { BEHAVIORAL_DIMENSIONS, PROFILE_LABELS, scoreToColor, formatDate } from "@/lib/utils";
import { Brain, MapPin, Linkedin, Github, Globe, ExternalLink } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const user = await prisma.user.findUnique({
    where: { publicSlug: params.slug },
    include: { candidate: true },
  });
  if (!user) return { title: "Perfil não encontrado" };
  return {
    title: `${user.name} — Aptiva AI`,
    description: user.candidate?.headline ?? `Perfil profissional de ${user.name} na Aptiva AI`,
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const user = await prisma.user.findUnique({
    where: { publicSlug: params.slug },
    include: {
      candidate: {
        include: {
          experiences: { orderBy: { startDate: "desc" } },
          educations: { orderBy: { startYear: "desc" } },
          skills: { include: { skill: true } },
          certifications: true,
          portfolioItems: true,
        },
      },
    },
  });

  if (!user || !user.candidate) notFound();
  const c = user.candidate;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg">
      {/* Nav */}
      <nav className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4 flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-linear-to-br from-primary to-secondary flex items-center justify-center">
            <Brain size={14} className="text-white" />
          </div>
          <span className="font-bold text-sm text-slate-800 dark:text-white">Aptiva AI</span>
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">

        {/* Header */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <Avatar name={user.name} src={user.avatar} size="xl" />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{user.name}</h1>
              {c.headline && <p className="text-slate-500 mt-1">{c.headline}</p>}
              <div className="flex flex-wrap gap-2 mt-3">
                {c.primaryProfile && <Badge variant="default">{PROFILE_LABELS[c.primaryProfile]}</Badge>}
                {c.secondaryProfile && <Badge variant="secondary">{PROFILE_LABELS[c.secondaryProfile]}</Badge>}
              </div>
              <div className="flex flex-wrap gap-4 mt-4 text-xs text-slate-500">
                {c.location && <span className="flex items-center gap-1"><MapPin size={12} />{c.location}</span>}
                {c.linkedinUrl && (
                  <a href={`https://${c.linkedinUrl}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-500 hover:underline">
                    <Linkedin size={12} />LinkedIn
                  </a>
                )}
                {c.githubUrl && (
                  <a href={`https://${c.githubUrl}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline">
                    <Github size={12} />GitHub
                  </a>
                )}
                {c.portfolioUrl && (
                  <a href={c.portfolioUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                    <Globe size={12} />Portfolio
                  </a>
                )}
              </div>
              {c.bio && <p className="text-sm text-slate-600 dark:text-slate-300 mt-4 leading-relaxed">{c.bio}</p>}
            </div>
            <ScoreRing score={c.overallScore} label="Score IA" />
          </div>
        </div>

        {/* Behavioral */}
        {c.overallScore > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-5">Perfil Comportamental</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {BEHAVIORAL_DIMENSIONS.map((d) => {
                const val = (c as unknown as Record<string, number>)[d.key] ?? 0;
                return (
                  <div key={d.key}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-slate-600 dark:text-slate-400">{d.icon} {d.label}</span>
                      <span className="font-bold" style={{ color: scoreToColor(val) }}>{val}</span>
                    </div>
                    <Progress value={val} color={scoreToColor(val)} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Experience */}
            {c.experiences.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Experiências</h2>
                <div className="space-y-5">
                  {c.experiences.map((exp) => (
                    <div key={exp.id} className="flex gap-4">
                      <div className="mt-1 h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">
                        {exp.company[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">{exp.role}</p>
                        <p className="text-xs text-slate-500">{exp.company}</p>
                        <p className="text-xs text-slate-400">{formatDate(exp.startDate)} – {exp.current ? "Atual" : (exp.endDate ? formatDate(exp.endDate) : "")}</p>
                        {exp.description && <p className="text-xs text-slate-500 mt-1">{exp.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Portfolio */}
            {c.portfolioItems.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Portfólio</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {c.portfolioItems.map((p) => (
                    <div key={p.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-sm text-slate-800 dark:text-slate-100">{p.title}</p>
                        {p.url && (
                          <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-primary shrink-0">
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                      {p.description && <p className="text-xs text-slate-400 mt-1">{p.description}</p>}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {p.techStack.map((t) => <span key={t} className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">{t}</span>)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Skills */}
            {c.skills.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-base font-bold text-slate-800 dark:text-white mb-3">Habilidades</h2>
                <div className="flex flex-wrap gap-2">
                  {c.skills.map((s) => (
                    <Badge key={s.id} variant="outline">{s.skill.name}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {c.certifications.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-base font-bold text-slate-800 dark:text-white mb-3">Certificações</h2>
                <div className="space-y-2">
                  {c.certifications.map((cert) => (
                    <div key={cert.id} className="flex items-start gap-2">
                      <span className="text-sm">🏆</span>
                      <div>
                        <p className="text-xs font-medium text-slate-800 dark:text-slate-100">{cert.name}</p>
                        <p className="text-xs text-slate-400">{cert.issuer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 pt-4">
          Perfil verificado por <Link href="/" className="text-primary hover:underline">Aptiva AI</Link>
        </p>
      </div>
    </div>
  );
}
