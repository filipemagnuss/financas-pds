import { prisma } from "@/app/lib/prisma";
import { getUsuarioId } from "@/app/lib/auth";
import { TransacaoForm } from "./transacao-form";

export default async function NovaTransacaoPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; forma?: string }>;
}) {
  const sp = await searchParams;
  const usuarioId = await getUsuarioId();

  const [categorias, contas, cartoes] = await Promise.all([
    prisma.categoria.findMany({
      where: { usuario_id: usuarioId },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true, tipo: true },
    }),
    prisma.contaBancaria.findMany({
      where: { usuario_id: usuarioId },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true },
    }),
    prisma.cartaoCredito.findMany({
      where: { usuario_id: usuarioId },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true },
    }),
  ]);

  const tipoInicial = sp.tipo === "RECEITA" ? "RECEITA" : "DESPESA";
  const formaInicial = sp.forma === "cartao" ? "cartao" : "conta";
  const hoje = new Date();
  const dataInicial = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(hoje.getDate()).padStart(2, "0")}`;

  return (
    <TransacaoForm
      tipoInicial={tipoInicial}
      formaInicial={formaInicial}
      categorias={categorias}
      contas={contas}
      cartoes={cartoes}
      dataInicial={dataInicial}
    />
  );
}
