import { NextRequest, NextResponse } from "next/server";
import { analyzeWithAI } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const { type, data } = await req.json();

    let prompt = "";
    let system = "Você é o motor de IA da Aptiva AI, especializado em avaliação de talentos e recrutamento.";

    if (type === "test_creativity") {
      prompt = `Analise a resposta criativa do candidato e pontue de 0 a 100:
Resposta: "${data.answer}"
Questão: "${data.question}"

Avalie: originalidade, inovação, complexidade da solução, clareza.
Retorne JSON: {"score": 75, "originality": 80, "innovation": 70, "complexity": 75, "clarity": 75, "feedback": "..."}`;
    } else if (type === "profile_classification") {
      prompt = `Classifique o perfil profissional baseado nos scores comportamentais:
Liderança: ${data.leadership}, Organização: ${data.organization}, Comunicação: ${data.communication},
Criatividade: ${data.creativity}, Execução: ${data.execution}, Colaboração: ${data.collaboration},
Resiliência: ${data.resilience}, Adaptabilidade: ${data.adaptability}

Retorne JSON: {"primary": "LEADER", "secondary": "STRATEGIST", "description": "..."}
Perfis possíveis: EXECUTOR, ANALYST, CREATOR, LEADER, STRATEGIST, COMMUNICATOR, INVESTIGATOR, TECHNICAL_SPECIALIST`;
    } else if (type === "resume_summary") {
      prompt = `Faça um resumo executivo deste currículo em 3 bullet points para recrutadores:
${data.resumeText}
Retorne JSON: {"summary": "...", "highlights": ["...", "...", "..."], "redFlags": ["..."]}`;
    } else if (type === "candidate_comparison") {
      prompt = `Compare estes ${data.candidates.length} candidatos para a vaga "${data.jobTitle}":
${JSON.stringify(data.candidates)}
Retorne JSON: {"ranking": [{"id": "...", "reason": "..."}], "recommendation": "...", "insights": "..."}`;
    }

    if (!prompt) return NextResponse.json({ error: "Tipo de análise inválido" }, { status: 400 });

    const result = await analyzeWithAI(prompt, system);

    try {
      const parsed = JSON.parse(result);
      return NextResponse.json(parsed);
    } catch {
      return NextResponse.json({ raw: result });
    }
  } catch (err) {
    console.error("[ai analyze]", err);
    return NextResponse.json({ error: "Erro na análise de IA" }, { status: 500 });
  }
}
