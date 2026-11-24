// Handler: /help command (Strict Zero Emoji & Single-Bubble UX)
import type { Composer } from 'grammy';
import type { BotContext } from '../types.js';
import { getBackToMenuKeyboard } from '../keyboards.js';

export const HELP_TEXT =
  `Справочник CoursingStats Tracker\n` +
  `— — — — — — — — — — — — — — —\n` +
  `Основные команды:\n` +
  `• /start — главное меню и сводка\n` +
  `• /status — состояние мониторинга и заявок\n` +
  `• /apps — список документов rkf.online\n` +
  `• /ready — документы, готовые к выдаче\n` +
  `• /competitions — состязания РКФ 2026\n` +
  `• /track <id|город> — подписаться на состязание\n` +
  `• /auth — привязать токен rkf.online\n` +
  `• /logout — сбросить авторизацию\n` +
  `• /help — эта справка\n\n` +
  `Интерактивный дашборд «Кабинет» доступен по кнопке слева от поля ввода текста.`;

export function registerHelpHandler(composer: Composer<BotContext>): void {
  composer.command('help', async (ctx) => {
    await ctx.reply(HELP_TEXT, {
      reply_markup: getBackToMenuKeyboard()
    });
  });

  composer.callbackQuery('cmd_help', async (ctx) => {
    await ctx.answerCallbackQuery({ text: 'Справка...' });
    try {
      await ctx.editMessageText(HELP_TEXT, {
        reply_markup: getBackToMenuKeyboard()
      });
    } catch {
      await ctx.reply(HELP_TEXT, {
        reply_markup: getBackToMenuKeyboard()
      });
    }
  });
}
