import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Proprietary match algorithm: weighted behavioral score comparison
function calculateMatch(candidate: Record<string, number>, job: Record<string, number>): number {
  const dimensions = [
    { cKey: "scoreLeadership", jKey: "reqLeadership", weight: 1 },
    { cKey: "scoreOrganization", jKey: "reqOrganization", weight: 1 },
    { cKey: "scoreCommunication", jKey: "reqCommunication", weight: 1.2 },
    { cKey: "scoreCreativity", jKey: "reqCreativity", weight: 1 },
    { cKey: "scoreExecution", jKey: "reqExecution", weight: 1.2 },
    { cKey: "scoreCollaboration", jKey: "reqCollaboration", weight: 0.8 },
    { cKey: "scoreResilience", jKey: "reqResilience", weight: 0.8 },
    { cKey: "scoreAdaptability", jKey: "reqAdaptability", weight: 1 },
  ];

  let totalWeight = 0;
  let score = 0;

  for (const d of dimensions) {
    const cVal = candidate[d.cKey] ?? 50;
    const jReq = job[d.jKey] ?? 50;
    const w = (jReq / 100) * d.weight; // higher job requirement = more weight
    const match = Math.max(0, 100 - Math.abs(cVal - jReq));
    score += match * w;
    totalWeight += 100 * w;
  }

  return totalWeight > 0 ? Math.round((score / totalWeight) * 100) : 0;
}

export async function POST(req: NextRequest) {
  try {
    const { jobId } = await req.json();

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return NextResponse.json({ error: "Vaga não encontrada" }, { status: 404 });

    const candidates = await prisma.candidateProfile.findMany({
      include: { user: { select: { name: true, email: true, avatar: true, publicSlug: true } } },
      where: { overallScore: { gt: 0 } },
    });

    const ranked = candidates
      .map((c) => ({
        id: c.id,
        name: c.user.name,
        email: c.user.email,
        avatar: c.user.avatar,
        slug: c.user.publicSlug,
        headline: c.headline,
        primaryProfile: c.primaryProfile,
        overallScore: c.overallScore,
        matchScore: calculateMatch(c as unknown as Record<string, number>, job as unknown as Record<string, number>),
      }))
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 50);

    // Persist match scores on applications
    await Promise.all(
      ranked.map((r) =>
        prisma.application.updateMany({
          where: { jobId, candidateId: r.id },
          data: { matchScore: r.matchScore },
        })
      )
    );

    return NextResponse.json({ ranked });
  } catch (err) {
    console.error("[match]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
