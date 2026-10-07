import { Composer } from 'grammy';
import { CoursingStatsAPI } from '../../api';
import { getDoninoKeyboard } from '../../keyboards';
import { formatDoninoTopChatText } from '../../inlineQuery';
import type { KVNamespace } from '../context';
import { safeEditOrReply } from '../commands';

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

async function editDoninoList(ctx: any, text: string, kind: 'speed' | 'coursing', cache?: KVNamespace) {
  const reply_markup = getDoninoKeyboard(kind);
  await safeEditOrReply(ctx, text, { parse_mode: 'HTML', reply_markup }, cache);
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
    const records = await api.getSpeedRecords();
    const text = formatDoninoTopChatText(records.speed, records.coursing, { only: 'speed' });

    await editDoninoList(ctx, text, 'speed', cache);
  });

  donino.callbackQuery('donino_speed', async (ctx) => {
    const records = await api.getSpeedRecords();
    if (records.speed.length === 0) {
      await editDoninoList(ctx, 'Не удалось загрузить рекорды скорости', 'speed', cache);
      return;
    }
    const text = formatDoninoTopChatText(records.speed, records.coursing, { only: 'speed' });
    await editDoninoList(ctx, text, 'speed', cache);
  });

  donino.callbackQuery('donino_coursing', async (ctx) => {
    const records = await api.getSpeedRecords();
    if (records.coursing.length === 0) {
      await editDoninoList(ctx, 'Не удалось загрузить рекорды рейсинга 350м', 'coursing', cache);
      return;
    }
    const text = formatDoninoTopChatText(records.speed, records.coursing, { only: 'racing' });
    await editDoninoList(ctx, text, 'coursing', cache);
  });

  return donino;
}
