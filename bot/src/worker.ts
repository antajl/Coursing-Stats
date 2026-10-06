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

interface RateLimitBucket {
  count: number;
  resetAt: number;
}
const inMemoryRateLimits = new Map<string, RateLimitBucket>();

async function checkRateLimit(userId: string, cache?: KVNamespace): Promise<{ allowed: boolean; remaining: number }> {
  const now = Date.now();

  // Fast in-memory check to reduce KV calls
  if (inMemoryRateLimits.size > 5000) {
    for (const [id, b] of inMemoryRateLimits.entries()) {
      if (now > b.resetAt) inMemoryRateLimits.delete(id);
    }
  }

  const memBucket = inMemoryRateLimits.get(userId);
  if (memBucket && now <= memBucket.resetAt && memBucket.count >= RATE_LIMIT_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  if (cache) {
    try {
      const windowKey = `rl:${userId}:${Math.floor(now / 60000)}`;
      const currentCountStr = await cache.get(windowKey);
      const count = (currentCountStr ? parseInt(currentCountStr, 10) : 0) + 1;
      await cache.put(windowKey, String(count), { expirationTtl: 120 });

      // Sync memory
      inMemoryRateLimits.set(userId, { count, resetAt: now + RATE_LIMIT_WINDOW * 1000 });

      if (count > RATE_LIMIT_REQUESTS) {
        return { allowed: false, remaining: 0 };
      }
      return { allowed: true, remaining: Math.max(0, RATE_LIMIT_REQUESTS - count) };
    } catch {
      // Fallback to in-memory on KV error
    }
  }

  if (!memBucket || now > memBucket.resetAt) {
    inMemoryRateLimits.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW * 1000 });
    return { allowed: true, remaining: RATE_LIMIT_REQUESTS - 1 };
  }

  memBucket.count++;
  if (memBucket.count > RATE_LIMIT_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: RATE_LIMIT_REQUESTS - memBucket.count };
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
          // Register Telegram bot commands menu
          try {
            await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/setMyCommands`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                commands: [
                  { command: 'start', description: 'Главное меню' },
                  { command: 'search', description: 'Поиск собаки по кличке или ID' },
                  { command: 'breed', description: 'Поиск собак по породе' },
                  { command: 'ratings', description: 'Рейтинги и топы (включая Elo)' },
                  { command: 'archive', description: 'Архив соревнований и выставок' },
                  { command: 'donino', description: 'Рекорды Донино' },
                  { command: 'favorites', description: 'Избранные собаки' },
                  { command: 'help', description: 'Справка и правила' },
                ],
              }),
            });
          } catch (cmdErr) {
            console.error('[set-webhook] Failed to set commands:', cmdErr);
          }

          return new Response('Webhook and commands set successfully', { status: 200 });
        }
        return new Response(`Failed to set webhook: ${result.description}`, { status: 500 });
      }

      // Initialize bot and API instances only once
      if (!globalBot || !globalApi) {
        globalApi = new CoursingStatsAPI(env.CACHE, env.SITE_URL);
        globalBot = new Bot(env.BOT_TOKEN);

        globalBot.catch((err) => {
          console.error(`[bot.catch] Error in update ${err.ctx.update.update_id}:`, err.error);
        });

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
            const rateLimitResult = await checkRateLimit(userId.toString(), env.CACHE);
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
