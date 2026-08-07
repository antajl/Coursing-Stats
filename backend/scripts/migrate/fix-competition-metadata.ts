#!/usr/bin/env node
/**
 * Automatic Competition Metadata Fix Script
 * Fixes missing id, date_start, and title fields in competition JSON files
 * by extracting information from filenames and file content
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

interface CompetitionData {
  id?: string;
  date_start?: string;
  title?: string;
  [key: string]: any;
}

class CompetitionMetadataFixer {
  private basePath: string;
  private fixedFiles: number;
  private errors: number;

  constructor(basePath: string) {
    this.basePath = basePath;
    this.fixedFiles = 0;
    this.errors = 0;
  }

  /**
   * Extract date from filename pattern: YYYYMMDD--DDMMYYYY-.json or YYYYMMDD-title.json
   */
  private extractDateFromFilename(filename: string): string | null {
    // Pattern: YYYYMMDD--DDMMYYYY-.json
    const dashPattern = /(\d{4})(\d{2})(\d{2})--(\d{2})(\d{2})(\d{4})-/;
    const dashMatch = filename.match(dashPattern);
    if (dashMatch) {
      const year = dashMatch[1];
      const month = dashMatch[2];
      const day = dashMatch[3];
      return `${year}-${month}-${day}`;
    }

    // Pattern: YYYYMMDD-title.json
    const simplePattern = /^(\d{4})(\d{2})(\d{2})-/;
    const simpleMatch = filename.match(simplePattern);
    if (simpleMatch) {
      const year = simpleMatch[1];
      const month = simpleMatch[2];
      const day = simpleMatch[3];
      return `${year}-${month}-${day}`;
    }

    return null;
  }

  /**
   * Extract title from filename
   */
  private extractTitleFromFilename(filename: string): string {
    // Remove date patterns and extension
    let title = filename
      .replace(/^\d{8}--\d{8}-/, '')
      .replace(/^\d{8}-/, '')
      .replace(/\.json$/, '')
      .replace(/-/g, ' ');
    
    // Capitalize first letter
    if (title.length > 0) {
      title = title.charAt(0).toUpperCase() + title.slice(1);
    }
    
    return title || 'Untitled Competition';
  }

  /**
   * Generate ID from filename
   */
  private generateId(filename: string): string {
    // Use filename without extension as ID
    return filename.replace(/\.json$/, '');
  }

  /**
   * Fix single competition file
   */
  private fixCompetitionFile(filePath: string, filename: string): boolean {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const data: CompetitionData = JSON.parse(content);

      let needsFix = false;

      // Fix missing id
      if (!data.id) {
        data.id = this.generateId(filename);
        needsFix = true;
        console.log(`  Added id: ${data.id}`);
      }

      // Fix missing date_start
      if (!data.date_start) {
        const extractedDate = this.extractDateFromFilename(filename);
        if (extractedDate) {
          data.date_start = extractedDate;
          needsFix = true;
          console.log(`  Added date_start: ${data.date_start}`);
        }
      }

      // Fix missing title
      if (!data.title) {
        data.title = this.extractTitleFromFilename(filename);
        needsFix = true;
        console.log(`  Added title: ${data.title}`);
      }

      if (needsFix) {
        writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
        this.fixedFiles++;
        return true;
      }

      return false;
    } catch (error) {
      console.error(`Error fixing ${filePath}:`, error);
      this.errors++;
      return false;
    }
  }

  /**
   * Recursively find and fix competition files
   */
  private fixCompetitionFiles(dir: string): void {
    const files = readdirSync(dir, { withFileTypes: true });

    for (const file of files) {
      const fullPath = join(dir, file.name);

      if (file.isDirectory()) {
        // Only process competition directories
        if (fullPath.includes('competitions')) {
          this.fixCompetitionFiles(fullPath);
        }
      } else if (file.name.endsWith('.json') && fullPath.includes('competitions')) {
        console.log(`Checking: ${fullPath}`);
        this.fixCompetitionFile(fullPath, file.name);
      }
    }
  }

  /**
   * Run the fix process
   */
  public fix(): void {
    console.log('Starting competition metadata fix...\n');
    
    const competitionsPath = join(this.basePath, 'competitions');
    this.fixCompetitionFiles(competitionsPath);

    console.log('\n=== Fix Summary ===');
    console.log(`Files fixed: ${this.fixedFiles}`);
    console.log(`Errors encountered: ${this.errors}`);
    
    if (this.fixedFiles > 0) {
      console.log('\n✅ Metadata fix completed successfully');
    } else {
      console.log('\nℹ️  No files needed fixing');
    }
  }
}

// Main execution
const dataPath = join(process.cwd(), 'data', 'v1');
const fixer = new CompetitionMetadataFixer(dataPath);
fixer.fix();