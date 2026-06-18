"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function gerarOpcoesMes() {
  const opcoes: { label: string; value: string }[] = [
    { label: "Todos os períodos", value: "" },
  ];
  const agora = new Date();
  for (let i = 0; i < 13; i++) {
    const d = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
    const mes = d.getMonth() + 1;
    const ano = d.getFullYear();
    opcoes.push({
      label: `${MESES[d.getMonth()]} ${ano}`,
      value: `${ano}-${String(mes).padStart(2, "0")}`,
    });
  }
  return opcoes;
}

const selectClass =
  "rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white focus:border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors";

export function FiltrosTransacoes({
  mesAtual,
}: {
  mesAtual: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function setParam(key: string, value: string) {
    const p = new URLSearchParams(params.toString());
    if (value) p.set(key, value);
    else p.delete(key);
    p.delete("pagina");
    router.push(`${pathname}?${p.toString()}`);
  }

  const tipo = params.get("tipo") ?? "";
  const mes = params.get("mes") ?? mesAtual;
  const opcoesMes = gerarOpcoesMes();

  return (
    <div className="flex flex-wrap gap-3">
      <select
        value={tipo}
        onChange={(e) => setParam("tipo", e.target.value)}
        className={selectClass}
      >
        <option value="">Todos os tipos</option>
        <option value="RECEITA">Entradas</option>
        <option value="DESPESA">Despesas</option>
        <option value="TRANSFERENCIA">Transferências</option>
      </select>

      <select
        value={mes}
        onChange={(e) => setParam("mes", e.target.value)}
        className={selectClass}
      >
        {opcoesMes.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
