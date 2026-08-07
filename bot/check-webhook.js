// Check webhook configuration and test bot connectivity
console.log('=== Webhook Configuration Check ===\n');

// This would require BOT_TOKEN to check actual webhook status
console.log('To check webhook status, you need:');
console.log('1. BOT_TOKEN from @BotFather');
console.log('2. Run: curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo');
console.log('');
console.log('To reset webhook:');
console.log('1. Delete webhook: curl https://api.telegram.org/bot<TOKEN>/deleteWebhook');
console.log('2. Set webhook again via /set-webhook endpoint');
console.log('');

console.log('=== Possible Issues ===');
console.log('1. Webhook might be pointing to wrong URL');
console.log('2. Webhook secret might not match');
console.log('3. Cloudflare Worker might not be receiving webhook updates');
console.log('4. Telegram might be caching old bot code');
console.log('');

console.log('=== Debugging Steps ===');
console.log('1. Check Cloudflare Workers logs for incoming webhook requests');
console.log('2. Test webhook health endpoint: https://coursing-stats-bot.antajltube.workers.dev/health');
console.log('3. Manually trigger webhook reset');
console.log('4. Test bot locally with webhook disabled (polling mode)');
console.log('');

console.log('=== Quick Test ===');
console.log('Testing Worker health endpoint...');

fetch('https://coursing-stats-bot.antajltube.workers.dev/health')
  .then(response => {
    console.log(`Health check status: ${response.status}`);
    if (response.ok) {
      return response.text();
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  })
  .then(text => {
    console.log(`Health check response: ${text}`);
    console.log('✅ Worker is running and accessible');
  })
  .catch(error => {
    console.log(`❌ Worker health check failed: ${error.message}`);
    console.log('This might indicate Cloudflare Workers deployment issue');
  });