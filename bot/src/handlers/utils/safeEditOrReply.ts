import type { KVNamespace } from '../context';

/**
 * Безопасно редактирует сообщение или отправляет новое если редактирование не удается
 * @param ctx - контекст Grammy
 * @param text - текст сообщения
 * @param options - опции сообщения (parse_mode, reply_markup и т.д.)
 * @param cache - опциональное KV хранилище для сохранения ID сообщения
 */
export async function safeEditOrReply(ctx: any, text: string, options: any = {}, cache?: KVNamespace) {
  const userId = ctx.from?.id?.toString();
  const chatId = ctx.chat?.id;
  const msg = ctx.callbackQuery?.message;
  
  // 1. If called from an inline callback query
  if (msg) {
    try {
      if ('photo' in msg && msg.photo) {
        if (text.length <= 1024) {
          await ctx.editMessageCaption({
            caption: text,
            parse_mode: options.parse_mode,
            reply_markup: options.reply_markup,
          });
          return;
        }
        // Caption exceeds 1024 characters; delete photo and send standard message
        try {
          await ctx.deleteMessage();
        } catch {}
        const message = await ctx.reply(text, options);
        if (message?.message_id && userId && cache) {
          await cache.put(`last_message:${userId}`, message.message_id.toString(), { expirationTtl: 86400 });
        }
        return;
      }
      await ctx.editMessageText(text, options);
      if (chatId && msg.message_id) {
        if (options?.reaction) {
          ctx.api.setMessageReaction(chatId, msg.message_id, [{ type: 'emoji', emoji: options.reaction }]).catch(() => {});
        } else {
          ctx.api.setMessageReaction(chatId, msg.message_id, []).catch(() => {});
        }
      }
      return;
    } catch (editError: any) {
      if (editError?.description?.includes('message is not modified')) {
        return;
      }
    }
  }

  // 2. If called from a text message / command, edit the active window in-place if possible
  if (!msg && userId && chatId && cache) {
    const lastMessageKey = `last_message:${userId}`;
    const lastMessageId = await cache.get(lastMessageKey);

    if (lastMessageId) {
      try {
        const msgIdNum = parseInt(lastMessageId, 10);
        await ctx.api.editMessageText(chatId, msgIdNum, text, options);
        if (options?.reaction) {
          ctx.api.setMessageReaction(chatId, msgIdNum, [{ type: 'emoji', emoji: options.reaction }]).catch(() => {});
        } else {
          ctx.api.setMessageReaction(chatId, msgIdNum, []).catch(() => {});
        }
        return; // Successfully edited active window in-place!
      } catch (inPlaceError: any) {
        if (inPlaceError?.description?.includes('message is not modified')) {
          return;
        }
        // If edit failed (e.g. previous was photo banner or message too old), delete old message
        try {
          await ctx.api.deleteMessage(chatId, parseInt(lastMessageId, 10));
        } catch {}
      }
    }
  }

  // 3. Fallback: delete old message if any, send 1 new message and record in KV
  if (msg?.message_id && chatId) {
    try {
      await ctx.api.deleteMessage(chatId, msg.message_id);
    } catch {}
  } else if (userId && chatId && cache) {
    const lastMessageKey = `last_message:${userId}`;
    const lastMessageId = await cache.get(lastMessageKey);
    if (lastMessageId) {
      try {
        await ctx.api.deleteMessage(chatId, parseInt(lastMessageId, 10));
      } catch {}
    }
  }

  try {
    const message = await ctx.reply(text, options);
    if (message?.message_id) {
      if (options?.reaction && chatId) {
        ctx.api.setMessageReaction(chatId, message.message_id, [{ type: 'emoji', emoji: options.reaction }]).catch(() => {});
      }
      if (userId && cache) {
        const lastMessageKey = `last_message:${userId}`;
        await cache.put(lastMessageKey, message.message_id.toString(), { expirationTtl: 86400 });
      }
    }
  } catch (replyError) {
    console.error('[safeEditOrReply] Failed to send reply:', replyError);
  }
}
