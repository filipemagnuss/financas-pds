"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { excluirConta } from "./actions";

export function ExcluirContaBotao({ id, nome }: { id: string; nome: string }) {
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (!confirm(`Excluir a conta "${nome}"?`)) return;
    startTransition(() => {
      excluirConta(id);
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      title="Excluir"
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 transition-all hover:bg-red-500/20 hover:text-red-200 disabled:opacity-50"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
