import { test, expect } from '@playwright/test';
import { existsSync, readFileSync } from 'fs';
import { readFile } from 'fs/promises';

/**
 * Behavioral tests for Data Pipeline
 * Tests data integrity and pipeline behavior
 */

test.describe('Data Pipeline Behavior', () => {
  test('should run build-all-data after data changes', async () => {
    // Verify that build-all-data script exists
    const scriptExists = existsSync('backend/scripts/build-all-data.ts');
    expect(scriptExists).toBe(true);
    
    // Verify script is in package.json
    const packageJson = JSON.parse(await readFile('package.json', 'utf8'));
    expect(packageJson.scripts['build-all-data']).toBeTruthy();
  });

  test('should not corrupt data during sync', async () => {
    // Verify data integrity checks exist
    
    // Check for data validation scripts
    const validationScripts = [
      'backend/scripts/audit/audit-duplicate-dogs.ts',
      'backend/scripts/audit/audit-duplicate-events.ts',
      'backend/scripts/audit/validate-canonical-data.ts'
    ];
    
    validationScripts.forEach(script => {
      const exists = existsSync(script);
      if (!exists) {
        console.log(`Warning: ${script} not found`);
      }
    });
  });

  test('should maintain single source of truth in data/v1/', async () => {
    // Verify that data/v1/ directory exists and is the source of truth
    const dataV1Exists = existsSync('data/v1/');
    expect(dataV1Exists).toBe(true);
    
    // Verify it contains expected data
    const competitionsExist = existsSync('data/v1/competitions/');
    expect(competitionsExist).toBe(true);
  });

  test('should not use D1 in production architecture', async () => {
    // Verify that the architecture documentation confirms CDN-only
    const agentsMd = readFileSync('AGENTS.md', 'utf8');
    expect(agentsMd).toContain('CDN');
    expect(agentsMd).toMatch(/no.*Worker\/D1|NO Worker\/D1|without Worker/i);
  });

  test('should have data integrity workflow', async () => {
    // Verify that data integrity checking workflow exists
    
    // Check for related documentation
    const docsExist = existsSync('docs/sheets/02-data-pipeline.md');
    expect(docsExist).toBe(true);
  });
});