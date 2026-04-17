'use client';

import { useSignUp } from "@clerk/nextjs/legacy";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignUpForm() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    try {
      await signUp.create({
        emailAddress: email,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      setPendingVerification(true);
      setError("");
    } catch (err) {
      const message =
        err instanceof Error && "errors" in err
          ? (err as { errors?: { longMessage?: string }[] }).errors?.[0]?.longMessage
          : undefined;
      setError(message || "Erro ao criar conta.");
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        router.push("/");
      }
    } catch (err) {
      const message =
        err instanceof Error && "errors" in err
          ? (err as { errors?: { longMessage?: string }[] }).errors?.[0]?.longMessage
          : undefined;
      setError(message || "Código inválido.");
    }
  };

  return (
    <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
      <h1 className="mb-8 text-center text-3xl font-black tracking-tight text-white">
        Finanças <span className="text-emerald-400">IA</span>
      </h1>
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {pendingVerification ? (
        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label className="block text-sm/6 font-medium text-gray-100">
              Verifique seu e-mail
            </label>
            <p className="text-xs text-gray-400 mb-2">Digite o código de 6 dígitos enviado para {email}</p>
            <div className="mt-2">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-white outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:outline-indigo-500 sm:text-sm/6"
                placeholder="000000"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-500 py-1.5 text-white font-semibold rounded-md hover:bg-indigo-400 shadow-sm"
          >
            Verificar Código
          </button>
        </form>
      ) : (
  
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm/6 font-medium text-gray-100">
              Email
            </label>
            <div className="mt-2">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-white outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:outline-indigo-500 sm:text-sm/6"
                placeholder="E-mail"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm/6 font-medium text-gray-100">
              Senha
            </label>
            <div className="mt-2">
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-white outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:outline-indigo-500 sm:text-sm/6"
                placeholder="Senha"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-500 py-1.5 text-white font-semibold rounded-md hover:bg-indigo-400 shadow-sm"
          >
            Criar conta
          </button>
        </form>
      )}

      {!pendingVerification && (
        <p className="mt-10 text-center text-sm/6 text-gray-400">
          Já tem uma conta?{' '}
          <a href="/sign-in" className="font-semibold text-indigo-400 hover:text-indigo-300">
            Fazer login
          </a>
        </p>
      )}
    </div>
  );
}