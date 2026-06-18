import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { getUsuarioId } from "@/app/lib/auth";
import { EditarTransacaoForm } from "./editar-form";

export default async function EditarTransacaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const usuarioId = await getUsuarioId();

  const [t, categorias] = await Promise.all([
    prisma.transacao.findUnique({ where: { id } }),
    prisma.categoria.findMany({
      where: { usuario_id: usuarioId },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true, tipo: true },
    }),
  ]);

  if (!t || t.usuario_id !== usuarioId) notFound();

  const categoriasFiltradas = categorias.filter((c) => c.tipo === t.tipo);

  const dataFormatada = t.data_transacao.toISOString().substring(0, 10);
  const valorFormatado = Number(t.valor).toFixed(2).replace(".", ",");

  return (
    <EditarTransacaoForm
      id={id}
      inicial={{
        descricao: t.descricao,
        valor: valorFormatado,
        data_transacao: dataFormatada,
        categoria_id: t.categoria_id,
        tipo: t.tipo,
        parcela_atual: t.parcela_atual,
        total_parcelas: t.total_parcelas,
        is_recorrente: t.is_recorrente,
      }}
      categorias={categoriasFiltradas}
    />
  );
}
