import Link from "next/link";
import { Plus, ArrowDownRight, ArrowUpRight, CreditCard, Wallet } from "lucide-react";
import { prisma } from "@/app/lib/prisma";
import { getUsuarioId } from "@/app/lib/auth";
import { formatBRL, formatDataRelativa } from "@/app/lib/format";
import { ExcluirTransacaoBotao } from "./excluir-transacao";

export default async function TransacoesPage() {
  const usuarioId = await getUsuarioId();
  const transacoes = await prisma.transacao.findMany({
    where: { usuario_id: usuarioId },
    orderBy: { data_transacao: "desc" },
    take: 100,
    include: {
      categoria: { select: { nome: true } },
      conta: { select: { nome: true } },
      cartao: { select: { nome: true } },
    },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Transações</h1>
          <p className="text-sm text-slate-400">Histórico completo de entradas e despesas.</p>
        </div>
        <Link
          href="/transacoes/nova?tipo=DESPESA"
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nova</span>
        </Link>
      </div>

      {transacoes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/30 p-10 text-center">
          <p className="text-sm text-slate-400 mb-4">Nenhuma transação registrada ainda.</p>
          <Link
            href="/transacoes/nova?tipo=DESPESA"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400 hover:text-emerald-300"
          >
            <Plus className="h-4 w-4" />
            Registrar primeira transação
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl divide-y divide-white/5">
          {transacoes.map((t) => {
            const isReceita = t.tipo === "RECEITA";
            const valor = Number(t.valor);
            const origem = t.cartao ? `Cartão ${t.cartao.nome}` : t.conta?.nome ?? "—";

            return (
              <div key={t.id} className="flex items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      isReceita ? "bg-emerald-500/20" : "bg-slate-500/20"
                    }`}
                  >
                    {isReceita ? (
                      <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                    ) : t.cartao ? (
                      <CreditCard className="h-4 w-4 text-slate-400" />
                    ) : (
                      <Wallet className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {t.descricao}
                      {t.parcela_atual && t.total_parcelas
                        ? ` (${t.parcela_atual}/${t.total_parcelas})`
                        : ""}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {t.categoria.nome} • {origem} • {formatDataRelativa(t.data_transacao)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <p
                    className={`text-sm font-bold ${
                      isReceita ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {isReceita ? "+" : "-"} {formatBRL(valor)}
                  </p>
                  <ExcluirTransacaoBotao id={t.id} descricao={t.descricao} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {transacoes.length === 100 && (
        <p className="text-xs text-slate-500 text-center">
          Mostrando as 100 mais recentes.
        </p>
      )}
    </div>
  );
}
