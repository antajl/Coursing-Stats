// Token linking service logic for RKF Tracker (Strict Zero Emoji & File Budget)
import type { BotContext } from '../types.js';
import { getUser, saveUser, createDefaultUser } from '../storage/index.js';
import { validateRkfToken, fetchRkfApplications } from '../services/rkf-api.js';
import { getMainMenuKeyboard, getBackToMenuKeyboard } from '../keyboards.js';
import { renderSingleBubble } from './render-bubble.js';

export async function linkUserToken(
  ctx: BotContext,
  userId: number,
  chatId: number,
  rawToken: string,
  sourceLabel: string = 'Аккаунт rkf.online'
): Promise<{ ok: boolean; count: number; ready: number }> {
  const clean = rawToken.replace(/^["']|["']$/g, '').replace(/^Bearer\s+/i, '').trim();
  const isValid = await validateRkfToken(clean);
  if (!isValid) return { ok: false, count: 0, ready: 0 };

  let user = (await getUser(ctx.env.KV_STORAGE, userId)) || createDefaultUser(userId, chatId);
  user.rkfToken = clean;
  user.linkedAt = new Date().toISOString();

  try {
    const apps = await fetchRkfApplications(clean, user.receivedBarcodes);
    user.cachedApps = {};
    for (const app of apps) {
      user.cachedApps[app.barcode] = {
        status: app.currentStatus,
        statusGroup: app.statusGroup,
        lastUpdated: app.lastUpdated
      };
    }
    user.lastCheckedAt = new Date().toISOString();
  } catch {}

  await saveUser(ctx.env.KV_STORAGE, user);
  const count = Object.keys(user.cachedApps || {}).length;
  const ready = Object.values(user.cachedApps || {}).filter(a => a.statusGroup === 'ready').length;
  return { ok: true, count, ready };
}

export async function processDirectToken(
  ctx: BotContext,
  userId: number,
  chatId: number,
  rawToken: string
): Promise<void> {
  const user = (await getUser(ctx.env.KV_STORAGE, userId)) || createDefaultUser(userId, chatId);
  const res = await linkUserToken(ctx, userId, chatId, rawToken, 'Прямой ввод');
  const webAppUrl = ctx.env.WEBAPP_URL || 'https://coursing-stats.ru/tracker/';

  if (!res.ok) {
    await renderSingleBubble(
      ctx,
      user,
      `[ОШИБКА] Ключ не принят API RKF.\nПроверьте актуальность авторизации и попробуйте снова.`,
      getBackToMenuKeyboard()
    );
    return;
  }

  await renderSingleBubble(
    ctx,
    user,
    `[УСПЕШНО] Аккаунт rkf.online подключен!\n` +
    `— — — — — — — — — — — — — — —\n` +
    `• Найдено заявок: ${res.count}\n` +
    `• Готово к выдаче: ${res.ready}\n` +
    `• Мониторинг: ежечасный автоматический опрос`,
    getMainMenuKeyboard(webAppUrl, true)
  );
}
