# Documentation Link Checker Script (PowerShell)
# Checks all markdown files in docs/ for broken links

Write-Host "🔍 Checking documentation links..." -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# Check if markdown-link-check is installed
$mlcInstalled = yarn global list 2>&1 | Select-String "markdown-link-check"
if (-not $mlcInstalled) {
    Write-Host "⚠️  markdown-link-check not found. Installing..." -ForegroundColor Yellow
    yarn global add markdown-link-check
}

# Run link check on all markdown files
Write-Host "Checking docs/**/*.md..." -ForegroundColor Cyan
$exitCode = yarn run docs:check-links

# Check exit code
if ($exitCode -eq 0) {
    Write-Host "✅ All documentation links are valid!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "❌ Found broken documentation links!" -ForegroundColor Red
    exit 1
}