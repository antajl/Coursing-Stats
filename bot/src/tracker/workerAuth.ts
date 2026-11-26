import type { TrackerWorkerEnv } from './types';
import type { KVNamespace as BotKVNamespace } from '../handlers/context';
import { getTrackerUser, saveTrackerUser, createDefaultTrackerUser } from './storage';
import { fetchRkfApplications, validateRkfToken } from './rkfApi';
import { decryptTrackerSecret, encryptTrackerSecret } from './crypto';
import { getTrackerCompetitions } from './competitions';

const ALLOWED_CORS_ORIGINS = new Set([
  'https://coursing-stats.ru',
  'https://www.coursing-stats.ru',
  'http://localhost:5173',
  'http://localhost:4173',
]);

function resolveCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('Origin') || '';
  const allowOrigin = ALLOWED_CORS_ORIGINS.has(origin) ? origin : 'https://coursing-stats.ru';
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Telegram-Init-Data',
    'Content-Type': 'application/json',
    Vary: 'Origin',
  };
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function verifyTelegramWebAppUserId(initData: string, botToken: string): Promise<number | null> {
  if (!initData || !botToken) return null;
  const params = new URLSearchParams(initData);
  const hashHex = params.get('hash');
  if (!hashHex || !/^[0-9a-f]{64}$/i.test(hashHex)) return null;

  const authDate = Number(params.get('auth_date') || 0);
  if (!authDate || Math.abs(Math.floor(Date.now() / 1000) - authDate) > 86400) return null;

  const entries: string[] = [];
  params.forEach((value, key) => {
    if (key !== 'hash') entries.push(`${key}=${value}`);
  });
  entries.sort();

  const enc = new TextEncoder();
  const webAppKey = await crypto.subtle.importKey('raw', enc.encode('WebAppData'), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const secretBytes = await crypto.subtle.sign('HMAC', webAppKey, enc.encode(botToken));
  const hmacKey = await crypto.subtle.importKey('raw', secretBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', hmacKey, enc.encode(entries.join('\n'))));
  const expected = new Uint8Array(hashHex.match(/.{2}/g)!.map((h) => parseInt(h, 16)));

  if (!constantTimeEqual(sig, expected)) return null;
  try {
    const u = JSON.parse(params.get('user') || '{}');
    return typeof u.id === 'number' && u.id > 0 ? u.id : null;
  } catch {
    return null;
  }
}

export async function resolveEncryptedTicket(
  kv: BotKVNamespace,
  ticketId: string,
  encSecret?: string,
): Promise<string | undefined> {
  const raw = await kv.get(`trk:ticket:${ticketId}`);
  if (!raw) return undefined;
  await kv.delete(`trk:ticket:${ticketId}`);
  try {
    const parsed = JSON.parse(raw) as { token?: string };
    return parsed.token ? await decryptTrackerSecret(parsed.token, encSecret) : undefined;
  } catch {
    return undefined;
  }
}

export async function handleTrackerHttpRequest(request: Request, env: TrackerWorkerEnv, botUsername = 'coursing_stats_bot'): Promise<Response | null> {
  const url = new URL(request.url);
  if (!url.pathname.startsWith('/api/')) return null;

  const cors = resolveCorsHeaders(request);
  if (request.method === 'OPTIONS') return new Response(null, { headers: cors });

  const kv = env.TRACKER_KV || env.CACHE;

  if (url.pathname === '/api/competitions' && request.method === 'GET') {
    return new Response(JSON.stringify({ ok: true, count: getTrackerCompetitions().length, events: getTrackerCompetitions() }), { headers: cors });
  }

  if (url.pathname === '/api/auth/ticket' && request.method === 'POST') {
    try {
      const body = (await request.json()) as { apikey?: string };
      const token = String(body.apikey || '').replace(/^["']|["']$/g, '').replace(/^Bearer\s+/i, '').trim();
      if (!token) return new Response(JSON.stringify({ ok: false, error: 'Missing apikey' }), { status: 400, headers: cors });

      const valid = await validateRkfToken(token);
      if (!valid) return new Response(JSON.stringify({ ok: false, error: 'Invalid or expired RKF session' }), { status: 401, headers: cors });

      const ticketId = crypto.randomUUID().replace(/-/g, '').slice(0, 12);
      const encrypted = await encryptTrackerSecret(token, env.TOKEN_ENC_KEY);
      await kv.put(`trk:ticket:${ticketId}`, JSON.stringify({ token: encrypted, createdAt: Date.now() }), { expirationTtl: 300 });
      return new Response(JSON.stringify({ ok: true, botUrl: `https://t.me/${botUsername}?start=tk_${ticketId}` }), { headers: cors });
    } catch {
      return new Response(JSON.stringify({ ok: false, error: 'Bad request' }), { status: 400, headers: cors });
    }
  }

  if (url.pathname === '/api/auth/login' && request.method === 'POST') {
    try {
      const body = (await request.json()) as { email?: string; password?: string };
      if (!body.email || !body.password) {
        return new Response(JSON.stringify({ ok: false, error: 'Email and password required' }), { status: 400, headers: cors });
      }
      const res = await fetch('https://rkf.online/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: body.email, password: body.password }),
      });
      const json = (await res.json().catch(() => ({}))) as any;
      const token = json?.token || json?.access_token || json?.result?.token;
      if (!res.ok || !token) {
        return new Response(JSON.stringify({ ok: false, error: 'Неверный логин или пароль rkf.online' }), { status: 401, headers: cors });
      }
      const ticketId = crypto.randomUUID().replace(/-/g, '').slice(0, 12);
      const encrypted = await encryptTrackerSecret(String(token), env.TOKEN_ENC_KEY);
      await kv.put(`trk:ticket:${ticketId}`, JSON.stringify({ token: encrypted, createdAt: Date.now() }), { expirationTtl: 300 });
      return new Response(JSON.stringify({ ok: true, botUrl: `https://t.me/${botUsername}?start=tk_${ticketId}` }), { headers: cors });
    } catch {
      return new Response(JSON.stringify({ ok: false, error: 'Auth failed' }), { status: 500, headers: cors });
    }
  }

  const initData = request.headers.get('X-Telegram-Init-Data') || '';
  const verifiedUserId = await verifyTelegramWebAppUserId(initData, env.BOT_TOKEN);
  if (!verifiedUserId) {
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized WebApp request' }), { status: 401, headers: cors });
  }

  if (url.pathname === '/api/applications' && request.method === 'GET') {
    const user = await getTrackerUser(kv, verifiedUserId, env.TOKEN_ENC_KEY);
    if (!user || !user.rkfToken) {
      return new Response(JSON.stringify({ ok: false, linked: false, applications: [] }), { headers: cors });
    }
    try {
      const apps = await fetchRkfApplications(user.rkfToken, user.receivedBarcodes || []);
      return new Response(JSON.stringify({ ok: true, linked: true, applications: apps }), { headers: cors });
    } catch (err: any) {
      return new Response(JSON.stringify({ ok: false, linked: false, error: err?.message || 'API error' }), { status: 502, headers: cors });
    }
  }

  if (url.pathname === '/api/sync' && request.method === 'POST') {
    const body = (await request.json().catch(() => ({}))) as { receivedBarcodes?: string[] };
    const user = (await getTrackerUser(kv, verifiedUserId, env.TOKEN_ENC_KEY)) || createDefaultTrackerUser(verifiedUserId, verifiedUserId);
    if (Array.isArray(body.receivedBarcodes)) {
      user.receivedBarcodes = body.receivedBarcodes.slice(0, 200).map(String);
      await saveTrackerUser(kv, user, env.TOKEN_ENC_KEY);
    }
    return new Response(JSON.stringify({ ok: true, receivedBarcodes: user.receivedBarcodes }), { headers: cors });
  }

  return new Response(JSON.stringify({ ok: false, error: 'Not found' }), { status: 404, headers: cors });
}
