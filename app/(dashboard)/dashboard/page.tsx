import { Wallet, Target, CreditCard, TrendingUp, Sparkles, AlertTriangle, ArrowUpRight, ArrowDownRight } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-white">Visão Geral</h1>
        <p className="text-sm text-slate-400">Aqui está o resumo da sua saúde financeira.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl transition-all hover:border-emerald-500/30">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-500/20 blur-2xl transition-all group-hover:bg-emerald-500/30" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
                <Wallet className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
            <p className="mt-4 text-xs font-medium uppercase tracking-widest text-slate-400">Saldo Atual</p>
            <p className="mt-2 text-3xl font-bold text-white">R$ 24.580,<span className="text-xl">42</span></p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl transition-all hover:border-amber-500/30">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-500/20 blur-2xl transition-all group-hover:bg-amber-500/30" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
                <Target className="h-6 w-6 text-amber-400" />
              </div>
              <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400">62% usado</span>
            </div>
            <p className="mt-4 text-xs font-medium uppercase tracking-widest text-slate-400">Orçamento Mensal</p>
            <p className="mt-2 text-3xl font-bold text-white">R$ 4.340,<span className="text-xl">00</span></p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl transition-all hover:border-sky-500/30 sm:col-span-2 lg:col-span-1">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-sky-500/20 blur-2xl transition-all group-hover:bg-sky-500/30" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10">
                <CreditCard className="h-6 w-6 text-sky-400" />
              </div>
            </div>
            <p className="mt-4 text-xs font-medium uppercase tracking-widest text-slate-400">Fatura do Cartão</p>
            <p className="mt-2 text-3xl font-bold text-white">R$ 3.245,<span className="text-xl">87</span></p>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-slate-900/80 to-emerald-950/30 p-6 backdrop-blur-xl">
        <div className="absolute -left-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
        
        <div className="relative flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold text-white">Insight da OpenAI</h2>
              <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-xs font-medium text-emerald-400 animate-pulse">Análise Ativa</span>
              </div>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              "Notei que os seus gastos com <strong>Alimentação (Ifood)</strong> aumentaram 30% em relação ao mês passado. Se mantiver este ritmo, irá ultrapassar o seu orçamento em 5 dias. Sugiro reduzir pedidos de delivery neste fim de semana para manter o seu saldo positivo."
            </p>
          </div>
          <div className="w-full md:w-auto bg-slate-950/50 rounded-xl p-4 border border-white/5">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-amber-400 h-8 w-8" />
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-widest">Risco Detectado</p>
                <p className="text-sm font-bold text-amber-400">Orçamento de Alimentação</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl">
        <h2 className="text-xl font-bold text-white mb-6">Transações Recentes</h2>
        <div className="space-y-3">
          <div className="group flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-4 transition-all hover:border-white/10 hover:bg-white/10">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-500/20">
                <CreditCard className="h-5 w-5 text-slate-400" />
              </div>
              <div>
                <p className="font-medium text-white text-sm sm:text-base">Supermercado Extra</p>
                <p className="text-xs sm:text-sm text-slate-400">Mercado • Hoje, 14:32</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-sm sm:text-base font-bold text-red-400">- R$ 347,89</p>
              <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20">
                <ArrowDownRight className="h-4 w-4 text-red-400" />
              </div>
            </div>
          </div>

          <div className="group flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-4 transition-all hover:border-white/10 hover:bg-white/10">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="font-medium text-white text-sm sm:text-base">Salário - Empresa XYZ</p>
                <p className="text-xs sm:text-sm text-slate-400">Renda • Ontem, 08:00</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-sm sm:text-base font-bold text-emerald-400">+ R$ 8.500,00</p>
              <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20">
                <ArrowUpRight className="h-4 w-4 text-emerald-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}