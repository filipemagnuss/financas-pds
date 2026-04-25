"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import {
  FormShell,
  Field,
  TextInput,
  Select,
  FormError,
  PrimaryButton,
  SecondaryButton,
} from "@/app/components/form";

type Tipo = "RECEITA" | "DESPESA";
type Forma = "conta" | "cartao";

type Categoria = { id: string; nome: string; tipo: "RECEITA" | "DESPESA" | "TRANSFERENCIA" };
type Conta = { id: string; nome: string };
type Cartao = { id: string; nome: string };

export function TransacaoForm({
  tipoInicial,
  formaInicial,
  categorias,
  contas,
  cartoes,
  dataInicial,
}: {
  tipoInicial: Tipo;
  formaInicial: Forma;
  categorias: Categoria[];
  contas: Conta[];
  cartoes: Cartao[];
  dataInicial: string;
}) {
  const router = useRouter();
  const [tipo, setTipo] = useState<Tipo>(tipoInicial);
  const [forma, setForma] = useState<Forma>(formaInicial);
  const [recorrente, setRecorrente] = useState(false);
  const [erro, setErro] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  const categoriasFiltradas = useMemo(
    () => categorias.filter((c) => c.tipo === tipo),
    [categorias, tipo]
  );

  function onSubmit(formData: FormData) {
    setErro(undefined);
    formData.set("tipo", tipo);
    formData.set("forma", forma);
    if (tipo === "RECEITA" && recorrente) {
      formData.set("is_recorrente", "1");
    } else {
      formData.delete("is_recorrente");
      formData.delete("dia_recorrencia");
    }

    startTransition(async () => {
      const { criarTransacao } = await import("../actions");
      const r = await criarTransacao(formData);
      if (r?.erro) setErro(r.erro);
    });
  }

  const semCategoriasDoTipo = categoriasFiltradas.length === 0;
  const semContas = contas.length === 0;
  const semCartoes = cartoes.length === 0;

  return (
    <FormShell
      titulo="Nova transação"
      descricao="Registre uma entrada ou despesa."
      voltarHref="/dashboard"
    >
      <form action={onSubmit} className="space-y-5">
        <FormError erro={erro} />

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setTipo("DESPESA")}
            className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
              tipo === "DESPESA"
                ? "border-red-500/50 bg-red-500/15 text-red-300"
                : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
            }`}
          >
            <ArrowDownRight className="h-4 w-4" />
            Despesa
          </button>
          <button
            type="button"
            onClick={() => setTipo("RECEITA")}
            className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
              tipo === "RECEITA"
                ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300"
                : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
            }`}
          >
            <ArrowUpRight className="h-4 w-4" />
            Entrada
          </button>
        </div>

        <Field label="Descrição" htmlFor="descricao">
          <TextInput
            id="descricao"
            name="descricao"
            placeholder={tipo === "RECEITA" ? "Ex: Salário de abril" : "Ex: Mercado"}
            required
            maxLength={100}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Valor" htmlFor="valor">
            <TextInput
              id="valor"
              name="valor"
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              required
            />
          </Field>

          <Field label="Data" htmlFor="data_transacao">
            <TextInput
              id="data_transacao"
              name="data_transacao"
              type="date"
              defaultValue={dataInicial}
              required
            />
          </Field>
        </div>

        <Field label="Categoria" htmlFor="categoria_id">
          {semCategoriasDoTipo ? (
            <p className="text-sm text-amber-400">
              Você não tem categorias do tipo {tipo === "RECEITA" ? "entrada" : "despesa"}.
            </p>
          ) : (
            <Select id="categoria_id" name="categoria_id" required>
              <option value="">Selecione...</option>
              {categoriasFiltradas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </Select>
          )}
        </Field>

        {tipo === "DESPESA" && (
          <>
            <Field label="Forma de pagamento" htmlFor="forma">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForma("conta")}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                    forma === "conta"
                      ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                      : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
                  }`}
                >
                  Débito / Conta
                </button>
                <button
                  type="button"
                  onClick={() => setForma("cartao")}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                    forma === "cartao"
                      ? "border-purple-500/50 bg-purple-500/10 text-purple-300"
                      : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
                  }`}
                >
                  Cartão de crédito
                </button>
              </div>
            </Field>

            {forma === "conta" ? (
              <Field label="Conta" htmlFor="conta_id">
                {semContas ? (
                  <p className="text-sm text-amber-400">
                    Você não tem contas cadastradas.
                  </p>
                ) : (
                  <Select id="conta_id" name="conta_id" required>
                    <option value="">Selecione...</option>
                    {contas.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
            ) : (
              <>
                <Field label="Cartão" htmlFor="cartao_id">
                  {semCartoes ? (
                    <p className="text-sm text-amber-400">
                      Você não tem cartões cadastrados.
                    </p>
                  ) : (
                    <Select id="cartao_id" name="cartao_id" required>
                      <option value="">Selecione...</option>
                      {cartoes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nome}
                        </option>
                      ))}
                    </Select>
                  )}
                </Field>

                <Field
                  label="Parcelas"
                  htmlFor="total_parcelas"
                  hint="Em quantas vezes (1 = à vista)."
                >
                  <TextInput
                    id="total_parcelas"
                    name="total_parcelas"
                    type="number"
                    min={1}
                    max={60}
                    defaultValue={1}
                    required
                  />
                </Field>
              </>
            )}
          </>
        )}

        {tipo === "RECEITA" && (
          <>
            <Field label="Conta de destino" htmlFor="conta_id">
              {semContas ? (
                <p className="text-sm text-amber-400">
                  Cadastre uma conta antes de registrar entradas.
                </p>
              ) : (
                <Select id="conta_id" name="conta_id" required>
                  <option value="">Selecione...</option>
                  {contas.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </Select>
              )}
            </Field>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={recorrente}
                  onChange={(e) => setRecorrente(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-white/20 bg-slate-950 text-emerald-500 focus:ring-emerald-500/30"
                />
                <div>
                  <p className="text-sm font-medium text-white">Rendimento fixo</p>
                  <p className="text-xs text-slate-400">
                    Repete por 12 meses no dia escolhido. Após esse período, será necessário
                    cadastrar novamente.
                  </p>
                </div>
              </label>

              {recorrente && (
                <Field
                  label="Dia fixo do mês"
                  htmlFor="dia_recorrencia"
                  hint="Dia em que o rendimento entra. Em meses com menos dias, será ajustado para o último dia."
                >
                  <TextInput
                    id="dia_recorrencia"
                    name="dia_recorrencia"
                    type="number"
                    min={1}
                    max={31}
                    placeholder="5"
                    required={recorrente}
                  />
                </Field>
              )}
            </div>
          </>
        )}

        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
          <SecondaryButton type="button" onClick={() => router.back()} disabled={pending}>
            Cancelar
          </SecondaryButton>
          <PrimaryButton type="submit" disabled={pending}>
            {pending ? "Salvando..." : "Salvar transação"}
          </PrimaryButton>
        </div>
      </form>
    </FormShell>
  );
}
