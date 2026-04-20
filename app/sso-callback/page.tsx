'use client';

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';

export default function SSOCallbackPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#020617] p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-emerald-500/10 blur-[120px]" />

      <div className="w-full max-w-md space-y-8 rounded-3xl border border-white/10 bg-slate-900/40 p-8 shadow-2xl backdrop-blur-xl z-10 text-center">
        <h1 className="text-3xl font-black text-white tracking-tight">
          Finanças <span className="text-emerald-400">IA</span>
        </h1>

        <div className="flex flex-col items-center justify-center space-y-6 py-6">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500/20 border-t-emerald-500" />
          
          <p className="text-sm text-slate-400 font-medium animate-pulse">
            A sincronizar a sua conta...
          </p>
        </div>

        <AuthenticateWithRedirectCallback
          signInFallbackRedirectUrl="/dashboard"
          signUpFallbackRedirectUrl="/dashboard"
        />
      </div>
    </div>
  );
}