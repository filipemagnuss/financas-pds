'use client';

import { useSignIn } from "@clerk/nextjs/legacy";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { translateClerkError } from "../../_lib/translate-clerk-error";

export default function ForgotPasswordForm() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [pendingReset, setPendingReset] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setIsLoading(true);
    setError("");

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      setPendingReset(true);
    } catch (err) {
      setError(translateClerkError(err, "Não foi possível enviar o código."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setIsLoading(true);
    setError("");

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      } else {
        setError("Não foi possível redefinir a senha. Tente novamente.");
      }
    } catch (err) {
      setError(translateClerkError(err, "Código inválido ou senha fraca."));
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
            {pendingReset ? "Crie uma nova senha." : "Recupere o acesso à sua conta."}
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-center text-sm text-red-400">
            {error}
          </div>
        )}

        {pendingReset ? (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-slate-300">
                Código de verificação
              </label>
              <p className="mt-1 text-xs text-slate-400">
                Digite o código de 6 dígitos enviado para <span className="text-slate-200">{email}</span>
              </p>
              <div className="mt-1.5">
                <input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  suppressHydrationWarning
                  className="block w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-2.5 text-center text-lg tracking-widest text-white placeholder-slate-500 outline-none transition-all focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                  placeholder="000000"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                Nova senha
              </label>
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
              {isLoading ? "Redefinindo..." : "Redefinir senha"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRequestCode} className="space-y-5">
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

            <button
              type="submit"
              disabled={isLoading || !isLoaded}
              className="mt-4 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:from-emerald-400 hover:to-teal-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50"
            >
              {isLoading ? "Enviando..." : "Enviar código"}
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-sm text-slate-400">
          Lembrou a senha?{' '}
          <Link href="/sign-in" className="font-semibold text-emerald-400 hover:text-emerald-300">
            Voltar ao login
          </Link>
        </p>
      </div>
    </div>
  );
}
