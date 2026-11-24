// Handler: /auth, /login and WebApp authentication (Strict Zero Emoji & Single-Bubble UX)
import type { Composer } from 'grammy';
import type { BotContext } from '../types.js';
import { getUser, saveUser, createDefaultUser } from '../storage/index.js';
import {
  getMainMenuKeyboard,
  getAuthPromptKeyboard,
  getAuthLoginKeyboard,
  getAuthSubmenuKeyboard,
  getBackToMenuKeyboard
} from '../keyboards.js';
import { renderSingleBubble } from './render-bubble.js';
import {
  getAuthPromptText,
  getAuthLoginText,
  getAuthExtText,
  getAuthBookmarkletText
} from './auth-views.js';
import { linkUserToken, processDirectToken, handleTokenBinding } from './auth-link.js';
import { registerRebindHandlers } from './auth-rebind.js';
export { linkUserToken, handleTokenBinding } from './auth-link.js';

export function registerAuthHandler(composer: Composer<BotContext>): void {
  registerRebindHandlers(composer);

  // Mini App data receiver: Telegram.WebApp.sendData()
  composer.on('message:web_app_data', async (ctx) => {
    const userId = ctx.from?.id;
    const chatId = ctx.chat?.id;
    if (!userId || !chatId) return;

    const rawData = ctx.message.web_app_data.data;
    let token = rawData;
    try {
      const parsed = JSON.parse(rawData);
      if (parsed.token) token = parsed.token;
      else if (parsed.apikey) token = parsed.apikey;
    } catch {}

    const initialUser = (await getUser(ctx.env.KV_STORAGE, userId)) || createDefaultUser(userId, chatId);
    await ctx.replyWithChatAction('typing').catch(() => {});
    await renderSingleBubble(
      ctx,
      initialUser,
      `Привязка аккаунта rkf.online\n` +
      `— — — — — — — — — — — — — — —\n` +
      `• Способ: Защищенный вход WebApp\n` +
      `• Статус: Проверяем сессию и загружаем документы...\n\n` +
      `Пожалуйста, подождите несколько секунд.`
    );

    await handleTokenBinding(ctx, userId, chatId, token, 'Защищенный WebApp');
  });

  // Auth selection hub
  composer.callbackQuery('cmd_auth_prompt', async (ctx) => {
    await ctx.answerCallbackQuery({ text: 'Выбор способа привязки...' });
    const webAppUrl = ctx.env.WEBAPP_URL || 'https://coursing-stats.ru/tracker/';
    try {
      await ctx.editMessageText(getAuthPromptText(), { reply_markup: getAuthPromptKeyboard(webAppUrl) });
    } catch {
      await ctx.reply(getAuthPromptText(), { reply_markup: getAuthPromptKeyboard(webAppUrl) });
    }
  });

  // Method 1: WebApp login modal
  composer.callbackQuery('cmd_auth_login', async (ctx) => {
    await ctx.answerCallbackQuery({ text: 'Форма входа...' });
    const webAppUrl = ctx.env.WEBAPP_URL || 'https://coursing-stats.ru/tracker/';
    try {
      await ctx.editMessageText(getAuthLoginText(webAppUrl), { reply_markup: getAuthLoginKeyboard(webAppUrl) });
    } catch {
      await ctx.reply(getAuthLoginText(webAppUrl), { reply_markup: getAuthLoginKeyboard(webAppUrl) });
    }
  });

  // Method 2: Browser Extension / Desktop guide
  composer.callbackQuery('cmd_auth_ext', async (ctx) => {
    await ctx.answerCallbackQuery({ text: 'Инструкция для ПК...' });
    try {
      await ctx.editMessageText(getAuthExtText(), { reply_markup: getAuthSubmenuKeyboard() });
    } catch {
      await ctx.reply(getAuthExtText(), { reply_markup: getAuthSubmenuKeyboard() });
    }
  });

  // Method 3: Bookmarklet guide
  composer.callbackQuery('cmd_auth_bookmarklet', async (ctx) => {
    await ctx.answerCallbackQuery({ text: 'Код закладки...' });
    try {
      await ctx.editMessageText(getAuthBookmarkletText(), { parse_mode: 'HTML', reply_markup: getAuthSubmenuKeyboard() });
    } catch {
      await ctx.reply(getAuthBookmarkletText(), { parse_mode: 'HTML', reply_markup: getAuthSubmenuKeyboard() });
    }
  });

  // Secure /login command: directs to WebApp without exposing password in chat
  composer.command('login', async (ctx) => {
    const webAppUrl = ctx.env.WEBAPP_URL || 'https://coursing-stats.ru/tracker/';
    try {
      await ctx.deleteMessage();
    } catch {}

    await ctx.reply(getAuthLoginText(webAppUrl), {
      reply_markup: getAuthLoginKeyboard(webAppUrl)
    });
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
      } catch {}
      await processDirectToken(ctx, userId, chatId, rawToken);
      return;
    }

    const webAppUrl = ctx.env.WEBAPP_URL || 'https://coursing-stats.ru/tracker/';
    await ctx.reply(getAuthPromptText(), { reply_markup: getAuthPromptKeyboard(webAppUrl) });
  });

  composer.command('logout', async (ctx) => {
    const userId = ctx.from?.id;
    const chatId = ctx.chat?.id;
    if (!userId || !chatId) return;

    let user = await getUser(ctx.env.KV_STORAGE, userId);
    if (!user) user = createDefaultUser(userId, chatId);

    user.rkfToken = undefined;
    user.cachedApps = {};
    await saveUser(ctx.env.KV_STORAGE, user);

    const webAppUrl = ctx.env.WEBAPP_URL || 'https://coursing-stats.ru/tracker/';
    await renderSingleBubble(
      ctx,
      user,
      `Авторизация успешно сброшена.\n` +
      `— — — — — — — — — — — — — — —\n` +
      `Токен и сохраненные данные удалены из базы бота.`,
      getMainMenuKeyboard(webAppUrl, false)
    );
  });

  composer.callbackQuery('cmd_logout', async (ctx) => {
    await ctx.answerCallbackQuery({ text: 'Выход из профиля...' });
    const userId = ctx.from?.id;
    const chatId = ctx.chat?.id;
    if (!userId || !chatId) return;

    let user = await getUser(ctx.env.KV_STORAGE, userId);
    if (!user) user = createDefaultUser(userId, chatId);

    user.rkfToken = undefined;
    user.cachedApps = {};
    await saveUser(ctx.env.KV_STORAGE, user);

    const webAppUrl = ctx.env.WEBAPP_URL || 'https://coursing-stats.ru/tracker/';
    await renderSingleBubble(
      ctx,
      user,
      `Авторизация успешно сброшена.\n` +
      `— — — — — — — — — — — — — — —\n` +
      `Токен и сохраненные заявки удалены из бота.`,
      getMainMenuKeyboard(webAppUrl, false)
    );
  });

  // Silent direct token listener (for automated pasting or scripts)
  composer.on('message:text', async (ctx, next) => {
    const text = ctx.message.text.trim();
    if (text.startsWith('/')) return next();

    if (/^[A-Za-z0-9._-]{40,}$/.test(text) && !text.startsWith('http')) {
      const userId = ctx.from?.id;
      const chatId = ctx.chat?.id;
      if (!userId || !chatId) return next();

      try {
        await ctx.deleteMessage();
      } catch {}

      await processDirectToken(ctx, userId, chatId, text);
      return;
    }

    return next();
  });
}
