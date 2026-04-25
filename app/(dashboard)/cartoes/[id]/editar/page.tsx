import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { getUsuarioId } from "@/app/lib/auth";
import { CartaoForm } from "../../cartao-form";
import { atualizarCartao } from "../../actions";

export default async function EditarCartaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const usuarioId = await getUsuarioId();
  const cartao = await prisma.cartaoCredito.findUnique({ where: { id } });
  if (!cartao || cartao.usuario_id !== usuarioId) notFound();

  return (
    <CartaoForm
      titulo="Editar cartão"
      action={atualizarCartao.bind(null, id)}
      inicial={{
        nome: cartao.nome,
        limite_total: Number(cartao.limite_total),
        dia_fechamento: cartao.dia_fechamento,
        dia_vencimento: cartao.dia_vencimento,
      }}
    />
  );
}
