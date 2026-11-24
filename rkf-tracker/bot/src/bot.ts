// Grammy Bot instance factory
import { Bot } from 'grammy';
import type { BotContext, Env } from './types.js';
import { createBotComposer } from './handlers/index.js';

export function createBot(token: string, env: Env): Bot<BotContext> {
  const bot = new Bot<BotContext>(token, {
    botInfo: {
      id: 9278827269,
      is_bot: true,
      first_name: 'CoursingStats Tracker',
      username: 'coursing_stats_notify_bot',
      can_join_groups: false,
      can_read_all_group_messages: false,
      supports_inline_queries: false,
    } as any,
  });

  // Inject env into context
  bot.use(async (ctx, next) => {
    ctx.env = env;
    await next();
  });

  bot.catch((err) => {
    console.error(`[bot.catch] Error in update ${err.ctx?.update?.update_id}:`, err.error);
  });

  bot.use(createBotComposer());

  return bot;
}
