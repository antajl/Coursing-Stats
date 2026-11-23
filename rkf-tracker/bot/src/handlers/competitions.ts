// Handler: /competitions and /track commands (Track 4 - Strict Zero Emoji)
import type { Composer } from 'grammy';
import type { BotContext, CompetitionSubscription } from '../types.js';
import { getUser, saveUser, createDefaultUser } from '../storage/index.js';
import { searchCompetitionStatus } from '../services/competition-tracker.js';
import { getCompetitionsMenuKeyboard, getMainMenuKeyboard } from '../keyboards.js';

export function registerCompetitionsHandler(composer: Composer<BotContext>): void {
  composer.command('competitions', async (ctx) => {
    await showCompetitionsList(ctx);
  });

  composer.command('track', async (ctx) => {
    const text = (ctx.message?.text || '').replace(/^\/track/, '').trim();
    if (!text) {
      await ctx.reply(
        'Укажите название, город или номер заявки состязания для отслеживания:\n' +
        'Пример: /track курсинг Тверь\n' +
        'Пример: /track 12345'
      );
      return;
    }

    const userId = ctx.from?.id;
    const chatId = ctx.chat?.id;
    if (!userId || !chatId) return;

    let user = await getUser(ctx.env.KV_STORAGE, userId);
    if (!user) {
      user = createDefaultUser(userId, chatId);
    }

    const initial = await searchCompetitionStatus(text);
    const sub: CompetitionSubscription = {
      id: initial?.id || `comp_${Date.now()}`,
      query: text,
      title: initial?.title || text,
      city: initial?.city,
      date: initial?.date,
      lastStatus: initial?.status || 'На согласовании',
      createdAt: new Date().toISOString()
    };

    user.competitions = user.competitions || [];
    user.competitions.push(sub);
    await saveUser(ctx.env.KV_STORAGE, user);

    const statusLine = initial?.isApproved ? 'УТВЕРЖДЕНО' : sub.lastStatus;
    await ctx.reply(
      `[ПОДПИСКА ОФОРМЛЕНА]\n` +
      `Мероприятие: ${sub.title}\n` +
      `Текущий статус: ${statusLine}\n\n` +
      `Бот уведомит вас, как только состязание будет официально согласовано РКФ.`,
      { reply_markup: getCompetitionsMenuKeyboard() }
    );
  });

  composer.command('untrack', async (ctx) => {
    const query = (ctx.message?.text || '').replace(/^\/untrack/, '').trim();
    const userId = ctx.from?.id;
    if (!userId) return;

    const user = await getUser(ctx.env.KV_STORAGE, userId);
    if (!user || !user.competitions || user.competitions.length === 0) {
      await ctx.reply('У вас нет активных подписок на состязания.');
      return;
    }

    if (!query) {
      await ctx.reply('Укажите номер или поисковый запрос состязания: /untrack [название]');
      return;
    }

    const before = user.competitions.length;
    user.competitions = user.competitions.filter(
      c => c.id !== query && !c.query.toLowerCase().includes(query.toLowerCase())
    );

    if (user.competitions.length === before) {
      await ctx.reply(`Подписка по запросу "${query}" не найдена.`);
      return;
    }

    await saveUser(ctx.env.KV_STORAGE, user);
    await ctx.reply('Подписка на состязание успешно отменена.');
  });

  composer.callbackQuery('cmd_competitions', async (ctx) => {
    await ctx.answerCallbackQuery();
    await showCompetitionsList(ctx);
  });

  composer.callbackQuery('comp_add_prompt', async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply(
      'Для добавления подписки отправьте команду:\n' +
      '/track [название состязания, город или номер]\n\n' +
      'Пример: /track бега борзых Казань'
    );
  });

  composer.callbackQuery('comp_list', async (ctx) => {
    await ctx.answerCallbackQuery();
    await showCompetitionsList(ctx);
  });
}

async function showCompetitionsList(ctx: BotContext): Promise<void> {
  const userId = ctx.from?.id;
  if (!userId) return;

  const user = await getUser(ctx.env.KV_STORAGE, userId);
  const subs = user?.competitions || [];
  const webAppUrl = ctx.env.WEBAPP_URL || 'https://my.coursing-stats.ru';

  if (subs.length === 0) {
    await ctx.reply(
      'У вас пока нет отслеживаемых состязаний РКФ.\n\n' +
      'Чтобы подписаться на уведомление об утверждении состязания, используйте команду:\n' +
      '/track [название или город]',
      { reply_markup: getCompetitionsMenuKeyboard() }
    );
    return;
  }

  let text = `Ваши отслеживаемые состязания РКФ (${subs.length}):\n\n`;
  for (let i = 0; i < subs.length; i++) {
    const s = subs[i];
    const city = s.city ? `, г. ${s.city}` : '';
    const date = s.date ? ` (${s.date})` : '';
    text += `${i + 1}. ${s.title}${city}${date}\n   Статус: ${s.lastStatus}\n   Для удаления: /untrack ${s.id}\n\n`;
  }

  await ctx.reply(text, { reply_markup: getMainMenuKeyboard(webAppUrl) });
}
