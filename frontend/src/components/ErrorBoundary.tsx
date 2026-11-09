import { Component, ReactNode, useState, useCallback, useEffect } from 'react';
import {
  Home,
  RotateCcw,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Terminal,
  WifiOff,
  Trash2,
  Send,
} from 'lucide-react';
import { createLogger } from '../lib/logging';

const errorLogger = createLogger('error-boundary');

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorFallbackProps {
  error?: Error;
  onReset?: () => void;
}

export function ErrorFallback({ error, onReset }: ErrorFallbackProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const handleReload = useCallback(() => {
    if (onReset) onReset();
    window.location.reload();
  }, [onReset]);

  const handleClearCacheAndReload = useCallback(() => {
    try {
      sessionStorage.clear();
      localStorage.removeItem('cs:error-reload');
    } catch {
      // Ignore storage errors in restricted contexts
    }
    if (onReset) onReset();
    window.location.reload();
  }, [onReset]);

  const canGoBack = typeof window !== 'undefined' && window.history.length > 1;
  const handleGoBack = useCallback(() => {
    if (canGoBack) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  }, [canGoBack]);

  const copyReport = useCallback(() => {
    const report = [
      `[CoursingStats Error Report]`,
      `Date: ${new Date().toISOString()}`,
      `URL: ${typeof window !== 'undefined' ? window.location.href : '—'}`,
      `UserAgent: ${typeof navigator !== 'undefined' ? navigator.userAgent : '—'}`,
      `Online: ${typeof navigator !== 'undefined' ? navigator.onLine : '—'}`,
      `Error: ${error?.name || 'Error'}: ${error?.message || 'Unknown error'}`,
      error?.stack ? `\nStack:\n${error.stack}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    navigator.clipboard
      .writeText(report)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        // Fallback or ignore
      });
  }, [error]);

  const tgMessage = encodeURIComponent(
    `Ошибка на CoursingStats: ${error?.name || 'Error'} — ${(error?.message || '').slice(0, 100)}`
  );

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto cs-page-shell min-h-dvh">
      {/* Мягкое радиальное фоновое свечение в стиле Old Money */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full pointer-events-none opacity-40 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(216,181,122,0.3) 0%, rgba(245,241,232,0) 70%)',
        }}
        aria-hidden="true"
      />

      {/* Парящая физическая стеклянная карточка */}
      <div className="relative z-10 w-full max-w-lg bg-white/95 backdrop-blur-md rounded-2xl border border-om-200 shadow-xl p-6 sm:p-8 text-center transition-all">
        {/* Гербовый бренд-медальон */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-b from-cream-50 to-cream-100 border border-camel-300/80 shadow-xs mb-4">
          <img
            src="/assets/brand/logo-badge.svg"
            alt="CoursingStats"
            width={48}
            height={48}
            className="w-11 h-11 object-contain"
          />
        </div>

        {/* Индикатор отсутствия сети */}
        {isOffline && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300/80 text-amber-950 text-xs font-semibold mb-3">
            <WifiOff className="w-3.5 h-3.5 text-amber-700" />
            <span>Отсутствует подключение к интернету</span>
          </div>
        )}

        {/* Заголовок */}
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-char-900 tracking-tight mb-2.5">
          Что-то пошло не так
        </h1>

        {/* Описание */}
        <p className="text-sm text-char-600 leading-relaxed mb-6">
          {isOffline ? (
            <>
              Отсутствует подключение к&nbsp;интернету.
              <br />
              Проверьте сеть и&nbsp;попробуйте снова.
            </>
          ) : (
            <>
              Не&nbsp;удалось загрузить страницу.
              <br />
              Обновите экран или&nbsp;перейдите на&nbsp;главную.
            </>
          )}
        </p>

        {/* Основные действия */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={handleReload}
            className="cs-glass-pill-active inline-flex min-h-[44px] items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 shrink-0 text-char-900" />
            <span>Перезагрузить страницу</span>
          </button>

          <a
            href="/"
            className="cs-glass-pill inline-flex min-h-[44px] items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <Home className="w-4 h-4 shrink-0 text-camel-700" />
            <span>На главную</span>
          </a>
        </div>

        {/* Вторичные ссылки */}
        <div className="mt-3 flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
          {canGoBack && (
            <button
              type="button"
              onClick={handleGoBack}
              className="inline-flex min-h-[44px] items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-char-500 hover:text-char-800 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Вернуться назад</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="inline-flex min-h-[44px] items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-char-500 hover:text-char-800 transition-colors cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5 text-camel-700" />
            <span>{showDetails ? 'Скрыть подробности' : 'Технические подробности'}</span>
            {showDetails ? (
              <ChevronUp className="w-3.5 h-3.5 text-char-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-char-400" />
            )}
          </button>
        </div>

        {/* Раскрывающийся блок технических подробностей */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-om-200 text-left select-text">
            <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
              <span className="text-xs font-semibold text-char-700">Информация о сбое</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={copyReport}
                  className="cs-glass-pill inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold text-char-700 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Скопировано</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-char-500" />
                      <span>Копировать отчет</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleClearCacheAndReload}
                  title="Очистить временные данные и перезагрузить"
                  className="cs-glass-pill inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold text-char-700 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3 text-char-500" />
                  <span>Сбросить кэш</span>
                </button>
              </div>
            </div>

            <div className="p-3 bg-cream-100/70 border border-om-200 rounded-xl font-mono text-[11px] text-char-800 overflow-x-auto max-h-48 leading-relaxed">
              <div className="font-semibold text-terracotta-700 mb-1">
                {error?.name || 'Error'}: {error?.message || 'Неизвестная ошибка'}
              </div>
              <div className="text-char-500 text-[10px] mb-2 break-all">
                URL: {typeof window !== 'undefined' ? window.location.href : '—'}
              </div>
              {error?.stack && (
                <pre className="whitespace-pre-wrap text-[10px] text-char-600 font-mono">
                  {error.stack}
                </pre>
              )}
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] text-char-500 flex-wrap gap-2">
              <span>Если ошибка повторяется:</span>
              <a
                href={`https://t.me/antajl?text=${tgMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-camel-700 hover:text-camel-800 font-semibold"
              >
                <Send className="w-3 h-3" />
                <span>Написать в Telegram</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    errorLogger.error('ErrorBoundary caught an error', error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });

    // Auto-recover once on client version mismatch, stale chunk, or React lifecycle desync
    try {
      const msg = error?.message || '';
      const isDesync =
        msg.includes('Minified React error #310') ||
        msg.includes('Minified React error #300') ||
        msg.includes('Minified React error #185') ||
        msg.includes('Failed to fetch dynamically imported module') ||
        msg.includes('dynamically imported module');

      if (isDesync) {
        const KEY = 'cs:error-reload';
        const now = Date.now();
        const prev = Number(sessionStorage.getItem(KEY) || 0);
        if (!prev || now - prev > 15000) {
          sessionStorage.setItem(KEY, String(now));
          window.location.reload();
        }
      }
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          onReset={() => this.setState({ hasError: false, error: undefined })}
        />
      );
    }

    return this.props.children;
  }
}
