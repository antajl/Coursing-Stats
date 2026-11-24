// Handler: /competitions and /track_event commands (Strict Zero Emoji & Single-Bubble UX)
import type { Composer } from 'grammy';
import type { BotContext } from '../types.js';
import { getUser, saveUser, createDefaultUser } from '../storage/index.js';
import {
  getDisciplineCounts,
  filterCompetitions,
  findCompetitionById,
  formatCompetitionCard
} from '../services/competition-tracker.js';
import {
  getCompetitionsMenuKeyboard,
  getCompetitionsPageKeyboard,
  getEventActionKeyboard
} from '../keyboards.js';
import {
  PAGE_SIZE,
  getFilterParams,
  buildCompetitionsHubText,
  buildCompetitionsPageText
} from './competitions-render.js';
import {
  subscribeToEvent,
  unsubscribeFromEvent,
  showUserSubscriptions
} from './competitions-actions.js';

export function registerCompetitionsHandler(composer: Composer<BotContext>): void {
  composer.command('competitions', async (ctx) => {
    await showCompetitionsHub(ctx, false);
  });

  composer.callbackQuery('cmd_competitions', async (ctx) => {
    await ctx.answerCallbackQuery();
    await showCompetitionsHub(ctx, true);
  });

  // Discipline list & pagination
  composer.callbackQuery(/^comp_disc:(coursing|racing|bzmp|all|approved)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const disc = ctx.match ? ctx.match[1] : 'all';
    await showCompetitionsPage(ctx, disc, 0, true);
  });

  composer.callbackQuery(/^comp_p:(coursing|racing|bzmp|all|approved):(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const disc = ctx.match ? ctx.match[1] : 'all';
    const page = ctx.match ? parseInt(ctx.match[2], 10) : 0;
    await showCompetitionsPage(ctx, disc, page, true);
  });

  // 1-click toggle subscription within the competitions browser
  composer.callbackQuery(/^(csub_on|csub_off):([^:]+):(coursing|racing|bzmp|all|approved):(\d+)$/, async (ctx) => {
    const action = ctx.match ? ctx.match[1] : '';
    const eventId = ctx.match ? ctx.match[2] : '';
    const disc = ctx.match ? ctx.match[3] : 'all';
    const page = ctx.match ? parseInt(ctx.match[4], 10) : 0;

    const userId = ctx.from?.id;
    const chatId = ctx.chat?.id;
    if (!userId || !chatId) {
      await ctx.answerCallbackQuery();
      return;
    }

    let user = await getUser(ctx.env.KV_STORAGE, userId);
    if (!user) user = createDefaultUser(userId, chatId);
    user.competitions = user.competitions || [];

    if (action === 'csub_on') {
      const ev = findCompetitionById(eventId);
      if (ev && !user.competitions.some(c => c.id === eventId)) {
        user.competitions.push({
          id: ev.id,
          query: ev.location,
          title: `${ev.discipline} (${ev.rank})`,
          city: ev.location,
          date: ev.dateRaw,
          lastStatus: ev.status,
          createdAt: new Date().toISOString()
        });
        await saveUser(ctx.env.KV_STORAGE, user);
        await ctx.answerCallbackQuery({ text: `Подписка оформлена: ${ev.location}` });
      } else {
        await ctx.answerCallbackQuery({ text: 'Уже в подписках' });
      }
    } else {
      user.competitions = user.competitions.filter(c => c.id !== eventId);
      await saveUser(ctx.env.KV_STORAGE, user);
      await ctx.answerCallbackQuery({ text: 'Подписка отменена' });
    }

    await showCompetitionsPage(ctx, disc, page, true);
  });

  // Track event by ID or keyword command: /track_event <id>
  composer.command(['track_event', 'track'], async (ctx) => {
    const raw = (ctx.message?.text || '').replace(/^\/(track_event|track)/, '').trim();
    if (!raw) {
      await ctx.reply(
        `Отслеживание состязаний РКФ 2026\n` +
        `— — — — — — — — — — — — — — —\n` +
        `Укажите ID мероприятия или город для поиска:\n` +
        `• По ID: /track_event ev_td6lum\n` +
        `• Поиск по городу: /track Ставрополь`
      );
      return;
    }

    const ev = findCompetitionById(raw);
    if (ev) {
      await subscribeToEvent(ctx, ev.id);
      return;
    }

    const results = filterCompetitions({ query: raw, limit: 3 });
    if (results.length === 0) {
      await ctx.reply(`Состязаний по запросу "${raw}" в календаре 2026 года не найдено.`, {
        reply_markup: getCompetitionsMenuKeyboard()
      });
      return;
    }

    for (const item of results) {
      const card = formatCompetitionCard(item);
      await ctx.reply(card, { reply_markup: getEventActionKeyboard(item.id, false) });
    }
  });

  composer.command(['untrack', 'untrack_event'], async (ctx) => {
    const raw = (ctx.message?.text || '').replace(/^\/(untrack_event|untrack)/, '').trim();
    if (raw) {
      await unsubscribeFromEvent(ctx, raw);
    }
  });

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

  composer.callbackQuery('comp_list', async (ctx) => {
    await ctx.answerCallbackQuery();
    await showUserSubscriptions(ctx);
  });
}

async function showCompetitionsHub(ctx: BotContext, isEdit: boolean): Promise<void> {
  const counts = getDisciplineCounts();
  const text = buildCompetitionsHubText(counts);
  const kb = getCompetitionsMenuKeyboard();

  if (isEdit) {
    try {
      await ctx.editMessageText(text, { reply_markup: kb });
      return;
    } catch {}
  }
  await ctx.reply(text, { reply_markup: kb });
}

async function showCompetitionsPage(
  ctx: BotContext,
  discKey: string,
  page: number,
  isEdit: boolean
): Promise<void> {
  const userId = ctx.from?.id;
  const user = userId ? await getUser(ctx.env.KV_STORAGE, userId) : null;
  const subIds = new Set((user?.competitions || []).map(c => c.id));

  const events = filterCompetitions(getFilterParams(discKey));
  const total = events.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const p = Math.min(Math.max(0, page), totalPages - 1);
  const pageEvents = events.slice(p * PAGE_SIZE, (p + 1) * PAGE_SIZE);

  const text = buildCompetitionsPageText(pageEvents, p, totalPages, total, subIds, discKey);
  const kb = getCompetitionsPageKeyboard(pageEvents, p, totalPages, subIds, discKey);

  if (isEdit) {
    try {
      await ctx.editMessageText(text, { reply_markup: kb });
      return;
    } catch {}
  }
  await ctx.reply(text, { reply_markup: kb });
}
