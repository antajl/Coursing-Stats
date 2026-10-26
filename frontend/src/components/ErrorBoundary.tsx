import { Component, ReactNode } from 'react';
import { Home, RotateCcw } from 'lucide-react';
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
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-cream-50 px-4 py-8">
          <div className="text-center p-6 sm:p-8 max-w-md w-full bg-white rounded-xl border border-om-200 shadow-sm">
            <h1 className="text-xl sm:text-2xl font-bold text-char-900 mb-3 tracking-tight">
              Что-то пошло не так
            </h1>
            <p className="text-sm text-char-500 mb-6 leading-relaxed">
              Произошла ошибка при загрузке страницы. Вы можете обновить страницу или вернуться на главную.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
              <a
                href="/"
                className="inline-flex min-h-[44px] items-center justify-center gap-2 px-5 py-2.5 bg-camel-600 text-white rounded-lg hover:bg-camel-700 active:bg-camel-800 transition-colors text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-camel-500 focus:ring-offset-2"
              >
                <Home className="w-4 h-4 shrink-0" />
                <span>На главную</span>
              </a>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 px-5 py-2.5 bg-om-100 text-char-800 rounded-lg border border-om-200 hover:bg-om-200 active:bg-om-300 transition-colors text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-camel-500 focus:ring-offset-2"
              >
                <RotateCcw className="w-4 h-4 text-char-600 shrink-0" />
                <span>Перезагрузить страницу</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
