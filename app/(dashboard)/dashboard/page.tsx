import Link from "next/link";
import {
  Wallet,
  CreditCard,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
} from "lucide-react";
import { getUsuarioId } from "@/app/lib/auth";
import { formatBRL, formatBRLParts, formatDataRelativa } from "@/app/lib/format";
import { getResumoDashboard } from "./queries";
import { CarrosselScroll } from "./carrossel-scroll";

export default async function DashboardPage() {
  const usuarioId = await getUsuarioId();
  const dados = await getResumoDashboard(usuarioId);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-white">Visão Geral</h1>
        <p className="text-sm text-slate-400">Aqui está o resumo da sua saúde financeira.</p>
      </div>

      <VisaoGeral saldo={dados.saldoTotal} fatura={dados.faturasEmAberto} temCartoes={dados.temCartoes} />

      <CarrosselCartoes cartoes={dados.cartoes} />

      <CardResumoIA topCategorias={dados.topCategorias} totalDespesas={dados.totalDespesasMes} />

      <ResumoDespesas transacoes={dados.ultimasTransacoes} />
    </div>
  );
}

function VisaoGeral({
  saldo,
  fatura,
  temCartoes,
}: {
  saldo: number;
  fatura: number;
  temCartoes: boolean;
}) {
  const saldoPartes = formatBRLParts(saldo);
  const faturaPartes = formatBRLParts(fatura);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl transition-all hover:border-emerald-500/30">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-500/20 blur-2xl transition-all group-hover:bg-emerald-500/30" />
        <div className="relative">
          <div className="flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
              <Wallet className="h-6 w-6 text-emerald-400" />
            </div>
            <Link
              href="/contas"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition-all hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-400"
              title="Gerenciar contas"
            >
              <Plus className="h-4 w-4" />
            </Link>
          </div>
          <p className="mt-4 text-xs font-medium uppercase tracking-widest text-slate-400">
            Saldo Atual
          </p>
          <p className="mt-2 text-3xl font-bold text-white">
            {saldoPartes.inteiro},<span className="text-xl">{saldoPartes.centavos}</span>
          </p>
        </div>
      </div>

      <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl transition-all hover:border-sky-500/30">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-sky-500/20 blur-2xl transition-all group-hover:bg-sky-500/30" />
        <div className="relative">
          <div className="flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10">
              <CreditCard className="h-6 w-6 text-sky-400" />
            </div>
            <Link
              href="/cartoes"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition-all hover:border-sky-500/40 hover:bg-sky-500/10 hover:text-sky-400"
              title="Gerenciar cartões"
            >
              <Plus className="h-4 w-4" />
            </Link>
          </div>
          <p className="mt-4 text-xs font-medium uppercase tracking-widest text-slate-400">
            Fatura do Mês
          </p>
          {temCartoes ? (
            <p className="mt-2 text-3xl font-bold text-white">
              {faturaPartes.inteiro},<span className="text-xl">{faturaPartes.centavos}</span>
            </p>
          ) : (
            <Link
              href="/cartoes/novo"
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-sky-400 hover:text-sky-300"
            >
              <Plus className="h-4 w-4" />
              Cadastrar cartão
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function CarrosselCartoes({
  cartoes,
}: {
  cartoes: {
    id: string;
    nome: string;
    limiteTotal: number;
    faturaAtual: number;
    limiteDisponivel: number;
    percentualUso: number;
  }[];
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">Cartões de Crédito</h2>
        <Link
          href="/cartoes/novo"
          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition-all hover:border-sky-500/40 hover:bg-sky-500/10 hover:text-sky-400"
        >
          <Plus className="h-3.5 w-3.5" />
          Novo cartão
        </Link>
      </div>

      {cartoes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/30 p-8 text-center">
          <CreditCard className="h-8 w-8 text-slate-500 mx-auto mb-3" />
          <p className="text-sm text-slate-400 mb-4">Nenhum cartão cadastrado.</p>
          <Link
            href="/cartoes/novo"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-sky-400 hover:text-sky-300"
          >
            <Plus className="h-4 w-4" />
            Cadastrar primeiro cartão
          </Link>
        </div>
      ) : (
        <CarrosselScroll>
          {cartoes.map((c) => (
            <CardCartao key={c.id} cartao={c} />
          ))}
        </CarrosselScroll>
      )}
    </div>
  );
}

function CardCartao({
  cartao,
}: {
  cartao: {
    id: string;
    nome: string;
    limiteTotal: number;
    faturaAtual: number;
    limiteDisponivel: number;
    percentualUso: number;
  };
}) {
  const corBarra =
    cartao.percentualUso >= 80
      ? "from-red-500 to-red-400"
      : cartao.percentualUso >= 50
      ? "from-amber-500 to-amber-400"
      : "from-emerald-500 to-teal-500";

  return (
    <Link
      href={`/cartoes/${cartao.id}`}
      className="group relative w-[280px] sm:w-[320px] shrink-0 snap-start overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-purple-950/30 p-5 backdrop-blur-xl transition-all hover:border-purple-500/40"
    >
      <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl transition-all group-hover:bg-purple-500/20" />

      <div className="relative space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/15">
              <CreditCard className="h-4 w-4 text-purple-300" />
            </div>
            <span className="text-sm font-bold text-white truncate">{cartao.nome}</span>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-slate-400">Fatura atual</p>
          <p className="mt-1 text-2xl font-bold text-white">{formatBRL(cartao.faturaAtual)}</p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Limite disponível</span>
            <span className="font-medium text-slate-200">{formatBRL(cartao.limiteDisponivel)}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${corBarra} transition-all`}
              style={{ width: `${cartao.percentualUso}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{cartao.percentualUso.toFixed(0)}% usado</span>
            <span>de {formatBRL(cartao.limiteTotal)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function CardResumoIA({
  topCategorias,
  totalDespesas,
}: {
  topCategorias: { nome: string; total: number; percentual: number }[];
  totalDespesas: number;
}) {
  const mesAtual = new Date().toLocaleDateString("pt-BR", { month: "long" });

  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-slate-900/80 to-emerald-950/30 p-6 backdrop-blur-xl">
      <div className="absolute -left-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative space-y-5">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-white">Insights da IA</h2>
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-xs font-medium text-emerald-400">Análise Ativa</span>
          </div>
        </div>

        {topCategorias.length === 0 ? (
          <p className="text-sm text-slate-400">
            Cadastre suas primeiras despesas para receber análises personalizadas dos seus gastos.
          </p>
        ) : (
          <>
            <p className="text-sm text-slate-300 leading-relaxed">
              Suas maiores despesas em {mesAtual} foram em{" "}
              {topCategorias.map((c, i) => (
                <span key={c.nome}>
                  <strong className="text-white">{c.nome}</strong> ({formatBRL(c.total)})
                  {i < topCategorias.length - 1 && (i === topCategorias.length - 2 ? " e " : ", ")}
                </span>
              ))}
              .
            </p>

            <div className="space-y-3">
              {topCategorias.map((cat) => (
                <div key={cat.nome} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-200">{cat.nome}</span>
                    <span className="text-slate-400">
                      {formatBRL(cat.total)} · {cat.percentual.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all"
                      style={{ width: `${cat.percentual}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-4 text-sm">
              <span className="text-slate-400">Total de despesas no mês</span>
              <span className="font-bold text-white">{formatBRL(totalDespesas)}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ResumoDespesas({
  transacoes,
}: {
  transacoes: {
    id: string;
    descricao: string;
    valor: number;
    data: Date;
    tipo: "RECEITA" | "DESPESA" | "TRANSFERENCIA";
    categoria: string;
  }[];
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Despesas Recentes</h2>
        <div className="flex items-center gap-2">
          {transacoes.length > 0 && (
            <Link
              href="/transacoes"
              className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
            >
              Ver todas
            </Link>
          )}
          <Link
            href="/transacoes/nova?tipo=DESPESA"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition-all hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-400"
            title="Adicionar despesa"
          >
            <Plus className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {transacoes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-sm text-slate-400 mb-3">Nenhuma transação registrada ainda.</p>
          <Link
            href="/transacoes/nova?tipo=DESPESA"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400 hover:text-emerald-300"
          >
            <Plus className="h-4 w-4" />
            Registrar primeira despesa
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {transacoes.map((t) => {
            const isReceita = t.tipo === "RECEITA";
            const Icone = isReceita ? TrendingUp : CreditCard;
            return (
              <div
                key={t.id}
                className="group flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-4 transition-all hover:border-white/10 hover:bg-white/10"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                      isReceita ? "bg-emerald-500/20" : "bg-slate-500/20"
                    }`}
                  >
                    <Icone className={`h-5 w-5 ${isReceita ? "text-emerald-400" : "text-slate-400"}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-white text-sm sm:text-base truncate">
                      {t.descricao}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-400 truncate">
                      {t.categoria} • {formatDataRelativa(t.data)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <p
                    className={`text-sm sm:text-base font-bold ${
                      isReceita ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {isReceita ? "+" : "-"} {formatBRL(t.valor)}
                  </p>
                  <div
                    className={`hidden sm:flex h-8 w-8 items-center justify-center rounded-full ${
                      isReceita ? "bg-emerald-500/20" : "bg-red-500/20"
                    }`}
                  >
                    {isReceita ? (
                      <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-400" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
