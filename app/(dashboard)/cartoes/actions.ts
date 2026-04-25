"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { getUsuarioId } from "@/app/lib/auth";

function parseValor(raw: FormDataEntryValue | null): number {
  if (typeof raw !== "string") return NaN;
  const limpo = raw.replace(/\./g, "").replace(",", ".").trim();
  return Number(limpo);
}

function parseDia(raw: FormDataEntryValue | null): number {
  if (typeof raw !== "string") return NaN;
  return Number(raw);
}

export async function criarCartao(formData: FormData): Promise<{ erro?: string }> {
  const usuarioId = await getUsuarioId();

  const nome = (formData.get("nome") ?? "").toString().trim();
  const limiteTotal = parseValor(formData.get("limite_total"));
  const diaFechamento = parseDia(formData.get("dia_fechamento"));
  const diaVencimento = parseDia(formData.get("dia_vencimento"));

  if (!nome) return { erro: "Informe o nome do cartão." };
  if (!Number.isFinite(limiteTotal) || limiteTotal <= 0)
    return { erro: "Limite total inválido." };
  if (!Number.isInteger(diaFechamento) || diaFechamento < 1 || diaFechamento > 31)
    return { erro: "Dia de fechamento deve ser entre 1 e 31." };
  if (!Number.isInteger(diaVencimento) || diaVencimento < 1 || diaVencimento > 31)
    return { erro: "Dia de vencimento deve ser entre 1 e 31." };

  await prisma.cartaoCredito.create({
    data: {
      usuario_id: usuarioId,
      nome,
      limite_total: limiteTotal,
      dia_fechamento: diaFechamento,
      dia_vencimento: diaVencimento,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/cartoes");
  redirect("/dashboard");
}

export async function atualizarCartao(
  id: string,
  formData: FormData
): Promise<{ erro?: string }> {
  const usuarioId = await getUsuarioId();

  const nome = (formData.get("nome") ?? "").toString().trim();
  const limiteTotal = parseValor(formData.get("limite_total"));
  const diaFechamento = parseDia(formData.get("dia_fechamento"));
  const diaVencimento = parseDia(formData.get("dia_vencimento"));

  if (!nome) return { erro: "Informe o nome do cartão." };
  if (!Number.isFinite(limiteTotal) || limiteTotal <= 0)
    return { erro: "Limite total inválido." };
  if (!Number.isInteger(diaFechamento) || diaFechamento < 1 || diaFechamento > 31)
    return { erro: "Dia de fechamento deve ser entre 1 e 31." };
  if (!Number.isInteger(diaVencimento) || diaVencimento < 1 || diaVencimento > 31)
    return { erro: "Dia de vencimento deve ser entre 1 e 31." };

  const cartao = await prisma.cartaoCredito.findUnique({ where: { id } });
  if (!cartao || cartao.usuario_id !== usuarioId) {
    return { erro: "Cartão não encontrado." };
  }

  await prisma.cartaoCredito.update({
    where: { id },
    data: {
      nome,
      limite_total: limiteTotal,
      dia_fechamento: diaFechamento,
      dia_vencimento: diaVencimento,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/cartoes");
  revalidatePath(`/cartoes/${id}`);
  redirect(`/cartoes/${id}`);
}

export async function excluirCartao(id: string) {
  const usuarioId = await getUsuarioId();

  const cartao = await prisma.cartaoCredito.findUnique({ where: { id } });
  if (!cartao || cartao.usuario_id !== usuarioId) return;

  await prisma.cartaoCredito.delete({ where: { id } });

  revalidatePath("/dashboard");
  revalidatePath("/cartoes");
  redirect("/dashboard");
}
