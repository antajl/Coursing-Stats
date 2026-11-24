// Handler: /help command (Strict Zero Emoji & Single-Bubble UX)
import type { Composer } from 'grammy';
import type { BotContext } from '../types.js';
import { getUser, createDefaultUser } from '../storage/index.js';
import { getBackToMenuKeyboard } from '../keyboards.js';
import { renderSingleBubble } from './render-bubble.js';

export const HELP_TEXT =
  `Справочник CoursingStats Tracker\n` +
  `— — — — — — — — — — — — — — —\n` +
  `Основные возможности:\n` +
  `• /start — главное меню и сводка\n` +
  `• /account — управление привязкой РКФ\n` +
  `• /apps — список документов rkf.online\n` +
  `• /ready — документы, готовые к выдаче\n` +
  `• /competitions — состязания РКФ 2026\n` +
  `• /track <id|город> — подписаться на состязание\n` +
  `• /auth — привязать аккаунт rkf.online\n` +
  `• /logout — сбросить авторизацию\n` +
  `• /help — эта справка\n\n` +
  `Интерактивный дашборд «Кабинет» доступен по кнопке слева от поля ввода текста.`;

export function registerHelpHandler(composer: Composer<BotContext>): void {
  composer.command('help', async (ctx) => {
    const userId = ctx.from?.id;
    const chatId = ctx.chat?.id;
    if (!userId || !chatId) return;

    const user = (await getUser(ctx.env.KV_STORAGE, userId)) || createDefaultUser(userId, chatId);
    await renderSingleBubble(ctx, user, HELP_TEXT, getBackToMenuKeyboard());
  });

  composer.callbackQuery('cmd_help', async (ctx) => {
    await ctx.answerCallbackQuery({ text: 'Справка...' });
    const userId = ctx.from?.id;
    const chatId = ctx.chat?.id;
    if (!userId || !chatId) return;

    const user = (await getUser(ctx.env.KV_STORAGE, userId)) || createDefaultUser(userId, chatId);
    await renderSingleBubble(ctx, user, HELP_TEXT, getBackToMenuKeyboard());
  });
}
