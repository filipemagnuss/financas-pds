import { criarCategoria } from "../actions";
import { CategoriaForm } from "../categoria-form";

export default function NovaCategoriaPage() {
  return (
    <CategoriaForm
      titulo="Nova categoria"
      action={criarCategoria}
      voltarHref="/categorias"
    />
  );
}
