import Link from "next/link";
import { Plus, Tag, Pencil } from "lucide-react";
import { prisma } from "@/app/lib/prisma";
import { getUsuarioId } from "@/app/lib/auth";
import { ExcluirCategoriaBotao } from "./excluir-categoria";

const LABEL_TIPO: Record<string, { label: string; cor: string }> = {
  DESPESA: { label: "Despesa", cor: "bg-red-500/15 text-red-300" },
  RECEITA: { label: "Receita", cor: "bg-emerald-500/15 text-emerald-300" },
  TRANSFERENCIA: { label: "Transferência", cor: "bg-blue-500/15 text-blue-300" },
};

export default async function CategoriasPage() {
  const usuarioId = await getUsuarioId();

  const categorias = await prisma.categoria.findMany({
    where: { usuario_id: usuarioId },
    orderBy: [{ tipo: "asc" }, { nome: "asc" }],
    include: { _count: { select: { transacoes: true } } },
  });

  const despesas = categorias.filter((c) => c.tipo === "DESPESA");
  const receitas = categorias.filter((c) => c.tipo === "RECEITA");
  const transferencias = categorias.filter((c) => c.tipo === "TRANSFERENCIA");

  function GrupoCategoria({
    titulo,
    lista,
  }: {
    titulo: string;
    lista: typeof categorias;
  }) {
    if (lista.length === 0) return null;
    return (
      <div className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 px-1">
          {titulo}
        </h2>
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl divide-y divide-white/5">
          {lista.map((c) => {
            const info = LABEL_TIPO[c.tipo];
            return (
              <div key={c.id} className="flex items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5">
                    <Tag className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{c.nome}</p>
                    <p className="text-xs text-slate-500">
                      {c._count.transacoes} transação(ões)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${info.cor}`}>
                    {info.label}
                  </span>
                  <Link
                    href={`/categorias/${c.id}/editar`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 transition-all hover:bg-white/10 hover:text-white"
                    title="Editar"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Link>
                  <ExcluirCategoriaBotao id={c.id} nome={c.nome} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Categorias</h1>
          <p className="text-sm text-slate-400">Organize suas transações por categoria.</p>
        </div>
        <Link
          href="/categorias/nova"
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nova categoria</span>
        </Link>
      </div>

      {categorias.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/30 p-10 text-center">
          <Tag className="h-10 w-10 text-slate-500 mx-auto mb-3" />
          <p className="text-sm text-slate-400 mb-4">Nenhuma categoria cadastrada.</p>
          <Link
            href="/categorias/nova"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400 hover:text-emerald-300"
          >
            <Plus className="h-4 w-4" />
            Criar primeira categoria
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <GrupoCategoria titulo="Despesas" lista={despesas} />
          <GrupoCategoria titulo="Receitas" lista={receitas} />
          <GrupoCategoria titulo="Transferências" lista={transferencias} />
        </div>
      )}
    </div>
  );
}
