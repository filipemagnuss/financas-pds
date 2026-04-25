import Link from "next/link";
import { Plus, Wallet, Pencil } from "lucide-react";
import { prisma } from "@/app/lib/prisma";
import { getUsuarioId } from "@/app/lib/auth";
import { formatBRL } from "@/app/lib/format";
import { ExcluirContaBotao } from "./excluir-conta";

export default async function ContasPage() {
  const usuarioId = await getUsuarioId();
  const contas = await prisma.contaBancaria.findMany({
    where: { usuario_id: usuarioId },
    orderBy: { nome: "asc" },
  });

  const total = contas.reduce((acc, c) => acc + Number(c.saldo_atual), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Contas Bancárias</h1>
          <p className="text-sm text-slate-400">Gerencie suas contas e saldos.</p>
        </div>
        <Link
          href="/contas/nova"
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nova conta</span>
        </Link>
      </div>

      {contas.length > 0 && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-center justify-between">
          <span className="text-sm text-slate-300">Saldo total</span>
          <span className="text-xl font-bold text-emerald-400">{formatBRL(total)}</span>
        </div>
      )}

      {contas.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/30 p-10 text-center">
          <Wallet className="h-10 w-10 text-slate-500 mx-auto mb-3" />
          <p className="text-sm text-slate-400 mb-4">
            Você ainda não tem contas cadastradas.
          </p>
          <Link
            href="/contas/nova"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400 hover:text-emerald-300"
          >
            <Plus className="h-4 w-4" />
            Cadastrar primeira conta
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {contas.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                  <Wallet className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-white truncate">{c.nome}</p>
                  <p className="text-xs text-slate-400">
                    {Number(c.saldo_atual) < 0 ? "Saldo negativo" : "Saldo disponível"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={`text-base font-bold ${
                    Number(c.saldo_atual) < 0 ? "text-red-400" : "text-white"
                  }`}
                >
                  {formatBRL(Number(c.saldo_atual))}
                </span>
                <Link
                  href={`/contas/${c.id}/editar`}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition-all hover:bg-white/10 hover:text-white"
                  title="Editar"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <ExcluirContaBotao id={c.id} nome={c.nome} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
