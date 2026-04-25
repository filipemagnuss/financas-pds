import { ContaForm } from "../conta-form";
import { criarConta } from "../actions";

export default function NovaContaPage() {
  return (
    <ContaForm
      titulo="Nova conta"
      descricao="Cadastre uma conta bancária ou carteira."
      action={criarConta}
      voltarHref="/dashboard"
    />
  );
}
