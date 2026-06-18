import Link from "next/link";
import { Suspense } from "react";
import {
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  Wallet,
  Pencil,
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { prisma } from "@/app/lib/prisma";
import { getUsuarioId } from "@/app/lib/auth";
import { formatBRL, formatDataRelativa } from "@/app/lib/format";
import { TipoTransacao } from "@/app/generated/prisma/enums";
import { ExcluirTransacaoBotao } from "./excluir-transacao";
import { FiltrosTransacoes } from "./filtros";

const ITEMS_POR_PAGINA = 20;

function buildUrl(
  base: string,
  tipo: string,
  mes: string,
  pagina: number
): string {
  const p = new URLSearchParams();
  if (tipo) p.set("tipo", tipo);
  if (mes) p.set("mes", mes);
  if (pagina > 1) p.set("pagina", String(pagina));
  const qs = p.toString();
  return qs ? `${base}?${qs}` : base;
}

export default async function TransacoesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const usuarioId = await getUsuarioId();

  const tipoParam = typeof sp.tipo === "string" ? sp.tipo : "";
  const mesParam = typeof sp.mes === "string" ? sp.mes : "";
  const pagina = Math.max(1, typeof sp.pagina === "string" ? Number(sp.pagina) : 1);

  const agora = new Date();
  const mesAtual = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}`;
  const mesFiltro = mesParam || mesAtual;

  const tipoFiltro =
    tipoParam === "RECEITA"
      ? TipoTransacao.RECEITA
      : tipoParam === "DESPESA"
      ? TipoTransacao.DESPESA
      : tipoParam === "TRANSFERENCIA"
      ? TipoTransacao.TRANSFERENCIA
      : undefined;

  let dataFiltro: { gte: Date; lt: Date } | undefined;
  if (mesFiltro) {
    const [ano, mes] = mesFiltro.split("-").map(Number);
    dataFiltro = {
      gte: new Date(ano, mes - 1, 1),
      lt: new Date(ano, mes, 1),
    };
  }

  const where = {
    usuario_id: usuarioId,
    ...(tipoFiltro ? { tipo: tipoFiltro } : {}),
    ...(dataFiltro ? { data_transacao: dataFiltro } : {}),
  };

  const [transacoes, total] = await Promise.all([
    prisma.transacao.findMany({
      where,
      orderBy: { data_transacao: "desc" },
      skip: (pagina - 1) * ITEMS_POR_PAGINA,
      take: ITEMS_POR_PAGINA,
      include: {
        categoria: { select: { nome: true } },
        conta: { select: { nome: true } },
        cartao: { select: { nome: true } },
      },
    }),
    prisma.transacao.count({ where }),
  ]);

  const totalPaginas = Math.max(1, Math.ceil(total / ITEMS_POR_PAGINA));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Transações</h1>
          <p className="text-sm text-slate-400">Histórico de entradas e despesas.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/transacoes/transferencia"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-medium text-slate-300 transition-all hover:bg-white/10 hover:text-white"
          >
            <ArrowLeftRight className="h-4 w-4" />
            <span className="hidden sm:inline">Transferir</span>
          </Link>
          <Link
            href="/transacoes/nova?tipo=DESPESA"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nova</span>
          </Link>
        </div>
      </div>

      <Suspense fallback={<div className="h-10 rounded-xl bg-white/5 animate-pulse w-72" />}>
        <FiltrosTransacoes mesAtual={mesAtual} />
      </Suspense>

      {transacoes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/30 p-10 text-center">
          <p className="text-sm text-slate-400 mb-4">Nenhuma transação neste período.</p>
          <Link
            href="/transacoes/nova?tipo=DESPESA"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400 hover:text-emerald-300"
          >
            <Plus className="h-4 w-4" />
            Registrar transação
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl divide-y divide-white/5">
          {transacoes.map((t) => {
            const isReceita = t.tipo === "RECEITA";
            const isTransferencia = t.tipo === "TRANSFERENCIA";
            const valor = Number(t.valor);
            const origem = t.cartao
              ? `Cartão ${t.cartao.nome}`
              : t.conta?.nome ?? "—";

            return (
              <div key={t.id} className="flex items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      isReceita
                        ? "bg-emerald-500/20"
                        : isTransferencia
                        ? "bg-blue-500/20"
                        : "bg-slate-500/20"
                    }`}
                  >
                    {isReceita ? (
                      <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                    ) : isTransferencia ? (
                      <ArrowLeftRight className="h-4 w-4 text-blue-400" />
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
                      {t.categoria.nome} • {origem} •{" "}
                      {formatDataRelativa(t.data_transacao)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <p
                    className={`text-sm font-bold ${
                      isReceita
                        ? "text-emerald-400"
                        : isTransferencia
                        ? "text-blue-400"
                        : "text-red-400"
                    }`}
                  >
                    {isReceita ? "+" : isTransferencia ? "" : "-"}{" "}
                    {formatBRL(valor)}
                  </p>
                  <Link
                    href={`/transacoes/${t.id}/editar`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 transition-all hover:bg-white/10 hover:text-white"
                    title="Editar"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Link>
                  <ExcluirTransacaoBotao id={t.id} descricao={t.descricao} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPaginas > 1 && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-slate-400">
            {total} resultado{total !== 1 ? "s" : ""} •{" "}
            Página {pagina} de {totalPaginas}
          </p>
          <div className="flex items-center gap-2">
            {pagina > 1 ? (
              <Link
                href={buildUrl("/transacoes", tipoParam, mesFiltro, pagina - 1)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition-all hover:bg-white/10 hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </Link>
            ) : (
              <div className="h-9 w-9 rounded-xl border border-white/5 bg-white/2 opacity-30" />
            )}
            {pagina < totalPaginas ? (
              <Link
                href={buildUrl("/transacoes", tipoParam, mesFiltro, pagina + 1)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition-all hover:bg-white/10 hover:text-white"
              >
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <div className="h-9 w-9 rounded-xl border border-white/5 bg-white/2 opacity-30" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
