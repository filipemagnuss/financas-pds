"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  FormShell,
  Field,
  TextInput,
  Select,
  FormError,
  PrimaryButton,
  SecondaryButton,
} from "@/app/components/form";
import { atualizarTransacao } from "../../actions";

type Categoria = { id: string; nome: string };

export function EditarTransacaoForm({
  id,
  inicial,
  categorias,
}: {
  id: string;
  inicial: {
    descricao: string;
    valor: string;
    data_transacao: string;
    categoria_id: string;
    tipo: string;
    parcela_atual: number | null;
    total_parcelas: number | null;
    is_recorrente: boolean;
  };
  categorias: Categoria[];
}) {
  const router = useRouter();
  const [erro, setErro] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setErro(undefined);
    startTransition(async () => {
      const r = await atualizarTransacao(id, formData);
      if (r?.erro) setErro(r.erro);
    });
  }

  const isParcela = !!inicial.parcela_atual;
  const isRecorrente = inicial.is_recorrente;

  return (
    <FormShell
      titulo="Editar transação"
      descricao="Altere os dados da transação."
      voltarHref="/transacoes"
    >
      <form action={onSubmit} className="space-y-5">
        <FormError erro={erro} />

        {(isParcela || isRecorrente) && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
            {isParcela
              ? `Parcela ${inicial.parcela_atual}/${inicial.total_parcelas} — apenas esta parcela será alterada.`
              : "Transação recorrente — apenas este lançamento será alterado."}
          </div>
        )}

        <Field label="Descrição" htmlFor="descricao">
          <TextInput
            id="descricao"
            name="descricao"
            defaultValue={inicial.descricao}
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
              defaultValue={inicial.valor}
              required
            />
          </Field>

          <Field label="Data" htmlFor="data_transacao">
            <TextInput
              id="data_transacao"
              name="data_transacao"
              type="date"
              defaultValue={inicial.data_transacao}
              required
            />
          </Field>
        </div>

        <Field label="Categoria" htmlFor="categoria_id">
          <Select id="categoria_id" name="categoria_id" required defaultValue={inicial.categoria_id}>
            <option value="">Selecione...</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </Select>
        </Field>

        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
          <SecondaryButton type="button" onClick={() => router.back()} disabled={pending}>
            Cancelar
          </SecondaryButton>
          <PrimaryButton type="submit" disabled={pending}>
            {pending ? "Salvando..." : "Salvar alterações"}
          </PrimaryButton>
        </div>
      </form>
    </FormShell>
  );
}
