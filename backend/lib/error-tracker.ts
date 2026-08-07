/**
 * Error Tracking Utility for Coursing Stats
 * Classifies and tracks errors for analysis and prevention
 */

import { errorLogger } from './structured-logging';

export enum ErrorCategory {
  PARSER_ENCODING = 'parser_encoding',
  PARSER_STRUCTURE = 'parser_structure',
  PARSER_VALIDATION = 'parser_validation',
  DATA_PIPELINE = 'data_pipeline',
  DATA_INTEGRITY = 'data_integrity',
  API_ERROR = 'api_error',
  NETWORK_ERROR = 'network_error',
  UNKNOWN = 'unknown'
}

export interface ErrorEntry {
  timestamp: string;
  category: ErrorCategory;
  message: string;
  error?: Error;
  context: {
    component: string;
    operation?: string;
    [key: string]: any;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
}

class ErrorTracker {
  private errors: ErrorEntry[] = [];
  private errorPatterns: Map<string, number> = new Map();

  classifyError(error: Error, context: { component: string; operation?: string }): ErrorCategory {
    const message = error.message.toLowerCase();
    const component = context.component.toLowerCase();

    // Parser encoding errors
    if (message.includes('encoding') || message.includes('charset') || message.includes('1251')) {
      return ErrorCategory.PARSER_ENCODING;
    }

    // Parser structure errors
    if (component.includes('parser') && (message.includes('structure') || message.includes('parse'))) {
      return ErrorCategory.PARSER_STRUCTURE;
    }

    // Parser validation errors
    if (message.includes('validation') || message.includes('schema')) {
      return ErrorCategory.PARSER_VALIDATION;
    }

    // Data pipeline errors
    if (component.includes('data') || component.includes('sync') || component.includes('build')) {
      return ErrorCategory.DATA_PIPELINE;
    }

    // Data integrity errors
    if (message.includes('corruption') || message.includes('integrity') || message.includes('duplicate')) {
      return ErrorCategory.DATA_INTEGRITY;
    }

    // Network errors
    if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
      return ErrorCategory.NETWORK_ERROR;
    }

    // API errors
    if (message.includes('api') || message.includes('endpoint')) {
      return ErrorCategory.API_ERROR;
    }

    return ErrorCategory.UNKNOWN;
  }

  determineSeverity(category: ErrorCategory): 'low' | 'medium' | 'high' | 'critical' {
    switch (category) {
      case ErrorCategory.PARSER_ENCODING:
        return 'high';
      case ErrorCategory.DATA_INTEGRITY:
        return 'critical';
      case ErrorCategory.PARSER_STRUCTURE:
        return 'high';
      case ErrorCategory.PARSER_VALIDATION:
        return 'medium';
      case ErrorCategory.DATA_PIPELINE:
        return 'high';
      case ErrorCategory.API_ERROR:
        return 'medium';
      case ErrorCategory.NETWORK_ERROR:
        return 'low';
      default:
        return 'medium';
    }
  }

  trackError(error: Error, context: { component: string; operation?: string; [key: string]: any }): void {
    const category = this.classifyError(error, context);
    const severity = this.determineSeverity(category);

    const entry: ErrorEntry = {
      timestamp: new Date().toISOString(),
      category,
      message: error.message,
      error,
      context,
      severity,
      resolved: false
    };

    this.errors.push(entry);

    // Track error patterns
    const patternKey = `${category}:${error.message.substring(0, 50)}`;
    this.errorPatterns.set(patternKey, (this.errorPatterns.get(patternKey) || 0) + 1);

    // Log critical errors immediately using structured logging
    if (severity === 'critical') {
      errorLogger.error('CRITICAL ERROR', error, { 
        category, 
        component: context.component, 
        operation: context.operation,
        ...context 
      });
    }
  }

  getErrors(category?: ErrorCategory, severity?: string): ErrorEntry[] {
    let filtered = this.errors;

    if (category) {
      filtered = filtered.filter(e => e.category === category);
    }

    if (severity) {
      filtered = filtered.filter(e => e.severity === severity);
    }

    return filtered;
  }

  getErrorPatterns(): Map<string, number> {
    return new Map(this.errorPatterns);
  }

  getFrequentErrors(threshold: number = 3): Array<{ pattern: string; count: number }> {
    const frequent: Array<{ pattern: string; count: number }> = [];

    for (const [pattern, count] of this.errorPatterns.entries()) {
      if (count >= threshold) {
        frequent.push({ pattern, count });
      }
    }

    return frequent.sort((a, b) => b.count - a.count);
  }

  markAsResolved(errorIndex: number): void {
    if (errorIndex >= 0 && errorIndex < this.errors.length) {
      this.errors[errorIndex].resolved = true;
    }
  }

  clearErrors(): void {
    this.errors = [];
    this.errorPatterns.clear();
  }

  getErrorReport(): string {
    let report = 'Error Report:\n';
    
    const totalErrors = this.errors.length;
    const unresolvedErrors = this.errors.filter(e => !e.resolved).length;
    const criticalErrors = this.errors.filter(e => e.severity === 'critical').length;
    
    report += `Total Errors: ${totalErrors}\n`;
    report += `Unresolved: ${unresolvedErrors}\n`;
    report += `Critical: ${criticalErrors}\n\n`;

    // Error by category
    const errorsByCategory = new Map<ErrorCategory, number>();
    for (const error of this.errors) {
      errorsByCategory.set(error.category, (errorsByCategory.get(error.category) || 0) + 1);
    }

    report += 'Errors by Category:\n';
    for (const [category, count] of errorsByCategory.entries()) {
      report += `  ${category}: ${count}\n`;
    }

    // Frequent errors
    const frequentErrors = this.getFrequentErrors();
    if (frequentErrors.length > 0) {
      report += '\nFrequent Error Patterns:\n';
      for (const { pattern, count } of frequentErrors) {
        report += `  ${pattern}: ${count} occurrences\n`;
      }
    }

    return report;
  }
}

export const errorTracker = new ErrorTracker();