import { Composer } from 'grammy';
import type { CoursingStatsAPI } from '../api';
import type { KVNamespace } from './context';
import { setupInlineQueryHandler } from './commands/inlineHandler';
import { setupCommandHandlers } from './commands/commandList';
import { setupNavigationCallbacks } from './commands/navCallbacks';

// Re-export for backward compatibility with existing handlers
export { safeEditOrReply } from './utils/safeEditOrReply';

/**
 * Создает модуль команд бота с Grammy Composer
 * @param api - клиент API Coursing Stats
 * @param cache - опциональное KV хранилище для кэширования
 * @returns экземпляр Composer с обработчиками команд
 */
export function createCommands(api: CoursingStatsAPI, cache?: KVNamespace) {
  const commands = new Composer();

  // 1. Inline queries handler
  setupInlineQueryHandler(commands, api, cache);

  // 2. Slash command handlers (/start, /help, /ratings, etc.)
  setupCommandHandlers(commands, api, cache);

  // 3. Navigation callbacks & persistent bottom reply keyboard
  setupNavigationCallbacks(commands, api, cache);

  return commands;
}
