# Webhook Reset Guide

## Current Status

✅ Worker is running and accessible  
✅ Worker webhook endpoint responds correctly  
✅ Code fixes deployed (answerCallbackQuery enabled)  
✅ Debug logging added  
❌ Buttons still not working  

## Most Likely Cause: Webhook Configuration Issue

The problem is most likely that Telegram's webhook is not properly configured to send callback queries to our Worker, or there's a webhook secret mismatch.

## Steps to Fix

### 1. Get Your BOT_TOKEN
- Open @BotFather in Telegram
- Select your bot @coursing_stats_bot
- Copy the API token

### 2. Check Current Webhook Configuration
```bash
curl https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo
```

This will show you:
- Current webhook URL
- Whether webhook is set
- Any error messages

### 3. Delete Current Webhook
```bash
curl https://api.telegram.org/bot<YOUR_BOT_TOKEN>/deleteWebhook
```

### 4. Reset Webhook to Our Worker
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://coursing-stats-bot.antajltube.workers.dev/webhook"
```

If you have a webhook secret, add it:
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://coursing-stats-bot.antajltube.workers.dev/webhook&secret_token=<YOUR_SECRET>"
```

### 5. Test the Bot
After resetting webhook:
1. Send `/start` to @coursing_stats_bot
2. Try clicking buttons
3. Check if they work now

## Alternative: Use Our Set-Webhook Endpoint

Our Worker has a built-in webhook setup endpoint:
```
https://coursing-stats-bot.antajltube.workers.dev/set-webhook?secret=<YOUR_WEBHOOK_SECRET>
```

This automatically sets the webhook with the correct secret token.

## Debugging After Reset

If buttons still don't work after webhook reset:

### Check Cloudflare Logs
1. Go to https://dash.cloudflare.com/
2. Navigate to Workers & Pages → coursing-stats-bot → Logs
3. Look for our debug messages:
   - `📱 Callback query received: [data]`
   - `✅ Callback query answered: [data]`
   - `🏆 Ratings button pressed`
   - `📅 Calendar button pressed`

### If No Logs Appear
- Webhook is not receiving updates from Telegram
- Check webhook URL is correct
- Check webhook secret matches

### If Logs Show "received" but No "answered"
- Middleware might not be working
- Check code deployed correctly
- Verify Worker version updated

### If Logs Show Both "received" and "answered" but Buttons Still Don't Work
- Telegram client might be caching old responses
- Try restarting Telegram app
- Clear Telegram cache

## Current Configuration

From our wrangler.toml:
- Worker name: coursing-stats-bot
- Worker URL: https://coursing-stats-bot.antajltube.workers.dev
- Webhook endpoint: https://coursing-stats-bot.antajltube.workers.dev/webhook
- KV namespace: f8937ddcfdf241d69a6ef7704c98d2a4

## Expected Webhook Info

After proper setup, `getWebhookInfo` should show:
```json
{
  "url": "https://coursing-stats-bot.antajltube.workers.dev/webhook",
  "has_custom_certificate": false,
  "pending_update_count": 0,
  "last_error_date": null,
  "last_error_message": null
}
```

## Quick Reset Script

If you have BOT_TOKEN and WEBHOOK_SECRET:
```bash
BOT_TOKEN="your_bot_token_here"
WEBHOOK_SECRET="your_webhook_secret_here"

# Delete webhook
curl https://api.telegram.org/bot$BOT_TOKEN/deleteWebhook

# Set webhook with secret
curl -X POST "https://api.telegram.org/bot$BOT_TOKEN/setWebhook?url=https://coursing-stats-bot.antajltube.workers.dev/webhook&secret_token=$WEBHOOK_SECRET"

# Verify
curl https://api.telegram.org/bot$BOT_TOKEN/getWebhookInfo
```

Please run these steps and let me know what the webhook info shows!