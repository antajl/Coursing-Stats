import { Bot } from 'grammy';
import type { KVNamespace } from './context';

/**
 * Настраивает middleware для бота
 * @param bot - экземпляр Grammy бота
 * @param cache - опциональное KV хранилище для состояния
 */
export function setupMiddleware(bot: Bot, cache?: KVNamespace) {
  // Auto-delete incoming user messages in private chats (commands, searches, text)
  // so that chat history remains completely clean in single-window mode
  bot.use(async (ctx, next) => {
    if (ctx.chat?.type === 'private' && ctx.message?.message_id) {
      ctx.deleteMessage().catch(() => {});
    }
    await next();
  });

  // Middleware to automatically answer callback queries AFTER handlers if not already answered
  bot.use(async (ctx, next) => {
    let answered = false;
    if (ctx.callbackQuery) {
      const originalAnswer = ctx.answerCallbackQuery.bind(ctx);
      ctx.answerCallbackQuery = async (...args: any[]) => {
        answered = true;
        return originalAnswer(...args);
      };
    }

    // Сначала выполняем основной handler
    await next();

    // Отвечаем только если handler сам не ответил
    if (ctx.callbackQuery && !answered) {
      try {
        await ctx.answerCallbackQuery();
      } catch (error) {
        // Silently fail if already answered or timed out
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
