import type { InlineKeyboard } from 'grammy';
import type { KVNamespace } from '../context';
import { safeEditOrReply } from '../commands';

export interface MenuScreenOptions {
  photoUrl?: string;
  text: string;
  keyboard: InlineKeyboard;
}

/**
 * Единая функция отправки экрана меню с баннером и очисткой предыдущего сообщения
 */
export async function sendMenuScreen(
  ctx: any,
  cache: KVNamespace | undefined,
  options: MenuScreenOptions,
): Promise<void> {
  const userId = ctx.from?.id?.toString();
  const chatId = ctx.chat?.id || (ctx.from?.id ? Number(ctx.from.id) : undefined);

  // Show typing or upload_photo indicator
  if (chatId) {
    try {
      if (options.photoUrl) {
        await ctx.api.sendChatAction(chatId, 'upload_photo');
      } else {
        await ctx.api.sendChatAction(chatId, 'typing');
      }
    } catch {
      // ignore
    }
  }

  // Delete previous bot message if tracked in cache
  if (userId && chatId && cache) {
    const lastMessageKey = `last_message:${userId}`;
    const lastMessageId = await cache.get(lastMessageKey);

    if (lastMessageId) {
      try {
        await ctx.api.deleteMessage(chatId, parseInt(lastMessageId, 10));
      } catch (deleteError) {
        // Ignore message delete failures
      }
    }
  }

  // Try sending photo banner if provided
  if (options.photoUrl && chatId) {
    try {
      const message = await ctx.api.sendPhoto(chatId, options.photoUrl, {
        caption: options.text,
        parse_mode: 'HTML',
        reply_markup: options.keyboard,
      });

      if (message?.message_id && userId && cache) {
        const lastMessageKey = `last_message:${userId}`;
        await cache.put(lastMessageKey, message.message_id.toString(), { expirationTtl: 86400 });
      }
      return;
    } catch (photoError) {
      // Fallback to text if photo fails
    }
  }

  // Fallback / text message
  await safeEditOrReply(
    ctx,
    options.text,
    {
      parse_mode: 'HTML',
      reply_markup: options.keyboard,
    },
    cache,
  );
}
