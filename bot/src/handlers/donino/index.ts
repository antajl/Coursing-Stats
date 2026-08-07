import { Composer } from 'grammy';
import { CoursingStatsAPI } from '../../api';
import { getNavigationButtons, getDoninoKeyboard } from '../../keyboards';
import { SpeedRecordExtended } from '../../types';
import { safeEditOrReply } from '../commands';
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

/**
 * Обработчики рекордов Донино
 * @param api - клиент API Coursing Stats
 * @param cache - опциональное KV хранилище для кэширования
 * @returns экземпляр Composer с обработчиками рекордов Донино
 */
export function createDonino(api: CoursingStatsAPI, cache?: KVNamespace) {
  const donino = new Composer();

  // Donino records main menu
  donino.callbackQuery('donino_records', async (ctx) => {
    await addReaction(ctx, '⏱');
    const userId = ctx.from?.id.toString();
    const chatId = ctx.chat?.id;
    const photoUrl = 'https://coursing-stats.ru/bot/banners/donino.png?v=2';
    
    // Show typing indicator for better UX
    if (chatId) {
      await ctx.api.sendChatAction(chatId, 'upload_photo');
    }
    
    // Delete previous bot message if exists
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
    
    let text = '<b>⏱ Рекорды Донино</b>\n\n';
    
    if (records.speed.length === 0) {
      text += 'Не удалось загрузить рекорды скорости';
    } else {
      records.speed.slice(0, 10).forEach((record, index) => {
        const speed = (record as SpeedRecordExtended).speed_km_h || record.speed_kmh || record.speed || record.max_speed || record.speed_value || 0;
        text += `${index + 1}. ${record.name} (${record.breed}) - ${speed} км/ч\n`;
      });
    }
    
    try {
      const message = await ctx.replyWithPhoto(photoUrl, {
        caption: text,
        parse_mode: 'HTML',
        reply_markup: getDoninoKeyboard('speed')
      });
      
      if (message.message_id && userId && cache) {
        const lastMessageKey = `last_message:${userId}`;
        await cache.put(lastMessageKey, message.message_id.toString(), { expirationTtl: 86400 });
      }
    } catch (error) {
      await ctx.reply(text, {
        parse_mode: 'HTML',
        reply_markup: getDoninoKeyboard('speed')
      });
    }
  });

  donino.callbackQuery('donino_speed', async (ctx) => {
    await ctx.editMessageText('<b>Загрузка рекордов скорости...</b>', { parse_mode: 'HTML' });
    
    const records = await api.getSpeedRecords();
    
    if (records.speed.length === 0) {
      await ctx.editMessageText(
        'Не удалось загрузить рекорды скорости',
        { reply_markup: getDoninoKeyboard('speed') }
      );
      return;
    }
    
    let text = '<b>Рекорды скорости (Донино)</b>\n\n';
    
    records.speed.slice(0, 10).forEach((record, index) => {
      const speed = (record as SpeedRecordExtended).speed_km_h || record.speed_kmh || record.speed || record.max_speed || record.speed_value || 0;
      text += `${index + 1}. ${record.name} (${record.breed}) - ${speed} км/ч\n`;
    });
    
    await ctx.editMessageText(text, { 
      parse_mode: 'HTML',
      reply_markup: getDoninoKeyboard('speed')
    });
  });

  donino.callbackQuery('donino_coursing', async (ctx) => {
    await ctx.editMessageText('<b>Загрузка рекордов курсинга...</b>', { parse_mode: 'HTML' });
    
    const records = await api.getSpeedRecords();
    
    if (records.coursing.length === 0) {
      await ctx.editMessageText(
        'Не удалось загрузить рекорды курсинга',
        { reply_markup: getDoninoKeyboard('coursing') }
      );
      return;
    }
    
    let text = '<b>Рекорды курсинга (Донино)</b>\n\n';
    
    records.coursing.slice(0, 10).forEach((record, index) => {
      text += `${index + 1}. ${record.name} (${record.breed}) - ${record.time_seconds} сек\n`;
    });
    
    await ctx.editMessageText(text, { 
      parse_mode: 'HTML',
      reply_markup: getDoninoKeyboard('coursing')
    });
  });

  return donino;
}
