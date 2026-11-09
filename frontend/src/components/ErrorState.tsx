import { ReactNode } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: (() => void) | null;
  action?: ReactNode;
  icon?: 'default';
}

/**
 * Компонент для отображения состояния локальной ошибки внутри секций
 */
export default function ErrorState({
  title = 'Произошла ошибка',
  message = '',
  onRetry = null,
  action = null,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-12 h-12 rounded-2xl bg-cream-100 border border-terracotta-200/80 flex items-center justify-center mb-4 shadow-xs">
        <AlertCircle className="w-6 h-6 text-terracotta-600" />
      </div>
      <h3 className="font-serif text-lg font-bold text-char-900 mb-2">{title}</h3>
      {message && (
        <p className="text-sm text-char-600 max-w-sm leading-relaxed mb-5">{message}</p>
      )}
      <div className="flex items-center gap-3 mt-1 flex-wrap justify-center">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="cs-glass-pill inline-flex min-h-[44px] items-center justify-center gap-2 px-5 py-2 rounded-full text-xs font-semibold shadow-xs cursor-pointer active:scale-95 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5 text-camel-700 shrink-0" />
            <span>Повторить</span>
          </button>
        )}
        {action}
      </div>
    </div>
  );
}
