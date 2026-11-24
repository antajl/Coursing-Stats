// Cloudflare Workers entry point for RKF Tracker Bot
import type { Update } from 'grammy/types';
import type { Env } from './types.js';
import { createBot } from './bot.js';
import { runBackgroundPolling } from './services/poller.js';
import { handleAuthLogin, handleAuthTicket, handleApplicationsList, handleSyncState } from './worker-auth.js';

let cachedBot: ReturnType<typeof createBot> | null = null;

function buildCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('Origin') || '';
  const isAllowed =
    origin === 'https://coursing-stats.ru' ||
    /^https:\/\/([a-z0-9-]+\.)?coursing-stats\.ru$/i.test(origin) ||
    /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin) ||
    origin.startsWith('chrome-extension://') ||
    origin.startsWith('moz-extension://');

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : 'https://coursing-stats.ru',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Vary': 'Origin',
  };
}

function isAdminAuthorized(request: Request, env: Env): boolean {
  const secret = env.ADMIN_SECRET?.trim();
  if (!secret) return false;
  const authHeader = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '').trim();
  const headerSecret = request.headers.get('X-Admin-Secret')?.trim();
  return authHeader === secret || headerSecret === secret;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const rawToken = env.BOT_TOKEN || env.TELEGRAM_BOT_TOKEN;
    const token = rawToken ? rawToken.trim() : '';
    const corsHeaders = buildCorsHeaders(request);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (!token) {
      return new Response('BOT_TOKEN is not configured', { status: 500 });
    }

    // Auth API endpoints for WebApp and Extension
    if (url.pathname === '/api/auth/login' && request.method === 'POST') {
      return handleAuthLogin(request, env, corsHeaders);
    }

    if (url.pathname === '/api/auth/ticket' && request.method === 'POST') {
      return handleAuthTicket(request, env, corsHeaders);
    }

    if (url.pathname === '/api/applications' && request.method === 'GET') {
      return handleApplicationsList(request, corsHeaders);
    }

    if (url.pathname === '/api/sync' && (request.method === 'GET' || request.method === 'PUT')) {
      return handleSyncState(request, env, corsHeaders);
    }

    if (url.pathname === '/health') {
      const botId = token.split(':')[0] || 'none';
      return new Response(JSON.stringify({ status: 'ok', worker: 'coursing-stats-tracker-bot', bot_id: botId }), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      });
    }

    // Admin-only diagnostic & webhook endpoints
    if (url.pathname === '/get-me' || url.pathname === '/webhook-info' || url.pathname === '/set-webhook') {
      if (!isAdminAuthorized(request, env)) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'content-type': 'application/json' }
        });
      }

      if (url.pathname === '/get-me') {
        const meRes = await fetch(`https://api.telegram.org/bot${token}/getMe`);
        const meData = await meRes.text();
        return new Response(meData, {
          status: meRes.status,
          headers: { 'content-type': 'application/json' }
        });
      }

      if (url.pathname === '/webhook-info') {
        const infoRes = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
        const infoData = await infoRes.json();
        return new Response(JSON.stringify(infoData), {
          status: 200,
          headers: { 'content-type': 'application/json' }
        });
      }

      // /set-webhook
      const webhookUrl = `${url.origin}/webhook`;
      const webhookPayload: Record<string, unknown> = {
        url: webhookUrl,
        allowed_updates: ['message', 'callback_query'],
        drop_pending_updates: true
      };
      if (env.WEBHOOK_SECRET?.trim()) {
        webhookPayload.secret_token = env.WEBHOOK_SECRET.trim();
      }
      const whRes = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(webhookPayload)
      });
      const whData: any = await whRes.json();

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

      try {
        const webAppUrl = env.WEBAPP_URL || 'https://coursing-stats.ru/tracker/';
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
      const expectedSecret = env.WEBHOOK_SECRET?.trim();
      if (expectedSecret) {
        const incomingSecret = request.headers.get('X-Telegram-Bot-Api-Secret-Token');
        if (incomingSecret !== expectedSecret) {
          return new Response('Forbidden', { status: 403 });
        }
      }

      try {
        const update: Update = await request.json();

        if (!cachedBot) {
          cachedBot = createBot(token, env);
          cachedBot.catch((err) => {
            console.error('[bot.catch]', `Update ${err.ctx?.update?.update_id}:`, err.message || String(err.error));
          });
        }

        await cachedBot.handleUpdate(update);
        return new Response('OK', { status: 200 });
      } catch (err: any) {
        console.error('[Webhook error]', err?.message || String(err));
        return new Response(JSON.stringify({ ok: false }), {
          status: 500,
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
