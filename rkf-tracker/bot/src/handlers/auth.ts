// Handler: /auth, /login and the 4 onboarding methods (Strict Zero Emoji & Single-Bubble UX)
import type { Composer } from 'grammy';
import type { BotContext } from '../types.js';
import { getUser, saveUser, createDefaultUser } from '../storage/index.js';
import { validateRkfToken, fetchRkfApplications, authenticateRkfUser } from '../services/rkf-api.js';
import {
  getMainMenuKeyboard,
  getAuthPromptKeyboard,
  getAuthSubmenuKeyboard,
  getBackToMenuKeyboard
} from '../keyboards.js';
import {
  getAuthPromptText,
  getAuthLoginText,
  getAuthExtText,
  getAuthBookmarkletText,
  getAuthManualText
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
  // Method 0: Main auth selection hub
  composer.callbackQuery('cmd_auth_prompt', async (ctx) => {
    await ctx.answerCallbackQuery();
    const webAppUrl = ctx.env.WEBAPP_URL || 'https://my.coursing-stats.ru';
    try {
      await ctx.editMessageText(getAuthPromptText(), { reply_markup: getAuthPromptKeyboard(webAppUrl) });
    } catch {
      await ctx.reply(getAuthPromptText(), { reply_markup: getAuthPromptKeyboard(webAppUrl) });
    }
  });

  // Method 1: Email + Password guide
  composer.callbackQuery('cmd_auth_login', async (ctx) => {
    await ctx.answerCallbackQuery();
    const webAppUrl = ctx.env.WEBAPP_URL || 'https://my.coursing-stats.ru';
    try {
      await ctx.editMessageText(getAuthLoginText(webAppUrl), { reply_markup: getAuthSubmenuKeyboard() });
    } catch {
      await ctx.reply(getAuthLoginText(webAppUrl), { reply_markup: getAuthSubmenuKeyboard() });
    }
  });

  // Method 2: Browser Extension guide
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

  // Method 4: Manual token guide
  composer.callbackQuery('cmd_auth_manual', async (ctx) => {
    await ctx.answerCallbackQuery();
    try {
      await ctx.editMessageText(getAuthManualText(), { reply_markup: getAuthSubmenuKeyboard() });
    } catch {
      await ctx.reply(getAuthManualText(), { reply_markup: getAuthSubmenuKeyboard() });
    }
  });

  // /login command: /login <email> <password>
  composer.command('login', async (ctx) => {
    const userId = ctx.from?.id;
    const chatId = ctx.chat?.id;
    if (!userId || !chatId) return;

    try {
      await ctx.deleteMessage();
    } catch {}

    const text = (ctx.message?.text || '').replace(/^\/login/, '').trim();
    const parts = text.split(/\s+/);
    if (parts.length < 2) {
      await ctx.reply(
        `Вход по логину и паролю:\n` +
        `Отправьте команду в формате: /login <ваш_email> <ваш_пароль>\n\n` +
        `Бот немедленно удалит сообщение из чата ради вашей безопасности.`,
        { reply_markup: getAuthSubmenuKeyboard() }
      );
      return;
    }

    const email = parts[0];
    const password = parts.slice(1).join(' ');
    const checking = await ctx.reply('[Проверка] Авторизация в API RKF...');

    const res = await authenticateRkfUser(email, password);
    if (!res.ok || !res.apikey) {
      await ctx.api.editMessageText(
        chatId,
        checking.message_id,
        `[ОШИБКА] ${res.error || 'Неверный E-mail или пароль на rkf.online'}.`,
        { reply_markup: getAuthSubmenuKeyboard() }
      );
      return;
    }

    const linkRes = await linkUserToken(ctx, userId, chatId, res.apikey, 'Логин и пароль');
    const webAppUrl = ctx.env.WEBAPP_URL || 'https://my.coursing-stats.ru';
    await ctx.api.editMessageText(
      chatId,
      checking.message_id,
      `[УСПЕШНО] Аккаунт rkf.online подключен!\n` +
      `— — — — — — — — — — — — — — —\n` +
      `• Заявок найдено: ${linkRes.count}\n` +
      `• Готово к выдаче: ${linkRes.ready}\n` +
      `• Мониторинг: ежечасный опрос дипломов и состязаний`,
      { reply_markup: getMainMenuKeyboard(webAppUrl, true) }
    );
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
      await processManualToken(ctx, userId, chatId, rawToken);
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

      await processManualToken(ctx, userId, chatId, text);
      return;
    }

    return next();
  });
}

async function processManualToken(ctx: BotContext, userId: number, chatId: number, rawToken: string): Promise<void> {
  const checking = await ctx.reply('[Проверка] Выполняется верификация токена в API RKF...');
  const res = await linkUserToken(ctx, userId, chatId, rawToken, 'Прямой ввод токена');

  if (!res.ok) {
    await ctx.api.editMessageText(
      chatId,
      checking.message_id,
      `[ОШИБКА] Токен не принят API RKF.\nПроверьте актуальность токена и попробуйте снова.`,
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
