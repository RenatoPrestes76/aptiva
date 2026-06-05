import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";

const SYSTEM_PROMPT = `Você é a entrevistadora virtual da Aptiva AI, especialista em recrutamento e avaliação de talentos.

Conduza uma entrevista estruturada com exatamente 6 perguntas no total. Seja profissional, empática e perspicaz.

Após a 6ª resposta, encerre a entrevista e retorne um JSON com as pontuações (0-100) para:
- clarity (clareza)
- communication (comunicação)
- objectivity (objetividade)
- leadership (liderança)
- confidence (segurança)
- technical (conhecimento técnico)

No encerramento, retorne EXATAMENTE neste formato JSON (sem markdown):
FINAL_SCORES:{"clarity":85,"communication":78,"objectivity":82,"leadership":70,"confidence":75,"technical":88}

Antes disso, faça apenas 1 pergunta por vez, de forma natural e conversacional.`;

export async function POST(req: NextRequest) {
  try {
    const { messages, questionCount } = await req.json();

    const apiMessages = [
      { role: "system" as const, content: SYSTEM_PROMPT },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role === "ai" ? "assistant" as const : "user" as const,
        content: m.content,
      })),
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: apiMessages,
      temperature: 0.8,
      max_tokens: 600,
    });

    const content = response.choices[0]?.message?.content ?? "";

    if (content.includes("FINAL_SCORES:")) {
      const jsonStr = content.split("FINAL_SCORES:")[1].trim();
      const scores = JSON.parse(jsonStr);
      const farewell = content.split("FINAL_SCORES:")[0].trim();

      return NextResponse.json({
        finished: true,
        message: farewell || "Entrevista concluída! Obrigado pela sua participação. Seu relatório foi gerado.",
        scores,
      });
    }

    return NextResponse.json({ finished: false, message: content });
  } catch (err) {
    console.error("[interview chat]", err);
    return NextResponse.json({ error: "Erro ao processar resposta" }, { status: 500 });
  }
}
