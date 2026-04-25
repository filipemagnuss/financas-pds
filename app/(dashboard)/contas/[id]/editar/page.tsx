import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { getUsuarioId } from "@/app/lib/auth";
import { ContaForm } from "../../conta-form";
import { atualizarConta } from "../../actions";

export default async function EditarContaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const usuarioId = await getUsuarioId();
  const conta = await prisma.contaBancaria.findUnique({ where: { id } });
  if (!conta || conta.usuario_id !== usuarioId) notFound();

  return (
    <ContaForm
      titulo="Editar conta"
      action={atualizarConta.bind(null, id)}
      voltarHref="/contas"
      inicial={{ nome: conta.nome, saldo_atual: Number(conta.saldo_atual) }}
    />
  );
}
