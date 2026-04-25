import { prisma } from "@/app/lib/prisma";
import { TipoTransacao } from "@/app/generated/prisma/enums";

const CATEGORIAS_PADRAO: { nome: string; tipo: TipoTransacao }[] = [
  { nome: "Alimentação", tipo: TipoTransacao.DESPESA },
  { nome: "Transporte", tipo: TipoTransacao.DESPESA },
  { nome: "Moradia", tipo: TipoTransacao.DESPESA },
  { nome: "Saúde", tipo: TipoTransacao.DESPESA },
  { nome: "Lazer", tipo: TipoTransacao.DESPESA },
  { nome: "Educação", tipo: TipoTransacao.DESPESA },
  { nome: "Compras", tipo: TipoTransacao.DESPESA },
  { nome: "Outros", tipo: TipoTransacao.DESPESA },
  { nome: "Salário", tipo: TipoTransacao.RECEITA },
  { nome: "Freelance", tipo: TipoTransacao.RECEITA },
  { nome: "Investimentos", tipo: TipoTransacao.RECEITA },
  { nome: "Outras Receitas", tipo: TipoTransacao.RECEITA },
];

export async function criarCategoriasPadrao(usuarioId: string) {
  const existente = await prisma.categoria.count({ where: { usuario_id: usuarioId } });
  if (existente > 0) return;

  await prisma.categoria.createMany({
    data: CATEGORIAS_PADRAO.map((c) => ({
      usuario_id: usuarioId,
      nome: c.nome,
      tipo: c.tipo,
    })),
  });
}
