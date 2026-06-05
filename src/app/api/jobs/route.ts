import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext, assertTenantQuota } from "@/lib/tenant";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") ?? "PUBLISHED";
    const page = Number(searchParams.get("page") ?? "1");
    const limit = Number(searchParams.get("limit") ?? "20");

    const ctx = await getTenantContext(req);

    // Empresa autenticada: vê apenas as suas vagas (qualquer status)
    // Candidato/anônimo: vê apenas vagas publicadas de todos os tenants
    const where = ctx?.role === "COMPANY" && ctx.tenantId
      ? { companyId: ctx.tenantId }
      : { status: "PUBLISHED" as const };

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          company: { select: { companyName: true, logoUrl: true, location: true } },
          skills: { include: { skill: true } },
          _count: { select: { applications: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.job.count({ where }),
    ]);

    return NextResponse.json({ jobs, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("[jobs GET]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getTenantContext(req);
    if (!ctx || ctx.role !== "COMPANY" || !ctx.tenantId) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    // Verifica quota do plano antes de criar
    await assertTenantQuota(ctx.tenantId, "jobs");

    const body = await req.json();
    const {
      title, description, requirements, benefits, location, remote,
      salaryMin, salaryMax, contractType, experienceLevel, status,
      reqLeadership, reqOrganization, reqCommunication, reqCreativity,
      reqExecution, reqCollaboration, reqResilience, reqAdaptability,
    } = body;

    if (!title || !description) {
      return NextResponse.json({ error: "Título e descrição são obrigatórios" }, { status: 400 });
    }

    const job = await prisma.job.create({
      data: {
        companyId: ctx.tenantId,
        title, description,
        requirements: requirements ?? null,
        benefits: benefits ?? null,
        location: location ?? null,
        remote: remote ?? false,
        salaryMin: salaryMin ? Number(salaryMin) : null,
        salaryMax: salaryMax ? Number(salaryMax) : null,
        contractType: contractType ?? null,
        experienceLevel: experienceLevel ?? null,
        status: status ?? "DRAFT",
        reqLeadership: reqLeadership ?? 50,
        reqOrganization: reqOrganization ?? 50,
        reqCommunication: reqCommunication ?? 50,
        reqCreativity: reqCreativity ?? 50,
        reqExecution: reqExecution ?? 50,
        reqCollaboration: reqCollaboration ?? 50,
        reqResilience: reqResilience ?? 50,
        reqAdaptability: reqAdaptability ?? 50,
      },
    });

    return NextResponse.json({ id: job.id }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro interno";
    // Quota exceeded → 402 Payment Required
    if (msg.includes("Limite")) return NextResponse.json({ error: msg }, { status: 402 });
    console.error("[jobs POST]", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
