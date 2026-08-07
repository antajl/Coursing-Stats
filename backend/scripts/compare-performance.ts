#!/usr/bin/env node
/**
 * Performance Comparison Script
 * Compares current performance metrics against baseline
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

interface PerformanceMetrics {
  timestamp: string;
  version: string;
  metrics: Record<string, any>;
  thresholds: Record<string, any>;
}

class PerformanceComparator {
  private baselinePath: string;
  private currentMetrics: PerformanceMetrics;
  private baselineMetrics: PerformanceMetrics | null;

  constructor() {
    this.baselinePath = join(process.cwd(), '.devin', 'performance-baseline.json');
    this.currentMetrics = this.generateCurrentMetrics();
    this.baselineMetrics = this.loadBaseline();
  }

  private loadBaseline(): PerformanceMetrics | null {
    try {
      if (existsSync(this.baselinePath)) {
        const content = readFileSync(this.baselinePath, 'utf-8');
        return JSON.parse(content);
      }
    } catch (error) {
      console.warn('Failed to load baseline:', error);
    }
    return null;
  }

  private generateCurrentMetrics(): PerformanceMetrics {
    // This would be populated by actual measurements
    // For now, return placeholder structure
    return {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      metrics: {},
      thresholds: {}
    };
  }

  private compareMetric(name: string, current: number, baseline: number, threshold: number): string {
    const diff = current - baseline;
    const diffPercent = ((diff / baseline) * 100).toFixed(1);
    
    if (diff > threshold) {
      return `❌ CRITICAL: ${name} regressed by ${diffPercent}% (${baseline}ms → ${current}ms)`;
    } else if (diff > threshold * 0.5) {
      return `⚠️  WARNING: ${name} increased by ${diffPercent}% (${baseline}ms → ${current}ms)`;
    } else if (diff < -threshold * 0.3) {
      return `✅ IMPROVEMENT: ${name} improved by ${Math.abs(parseFloat(diffPercent))}% (${baseline}ms → ${current}ms)`;
    } else {
      return `✅ OK: ${name} stable (${baseline}ms → ${current}ms)`;
    }
  }

  public compare(): void {
    console.log('=== Performance Comparison ===\n');
    
    if (!this.baselineMetrics) {
      console.log('No baseline found. Creating new baseline...');
      this.saveBaseline();
      return;
    }

    console.log(`Baseline: ${this.baselineMetrics.timestamp}`);
    console.log(`Current: ${this.currentMetrics.timestamp}\n`);

    let hasCriticalIssues = false;
    let hasWarnings = false;

    for (const [metricName, currentData] of Object.entries(this.currentMetrics.metrics)) {
      const baselineData = this.baselineMetrics.metrics[metricName];
      const threshold = this.baselineMetrics.thresholds[metricName];

      if (baselineData && threshold) {
        const comparison = this.compareMetric(
          metricName,
          currentData.duration_ms,
          baselineData.duration_ms,
          threshold.critical_ms
        );
        
        console.log(comparison);
        
        if (comparison.includes('CRITICAL')) {
          hasCriticalIssues = true;
        } else if (comparison.includes('WARNING')) {
          hasWarnings = true;
        }
      }
    }

    console.log('\n=== Summary ===');
    if (hasCriticalIssues) {
      console.log('❌ Critical performance regressions detected');
      process.exit(1);
    } else if (hasWarnings) {
      console.log('⚠️  Performance warnings detected');
      process.exit(0);
    } else {
      console.log('✅ Performance stable or improved');
      process.exit(0);
    }
  }

  private saveBaseline(): void {
    try {
      writeFileSync(this.baselinePath, JSON.stringify(this.currentMetrics, null, 2), 'utf-8');
      console.log('✅ New baseline saved');
    } catch (error) {
      console.error('Failed to save baseline:', error);
    }
  }
}

// Main execution
const comparator = new PerformanceComparator();
comparator.compare();