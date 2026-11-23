// Handler: /competitions and /track_event commands (2026 Calendar & Track 4)
import type { Composer } from 'grammy';
import type { BotContext, CompetitionSubscription } from '../types.js';
import { getUser, saveUser, createDefaultUser } from '../storage/index.js';
import {
  getDisciplineCounts,
  filterCompetitions,
  findCompetitionById,
  formatCompetitionCard,
  STATUS_RUSSIAN
} from '../services/competition-tracker.js';
import {
  getCompetitionsMenuKeyboard,
  getEventActionKeyboard,
  getMainMenuKeyboard
} from '../keyboards.js';

export function registerCompetitionsHandler(composer: Composer<BotContext>): void {
  // Main competitions dashboard
  composer.command('competitions', async (ctx) => {
    await showCompetitionsHub(ctx);
  });

  composer.callbackQuery('cmd_competitions', async (ctx) => {
    await ctx.answerCallbackQuery();
    await showCompetitionsHub(ctx);
  });

  // Discipline filters
  composer.callbackQuery(/^comp_disc:(coursing|racing|bzmp|all)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const disc = ctx.match ? ctx.match[1] : 'all';
    await showDisciplineEvents(ctx, disc);
  });

  // Track event by ID command: /track_event <id>
  composer.command(['track_event', 'track'], async (ctx) => {
    const raw = (ctx.message?.text || '').replace(/^\/(track_event|track)/, '').trim();
    if (!raw) {
      await ctx.reply(
        'Укажите ID состязания или город/клуб для поиска:\n' +
        'Пример по ID: /track_event ev_td6lum\n' +
        'Пример по поиску: /track Ставрополь'
      );
      return;
    }

    const ev = findCompetitionById(raw);
    if (ev) {
      await subscribeToEvent(ctx, ev.id);
      return;
    }

    // Search by query
    const results = filterCompetitions({ query: raw, limit: 3 });
    if (results.length === 0) {
      await ctx.reply(`Состязаний по запросу "${raw}" в календаре 2026 года не найдено.`);
      return;
    }

    await ctx.reply(`Найдено мероприятий в календаре 2026: ${results.length}`);
    for (const item of results) {
      const card = formatCompetitionCard(item);
      await ctx.reply(card, { reply_markup: getEventActionKeyboard(item.id, false) });
    }
  });

  // Callback subscribe/unsubscribe
  composer.callbackQuery(/^comp_sub:(.+)$/, async (ctx) => {
    const eventId = ctx.match ? ctx.match[1] : '';
    await ctx.answerCallbackQuery();
    await subscribeToEvent(ctx, eventId);
  });

  composer.callbackQuery(/^comp_unsub:(.+)$/, async (ctx) => {
    const eventId = ctx.match ? ctx.match[1] : '';
    await ctx.answerCallbackQuery();
    await unsubscribeFromEvent(ctx, eventId);
  });

  // My subscriptions list
  composer.callbackQuery('comp_list', async (ctx) => {
    await ctx.answerCallbackQuery();
    await showUserSubscriptions(ctx);
  });
}

async function showCompetitionsHub(ctx: BotContext): Promise<void> {
  const counts = getDisciplineCounts();
  const text =
    `Календарь состязаний РКФ 2026:\n\n` +
    `Всего мероприятий в графике: ${counts.total}\n` +
    `• Курсинг борзых: ${counts.coursing}\n` +
    `• Бега борзых (круг): ${counts.racing}\n` +
    `• Бега за мех. приманкой (БЗМП): ${counts.bzmp}\n\n` +
    `Статусы согласования:\n` +
    `• Официально утверждено: ${counts.approved}\n` +
    `• На согласовании РКФ: ${counts.pending}\n\n` +
    `Выберите категорию для просмотра или подписки на статус:`;

  await ctx.reply(text, { reply_markup: getCompetitionsMenuKeyboard() });
}

