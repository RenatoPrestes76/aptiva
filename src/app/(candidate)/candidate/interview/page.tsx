"use client";
import { useState, useRef, useEffect } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScoreRing } from "@/components/ui/score-ring";
import { Send, Bot, User, RefreshCw, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Message = { role: "ai" | "candidate"; content: string; timestamp: Date };
type Phase = "intro" | "interview" | "completed";

const INITIAL_MESSAGE = `Olá! Sou a entrevistadora virtual da Aptiva AI.

Vou conduzi-lo por uma entrevista estruturada para entender melhor seu perfil profissional, experiências e competências.

São aproximadamente 6 perguntas. Por favor, responda de forma clara e objetiva.

**Vamos começar? Me conte brevemente sobre sua trajetória profissional e o que te motivou a chegar onde está hoje.**`;

export default function InterviewPage() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [scores, setScores] = useState<Record<string, number> | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function startInterview() {
    setPhase("interview");
    setMessages([{ role: "ai", content: INITIAL_MESSAGE, timestamp: new Date() }]);
    setQuestionCount(1);
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "candidate", content: input, timestamp: new Date() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/interviews/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages.map((m) => ({ role: m.role, content: m.content })), questionCount }),
      });
      const data = await res.json();

      if (data.finished) {
        setMessages((prev) => [...prev, { role: "ai", content: data.message, timestamp: new Date() }]);
        setScores(data.scores);
        setPhase("completed");
      } else {
        setMessages((prev) => [...prev, { role: "ai", content: data.message, timestamp: new Date() }]);
        setQuestionCount((q) => q + 1);
      }
    } catch {
      setMessages((prev) => [...prev, {
        role: "ai",
        content: "Desculpe, tive um problema. Pode repetir sua resposta?",
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  }

  if (phase === "intro") {
    return (
      <DashboardShell role="CANDIDATE" pageTitle="Entrevista IA" userName="Carlos Mendes">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <CardContent className="pt-10 pb-10 space-y-6">
              <div className="h-20 w-20 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center mx-auto">
                <Bot size={36} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Entrevistadora Virtual</h2>
                <p className="text-slate-500 mt-2 max-w-md mx-auto">
                  A IA conduz uma entrevista estruturada e avalia suas respostas em tempo real. Ao final, você recebe um relatório completo.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                {[
                  { label: "Duração", value: "~15 min" },
                  { label: "Perguntas", value: "6 questões" },
                  { label: "Relatório", value: "Instantâneo" },
                ].map((i) => (
                  <div key={i.label} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700">
                    <p className="text-lg font-bold text-slate-800 dark:text-white">{i.value}</p>
                    <p className="text-xs text-slate-400">{i.label}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2 text-sm text-slate-500 text-left bg-slate-50 dark:bg-slate-700 rounded-xl p-4">
                <p className="font-semibold text-slate-700 dark:text-slate-200">O que será avaliado:</p>
                {["Clareza e objetividade", "Comunicação verbal", "Liderança e iniciativa", "Segurança e confiança", "Conhecimento técnico"].map((m) => (
                  <div key={m} className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-success shrink-0" />
                    <span>{m}</span>
                  </div>
                ))}
              </div>
              <Button size="lg" onClick={startInterview} className="w-full">
                Iniciar Entrevista
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    );
  }

  if (phase === "completed" && scores) {
    const avg = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length);
    return (
      <DashboardShell role="CANDIDATE" pageTitle="Resultado da Entrevista" userName="Carlos Mendes">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardContent className="pt-8 text-center">
              <ScoreRing score={avg} size={140} label="Score Geral" sublabel="Entrevista IA" />
              <h2 className="text-xl font-bold mt-4">Entrevista Concluída!</h2>
              <p className="text-slate-500 text-sm mt-1">Seu relatório foi gerado pela IA.</p>
            </CardContent>
          </Card>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(scores).map(([key, val]) => {
              const labels: Record<string, string> = {
                clarity: "Clareza", communication: "Comunicação", objectivity: "Objetividade",
                leadership: "Liderança", confidence: "Segurança", technical: "Conhecimento Técnico",
              };
              return (
                <Card key={key}>
                  <CardContent className="pt-4 pb-4 flex items-center gap-3">
                    <ScoreRing score={val} size={56} strokeWidth={6} />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{labels[key] ?? key}</span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <Button variant="outline" className="w-full" onClick={() => { setPhase("intro"); setMessages([]); setScores(null); setQuestionCount(0); }}>
            <RefreshCw size={14} /> Refazer entrevista
          </Button>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role="CANDIDATE" pageTitle="Entrevista IA" userName="Carlos Mendes">
      <div className="max-w-2xl mx-auto flex flex-col" style={{ height: "calc(100vh - 140px)" }}>
        {/* Progress */}
        <div className="flex items-center justify-between mb-4">
          <Badge variant="default">Pergunta {questionCount} de 6</Badge>
          <div className="flex gap-1.5">
            {[1,2,3,4,5,6].map((n) => (
              <div key={n} className={cn("h-2 w-8 rounded-full", n <= questionCount ? "bg-primary" : "bg-slate-200 dark:bg-slate-600")} />
            ))}
          </div>
        </div>

        {/* Messages */}
        <Card className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex gap-3", msg.role === "candidate" && "flex-row-reverse")}>
                <div className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                  msg.role === "ai" ? "bg-linear-to-br from-primary to-secondary" : "bg-slate-200 dark:bg-slate-600"
                )}>
                  {msg.role === "ai" ? <Bot size={16} className="text-white" /> : <User size={16} className="text-slate-600 dark:text-white" />}
                </div>
                <div className={cn(
                  "max-w-[80%] p-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap",
                  msg.role === "ai"
                    ? "bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-none"
                    : "bg-primary text-white rounded-tr-none"
                )}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1">
                  {[0,1,2].map((i) => (
                    <div key={i} className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-slate-200 dark:border-slate-700 p-4 flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Digite sua resposta... (Enter para enviar)"
              className="flex-1 resize-none rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-slate-800 dark:text-slate-100 placeholder:text-slate-400 min-h-[44px] max-h-32"
              rows={2}
              disabled={loading}
            />
            <Button onClick={sendMessage} disabled={loading || !input.trim()} size="icon" className="h-11 w-11 shrink-0">
              <Send size={16} />
            </Button>
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}
