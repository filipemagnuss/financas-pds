'use client';

import { useSignUp } from "@clerk/nextjs/legacy";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Sparkles, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { translateClerkError } from "../../_lib/translate-clerk-error";

export default function SignUpForm() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [code, setCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await signUp.create({ emailAddress: email, password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err) {
      setError(translateClerkError(err, "Erro ao criar conta."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setIsLoading(true);
    setError("");

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({ code });

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        router.push("/dashboard");
      } else {
        setError("Não foi possível concluir a verificação. Tente novamente.");
      }
    } catch (err) {
      setError(translateClerkError(err, "Código inválido."));
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
            {pendingVerification ? "Verifique seu e-mail para continuar." : "Crie sua conta."}
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-center text-sm text-red-400">
            {error}
          </div>
        )}

        {pendingVerification ? (
          <form onSubmit={handleVerify} className="space-y-5">
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

            <button
              type="submit"
              disabled={isLoading || !isLoaded}
              className="mt-4 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:from-emerald-400 hover:to-teal-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50"
            >
              {isLoading ? "Verificando..." : "Verificar código"}
            </button>
          </form>
        ) : (
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
              <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                Senha
              </label>
              <div className="mt-1.5 relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  suppressHydrationWarning
                  className="block w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-2.5 pr-11 text-white placeholder-slate-500 outline-none transition-all focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 sm:text-sm"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-200"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-300">
                Confirmar senha
              </label>
              <div className="mt-1.5 relative">
                <input
                  id="confirm-password"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  suppressHydrationWarning
                  className="block w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-2.5 pr-11 text-white placeholder-slate-500 outline-none transition-all focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 sm:text-sm"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-200"
                  aria-label={showConfirm ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div id="clerk-captcha" />

            <button
              type="submit"
              disabled={isLoading || !isLoaded}
              className="mt-4 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:from-emerald-400 hover:to-teal-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50"
            >
              {isLoading ? "Criando conta..." : "Criar conta"}
            </button>
          </form>
        )}

        {!pendingVerification && (
          <p className="mt-8 text-center text-sm text-slate-400">
            Já tem uma conta?{' '}
            <Link href="/sign-in" className="font-semibold text-emerald-400 hover:text-emerald-300">
              Fazer login
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
