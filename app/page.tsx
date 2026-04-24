'use client';

import { useState, useRef, useEffect } from 'react';
import ChatMessage from "../components/ChatMessage";
import ChatInput from "../components/ChatInput";

interface Message {
  id: string;
  role: 'ai' | 'user';
  content: string;
  source?: { page: number };
  isLoading?: boolean;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      content: 'Olá! Sou o DocPilot. Como posso ajudar com a leitura do seu PDF hoje?',
    },
  ]);

  const [hasSelectFile, setHasSelectFile] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFileName(file.name);
      setHasSelectFile(true);
      // Aqui virá a lógica de upload e processamento do PDF
      // Por enquanto, apenas simula que o arquivo foi selecionado
    } else {
      alert('Por favor, selecione um arquivo PDF válido.');
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    setHasSelectFile(false);
    setSelectedFileName('');
    setMessages([
      {
        id: '1',
        role: 'ai',
        content: 'Olá! Sou o DocPilot. Como posso ajudar com a leitura do seu PDF hoje?',
      },
    ]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = (message: string) => {
    // Adiciona mensagem do usuário
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Simula delay de resposta da IA
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content:
          'Esta é uma resposta simulada. A integração com LangChain e Astra DB será implementada em breve.',
        source: { page: 4 },
      };

      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  // Estado 1: Tela Inicial (Upload)
  if (!hasSelectFile) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-6 md:px-20 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
              <span className="material-symbols-outlined text-xl">description</span>
            </div>
            <h1 className="text-lg font-bold tracking-tight">DocPilot</h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex flex-col items-center justify-center mt-16 max-w-md text-center gap-8">
          <div className="space-y-3">
            <h2 className="text-4xl md:text-5xl font-bold">DocPilot</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 font-light">
              Converse com seus documentos instantaneamente.
            </p>
          </div>

          <button
            onClick={handleFileButtonClick}
            className="flex items-center justify-center gap-3 rounded-full bg-primary hover:bg-primary/90 text-white px-8 py-4 font-semibold text-lg transition-colors shadow-lg hover:shadow-xl shadow-primary/30"
          >
            <span className="material-symbols-outlined text-2xl">upload_file</span>
            <span>Selecionar PDF</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
            aria-label="Selecionar arquivo PDF"
          />

          <div className="pt-8 text-sm text-slate-500 dark:text-slate-400 space-y-2">
            <p>🔒 Seus dados são privados e temporários</p>
            <p>⚡ Processamento instantâneo</p>
            <p>🎯 Sem login necessário</p>
          </div>
        </main>
      </div>
    );
  }

  // Estado 2: Chat Ativo (Pós-upload)
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-6 md:px-20 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
            <span className="material-symbols-outlined text-xl">description</span>
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold">DocPilot</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs">
              {selectedFileName}
            </p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 px-3 py-2 text-sm font-medium transition-colors"
        >
          <span className="material-symbols-outlined text-lg">refresh</span>
          <span>Trocar</span>
        </button>
      </header>

      {/* Chat Messages Area */}
      <main className="flex-1 overflow-y-auto pb-32">
        <div className="mx-auto max-w-200 px-4 py-8 space-y-8">
          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              role={msg.role}
              content={msg.content}
              isLoading={msg.isLoading}
              source={msg.source}
            />
          ))}

          {isLoading && (
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <span className="material-symbols-outlined text-xl text-slate-600 dark:text-slate-300">
                  smart_toy
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  DocPilot AI está escrevendo...
                </span>
                <div className="flex gap-1.5 px-1 py-2">
                  <div className="h-2 w-2 rounded-full bg-slate-300 animate-bounce"></div>
                  <div className="h-2 w-2 rounded-full bg-slate-300 animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="h-2 w-2 rounded-full bg-slate-300 animate-bounce [animation-delay:-0.3s]"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Chat Input Footer */}
      <ChatInput onSubmit={handleSendMessage} disabled={isLoading} />
    </div>
  );
}
