'use client';

import { useSignIn } from "@clerk/nextjs/legacy";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { translateClerkError } from "../../_lib/translate-clerk-error";

export default function LoginForms() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setIsLoading(true);
    setError("");

    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      } else {
        setError("Não foi possível concluir o login. Tente novamente.");
      }
    } catch (err) {
      setError(translateClerkError(err, "Erro ao entrar."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative mt-10 sm:mx-auto sm:w-full sm:max-w-md overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl">
      <div className="absolute -left-16 -top-16 h-32 w-32 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="absolute -bottom-16 -right-16 h-32 w-32 rounded-full bg-teal-500/20 blur-3xl" />

      <div className="relative">
        <div className="mb-8 flex flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Finanças <span className="text-emerald-400">IA</span>
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Acesse o seu painel.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-center text-sm text-red-400">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300">
              Email
            </label>
            <div className="mt-1.5">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                suppressHydrationWarning
                className="block w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-2.5 text-white placeholder-slate-500 outline-none transition-all focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 sm:text-sm"
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                Senha
              </label>
              <div className="text-sm">
                <Link href="/forgot-password" className="font-semibold text-emerald-400 hover:text-emerald-300">
                  Esqueceu a senha?
                </Link>
              </div>
            </div>
            <div className="mt-1.5">
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                suppressHydrationWarning
                className="block w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-2.5 text-white placeholder-slate-500 outline-none transition-all focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 sm:text-sm"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading || !isLoaded}
            className="mt-4 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:from-emerald-400 hover:to-teal-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50"
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-400">
          Não tem uma conta?{' '}
          <Link href="/sign-up" className="font-semibold text-emerald-400 hover:text-emerald-300">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}