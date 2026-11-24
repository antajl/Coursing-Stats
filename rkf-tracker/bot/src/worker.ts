// Cloudflare Workers entry point for RKF Tracker Bot
import type { Update } from 'grammy/types';
import type { Env } from './types.js';
import { createBot } from './bot.js';
import { runBackgroundPolling } from './services/poller.js';
import { authenticateRkfUser } from './services/rkf-api.js';
import { getUser, saveUser, createDefaultUser } from './storage/index.js';

let cachedBot: ReturnType<typeof createBot> | null = null;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const rawToken = env.BOT_TOKEN || env.TELEGRAM_BOT_TOKEN;
    const token = rawToken ? rawToken.trim() : '';

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (!token) {
      return new Response('BOT_TOKEN is not configured', { status: 500 });
    }

    // Auth API endpoints for WebApp and Extension
    if (url.pathname === '/api/auth/login' && request.method === 'POST') {
      try {
        const body: any = await request.json();
        const email = String(body.email || '').trim();
        const password = String(body.password || '').trim();
        const userId = body.userId ? Number(body.userId) : null;

        if (!email || !password) {
          return new Response(JSON.stringify({ ok: false, error: 'Укажите E-mail и пароль' }), {
            status: 400,
            headers: { 'content-type': 'application/json', ...corsHeaders }
          });
        }

        const authRes = await authenticateRkfUser(email, password);
        if (!authRes.ok || !authRes.apikey) {
          return new Response(JSON.stringify({ ok: false, error: authRes.error || 'Неверный логин или пароль' }), {
            status: 401,
            headers: { 'content-type': 'application/json', ...corsHeaders }
          });
        }

        if (userId) {
          let user = (await getUser(env.KV_STORAGE, userId)) || createDefaultUser(userId, userId);
          user.rkfToken = authRes.apikey;
          user.linkedAt = new Date().toISOString();
          await saveUser(env.KV_STORAGE, user);
        }

        return new Response(JSON.stringify({ ok: true, apikey: authRes.apikey, userLinked: Boolean(userId) }), {
          status: 200,
          headers: { 'content-type': 'application/json', ...corsHeaders }
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ ok: false, error: err?.message || 'Ошибка сервера' }), {
          status: 500,
          headers: { 'content-type': 'application/json', ...corsHeaders }
        });
      }
    }

    if (url.pathname === '/api/auth/ticket' && request.method === 'POST') {
      try {
        const body: any = await request.json();
        const apikey = String(body.apikey || '').trim();
        if (!apikey || apikey.length < 10) {
          return new Response(JSON.stringify({ ok: false, error: 'Некорректный токен' }), {
            status: 400,
            headers: { 'content-type': 'application/json', ...corsHeaders }
          });
        }

        const ticket = 'tk_' + Math.random().toString(36).slice(2, 10);
        await env.KV_STORAGE.put(`pair:ticket:${ticket}`, apikey, { expirationTtl: 600 });
        const botName = env.BOT_USERNAME || 'coursing_stats_notify_bot';

        return new Response(JSON.stringify({
          ok: true,
          ticket,
          botUrl: `https://t.me/${botName}?start=bind_${ticket}`
        }), {
          status: 200,
          headers: { 'content-type': 'application/json', ...corsHeaders }
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ ok: false, error: err?.message || 'Ошибка генерации тикета' }), {
          status: 500,
          headers: { 'content-type': 'application/json', ...corsHeaders }
        });
      }
    }

    // Health check endpoint
    if (url.pathname === '/get-me') {
      const meRes = await fetch(`https://api.telegram.org/bot${token}/getMe`);
      const meData = await meRes.text();
      return new Response(meData, {
        status: meRes.status,
        headers: { 'content-type': 'application/json' }
      });
    }

    if (url.pathname === '/debug') {
      const lastUpdate = await env.KV_STORAGE.get('debug:last_update') || 'none';
      const lastError = await env.KV_STORAGE.get('debug:last_error') || 'none';
      const lastBotCatch = await env.KV_STORAGE.get('debug:last_bot_catch') || 'none';
      return new Response(JSON.stringify({ lastUpdate, lastError, lastBotCatch }, null, 2), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      });
    }

    if (url.pathname === '/health') {
      const botId = token.split(':')[0] || 'none';
      return new Response(JSON.stringify({ status: 'ok', worker: 'coursing-stats-tracker-bot', bot_id: botId }), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      });
    }

    // Webhook info endpoint
    if (url.pathname === '/webhook-info') {
      const infoRes = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
      const infoData = await infoRes.json();
      return new Response(JSON.stringify(infoData), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      });
    }

    // Webhook registration endpoint
    if (url.pathname === '/set-webhook') {
      const webhookUrl = `${url.origin}/webhook`;
      const whRes = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ['message', 'callback_query'],
          drop_pending_updates: true
        })
      });
      const whData: any = await whRes.json();

      // Register bot commands list in Telegram menu
      try {
        await fetch(`https://api.telegram.org/bot${token}/setMyCommands`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            commands: [
              { command: 'start', description: 'Главное меню' },
              { command: 'status', description: 'Статус мониторинга' },
              { command: 'apps', description: 'Список заявок и документов' },
              { command: 'ready', description: 'Готовые к выдаче дипломы' },
              { command: 'competitions', description: 'Отслеживание состязаний' },
              { command: 'track', description: 'Подписаться на состязание' },
              { command: 'auth', description: 'Привязать токен rkf.online' },
              { command: 'logout', description: 'Сбросить авторизацию' },
              { command: 'help', description: 'Справка и инструкция' }
            ]
          })
        });
      } catch (cmdErr) {
        console.error('[set-webhook] Failed to set bot commands:', cmdErr);
      }

      // Set native WebApp menu button
      try {
        const webAppUrl = env.WEBAPP_URL || 'https://my.coursing-stats.ru';
        await fetch(`https://api.telegram.org/bot${token}/setChatMenuButton`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            menu_button: {
              type: 'web_app',
              text: 'Кабинет',
              web_app: { url: webAppUrl }
            }
          })
        });
      } catch (menuErr) {
        console.error('[set-webhook] Failed to set menu button:', menuErr);
      }

      return new Response(JSON.stringify(whData), {
        status: whRes.ok ? 200 : 500,
        headers: { 'content-type': 'application/json' }
      });
    }

    // Telegram webhook handler
    if (request.method === 'POST' && (url.pathname === '/webhook' || url.pathname === '/')) {
      try {
        const update: Update = await request.json();
        try {
          await env.KV_STORAGE.put('debug:last_update', JSON.stringify(update), { expirationTtl: 3600 });
        } catch {}

        if (!cachedBot) {
          cachedBot = createBot(token, env);
          cachedBot.catch(async (err) => {
            const msg = `BotError: ${err.message || String(err.error)} | Update: ${err.ctx?.update?.update_id}`;
            console.error('[bot.catch]', msg);
            try {
              await env.KV_STORAGE.put('debug:last_bot_catch', msg, { expirationTtl: 3600 });
            } catch {}
          });
        }

        await cachedBot.handleUpdate(update);
        return new Response('OK', { status: 200 });
      } catch (err: any) {
        const errMsg = err?.message || String(err);
        console.error('[Webhook error]', err);
        try {
          await env.KV_STORAGE.put('debug:last_error', `${errMsg} | stack: ${err?.stack || ''}`, { expirationTtl: 3600 });
        } catch {}
        return new Response(JSON.stringify({
          error: errMsg,
          stack: err?.stack || ''
        }), {
          status: 200,
          headers: { 'content-type': 'application/json' }
        });
      }
    }

    return new Response('RKF Tracker Bot Worker is running', { status: 200 });
  },

  // Cloudflare Cron Trigger (Runs periodically)
  async scheduled(_event: any, env: Env): Promise<void> {
    console.log('[Cron] Starting scheduled RKF tracking cycle...');
    try {
      const stats = await runBackgroundPolling(env);
      console.log(`[Cron] Cycle complete. Checked users: ${stats.checkedUsers}, Alerts sent: ${stats.alertsSent}`);
    } catch (err) {
      console.error('[Cron] Poller cycle failure:', err);
    }
  }
};
