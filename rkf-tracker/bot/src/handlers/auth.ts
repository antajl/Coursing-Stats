// Handler: /auth and /logout commands (Strict Zero Emoji)
import type { Composer } from 'grammy';
import type { BotContext } from '../types.js';
import { getUser, saveUser, createDefaultUser } from '../storage/index.js';
import { validateRkfToken, fetchRkfApplications } from '../services/rkf-api.js';
import { getMainMenuKeyboard } from '../keyboards.js';

export function registerAuthHandler(composer: Composer<BotContext>): void {
  composer.command('auth', async (ctx) => {
    const userId = ctx.from?.id;
    const chatId = ctx.chat?.id;
    if (!userId || !chatId) return;

    const parts = (ctx.message?.text || '').split(/\s+/);
    if (parts.length > 1) {
      const rawToken = parts.slice(1).join(' ').trim();
      try {
        await ctx.deleteMessage();
      } catch {
        // Ignore deletion failures if rights are missing
      }
      await processToken(ctx, userId, chatId, rawToken);
      return;
    }

    const text =
      `Привязка аккаунта rkf.online:\n\n` +
      `Отправьте ваш API-токен одним сообщением в формате:\n` +
      `/auth <ваш_токен>\n\n` +
      `Либо просто пришлите токен следующим сообщением.\n` +
      `Бот сразу удалит сообщение с токеном из чата для безопасности.\n\n` +
      `Как взять токен: на rkf.online в DevTools (F12) -> Local Storage -> "apikey" или через расширение CoursingStats Tracker.`;

    await ctx.reply(text);
  });

  composer.command('logout', async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    const user = await getUser(ctx.env.KV_STORAGE, userId);
    if (!user || !user.rkfToken) {
      await ctx.reply('Аккаунт РКФ не был привязан.');
      return;
    }

    user.rkfToken = undefined;
    user.cachedApps = {};
    await saveUser(ctx.env.KV_STORAGE, user);

    const webAppUrl = ctx.env.WEBAPP_URL || 'https://my.coursing-stats.ru';
    await ctx.reply('Авторизация успешно сброшена. Токен удален из базы бота.', {
      reply_markup: getMainMenuKeyboard(webAppUrl)
    });
  });

  // Text message listener for direct token paste
  composer.on('message:text', async (ctx, next) => {
    const text = ctx.message.text.trim();
    if (text.startsWith('/')) {
      return next();
    }

    // Typical JWT / Bearer tokens are > 30 chars and contain base64 or alphanumeric
    if (text.length >= 30 && !text.includes(' ') && !text.startsWith('http')) {
      const userId = ctx.from?.id;
      const chatId = ctx.chat?.id;
      if (!userId || !chatId) return next();

      try {
        await ctx.deleteMessage();
      } catch {
        // Ignore
      }

      await processToken(ctx, userId, chatId, text);
      return;
    }

    return next();
  });
}

async function processToken(ctx: BotContext, userId: number, chatId: number, rawToken: string): Promise<void> {
  const clean = rawToken.replace(/^["']|["']$/g, '').replace(/^Bearer\s+/i, '').trim();
  const checkingMsg = await ctx.reply('[Проверка] Выполняется верификация токена в API RKF...');

  const isValid = await validateRkfToken(clean);
  if (!isValid) {
    await ctx.api.editMessageText(
      chatId,
      checkingMsg.message_id,
      '[ОШИБКА] Токен не принят API RKF. Проверьте актуальность токена и попробуйте снова.'
    );
    return;
  }

  let user = await getUser(ctx.env.KV_STORAGE, userId);
  if (!user) {
    user = createDefaultUser(userId, chatId);
  }

  user.rkfToken = clean;
  user.linkedAt = new Date().toISOString();

  // Initial sync
  try {
    const apps = await fetchRkfApplications(clean, user.receivedBarcodes);
    user.cachedApps = {};
    for (const app of apps) {
      user.cachedApps[app.barcode] = {
        status: app.currentStatus,
        statusGroup: app.statusGroup,
        lastUpdated: app.lastUpdated
      };
    }
    user.lastCheckedAt = new Date().toISOString();
  } catch {
    // Ignore initial fetch sync failures
  }

  await saveUser(ctx.env.KV_STORAGE, user);

  const webAppUrl = ctx.env.WEBAPP_URL || 'https://my.coursing-stats.ru';
  await ctx.api.editMessageText(
    chatId,
    checkingMsg.message_id,
    `[УСПЕШНО] Аккаунт rkf.online привязан!\n\n` +
    `Найдено заявок: ${Object.keys(user.cachedApps).length}\n` +
    `Бот будет ежечасно проверять статус ваших документов и присылать уведомления.`
  );

  await ctx.reply('Используйте меню или откройте веб-кабинет «Мои заявки»:', {
    reply_markup: getMainMenuKeyboard(webAppUrl)
  });
}
