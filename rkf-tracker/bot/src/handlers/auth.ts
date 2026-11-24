// Handler: /auth, /logout and onboarding prompts (Strict Zero Emoji & Single-Bubble UX)
import type { Composer } from 'grammy';
import type { BotContext } from '../types.js';
import { getUser, saveUser, createDefaultUser } from '../storage/index.js';
import { validateRkfToken, fetchRkfApplications } from '../services/rkf-api.js';
import {
  getMainMenuKeyboard,
  getAuthPromptKeyboard,
  getAuthHowKeyboard,
  getBackToMenuKeyboard
} from '../keyboards.js';

export function registerAuthHandler(composer: Composer<BotContext>): void {
  // Onboarding prompt modal (in-place)
  composer.callbackQuery('cmd_auth_prompt', async (ctx) => {
    await ctx.answerCallbackQuery();
    const webAppUrl = ctx.env.WEBAPP_URL || 'https://my.coursing-stats.ru';
    const text =
      `Подключение аккаунта rkf.online\n` +
      `— — — — — — — — — — — — — — —\n` +
      `Бот автоматически отслеживает готовность чемпионских дипломов и сертификатов, присылая уведомления при изменении статусов.\n\n` +
      `Способы подключения:\n` +
      `1. Веб-кабинет: откройте кабинет в браузере и авторизуйтесь\n` +
      `2. Прямой ввод: пришлите токен rkf.online сообщением в этот чат или командой /auth <токен>\n\n` +
      `Сообщение с токеном будет немедленно удалено из чата ради безопасности.`;

    try {
      await ctx.editMessageText(text, {
        reply_markup: getAuthPromptKeyboard(webAppUrl)
      });
    } catch {
      await ctx.reply(text, {
        reply_markup: getAuthPromptKeyboard(webAppUrl)
      });
    }
  });

  // Step-by-step token extraction instructions (in-place)
  composer.callbackQuery('cmd_auth_how', async (ctx) => {
    await ctx.answerCallbackQuery();
    const text =
      `Как скопировать токен rkf.online\n` +
      `— — — — — — — — — — — — — — —\n` +
      `1. Откройте сайт rkf.online в браузере на компьютере и войдите в свой аккаунт.\n` +
      `2. Нажмите клавишу F12 (или «Просмотреть код» в меню браузера).\n` +
      `3. Перейдите во вкладку «Приложение» (Application) или «Хранилище» (Storage).\n` +
      `4. В левом меню раскройте «Локальное хранилище» (Local Storage) и выберите «https://rkf.online».\n` +
      `5. Найдите ключ "apikey" и скопируйте его длинное значение.\n` +
      `6. Отправьте скопированный токен в этот чат. Бот сразу удалит сообщение ради безопасности.\n\n` +
      `Также доступно расширение CoursingStats Tracker для Chrome, копирующее токен в 1 клик.`;

    try {
      await ctx.editMessageText(text, {
        reply_markup: getAuthHowKeyboard()
      });
    } catch {
      await ctx.reply(text, {
        reply_markup: getAuthHowKeyboard()
      });
    }
  });

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

    const webAppUrl = ctx.env.WEBAPP_URL || 'https://my.coursing-stats.ru';
    const text =
      `Подключение аккаунта rkf.online\n` +
      `— — — — — — — — — — — — — — —\n` +
      `Отправьте ваш API-токен одним сообщением в формате:\n` +
      `/auth <токен>\n\n` +
      `Либо просто пришлите токен следующим сообщением.\n` +
      `Бот сразу удалит сообщение с токеном из чата ради безопасности.`;

    await ctx.reply(text, {
      reply_markup: getAuthPromptKeyboard(webAppUrl)
    });
  });

  composer.command('logout', async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    const user = await getUser(ctx.env.KV_STORAGE, userId);
    if (!user || !user.rkfToken) {
      await ctx.reply('Аккаунт РКФ не был привязан.', {
        reply_markup: getBackToMenuKeyboard()
      });
      return;
    }

    user.rkfToken = undefined;
    user.cachedApps = {};
    await saveUser(ctx.env.KV_STORAGE, user);

    await ctx.reply(
      `Авторизация успешно сброшена.\n` +
      `— — — — — — — — — — — — — — —\n` +
      `Токен и сохраненные данные удалены из базы бота.`,
      { reply_markup: getBackToMenuKeyboard() }
    );
  });

  // Text message listener for direct token paste
  composer.on('message:text', async (ctx, next) => {
    const text = ctx.message.text.trim();
    if (text.startsWith('/')) {
      return next();
    }

    // Typical JWT / Bearer tokens are > 30 chars and contain alphanumeric/base64
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
      `[ОШИБКА] Токен не принят API RKF.\n\n` +
      `Проверьте актуальность токена и попробуйте снова.`,
      { reply_markup: getBackToMenuKeyboard() }
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

  const total = Object.keys(user.cachedApps).length;
  const ready = Object.values(user.cachedApps).filter(a => a.statusGroup === 'ready').length;
  const webAppUrl = ctx.env.WEBAPP_URL || 'https://my.coursing-stats.ru';

  await ctx.api.editMessageText(
    chatId,
    checkingMsg.message_id,
    `[УСПЕШНО] Аккаунт rkf.online подключен!\n` +
    `— — — — — — — — — — — — — — —\n` +
    `• Найдено заявок: ${total}\n` +
    `• Готово к выдаче: ${ready}\n` +
    `• Режим: автоматический ежечасный мониторинг\n\n` +
    `Бот будет присылать push-уведомления при готовности документов.`,
    { reply_markup: getMainMenuKeyboard(webAppUrl, true) }
  );
}
