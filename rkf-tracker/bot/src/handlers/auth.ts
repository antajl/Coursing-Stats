// Handler: /auth, /login and WebApp authentication (Strict Zero Emoji & Single-Bubble UX)
import type { Composer } from 'grammy';
import type { BotContext } from '../types.js';
import { getUser, saveUser, createDefaultUser } from '../storage/index.js';
import { validateRkfToken, fetchRkfApplications } from '../services/rkf-api.js';
import {
  getMainMenuKeyboard,
  getAuthPromptKeyboard,
  getAuthLoginKeyboard,
  getAuthSubmenuKeyboard,
  getBackToMenuKeyboard
} from '../keyboards.js';
import {
  getAuthPromptText,
  getAuthLoginText,
  getAuthExtText,
  getAuthBookmarkletText
} from './auth-views.js';

export async function linkUserToken(
  ctx: BotContext,
  userId: number,
  chatId: number,
  rawToken: string,
  sourceLabel: string = 'Аккаунт rkf.online'
): Promise<{ ok: boolean; count: number; ready: number }> {
  const clean = rawToken.replace(/^["']|["']$/g, '').replace(/^Bearer\s+/i, '').trim();
  const isValid = await validateRkfToken(clean);
  if (!isValid) return { ok: false, count: 0, ready: 0 };

  let user = (await getUser(ctx.env.KV_STORAGE, userId)) || createDefaultUser(userId, chatId);
  user.rkfToken = clean;
  user.linkedAt = new Date().toISOString();

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
  } catch {}

  await saveUser(ctx.env.KV_STORAGE, user);
  const count = Object.keys(user.cachedApps || {}).length;
  const ready = Object.values(user.cachedApps || {}).filter(a => a.statusGroup === 'ready').length;
  return { ok: true, count, ready };
}

export function registerAuthHandler(composer: Composer<BotContext>): void {
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

    const webAppUrl = ctx.env.WEBAPP_URL || 'https://my.coursing-stats.ru';
    const linkRes = await linkUserToken(ctx, userId, chatId, token, 'Защищенный WebApp');
    if (linkRes.ok) {
      await ctx.reply(
        `[УСПЕШНО] Аккаунт rkf.online подключен!\n` +
        `— — — — — — — — — — — — — — —\n` +
        `• Способ: Защищенный вход WebApp\n` +
        `• Найдено заявок: ${linkRes.count}\n` +
        `• Готово к выдаче: ${linkRes.ready}\n` +
        `• Режим: автоматический ежечасный мониторинг`,
        { reply_markup: getMainMenuKeyboard(webAppUrl, true) }
      );
    } else {
      await ctx.reply(
        `[ОШИБКА] Не удалось верифицировать полученную сессию РКФ.\n` +
        `Пожалуйста, попробуйте войти снова.`,
        { reply_markup: getAuthPromptKeyboard(webAppUrl) }
      );
    }
  });

  // Auth selection hub
  composer.callbackQuery('cmd_auth_prompt', async (ctx) => {
    await ctx.answerCallbackQuery();
    const webAppUrl = ctx.env.WEBAPP_URL || 'https://my.coursing-stats.ru';
    try {
      await ctx.editMessageText(getAuthPromptText(), { reply_markup: getAuthPromptKeyboard(webAppUrl) });
    } catch {
      await ctx.reply(getAuthPromptText(), { reply_markup: getAuthPromptKeyboard(webAppUrl) });
    }
  });

  // Method 1: WebApp login modal
  composer.callbackQuery('cmd_auth_login', async (ctx) => {
    await ctx.answerCallbackQuery();
    const webAppUrl = ctx.env.WEBAPP_URL || 'https://my.coursing-stats.ru';
    try {
      await ctx.editMessageText(getAuthLoginText(webAppUrl), { reply_markup: getAuthLoginKeyboard(webAppUrl) });
    } catch {
      await ctx.reply(getAuthLoginText(webAppUrl), { reply_markup: getAuthLoginKeyboard(webAppUrl) });
    }
  });

  // Method 2: Browser Extension / Desktop guide
  composer.callbackQuery('cmd_auth_ext', async (ctx) => {
    await ctx.answerCallbackQuery();
    try {
      await ctx.editMessageText(getAuthExtText(), { reply_markup: getAuthSubmenuKeyboard() });
    } catch {
      await ctx.reply(getAuthExtText(), { reply_markup: getAuthSubmenuKeyboard() });
    }
  });

  // Method 3: Bookmarklet guide
  composer.callbackQuery('cmd_auth_bookmarklet', async (ctx) => {
    await ctx.answerCallbackQuery();
    try {
      await ctx.editMessageText(getAuthBookmarkletText(), { parse_mode: 'HTML', reply_markup: getAuthSubmenuKeyboard() });
    } catch {
      await ctx.reply(getAuthBookmarkletText(), { parse_mode: 'HTML', reply_markup: getAuthSubmenuKeyboard() });
    }
  });

  // Secure /login command: directs to WebApp without exposing password in chat
  composer.command('login', async (ctx) => {
    const webAppUrl = ctx.env.WEBAPP_URL || 'https://my.coursing-stats.ru';
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

    const webAppUrl = ctx.env.WEBAPP_URL || 'https://my.coursing-stats.ru';
    await ctx.reply(getAuthPromptText(), { reply_markup: getAuthPromptKeyboard(webAppUrl) });
  });

  composer.command('logout', async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    const user = await getUser(ctx.env.KV_STORAGE, userId);
    if (!user || !user.rkfToken) {
      await ctx.reply('Аккаунт РКФ не был привязан.', { reply_markup: getBackToMenuKeyboard() });
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

  // Silent direct token listener (for automated pasting or scripts)
  composer.on('message:text', async (ctx, next) => {
    const text = ctx.message.text.trim();
    if (text.startsWith('/')) return next();

    if (text.length >= 30 && !text.includes(' ') && !text.startsWith('http')) {
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

async function processDirectToken(ctx: BotContext, userId: number, chatId: number, rawToken: string): Promise<void> {
  const checking = await ctx.reply('[Проверка] Выполняется верификация сессии в API RKF...');
  const res = await linkUserToken(ctx, userId, chatId, rawToken, 'Прямой ввод');

  if (!res.ok) {
    await ctx.api.editMessageText(
      chatId,
      checking.message_id,
      `[ОШИБКА] Ключ не принят API RKF.\nПроверьте актуальность авторизации и попробуйте снова.`,
      { reply_markup: getBackToMenuKeyboard() }
    );
    return;
  }

  const webAppUrl = ctx.env.WEBAPP_URL || 'https://my.coursing-stats.ru';
  await ctx.api.editMessageText(
    chatId,
    checking.message_id,
    `[УСПЕШНО] Аккаунт rkf.online подключен!\n` +
    `— — — — — — — — — — — — — — —\n` +
    `• Найдено заявок: ${res.count}\n` +
    `• Готово к выдаче: ${res.ready}\n` +
    `• Мониторинг: ежечасный автоматический опрос`,
    { reply_markup: getMainMenuKeyboard(webAppUrl, true) }
  );
}
