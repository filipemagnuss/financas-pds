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

export function CategoriaForm({
  titulo,
  action,
  inicial,
  voltarHref,
}: {
  titulo: string;
  action: (formData: FormData) => Promise<{ erro?: string }>;
  inicial?: { nome: string; tipo: string };
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
    <FormShell titulo={titulo} voltarHref={voltarHref}>
      <form action={onSubmit} className="space-y-5">
        <FormError erro={erro} />

        <Field label="Nome da categoria" htmlFor="nome">
          <TextInput
            id="nome"
            name="nome"
            placeholder="Ex: Assinaturas, Pet, Viagens"
            defaultValue={inicial?.nome}
            required
            maxLength={50}
          />
        </Field>

        <Field label="Tipo" htmlFor="tipo">
          <Select id="tipo" name="tipo" required defaultValue={inicial?.tipo ?? ""}>
            <option value="">Selecione...</option>
            <option value="DESPESA">Despesa</option>
            <option value="RECEITA">Receita</option>
          </Select>
        </Field>

        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
          <SecondaryButton type="button" onClick={() => router.back()} disabled={pending}>
            Cancelar
          </SecondaryButton>
          <PrimaryButton type="submit" disabled={pending}>
            {pending ? "Salvando..." : "Salvar categoria"}
          </PrimaryButton>
        </div>
      </form>
    </FormShell>
  );
}
