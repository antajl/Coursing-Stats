// Analyze callback handlers to find potential issues
const fs = require('fs');
const path = require('path');

const handlersPath = path.join(__dirname, 'src/handlers.ts');
const handlersContent = fs.readFileSync(handlersPath, 'utf-8');

console.log('=== Analyzing Callback Handlers ===\n');

// Extract all callback query handlers
const callbackPattern = /bot\.callbackQuery\(['"`](.*?)['"`], async \(ctx\) => \{([\s\S]*?)\n  \}\);/g;
let match;
const handlers = [];

while ((match = callbackPattern.exec(handlersContent)) !== null) {
  const pattern = match[1];
  const body = match[2];
  handlers.push({ pattern, body });
}

console.log(`Found ${handlers.length} callback handlers:\n`);

handlers.forEach((handler, index) => {
  console.log(`${index + 1}. Pattern: ${handler.pattern}`);
  
  // Check if handler calls editMessageText
  if (handler.body.includes('editMessageText')) {
    console.log('   ✅ Uses editMessageText');
  } else {
    console.log('   ⚠️  Does NOT use editMessageText');
  }
  
  // Check if handler has error handling
  if (handler.body.includes('try') && handler.body.includes('catch')) {
    console.log('   ✅ Has error handling');
  } else {
    console.log('   ⚠️  No error handling');
  }
  
  // Check if handler might have long-running operations
  if (handler.body.includes('await api.') || handler.body.includes('fetch')) {
    console.log('   ⚠️  Has async operations (might timeout)');
  }
  
  console.log('');
});

// Check for specific patterns that might cause issues
console.log('=== Potential Issues ===\n');

// Check for handlers that might not respond
const potentialIssues = handlers.filter(h => !h.body.includes('editMessageText') && !h.body.includes('reply'));
if (potentialIssues.length > 0) {
  console.log('⚠️  Handlers that might not send any response:');
  potentialIssues.forEach(h => console.log(`   - ${h.pattern}`));
} else {
  console.log('✅ All handlers appear to send responses');
}

// Check for very long handlers
const longHandlers = handlers.filter(h => h.body.length > 500);
if (longHandlers.length > 0) {
  console.log('⚠️  Very long handlers (might have complex logic):');
  longHandlers.forEach(h => console.log(`   - ${h.pattern} (${h.body.length} chars)`));
} else {
  console.log('✅ All handlers are reasonably sized');
}

console.log('\n=== Recommendations ===');
console.log('1. If handlers are complex, consider adding loading states');
console.log('2. Ensure all handlers call editMessageText or reply');
console.log('3. Check for API timeouts in Cloudflare Workers');
console.log('4. Verify webhook is properly configured');