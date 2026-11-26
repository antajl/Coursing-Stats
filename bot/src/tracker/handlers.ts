import { Composer } from 'grammy';
import type { KVNamespace } from '../handlers/context';
import { safeEditOrReply } from '../handlers/utils/safeEditOrReply';
import { fetchRkfApplications, validateRkfToken } from './rkfApi';
import { createDefaultTrackerUser, getTrackerUser, saveTrackerUser } from './storage';
import { resolveEncryptedTicket } from './workerAuth';
import {
  buildTrackerSubscriptionsText,
  filterTrackerCompetitions,
  findTrackerCompetitionById,
  getTrackerDisciplineCounts,
  STATUS_RUSSIAN,
} from './competitions';
import {
  getTrackerAppsKeyboard,
  getTrackerAuthKeyboard,
  getTrackerCompsMenuKeyboard,
  getTrackerCompsPageKeyboard,
  getTrackerMainKeyboard,
  getTrackerRebindKeyboard,
} from './keyboards';
import { BOOKMARKLET_SNIPPET, buildTrackerHubText, getAuthPromptMessage, TRACKER_WEBAPP_URL } from './authViews';

const APPS_PAGE_SIZE = 4;
const COMP_PAGE_SIZE = 3;

async function syncTokenToUser(
  kv: KVNamespace | undefined,
  userId: number,
  chatId: number,
  rawToken: string,
  encSecret?: string,
): Promise<{ ok: boolean; count: number; ready: number }> {
  const clean = rawToken.replace(/^["']|["']$/g, '').replace(/^Bearer\s+/i, '').trim();
  if (!(await validateRkfToken(clean))) return { ok: false, count: 0, ready: 0 };

  const user = (await getTrackerUser(kv, userId, encSecret)) || createDefaultTrackerUser(userId, chatId);
  user.rkfToken = clean;
  user.linkedAt = new Date().toISOString();
  user.authExpiredNotifiedAt = undefined;

  try {
    const apps = await fetchRkfApplications(clean, user.receivedBarcodes);
    user.cachedApps = {};
    for (const app of apps) {
      user.cachedApps[app.barcode] = {
        status: app.currentStatus,
        statusGroup: app.statusGroup,
        lastUpdated: app.lastUpdated,
      };
    }
    user.lastCheckedAt = new Date().toISOString();
  } catch {
    // Keep existing cache if immediate feed fetch fails
  }

  await saveTrackerUser(kv, user, encSecret);
  const cached = Object.values(user.cachedApps || {});
  return {
    ok: true,
    count: cached.length,
    ready: cached.filter((a) => a.statusGroup === 'ready').length,
  };
}

export function createTracker(cache?: KVNamespace, encSecret?: string): Composer<any> {
  const trk = new Composer<any>();

  async function renderHub(ctx: any) {
    const uid = ctx.from?.id;
    if (!uid) return;
    const user = await getTrackerUser(cache, uid, encSecret);
    await safeEditOrReply(
      ctx,
      buildTrackerHubText(user),
      { parse_mode: 'HTML', reply_markup: getTrackerMainKeyboard(Boolean(user?.rkfToken), TRACKER_WEBAPP_URL) },
      cache,
    );
  }

  async function renderApps(ctx: any, onlyReady: boolean, page: number) {
    const uid = ctx.from?.id;
    const chatId = ctx.chat?.id || uid;
    if (!uid || !chatId) return;
    const user = await getTrackerUser(cache, uid, encSecret);
    if (!user?.rkfToken) {
      await safeEditOrReply(
        ctx,
        getAuthPromptMessage(),
        { parse_mode: 'HTML', reply_markup: getTrackerAuthKeyboard(TRACKER_WEBAPP_URL) },
        cache,
      );
      return;
    }

    try {
      let apps = await fetchRkfApplications(user.rkfToken, user.receivedBarcodes || []);
      if (onlyReady) apps = apps.filter((a) => a.statusGroup === 'ready');
      if (apps.length === 0) {
        const empty = onlyReady ? 'Готовых к выдаче документов пока нет.' : 'Активных заявок в rkf.online не найдено.';
        await safeEditOrReply(
          ctx,
          empty,
          { parse_mode: 'HTML', reply_markup: getTrackerMainKeyboard(true, TRACKER_WEBAPP_URL) },
          cache,
        );
        return;
      }

      const totalPages = Math.max(1, Math.ceil(apps.length / APPS_PAGE_SIZE));
      const safePage = Math.min(Math.max(0, page), totalPages - 1);
      const slice = apps.slice(safePage * APPS_PAGE_SIZE, (safePage + 1) * APPS_PAGE_SIZE);

      let text = `📋 <b>Заявки rkf.online (${apps.length})</b> · стр. ${safePage + 1}/${totalPages}\n\n`;
      slice.forEach((app, i) => {
        const idx = safePage * APPS_PAGE_SIZE + i + 1;
        const badge = app.statusGroup === 'ready' ? '🏆 ГОТОВО' : app.statusGroup === 'rejected' ? 'ОТКЛОНЕНО' : 'В обработке';
        const dog = app.dogName ? ` · ${app.dogName}` : '';
        const rec = app.isReceived ? ' (Забрали)' : '';
        text += `${idx}. <b>${badge}</b>${rec}\n   ${app.documentName}${dog}\n   № ${app.barcode} · ${app.currentStatus}\n\n`;
      });

      await safeEditOrReply(
        ctx,
        text,
        { parse_mode: 'HTML', reply_markup: getTrackerAppsKeyboard(slice, safePage, totalPages, onlyReady, TRACKER_WEBAPP_URL) },
        cache,
      );
    } catch (err: any) {
      const msg =
        err?.message === 'AUTH_EXPIRED'
          ? 'Сессия rkf.online устарела. Подключите аккаунт повторно через /auth.'
          : 'Временная ошибка при обращении к rkf.online. Попробуйте через минуту.';
      await safeEditOrReply(
        ctx,
        msg,
        { parse_mode: 'HTML', reply_markup: getTrackerAuthKeyboard(TRACKER_WEBAPP_URL) },
        cache,
      );
    }
  }

  async function renderCompsPage(ctx: any, disc: string, page: number) {
    const uid = ctx.from?.id;
    const user = uid ? await getTrackerUser(cache, uid, encSecret) : null;
    const subIds = new Set<string>((user?.competitions || []).map((c: any) => c.id));
    const events = filterTrackerCompetitions(disc);
    const totalPages = Math.max(1, Math.ceil(events.length / COMP_PAGE_SIZE));
    const safePage = Math.min(Math.max(0, page), totalPages - 1);
    const slice = events.slice(safePage * COMP_PAGE_SIZE, (safePage + 1) * COMP_PAGE_SIZE);

    let text = `📅 <b>График РКФ 2026 (${events.length})</b> · стр. ${safePage + 1}/${totalPages}\n\n`;
    slice.forEach((ev, i) => {
      const st = STATUS_RUSSIAN[ev.status] || ev.status;
      const mark = subIds.has(ev.id) ? ' ⭐' : '';
      text += `${i + 1}. <b>${ev.dateRaw}</b> · ${ev.location}${mark}\n   ${ev.discipline} (${ev.rank}) · ${st}\n\n`;
    });

    await safeEditOrReply(
      ctx,
      text,
      { parse_mode: 'HTML', reply_markup: getTrackerCompsPageKeyboard(slice, disc, safePage, totalPages, subIds) },
      cache,
    );
  }

  trk.command('start', async (ctx, next) => {
    const arg = (ctx.message?.text || '').replace('/start', '').trim();
    if (!arg || (!arg.startsWith('tk_') && !arg.startsWith('bind_') && !arg.startsWith('ext_'))) {
      return next();
    }
    const uid = ctx.from?.id;
    const chatId = ctx.chat?.id;
    if (!uid || !chatId || !cache) return;

    const ticketId = arg.replace(/^(tk_|bind_|ext_)/, '');
    const token = await resolveEncryptedTicket(cache, ticketId, encSecret);
    if (!token) {
      await ctx.reply('Ссылка привязки устарела или уже использована. Создайте новую в веб-кабинете.');
      return;
    }

    const existing = await getTrackerUser(cache, uid, encSecret);
    if (existing?.rkfToken && existing.rkfToken !== token) {
      await cache.put(`trk:rebind:${uid}`, JSON.stringify({ token }), { expirationTtl: 600 });
      await ctx.reply('К этому профилю Telegram уже привязан другой аккаунт rkf.online. Заменить?', {
        reply_markup: getTrackerRebindKeyboard(),
      });
      return;
    }

    const res = await syncTokenToUser(cache, uid, chatId, token, encSecret);
    if (!res.ok) {
      await ctx.reply('Не удалось проверить сессию rkf.online.');
      return;
    }
    await ctx.reply(
      `🏆 <b>Аккаунт rkf.online подключен</b>\n\n• Заявок: ${res.count}\n• Готово к выдаче: ${res.ready}`,
      { parse_mode: 'HTML', reply_markup: getTrackerMainKeyboard(true, TRACKER_WEBAPP_URL) },
    );
  });

  trk.command(['tracker', 'apps'], async (ctx) => renderApps(ctx, false, 0));
  trk.command('ready', async (ctx) => renderApps(ctx, true, 0));
  trk.command('auth', async (ctx) => {
    const raw = (ctx.message?.text || '').replace(/^\/auth/, '').trim();
    const uid = ctx.from?.id;
    const chatId = ctx.chat?.id;
    if (raw && uid && chatId) {
      await ctx.deleteMessage().catch(() => {});
      const res = await syncTokenToUser(cache, uid, chatId, raw, encSecret);
      await ctx.reply(res.ok ? `Аккаунт подключен. Заявок: ${res.count}.` : 'Неверный или просроченный токен РКФ.');
      return;
    }
    await safeEditOrReply(
      ctx,
      getAuthPromptMessage(),
      { parse_mode: 'HTML', reply_markup: getTrackerAuthKeyboard(TRACKER_WEBAPP_URL) },
      cache,
    );
  });

  trk.command('logout', async (ctx) => {
    const uid = ctx.from?.id;
    const chatId = ctx.chat?.id;
    if (!uid || !chatId) return;
    const user = (await getTrackerUser(cache, uid, encSecret)) || createDefaultTrackerUser(uid, chatId);
    user.rkfToken = undefined;
    user.cachedApps = {};
    await saveTrackerUser(cache, user, encSecret);
    await ctx.reply('Токен rkf.online удален.', { reply_markup: getTrackerMainKeyboard(false, TRACKER_WEBAPP_URL) });
  });

  trk.command('untrack', async (ctx) => {
    const uid = ctx.from?.id;
    const id = (ctx.message?.text || '').replace('/untrack', '').trim();
    if (!uid || !id) return;
    const user = await getTrackerUser(cache, uid, encSecret);
    if (!user) return;
    user.competitions = (user.competitions || []).filter((c) => c.id !== id);
    await saveTrackerUser(cache, user, encSecret);
    await ctx.reply(`Подписка на состязание ${id} отменена.`);
  });

  trk.callbackQuery('tracker_menu', renderHub);
  trk.callbackQuery('trk_apps', async (ctx) => renderApps(ctx, false, 0));
  trk.callbackQuery('trk_ready', async (ctx) => renderApps(ctx, true, 0));
  trk.callbackQuery('trk_auth', async (ctx) => {
    await safeEditOrReply(ctx, getAuthPromptMessage(), { parse_mode: 'HTML', reply_markup: getTrackerAuthKeyboard(TRACKER_WEBAPP_URL) }, cache);
  });
  trk.callbackQuery('trk_auth_ext', async (ctx) => {
    await safeEditOrReply(
      ctx,
      'Откройте rkf.online в браузере или программе для Windows и нажмите «Подключить Telegram». Токен привяжется в 1 клик без пароля.',
      { parse_mode: 'HTML', reply_markup: getTrackerAuthKeyboard(TRACKER_WEBAPP_URL) },
      cache,
    );
  });
  trk.callbackQuery('trk_auth_bm', async (ctx) => {
    await safeEditOrReply(
      ctx,
      `Скопируйте код в адрес закладки браузера и нажмите её на странице rkf.online:\n\n<code>${BOOKMARKLET_SNIPPET}</code>`,
      { parse_mode: 'HTML', reply_markup: getTrackerAuthKeyboard(TRACKER_WEBAPP_URL) },
      cache,
    );
  });
  trk.callbackQuery('trk_logout', async (ctx) => {
    const uid = ctx.from?.id;
    const chatId = ctx.chat?.id || uid;
    if (!uid || !chatId) return;
    const user = (await getTrackerUser(cache, uid, encSecret)) || createDefaultTrackerUser(uid, chatId);
    user.rkfToken = undefined;
    user.cachedApps = {};
    await saveTrackerUser(cache, user, encSecret);
    await renderHub(ctx);
  });
  trk.callbackQuery(/^trk_apps_p:(all|ready):(\d+)$/, async (ctx) => {
    await renderApps(ctx, ctx.match![1] === 'ready', parseInt(ctx.match![2], 10) || 0);
  });
  trk.callbackQuery(/^(trk_rec|trk_unrec):(\d+):(all|ready):(\d+)$/, async (ctx) => {
    const [_, act, barcode, mode, pStr] = ctx.match!;
    const uid = ctx.from?.id;
    if (!uid) return;
    const user = await getTrackerUser(cache, uid, encSecret);
    if (!user) return;
    user.receivedBarcodes = act === 'trk_rec'
      ? Array.from(new Set([...(user.receivedBarcodes || []), barcode]))
      : (user.receivedBarcodes || []).filter((b) => b !== barcode);
    await saveTrackerUser(cache, user, encSecret);
    await renderApps(ctx, mode === 'ready', parseInt(pStr, 10) || 0);
  });
  trk.callbackQuery('trk_comps', async (ctx) => {
    const counts = getTrackerDisciplineCounts();
    await safeEditOrReply(
      ctx,
      `📅 <b>График состязаний РКФ 2026</b>\n\nВсего: ${counts.total} · Утверждено: ${counts.approved} · На согласовании: ${counts.pending}`,
      { parse_mode: 'HTML', reply_markup: getTrackerCompsMenuKeyboard() },
      cache,
    );
  });
  trk.callbackQuery('trk_subs', async (ctx) => {
    const uid = ctx.from?.id;
    const user = uid ? await getTrackerUser(cache, uid, encSecret) : null;
    await safeEditOrReply(
      ctx,
      buildTrackerSubscriptionsText(user?.competitions || []),
      { parse_mode: 'HTML', reply_markup: getTrackerCompsMenuKeyboard() },
      cache,
    );
  });
  trk.callbackQuery(/^trk_disc:([a-z]+)$/, async (ctx) => renderCompsPage(ctx, ctx.match![1], 0));
  trk.callbackQuery(/^trk_comp_p:([a-z]+):(\d+)$/, async (ctx) => renderCompsPage(ctx, ctx.match![1], parseInt(ctx.match![2], 10) || 0));
  trk.callbackQuery(/^(trk_sub|trk_unsub):([^:]+):([a-z]+):(\d+)$/, async (ctx) => {
    const [_, act, id, disc, pStr] = ctx.match!;
    const uid = ctx.from?.id;
    const chatId = ctx.chat?.id || uid;
    if (!uid || !chatId) return;
    const user = (await getTrackerUser(cache, uid, encSecret)) || createDefaultTrackerUser(uid, chatId);
    if (act === 'trk_sub') {
      const ev = findTrackerCompetitionById(id);
      if (ev && !user.competitions.some((c) => c.id === id)) {
        user.competitions.push({
          id: ev.id,
          query: ev.location,
          title: `${ev.discipline} (${ev.rank})`,
          city: ev.location,
          date: ev.dateRaw,
          lastStatus: ev.status,
          createdAt: new Date().toISOString(),
        });
      }
    } else {
      user.competitions = (user.competitions || []).filter((c) => c.id !== id);
    }
    await saveTrackerUser(cache, user, encSecret);
    await renderCompsPage(ctx, disc, parseInt(pStr, 10) || 0);
  });
  trk.callbackQuery('trk_rebind_ok', async (ctx) => {
    const uid = ctx.from?.id;
    const chatId = ctx.chat?.id || uid;
    if (!uid || !chatId || !cache) return;
    const raw = await cache.get(`trk:rebind:${uid}`);
    await cache.delete(`trk:rebind:${uid}`);
    const token = raw ? (JSON.parse(raw) as { token?: string }).token : undefined;
    if (!token) {
      await safeEditOrReply(ctx, 'Срок подтверждения истек.', { reply_markup: getTrackerMainKeyboard(false, TRACKER_WEBAPP_URL) }, cache);
      return;
    }
    const res = await syncTokenToUser(cache, uid, chatId, token, encSecret);
    await safeEditOrReply(
      ctx,
      res.ok ? `Аккаунт обновлен. Заявок: ${res.count}.` : 'Не удалось проверить токен.',
      { parse_mode: 'HTML', reply_markup: getTrackerMainKeyboard(res.ok, TRACKER_WEBAPP_URL) },
      cache,
    );
  });
  trk.callbackQuery('trk_rebind_no', renderHub);

  return trk;
}
