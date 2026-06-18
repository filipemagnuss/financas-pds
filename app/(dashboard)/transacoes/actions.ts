"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { getUsuarioId } from "@/app/lib/auth";
import { TipoTransacao } from "@/app/generated/prisma/enums";

function parseValor(raw: FormDataEntryValue | null): number {
  if (typeof raw !== "string") return NaN;
  const limpo = raw.replace(/\./g, "").replace(",", ".").trim();
  return Number(limpo);
}

function parseInteiro(raw: FormDataEntryValue | null): number {
  if (typeof raw !== "string" || raw.trim() === "") return NaN;
  return Number(raw);
}

function addMeses(data: Date, meses: number): Date {
  const d = new Date(data);
  d.setMonth(d.getMonth() + meses);
  return d;
}

function parseTipo(raw: FormDataEntryValue | null): TipoTransacao | null {
  if (raw === "RECEITA") return TipoTransacao.RECEITA;
  if (raw === "DESPESA") return TipoTransacao.DESPESA;
  if (raw === "TRANSFERENCIA") return TipoTransacao.TRANSFERENCIA;
  return null;
}

export async function criarTransacao(formData: FormData): Promise<{ erro?: string }> {
  const usuarioId = await getUsuarioId();

  const tipo = parseTipo(formData.get("tipo"));
  const descricao = (formData.get("descricao") ?? "").toString().trim();
  const valor = parseValor(formData.get("valor"));
  const dataStr = (formData.get("data_transacao") ?? "").toString();
  const categoriaId = (formData.get("categoria_id") ?? "").toString();
  const formaPagamento = (formData.get("forma") ?? "").toString();
  const contaId = (formData.get("conta_id") ?? "").toString() || null;
  const cartaoId = (formData.get("cartao_id") ?? "").toString() || null;
  const totalParcelasRaw = formData.get("total_parcelas");
  const totalParcelas = totalParcelasRaw ? parseInteiro(totalParcelasRaw) : 1;
  const isRecorrente = formData.get("is_recorrente") === "1";
  const diaRecorrencia = isRecorrente ? parseInteiro(formData.get("dia_recorrencia")) : null;

  if (!tipo) return { erro: "Tipo de transação inválido." };
  if (!descricao) return { erro: "Informe a descrição." };
  if (!Number.isFinite(valor) || valor <= 0) return { erro: "Valor inválido." };
  if (!dataStr) return { erro: "Informe a data." };
  if (!categoriaId) return { erro: "Selecione uma categoria." };
  if (formaPagamento === "cartao" && !cartaoId) return { erro: "Selecione um cartão." };
  if (formaPagamento === "conta" && !contaId) return { erro: "Selecione uma conta." };
  if (!Number.isInteger(totalParcelas) || totalParcelas < 1 || totalParcelas > 60)
    return { erro: "Número de parcelas inválido." };
  if (isRecorrente) {
    if (!Number.isInteger(diaRecorrencia) || diaRecorrencia! < 1 || diaRecorrencia! > 31)
      return { erro: "Dia de recorrência deve ser entre 1 e 31." };
  }

  const categoria = await prisma.categoria.findUnique({ where: { id: categoriaId } });
  if (!categoria || categoria.usuario_id !== usuarioId)
    return { erro: "Categoria inválida." };

  if (cartaoId) {
    const cartao = await prisma.cartaoCredito.findUnique({ where: { id: cartaoId } });
    if (!cartao || cartao.usuario_id !== usuarioId) return { erro: "Cartão inválido." };
  }

  if (contaId) {
    const conta = await prisma.contaBancaria.findUnique({ where: { id: contaId } });
    if (!conta || conta.usuario_id !== usuarioId) return { erro: "Conta inválida." };
  }

  const dataBase = new Date(dataStr + "T12:00:00");
  const valorPorParcela = totalParcelas > 1 ? Number((valor / totalParcelas).toFixed(2)) : valor;

  if (isRecorrente && diaRecorrencia) {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = hoje.getMonth();
    await prisma.transacao.createMany({
      data: Array.from({ length: 12 }).map((_, i) => {
        const dataMes = new Date(ano, mes + i, 1, 12, 0, 0);
        const ultimoDia = new Date(dataMes.getFullYear(), dataMes.getMonth() + 1, 0).getDate();
        const dia = Math.min(diaRecorrencia, ultimoDia);
        return {
          usuario_id: usuarioId,
          conta_id: contaId,
          cartao_id: cartaoId,
          categoria_id: categoriaId,
          descricao,
          valor,
          data_transacao: new Date(dataMes.getFullYear(), dataMes.getMonth(), dia, 12, 0, 0),
          tipo,
          is_recorrente: true,
          dia_recorrencia: diaRecorrencia,
        };
      }),
    });
  } else if (totalParcelas === 1) {
    await prisma.$transaction(async (tx) => {
      await tx.transacao.create({
        data: {
          usuario_id: usuarioId,
          conta_id: contaId,
          cartao_id: cartaoId,
          categoria_id: categoriaId,
          descricao,
          valor,
          data_transacao: dataBase,
          tipo,
        },
      });

      if (contaId && tipo !== TipoTransacao.TRANSFERENCIA) {
        const delta = tipo === TipoTransacao.RECEITA ? valor : -valor;
        await tx.contaBancaria.update({
          where: { id: contaId },
          data: { saldo_atual: { increment: delta } },
        });
      }
    });
  } else {
    await prisma.transacao.createMany({
      data: Array.from({ length: totalParcelas }).map((_, i) => ({
        usuario_id: usuarioId,
        conta_id: contaId,
        cartao_id: cartaoId,
        categoria_id: categoriaId,
        descricao,
        valor: valorPorParcela,
        data_transacao: addMeses(dataBase, i),
        tipo,
        parcela_atual: i + 1,
        total_parcelas: totalParcelas,
      })),
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/transacoes");
  if (cartaoId) revalidatePath(`/cartoes/${cartaoId}`);
  redirect("/dashboard");
}

export async function atualizarTransacao(
  id: string,
  formData: FormData
): Promise<{ erro?: string }> {
  const usuarioId = await getUsuarioId();

  const t = await prisma.transacao.findUnique({ where: { id } });
  if (!t || t.usuario_id !== usuarioId) return { erro: "Transação não encontrada." };

  const descricao = (formData.get("descricao") ?? "").toString().trim();
  const valor = parseValor(formData.get("valor"));
  const dataStr = (formData.get("data_transacao") ?? "").toString();
  const categoriaId = (formData.get("categoria_id") ?? "").toString();

  if (!descricao) return { erro: "Informe a descrição." };
  if (!Number.isFinite(valor) || valor <= 0) return { erro: "Valor inválido." };
  if (!dataStr) return { erro: "Informe a data." };
  if (!categoriaId) return { erro: "Selecione uma categoria." };

  const categoria = await prisma.categoria.findUnique({ where: { id: categoriaId } });
  if (!categoria || categoria.usuario_id !== usuarioId) return { erro: "Categoria inválida." };

  await prisma.$transaction(async (tx) => {
    const simples =
      !t.parcela_atual &&
      !t.is_recorrente &&
      t.conta_id &&
      t.tipo !== TipoTransacao.TRANSFERENCIA;

    if (simples) {
      const valorAntigo = Number(t.valor);
      const delta =
        t.tipo === TipoTransacao.RECEITA ? valor - valorAntigo : valorAntigo - valor;
      if (delta !== 0) {
        await tx.contaBancaria.update({
          where: { id: t.conta_id! },
          data: { saldo_atual: { increment: delta } },
        });
      }
    }

    await tx.transacao.update({
      where: { id },
      data: {
        descricao,
        valor,
        data_transacao: new Date(dataStr + "T12:00:00"),
        categoria_id: categoriaId,
      },
    });
  });

  revalidatePath("/dashboard");
  revalidatePath("/transacoes");
  if (t.cartao_id) revalidatePath(`/cartoes/${t.cartao_id}`);
  redirect("/transacoes");
}

export async function excluirTransacao(id: string) {
  const usuarioId = await getUsuarioId();
  const t = await prisma.transacao.findUnique({ where: { id } });
  if (!t || t.usuario_id !== usuarioId) return;

  await prisma.$transaction(async (tx) => {
    if (t.tipo === TipoTransacao.TRANSFERENCIA) {
      if (t.conta_id) {
        await tx.contaBancaria.update({
          where: { id: t.conta_id },
          data: { saldo_atual: { increment: Number(t.valor) } },
        });
      }
      if (t.conta_destino_id) {
        await tx.contaBancaria.update({
          where: { id: t.conta_destino_id },
          data: { saldo_atual: { decrement: Number(t.valor) } },
        });
      }
    } else if (t.conta_id) {
      const delta =
        t.tipo === TipoTransacao.RECEITA ? -Number(t.valor) : Number(t.valor);
      await tx.contaBancaria.update({
        where: { id: t.conta_id },
        data: { saldo_atual: { increment: delta } },
      });
    }
    await tx.transacao.delete({ where: { id } });
  });

  revalidatePath("/dashboard");
  revalidatePath("/transacoes");
  if (t.cartao_id) revalidatePath(`/cartoes/${t.cartao_id}`);
  redirect("/transacoes");
}

export async function criarTransferencia(formData: FormData): Promise<{ erro?: string }> {
  const usuarioId = await getUsuarioId();

  const contaOrigemId = (formData.get("conta_origem_id") ?? "").toString();
  const contaDestinoId = (formData.get("conta_destino_id") ?? "").toString();
  const valor = parseValor(formData.get("valor"));
  const descricao = (formData.get("descricao") ?? "").toString().trim();
  const dataStr = (formData.get("data_transacao") ?? "").toString();

  if (!contaOrigemId || !contaDestinoId)
    return { erro: "Selecione as contas de origem e destino." };
  if (contaOrigemId === contaDestinoId)
    return { erro: "Origem e destino não podem ser iguais." };
  if (!Number.isFinite(valor) || valor <= 0) return { erro: "Valor inválido." };
  if (!dataStr) return { erro: "Informe a data." };

  const [contaOrigem, contaDestino] = await Promise.all([
    prisma.contaBancaria.findUnique({ where: { id: contaOrigemId } }),
    prisma.contaBancaria.findUnique({ where: { id: contaDestinoId } }),
  ]);

  if (!contaOrigem || contaOrigem.usuario_id !== usuarioId)
    return { erro: "Conta de origem inválida." };
  if (!contaDestino || contaDestino.usuario_id !== usuarioId)
    return { erro: "Conta de destino inválida." };

  let categoria = await prisma.categoria.findFirst({
    where: { usuario_id: usuarioId, tipo: TipoTransacao.TRANSFERENCIA },
  });
  if (!categoria) {
    categoria = await prisma.categoria.create({
      data: { usuario_id: usuarioId, nome: "Transferência", tipo: TipoTransacao.TRANSFERENCIA },
    });
  }

  const dataBase = new Date(dataStr + "T12:00:00");

  await prisma.$transaction(async (tx) => {
    await tx.transacao.create({
      data: {
        usuario_id: usuarioId,
        conta_id: contaOrigemId,
        conta_destino_id: contaDestinoId,
        categoria_id: categoria.id,
        descricao: descricao || `Transferência para ${contaDestino.nome}`,
        valor,
        data_transacao: dataBase,
        tipo: TipoTransacao.TRANSFERENCIA,
      },
    });

    await tx.contaBancaria.update({
      where: { id: contaOrigemId },
      data: { saldo_atual: { decrement: valor } },
    });

    await tx.contaBancaria.update({
      where: { id: contaDestinoId },
      data: { saldo_atual: { increment: valor } },
    });
  });

  revalidatePath("/dashboard");
  revalidatePath("/contas");
  revalidatePath("/transacoes");
  redirect("/transacoes");
}
