"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  FormShell,
  Field,
  TextInput,
  FormError,
  PrimaryButton,
  SecondaryButton,
} from "@/app/components/form";

type Conta = { nome: string; saldo_atual: number };

export function ContaForm({
  titulo,
  descricao,
  action,
  inicial,
  voltarHref,
}: {
  titulo: string;
  descricao?: string;
  action: (formData: FormData) => Promise<{ erro?: string }>;
  inicial?: Conta;
  voltarHref: string;
}) {
  const router = useRouter();
  const [erro, setErro] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setErro(undefined);
    startTransition(async () => {
      const r = await action(formData);
      if (r?.erro) setErro(r.erro);
    });
  }

  return (
    <FormShell titulo={titulo} descricao={descricao} voltarHref={voltarHref}>
      <form action={onSubmit} className="space-y-5">
        <FormError erro={erro} />

        <Field label="Nome da conta" htmlFor="nome">
          <TextInput
            id="nome"
            name="nome"
            type="text"
            placeholder="Ex: Conta Corrente, Carteira"
            defaultValue={inicial?.nome}
            required
            maxLength={50}
          />
        </Field>

        <Field
          label="Saldo atual"
          htmlFor="saldo_atual"
          hint="Valor atual da conta. Pode ser zero ou negativo."
        >
          <TextInput
            id="saldo_atual"
            name="saldo_atual"
            type="text"
            inputMode="decimal"
            placeholder="0,00"
            defaultValue={inicial?.saldo_atual}
            required
          />
        </Field>

        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
          <SecondaryButton type="button" onClick={() => router.back()} disabled={pending}>
            Cancelar
          </SecondaryButton>
          <PrimaryButton type="submit" disabled={pending}>
            {pending ? "Salvando..." : "Salvar conta"}
          </PrimaryButton>
        </div>
      </form>
    </FormShell>
  );
}
