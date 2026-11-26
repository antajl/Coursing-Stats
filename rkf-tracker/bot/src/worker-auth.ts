// Auth API endpoints for WebApp and Extension (Strict Zero Emoji & CORS)
import type { Env } from './types.js';
import { authenticateRkfUser, fetchRkfApplications } from './services/rkf-api.js';
import { getUser, saveUser, createDefaultUser } from './storage/index.js';
import { encryptSecret } from './crypto.js';

async function verifyTelegramWebAppUserId(initData: string, botToken: string): Promise<number | null> {
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) return null;
    params.delete('hash');
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('\n');

    const enc = new TextEncoder();
    const secretKey = await crypto.subtle.importKey(
      'raw',
      enc.encode('WebAppData'),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const secret = await crypto.subtle.sign('HMAC', secretKey, enc.encode(botToken));
    const signingKey = await crypto.subtle.importKey(
      'raw',
      secret,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', signingKey, enc.encode(dataCheckString));
    const computedHash = Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    if (computedHash !== hash) return null;

    const userJson = params.get('user');
    if (!userJson) return null;
    const parsed = JSON.parse(userJson);
    return typeof parsed?.id === 'number' ? parsed.id : null;
  } catch {
    return null;
  }
}

export async function handleAuthLogin(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
  try {
    const body: any = await request.json();
    const email = String(body.email || '').trim();
    const password = String(body.password || '');
    const userId = body.userId ? Number(body.userId) : null;
    const initData = typeof body.initData === 'string' ? body.initData : '';

    if (userId) {
      const botToken = env.BOT_TOKEN || env.TELEGRAM_BOT_TOKEN || '';
      const verifiedUserId = botToken && initData ? await verifyTelegramWebAppUserId(initData, botToken) : null;
      if (!verifiedUserId || verifiedUserId !== userId) {
        return new Response(JSON.stringify({ ok: false, error: 'Для привязки Telegram используйте WebApp или /api/auth/ticket' }), {
          status: 403,
          headers: { 'content-type': 'application/json', ...corsHeaders }
        });
      }
    }

    if (!email || !password) {
      return new Response(JSON.stringify({ ok: false, error: 'Укажите E-mail и пароль' }), {
        status: 400,
        headers: { 'content-type': 'application/json', ...corsHeaders }
      });
    }

    const authRes = await authenticateRkfUser(email, password);
    if (!authRes.ok || !authRes.apikey) {
      const httpStatus =
        authRes.statusCode && authRes.statusCode >= 500
          ? 502
          : authRes.statusCode === 403 || authRes.statusCode === 429
          ? authRes.statusCode
          : 401;
      return new Response(JSON.stringify({ ok: false, error: authRes.error || 'Неверный логин или пароль' }), {
        status: httpStatus,
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

export async function handleAuthTicket(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
  try {
    const body: any = await request.json();
    const apikey = String(body.apikey || '').trim();
    if (!apikey || apikey.length < 10) {
      return new Response(JSON.stringify({ ok: false, error: 'Некорректный токен' }), {
        status: 400,
        headers: { 'content-type': 'application/json', ...corsHeaders }
      });
    }

    const ticket = 'tk_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
    const encSecret = env.TOKEN_ENC_KEY || env.BOT_TOKEN || env.TELEGRAM_BOT_TOKEN;
    const storedTicketValue = encSecret ? await encryptSecret(apikey, encSecret) : apikey;
    await env.KV_STORAGE.put(`pair:ticket:${ticket}`, storedTicketValue, { expirationTtl: 600 });
    const botName = env.BOT_USERNAME || 'coursing_stats_notify_bot';

    return new Response(JSON.stringify({ ok: true, ticket, botUrl: `https://t.me/${botName}?start=bind_${ticket}` }), {
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

export async function handleApplicationsList(
  request: Request,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token || token.length < 10) {
      return new Response(JSON.stringify({ ok: false, error: 'Требуется авторизация' }), {
        status: 401,
        headers: { 'content-type': 'application/json', ...corsHeaders }
      });
    }

    const applications = await fetchRkfApplications(token, []);
    return new Response(JSON.stringify({ ok: true, applications }), {
      status: 200,
      headers: { 'content-type': 'application/json', ...corsHeaders }
    });
  } catch (err: any) {
    if (err?.message === 'AUTH_EXPIRED') {
      return new Response(JSON.stringify({ ok: false, error: 'AUTH_EXPIRED' }), {
        status: 401,
        headers: { 'content-type': 'application/json', ...corsHeaders }
      });
    }
    return new Response(JSON.stringify({ ok: false, error: err?.message || 'Ошибка загрузки заявок РКФ' }), {
      status: 502,
      headers: { 'content-type': 'application/json', ...corsHeaders }
    });
  }
}

async function hashToken(token: string): Promise<string> {
  const bytes = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function handleSyncState(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token || token.length < 10) {
    return new Response(JSON.stringify({ ok: false, error: 'Требуется авторизация' }), {
      status: 401,
      headers: { 'content-type': 'application/json', ...corsHeaders }
    });
  }

  const key = `sync:${await hashToken(token)}`;
  if (request.method === 'GET') {
    const raw = await env.KV_STORAGE.get(key);
    const parsed = raw ? JSON.parse(raw) : { receivedBarcodes: [], subscribedCompetitions: [] };
    return new Response(JSON.stringify({ ok: true, ...parsed }), {
      status: 200,
      headers: { 'content-type': 'application/json', ...corsHeaders }
    });
  }

  const body: any = await request.json().catch(() => ({}));
  const receivedBarcodes = Array.isArray(body.receivedBarcodes)
    ? body.receivedBarcodes.map(String).slice(0, 500)
    : [];
  const subscribedCompetitions = Array.isArray(body.subscribedCompetitions)
    ? body.subscribedCompetitions.map(String).slice(0, 200)
    : [];
  const payload = {
    receivedBarcodes,
    subscribedCompetitions,
    updatedAt: new Date().toISOString()
  };
  await env.KV_STORAGE.put(key, JSON.stringify(payload));
  return new Response(JSON.stringify({ ok: true, ...payload }), {
    status: 200,
    headers: { 'content-type': 'application/json', ...corsHeaders }
  });
}
