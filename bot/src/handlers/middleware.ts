import { Bot } from 'grammy';
import type { KVNamespace } from './context';

/**
 * Настраивает middleware для бота
 * @param bot - экземпляр Grammy бота
 * @param cache - опциональное KV хранилище для состояния
 */
export function setupMiddleware(bot: Bot, cache?: KVNamespace) {
  // Auto-delete incoming user messages in private chats (commands, searches, text)
  // so that chat history remains completely clean in single-window mode.
  // Note: if message is sent via inline query (via_bot), do NOT delete it!
  bot.use(async (ctx, next) => {
    if (ctx.chat?.type === 'private' && ctx.message) {
      if (ctx.message.via_bot) {
        // User picked a dog card from inline query ("В чате")
        const userId = ctx.from?.id?.toString();
        const chatId = ctx.chat.id;
        if (userId && cache) {
          const lastMessageKey = `last_message:${userId}`;
          const lastId = await cache.get(lastMessageKey);
          if (lastId) {
            try {
              await ctx.api.deleteMessage(chatId, parseInt(lastId, 10));
            } catch {}
          }
          await cache.put(lastMessageKey, ctx.message.message_id.toString(), { expirationTtl: 86400 });
        }
        return; // Do not pass inline result cards down to text search handler
      }

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
