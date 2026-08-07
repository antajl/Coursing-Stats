/**
 * Structured Logging Utility for Coursing Stats Bot
 * Provides consistent, structured logging for bot operations
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
  userId?: number; // Telegram user ID
  chatId?: number; // Telegram chat ID
  callbackQueryData?: string;
  [key: string]: unknown;
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

    // Format log output with emoji for visibility
    const emojiMap = {
      [LogLevel.DEBUG]: '🔍',
      [LogLevel.INFO]: 'ℹ️',
      [LogLevel.WARN]: '⚠️',
      [LogLevel.ERROR]: '❌'
    };

    const emoji = emojiMap[level];
    const logMessage = `${emoji} [${entry.timestamp}] [${level.toUpperCase()}] [${this.context.component}] ${message}`;
    
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

// Specific loggers for different bot components
export const botHandlerLogger = createLogger('bot-handler');
export const botApiLogger = createLogger('bot-api');
export const botCacheLogger = createLogger('bot-cache');
export const securityLogger = createLogger('security');

// Security event types (for future use)
export enum SecurityEventType {
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  INVALID_INPUT = 'invalid_input',
  SUSPICIOUS_REQUEST = 'suspicious_request',
  AUTH_FAILURE = 'auth_failure',
  UNAUTHORIZED_ACCESS = 'unauthorized_access'
}

// Security event logging (simplified for type compatibility)
export function logSecurityEvent(event: {
  eventType: SecurityEventType;
  userId?: number;
  details: Record<string, unknown>;
  timestamp: string;
}): void {
  // Simplified logging to avoid type issues
  securityLogger.warn(`Security event: ${event.eventType}`, {
    userId: event.userId,
    timestamp: event.timestamp,
    ...event.details
  });
}