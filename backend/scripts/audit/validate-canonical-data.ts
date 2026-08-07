/**
 * Audit script для проверки канонических данных (data/v1/)
 * 
 * Usage: npx tsx backend/scripts/audit/validate-canonical-data.ts [--mode warn|error]
 * 
 * Проверяет:
 * - competition-v1 файлы на соответствие схеме
 * - dog-v1 файлы на соответствие схеме
 * - Сообщает о проблемах в данных
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CompetitionV1Schema,
  DogV1Schema,
  validateData,
  type ValidationMode,
} from '../../lib/validation/schemas';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const DATA_V1 = path.join(ROOT, 'data/v1');

function getValidationMode(): ValidationMode {
  const args = process.argv.slice(2);
  const modeIndex = args.indexOf('--mode');
  if (modeIndex >= 0 && args[modeIndex + 1]) {
    const mode = args[modeIndex + 1];
    if (mode === 'warn' || mode === 'error') {
      return mode;
    }
  }
  return 'warn'; // default
}

function findFiles(dir: string, pattern: RegExp): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findFiles(fullPath, pattern));
    } else if (entry.isFile() && pattern.test(entry.name)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function validateCompetition(filePath: string, mode: ValidationMode): { valid: boolean; errors: string[] } {
  try {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const result = validateData(CompetitionV1Schema, content, mode, filePath);
    return { valid: result.valid, errors: result.errors };
  } catch (error) {
    return { valid: false, errors: [`Failed to parse JSON: ${error}`] };
  }
}

function validateDog(filePath: string, mode: ValidationMode): { valid: boolean; errors: string[] } {
  try {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const result = validateData(DogV1Schema, content, mode, filePath);
    return { valid: result.valid, errors: result.errors };
  } catch (error) {
    return { valid: false, errors: [`Failed to parse JSON: ${error}`] };
  }
}

function main() {
  const mode = getValidationMode();
  console.log(`Validation mode: ${mode}`);
  console.log(`Data directory: ${DATA_V1}`);
  console.log();

  // Validate competitions
  console.log('=== Validating competitions ===');
  const competitionFiles = findFiles(path.join(DATA_V1, 'competitions'), /\.json$/);
  console.log(`Found ${competitionFiles.length} competition files`);
  
  let competitionValid = 0;
  let competitionInvalid = 0;
  const competitionErrors: string[] = [];

  for (const file of competitionFiles) {
    const result = validateCompetition(file, mode);
    if (result.valid) {
      competitionValid++;
    } else {
      competitionInvalid++;
      competitionErrors.push(...result.errors);
    }
  }

  console.log(`Valid: ${competitionValid}`);
  console.log(`Invalid: ${competitionInvalid}`);
  if (competitionErrors.length > 0) {
    console.log('Errors:');
    competitionErrors.slice(0, 10).forEach(err => console.log(`  - ${err}`));
    if (competitionErrors.length > 10) {
      console.log(`  ... and ${competitionErrors.length - 10} more errors`);
    }
  }
  console.log();

  // Validate dogs
  console.log('=== Validating dogs ===');
  const dogFiles = findFiles(path.join(DATA_V1, 'dogs/by-id'), /\.json$/);
  console.log(`Found ${dogFiles.length} dog files`);
  
  let dogValid = 0;
  let dogInvalid = 0;
  const dogErrors: string[] = [];

  for (const file of dogFiles) {
    const result = validateDog(file, mode);
    if (result.valid) {
      dogValid++;
    } else {
      dogInvalid++;
      dogErrors.push(...result.errors);
    }
  }

  console.log(`Valid: ${dogValid}`);
  console.log(`Invalid: ${dogInvalid}`);
  if (dogErrors.length > 0) {
    console.log('Errors:');
    dogErrors.slice(0, 10).forEach(err => console.log(`  - ${err}`));
    if (dogErrors.length > 10) {
      console.log(`  ... and ${dogErrors.length - 10} more errors`);
    }
  }
  console.log();

  // Summary
  console.log('=== Summary ===');
  const totalValid = competitionValid + dogValid;
  const totalInvalid = competitionInvalid + dogInvalid;
  const totalFiles = competitionFiles.length + dogFiles.length;
  
  console.log(`Total files: ${totalFiles}`);
  console.log(`Valid: ${totalValid} (${((totalValid / totalFiles) * 100).toFixed(1)}%)`);
  console.log(`Invalid: ${totalInvalid} (${((totalInvalid / totalFiles) * 100).toFixed(1)}%)`);
  
  if (mode === 'error' && totalInvalid > 0) {
    console.log();
    console.error('Validation failed! Fix the errors above.');
    process.exit(1);
  } else if (totalInvalid > 0) {
    console.log();
    console.warn('Validation completed with warnings. Use --mode error to fail on errors.');
  } else {
    console.log();
    console.log('All files passed validation!');
  }
}

main();
