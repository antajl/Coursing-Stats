/**
 * Performance Tracking Utility for Coursing Stats Bot
 * Tracks bot handler performance and API response times
 */

export interface BotPerformanceMetric {
  operation: string;
  handlerName?: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  userId?: number;
  chatId?: number;
  success: boolean;
  error?: Error;
}

class BotPerformanceTracker {
  private metrics: Map<string, BotPerformanceMetric[]> = new Map();

  startOperation(operation: string, metadata?: { handlerName?: string; userId?: number; chatId?: number }): string {
    const operationId = `${operation}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const metric: BotPerformanceMetric = {
      operation,
      startTime: Date.now(),
      ...metadata,
      success: false
    };

    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    
    this.metrics.get(operation)!.push(metric);
    
    return operationId;
  }

  endOperation(operationId: string, success: boolean = true, error?: Error): void {
    for (const [operation, metrics] of this.metrics.entries()) {
      const metric = metrics.find(m => 
        `${m.operation}-${m.startTime}`.includes(operationId.split('-').slice(0, -1).join('-'))
      );
      
      if (metric) {
        metric.endTime = Date.now();
        metric.duration = metric.endTime - metric.startTime;
        metric.success = success;
        if (error) metric.error = error;
        break;
      }
    }
  }

  getMetrics(operation?: string): BotPerformanceMetric[] {
    if (operation) {
      return this.metrics.get(operation) || [];
    }
    
    const allMetrics: BotPerformanceMetric[] = [];
    for (const metrics of this.metrics.values()) {
      allMetrics.push(...metrics);
    }
    return allMetrics;
  }

  getAverageDuration(operation: string): number {
    const metrics = this.getMetrics(operation);
    if (metrics.length === 0) return 0;
    
    const completedMetrics = metrics.filter(m => m.duration !== undefined);
    if (completedMetrics.length === 0) return 0;
    
    const totalDuration = completedMetrics.reduce((sum, m) => sum + (m.duration || 0), 0);
    return totalDuration / completedMetrics.length;
  }

  getSuccessRate(operation: string): number {
    const metrics = this.getMetrics(operation);
    if (metrics.length === 0) return 1;
    
    const successfulMetrics = metrics.filter(m => m.success);
    return successfulMetrics.length / metrics.length;
  }

  clearMetrics(operation?: string): void {
    if (operation) {
      this.metrics.delete(operation);
    } else {
      this.metrics.clear();
    }
  }
}

export const botPerformanceTracker = new BotPerformanceTracker();

// Convenience function for tracking bot operations
export async function trackBotOperation<T>(
  operation: string,
  fn: () => Promise<T>,
  metadata?: { handlerName?: string; userId?: number; chatId?: number }
): Promise<T> {
  const operationId = botPerformanceTracker.startOperation(operation, metadata);
  
  try {
    const result = await fn();
    botPerformanceTracker.endOperation(operationId, true);
    return result;
  } catch (error) {
    botPerformanceTracker.endOperation(operationId, false, error as Error);
    throw error;
  }
}