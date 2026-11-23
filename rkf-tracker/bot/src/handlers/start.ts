// Handler: /start command (Strict Zero Emoji)
import type { Composer } from 'grammy';
import type { BotContext } from '../types.js';
import { getMainMenuKeyboard, getReplyMenuKeyboard } from '../keyboards.js';
import { getUser, saveUser, createDefaultUser } from '../storage/index.js';

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
    const text =
      `CoursingStats Tracker\n` +
      `Неофициальный помощник собаковода от CoursingStats для отслеживания статусов на rkf.online.\n\n` +
      `Основные возможности:\n` +
      `- Мониторинг чемпионских дипломов и сертификатов РКФ\n` +
      `- Проверка утверждения состязаний и соревнований\n` +
      `- Push-уведомления при готовности документов\n` +
      `- Интерактивный дашборд «Мои заявки» внутри Telegram\n\n` +
      `Для начала работы привяжите аккаунт командой /auth или откройте веб-кабинет.`;

    await ctx.reply(text, {
      reply_markup: getReplyMenuKeyboard(webAppUrl)
    });

    await ctx.reply('Выберите действие в меню:', {
      reply_markup: getMainMenuKeyboard(webAppUrl)
    });
  });

  composer.callbackQuery('cmd_start', async (ctx) => {
    await ctx.answerCallbackQuery();
    const webAppUrl = ctx.env.WEBAPP_URL || 'https://my.coursing-stats.ru';
    const text = 'Главное меню CoursingStats Tracker:';
    await ctx.reply(text, {
      reply_markup: getMainMenuKeyboard(webAppUrl)
    });
  });
}
