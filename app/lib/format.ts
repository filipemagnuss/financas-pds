export function formatBRL(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatBRLParts(valor: number): { inteiro: string; centavos: string } {
  const fixed = valor.toFixed(2);
  const [int, dec] = fixed.split(".");
  const intFormatado = Number(int).toLocaleString("pt-BR");
  return { inteiro: `R$ ${intFormatado}`, centavos: dec };
}

export function formatDataRelativa(data: Date): string {
  const agora = new Date();
  const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  const ontem = new Date(hoje);
  ontem.setDate(ontem.getDate() - 1);
  const dataDia = new Date(data.getFullYear(), data.getMonth(), data.getDate());

  const hora = data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  if (dataDia.getTime() === hoje.getTime()) return `Hoje, ${hora}`;
  if (dataDia.getTime() === ontem.getTime()) return `Ontem, ${hora}`;

  return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}
