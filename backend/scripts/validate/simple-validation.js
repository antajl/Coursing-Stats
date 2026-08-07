#!/usr/bin/env node
/**
 * Simple Data Integrity Validation for Coursing Stats
 */

const fs = require('fs');
const path = require('path');

console.log('=== Data Integrity Validation for Coursing Stats ===\n');

const dataPath = path.join(process.cwd(), 'data', 'v1');
let totalFiles = 0;
let validFiles = 0;
let invalidFiles = 0;
let warnings = [];

function validateJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    JSON.parse(content);
    return true;
  } catch (error) {
    console.log(`❌ Invalid JSON: ${path.basename(filePath)} - ${error.message}`);
    return false;
  }
}

function validateDoninoFiles() {
  console.log('\n--- Validating Donino Files ---');
  
  const speedRecordsPath = path.join(dataPath, 'donino', 'speed_records.json');
  const coursingRecordsPath = path.join(dataPath, 'donino', 'coursing_records.json');
  
  try {
    const speedData = JSON.parse(fs.readFileSync(speedRecordsPath, 'utf-8'));
    const coursingData = JSON.parse(fs.readFileSync(coursingRecordsPath, 'utf-8'));
    
    // Check schemas
    if (speedData.schema === 'coursing-stats/donino-speed-v1') {
      console.log('✅ speed_records.json has correct schema');
    } else {
      console.log('⚠️  speed_records.json has unexpected schema');
      warnings.push('speed_records.json schema mismatch');
    }
    
    if (coursingData.schema === 'coursing-stats/donino-coursing-v1') {
      console.log('✅ coursing_records.json has correct schema');
    } else {
      console.log('⚠️  coursing_records.json has unexpected schema');
      warnings.push('coursing_records.json schema mismatch');
    }
    
    // Check for mixed disciplines
    if (speedData.coursing_records) {
      console.log('❌ ERROR: speed_records.json contains coursing_records data (mixed disciplines)');
      invalidFiles++;
    }
    
    if (coursingData.speed_records) {
      console.log('❌ ERROR: coursing_records.json contains speed_records data (mixed disciplines)');
      invalidFiles++;
    }
    
    // Check record counts
    console.log(`📊 Speed records: ${speedData.count}`);
    console.log(`📊 Coursing records: ${coursingData.count}`);
    
  } catch (error) {
    console.log(`❌ Error reading Donino files: ${error.message}`);
    invalidFiles++;
  }
}

function validateCalendarFiles() {
  console.log('\n--- Validating Calendar Files ---');
  
  const calendarPath = path.join(dataPath, 'calendar');
  if (!fs.existsSync(calendarPath)) {
    console.log('⚠️  Calendar directory not found');
    return;
  }
  
  const years = fs.readdirSync(calendarPath);
  console.log(`📁 Found ${years.length} calendar files`);
  
  for (const yearFile of years) {
    const filePath = path.join(calendarPath, yearFile);
    if (path.extname(yearFile) === '.json') {
      totalFiles++;
      if (validateJsonFile(filePath)) {
        validFiles++;
        try {
          const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          if (data.year && data.events && Array.isArray(data.events)) {
            console.log(`✅ ${yearFile}: ${data.events.length} events`);
          } else {
            console.log(`⚠️  ${yearFile}: missing required fields`);
            warnings.push(`${yearFile} missing required fields`);
          }
        } catch (error) {
          console.log(`❌ ${yearFile}: ${error.message}`);
          invalidFiles++;
        }
      } else {
        invalidFiles++;
      }
    }
  }
}

function validateCompetitionFiles() {
  console.log('\n--- Validating Competition Files ---');
  
  const competitionsPath = path.join(dataPath, 'competitions');
  if (!fs.existsSync(competitionsPath)) {
    console.log('⚠️  Competitions directory not found');
    return;
  }
  
  let competitionCount = 0;
  
  function scanDirectory(dir) {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        scanDirectory(fullPath);
      } else if (item.name.endsWith('.json')) {
        competitionCount++;
        totalFiles++;
        if (validateJsonFile(fullPath)) {
          validFiles++;
          try {
            const data = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
            if (data.event && data.event.id && data.results) {
              // Valid structure
            } else {
              console.log(`⚠️  ${item.name}: missing required fields`);
              warnings.push(`${item.name} missing required fields`);
            }
          } catch (error) {
            console.log(`❌ ${item.name}: ${error.message}`);
            invalidFiles++;
          }
        } else {
          invalidFiles++;
        }
      }
    }
  }
  
  scanDirectory(competitionsPath);
  console.log(`📁 Found ${competitionCount} competition files`);
}

function validateDogProfiles() {
  console.log('\n--- Validating Dog Profiles ---');
  
  const dogProfilesPath = path.join(dataPath, 'indexes', 'dog-profiles');
  if (!fs.existsSync(dogProfilesPath)) {
    console.log('⚠️  Dog profiles directory not found');
    return;
  }
  
  const profiles = fs.readdirSync(dogProfilesPath);
  console.log(`📁 Found ${profiles.length} dog profile files`);
  
  for (const profileFile of profiles) {
    const filePath = path.join(dogProfilesPath, profileFile);
    if (path.extname(profileFile) === '.json') {
      totalFiles++;
      if (validateJsonFile(filePath)) {
        validFiles++;
        try {
          const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          if (data.dog && data.dog.id && data.competitions) {
            // Check for total_score division issues
            if (data.competitions && Array.isArray(data.competitions)) {
              for (const comp of data.competitions) {
                if (comp.total_score !== undefined && comp.judges !== undefined) {
                  if (comp.total_score < 100 && comp.judges > 1) {
                    console.log(`⚠️  ${profileFile}: Suspicious total_score for event ${comp.event_id}`);
                    warnings.push(`${profileFile} possible total_score division`);
                  }
                }
              }
            }
          } else {
            console.log(`⚠️  ${profileFile}: missing required fields`);
            warnings.push(`${profileFile} missing required fields`);
          }
        } catch (error) {
          console.log(`❌ ${profileFile}: ${error.message}`);
          invalidFiles++;
        }
      } else {
        invalidFiles++;
      }
    }
  }
}

// Run validations
console.log('Starting validation...\n');

validateDoninoFiles();
validateCalendarFiles();
validateCompetitionFiles();
validateDogProfiles();

// Summary
console.log('\n=== VALIDATION SUMMARY ===');
console.log(`Total files scanned: ${totalFiles}`);
console.log(`Valid files: ${validFiles}`);
console.log(`Invalid files: ${invalidFiles}`);
console.log(`Warnings: ${warnings.length}`);

if (warnings.length > 0) {
  console.log('\n⚠️  WARNINGS:');
  warnings.forEach(w => console.log(`  - ${w}`));
}

console.log('\n=== RESULT ===');
if (invalidFiles === 0 && warnings.length === 0) {
  console.log('✅ ALL CHECKS PASSED');
  process.exit(0);
} else if (invalidFiles === 0) {
  console.log('✅ VALID (with warnings)');
  process.exit(0);
} else {
  console.log('❌ INVALID - Errors found');
  process.exit(1);
}