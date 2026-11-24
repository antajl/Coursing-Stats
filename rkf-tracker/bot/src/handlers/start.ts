// Handler: /start command (Strict Zero Emoji & Single-Bubble Menu)
import type { Composer } from 'grammy';
import type { BotContext, UserRecord } from '../types.js';
import { getMainMenuKeyboard } from '../keyboards.js';
import { getUser, saveUser, createDefaultUser } from '../storage/index.js';

export function buildStartText(user: UserRecord | null): string {
  const isLinked = Boolean(user && user.rkfToken);
  let statusLine = '• Статус: Аккаунт не привязан (доступен поиск состязаний)';
  if (isLinked && user) {
    const total = Object.keys(user.cachedApps || {}).length;
    const ready = Object.values(user.cachedApps || {}).filter(a => a.statusGroup === 'ready').length;
    statusLine = `• Статус: Аккаунт подключен • Заявок: ${total} • Готово: ${ready}`;
  }

  return (
    `CoursingStats Tracker\n` +
    `Мониторинг документов и официальных состязаний РКФ\n` +
    `— — — — — — — — — — — — — — —\n` +
    `${statusLine}\n` +
    `• Календарь 2026: 72 состязания (курсинг, бега, БЗМП)\n\n` +
    `Сервис автоматически отслеживает готовность дипломов на rkf.online и официальное утверждение состязаний в графиках РКФ.\n\n` +
    `Выберите раздел в меню:`
  );
}

export function registerStartHandler(composer: Composer<BotContext>): void {
  composer.command('start', async (ctx) => {
    const userId = ctx.from?.id;
    const chatId = ctx.chat?.id;
    if (!userId || !chatId) return;

    let user = await getUser(ctx.env.KV_STORAGE, userId);
    if (!user) {
      user = createDefaultUser(userId, chatId);
      await saveUser(ctx.env.KV_STORAGE, user);
    }

    const webAppUrl = ctx.env.WEBAPP_URL || 'https://my.coursing-stats.ru';
    const text = buildStartText(user);
    const isLinked = Boolean(user && user.rkfToken);

    try {
      await ctx.setChatMenuButton({
        menu_button: {
          type: 'web_app',
          text: 'Кабинет',
          web_app: { url: webAppUrl }
        }
      });
    } catch {
      // Ignore if setChatMenuButton fails in test environments
    }

    await ctx.reply(text, {
      reply_markup: getMainMenuKeyboard(webAppUrl, isLinked)
    });
  });

  composer.callbackQuery('cmd_start', async (ctx) => {
    await ctx.answerCallbackQuery();
    const userId = ctx.from?.id;
    if (!userId) return;

    const user = await getUser(ctx.env.KV_STORAGE, userId);
    const webAppUrl = ctx.env.WEBAPP_URL || 'https://my.coursing-stats.ru';
    const text = buildStartText(user);
    const isLinked = Boolean(user && user.rkfToken);

    try {
      await ctx.editMessageText(text, {
        reply_markup: getMainMenuKeyboard(webAppUrl, isLinked)
      });
    } catch {
      // Content did not change
    }
  });
}
