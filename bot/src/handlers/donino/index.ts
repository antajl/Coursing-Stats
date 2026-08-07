import { Composer } from 'grammy';
import { CoursingStatsAPI } from '../../api';
import { getDoninoKeyboard } from '../../keyboards';
import { formatDoninoTopChatText } from '../../inlineQuery';
import type { KVNamespace } from '../context';

/**
 * Helper function for adding emoji reactions
 * @param ctx - контекст Grammy
 * @param emoji - emoji для реакции
 */
async function addReaction(ctx: any, emoji: string) {
  try {
    await ctx.api.setMessageReaction(
      ctx.chat?.id,
      ctx.callbackQuery?.message?.message_id,
      [{ type: 'emoji', emoji }]
    );
  } catch (error) {
    console.error('[addReaction] Failed to add reaction:', error);
  }
}

async function editDoninoList(ctx: any, text: string, kind: 'speed' | 'coursing') {
  const reply_markup = getDoninoKeyboard(kind);
  try {
    const msg = ctx.callbackQuery?.message;
    if (msg && 'photo' in msg && msg.photo) {
      await ctx.editMessageCaption({ caption: text, parse_mode: 'HTML', reply_markup });
      return;
    }
    await ctx.editMessageText(text, { parse_mode: 'HTML', reply_markup });
  } catch {
    await ctx.reply(text, { parse_mode: 'HTML', reply_markup });
  }
}

/**
 * Обработчики рекордов Донино
 * @param api - клиент API Coursing Stats
 * @param cache - опциональное KV хранилище для кэширования
 * @returns экземпляр Composer с обработчиками рекордов Донино
 */
export function createDonino(api: CoursingStatsAPI, cache?: KVNamespace) {
  const donino = new Composer();

  // Donino records main menu — same tops as inline «донино курсинг»
  donino.callbackQuery('donino_records', async (ctx) => {
    await addReaction(ctx, '⏱');
    const userId = ctx.from?.id.toString();
    const chatId = ctx.chat?.id;
    const photoUrl = 'https://coursing-stats.ru/bot/banners/donino.png?v=2';

    if (chatId) {
      await ctx.api.sendChatAction(chatId, 'upload_photo');
    }

    if (userId && chatId && cache) {
      const lastMessageKey = `last_message:${userId}`;
      const lastMessageId = await cache.get(lastMessageKey);

      if (lastMessageId) {
        try {
          await ctx.api.deleteMessage(chatId, parseInt(lastMessageId));
        } catch (deleteError) {
          console.error('[donino_records] Failed to delete previous message:', deleteError);
        }
      }
    }

    const records = await api.getSpeedRecords();
    const text = formatDoninoTopChatText(records.speed, records.coursing, { only: 'speed' });

    try {
      const message = await ctx.replyWithPhoto(photoUrl, {
        caption: text,
        parse_mode: 'HTML',
        reply_markup: getDoninoKeyboard('speed'),
      });

      if (message.message_id && userId && cache) {
        const lastMessageKey = `last_message:${userId}`;
        await cache.put(lastMessageKey, message.message_id.toString(), { expirationTtl: 86400 });
      }
    } catch (error) {
      await ctx.reply(text, {
        parse_mode: 'HTML',
        reply_markup: getDoninoKeyboard('speed'),
      });
    }
  });

  donino.callbackQuery('donino_speed', async (ctx) => {
    const records = await api.getSpeedRecords();
    if (records.speed.length === 0) {
      await editDoninoList(ctx, 'Не удалось загрузить рекорды скорости', 'speed');
      return;
    }
    const text = formatDoninoTopChatText(records.speed, records.coursing, { only: 'speed' });
    await editDoninoList(ctx, text, 'speed');
  });

  donino.callbackQuery('donino_coursing', async (ctx) => {
    const records = await api.getSpeedRecords();
    if (records.coursing.length === 0) {
      await editDoninoList(ctx, 'Не удалось загрузить рекорды рейсинга 350м', 'coursing');
      return;
    }
    const text = formatDoninoTopChatText(records.speed, records.coursing, { only: 'racing' });
    await editDoninoList(ctx, text, 'coursing');
  });

  return donino;
}
