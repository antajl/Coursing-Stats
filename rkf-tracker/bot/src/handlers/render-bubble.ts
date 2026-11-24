// Strict Single-Bubble Message Manager (Guarantees strictly 1 active bubble in chat)
import type { InlineKeyboard } from 'grammy';
import type { BotContext, UserRecord } from '../types.js';
import { saveUser } from '../storage/index.js';

export async function renderSingleBubble(
  ctx: BotContext,
  user: UserRecord,
  text: string,
  replyMarkup?: InlineKeyboard,
  parseMode?: 'HTML'
): Promise<void> {
  const chatId = ctx.chat?.id || user.chatId;

  // 1. If invoked via text command (/start, /apps, /help etc.), delete the user's message
  if (ctx.message) {
    try {
      await ctx.deleteMessage();
    } catch {}
  }

  // 2. If invoked via inline button callback
  if (ctx.callbackQuery?.message) {
    user.lastBotMessageId = ctx.callbackQuery.message.message_id;
    try {
      await ctx.editMessageText(text, {
        reply_markup: replyMarkup,
        parse_mode: parseMode
      });
      await saveUser(ctx.env.KV_STORAGE, user);
      return;
    } catch (err: any) {
      if (err?.description?.includes('message is not modified')) {
        return;
      }
    }
  }

  // 3. If user has an existing active bot bubble recorded, attempt to edit it in place
  if (user.lastBotMessageId) {
    try {
      await ctx.api.editMessageText(chatId, user.lastBotMessageId, text, {
        reply_markup: replyMarkup,
        parse_mode: parseMode
      });
      return;
    } catch {
      // Message was deleted by user or expired (> 48h)
      try {
        await ctx.api.deleteMessage(chatId, user.lastBotMessageId);
      } catch {}
    }
  }

  // 4. Fallback: send fresh message and record its ID
  const sent = await ctx.reply(text, {
    reply_markup: replyMarkup,
    parse_mode: parseMode
  });
  user.lastBotMessageId = sent.message_id;
  await saveUser(ctx.env.KV_STORAGE, user);
}
