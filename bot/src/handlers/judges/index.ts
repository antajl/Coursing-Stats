import { Composer } from 'grammy';
import { CoursingStatsAPI } from '../../api';
import { getNavigationButtons, getJudgesMenu, getJudgesKeyboard } from '../../keyboards';
import { RatingItem } from '../../types';

// Cloudflare Workers KV namespace type (from @cloudflare/workers-types)
type KVNamespace = {
  get(key: string, type?: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
};

/**
 * Обработчики рейтинга судей
 * @param api - клиент API Coursing Stats
 * @param cache - опциональное KV хранилище для кэширования
 * @returns экземпляр Composer с обработчиками судей
 */
export function createJudges(api: CoursingStatsAPI, cache?: KVNamespace) {
  const judges = new Composer();

  // Judges main menu
  judges.callbackQuery('judges', async (ctx) => {
    await ctx.editMessageText('<b>Загрузка рейтинга судей...</b>', { parse_mode: 'HTML' });
    
    const judgesList = await api.getJudgesSummary();
    
    if (!judgesList || judgesList.length === 0) {
      await ctx.editMessageText(
        'Не удалось загрузить рейтинг судей',
        { reply_markup: getNavigationButtons('main_menu', 'main_menu') }
      );
      return;
    }
    
    let text = '<b>Топ-10 судей соревнований</b>\n\n';
    
    judgesList.slice(0, 10).forEach((judge: RatingItem, index: number) => {
      const name = judge.judge_name || judge.name_lat || judge.name_ru || judge.name || 'N/A';
      const rings = judge.rings || judge.total_rings || judge.ring_count || 0;
      text += `${index + 1}. ${name} - ${rings} колец\n`;
    });
    
    await ctx.editMessageText(text, { 
      parse_mode: 'HTML',
      reply_markup: getJudgesKeyboard('competition')
    });
  });

  judges.callbackQuery('judges_competition', async (ctx) => {
    await ctx.editMessageText('<b>Загрузка рейтинга судей...</b>', { parse_mode: 'HTML' });
    
    const judgesList = await api.getJudgesSummary();
    
    if (!judgesList || judgesList.length === 0) {
      await ctx.editMessageText(
        'Не удалось загрузить рейтинг судей',
        { reply_markup: getNavigationButtons('judges', 'main_menu') }
      );
      return;
    }
    
    let text = '<b>Топ-10 судей соревнований</b>\n\n';
    
    judgesList.slice(0, 10).forEach((judge: RatingItem, index: number) => {
      const name = judge.judge_name || judge.name_lat || judge.name_ru || judge.name || 'N/A';
      const rings = judge.rings || judge.total_rings || judge.ring_count || 0;
      text += `${index + 1}. ${name} - ${rings} колец\n`;
    });
    
    await ctx.editMessageText(text, { 
      parse_mode: 'HTML',
      reply_markup: getJudgesKeyboard('competition')
    });
  });

  judges.callbackQuery('judges_show', async (ctx) => {
    await ctx.editMessageText('<b>Загрузка рейтинга судей выставок...</b>', { parse_mode: 'HTML' });
    
    const judgesList = await api.getShowJudges();
    
    if (!judgesList || judgesList.length === 0) {
      await ctx.editMessageText(
        'Не удалось загрузить рейтинг судей выставок',
        { reply_markup: getNavigationButtons('judges', 'main_menu') }
      );
      return;
    }
    
    let text = '<b>Топ-10 судей выставок</b>\n\n';
    
    judgesList.slice(0, 10).forEach((judge: RatingItem, index: number) => {
      const name = judge.judge_name || judge.name_lat || judge.name_ru || judge.name || 'N/A';
      const rings = judge.rings || judge.total_rings || judge.ring_count || 0;
      text += `${index + 1}. ${name} - ${rings} колец\n`;
    });
    
    await ctx.editMessageText(text, { 
      parse_mode: 'HTML',
      reply_markup: getJudgesKeyboard('shows')
    });
  });

  return judges;
}
