// Check webhook status directly (requires BOT_TOKEN)
console.log('=== Webhook Diagnostic Tool ===\n');
console.log('');
console.log('To check webhook status, you need your BOT_TOKEN from @BotFather');
console.log('');
console.log('Run these commands in your terminal:');
console.log('');
console.log('# Check current webhook info:');
console.log('curl https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo');
console.log('');
console.log('# Delete current webhook:');
console.log('curl https://api.telegram.org/bot<YOUR_BOT_TOKEN>/deleteWebhook');
console.log('');
console.log('# Set webhook again (via our endpoint):');
console.log('curl "https://coursing-stats-bot.antajltube.workers.dev/set-webhook?secret=<YOUR_WEBHOOK_SECRET>"');
console.log('');
console.log('=== Alternative: Manual Webhook Reset ===');
console.log('');
console.log('1. Get your BOT_TOKEN from @BotFather');
console.log('2. Delete webhook: curl https://api.telegram.org/bot<TOKEN>/deleteWebhook');
console.log('3. Set webhook to our worker:');
console.log('   curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://coursing-stats-bot.antajltube.workers.dev/webhook&secret_token=<YOUR_SECRET>"');
console.log('');
console.log('=== Test Webhook Endpoint Directly ===');
console.log('');
console.log('You can test if the worker receives webhooks by sending a POST request:');
console.log('');
console.log('curl -X POST https://coursing-stats-bot.antajltube.workers.dev/webhook \\');
console.log('  -H "Content-Type: application/json" \\');
console.log('  -d \'{"update_id": 123, "message": {"message_id": 1, "from": {"id": 123, "first_name": "Test"}, "chat": {"id": 123, "type": "private"}, "text": "test"}}\'');
console.log('');
console.log('=== Quick Test ===');
console.log('');
console.log('Testing Worker webhook endpoint directly...');

fetch('https://coursing-stats-bot.antajltube.workers.dev/webhook', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    update_id: 999999,
    message: {
      message_id: 1,
      from: { id: 999999, first_name: 'Test' },
      chat: { id: 999999, type: 'private' },
      text: '/start'
    }
  })
})
  .then(response => {
    console.log(`Webhook test status: ${response.status}`);
    return response.text();
  })
  .then(text => {
    console.log(`Webhook test response: ${text}`);
    if (text === 'OK') {
      console.log('✅ Worker webhook endpoint is working');
    } else {
      console.log('⚠️  Unexpected response from webhook endpoint');
    }
  })
  .catch(error => {
    console.log(`❌ Webhook test failed: ${error.message}`);
  });