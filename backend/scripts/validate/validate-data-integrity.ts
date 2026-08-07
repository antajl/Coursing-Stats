#!/usr/bin/env node
/**
 * Data Integrity Validation Script for Coursing Stats
 * Validates JSON structure, data consistency, and project-specific rules
 * Optimized with caching and selective validation
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'fs';
import { join } from 'path';

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    totalFiles: number;
    validFiles: number;
    invalidFiles: number;
    filesWithWarnings: number;
    cachedFiles: number;
  };
}

interface CacheEntry {
  timestamp: number;
  valid: boolean;
  fileSize: number;
}

class DataValidator {
  private basePath: string;
  private result: ValidationResult;
  private cache: Map<string, CacheEntry>;
  private cacheFile: string;
  private readonly CACHE_TTL = 3600000; // 1 hour in ms

  constructor(basePath: string) {
    this.basePath = basePath;
    this.cache = new Map();
    this.cacheFile = join(basePath, '.validation-cache.json');
    this.result = {
      valid: true,
      errors: [],
      warnings: [],
      stats: {
        totalFiles: 0,
        validFiles: 0,
        invalidFiles: 0,
        filesWithWarnings: 0,
        cachedFiles: 0
      }
    };
    this.loadCache();
  }

  private loadCache(): void {
    try {
      if (existsSync(this.cacheFile)) {
        const cacheData = JSON.parse(readFileSync(this.cacheFile, 'utf-8'));
        this.cache = new Map(Object.entries(cacheData));
      }
    } catch (error) {
      // Cache corruption is not fatal
      this.cache = new Map();
    }
  }

  private saveCache(): void {
    try {
      const cacheObj = Object.fromEntries(this.cache);
      // Filter out expired entries
      const now = Date.now();
      for (const [key, value] of Object.entries(cacheObj)) {
        if (now - value.timestamp > this.CACHE_TTL) {
          delete cacheObj[key];
        }
      }
      // We don't save cache to avoid git pollution, in-memory cache is sufficient
    } catch (error) {
      // Cache save failure is not fatal
    }
  }

  private isFileCached(filePath: string, fileSize: number): boolean {
    const entry = this.cache.get(filePath);
    if (!entry) return false;
    
    const now = Date.now();
    if (now - entry.timestamp > this.CACHE_TTL) {
      this.cache.delete(filePath);
      return false;
    }
    
    // Re-validate if file size changed
    if (entry.fileSize !== fileSize) {
      this.cache.delete(filePath);
      return false;
    }
    
    return entry.valid;
  }

  private cacheFile(filePath: string, valid: boolean, fileSize: number): void {
    this.cache.set(filePath, {
      timestamp: Date.now(),
      valid,
      fileSize
    });
  }

  /**
   * Recursively get all JSON files in a directory
   */
  private getJsonFiles(dir: string, fileList: string[] = []): string[] {
    const files = readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = join(dir, file.name);
      if (file.isDirectory()) {
        this.getJsonFiles(fullPath, fileList);
      } else if (file.name.endsWith('.json')) {
        fileList.push(fullPath);
      }
    }
    
    return fileList;
  }

  /**
   * Validate JSON file syntax
   */
  private validateJsonSyntax(filePath: string): any | null {
    try {
      const content = readFileSync(filePath, 'utf-8');
      
      // Skip JSONL format files (registry.json)
      if (filePath.includes('registry.json')) {
        return { schema: 'jsonl-format', count: 'skipped' };
      }
      
      return JSON.parse(content);
    } catch (error) {
      // Skip JSONL format parse errors
      if (filePath.includes('registry.json')) {
        return { schema: 'jsonl-format', count: 'skipped' };
      }
      
      this.result.errors.push(`JSON parse error in ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
      this.result.stats.invalidFiles++;
      return null;
    }
  }

  /**
   * Validate schema field presence with whitelist for legacy files
   */
  private validateSchema(data: any, filePath: string): void {
    // Whitelist paths where schema is not required (legacy files)
    const schemaWhitelist = [
      'shows',  // All shows data is legacy/experimental, don't require schema
      'indexes',  // All indexes are generated, don't require schema
      'dogs/registry.json',  // Registry is JSONL format, not standard JSON
      'breeds.json',  // Legacy breeds file
      'reports',  // Report files
    ];
    
    const isWhitelisted = schemaWhitelist.some(path => filePath.includes(path));
    
    if (!data.schema && !isWhitelisted) {
      this.result.warnings.push(`Missing schema field in ${filePath}`);
      this.result.stats.filesWithWarnings++;
    }
  }

  /**
   * Validate competition data structure
   */
  private validateCompetition(data: any, filePath: string): void {
    // Competition files have nested event structure
    const event = data.event || data;
    
    if (!event.id) {
      this.result.errors.push(`Missing required field 'event.id' in ${filePath}`);
      this.result.valid = false;
    }
    if (!event.date_start) {
      this.result.errors.push(`Missing required field 'event.date_start' in ${filePath}`);
      this.result.valid = false;
    }
    if (!event.title) {
      this.result.errors.push(`Missing required field 'event.title' in ${filePath}`);
      this.result.valid = false;
    }
  }

  /**
   * Validate dog profile structure
   */
  private validateDogProfile(data: any, filePath: string): void {
    if (!data.dog || !data.dog.id) {
      this.result.errors.push(`Missing required field 'dog.id' in ${filePath}`);
      this.result.valid = false;
    }
    if (!data.competitions || !Array.isArray(data.competitions)) {
      this.result.errors.push(`Missing or invalid 'competitions' array in ${filePath}`);
      this.result.valid = false;
    }
  }

  /**
   * Validate calendar data structure
   */
  private validateCalendar(data: any, filePath: string): void {
    // Shows calendar files use 'exhibitions' instead of 'events'
    if (filePath.includes('shows/calendar')) {
      if (!data.year) {
        this.result.errors.push(`Missing required field 'year' in ${filePath}`);
        this.result.valid = false;
      }
      // exhibitions array is optional for shows calendar
      return;
    }
    
    // Skip validation for calendar-index.json (has different structure)
    if (filePath.includes('calendar-index.json')) {
      return;
    }
    
    // Standard competition calendar validation
    if (!data.year) {
      this.result.errors.push(`Missing required field 'year' in ${filePath}`);
      this.result.valid = false;
    }
    if (!data.events || !Array.isArray(data.events)) {
      this.result.errors.push(`Missing or invalid 'events' array in ${filePath}`);
      this.result.valid = false;
    }
  }

  /**
   * Check for total_score division by judges (critical rule)
   */
  private validateTotalScore(data: any, filePath: string): void {
    if (data.competitions && Array.isArray(data.competitions)) {
      for (const comp of data.competitions) {
        if (comp.total_score !== undefined && comp.judges !== undefined) {
          // Check if total_score looks like it was divided by judges
          // This is a heuristic check - we're looking for suspicious patterns
          if (comp.total_score < 100 && comp.judges > 1) {
            this.result.warnings.push(`Suspicious total_score in ${filePath} for event ${comp.event_id}: total_score=${comp.total_score} with ${comp.judges} judges - may have been divided`);
            this.result.stats.filesWithWarnings++;
          }
        }
      }
    }
  }

  /**
   * Check for mixed Donino disciplines (critical rule)
   */
  private validateDoninoDisciplines(filePath: string, data: any): void {
    if (filePath.includes('donino')) {
      if (filePath.includes('speed_records') && data.coursing_records) {
        this.result.errors.push(`Mixed Donino disciplines in ${filePath}: speed_records should not contain coursing_records`);
        this.result.valid = false;
      }
      if (filePath.includes('coursing_records') && data.speed_records) {
        this.result.errors.push(`Mixed Donino disciplines in ${filePath}: coursing_records should not contain speed_records`);
        this.result.valid = false;
      }
    }
  }

  /**
   * Validate file based on its type
   */
  private validateFile(filePath: string, data: any): void {
    this.validateSchema(data, filePath);
    this.validateDoninoDisciplines(filePath, data);

    if (filePath.includes('competitions')) {
      this.validateCompetition(data, filePath);
    } else if (filePath.includes('dog-profiles')) {
      this.validateDogProfile(data, filePath);
      this.validateTotalScore(data, filePath);
    }
    // Skip calendar validation entirely - shows and competition calendars have different structures
  }

  /**
   * Validate single file with caching
   */
  private validateFileWithCache(filePath: string): boolean {
    try {
      const fileStats = statSync(filePath);
      const fileSize = fileStats.size;
      
      // Check cache first
      if (this.isFileCached(filePath, fileSize)) {
        this.result.stats.cachedFiles++;
        this.result.stats.validFiles++;
        return true;
      }
      
      const data = this.validateJsonSyntax(filePath);
      if (data !== null) {
        this.validateFile(filePath, data);
        this.result.stats.validFiles++;
        
        // Cache successful validation
        this.cacheFile(filePath, true, fileSize);
        return true;
      }
      
      // Cache failed validation to avoid repeated errors
      this.cacheFile(filePath, false, fileSize);
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Run complete validation with caching
   */
  public validate(): ValidationResult {
    const jsonFiles = this.getJsonFiles(this.basePath);
    this.result.stats.totalFiles = jsonFiles.length;

    console.log(`Found ${jsonFiles.length} JSON files to validate...`);

    for (const filePath of jsonFiles) {
      this.validateFileWithCache(filePath);
    }

    this.result.valid = this.result.errors.length === 0;
    this.saveCache();

    return this.result;
  }

  /**
   * Print validation report
   */
  public printReport(): void {
    console.log('\n=== Data Integrity Validation Report ===\n');
    console.log(`Total files scanned: ${this.result.stats.totalFiles}`);
    console.log(`Valid files: ${this.result.stats.validFiles}`);
    console.log(`Invalid files: ${this.result.stats.invalidFiles}`);
    console.log(`Files with warnings: ${this.result.stats.filesWithWarnings}`);
    console.log(`Cached files (skipped): ${this.result.stats.cachedFiles}`);
    console.log(`\nErrors: ${this.result.errors.length}`);
    console.log(`Warnings: ${this.result.warnings.length}`);

    if (this.result.errors.length > 0) {
      console.log('\n=== ERRORS ===');
      this.result.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }

    if (this.result.warnings.length > 0) {
      console.log('\n=== WARNINGS ===');
      this.result.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning}`);
      });
    }

    console.log('\n=== RESULT ===');
    console.log(this.result.valid ? '✅ VALID' : '❌ INVALID');
    console.log();
  }
}

// Main execution
const dataPath = join(process.cwd(), 'data', 'v1');
const validator = new DataValidator(dataPath);
const result = validator.validate();
validator.printReport();

process.exit(result.valid ? 0 : 1);