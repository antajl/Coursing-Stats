// Handler: /start command (Strict Zero Emoji & Single-Bubble Menu)
import type { Composer } from 'grammy';
import type { BotContext, UserRecord } from '../types.js';
import { getMainMenuKeyboard } from '../keyboards.js';
import { getUser, saveUser, createDefaultUser } from '../storage/index.js';
import { handleTokenBinding } from './auth-link.js';
import { renderSingleBubble } from './render-bubble.js';
import { getDisciplineCounts } from '../services/competition-tracker.js';

export function buildStartText(user: UserRecord | null): string {
  const isLinked = Boolean(user && user.rkfToken);
  if (!isLinked) {
    const totalComps = getDisciplineCounts().total;
    return (
      `CoursingStats Tracker\n` +
      `Мониторинг документов и официальных состязаний РКФ\n` +
      `— — — — — — — — — — — — — — —\n` +
      `• Статус: Аккаунт не привязан\n` +
      `• Календарь 2026: ${totalComps} состязаний (курсинг, бега, БЗМП)\n\n` +
      `Сервис автоматически отслеживает готовность дипломов на rkf.online и официальное утверждение состязаний в графиках РКФ.\n\n` +
      `Для начала работы подключите аккаунт РКФ удобным способом:`
    );
  }

  const cachedApps = Object.values(user?.cachedApps || {});
  const total = cachedApps.length;
  const ready = cachedApps.filter(a => a.statusGroup === 'ready').length;
  const inProgress = cachedApps.filter(a => a.statusGroup === 'active').length;
  const comps = user?.competitions?.length || 0;
  const lastCheck = user?.lastCheckedAt
    ? new Date(user.lastCheckedAt).toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })
    : 'еще не выполнялась';

  return (
    `CoursingStats Tracker\n` +
    `Мониторинг документов и официальных состязаний РКФ\n` +
    `— — — — — — — — — — — — — — —\n` +
    `• Аккаунт РКФ: Подключен\n` +
    `• Всего заявок: ${total} (Готово к выдаче: ${ready})\n` +
    `• В обработке: ${inProgress}\n` +
    `• Отслеживание турниров: ${comps} активных\n` +
    `• Фоновый робот: активен (проверка каждый час)\n` +
    `• Обновлено: ${lastCheck} (МСК)\n\n` +
    `Выберите раздел в меню:`
  );
}

export function registerStartHandler(composer: Composer<BotContext>): void {
  composer.command('start', async (ctx) => {
    const userId = ctx.from?.id;
    const chatId = ctx.chat?.id;
    if (!userId || !chatId) return;

    let user = await getUser(ctx.env.KV_STORAGE, userId);
    if (!user) {
      user = createDefaultUser(userId, chatId);
      await saveUser(ctx.env.KV_STORAGE, user);
    }

    const webAppUrl = ctx.env.WEBAPP_URL || 'https://coursing-stats.ru/tracker/';
    const match = (ctx.match || '').trim();

    // Deep link handling for seamless binding: /start bind_<id|token>
    if (match.startsWith('bind_')) {
      const payload = match.slice(5).trim();
      let tokenToLink = payload;
      let sourceLabel = 'Сайт РКФ (Закладка)';

      if (payload.startsWith('tk_')) {
        sourceLabel = 'Компьютер (Расширение / Приложение)';
      }

      // Instant user feedback (< 100ms): chat action + progress bubble
      await ctx.replyWithChatAction('typing').catch(() => {});
      await renderSingleBubble(
        ctx,
        user,
        `Привязка аккаунта rkf.online\n` +
        `— — — — — — — — — — — — — — —\n` +
        `• Способ: ${sourceLabel}\n` +
        `• Статус: Проверяем сессию и загружаем документы...\n\n` +
        `Пожалуйста, подождите несколько секунд.`
      );

      if (payload.startsWith('tk_')) {
        const savedToken = await ctx.env.KV_STORAGE.get(`pair:ticket:${payload}`);
        if (savedToken) {
          tokenToLink = savedToken;
          await ctx.env.KV_STORAGE.delete(`pair:ticket:${payload}`);
        } else {
          await renderSingleBubble(
            ctx,
            user,
            `[ОШИБКА] Ссылка привязки устарела или уже была использована.\n` +
            `Пожалуйста, нажмите «Подключить Telegram» на компьютере еще раз.`,
            getMainMenuKeyboard(webAppUrl, false)
          );
          return;
        }
      }

      await handleTokenBinding(ctx, userId, chatId, tokenToLink, sourceLabel);
      return;
    }

    const isLinked = Boolean(user && user.rkfToken);
    try {
      await ctx.setChatMenuButton({
        menu_button: {
          type: 'web_app',
          text: 'Кабинет',
          web_app: { url: webAppUrl }
        }
      });
    } catch {}

    const text = buildStartText(user);
    await renderSingleBubble(ctx, user, text, getMainMenuKeyboard(webAppUrl, isLinked));
  });

  composer.callbackQuery('cmd_start', async (ctx) => {
    await ctx.answerCallbackQuery({ text: 'Главное меню...' });
    const userId = ctx.from?.id;
    if (!userId) return;

    const user = await getUser(ctx.env.KV_STORAGE, userId);
    if (!user) return;

    const webAppUrl = ctx.env.WEBAPP_URL || 'https://coursing-stats.ru/tracker/';
    const isLinked = Boolean(user && user.rkfToken);
    const text = buildStartText(user);

    await renderSingleBubble(ctx, user, text, getMainMenuKeyboard(webAppUrl, isLinked));
  });
}
