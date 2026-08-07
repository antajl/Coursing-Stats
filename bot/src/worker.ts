import { Bot } from 'grammy';
import type { Update } from '@grammyjs/types';
import { setupHandlers } from './handlers/index';
import { CoursingStatsAPI } from './api';

// Global bot instance to avoid recreation on each request
let globalBot: Bot | null = null;
let globalApi: CoursingStatsAPI | null = null;

export interface Env {
  BOT_TOKEN: string;
  SITE_URL: string;
  WEBHOOK_SECRET: string;
  CACHE: KVNamespace;
}

// Rate limiting configuration
const RATE_LIMIT_REQUESTS = 100; // requests per minute
const RATE_LIMIT_WINDOW = 60; // seconds

async function checkRateLimit(userId: string, env: Env): Promise<{ allowed: boolean; remaining: number }> {
  const key = `rate_limit:${userId}`;
  const current = await env.CACHE.get(key);
  const count = current ? parseInt(current, 10) : 0;

  if (count >= RATE_LIMIT_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  await env.CACHE.put(key, String(count + 1), { expirationTtl: RATE_LIMIT_WINDOW });
  return { allowed: true, remaining: RATE_LIMIT_REQUESTS - count - 1 };
}

function isValidWebhookSecret(request: Request, env: Env): boolean {
  const header = request.headers.get('X-Telegram-Bot-Api-Secret-Token');
  return Boolean(env.WEBHOOK_SECRET) && header === env.WEBHOOK_SECRET;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const url = new URL(request.url);

      // Health check: CDN reachable + KV writable
      if (url.pathname === '/health') {
        const siteUrl = (env.SITE_URL || 'https://coursing-stats.ru').replace(/\/$/, '');
        const checks: { cdn: boolean; kv: boolean; error?: string } = { cdn: false, kv: false };

        try {
          const cdnRes = await fetch(`${siteUrl}/data/v1/manifest.json`, {
            method: 'GET',
            headers: { Accept: 'application/json' },
          });
          checks.cdn = cdnRes.ok;
        } catch (e) {
          checks.error = e instanceof Error ? e.message : 'cdn fetch failed';
        }

        try {
          const probeKey = 'health:probe';
          await env.CACHE.put(probeKey, String(Date.now()), { expirationTtl: 60 });
          const got = await env.CACHE.get(probeKey);
          checks.kv = Boolean(got);
        } catch (e) {
          checks.error = e instanceof Error ? e.message : 'kv failed';
        }

        const ok = checks.cdn && checks.kv;
        return new Response(JSON.stringify({ ok, ...checks }), {
          status: ok ? 200 : 503,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Set webhook endpoint
      if (url.pathname === '/set-webhook') {
        const secret = url.searchParams.get('secret');
        if (secret !== env.WEBHOOK_SECRET) {
          return new Response('Invalid secret', { status: 403 });
        }

        if (!env.WEBHOOK_SECRET) {
          return new Response('WEBHOOK_SECRET is not configured', { status: 500 });
        }

        const webhookUrl = `${url.origin}/webhook`;
        const response = await fetch(
          `https://api.telegram.org/bot${env.BOT_TOKEN}/setWebhook`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: webhookUrl,
              secret_token: env.WEBHOOK_SECRET,
              allowed_updates: [
                'message',
                'edited_message',
                'callback_query',
                'inline_query',
                'chosen_inline_result',
              ],
            }),
          }
        );
        const result = await response.json() as { ok: boolean; description?: string };

        if (result.ok) {
          return new Response('Webhook set successfully', { status: 200 });
        }
        return new Response(`Failed to set webhook: ${result.description}`, { status: 500 });
      }

      // Initialize bot and API instances only once
      if (!globalBot || !globalApi) {
        globalApi = new CoursingStatsAPI(env.CACHE, env.SITE_URL);
        globalBot = new Bot(env.BOT_TOKEN);

        await globalBot.init();

        setupHandlers(globalBot, globalApi, env.CACHE);
      }

      // Handle webhook
      if (request.method === 'POST' && (url.pathname === '/webhook' || url.pathname === '/')) {
        if (!isValidWebhookSecret(request, env)) {
          return new Response('Unauthorized', { status: 401 });
        }

        const body = await request.text();

        try {
          const update = JSON.parse(body) as Update;

          const userId = update.message?.from?.id || update.callback_query?.from?.id;
          if (userId) {
            const rateLimitResult = await checkRateLimit(userId.toString(), env);
            if (!rateLimitResult.allowed) {
              // Always ACK Telegram (avoid retry storm); notify user when possible
              try {
                if (update.callback_query?.id) {
                  await globalBot.api.answerCallbackQuery(update.callback_query.id, {
                    text: 'Слишком много запросов. Подождите минуту.',
                    show_alert: true,
                  });
                } else if (update.message?.chat?.id) {
                  await globalBot.api.sendMessage(
                    update.message.chat.id,
                    '⏳ Слишком много запросов. Подождите минуту и попробуйте снова.'
                  );
                }
              } catch {
                // ignore notify failures
              }
              return new Response('OK', { status: 200 });
            }
          }

          await globalBot.handleUpdate(update);
        } catch (error) {
          console.error('Error handling update:', error instanceof Error ? error.message : 'Unknown error');
        }

        return new Response('OK', { status: 200 });
      }

      return new Response('Not found', { status: 404 });
    } catch (error) {
      return new Response('Internal Server Error', { status: 500 });
    }
  },
};
