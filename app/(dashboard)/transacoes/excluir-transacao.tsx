"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { excluirTransacao } from "./actions";

export function ExcluirTransacaoBotao({ id, descricao }: { id: string; descricao: string }) {
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (!confirm(`Excluir a transação "${descricao}"?`)) return;
    startTransition(() => {
      excluirTransacao(id);
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      title="Excluir"
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 transition-all hover:bg-red-500/15 disabled:opacity-50"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}
