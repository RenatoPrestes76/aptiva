import { prisma } from "./prisma";
import { createServerSupabase } from "./supabase";
import { NextRequest } from "next/server";

export interface TenantContext {
  userId: string;
  role: "CANDIDATE" | "COMPANY" | "ADMIN";
  tenantId?: string;       // preenchido apenas para COMPANY
  candidateId?: string;    // preenchido apenas para CANDIDATE
}

export async function getTenantContext(req: NextRequest): Promise<TenantContext | null> {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;

  const supabase = createServerSupabase();
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    include: {
      company: { select: { id: true } },
      candidate: { select: { id: true } },
    },
  });
  if (!dbUser) return null;

  return {
    userId: dbUser.id,
    role: dbUser.role,
    tenantId: dbUser.company?.id,
    candidateId: dbUser.candidate?.id,
  };
}

// Retorna um Prisma client filtrado pelo tenant — para uso em API routes
export function tenantQuery(tenantId: string) {
  return {
    jobs: {
      findMany: (args: object = {}) =>
        prisma.job.findMany({ ...args, where: { companyId: tenantId, ...(args as { where?: object }).where } }),
      count: (args: object = {}) =>
        prisma.job.count({ ...args, where: { companyId: tenantId, ...(args as { where?: object }).where } }),
    },
    applications: {
      findMany: (args: object = {}) =>
        prisma.application.findMany({ ...args, where: { tenantId, ...(args as { where?: object }).where } }),
    },
    savedCandidates: {
      findMany: (args: object = {}) =>
        prisma.savedCandidate.findMany({ ...args, where: { companyId: tenantId, ...(args as { where?: object }).where } }),
    },
  };
}

// Verifica se o tenant está ativo e dentro dos limites do plano
export async function assertTenantQuota(
  tenantId: string,
  resource: "jobs" | "members"
): Promise<void> {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) throw new Error("Tenant não encontrado");
  if (!tenant.isActive) throw new Error("Conta suspensa. Entre em contato com o suporte.");

  if (resource === "jobs") {
    const count = await prisma.job.count({
      where: { companyId: tenantId, status: { in: ["DRAFT", "PUBLISHED", "PAUSED"] } },
    });
    if (count >= tenant.maxJobs) {
      throw new Error(`Limite de ${tenant.maxJobs} vagas atingido no plano ${tenant.plan}. Faça upgrade para continuar.`);
    }
  }

  if (resource === "members") {
    const count = await prisma.tenantMember.count({ where: { tenantId } });
    if (count >= tenant.maxUsers) {
      throw new Error(`Limite de ${tenant.maxUsers} usuários atingido no plano ${tenant.plan}. Faça upgrade para continuar.`);
    }
  }
}
