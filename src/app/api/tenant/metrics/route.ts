import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/tenant";

export async function GET(req: NextRequest) {
  const ctx = await getTenantContext(req);
  if (!ctx || (ctx.role !== "COMPANY" && ctx.role !== "ADMIN") || !ctx.tenantId) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const tenantId = ctx.tenantId;

  const [
    totalJobs, activeJobs, totalApplications, hired, pending,
    savedCount, tenant, avgMatch,
  ] = await Promise.all([
    prisma.job.count({ where: { companyId: tenantId } }),
    prisma.job.count({ where: { companyId: tenantId, status: "PUBLISHED" } }),
    prisma.application.count({ where: { tenantId } }),
    prisma.application.count({ where: { tenantId, status: "HIRED" } }),
    prisma.application.count({ where: { tenantId, status: "PENDING" } }),
    prisma.savedCandidate.count({ where: { companyId: tenantId } }),
    prisma.tenant.findUnique({ where: { id: tenantId }, include: { _count: { select: { members: true } } } }),
    prisma.application.aggregate({
      where: { tenantId },
      _avg: { matchScore: true },
    }),
  ]);

  return NextResponse.json({
    totalJobs,
    activeJobs,
    totalApplications,
    hired,
    pending,
    savedCandidates: savedCount,
    teamMembers: tenant?._count.members ?? 0,
    plan: tenant?.plan ?? "free",
    maxJobs: tenant?.maxJobs ?? 3,
    maxUsers: tenant?.maxUsers ?? 5,
    avgMatchScore: Math.round(avgMatch._avg.matchScore ?? 0),
  });
}
