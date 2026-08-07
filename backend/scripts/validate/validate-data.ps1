# Data Integrity Validation Script for Coursing Stats
# PowerShell version for Windows compatibility

Write-Host "=== Data Integrity Validation for Coursing Stats ===" -ForegroundColor Cyan
Write-Host ""

$dataPath = Join-Path $PSScriptRoot "..\..\..\data\v1"
$totalFiles = 0
$validFiles = 0
$invalidFiles = 0
$warnings = @()

function Test-JsonFile {
    param([string]$filePath)
    try {
        $content = Get-Content $filePath -Raw -Encoding UTF8
        $null = $content | ConvertFrom-Json
        return $true
    } catch {
        Write-Host "❌ Invalid JSON: $(Split-Path $filePath -Leaf) - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Validate Donino files
Write-Host "--- Validating Donino Files ---" -ForegroundColor Yellow

$speedRecordsPath = Join-Path $dataPath "donino\speed_records.json"
$coursingRecordsPath = Join-Path $dataPath "donino\coursing_records.json"

if (Test-Path $speedRecordsPath) {
    try {
        $speedData = Get-Content $speedRecordsPath -Raw -Encoding UTF8 | ConvertFrom-Json
        if ($speedData.schema -eq "coursing-stats/donino-speed-v1") {
            Write-Host "✅ speed_records.json has correct schema" -ForegroundColor Green
        } else {
            Write-Host "⚠️  speed_records.json has unexpected schema" -ForegroundColor Yellow
            $warnings += "speed_records.json schema mismatch"
        }
        
        if ($speedData.coursing_records) {
            Write-Host "❌ ERROR: speed_records.json contains coursing_records data (mixed disciplines)" -ForegroundColor Red
            $invalidFiles++
        }
        
        Write-Host "📊 Speed records: $($speedData.count)" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ Error reading speed_records.json: $($_.Exception.Message)" -ForegroundColor Red
        $invalidFiles++
    }
} else {
    Write-Host "⚠️  speed_records.json not found" -ForegroundColor Yellow
}

if (Test-Path $coursingRecordsPath) {
    try {
        $coursingData = Get-Content $coursingRecordsPath -Raw -Encoding UTF8 | ConvertFrom-Json
        if ($coursingData.schema -eq "coursing-stats/donino-coursing-v1") {
            Write-Host "✅ coursing_records.json has correct schema" -ForegroundColor Green
        } else {
            Write-Host "⚠️  coursing_records.json has unexpected schema" -ForegroundColor Yellow
            $warnings += "coursing_records.json schema mismatch"
        }
        
        if ($coursingData.speed_records) {
            Write-Host "❌ ERROR: coursing_records.json contains speed_records data (mixed disciplines)" -ForegroundColor Red
            $invalidFiles++
        }
        
        Write-Host "📊 Coursing records: $($coursingData.count)" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ Error reading coursing_records.json: $($_.Exception.Message)" -ForegroundColor Red
        $invalidFiles++
    }
} else {
    Write-Host "⚠️  coursing_records.json not found" -ForegroundColor Yellow
}

# Validate breeds.json
Write-Host ""
Write-Host "--- Validating Breeds File ---" -ForegroundColor Yellow

$breedsPath = Join-Path $dataPath "breeds.json"
if (Test-Path $breedsPath) {
    $totalFiles++
    if (Test-JsonFile $breedsPath) {
        $validFiles++
        try {
            $breedsData = Get-Content $breedsPath -Raw -Encoding UTF8 | ConvertFrom-Json
            Write-Host "📊 Breeds count: $($breedsData.count)" -ForegroundColor Cyan
        } catch {
            Write-Host "❌ Error parsing breeds.json: $($_.Exception.Message)" -ForegroundColor Red
            $invalidFiles++
        }
    } else {
        $invalidFiles++
    }
} else {
    Write-Host "⚠️  breeds.json not found" -ForegroundColor Yellow
}

# Validate calendar files
Write-Host ""
Write-Host "--- Validating Calendar Files ---" -ForegroundColor Yellow

$calendarPath = Join-Path $dataPath "calendar"
if (Test-Path $calendarPath) {
    $calendarFiles = Get-ChildItem $calendarPath -Filter "*.json"
    Write-Host "📁 Found $($calendarFiles.Count) calendar files" -ForegroundColor Cyan
    
    foreach ($file in $calendarFiles) {
        $totalFiles++
        if (Test-JsonFile $file.FullName) {
            $validFiles++
            try {
                $data = Get-Content $file.FullName -Raw -Encoding UTF8 | ConvertFrom-Json
                if ($data.year -and $data.events -and $data.events -is [array]) {
                    Write-Host "✅ $($file.Name): $($data.events.Count) events" -ForegroundColor Green
                } else {
                    Write-Host "⚠️  $($file.Name): missing required fields" -ForegroundColor Yellow
                    $warnings += "$($file.Name) missing required fields"
                }
            } catch {
                Write-Host "❌ $($file.Name): $($_.Exception.Message)" -ForegroundColor Red
                $invalidFiles++
            }
        } else {
            $invalidFiles++
        }
    }
} else {
    Write-Host "⚠️  Calendar directory not found" -ForegroundColor Yellow
}

# Validate competition files (sample)
Write-Host ""
Write-Host "--- Validating Competition Files (Sample) ---" -ForegroundColor Yellow

$competitionsPath = Join-Path $dataPath "competitions"
if (Test-Path $competitionsPath) {
    $competitionFiles = Get-ChildItem $competitionsPath -Recurse -Filter "*.json" | Select-Object -First 10
    Write-Host "📁 Sampling $($competitionFiles.Count) competition files" -ForegroundColor Cyan
    
    foreach ($file in $competitionFiles) {
        $totalFiles++
        if (Test-JsonFile $file.FullName) {
            $validFiles++
            try {
                $data = Get-Content $file.FullName -Raw -Encoding UTF8 | ConvertFrom-Json
                if ($data.event -and $data.event.id -and $data.results) {
                    # Valid structure
                } else {
                    Write-Host "⚠️  $($file.Name): missing required fields" -ForegroundColor Yellow
                    $warnings += "$($file.Name) missing required fields"
                }
            } catch {
                Write-Host "❌ $($file.Name): $($_.Exception.Message)" -ForegroundColor Red
                $invalidFiles++
            }
        } else {
            $invalidFiles++
        }
    }
} else {
    Write-Host "⚠️  Competitions directory not found" -ForegroundColor Yellow
}

# Validate dog profiles (sample)
Write-Host ""
Write-Host "--- Validating Dog Profiles (Sample) ---" -ForegroundColor Yellow

$dogProfilesPath = Join-Path $dataPath "indexes\dog-profiles"
if (Test-Path $dogProfilesPath) {
    $profileFiles = Get-ChildItem $dogProfilesPath -Filter "*.json" | Select-Object -First 10
    Write-Host "📁 Sampling $($profileFiles.Count) dog profile files" -ForegroundColor Cyan
    
    foreach ($file in $profileFiles) {
        $totalFiles++
        if (Test-JsonFile $file.FullName) {
            $validFiles++
            try {
                $data = Get-Content $file.FullName -Raw -Encoding UTF8 | ConvertFrom-Json
                if ($data.dog -and $data.dog.id -and $data.competitions) {
                    # Check for total_score division issues
                    foreach ($comp in $data.competitions) {
                        if ($comp.total_score -and $comp.judges) {
                            if ($comp.total_score -lt 100 -and $comp.judges -gt 1) {
                                Write-Host "⚠️  $($file.Name): Suspicious total_score for event $($comp.event_id)" -ForegroundColor Yellow
                                $warnings += "$($file.Name) possible total_score division"
                            }
                        }
                    }
                } else {
                    Write-Host "⚠️  $($file.Name): missing required fields" -ForegroundColor Yellow
                    $warnings += "$($file.Name) missing required fields"
                }
            } catch {
                Write-Host "❌ $($file.Name): $($_.Exception.Message)" -ForegroundColor Red
                $invalidFiles++
            }
        } else {
            $invalidFiles++
        }
    }
} else {
    Write-Host "⚠️  Dog profiles directory not found" -ForegroundColor Yellow
}

# Validate index files
Write-Host ""
Write-Host "--- Validating Index Files ---" -ForegroundColor Yellow

$indexPath = Join-Path $dataPath "indexes"
if (Test-Path $indexPath) {
    $indexFiles = Get-ChildItem $indexPath -Filter "*.json" | Where-Object { $_.Name -notlike "dog-profiles*" }
    Write-Host "📁 Found $($indexFiles.Count) index files" -ForegroundColor Cyan
    
    foreach ($file in $indexFiles) {
        $totalFiles++
        if (Test-JsonFile $file.FullName) {
            $validFiles++
        } else {
            $invalidFiles++
        }
    }
} else {
    Write-Host "⚠️  Indexes directory not found" -ForegroundColor Yellow
}

# Summary
Write-Host ""
Write-Host "=== VALIDATION SUMMARY ===" -ForegroundColor Cyan
Write-Host "Total files scanned: $totalFiles"
Write-Host "Valid files: $validFiles"
Write-Host "Invalid files: $invalidFiles"
Write-Host "Warnings: $($warnings.Count)"

if ($warnings.Count -gt 0) {
    Write-Host ""
    Write-Host "⚠️  WARNINGS:" -ForegroundColor Yellow
    foreach ($warning in $warnings) {
        Write-Host "  - $warning" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=== RESULT ===" -ForegroundColor Cyan
if ($invalidFiles -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "✅ ALL CHECKS PASSED" -ForegroundColor Green
    exit 0
} elseif ($invalidFiles -eq 0) {
    Write-Host "✅ VALID (with warnings)" -ForegroundColor Green
    exit 0
} else {
    Write-Host "❌ INVALID - Errors found" -ForegroundColor Red
    exit 1
}