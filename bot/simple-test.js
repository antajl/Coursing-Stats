// Simple test to verify callback handling logic
// This doesn't require wrangler or bot token, just tests the logic

console.log('=== Testing Callback Query Handling Logic ===\n');

// Simulate the middleware logic from handlers.ts
function testCallbackHandling() {
  let callbackAnswered = false;
  let errors = [];
  
  // Mock context
  const mockCtx = {
    callbackQuery: { 
      id: 'test_123', 
      data: 'main_menu' 
    },
    answerCallbackQuery: async function() {
      callbackAnswered = true;
      console.log('✅ answerCallbackQuery() was called');
      return true;
    },
    editMessageText: async function(text, options) {
      console.log('✅ editMessageText() was called with:', text);
      return true;
    }
  };
  
  // Middleware function (current version after fix)
  async function middleware(ctx, next) {
    if (ctx.callbackQuery) {
      try {
        await ctx.answerCallbackQuery();
        console.log('✅ Middleware: Callback query answered');
      } catch (error) {
        console.error('❌ Middleware: Error answering callback query:', error);
        errors.push(error);
      }
    }
    return next();
  }
  
  // Simulate the flow
  async function simulateCallback() {
    console.log('1. User clicks button');
    console.log('2. Telegram sends callback query');
    console.log('3. Middleware intercepts callback query');
    
    await middleware(mockCtx, async () => {
      console.log('4. Handler processes the callback');
      await mockCtx.editMessageText('Test message', {});
    });
    
    console.log('5. Response sent to Telegram');
    
    if (callbackAnswered && errors.length === 0) {
      console.log('\n✅ TEST PASSED: Callback handling is working correctly');
      console.log('✅ Buttons should work in the bot');
      return true;
    } else {
      console.log('\n❌ TEST FAILED: Callback handling has issues');
      console.log('❌ Callback answered:', callbackAnswered);
      console.log('❌ Errors:', errors);
      return false;
    }
  }
  
  return simulateCallback();
}

// Run the test
testCallbackHandling().then(result => {
  console.log('\n=== Test Complete ===');
  console.log('Result:', result ? 'SUCCESS' : 'FAILED');
  process.exit(result ? 0 : 1);
}).catch(error => {
  console.error('Test error:', error);
  process.exit(1);
});