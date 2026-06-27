'use client';

import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User, Loader2, RefreshCw } from 'lucide-react';

type Mensagem = {
  role: 'user' | 'assistant';
  content: string;
};

const PROMPT_INICIAL =
  'Analise meus dados financeiros e me dê: 1) os principais insights sobre meus padrões de gasto com projeções anuais por categoria, 2) onde estou gastando mais do que deveria, e 3) pelo menos dois conselhos práticos e específicos para eu economizar mais.';

const SUGESTOES = [
  'Qual categoria devo cortar primeiro?',
  'Estou gastando mais do que ganho?',
  'Como está meu cartão de crédito?',
  'O que mudou nos meus gastos este mês?',
];

export default function IAPage() {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [input, setInput] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [analisandoInicial, setAnalisandoInicial] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    analisarAutomaticamente();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens, carregando, analisandoInicial]);

  async function analisarAutomaticamente() {
    setAnalisandoInicial(true);
    setMensagens([]);

    const primeiraMsg: Mensagem[] = [{ role: 'user', content: PROMPT_INICIAL }];

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensagens: primeiraMsg }),
      });

      if (!res.ok || !res.body) throw new Error('Erro na resposta');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let resposta = '';

      setAnalisandoInicial(false);
      setMensagens([{ role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        resposta += decoder.decode(value, { stream: true });
        setMensagens([{ role: 'assistant', content: resposta }]);
      }
    } catch {
      setAnalisandoInicial(false);
      setMensagens([
        {
          role: 'assistant',
          content:
            'Não consegui carregar a análise. Verifique sua chave de API da OpenAI no arquivo .env.local e tente novamente.',
        },
      ]);
    } finally {
      inputRef.current?.focus();
    }
  }

  async function enviar(texto?: string) {
    const pergunta = (texto ?? input).trim();
    if (!pergunta || carregando) return;

    const novasMensagens: Mensagem[] = [
      ...mensagens,
      { role: 'user', content: pergunta },
    ];
    setMensagens(novasMensagens);
    setInput('');
    setCarregando(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensagens: novasMensagens }),
      });

      if (!res.ok || !res.body) throw new Error('Erro na resposta');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let resposta = '';

      setMensagens((prev) => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        resposta += decoder.decode(value, { stream: true });
        setMensagens((prev) => {
          const copia = [...prev];
          copia[copia.length - 1] = { role: 'assistant', content: resposta };
          return copia;
        });
      }
    } catch {
      setMensagens((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Erro ao processar. Tente novamente.',
        },
      ]);
    } finally {
      setCarregando(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviar();
    }
  }

  const pronto = !analisandoInicial && mensagens.length > 0 && mensagens[0].content;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-[calc(100vh-2rem)] max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Assistente IA</h1>
            <p className="text-xs text-slate-400">Análise e conselhos financeiros personalizados</p>
          </div>
        </div>
        <button
          onClick={analisarAutomaticamente}
          disabled={analisandoInicial || carregando}
          title="Nova análise"
          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-400 transition-all hover:border-emerald-500/30 hover:text-emerald-400 disabled:opacity-40"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${analisandoInicial ? 'animate-spin' : ''}`} />
          Nova análise
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {/* Loading inicial */}
        {analisandoInicial && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-700/60 border border-white/10">
              <Bot className="h-4 w-4 text-slate-300" />
            </div>
            <div className="rounded-2xl rounded-tl-sm bg-slate-900/60 border border-white/10 px-4 py-3">
              <span className="flex items-center gap-2 text-sm text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                Analisando suas finanças...
              </span>
            </div>
          </div>
        )}

        {/* Messages list */}
        {mensagens.map((m, i) => (
          <div
            key={i}
            className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                m.role === 'user'
                  ? 'bg-emerald-500/20'
                  : 'bg-slate-700/60 border border-white/10'
              }`}
            >
              {m.role === 'user' ? (
                <User className="h-4 w-4 text-emerald-400" />
              ) : (
                <Bot className="h-4 w-4 text-slate-300" />
              )}
            </div>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-emerald-500/15 border border-emerald-500/20 text-white rounded-tr-sm'
                  : 'bg-slate-900/60 border border-white/10 text-slate-200 rounded-tl-sm'
              }`}
            >
              {m.content || (
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Escrevendo...
                </span>
              )}
            </div>
          </div>
        ))}

        {/* Loading spinner for follow-up messages */}
        {carregando && mensagens[mensagens.length - 1]?.role === 'user' && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-700/60 border border-white/10">
              <Bot className="h-4 w-4 text-slate-300" />
            </div>
            <div className="rounded-2xl rounded-tl-sm bg-slate-900/60 border border-white/10 px-4 py-3">
              <span className="flex items-center gap-1.5 text-sm text-slate-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Pensando...
              </span>
            </div>
          </div>
        )}

        {/* Suggestions after initial analysis */}
        {pronto && mensagens.length === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            {SUGESTOES.map((s) => (
              <button
                key={s}
                onClick={() => enviar(s)}
                className="text-left rounded-xl border border-white/10 bg-slate-900/40 px-4 py-2.5 text-sm text-slate-400 transition-all hover:border-emerald-500/30 hover:bg-emerald-500/5 hover:text-white"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/10 pt-4">
        <div className="flex gap-3 items-end rounded-2xl border border-white/10 bg-slate-900/60 p-3 focus-within:border-emerald-500/40 transition-colors">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pergunte sobre suas finanças... (Enter para enviar)"
            rows={1}
            disabled={analisandoInicial}
            className="flex-1 resize-none bg-transparent text-sm text-white placeholder-slate-500 outline-none max-h-32 disabled:opacity-50"
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = 'auto';
              el.style.height = `${el.scrollHeight}px`;
            }}
          />
          <button
            onClick={() => enviar()}
            disabled={!input.trim() || carregando || analisandoInicial}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {carregando ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
        <p className="mt-2 text-center text-xs text-slate-600">
          Shift+Enter para nova linha · Enter para enviar
        </p>
      </div>
    </div>
  );
}
