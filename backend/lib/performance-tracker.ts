/**
 * Performance Tracking Utility for Coursing Stats
 * Tracks execution time and performance metrics for critical operations
 */

export interface PerformanceMetric {
  operation: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
  success: boolean;
  error?: Error;
}

class PerformanceTracker {
  private metrics: Map<string, PerformanceMetric[]> = new Map();

  startOperation(operation: string, metadata?: Record<string, any>): string {
    const operationId = `${operation}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const metric: PerformanceMetric = {
      operation,
      startTime: Date.now(),
      metadata,
      success: false
    };

    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    
    this.metrics.get(operation)!.push(metric);
    
    return operationId;
  }

  endOperation(operationId: string, success: boolean = true, error?: Error): void {
    // Find the metric by operationId (we need to search since we don't have a direct mapping)
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

  getMetrics(operation?: string): PerformanceMetric[] {
    if (operation) {
      return this.metrics.get(operation) || [];
    }
    
    const allMetrics: PerformanceMetric[] = [];
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

  getPerformanceReport(): string {
    let report = 'Performance Report:\n';
    
    for (const [operation, metrics] of this.metrics.entries()) {
      const avgDuration = this.getAverageDuration(operation);
      const successRate = this.getSuccessRate(operation);
      
      report += `\n${operation}:\n`;
      report += `  Average Duration: ${avgDuration.toFixed(2)}ms\n`;
      report += `  Success Rate: ${(successRate * 100).toFixed(1)}%\n`;
      report += `  Total Operations: ${metrics.length}\n`;
    }
    
    return report;
  }
}

export const performanceTracker = new PerformanceTracker();

// Convenience function for tracking operations
export async function trackOperation<T>(
  operation: string,
  fn: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  const operationId = performanceTracker.startOperation(operation, metadata);
  
  try {
    const result = await fn();
    performanceTracker.endOperation(operationId, true);
    return result;
  } catch (error) {
    performanceTracker.endOperation(operationId, false, error as Error);
    throw error;
  }
}