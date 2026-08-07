// Debug script to check handlers.ts for callback query handling
import { readFileSync } from 'fs';
import { join } from 'path';

const handlersPath = join(__dirname, 'src/handlers.ts');
const handlersContent = readFileSync(handlersPath, 'utf-8');

console.log('=== Debug: Checking handlers.ts for callback query handling ===\n');

// Check for the middleware
const middlewareRegex = /bot\.use\(async \(ctx, next\) => \{[\s\S]*?if \(ctx\.callbackQuery\) \{[\s\S]*?await ctx\.answerCallbackQuery\(\);[\s\S]*?\}[\s\S]*?return next\(\);[\s\S]*?\}\);/;
const middlewareMatch = handlersContent.match(middlewareRegex);

if (middlewareMatch) {
  console.log('✅ Middleware found with answerCallbackQuery() enabled');
  console.log('✅ This should make buttons work correctly');
} else {
  console.log('❌ Middleware not found or answerCallbackQuery() is commented out');
  console.log('❌ This would cause buttons to not work');
}

// Check for commented out answerCallbackQuery calls
const commentedOutRegex = /\/\/ await ctx\.answerCallbackQuery/g;
const commentedOutMatches = handlersContent.match(commentedOutRegex);

if (commentedOutMatches) {
  console.log(`⚠️  Found ${commentedOutMatches.length} commented out answerCallbackQuery() calls`);
  commentedOutMatches.forEach((match, index) => {
    console.log(`   ${index + 1}. ${match}`);
  });
} else {
  console.log('✅ No commented out answerCallbackQuery() calls found');
}

// Check for callback query handlers
const callbackHandlers = (handlersContent.match(/bot\.callbackQuery\(/g) || []).length;
console.log(`✅ Found ${callbackHandlers} callback query handlers`);

console.log('\n=== Summary ===');
console.log('Middleware status:', middlewareMatch ? '✅ ENABLED' : '❌ DISABLED');
console.log('Commented calls:', commentedOutMatches ? '⚠️  FOUND' : '✅ NONE');
console.log('Callback handlers:', callbackHandlers);

if (middlewareMatch && !commentedOutMatches) {
  console.log('\n✅ Bot should work correctly - buttons should respond');
} else {
  console.log('\n❌ Bot has issues - buttons may not work');
}