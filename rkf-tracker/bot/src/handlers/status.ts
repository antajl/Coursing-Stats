// Handler: /status command (Strict Zero Emoji)
import type { Composer } from 'grammy';
import type { BotContext } from '../types.js';
import { getUser } from '../storage/index.js';
import { getMainMenuKeyboard } from '../keyboards.js';

export function registerStatusHandler(composer: Composer<BotContext>): void {
  const handler = async (ctx: BotContext) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    const user = await getUser(ctx.env.KV_STORAGE, userId);
    const webAppUrl = ctx.env.WEBAPP_URL || 'https://my.coursing-stats.ru';

    if (!user || !user.rkfToken) {
      const notLinkedMsg =
        `Статус мониторинга:\n` +
        `- Аккаунт РКФ: НЕ ПРИВЯЗАН\n` +
        `- Отслеживание состязаний: ${user?.competitions.length || 0} активных\n\n` +
        `Чтобы получать уведомления о готовности дипломов и сертификатов, привяжите токен через команду /auth.`;
      await ctx.reply(notLinkedMsg, {
        reply_markup: getMainMenuKeyboard(webAppUrl)
      });
      return;
    }

    const cachedApps = Object.values(user.cachedApps || {});
    const readyCount = cachedApps.filter(a => a.statusGroup === 'ready').length;
    const totalCount = cachedApps.length;
    const compsCount = user.competitions?.length || 0;
    const lastCheck = user.lastCheckedAt
      ? new Date(user.lastCheckedAt).toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })
      : 'еще не выполнялась';

    const text =
      `Статус мониторинга RKF Tracker:\n` +
      `- Аккаунт РКФ: Подключен\n` +
      `- Всего отслеживаемых заявок: ${totalCount}\n` +
      `- Готово к выдаче: ${readyCount}\n` +
      `- Подписок на состязания: ${compsCount}\n` +
      `- Последняя проверка: ${lastCheck} (МСК)\n` +
      `- Периодичность опроса: раз в час (автоматически)\n\n` +
      `Для детального просмотра откройте веб-кабинет «Мои заявки».`;

    await ctx.reply(text, {
      reply_markup: getMainMenuKeyboard(webAppUrl)
    });
  };

  composer.command('status', handler);
  composer.callbackQuery('cmd_status', async (ctx) => {
    await ctx.answerCallbackQuery();
    await handler(ctx);
  });
}
