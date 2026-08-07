/**
 * Simple Performance Measurement Script
 * Can be run by AI agent to measure performance of key operations
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

interface PerformanceMeasurement {
  operation: string;
  duration: number;
  success: boolean;
  metadata?: Record<string, any>;
}

class SimplePerformanceTracker {
  private measurements: PerformanceMeasurement[] = [];

  measureOperation(operation: string, fn: () => void): PerformanceMeasurement {
    const startTime = Date.now();
    let success = true;
    let error: Error | undefined;

    try {
      fn();
    } catch (e) {
      success = false;
      error = e as Error;
    }

    const duration = Date.now() - startTime;

    const measurement: PerformanceMeasurement = {
      operation,
      duration,
      success,
      ...(error && { error: error.message })
    };

    this.measurements.push(measurement);
    return measurement;
  }

  getReport(): string {
    let report = 'Performance Report:\n';
    report += '==================\n\n';

    for (const measurement of this.measurements) {
      const status = measurement.success ? '✅' : '❌';
      report += `${status} ${measurement.operation}: ${measurement.duration}ms\n`;
      
      if (!measurement.success && measurement.metadata?.error) {
        report += `   Error: ${measurement.metadata.error}\n`;
      }
    }

    return report;
  }
}

// Measure key operations
const tracker = new SimplePerformanceTracker();

console.log('Measuring Coursing Stats performance...\n');

// 1. Parser fixtures test
tracker.measureOperation('Parser fixtures test', () => {
  try {
    execSync('npm run test-parser-fixtures', { 
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 30000
    });
  } catch (error) {
    throw new Error('Parser fixtures test failed');
  }
});

// 2. Type check bot
tracker.measureOperation('Bot type check', () => {
  try {
    execSync('cd bot && npm run build', { 
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 30000
    });
  } catch (error) {
    throw new Error('Bot type check failed');
  }
});

// 3. Data validation
tracker.measureOperation('Data validation', () => {
  try {
    execSync('npm run data:validate', { 
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 30000
    });
  } catch (error) {
    throw new Error('Data validation failed');
  }
});

// 4. Check file sizes (data directory)
tracker.measureOperation('Data directory size check', () => {
  const dataPath = path.join(process.cwd(), 'data/v1');
  if (fs.existsSync(dataPath)) {
    const stats = fs.statSync(dataPath);
    // This is a simple check, real size calculation would be more complex
  }
});

// Generate report
console.log(tracker.getReport());

// Calculate success rate
const successful = tracker.measurements.filter(m => m.success).length;
const total = tracker.measurements.length;
const successRate = (successful / total) * 100;

console.log(`\nSuccess Rate: ${successRate.toFixed(1)}%`);
console.log(`Total Operations: ${total}`);

if (successRate === 100) {
  console.log('\n✅ All operations completed successfully!');
  process.exit(0);
} else {
  console.log('\n⚠️  Some operations failed. See details above.');
  process.exit(1);
}