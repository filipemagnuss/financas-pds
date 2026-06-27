import { prisma } from "./prisma";

function brl(v: number) {
  return `R$ ${v.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

export async function buildContextoFinanceiro(usuarioId: string): Promise<string> {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = agora.getMonth();

  const inicioMesAtual = new Date(ano, mes, 1);
  const fimMesAtual = new Date(ano, mes + 1, 1);
  const inicio3Meses = new Date(ano, mes - 3, 1);

  const [contas, cartoes, categorias, despesasMes, receitasMes, despesas3M, faturasPorCartao, ultimas] =
    await Promise.all([
      prisma.contaBancaria.findMany({
        where: { usuario_id: usuarioId },
        select: { nome: true, saldo_atual: true },
      }),
      prisma.cartaoCredito.findMany({
        where: { usuario_id: usuarioId },
        select: { id: true, nome: true, limite_total: true, dia_vencimento: true },
      }),
      prisma.categoria.findMany({
        where: { usuario_id: usuarioId },
        select: { id: true, nome: true },
      }),
      prisma.transacao.groupBy({
        by: ["categoria_id"],
        where: {
          usuario_id: usuarioId,
          tipo: "DESPESA",
          data_transacao: { gte: inicioMesAtual, lt: fimMesAtual },
        },
        _sum: { valor: true },
        orderBy: { _sum: { valor: "desc" } },
      }),
      prisma.transacao.aggregate({
        where: {
          usuario_id: usuarioId,
          tipo: "RECEITA",
          data_transacao: { gte: inicioMesAtual, lt: fimMesAtual },
        },
        _sum: { valor: true },
      }),
      prisma.transacao.groupBy({
        by: ["categoria_id"],
        where: {
          usuario_id: usuarioId,
          tipo: "DESPESA",
          data_transacao: { gte: inicio3Meses, lt: inicioMesAtual },
        },
        _sum: { valor: true },
      }),
      prisma.transacao.groupBy({
        by: ["cartao_id"],
        where: {
          usuario_id: usuarioId,
          tipo: "DESPESA",
          cartao_id: { not: null },
          data_transacao: { gte: inicioMesAtual, lt: fimMesAtual },
        },
        _sum: { valor: true },
      }),
      prisma.transacao.findMany({
        where: { usuario_id: usuarioId },
        orderBy: { data_transacao: "desc" },
        take: 5,
        select: {
          descricao: true,
          valor: true,
          tipo: true,
          data_transacao: true,
          categoria: { select: { nome: true } },
        },
      }),
    ]);

  const catMap = new Map(categorias.map((c) => [c.id, c.nome]));
  const mesNome = agora.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  const saldoTotal = contas.reduce((s, c) => s + Number(c.saldo_atual), 0);
  const contasStr = contas
    .map((c) => `  - ${c.nome}: ${brl(Number(c.saldo_atual))}`)
    .join("\n");

  const receitaMes = Number(receitasMes._sum.valor ?? 0);
  const despesaMes = despesasMes.reduce((s, d) => s + Number(d._sum.valor ?? 0), 0);

  const despesasMesStr = despesasMes
    .map((d) => {
      const nome = catMap.get(d.categoria_id ?? "") ?? "Sem categoria";
      return `  - ${nome}: ${brl(Number(d._sum.valor ?? 0))}`;
    })
    .join("\n");

  const media3mStr = (() => {
    if (despesas3M.length === 0) return "  (sem dados dos últimos 3 meses)";
    return despesas3M
      .map((d) => {
        const nome = catMap.get(d.categoria_id ?? "") ?? "Sem categoria";
        const media = Number(d._sum.valor ?? 0) / 3;
        const anual = media * 12;
        return `  - ${nome}: ${brl(media)}/mês → ${brl(anual)}/ano`;
      })
      .sort()
      .join("\n");
  })();

  const cartoesStr =
    cartoes.length === 0
      ? "  (nenhum cartão cadastrado)"
      : cartoes
          .map((c) => {
            const fatura = faturasPorCartao.find((f) => f.cartao_id === c.id);
            const faturaValor = Number(fatura?._sum?.valor ?? 0);
            const perc = Number(c.limite_total) > 0
              ? ((faturaValor / Number(c.limite_total)) * 100).toFixed(0)
              : "0";
            return `  - ${c.nome}: fatura ${brl(faturaValor)} / limite ${brl(Number(c.limite_total))} (${perc}%) - venc. dia ${c.dia_vencimento}`;
          })
          .join("\n");

  const ultimasStr = ultimas
    .map((t) => {
      const sinal = t.tipo === "RECEITA" ? "+" : "-";
      const d = t.data_transacao.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
      return `  ${d} ${t.descricao} ${sinal}${brl(Number(t.valor))} (${t.categoria?.nome ?? "—"})`;
    })
    .join("\n");

  return `=== DADOS FINANCEIROS (${agora.toLocaleDateString("pt-BR")}) ===

SALDOS EM CONTA:
${contasStr || "  (nenhuma conta)"}
Total: ${brl(saldoTotal)}

MÊS ATUAL (${mesNome}):
  Receitas: ${brl(receitaMes)}
  Despesas: ${brl(despesaMes)}
  Resultado: ${brl(receitaMes - despesaMes)}

GASTOS POR CATEGORIA - ${mesNome.toUpperCase()}:
${despesasMesStr || "  (sem despesas neste mês)"}

MÉDIA DOS ÚLTIMOS 3 MESES + PROJEÇÃO ANUAL:
${media3mStr}

CARTÕES DE CRÉDITO:
${cartoesStr}

ÚLTIMAS 5 TRANSAÇÕES:
${ultimasStr || "  (nenhuma transação)"}`;
}
