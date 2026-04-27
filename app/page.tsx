'use client';

import { useState, useEffect, useRef } from 'react';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import Sidebar from '@/components/Sidebar';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  source?: { page: number };
  isLoading?: boolean;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial-message',
      role: 'assistant',
      content: 'Olá! 👋 Bem-vindo ao DocPilot. Estou aqui para ajudá-lo com perguntas sobre a NovaVision. Sinta-se à vontade para fazer qualquer pergunta sobre a empresa, seus produtos, serviços ou informações disponíveis na documentação.',
      isLoading: false,
    },
  ]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (message: string) => {
    // Adicionar mensagem do usuário
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: message,
    };

    // Adicionar mensagem do usuário ao estado
    setMessages((prev) => [...prev, userMessage]);

    // Incluir a mensagem do usuário no payload (setMessages é assíncrono)
    const messagesForAPI = [...messages, userMessage];

    // Adicionar mensagem de loading
    const loadingMessage: Message = {
      id: `msg-${Date.now() + 1}`,
      role: 'assistant',
      content: '',
      isLoading: true,
    };
    setMessages((prev) => [...prev, loadingMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: messagesForAPI }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Remover mensagem de loading e adicionar resposta da IA
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: data.message || data.error || 'Erro ao processar resposta',
          isLoading: false,
        };
        return updated;
      });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: 'Desculpe, houve um erro ao processar sua solicitação. Tente novamente.',
          isLoading: false,
        };
        return updated;
      });
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <Sidebar isOpen={true} isMobile={false} />

      {/* Main Content */}
      <div className="relative flex flex-1 flex-col bg-white dark:bg-background-dark transition-colors duration-200">
        {/* Header - Sticky */}
        <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-background-dark/95 backdrop-blur-sm px-4 sm:px-6 md:px-20 py-3 transition-colors">
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white shrink-0">
              <span className="material-symbols-outlined text-lg sm:text-xl">
                description
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
              DocPilot
            </h2>
          </div>
        </header>

        {/* Main - Chat Messages Area */}
        <main className="flex-1 overflow-y-auto pb-36 sm:pb-40">
          <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 md:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                role={msg.role}
                content={msg.content}
                isLoading={msg.isLoading}
                source={msg.source}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* Input Footer */}
        <ChatInput onSubmit={handleSendMessage} />
      </div>

      {/* Mobile Sidebar Drawer */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isMobile={true} />
    </>
  );
}
