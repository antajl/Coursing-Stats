import { Bot } from 'grammy';
import { CoursingStatsAPI } from '../api';
import { setupMiddleware } from './middleware';
import { createCommands } from './commands';
import { createSearch } from './search';
import { createRatings } from './ratings';
import { createCalendar } from './calendar';
import { createJudges } from './judges';
import { createDonino } from './donino';
import { createFavorites } from './favorites';
import { createComparison } from './comparison';
import { createDogs } from './dogs';
import { createGuide } from './guide';
import type { KVNamespace } from './context';

/**
 * Настраивает все обработчики бота с модульной структурой
 * @param bot - экземпляр Grammy бота
 * @param api - клиент API Coursing Stats
 * @param cache - опциональное KV хранилище для кэширования
 */
export function setupHandlers(bot: Bot, api: CoursingStatsAPI, cache?: KVNamespace) {
  // Setup middleware
  setupMiddleware(bot, cache);

  // Install all modules in order
  bot.use(createCommands(api, cache));
  bot.use(createSearch(api, cache));
  bot.use(createRatings(api, cache));
  bot.use(createCalendar(api, cache));
  bot.use(createJudges(api, cache));
  bot.use(createDonino(api, cache));
  bot.use(createFavorites(api, cache));
  bot.use(createComparison(api, cache));
  bot.use(createDogs(api, cache));
  bot.use(createGuide(api));
}
