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
import { criarTransferencia } from "../actions";

type Conta = { id: string; nome: string; saldo_atual: number };

export function TransferenciaForm({
  contas,
  dataInicial,
}: {
  contas: Conta[];
  dataInicial: string;
}) {
  const router = useRouter();
  const [erro, setErro] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setErro(undefined);
    startTransition(async () => {
      const r = await criarTransferencia(formData);
      if (r?.erro) setErro(r.erro);
    });
  }

  if (contas.length < 2) {
    return (
      <FormShell
        titulo="Transferência entre contas"
        descricao="Mova saldo de uma conta para outra."
        voltarHref="/transacoes"
      >
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          Você precisa de pelo menos duas contas para realizar uma transferência.
        </div>
      </FormShell>
    );
  }

  return (
    <FormShell
      titulo="Transferência entre contas"
      descricao="Mova saldo de uma conta para outra."
      voltarHref="/transacoes"
    >
      <form action={onSubmit} className="space-y-5">
        <FormError erro={erro} />

        <Field label="Conta de origem" htmlFor="conta_origem_id">
          <Select id="conta_origem_id" name="conta_origem_id" required>
            <option value="">Selecione...</option>
            {contas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome} — R$ {c.saldo_atual.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Conta de destino" htmlFor="conta_destino_id">
          <Select id="conta_destino_id" name="conta_destino_id" required>
            <option value="">Selecione...</option>
            {contas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome} — R$ {c.saldo_atual.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </option>
            ))}
          </Select>
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

        <Field label="Descrição (opcional)" htmlFor="descricao">
          <TextInput
            id="descricao"
            name="descricao"
            placeholder="Ex: Reserva de emergência"
            maxLength={100}
          />
        </Field>

        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
          <SecondaryButton type="button" onClick={() => router.back()} disabled={pending}>
            Cancelar
          </SecondaryButton>
          <PrimaryButton type="submit" disabled={pending}>
            {pending ? "Transferindo..." : "Confirmar transferência"}
          </PrimaryButton>
        </div>
      </form>
    </FormShell>
  );
}
