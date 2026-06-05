"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Brain, Mail, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;

      const res = await fetch("/api/auth/me");
      const user = await res.json();

      if (user.role === "COMPANY") router.push("/company/dashboard");
      else if (user.role === "ADMIN") router.push("/admin/dashboard");
      else router.push("/candidate/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="h-10 w-10 rounded-xl bg-linear-to-br from-primary to-secondary flex items-center justify-center">
              <Brain size={20} className="text-white" />
            </div>
            <span className="font-bold text-xl text-white">Aptiva <span className="text-secondary">AI</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Bem-vindo de volta</h1>
          <p className="text-slate-400 text-sm mt-1">Entre na sua conta</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8">
          <form onSubmit={handleLogin} className="space-y-5">
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
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock size={16} />}
              required
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
            />

            {error && (
              <div className="rounded-lg bg-red-900/30 border border-red-800 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-400">
                <input type="checkbox" className="rounded" />
                Lembrar-me
              </label>
              <Link href="/forgot-password" className="text-secondary hover:underline">
                Esqueci minha senha
              </Link>
            </div>

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Entrar <ArrowRight size={16} />
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-400">
            Não tem uma conta?{" "}
            <Link href="/register" className="text-secondary hover:underline font-medium">
              Criar conta grátis
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
