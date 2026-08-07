#!/bin/bash

# Documentation Link Checker Script
# Checks all markdown files in docs/ for broken links

echo "🔍 Checking documentation links..."
echo "=================================="

# Check if markdown-link-check is installed
if ! command -v markdown-link-check &> /dev/null; then
    echo "⚠️  markdown-link-check not found. Installing..."
    yarn global add markdown-link-check
fi

# Run link check on all markdown files
echo "Checking docs/**/*.md..."
npx markdown-link-check docs/**/*.md --config .markdown-link-check.json

# Check exit code
if [ $? -eq 0 ]; then
    echo "✅ All documentation links are valid!"
    exit 0
else
    echo "❌ Found broken documentation links!"
    exit 1
fi
