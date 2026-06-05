import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency = "BRL") {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(value);
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(date));
}

export function slugify(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

export function scoreToColor(score: number): string {
  if (score >= 80) return "#22C55E";
  if (score >= 60) return "#00D4FF";
  if (score >= 40) return "#F97316";
  return "#EF4444";
}

export function scoreToLabel(score: number): string {
  if (score >= 80) return "Excelente";
  if (score >= 60) return "Bom";
  if (score >= 40) return "Regular";
  return "Em desenvolvimento";
}

export const PROFILE_LABELS: Record<string, string> = {
  EXECUTOR: "Executor",
  ANALYST: "Analista",
  CREATOR: "Criador",
  LEADER: "Líder",
  STRATEGIST: "Estrategista",
  COMMUNICATOR: "Comunicador",
  INVESTIGATOR: "Investigador",
  TECHNICAL_SPECIALIST: "Especialista Técnico",
};

export const BEHAVIORAL_DIMENSIONS = [
  { key: "scoreLeadership", label: "Liderança", icon: "👑" },
  { key: "scoreOrganization", label: "Organização", icon: "📋" },
  { key: "scoreCommunication", label: "Comunicação", icon: "💬" },
  { key: "scoreCreativity", label: "Criatividade", icon: "💡" },
  { key: "scoreExecution", label: "Execução", icon: "⚡" },
  { key: "scoreCollaboration", label: "Colaboração", icon: "🤝" },
  { key: "scoreResilience", label: "Resiliência", icon: "🛡️" },
  { key: "scoreAdaptability", label: "Adaptabilidade", icon: "🔄" },
] as const;

export const INTERVIEW_METRICS = [
  { key: "scoreClarity", label: "Clareza" },
  { key: "scoreCommunication", label: "Comunicação" },
  { key: "scoreObjectivity", label: "Objetividade" },
  { key: "scoreLeadership", label: "Liderança" },
  { key: "scoreConfidence", label: "Segurança" },
  { key: "scoreTechnical", label: "Conhecimento Técnico" },
] as const;
