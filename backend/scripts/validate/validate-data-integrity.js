#!/usr/bin/env node
/**
 * Data Integrity Validation Script for Coursing Stats
 * Validates JSON structure, data consistency, and project-specific rules
 */

const fs = require('fs');
const path = require('path');

class DataValidator {
  constructor(basePath) {
    this.basePath = basePath;
    this.result = {
      valid: true,
      errors: [],
      warnings: [],
      stats: {
        totalFiles: 0,
        validFiles: 0,
        invalidFiles: 0,
        filesWithWarnings: 0
      }
    };
  }

  /**
   * Recursively get all JSON files in a directory
   */
  getJsonFiles(dir, fileList = []) {
    try {
      const files = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const file of files) {
        const fullPath = path.join(dir, file.name);
        if (file.isDirectory()) {
          this.getJsonFiles(fullPath, fileList);
        } else if (file.name.endsWith('.json')) {
          fileList.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dir}:`, error.message);
    }
    
    return fileList;
  }

  /**
   * Validate JSON file syntax
   */
  validateJsonSyntax(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      this.result.errors.push(`JSON parse error in ${filePath}: ${error.message}`);
      this.result.stats.invalidFiles++;
      return null;
    }
  }

  /**
   * Validate schema field presence
   */
  validateSchema(data, filePath) {
    if (!data.schema) {
      this.result.warnings.push(`Missing schema field in ${filePath}`);
      this.result.stats.filesWithWarnings++;
    }
  }

  /**
   * Validate competition data structure
   */
  validateCompetition(data, filePath) {
    if (!data.id) {
      this.result.errors.push(`Missing required field 'id' in ${filePath}`);
      this.result.valid = false;
    }
    if (!data.date_start) {
      this.result.errors.push(`Missing required field 'date_start' in ${filePath}`);
      this.result.valid = false;
    }
    if (!data.title) {
      this.result.errors.push(`Missing required field 'title' in ${filePath}`);
      this.result.valid = false;
    }
  }

  /**
   * Validate dog profile structure
   */
  validateDogProfile(data, filePath) {
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
  validateCalendar(data, filePath) {
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
  validateTotalScore(data, filePath) {
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
  validateDoninoDisciplines(filePath, data) {
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
  validateFile(filePath, data) {
    this.validateSchema(data, filePath);
    this.validateDoninoDisciplines(filePath, data);

    if (filePath.includes('competitions')) {
      this.validateCompetition(data, filePath);
    } else if (filePath.includes('dog-profiles')) {
      this.validateDogProfile(data, filePath);
      this.validateTotalScore(data, filePath);
    } else if (filePath.includes('calendar')) {
      this.validateCalendar(data, filePath);
    }
  }

  /**
   * Run complete validation
   */
  validate() {
    const jsonFiles = this.getJsonFiles(this.basePath);
    this.result.stats.totalFiles = jsonFiles.length;

    console.log(`Found ${jsonFiles.length} JSON files to validate...`);

    for (const filePath of jsonFiles) {
      const data = this.validateJsonSyntax(filePath);
      if (data !== null) {
        this.validateFile(filePath, data);
        this.result.stats.validFiles++;
      }
    }

    this.result.valid = this.result.errors.length === 0;

    return this.result;
  }

  /**
   * Print validation report
   */
  printReport() {
    console.log('\n=== Data Integrity Validation Report ===\n');
    console.log(`Total files scanned: ${this.result.stats.totalFiles}`);
    console.log(`Valid files: ${this.result.stats.validFiles}`);
    console.log(`Invalid files: ${this.result.stats.invalidFiles}`);
    console.log(`Files with warnings: ${this.result.stats.filesWithWarnings}`);
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
const dataPath = path.join(process.cwd(), 'data', 'v1');
const validator = new DataValidator(dataPath);
const result = validator.validate();
validator.printReport();

process.exit(result.valid ? 0 : 1);