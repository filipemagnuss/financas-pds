import { prisma } from "@/app/lib/prisma";
import { getUsuarioId } from "@/app/lib/auth";
import { TransferenciaForm } from "./transferencia-form";

export default async function TransferenciaPage() {
  const usuarioId = await getUsuarioId();

  const contas = await prisma.contaBancaria.findMany({
    where: { usuario_id: usuarioId },
    orderBy: { nome: "asc" },
    select: { id: true, nome: true, saldo_atual: true },
  });

  const hoje = new Date();
  const dataInicial = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;

  return (
    <TransferenciaForm
      contas={contas.map((c) => ({ ...c, saldo_atual: Number(c.saldo_atual) }))}
      dataInicial={dataInicial}
    />
  );
}
