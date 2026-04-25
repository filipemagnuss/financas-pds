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

export async function criarConta(formData: FormData): Promise<{ erro?: string }> {
  const usuarioId = await getUsuarioId();
  const nome = (formData.get("nome") ?? "").toString().trim();
  const saldo = parseValor(formData.get("saldo_atual"));

  if (!nome) return { erro: "Informe o nome da conta." };
  if (!Number.isFinite(saldo)) return { erro: "Saldo inválido." };

  await prisma.contaBancaria.create({
    data: { usuario_id: usuarioId, nome, saldo_atual: saldo },
  });

  revalidatePath("/dashboard");
  revalidatePath("/contas");
  redirect("/dashboard");
}

export async function atualizarConta(
  id: string,
  formData: FormData
): Promise<{ erro?: string }> {
  const usuarioId = await getUsuarioId();
  const nome = (formData.get("nome") ?? "").toString().trim();
  const saldo = parseValor(formData.get("saldo_atual"));

  if (!nome) return { erro: "Informe o nome da conta." };
  if (!Number.isFinite(saldo)) return { erro: "Saldo inválido." };

  const conta = await prisma.contaBancaria.findUnique({ where: { id } });
  if (!conta || conta.usuario_id !== usuarioId) return { erro: "Conta não encontrada." };

  await prisma.contaBancaria.update({
    where: { id },
    data: { nome, saldo_atual: saldo },
  });

  revalidatePath("/dashboard");
  revalidatePath("/contas");
  redirect("/contas");
}

export async function excluirConta(id: string) {
  const usuarioId = await getUsuarioId();
  const conta = await prisma.contaBancaria.findUnique({ where: { id } });
  if (!conta || conta.usuario_id !== usuarioId) return;

  await prisma.contaBancaria.delete({ where: { id } });

  revalidatePath("/dashboard");
  revalidatePath("/contas");
  redirect("/contas");
}
