import { NextRequest } from "next/server";
import OpenAI from "openai";
import { getUsuarioId } from "@/app/lib/auth";
import { buildContextoFinanceiro } from "@/app/lib/contexto-financeiro";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `Você é um consultor financeiro pessoal integrado ao app "Finanças IA".
Seu papel é analisar os dados do usuário e dar conselhos práticos e diretos em português.

Regras obrigatórias:
1. SEMPRE converta gastos mensais em projeção anual: "R$ X/mês = R$ Y/ano"
2. SEMPRE compare o gasto atual com a média dos 3 meses anteriores (aumentou? diminuiu?)
3. Dê pelo menos 1 conselho concreto e acionável por resposta (ex: "Reduza X em Y% para economizar R$ Z/ano")
4. Alerte quando alguma categoria estiver acima da média histórica
5. Destaque cartões com uso acima de 70% do limite
6. Seja direto e específico — use os números reais, nunca fale em genérico
7. Respostas em no máximo 4 parágrafos curtos, sem enrolação`;

type Mensagem = { role: "user" | "assistant"; content: string };

export async function POST(req: NextRequest) {
  try {
    const usuarioId = await getUsuarioId();
    const { mensagens }: { mensagens: Mensagem[] } = await req.json();

    const contexto = await buildContextoFinanceiro(usuarioId);

    // Keep only last 6 messages to limit tokens
    const historico = mensagens.slice(-6);

    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 600,
      stream: true,
      messages: [
        {
          role: "system",
          content: `${SYSTEM_PROMPT}\n\n${contexto}`,
        },
        ...historico,
      ],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? "";
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    console.error("[chat/route]", err);
    return new Response("Erro ao processar requisição.", { status: 500 });
  }
}
