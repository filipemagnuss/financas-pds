import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { getUsuarioId } from "@/app/lib/auth";
import { atualizarCategoria } from "../../actions";
import { CategoriaForm } from "../../categoria-form";

export default async function EditarCategoriaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const usuarioId = await getUsuarioId();

  const categoria = await prisma.categoria.findUnique({ where: { id } });
  if (!categoria || categoria.usuario_id !== usuarioId) notFound();

  const action = atualizarCategoria.bind(null, id);

  return (
    <CategoriaForm
      titulo="Editar categoria"
      action={action}
      inicial={{ nome: categoria.nome, tipo: categoria.tipo }}
      voltarHref="/categorias"
    />
  );
}
