// Auth API endpoints for WebApp and Extension (Strict Zero Emoji & CORS)
import type { Env } from './types.js';
import { authenticateRkfUser } from './services/rkf-api.js';
import { getUser, saveUser, createDefaultUser } from './storage/index.js';

export async function handleAuthLogin(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
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
