"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { getUsuarioId } from "@/app/lib/auth";
import { TipoTransacao } from "@/app/generated/prisma/enums";

function parseTipo(raw: FormDataEntryValue | null): TipoTransacao | null {
  if (raw === "RECEITA") return TipoTransacao.RECEITA;
  if (raw === "DESPESA") return TipoTransacao.DESPESA;
  return null;
}

export async function criarCategoria(formData: FormData): Promise<{ erro?: string }> {
  const usuarioId = await getUsuarioId();
  const nome = (formData.get("nome") ?? "").toString().trim();
  const tipo = parseTipo(formData.get("tipo"));

  if (!nome) return { erro: "Informe o nome da categoria." };
  if (!tipo) return { erro: "Selecione o tipo (Receita ou Despesa)." };
  if (nome.length > 50) return { erro: "Nome deve ter no máximo 50 caracteres." };

  const existente = await prisma.categoria.findFirst({
    where: { usuario_id: usuarioId, nome: { equals: nome, mode: "insensitive" }, tipo },
  });
  if (existente) return { erro: "Já existe uma categoria com esse nome e tipo." };

  await prisma.categoria.create({
    data: { usuario_id: usuarioId, nome, tipo },
  });

  revalidatePath("/categorias");
  revalidatePath("/transacoes/nova");
  redirect("/categorias");
}

export async function atualizarCategoria(
  id: string,
  formData: FormData
): Promise<{ erro?: string }> {
  const usuarioId = await getUsuarioId();
  const nome = (formData.get("nome") ?? "").toString().trim();
  const tipo = parseTipo(formData.get("tipo"));

  if (!nome) return { erro: "Informe o nome da categoria." };
  if (!tipo) return { erro: "Selecione o tipo." };
  if (nome.length > 50) return { erro: "Nome deve ter no máximo 50 caracteres." };

  const categoria = await prisma.categoria.findUnique({ where: { id } });
  if (!categoria || categoria.usuario_id !== usuarioId)
    return { erro: "Categoria não encontrada." };

  const duplicada = await prisma.categoria.findFirst({
    where: {
      usuario_id: usuarioId,
      nome: { equals: nome, mode: "insensitive" },
      tipo,
      NOT: { id },
    },
  });
  if (duplicada) return { erro: "Já existe uma categoria com esse nome e tipo." };

  await prisma.categoria.update({ where: { id }, data: { nome, tipo } });

  revalidatePath("/categorias");
  revalidatePath("/transacoes/nova");
  redirect("/categorias");
}

export async function excluirCategoria(id: string): Promise<{ erro?: string }> {
  const usuarioId = await getUsuarioId();

  const categoria = await prisma.categoria.findUnique({ where: { id } });
  if (!categoria || categoria.usuario_id !== usuarioId)
    return { erro: "Categoria não encontrada." };

  const emUso = await prisma.transacao.count({ where: { categoria_id: id } });
  if (emUso > 0)
    return {
      erro: `Esta categoria está vinculada a ${emUso} transação(ões) e não pode ser excluída.`,
    };

  await prisma.categoria.delete({ where: { id } });

  revalidatePath("/categorias");
  redirect("/categorias");
}
