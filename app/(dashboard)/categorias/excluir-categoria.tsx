"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { excluirCategoria } from "./actions";

export function ExcluirCategoriaBotao({ id, nome }: { id: string; nome: string }) {
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | undefined>();

  function onClick() {
    if (!confirm(`Excluir a categoria "${nome}"?`)) return;
    setErro(undefined);
    startTransition(async () => {
      const r = await excluirCategoria(id);
      if (r?.erro) setErro(r.erro);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        title="Excluir"
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 transition-all hover:bg-red-500/15 disabled:opacity-50"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
      {erro && <p className="text-xs text-red-400 max-w-[200px] text-right">{erro}</p>}
    </div>
  );
}
