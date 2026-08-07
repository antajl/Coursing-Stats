# Debug Instructions for Telegram Bot Button Issues

## What I've Done

1. **Fixed the main issue**: Enabled `answerCallbackQuery()` in middleware (line 48)
2. **Added debug logging**: Added console.log statements to track callback queries
3. **Deployed changes**: Pushed to GitHub, auto-deploying via GitHub Actions

## Debug Logging Added

The bot now logs:
- `📱 Callback query received: [data]` - when a button is pressed
- `✅ Callback query answered: [data]` - when callback is acknowledged
- `🏆 Ratings button pressed` - specific button handlers
- `📅 Calendar button pressed` - specific button handlers

## How to Check Logs

### 1. Wait for Deployment
GitHub Actions is deploying the bot now. Wait ~1-2 minutes for completion.

### 2. Access Cloudflare Dashboard
1. Go to https://dash.cloudflare.com/
2. Select your account
3. Navigate to **Workers & Pages**
4. Click on **coursing-stats-bot**
5. Go to **Logs** tab

### 3. Test the Bot
1. Open Telegram bot: @coursing_stats_bot
2. Send `/start`
3. Click on different buttons (Ratings, Calendar, etc.)

### 4. Check Logs
In Cloudflare Logs, look for:
- `📱 Callback query received` - confirms button presses are reaching the Worker
- `✅ Callback query answered` - confirms the Worker is responding
- `🏆 Ratings button pressed` - confirms specific handlers are triggered

## Possible Scenarios

### Scenario 1: No logs appear
**Problem**: Callback queries aren't reaching the Worker
**Solution**: 
- Check webhook configuration
- Verify webhook URL is correct
- Check webhook secret matches

### Scenario 2: Logs show "received" but no "answered"
**Problem**: Middleware isn't working
**Solution**: 
- Check if code deployed correctly
- Verify Worker version updated

### Scenario 3: Logs show both "received" and "answered" but buttons still don't work
**Problem**: Telegram client issue or webhook secret mismatch
**Solution**:
- Try restarting Telegram app
- Check webhook secret in Cloudflare secrets
- Reset webhook via `/set-webhook` endpoint

## Quick Test Commands

Once deployed, test these commands:
1. `/start` - should show main menu
2. Click "Рейтинг собак" - should load ratings
3. Click "Календарь" - should load calendar
4. Click "Назад" - should return to previous screen
5. Click "На главную" - should return to main menu

## If Still Not Working

If buttons still don't work after checking logs:

1. **Reset Webhook**:
   ```bash
   # Delete current webhook
   curl https://api.telegram.org/bot<TOKEN>/deleteWebhook
   
   # Set webhook again (use /set-webhook endpoint)
   ```

2. **Check Webhook Info**:
   ```bash
   curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo
   ```

3. **Test Polling Mode** (temporarily disable webhook):
   - Comment out webhook setup in worker.ts
   - Deploy and test with long polling

4. **Check Cloudflare Secrets**:
   - Verify BOT_TOKEN is set correctly
   - Verify WEBHOOK_SECRET matches between Cloudflare and Telegram

## Current Status

- ✅ Code fix applied (answerCallbackQuery enabled)
- ✅ Debug logging added
- ✅ Changes deployed to GitHub
- ⏳ Waiting for Cloudflare deployment via GitHub Actions
- ⏳ Need to test and check logs