import { Bot, Context } from 'grammy';

// Cloudflare Workers KV namespace type (from @cloudflare/workers-types)
type KVNamespace = {
  get(key: string, type?: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
};

/**
 * Настраивает middleware для бота
 * @param bot - экземпляр Grammy бота
 * @param cache - опциональное KV хранилище для состояния
 */
export function setupMiddleware(bot: Bot, cache?: KVNamespace) {
  // Middleware to automatically answer callback queries AFTER handlers
  // Это решает race condition, когда middleware отвечает до обработки handler
  bot.use(async (ctx, next) => {
    // Сначала выполняем основной handler
    await next();

    // Потом отвечаем на callback query (type-safe)
    if (ctx.callbackQuery) {
      try {
        await ctx.answerCallbackQuery();
      } catch (error) {
        // Silently fail on callback query errors (already answered)
      }
    }
  });
}

/**
 * Создает функции для хранения состояния сравнения собак
 * @param cache - опциональное KV хранилище
 * @returns объект с функциями setCompareState, getCompareState, clearCompareState
 */
export function createCompareStateHandlers(cache?: KVNamespace) {
  async function setCompareState(userId: string, dogId: string) {
    if (!cache) return;
    await cache.put(`compare:${userId}`, dogId, { expirationTtl: 300 }); // 5 minutes
  }

  async function getCompareState(userId: string): Promise<string | null> {
    if (!cache) return null;
    const dogId = await cache.get(`compare:${userId}`);
    return dogId || null;
  }

  async function clearCompareState(userId: string) {
    if (!cache) return;
    await cache.delete(`compare:${userId}`);
  }

  return { setCompareState, getCompareState, clearCompareState };
}