async function showDisciplineEvents(ctx: BotContext, discKey: string): Promise<void> {
  const discMap: Record<string, string> = {
    coursing: 'курсинг',
    racing: 'бега борзых',
    bzmp: 'приманк'
  };

  const discFilter = discMap[discKey] || 'all';
  const events = filterCompetitions({ discipline: discFilter, limit: 5 });

  if (events.length === 0) {
    await ctx.reply('Мероприятий в выбранной категории не найдено.');
    return;
  }

  await ctx.reply(`Показаны ближайшие мероприятия (${events.length}):`);
  for (const ev of events) {
    const card = formatCompetitionCard(ev);
    await ctx.reply(card, { reply_markup: getEventActionKeyboard(ev.id, false) });
  }
}

async function subscribeToEvent(ctx: BotContext, eventId: string): Promise<void> {
  const userId = ctx.from?.id;
  const chatId = ctx.chat?.id;
  if (!userId || !chatId) return;

  const ev = findCompetitionById(eventId);
  if (!ev) {
    await ctx.reply('Состязание с указанным ID не найдено в реестре 2026.');
    return;
  }

  let user = await getUser(ctx.env.KV_STORAGE, userId);
  if (!user) user = createDefaultUser(userId, chatId);

  user.competitions = user.competitions || [];
  if (user.competitions.some(c => c.id === eventId)) {
    await ctx.reply(`Вы уже подписаны на состязание "${ev.discipline}" (${ev.location}).`);
    return;
  }

  const sub: CompetitionSubscription = {
    id: ev.id,
    query: ev.location,
    title: `${ev.discipline} (${ev.rank})`,
    city: ev.location,
    date: ev.dateRaw,
    lastStatus: ev.status,
    createdAt: new Date().toISOString()
  };

  user.competitions.push(sub);
  await saveUser(ctx.env.KV_STORAGE, user);

  const st = STATUS_RUSSIAN[ev.status] || ev.status;
  await ctx.reply(
    `[ПОДПИСКА ОФОРМЛЕНА]\n` +
    `Мероприятие: ${sub.title}\n` +
    `Дата: ${ev.dateRaw}\n` +
    `Место: ${ev.location}\n` +
    `Текущий статус: ${st}\n\n` +
    `Бот уведомит вас личным сообщением при изменении статуса согласования РКФ.`,
    { reply_markup: getEventActionKeyboard(ev.id, true) }
  );
}

async function unsubscribeFromEvent(ctx: BotContext, eventId: string): Promise<void> {
  const userId = ctx.from?.id;
  if (!userId) return;

  const user = await getUser(ctx.env.KV_STORAGE, userId);
  if (!user || !user.competitions) return;

  user.competitions = user.competitions.filter(c => c.id !== eventId);
  await saveUser(ctx.env.KV_STORAGE, user);

  await ctx.reply('Подписка на состязание отменена.', {
    reply_markup: getCompetitionsMenuKeyboard()
  });
}

async function showUserSubscriptions(ctx: BotContext): Promise<void> {
  const userId = ctx.from?.id;
  if (!userId) return;

  const user = await getUser(ctx.env.KV_STORAGE, userId);
  const subs = user?.competitions || [];
  const webAppUrl = ctx.env.WEBAPP_URL || 'https://my.coursing-stats.ru';

  if (subs.length === 0) {
    await ctx.reply(
      'У вас пока нет активных подписок на состязания РКФ 2026 года.\n\n' +
      'Выберите состязание в меню состязаний или отправьте:\n' +
      '/track_event [id]',
      { reply_markup: getCompetitionsMenuKeyboard() }
    );
    return;
  }

  let text = `Ваши отслеживаемые состязания РКФ (${subs.length}):\n\n`;
  for (let i = 0; i < subs.length; i++) {
    const s = subs[i];
    const city = s.city ? `, ${s.city}` : '';
    const date = s.date ? ` (${s.date})` : '';
    const st = STATUS_RUSSIAN[s.lastStatus] || s.lastStatus;
    text += `${i + 1}. ${s.title}${city}${date}\n   Статус: ${st}\n   Отписаться: /untrack ${s.id}\n\n`;
  }

  await ctx.reply(text, { reply_markup: getMainMenuKeyboard(webAppUrl) });
}
