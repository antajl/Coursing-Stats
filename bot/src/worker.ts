import { Bot } from 'grammy';
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
  const count = current ? parseInt(current) : 0;
  
  if (count >= RATE_LIMIT_REQUESTS) {
    // TODO: Add security logging when type checking is fixed
    return { allowed: false, remaining: 0 };
  }
  
  // Increment counter with TTL
  await env.CACHE.put(key, String(count + 1), { expirationTtl: RATE_LIMIT_WINDOW });
  return { allowed: true, remaining: RATE_LIMIT_REQUESTS - count - 1 };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const url = new URL(request.url);

      // Health check
      if (url.pathname === '/health') {
        return new Response('OK', { status: 200 });
      }

      // Set webhook endpoint
      if (url.pathname === '/set-webhook') {
        const secret = url.searchParams.get('secret');
        if (secret !== env.WEBHOOK_SECRET) {
          return new Response('Invalid secret', { status: 403 });
        }

        const webhookUrl = `${url.origin}/webhook`;
        const response = await fetch(
          `https://api.telegram.org/bot${env.BOT_TOKEN}/setWebhook?url=${encodeURIComponent(webhookUrl)}&secret_token=${env.WEBHOOK_SECRET}`
        );
        const result = await response.json() as { ok: boolean; description?: string };

        if (result.ok) {
          return new Response('Webhook set successfully', { status: 200 });
        } else {
          return new Response(`Failed to set webhook: ${result.description}`, { status: 500 });
        }
      }

      // Initialize bot and API instances only once
      if (!globalBot || !globalApi) {
        globalApi = new CoursingStatsAPI(env.CACHE);
        globalBot = new Bot(env.BOT_TOKEN);

        await globalBot.init();

        setupHandlers(globalBot, globalApi, env.CACHE);
      }

      // Handle webhook manually
      if (request.method === 'POST' && (url.pathname === '/webhook' || url.pathname === '/')) {
        const body = await request.text();

        try {
          const update = JSON.parse(body);
          
          // Rate limiting check
          const userId = update.message?.from?.id || update.callback_query?.from?.id;
          if (userId) {
            const rateLimitResult = await checkRateLimit(userId.toString(), env);
            if (!rateLimitResult.allowed) {
              return new Response('Rate limit exceeded', { status: 429 });
            }
          }
          
          await globalBot.handleUpdate(update);
        } catch (error) {
          // Log errors for debugging while protecting sensitive information
          console.error('Error handling update:', error instanceof Error ? error.message : 'Unknown error');
        }

        return new Response('OK', { status: 200 });
      }

      return new Response('Not found', { status: 404 });
    } catch (error) {
      return new Response('Internal Server Error', { status: 500 });
    }
  }
};
