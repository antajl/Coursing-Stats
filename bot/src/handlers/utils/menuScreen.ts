import type { InlineKeyboard } from 'grammy';
import type { KVNamespace } from '../context';
import { safeEditOrReply } from '../commands';
import { BOT_PHOTOS } from '../../constants';
import { getMainInlineMenu, getPersistentReplyKeyboard } from '../../keyboards';

export interface MenuScreenOptions {
  photoUrl?: string;
  text: string;
  keyboard: InlineKeyboard;
}

export const WELCOME_TEXT = `
<b>Coursing Stats</b> — статистика соревнований собак

Отслеживайте результаты вашей собаки по курсингу, бегам борзых и выставкам.

<b>Возможности:</b>
• Рейтинги и топы по дисциплинам (включая Elo)
• Календарь соревнований и выставок
• История медалей и титулов
• Избранные собаки и быстрая карточка /mystats
• Поиск по породе /breed

<b>Как использовать:</b>
Напишите кличку собаки или выберите действие из меню ниже
`.trim();

/** Заголовок меню разделов с невидимыми em-пробелами для выравнивания ширины кнопок по ширине баннера */
export const MENU_HEADER = '<b>Разделы:</b>' + '\u2003'.repeat(16);

/**
 * Отправляет или обновляет главный экран бота в двух сообщениях:
 * - Сообщение 1: Фото-баннер + описание + ReplyKeyboard (постоянные нижние кнопки)
 * - Сообщение 2: Интерактивное меню (InlineKeyboard)
 */
export async function sendHomeScreen(
  ctx: any,
  cache: KVNamespace | undefined,
  welcomeText: string = WELCOME_TEXT,
  options: { forceNew?: boolean } = {},
): Promise<void> {
  const userId = ctx.from?.id?.toString();
  const chatId = ctx.chat?.id || (ctx.from?.id ? Number(ctx.from.id) : undefined);

  if (!chatId) return;

  const lastPhotoKey = userId ? `last_photo:${userId}` : null;
  const lastMessageKey = userId ? `last_message:${userId}` : null;

  // 1. Попытка плавного редактирования Сообщения 2 на месте (если не forceNew)
  if (!options.forceNew) {
    // Если вызов пришел из callback_query (инлайн-кнопки "На главную" / "Назад")
    if (ctx.callbackQuery?.message?.message_id) {
      try {
        await ctx.editMessageText(MENU_HEADER, {
          parse_mode: 'HTML',
          reply_markup: getMainInlineMenu(),
        });
        if (chatId && ctx.callbackQuery?.message?.message_id) {
          ctx.api?.setMessageReaction?.(chatId, ctx.callbackQuery.message.message_id, [])?.catch?.(() => {});
        }
        return;
      } catch (editError: any) {
        if (editError?.description?.includes('message is not modified')) {
          return;
        }
      }
    }

    // Если вызов из hears (нижняя кнопка "🏠 Главное меню")
    if (userId && cache && lastMessageKey && lastPhotoKey) {
      const [lastPhotoId, lastMessageId] = await Promise.all([
        cache.get(lastPhotoKey),
        cache.get(lastMessageKey),
      ]);

      if (lastPhotoId && lastMessageId) {
        try {
          const msgIdNum = parseInt(lastMessageId, 10);
          await ctx.api.editMessageText(chatId, msgIdNum, MENU_HEADER, {
            parse_mode: 'HTML',
            reply_markup: getMainInlineMenu(),
          });
          ctx.api?.setMessageReaction?.(chatId, msgIdNum, [])?.catch?.(() => {});
          return; // Успешно отредактировали на месте
        } catch (editError: any) {
          if (editError?.description?.includes('message is not modified')) {
            return;
          }
        }
      }
    }
  }

  // 2. Если forceNew или редактирование не удалось: полная переотправка 2 сообщений
  if (userId && cache && lastPhotoKey && lastMessageKey) {
    const [lastPhotoId, lastMessageId] = await Promise.all([
      cache.get(lastPhotoKey),
      cache.get(lastMessageKey),
    ]);
    if (lastPhotoId) {
      try {
        await ctx.api.deleteMessage(chatId, parseInt(lastPhotoId, 10));
      } catch {}
    }
    if (lastMessageId) {
      try {
        await ctx.api.deleteMessage(chatId, parseInt(lastMessageId, 10));
      } catch {}
    }
  }

  // Сообщение 1: Баннер с текстом и нижней клавиатурой ReplyKeyboard
  let photoMsgId: number | undefined;
  try {
    const photoMsg = await ctx.api.sendPhoto(chatId, BOT_PHOTOS.home, {
      caption: welcomeText,
      parse_mode: 'HTML',
      reply_markup: getPersistentReplyKeyboard(),
    });
    photoMsgId = photoMsg.message_id;
  } catch {
    // Фолбэк на текст если загрузка фото не удалась
    try {
      const textMsg = await ctx.api.sendMessage(chatId, welcomeText, {
        parse_mode: 'HTML',
        reply_markup: getPersistentReplyKeyboard(),
      });
      photoMsgId = textMsg.message_id;
    } catch {}
  }

  if (photoMsgId && userId && cache && lastPhotoKey) {
    await cache.put(lastPhotoKey, photoMsgId.toString(), { expirationTtl: 86400 * 7 });
  }

  // Сообщение 2: Интерактивные разделы меню (InlineKeyboard)
  try {
    const menuMsg = await ctx.api.sendMessage(chatId, MENU_HEADER, {
      parse_mode: 'HTML',
      reply_markup: getMainInlineMenu(),
    });
    if (menuMsg?.message_id && userId && cache && lastMessageKey) {
      await cache.put(lastMessageKey, menuMsg.message_id.toString(), { expirationTtl: 86400 * 7 });
    }
  } catch (menuErr) {
    console.error('[sendHomeScreen] Failed to send menu message:', menuErr);
  }
}

/**
 * Отправка подэкрана меню (редактирует активное окно)
 */
export async function sendMenuScreen(
  ctx: any,
  cache: KVNamespace | undefined,
  options: MenuScreenOptions,
): Promise<void> {
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
