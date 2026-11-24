// Token linking service logic for RKF Tracker (Strict Zero Emoji & File Budget)
import type { BotContext } from '../types.js';
import { getUser, saveUser, createDefaultUser } from '../storage/index.js';
import { validateRkfToken, fetchRkfApplications } from '../services/rkf-api.js';
import {
  getMainMenuKeyboard,
  getBackToMenuKeyboard,
  getRebindConfirmationKeyboard
} from '../keyboards.js';
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
  user.authExpiredNotifiedAt = undefined;

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

export async function handleTokenBinding(
  ctx: BotContext,
  userId: number,
  chatId: number,
  rawToken: string,
  sourceLabel: string = 'Аккаунт rkf.online'
): Promise<void> {
  const clean = rawToken.replace(/^["']|["']$/g, '').replace(/^Bearer\s+/i, '').trim();
  let user = (await getUser(ctx.env.KV_STORAGE, userId)) || createDefaultUser(userId, chatId);
  const webAppUrl = ctx.env.WEBAPP_URL || 'https://coursing-stats.ru/tracker/';

  // Scenario 1: Same account already linked
  if (user.rkfToken && user.rkfToken === clean) {
    const linkRes = await linkUserToken(ctx, userId, chatId, clean, sourceLabel);
    user = (await getUser(ctx.env.KV_STORAGE, userId)) || user;
    await renderSingleBubble(
      ctx,
      user,
      `Этот аккаунт уже привязан к Telegram\n` +
      `— — — — — — — — — — — — — — —\n` +
      `• Способ: ${sourceLabel}\n` +
      `• Статус: Данный профиль rkf.online уже подключен к вашему боту.\n` +
      `• Всего заявок: ${linkRes.count} (Готово к выдаче: ${linkRes.ready})\n` +
      `• Мониторинг: активен (ежечасная проверка)\n\n` +
      `Повторная привязка не требуется. Данные обновлены в главном меню:`,
      getMainMenuKeyboard(webAppUrl, true)
    );
    return;
  }

  // Scenario 2: Different account already linked -> Ask confirmation
  if (user.rkfToken && user.rkfToken !== clean) {
    const isValid = await validateRkfToken(clean);
    if (!isValid) {
      await renderSingleBubble(
        ctx,
        user,
        `[ОШИБКА] Не удалось верифицировать полученную сессию РКФ.\n` +
        `Пожалуйста, войдите в аккаунт на rkf.online и нажмите кнопку привязки еще раз.`,
        getMainMenuKeyboard(webAppUrl, true)
      );
      return;
    }

    await ctx.env.KV_STORAGE.put(
      `rebind:pending:${userId}`,
      JSON.stringify({ token: clean, sourceLabel }),
      { expirationTtl: 600 }
    );

    const cachedApps = Object.values(user.cachedApps || {});
    const total = cachedApps.length;
    const ready = cachedApps.filter(a => a.statusGroup === 'ready').length;
    const comps = user.competitions?.length || 0;

    await renderSingleBubble(
      ctx,
      user,
      `Внимание: смена профиля\n` +
      `— — — — — — — — — — — — — — —\n` +
      `К вашему Telegram уже подключен другой профиль rkf.online:\n` +
      `• Всего заявок: ${total} (Готово к выдаче: ${ready})\n` +
      `• Отслеживание состязаний: ${comps} активных\n\n` +
      `Вы собираетесь привязать другой аккаунт РКФ.\n` +
      `Заменить текущий профиль на новый?`,
      getRebindConfirmationKeyboard()
    );
    return;
  }

  // Scenario 3: First time binding
  const linkRes = await linkUserToken(ctx, userId, chatId, clean, sourceLabel);
  if (linkRes.ok) {
    user = (await getUser(ctx.env.KV_STORAGE, userId)) || user;
    await renderSingleBubble(
      ctx,
      user,
      `[УСПЕШНО] Аккаунт rkf.online привязан!\n` +
      `— — — — — — — — — — — — — — —\n` +
      `• Способ: ${sourceLabel}\n` +
      `• Найдено заявок: ${linkRes.count}\n` +
      `• Готово к выдаче: ${linkRes.ready}\n` +
      `• Режим: автоматический ежечасный мониторинг\n\n` +
      `Данные обновлены в главном меню:`,
      getMainMenuKeyboard(webAppUrl, true)
    );
  } else {
    await renderSingleBubble(
      ctx,
      user,
      `[ОШИБКА] Не удалось верифицировать полученную сессию РКФ.\n` +
      `Пожалуйста, войдите в аккаунт на rkf.online и нажмите кнопку привязки еще раз.`,
      getMainMenuKeyboard(webAppUrl, false)
    );
  }
}

export async function processDirectToken(
  ctx: BotContext,
  userId: number,
  chatId: number,
  rawToken: string
): Promise<void> {
  const user = (await getUser(ctx.env.KV_STORAGE, userId)) || createDefaultUser(userId, chatId);
  await ctx.replyWithChatAction('typing').catch(() => {});
  await renderSingleBubble(
    ctx,
    user,
    `Привязка аккаунта rkf.online\n` +
    `— — — — — — — — — — — — — — —\n` +
    `• Статус: Проверяем сессию и загружаем документы...\n\n` +
    `Пожалуйста, подождите несколько секунд.`
  );
  await handleTokenBinding(ctx, userId, chatId, rawToken, 'Прямой ввод');
}
