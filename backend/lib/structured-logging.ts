/**
 * Structured Logging Utility for Coursing Stats
 * Provides consistent, structured logging across the application
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
  requestId?: string;
  [key: string]: unknown;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context: LogContext;
  error?: Error;
  metadata?: Record<string, unknown>;
}

class StructuredLogger {
  private context: LogContext;

  constructor(component: string) {
    this.context = { component };
  }

  private log(level: LogLevel, message: string, metadata?: Record<string, unknown>, error?: Error): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.context,
      ...(error && { error }),
      ...(metadata && { metadata })
    };

    // Format log output
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

  debug(message: string, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, metadata);
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, metadata);
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, metadata);
  }

  error(message: string, error?: Error, metadata?: Record<string, unknown>): void {
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
export const parserLogger = createLogger('parser');
export const dataPipelineLogger = createLogger('data-pipeline');
export const apiLogger = createLogger('api');
export const botLogger = createLogger('bot');