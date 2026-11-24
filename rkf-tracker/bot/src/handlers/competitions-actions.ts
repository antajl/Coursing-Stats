// Action handlers for subscriptions (Strict Zero Emoji & Old Money)
import type { BotContext, CompetitionSubscription } from '../types.js';
import { getUser, saveUser, createDefaultUser } from '../storage/index.js';
import { findCompetitionById, STATUS_RUSSIAN } from '../services/competition-tracker.js';
import { getCompetitionsMenuKeyboard, getEventActionKeyboard } from '../keyboards.js';
import { buildSubscriptionsText } from './competitions-render.js';
import { renderSingleBubble } from './render-bubble.js';

export async function subscribeToEvent(ctx: BotContext, eventId: string): Promise<void> {
  const userId = ctx.from?.id;
  const chatId = ctx.chat?.id;
  if (!userId || !chatId) return;

  const ev = findCompetitionById(eventId);
  if (!ev) {
    await ctx.reply('Состязание с указанным ID не найдено в реестре 2026.');
    return;
  }

  let user = (await getUser(ctx.env.KV_STORAGE, userId)) || createDefaultUser(userId, chatId);
  user.competitions = user.competitions || [];
  if (user.competitions.some(c => c.id === eventId)) {
    await ctx.reply(`Вы уже подписаны на состязание "${ev.discipline}" (${ev.location}).`, {
      reply_markup: getEventActionKeyboard(ev.id, true)
    });
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
    `— — — — — — — — — — — — — — —\n` +
    `• Мероприятие: ${ev.discipline} (${ev.rank})\n` +
    `• Дата: ${ev.dateRaw}\n` +
    `• Место: ${ev.location}\n` +
    `• Текущий статус: ${st}\n\n` +
    `Бот уведомит вас личным сообщением при изменении статуса согласования РКФ.`,
    { reply_markup: getEventActionKeyboard(ev.id, true) }
  );
}

export async function unsubscribeFromEvent(ctx: BotContext, eventId: string): Promise<void> {
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

export async function showUserSubscriptions(ctx: BotContext): Promise<void> {
  const userId = ctx.from?.id;
  const chatId = ctx.chat?.id || userId;
  if (!userId || !chatId) return;

  const user = (await getUser(ctx.env.KV_STORAGE, userId)) || createDefaultUser(userId, chatId);
  const subs = user?.competitions || [];
  const text = buildSubscriptionsText(subs);
  const kb = getCompetitionsMenuKeyboard();

  await renderSingleBubble(ctx, user, text, kb);
}
