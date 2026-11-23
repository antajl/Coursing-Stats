// Grammy Bot instance factory
import { Bot } from 'grammy';
import type { BotContext, Env } from './types.js';
import { createBotComposer } from './handlers/index.js';

export function createBot(token: string, env: Env): Bot<BotContext> {
  const bot = new Bot<BotContext>(token);

  // Inject env into context
  bot.use(async (ctx, next) => {
    ctx.env = env;
    await next();
  });

  bot.use(createBotComposer());

  return bot;
}
