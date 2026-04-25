import Link from "next/link";
import { Plus, CreditCard } from "lucide-react";
import { prisma } from "@/app/lib/prisma";
import { getUsuarioId } from "@/app/lib/auth";
import { TipoTransacao } from "@/app/generated/prisma/enums";
import { formatBRL } from "@/app/lib/format";

export default async function CartoesPage() {
  const usuarioId = await getUsuarioId();

  const cartoes = await prisma.cartaoCredito.findMany({
    where: { usuario_id: usuarioId },
    orderBy: { nome: "asc" },
  });

  const agora = new Date();
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
  const fimMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 1);

  const usoPorCartao = cartoes.length
    ? await prisma.transacao.groupBy({
        by: ["cartao_id"],
        where: {
          usuario_id: usuarioId,
          cartao_id: { in: cartoes.map((c) => c.id) },
          tipo: TipoTransacao.DESPESA,
          data_transacao: { gte: inicioMes, lt: fimMes },
        },
        _sum: { valor: true },
      })
    : [];

  const mapaUso = new Map<string, number>();
  for (const u of usoPorCartao) {
    if (u.cartao_id) mapaUso.set(u.cartao_id, Number(u._sum.valor ?? 0));
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Cartões de Crédito</h1>
          <p className="text-sm text-slate-400">Gerencie seus cartões e faturas.</p>
        </div>
        <Link
          href="/cartoes/novo"
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Novo cartão</span>
        </Link>
      </div>

      {cartoes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/30 p-10 text-center">
          <CreditCard className="h-10 w-10 text-slate-500 mx-auto mb-3" />
          <p className="text-sm text-slate-400 mb-4">Nenhum cartão cadastrado.</p>
          <Link
            href="/cartoes/novo"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400 hover:text-emerald-300"
          >
            <Plus className="h-4 w-4" />
            Cadastrar primeiro cartão
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {cartoes.map((c) => {
            const fatura = mapaUso.get(c.id) ?? 0;
            const total = Number(c.limite_total);
            const disponivel = Math.max(total - fatura, 0);
            const pct = total > 0 ? Math.min((fatura / total) * 100, 100) : 0;
            const corBarra =
              pct >= 80
                ? "from-red-500 to-red-400"
                : pct >= 50
                ? "from-amber-500 to-amber-400"
                : "from-emerald-500 to-teal-500";

            return (
              <Link
                key={c.id}
                href={`/cartoes/${c.id}`}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-purple-950/30 p-5 backdrop-blur-xl transition-all hover:border-purple-500/40"
              >
                <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl transition-all group-hover:bg-purple-500/20" />

                <div className="relative space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/15">
                      <CreditCard className="h-4 w-4 text-purple-300" />
                    </div>
                    <span className="text-sm font-bold text-white truncate">{c.nome}</span>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-widest text-slate-400">
                      Fatura atual
                    </p>
                    <p className="mt-1 text-2xl font-bold text-white">{formatBRL(fatura)}</p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Limite disponível</span>
                      <span className="font-medium text-slate-200">{formatBRL(disponivel)}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${corBarra} transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{pct.toFixed(0)}% usado</span>
                      <span>de {formatBRL(total)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
