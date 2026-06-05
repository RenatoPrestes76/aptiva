import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { analyzeWithAI } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const { candidateId, testType, answers } = await req.json();

    if (!candidateId || !testType || !answers) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    let score = 0;
    let aiAnalysis = "";

    if (testType === "REASONING" || testType === "ATTENTION") {
      // Objective scoring
      const correct = answers.filter((a: { correct: boolean }) => a.correct).length;
      score = Math.round((correct / answers.length) * 100);
    } else if (testType === "EXECUTION") {
      // Precision & speed scoring
      const precision = answers.reduce((acc: number, a: { precision: number }) => acc + a.precision, 0) / answers.length;
      score = Math.round(precision * 100);
    } else if (testType === "CREATIVITY") {
      // AI scoring
      const prompt = `Avalie as respostas criativas do candidato (0-100 cada):
${answers.map((a: { question: string; answer: string }, i: number) => `${i + 1}. P: ${a.question}\nR: ${a.answer}`).join("\n\n")}
Retorne JSON: {"score": 75, "feedback": "..."}`;
      const result = await analyzeWithAI(prompt);
      const parsed = JSON.parse(result);
      score = parsed.score ?? 70;
      aiAnalysis = parsed.feedback ?? "";
    } else if (testType === "BEHAVIORAL") {
      // Map answers to behavioral dimensions and compute weighted score
      const scores = answers.reduce((acc: Record<string, number[]>, a: { dimension: string; value: number }) => {
        if (!acc[a.dimension]) acc[a.dimension] = [];
        acc[a.dimension].push(a.value);
        return acc;
      }, {});

      const dimensionAverages: Record<string, number> = {};
      for (const [dim, vals] of Object.entries(scores)) {
        dimensionAverages[dim] = Math.round((vals as number[]).reduce((a, b) => a + b, 0) / (vals as number[]).length);
      }

      score = Math.round(Object.values(dimensionAverages).reduce((a, b) => a + b, 0) / Object.values(dimensionAverages).length);

      // Update candidate behavioral scores
      await prisma.candidateProfile.update({
        where: { id: candidateId },
        data: {
          scoreLeadership: dimensionAverages.leadership ?? undefined,
          scoreOrganization: dimensionAverages.organization ?? undefined,
          scoreCommunication: dimensionAverages.communication ?? undefined,
          scoreCreativity: dimensionAverages.creativity ?? undefined,
          scoreExecution: dimensionAverages.execution ?? undefined,
          scoreCollaboration: dimensionAverages.collaboration ?? undefined,
          scoreResilience: dimensionAverages.resilience ?? undefined,
          scoreAdaptability: dimensionAverages.adaptability ?? undefined,
        },
      });
    }

    const result = await prisma.testResult.create({
      data: {
        candidateId,
        testType,
        score,
        rawData: answers,
        aiAnalysis: aiAnalysis || null,
      },
    });

    // Recalculate overall score
    const allResults = await prisma.testResult.findMany({ where: { candidateId } });
    const overall = Math.round(allResults.reduce((a, r) => a + r.score, 0) / allResults.length);
    await prisma.candidateProfile.update({ where: { id: candidateId }, data: { overallScore: overall } });

    return NextResponse.json({ id: result.id, score, aiAnalysis });
  } catch (err) {
    console.error("[test submit]", err);
    return NextResponse.json({ error: "Erro ao salvar resultado" }, { status: 500 });
  }
}
