'use client';

import { useState, FormEvent } from 'react';

interface ChatInputProps {
  onSubmit: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSubmit, disabled = false }: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim()) {
      onSubmit(input);
      setInput('');
    }
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md p-4 sm:p-6">
      <div className="mx-auto max-w-2xl px-2 sm:px-4">
        <form onSubmit={handleSubmit} className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl sm:rounded-2xl shadow-lg dark:shadow-none p-2 sm:p-3 transition-all focus-within:ring-2 focus-within:ring-primary/20">
          {/* Button Add (hidden on mobile) */}
          <button
            type="button"
            className="hidden sm:flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            <span className="material-symbols-outlined">add_circle</span>
          </button>

          {/* Input */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={disabled}
            placeholder="Pergunte algo sobre o documento..."
            className="flex-1 border-none bg-transparent px-2 sm:px-3 py-3 sm:py-2 text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-0 disabled:opacity-50"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={disabled || !input.trim()}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white px-4 sm:px-5 py-2.5 sm:py-2 text-sm sm:text-base font-semibold transition-colors shrink-0"
          >
            <span className="hidden sm:inline">Enviar</span>
            <span className="material-symbols-outlined text-lg sm:text-xl">send</span>
          </button>
        </form>

        {/* Footer disclaimer */}
        <p className="text-center text-xs sm:text-[11px] text-slate-400 mt-3 px-2">
          DocPilot pode cometer erros. Verifique informações importantes.
        </p>
      </div>
    </footer>
  );
}
