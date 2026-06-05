"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Brain, Mail, Lock, User, Building2, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

type Role = "CANDIDATE" | "COMPANY";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = (searchParams.get("role")?.toUpperCase() ?? "CANDIDATE") as Role;

  const [role, setRole] = useState<Role>(defaultRole === "COMPANY" ? "COMPANY" : "CANDIDATE");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao criar conta");

      router.push(role === "COMPANY" ? "/company/dashboard" : "/candidate/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="h-10 w-10 rounded-xl bg-linear-to-br from-primary to-secondary flex items-center justify-center">
              <Brain size={20} className="text-white" />
            </div>
            <span className="font-bold text-xl text-white">Aptiva <span className="text-secondary">AI</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Crie sua conta</h1>
          <p className="text-slate-400 text-sm mt-1">Grátis para começar</p>
        </div>

        {/* Role Selector */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {(["CANDIDATE", "COMPANY"] as Role[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                role === r
                  ? "border-primary bg-primary/10 text-white"
                  : "border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-500"
              )}
            >
              {r === "CANDIDATE" ? <User size={22} /> : <Building2 size={22} />}
              <span className="text-sm font-semibold">{r === "CANDIDATE" ? "Candidato" : "Empresa"}</span>
              <span className="text-xs text-center opacity-70">
                {r === "CANDIDATE" ? "Buscar oportunidades" : "Encontrar talentos"}
              </span>
              {role === r && <CheckCircle2 size={14} className="text-primary" />}
            </button>
          ))}
        </div>

        {/* Card */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8">
          <form onSubmit={handleRegister} className="space-y-5">
            <Input
              label={role === "COMPANY" ? "Nome da empresa" : "Seu nome completo"}
              type="text"
              placeholder={role === "COMPANY" ? "Acme Corp" : "João Silva"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              leftIcon={role === "COMPANY" ? <Building2 size={16} /> : <User size={16} />}
              required
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
            />
            <Input
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail size={16} />}
              required
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
            />
            <Input
              label="Senha"
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock size={16} />}
              minLength={8}
              required
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
            />

            {error && (
              <div className="rounded-lg bg-red-900/30 border border-red-800 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <p className="text-xs text-slate-500">
              Ao criar sua conta você concorda com os{" "}
              <Link href="/terms" className="text-secondary hover:underline">Termos de Uso</Link> e{" "}
              <Link href="/privacy" className="text-secondary hover:underline">Política de Privacidade</Link>.
              Seus dados são protegidos conforme a LGPD.
            </p>

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Criar conta <ArrowRight size={16} />
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-400">
            Já tem uma conta?{" "}
            <Link href="/login" className="text-secondary hover:underline font-medium">
              Entrar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
