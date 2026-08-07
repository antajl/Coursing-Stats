import { Component, ReactNode } from 'react';
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
        <div className="min-h-screen flex items-center justify-center bg-cream-50 dark:bg-charcoal-900">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-charcoal-900 dark:text-charcoal-100 mb-4">
              Что-то пошло не так
            </h1>
            <p className="text-charcoal-600 dark:text-charcoal-400 mb-6">
              Произошла ошибка при загрузке страницы
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-camel-600 text-white rounded-lg hover:bg-camel-700 transition-colors"
            >
              Перезагрузить страницу
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
