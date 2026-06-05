import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantContext, assertTenantQuota } from "@/lib/tenant";

export async function GET(req: NextRequest) {
  const ctx = await getTenantContext(req);
  if (!ctx || ctx.role !== "COMPANY" || !ctx.tenantId) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const members = await prisma.tenantMember.findMany({
    where: { tenantId: ctx.tenantId },
    include: { user: { select: { name: true, email: true, avatar: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(members);
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getTenantContext(req);
    if (!ctx || ctx.role !== "COMPANY" || !ctx.tenantId) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    await assertTenantQuota(ctx.tenantId, "members");

    const { userId, role } = await req.json();
    if (!userId) return NextResponse.json({ error: "userId obrigatório" }, { status: 400 });

    const member = await prisma.tenantMember.create({
      data: {
        tenantId: ctx.tenantId,
        userId,
        role: role ?? "recruiter",
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro interno";
    if (msg.includes("Limite")) return NextResponse.json({ error: msg }, { status: 402 });
    console.error("[tenant members POST]", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
