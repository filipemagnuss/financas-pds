import { prisma } from "@/app/lib/prisma";
import { TipoTransacao } from "@/app/generated/prisma/enums";

export async function getResumoDashboard(usuarioId: string) {
  const agora = new Date();
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
  const fimMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 1);

  const [contas, cartoes, transacoesMes, ultimasTransacoes, totalTransacoes] = await Promise.all([
    prisma.contaBancaria.findMany({
      where: { usuario_id: usuarioId },
      select: { id: true, saldo_atual: true },
    }),
    prisma.cartaoCredito.findMany({
      where: { usuario_id: usuarioId },
      select: {
        id: true,
        nome: true,
        limite_total: true,
        dia_fechamento: true,
        dia_vencimento: true,
      },
      orderBy: { nome: "asc" },
    }),
    prisma.transacao.findMany({
      where: {
        usuario_id: usuarioId,
        data_transacao: { gte: inicioMes, lt: fimMes },
        tipo: TipoTransacao.DESPESA,
      },
      select: {
        valor: true,
        cartao_id: true,
        categoria: { select: { id: true, nome: true } },
      },
    }),
    prisma.transacao.findMany({
      where: { usuario_id: usuarioId },
      orderBy: { data_transacao: "desc" },
      take: 5,
      select: {
        id: true,
        descricao: true,
        valor: true,
        data_transacao: true,
        tipo: true,
        categoria: { select: { nome: true } },
      },
    }),
    prisma.transacao.count({ where: { usuario_id: usuarioId } }),
  ]);

  const saldoTotal = contas.reduce((acc, c) => acc + Number(c.saldo_atual), 0);

  const usoPorCartao = new Map<string, number>();
  for (const t of transacoesMes) {
    if (t.cartao_id) {
      usoPorCartao.set(t.cartao_id, (usoPorCartao.get(t.cartao_id) ?? 0) + Number(t.valor));
    }
  }

  const cartoesComUso = cartoes.map((c) => {
    const usado = usoPorCartao.get(c.id) ?? 0;
    const total = Number(c.limite_total);
    return {
      id: c.id,
      nome: c.nome,
      limiteTotal: total,
      faturaAtual: usado,
      limiteDisponivel: Math.max(total - usado, 0),
      percentualUso: total > 0 ? Math.min((usado / total) * 100, 100) : 0,
      diaFechamento: c.dia_fechamento,
      diaVencimento: c.dia_vencimento,
    };
  });

  const faturasEmAberto = cartoesComUso.reduce((acc, c) => acc + c.faturaAtual, 0);

  const totalDespesasMes = transacoesMes.reduce((acc, t) => acc + Number(t.valor), 0);
  const porCategoria = new Map<string, { nome: string; total: number }>();
  for (const t of transacoesMes) {
    const atual = porCategoria.get(t.categoria.id) ?? { nome: t.categoria.nome, total: 0 };
    atual.total += Number(t.valor);
    porCategoria.set(t.categoria.id, atual);
  }
  const topCategorias = Array.from(porCategoria.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 3)
    .map((c) => ({
      nome: c.nome,
      total: c.total,
      percentual: totalDespesasMes > 0 ? (c.total / totalDespesasMes) * 100 : 0,
    }));

  return {
    saldoTotal,
    faturasEmAberto,
    temContas: contas.length > 0,
    temCartoes: cartoes.length > 0,
    temTransacoes: totalTransacoes > 0,
    cartoes: cartoesComUso,
    topCategorias,
    totalDespesasMes,
    ultimasTransacoes: ultimasTransacoes.map((t) => ({
      id: t.id,
      descricao: t.descricao,
      valor: Number(t.valor),
      data: t.data_transacao,
      tipo: t.tipo,
      categoria: t.categoria.nome,
    })),
  };
}
