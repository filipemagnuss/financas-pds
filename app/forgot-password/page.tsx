import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm space-y-6 text-center">
        <h1 className="text-2xl font-bold text-white">Recuperar senha</h1>
        <p className="text-sm text-gray-400">
          Em breve você poderá redefinir sua senha por aqui.
        </p>
        <Link
          href="/sign-in"
          className="inline-block text-sm font-semibold text-indigo-400 hover:text-indigo-300"
        >
          Voltar para o login
        </Link>
      </div>
    </main>
  );
}
