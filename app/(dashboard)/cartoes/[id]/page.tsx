import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CreditCard, Pencil } from "lucide-react";
import { prisma } from "@/app/lib/prisma";
import { getUsuarioId } from "@/app/lib/auth";
import { TipoTransacao } from "@/app/generated/prisma/enums";
import { formatBRL, formatDataRelativa } from "@/app/lib/format";
import { ExcluirCartaoBotao } from "./excluir-cartao";

export default async function CartaoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const usuarioId = await getUsuarioId();

  const cartao = await prisma.cartaoCredito.findUnique({ where: { id } });
  if (!cartao || cartao.usuario_id !== usuarioId) notFound();

  const agora = new Date();
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
  const fimMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 1);

  const transacoes = await prisma.transacao.findMany({
    where: {
      cartao_id: id,
      data_transacao: { gte: inicioMes, lt: fimMes },
      tipo: TipoTransacao.DESPESA,
    },
    orderBy: { data_transacao: "desc" },
    include: { categoria: { select: { nome: true } } },
  });

  const fatura = transacoes.reduce((acc, t) => acc + Number(t.valor), 0);
  const limiteTotal = Number(cartao.limite_total);
  const limiteDisponivel = Math.max(limiteTotal - fatura, 0);
  const percentualUso = limiteTotal > 0 ? Math.min((fatura / limiteTotal) * 100, 100) : 0;

  const corBarra =
    percentualUso >= 80
      ? "from-red-500 to-red-400"
      : percentualUso >= 50
      ? "from-amber-500 to-amber-400"
      : "from-emerald-500 to-teal-500";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>

      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-purple-950/30 p-6 backdrop-blur-xl">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-purple-500/15 blur-3xl" />

        <div className="relative space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/15">
                <CreditCard className="h-6 w-6 text-purple-300" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{cartao.nome}</h1>
                <p className="text-xs text-slate-400">
                  Fechamento dia {cartao.dia_fechamento} · Vencimento dia {cartao.dia_vencimento}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/cartoes/${id}/editar`}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition-all hover:bg-white/10 hover:text-white"
                title="Editar"
              >
                <Pencil className="h-4 w-4" />
              </Link>
              <ExcluirCartaoBotao id={id} nome={cartao.nome} />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-slate-400">
                Fatura atual
              </p>
              <p className="mt-1 text-2xl font-bold text-white">{formatBRL(fatura)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-slate-400">
                Limite disponível
              </p>
              <p className="mt-1 text-2xl font-bold text-emerald-400">
                {formatBRL(limiteDisponivel)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-slate-400">
                Limite total
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-300">{formatBRL(limiteTotal)}</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="h-2 overflow-hidden rounded-full bg-white/5">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${corBarra} transition-all`}
                style={{ width: `${percentualUso}%` }}
              />
            </div>
            <p className="text-xs text-slate-500">{percentualUso.toFixed(0)}% do limite usado</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl">
        <h2 className="mb-4 text-lg font-bold text-white">Compras deste mês</h2>

        {transacoes.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">
            Nenhuma compra registrada neste cartão no mês atual.
          </p>
        ) : (
          <div className="space-y-2">
            {transacoes.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {t.descricao}
                    {t.parcela_atual && t.total_parcelas
                      ? ` (${t.parcela_atual}/${t.total_parcelas})`
                      : ""}
                  </p>
                  <p className="text-xs text-slate-400">
                    {t.categoria.nome} • {formatDataRelativa(t.data_transacao)}
                  </p>
                </div>
                <p className="text-sm font-bold text-red-400 shrink-0">
                  - {formatBRL(Number(t.valor))}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
