import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const candidate = await prisma.candidateProfile.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { name: true, email: true, avatar: true, publicSlug: true } },
        experiences: { orderBy: { startDate: "desc" } },
        educations: { orderBy: { startYear: "desc" } },
        skills: { include: { skill: true } },
        certifications: true,
        portfolioItems: true,
        testResults: { orderBy: { completedAt: "desc" } },
        interviews: { where: { status: "COMPLETED" }, orderBy: { completedAt: "desc" }, take: 1 },
      },
    });

    if (!candidate) return NextResponse.json({ error: "Candidato não encontrado" }, { status: 404 });

    return NextResponse.json(candidate);
  } catch (err) {
    console.error("[candidate GET]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updated = await prisma.candidateProfile.update({
      where: { id: params.id },
      data: body,
    });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("[candidate PATCH]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
