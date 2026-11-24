// Handler: /status command (Strict Zero Emoji & Single-Bubble UX)
import type { Composer } from 'grammy';
import type { BotContext, UserRecord } from '../types.js';
import { getUser } from '../storage/index.js';
import { getStatusKeyboard } from '../keyboards.js';

export function buildStatusText(user: UserRecord | null): string {
  if (!user || !user.rkfToken) {
    const comps = user?.competitions?.length || 0;
    return (
      `Статус мониторинга RKF Tracker\n` +
      `— — — — — — — — — — — — — — —\n` +
      `• Аккаунт РКФ: Не привязан\n` +
      `• Отслеживание состязаний: ${comps} активных\n` +
      `• Периодичность опроса: раз в час\n\n` +
      `Для автоматического мониторинга дипломов и сертификатов подключите аккаунт rkf.online.`
    );
  }

  const cachedApps = Object.values(user.cachedApps || {});
  const readyCount = cachedApps.filter(a => a.statusGroup === 'ready').length;
  const inProgressCount = cachedApps.filter(a => a.statusGroup === 'active').length;
  const totalCount = cachedApps.length;
  const compsCount = user.competitions?.length || 0;
  const lastCheck = user.lastCheckedAt
    ? new Date(user.lastCheckedAt).toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })
    : 'еще не выполнялась';

  return (
    `Статус мониторинга RKF Tracker\n` +
    `— — — — — — — — — — — — — — —\n` +
    `• Аккаунт РКФ: Подключен\n` +
    `• Всего заявок: ${totalCount}\n` +
    `• Готово к выдаче: ${readyCount}\n` +
    `• В обработке: ${inProgressCount}\n` +
    `• Подписок на состязания: ${compsCount}\n` +
    `• Последняя проверка: ${lastCheck} (МСК)\n` +
    `• Фоновый опрос: каждый час (автоматически)\n\n` +
    `Все заявки доступны в интерактивном веб-кабинете.`
  );
}

export function registerStatusHandler(composer: Composer<BotContext>): void {
  composer.command('status', async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    const user = await getUser(ctx.env.KV_STORAGE, userId);
    const isLinked = Boolean(user && user.rkfToken);
    const text = buildStatusText(user);

    await ctx.reply(text, {
      reply_markup: getStatusKeyboard(isLinked)
    });
  });

  composer.callbackQuery('cmd_status', async (ctx) => {
    await ctx.answerCallbackQuery({ text: 'Обновление статуса...' });
    const userId = ctx.from?.id;
    if (!userId) return;

    const user = await getUser(ctx.env.KV_STORAGE, userId);
    const isLinked = Boolean(user && user.rkfToken);
    const text = buildStatusText(user);

    try {
      await ctx.editMessageText(text, {
        reply_markup: getStatusKeyboard(isLinked)
      });
    } catch {
      await ctx.reply(text, {
        reply_markup: getStatusKeyboard(isLinked)
      });
    }
  });
}
