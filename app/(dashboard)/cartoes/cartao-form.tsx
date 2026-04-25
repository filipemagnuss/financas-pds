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

type Cartao = {
  nome: string;
  limite_total: number;
  dia_fechamento: number;
  dia_vencimento: number;
};

export function CartaoForm({
  titulo,
  descricao,
  action,
  inicial,
}: {
  titulo: string;
  descricao?: string;
  action: (formData: FormData) => Promise<{ erro?: string }>;
  inicial?: Cartao;
}) {
  const router = useRouter();
  const [erro, setErro] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setErro(undefined);
    startTransition(async () => {
      const resultado = await action(formData);
      if (resultado?.erro) setErro(resultado.erro);
    });
  }

  return (
    <FormShell titulo={titulo} descricao={descricao} voltarHref="/dashboard">
      <form action={onSubmit} className="space-y-5">
        <FormError erro={erro} />

        <Field label="Nome do cartão" htmlFor="nome">
          <TextInput
            id="nome"
            name="nome"
            type="text"
            placeholder="Ex: Nubank, Inter Black"
            defaultValue={inicial?.nome}
            required
            maxLength={50}
          />
        </Field>

        <Field
          label="Limite total"
          htmlFor="limite_total"
          hint="Limite máximo de crédito do cartão."
        >
          <TextInput
            id="limite_total"
            name="limite_total"
            type="text"
            inputMode="decimal"
            placeholder="5000,00"
            defaultValue={inicial?.limite_total}
            required
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Dia do fechamento"
            htmlFor="dia_fechamento"
            hint="Dia do mês em que a fatura fecha."
          >
            <TextInput
              id="dia_fechamento"
              name="dia_fechamento"
              type="number"
              min={1}
              max={31}
              placeholder="20"
              defaultValue={inicial?.dia_fechamento}
              required
            />
          </Field>

          <Field
            label="Dia do vencimento"
            htmlFor="dia_vencimento"
            hint="Dia do mês em que a fatura vence."
          >
            <TextInput
              id="dia_vencimento"
              name="dia_vencimento"
              type="number"
              min={1}
              max={31}
              placeholder="27"
              defaultValue={inicial?.dia_vencimento}
              required
            />
          </Field>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
          <SecondaryButton type="button" onClick={() => router.back()} disabled={pending}>
            Cancelar
          </SecondaryButton>
          <PrimaryButton type="submit" disabled={pending}>
            {pending ? "Salvando..." : "Salvar cartão"}
          </PrimaryButton>
        </div>
      </form>
    </FormShell>
  );
}
