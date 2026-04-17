'use client';

import { useSignIn } from "@clerk/nextjs/legacy";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginForms() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return; 

    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/");
      }
    } catch (err) {
      const message =
        err instanceof Error && "errors" in err
          ? (err as { errors?: { longMessage?: string }[] }).errors?.[0]?.longMessage
          : undefined;
      setError(message || "Erro ao entrar.");
    }
  };

 
  return (
    <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
      <h1 className="mb-8 text-center text-3xl font-black tracking-tight text-white">
        Finanças <span className="text-emerald-400">IA</span>
      </h1>
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
      
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
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm/6 font-medium text-gray-100">
              Senha
            </label>
            <div className="text-sm">
              <a href="/forgot-password" className="font-semibold text-indigo-400 hover:text-indigo-300">
                Esqueceu a senha?
              </a>
            </div>
          </div>
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
          Entrar
        </button>
      </form>

      <p className="mt-10 text-center text-sm/6 text-gray-400">
        Não tem uma conta?{' '}
        <a href="/sign-up" className="font-semibold text-indigo-400 hover:text-indigo-300">
          Criar conta
        </a>
      </p>
    </div>
  );
}