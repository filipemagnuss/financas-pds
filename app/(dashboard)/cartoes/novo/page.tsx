import { CartaoForm } from "../cartao-form";
import { criarCartao } from "../actions";

export default function NovoCartaoPage() {
  return <CartaoForm titulo="Novo Cartão" descricao="Cadastre um cartão de crédito." action={criarCartao} />;
}
