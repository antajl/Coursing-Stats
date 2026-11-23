// Handler: /help command (Strict Zero Emoji)
import type { Composer } from 'grammy';
import type { BotContext } from '../types.js';
import { getMainMenuKeyboard } from '../keyboards.js';

export function registerHelpHandler(composer: Composer<BotContext>): void {
  const helpText =
    `Справочник команд CoursingStats Tracker:\n\n` +
    `/status — состояние мониторинга, подключенный аккаунт и сводка заявок\n` +
    `/auth — привязка аккаунта rkf.online по API токену\n` +
    `/logout — сброс сохраненной авторизации\n` +
    `/apps — просмотр текущих заявок и документов\n` +
    `/ready — список документов, готовых к выдаче\n` +
    `/competitions — отслеживание утверждения соревнований РКФ\n` +
    `/track [название] — подписаться на утверждение состязания\n` +
    `/help — показать эту справку\n\n` +
    `Как получить токен rkf.online:\n` +
    `1. Войдите в личный кабинет на rkf.online в браузере.\n` +
    `2. Откройте DevTools (F12) -> вкладка Application / Хранилище -> Local Storage -> ключ "apikey".\n` +
    `3. Либо установите расширение CoursingStats Tracker для Chrome, которое копирует токен автоматически в 1 клик.\n` +
    `4. Отправьте команду /auth и вставьте полученный токен. Бот немедленно удалит сообщение с токеном из чата ради безопасности.`;

  composer.command('help', async (ctx) => {
    const webAppUrl = ctx.env.WEBAPP_URL || 'https://my.coursing-stats.ru';
    await ctx.reply(helpText, {
      reply_markup: getMainMenuKeyboard(webAppUrl)
    });
  });

  composer.callbackQuery('cmd_help', async (ctx) => {
    await ctx.answerCallbackQuery();
    const webAppUrl = ctx.env.WEBAPP_URL || 'https://my.coursing-stats.ru';
    await ctx.reply(helpText, {
      reply_markup: getMainMenuKeyboard(webAppUrl)
    });
  });
}
