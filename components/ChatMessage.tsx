'use client';

interface ChatMessageProps {
  role: 'ai' | 'user';
  content: string;
  isLoading?: boolean;
  source?: { page: number };
}

export default function ChatMessage({
  role,
  content,
  isLoading = false,
  source,
}: ChatMessageProps) {
  const isAI = role === 'ai';

  return (
    <div
      className={`flex items-start gap-3 sm:gap-4 ${!isAI ? 'justify-end' : ''}`}
      data-role={role}
    >
      {/* Avatar - AI ou User */}
      {isAI && (
        <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <span className="material-symbols-outlined text-lg sm:text-xl text-slate-600 dark:text-slate-300">
            smart_toy
          </span>
        </div>
      )}

      {/* Mensagem Container */}
      <div
        className={`flex flex-col gap-1 sm:gap-2 max-w-[85%] sm:max-w-[80%] md:max-w-[70%] lg:max-w-[60%] ${!isAI ? 'items-end' : ''}`}
      >
        {/* Label */}
        <span className="text-xs sm:text-[13px] font-semibold text-slate-500 dark:text-slate-400 px-2 sm:px-0">
          {isAI ? 'DocPilot AI' : 'Você'}
        </span>

        {/* Bolha de mensagem */}
        {isLoading ? (
          <div
            className={`rounded-xl sm:rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3.5 ${
              isAI
                ? 'rounded-tl-none border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                : 'rounded-tr-none bg-primary'
            }`}
          >
            <div className="flex gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-slate-400 dark:bg-slate-600 animate-bounce"></span>
              <span className="inline-block h-2 w-2 rounded-full bg-slate-400 dark:bg-slate-600 animate-bounce [animation-delay:-0.15s]"></span>
              <span className="inline-block h-2 w-2 rounded-full bg-slate-400 dark:bg-slate-600 animate-bounce [animation-delay:-0.3s]"></span>
            </div>
          </div>
        ) : (
          <div
            className={`rounded-xl sm:rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3.5 text-sm sm:text-base leading-relaxed shadow-sm ${
              isAI
                ? 'rounded-tl-none border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100'
                : 'rounded-tr-none bg-primary text-white shadow-md shadow-primary/20'
            }`}
          >
            {content}
          </div>
        )}

        {/* Source Badge */}
        {source && isAI && (
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-[12px] text-slate-500 dark:text-slate-400 mt-1 px-2 sm:px-0">
            <span className="material-symbols-outlined text-xs sm:text-sm">menu_book</span>
            <span className="font-medium">Fonte: Página {source.page}</span>
          </div>
        )}
      </div>

      {/* Avatar - User */}
      {!isAI && (
        <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20 overflow-hidden">
          <span className="material-symbols-outlined text-lg sm:text-xl text-primary dark:text-primary">
            account_circle
          </span>
        </div>
      )}
    </div>
  );
}
