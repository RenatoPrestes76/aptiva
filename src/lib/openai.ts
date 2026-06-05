import OpenAI from "openai";

const globalForOpenAI = globalThis as unknown as { openai: OpenAI };

export const openai =
  globalForOpenAI.openai ??
  new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

if (process.env.NODE_ENV !== "production") globalForOpenAI.openai = openai;

export async function analyzeWithAI(prompt: string, systemPrompt?: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt ?? "You are Aptiva AI, an expert talent assessment system." },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 1500,
  });
  return response.choices[0]?.message?.content ?? "";
}

export async function streamInterviewResponse(
  messages: { role: "user" | "assistant" | "system"; content: string }[]
) {
  return openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    stream: true,
    temperature: 0.8,
    max_tokens: 500,
  });
}
