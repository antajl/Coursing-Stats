/**
 * Simple structured logging for frontend
 * Mimics backend structured-logging pattern
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

export interface LogContext {
  component: string;
  operation?: string;
  userId?: string;
  [key: string]: any;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context: LogContext;
  error?: Error;
  metadata?: Record<string, any>;
}

class StructuredLogger {
  private context: LogContext;

  constructor(component: string) {
    this.context = { component };
  }

  private log(level: LogLevel, message: string, metadata?: Record<string, any>, error?: Error): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.context,
      ...(error && { error }),
      ...(metadata && { metadata })
    };

    const logMessage = `[${entry.timestamp}] [${level.toUpperCase()}] [${this.context.component}] ${message}`;
    
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(logMessage, entry);
        break;
      case LogLevel.INFO:
        console.info(logMessage, entry);
        break;
      case LogLevel.WARN:
        console.warn(logMessage, entry);
        break;
      case LogLevel.ERROR:
        console.error(logMessage, entry);
        break;
    }
  }

  debug(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, metadata);
  }

  info(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, metadata);
  }

  warn(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, metadata);
  }

  error(message: string, error?: Error, metadata?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, metadata, error);
  }

  withContext(additionalContext: Partial<LogContext>): StructuredLogger {
    const newLogger = new StructuredLogger(this.context.component);
    newLogger.context = { ...this.context, ...additionalContext };
    return newLogger;
  }
}

export function createLogger(component: string): StructuredLogger {
  return new StructuredLogger(component);
}

// Specific loggers for different components
export const authLogger = createLogger('auth');
export const apiLogger = createLogger('api');
export const dataLogger = createLogger('data');
