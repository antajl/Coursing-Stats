import { Composer } from 'grammy';
import { CoursingStatsAPI } from '../../api';
import { getRatingKeyboard, getNavigationButtons, getYearsMenu } from '../../keyboards';
import { getDisplayName } from '../utils/helpers';
import { validateYear } from '../utils/validators';
import { Rating, RatingItem } from '../../types';

// Cloudflare Workers KV namespace type (from @cloudflare/workers-types)
type KVNamespace = {
  get(key: string, type?: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
};

/**
 * Обработчики рейтингов собак
 * @param api - клиент API Coursing Stats
 * @param cache - опциональное KV хранилище для кэширования
 * @returns экземпляр Composer с обработчиками рейтингов
 */
export function createRatings(api: CoursingStatsAPI, cache?: KVNamespace) {
  const ratings = new Composer();

  // Ratings main menu
  ratings.callbackQuery('ratings', async (ctx) => {
    await ctx.editMessageText('<b>Загрузка рейтинга...</b>', { parse_mode: 'HTML' });
    
    const currentYear = new Date().getFullYear().toString();
    let ratingList = await api.getTopRatings('coursing', 'placement', currentYear, 10);
    
    if (ratingList.length === 0) {
      await ctx.editMessageText(
        'Не удалось загрузить рейтинг',
        { reply_markup: getNavigationButtons('main_menu', 'main_menu') }
      );
        return;
    }
    
    // Sort by gold descending for placement category
    ratingList.sort((a, b) => (b.gold || 0) - (a.gold || 0));
    
    // Take top 5
    ratingList = ratingList.slice(0, 5);
    
    let text = `<b>Топ-5 медали - Курсинг (${currentYear})</b>\n\n`;
    
    ratingList.forEach((rating, index) => {
      const name = getDisplayName(rating);
      const breed = rating.breed || '';
      const gold = rating.gold || 0;
      const silver = rating.silver || 0;
      const bronze = rating.bronze || 0;
      const starts = rating.total_starts || '-';
      text += `${index + 1}. ${name} (${breed})\n   🥇${gold} 🥈${silver} 🥉${bronze} | Старты: ${starts}\n\n`;
    });
    
    await ctx.editMessageText(text, { 
      parse_mode: 'HTML',
      reply_markup: getRatingKeyboard('coursing', 'placement', currentYear, '0')
    });
  });

  // Discipline switchers
  ratings.callbackQuery(/^rating_(coursing|racing|shows)$/, async (ctx) => {
    const discipline = ctx.match![1];
    await ctx.editMessageText('<b>Загрузка рейтинга...</b>', { parse_mode: 'HTML' });
    
    const currentYear = new Date().getFullYear().toString();
    
    if (discipline === 'shows') {
      const shows = await api.getShows(currentYear);
      
      if (!shows || shows.length === 0) {
        await ctx.editMessageText(
          'Не удалось загрузить рейтинг выставок',
          { reply_markup: getNavigationButtons('ratings', 'main_menu') }
        );
        return;
      }
      
      let text = `<b>Топ-10 выставок (${currentYear})</b>\n\n`;
      
      shows.slice(0, 10).forEach((dog: RatingItem, index: number) => {
        const name = dog.name_lat || dog.name_ru || dog.name || 'N/A';
        const showCount = dog.show_count || dog.total_shows || dog.competition_count || 0;
        text += `${index + 1}. ${name} - ${showCount} выставок\n`;
      });
      
      await ctx.editMessageText(text, { 
        parse_mode: 'HTML',
        reply_markup: getRatingKeyboard('shows', 'placement', currentYear, '0')
      });
    } else {
      // For coursing and racing, use placement by default
      let ratingList = await api.getTopRatings(discipline, 'placement', currentYear, 10);
      
      if (ratingList.length === 0) {
        await ctx.editMessageText(
          'Не удалось загрузить рейтинг',
          { reply_markup: getNavigationButtons('ratings', 'main_menu') }
        );
          return;
      }
      
      // Sort by gold descending
      ratingList.sort((a, b) => (b.gold || 0) - (a.gold || 0));
      
      // Take top 5
      ratingList = ratingList.slice(0, 5);
      
      const disciplineName = discipline === 'coursing' ? 'Курсинг' : 'Бега борзых';
      let text = `<b>Топ-5 медали - ${disciplineName} (${currentYear})</b>\n\n`;
      
      ratingList.forEach((rating, index) => {
        const name = getDisplayName(rating);
        const gold = rating.gold || 0;
        const silver = rating.silver || 0;
        const bronze = rating.bronze || 0;
        const starts = rating.total_starts || '-';
        text += `${index + 1}. ${name}\n   🥇${gold} 🥈${silver} 🥉${bronze} | Старты: ${starts}\n\n`;
      });
      
      await ctx.editMessageText(text, { 
        parse_mode: 'HTML',
        reply_markup: getRatingKeyboard(discipline, 'placement', currentYear, '0')
      });
    }
  });

  // Category switchers
  ratings.callbackQuery(/^rating_(coursing|racing)_(score|placement)$/, async (ctx) => {
    const discipline = ctx.match![1];
    const category = ctx.match![2];
    await ctx.editMessageText(
      `<b>Рейтинги - ${category === 'score' ? 'По очкам' : 'По местам'}</b>\n\nВыберите год:`,
      { parse_mode: 'HTML', reply_markup: getYearsMenu(`rating_${discipline}_${category}`) }
    );
  });

  ratings.callbackQuery(/^rating_(coursing|racing)_(score|placement)_years$/, async (ctx) => {
    const discipline = ctx.match![1];
    const category = ctx.match![2];
    await ctx.editMessageText(
      `<b>Рейтинги - ${category === 'score' ? 'По очкам' : 'По местам'}</b>\n\nВыберите год:`,
      { parse_mode: 'HTML', reply_markup: getYearsMenu(`rating_${discipline}_${category}`, true) }
    );
  });

  ratings.callbackQuery(/^rating_shows_years$/, async (ctx) => {
    await ctx.editMessageText(
      '<b>Рейтинги выставок</b>\n\nВыберите год:',
      { parse_mode: 'HTML', reply_markup: getYearsMenu('rating_shows') }
    );
  });

  ratings.callbackQuery(/^rating_shows_(\d{4})$/, async (ctx) => {
    const year = ctx.match![1];
    
    // Validate year
    if (!validateYear(year)) {
      await ctx.editMessageText(
        '❌ Неверный год.\n\nВыберите год из доступных вариантов.',
        { reply_markup: getNavigationButtons('ratings', 'main_menu') }
      );
      return;
    }
    
    await ctx.editMessageText('<b>Загрузка выставок...</b>', { parse_mode: 'HTML' });
    
    try {
      const shows = await api.getShows(year);
      
      if (!shows || shows.length === 0) {
        await ctx.editMessageText(
          `Не удалось загрузить данные по выставкам за ${year} год`,
          { reply_markup: getNavigationButtons('ratings', 'main_menu') }
        );
        return;
      }
      
      let text = `<b>Топ-10 выставок (${year})</b>\n\n`;
      
      shows.slice(0, 10).forEach((dog: RatingItem, index: number) => {
        const name = dog.name_lat || dog.name_ru || dog.name || 'N/A';
        const showCount = dog.show_count || dog.total_shows || dog.competition_count || 0;
        const titles = dog.titles || [];
        const titleText = titles.length > 0 ? titles.map((t: { title: string }) => t.title).join(', ') : 'Нет титулов';
        text += `${index + 1}. ${name}\n   Выставок: ${showCount} | Титулы: ${titleText}\n\n`;
      });
      
      await ctx.editMessageText(text, { 
        parse_mode: 'HTML',
        reply_markup: getRatingKeyboard('shows', 'placement', year, '0')
      });
    } catch (error) {
      await ctx.editMessageText(
        'Произошла ошибка при загрузке выставок',
        { reply_markup: getNavigationButtons('ratings', 'main_menu') }
      );
    }
  });

  ratings.callbackQuery(/^rating_(coursing|racing)_(score|placement)_(\d{4})$/, async (ctx) => {
    const discipline = ctx.match![1];
    const category = ctx.match![2];
    const year = ctx.match![3];
    
    // Validate year
    if (!validateYear(year)) {
      await ctx.editMessageText(
        '❌ Неверный год.\n\nВыберите год из доступных вариантов.',
        { reply_markup: getNavigationButtons('ratings', 'main_menu') }
      );
      return;
    }
    
    await ctx.editMessageText('<b>Загрузка рейтинга...</b>', { parse_mode: 'HTML' });
    
    let ratingList = await api.getTopRatings(discipline, category, year, 10);
    
    if (ratingList.length === 0) {
      await ctx.editMessageText(
        'Не удалось загрузить рейтинг',
        { reply_markup: getNavigationButtons('ratings', 'main_menu') }
      );
      return;
    }
    
    // Sort by rating_score descending for score category, by gold for placement
    if (category === 'score') {
      ratingList.sort((a, b) => (b.rating_score || 0) - (a.rating_score || 0));
    } else {
      ratingList.sort((a, b) => (b.gold || 0) - (a.gold || 0));
    }
    
    // Take top 5
    ratingList = ratingList.slice(0, 5);
    
    const disciplineName = discipline === 'coursing' ? 'Курсинг' : 'Бега борзых';
    let text = `<b>Топ-5 ${category === 'score' ? 'по очкам' : 'медали'} - ${disciplineName} (${year})</b>\n\n`;
    
    if (category === 'score') {
      text += `<i>💡 Индекс — усреднённая оценка судей за все старты</i>\n\n`;
    }
    
    ratingList.forEach((rating, index) => {
      const name = getDisplayName(rating);
      const breed = rating.breed || '';
      
      if (category === 'score') {
        const score = rating.rating_score || rating.score || rating.total_score || '-';
        const best = rating.best_score || '-';
        const avg = rating.avg_judge_score || '-';
        const starts = rating.total_starts || '-';
        text += `${index + 1}. ${name} (${breed})\n   Индекс: ${score} | Средний: ${avg} | Лучший: ${best} | Старты: ${starts}\n\n`;
      } else {
        const gold = rating.gold || 0;
        const silver = rating.silver || 0;
        const bronze = rating.bronze || 0;
        const starts = rating.total_starts || '-';
        text += `${index + 1}. ${name} (${breed})\n   🥇${gold} 🥈${silver} 🥉${bronze} | Старты: ${starts}\n\n`;
      }
    });
    
    await ctx.editMessageText(text, { 
      parse_mode: 'HTML',
      reply_markup: getRatingKeyboard(discipline, category, year, '0')
    });
  });

  ratings.callbackQuery(/^rating_(coursing|racing)_(score|placement)_all$/, async (ctx) => {
    const discipline = ctx.match![1];
    const category = ctx.match![2];
    
    await ctx.editMessageText('<b>Загрузка рейтинга...</b>', { parse_mode: 'HTML' });
    
    let ratingList = await api.getTopRatings(discipline, category, 'all', 10);
    
    if (ratingList.length === 0) {
      await ctx.editMessageText(
        'Не удалось загрузить рейтинг',
        { reply_markup: getNavigationButtons('ratings', 'main_menu') }
      );
      return;
    }
    
    // Sort by rating_score descending for score category, by gold for placement
    if (category === 'score') {
      ratingList.sort((a, b) => (b.rating_score || 0) - (a.rating_score || 0));
    } else {
      ratingList.sort((a, b) => (b.gold || 0) - (a.gold || 0));
    }
    
    // Take top 5
    ratingList = ratingList.slice(0, 5);
    
    const disciplineName = discipline === 'coursing' ? 'Курсинг' : 'Бега борзых';
    let text = `<b>Топ-5 ${category === 'score' ? 'по очкам' : 'медали'} - ${disciplineName} (Все года)</b>\n\n`;
    
    if (category === 'score') {
      text += `<i>💡 Индекс — усреднённая оценка судей за все старты</i>\n\n`;
    }
    
    ratingList.forEach((rating, index) => {
      const name = getDisplayName(rating);
      const breed = rating.breed || '';
      
      if (category === 'score') {
        const score = rating.rating_score || rating.score || rating.total_score || '-';
        const best = rating.best_score || '-';
        const avg = rating.avg_judge_score || '-';
        const starts = rating.total_starts || '-';
        text += `${index + 1}. ${name} (${breed})\n   Индекс: ${score} | Средний: ${avg} | Лучший: ${best} | Старты: ${starts}\n\n`;
      } else {
        const gold = rating.gold || 0;
        const silver = rating.silver || 0;
        const bronze = rating.bronze || 0;
        const starts = rating.total_starts || '-';
        text += `${index + 1}. ${name} (${breed})\n   🥇${gold} 🥈${silver} 🥉${bronze} | Старты: ${starts}\n\n`;
      }
    });
    
    await ctx.editMessageText(text, { 
      parse_mode: 'HTML',
      reply_markup: getRatingKeyboard(discipline, category, 'all', '0')
    });
  });

  // Pagination handlers
  ratings.callbackQuery(/^rating_(coursing|racing)_(score|placement)_(\d{4})_(\d+)$/, async (ctx) => {
    const discipline = ctx.match![1];
    const category = ctx.match![2];
    const year = ctx.match![3];
    const offset = ctx.match![4];
    
    await ctx.editMessageText('<b>Загрузка рейтинга...</b>', { parse_mode: 'HTML' });
    
    let ratingList = await api.getTopRatings(discipline, category, year, 10 + parseInt(offset));
    
    if (ratingList.length === 0) {
      await ctx.editMessageText(
        'Не удалось загрузить рейтинг',
        { reply_markup: getNavigationButtons('ratings', 'main_menu') }
      );
      return;
    }
    
    // Sort by rating_score descending for score category, by gold for placement
    if (category === 'score') {
      ratingList.sort((a, b) => (b.rating_score || 0) - (a.rating_score || 0));
    } else {
      ratingList.sort((a, b) => (b.gold || 0) - (a.gold || 0));
    }
    
    // Take slice based on offset
    ratingList = ratingList.slice(parseInt(offset), parseInt(offset) + 5);
    
    const disciplineName = discipline === 'coursing' ? 'Курсинг' : 'Бега борзых';
    let text = `<b>Топ-5 ${category === 'score' ? 'по очкам' : 'медали'} - ${disciplineName} (${year})</b>\n\n`;
    
    if (category === 'score') {
      text += `<i>💡 Индекс — усреднённая оценка судей за все старты</i>\n\n`;
    }
    
    ratingList.forEach((rating, index) => {
      const name = getDisplayName(rating);
      const breed = rating.breed || '';
      
      if (category === 'score') {
        const score = rating.rating_score || rating.score || rating.total_score || '-';
        const best = rating.best_score || '-';
        const avg = rating.avg_judge_score || '-';
        const starts = rating.total_starts || '-';
        text += `${index + 1}. ${name} (${breed})\n   Индекс: ${score} | Средний: ${avg} | Лучший: ${best} | Старты: ${starts}\n\n`;
      } else {
        const gold = rating.gold || 0;
        const silver = rating.silver || 0;
        const bronze = rating.bronze || 0;
        const starts = rating.total_starts || '-';
        text += `${index + 1}. ${name} (${breed})\n   🥇${gold} 🥈${silver} 🥉${bronze} | Старты: ${starts}\n\n`;
      }
    });
    
    await ctx.editMessageText(text, { 
      parse_mode: 'HTML',
      reply_markup: getRatingKeyboard(discipline, category, year, offset)
    });
  });

  ratings.callbackQuery(/^rating_(coursing|racing)_(score|placement)_all_(\d+)$/, async (ctx) => {
    const discipline = ctx.match![1];
    const category = ctx.match![2];
    const offset = ctx.match![3];
    
    await ctx.editMessageText('<b>Загрузка рейтинга...</b>', { parse_mode: 'HTML' });
    
    let ratingList = await api.getTopRatings(discipline, category, 'all', 10 + parseInt(offset));
    
    if (ratingList.length === 0) {
      await ctx.editMessageText(
        'Не удалось загрузить рейтинг',
        { reply_markup: getNavigationButtons('ratings', 'main_menu') }
      );
      return;
    }
    
    // Sort by rating_score descending for score category, by gold for placement
    if (category === 'score') {
      ratingList.sort((a, b) => (b.rating_score || 0) - (a.rating_score || 0));
    } else {
      ratingList.sort((a, b) => (b.gold || 0) - (a.gold || 0));
    }
    
    // Take slice based on offset
    ratingList = ratingList.slice(parseInt(offset), parseInt(offset) + 5);
    
    const disciplineName = discipline === 'coursing' ? 'Курсинг' : 'Бега борзых';
    let text = `<b>Топ-5 ${category === 'score' ? 'по очкам' : 'медали'} - ${disciplineName} (Все года)</b>\n\n`;
    
    if (category === 'score') {
      text += `<i>💡 Индекс — усреднённая оценка судей за все старты</i>\n\n`;
    }
    
    ratingList.forEach((rating, index) => {
      const name = getDisplayName(rating);
      const breed = rating.breed || '';
      
      if (category === 'score') {
        const score = rating.rating_score || rating.score || rating.total_score || '-';
        const best = rating.best_score || '-';
        const avg = rating.avg_judge_score || '-';
        const starts = rating.total_starts || '-';
        text += `${index + 1}. ${name} (${breed})\n   Индекс: ${score} | Средний: ${avg} | Лучший: ${best} | Старты: ${starts}\n\n`;
      } else {
        const gold = rating.gold || 0;
        const silver = rating.silver || 0;
        const bronze = rating.bronze || 0;
        const starts = rating.total_starts || '-';
        text += `${index + 1}. ${name} (${breed})\n   🥇${gold} 🥈${silver} 🥉${bronze} | Старты: ${starts}\n\n`;
      }
    });
    
    await ctx.editMessageText(text, { 
      parse_mode: 'HTML',
      reply_markup: getRatingKeyboard(discipline, category, 'all', offset)
    });
  });

  return ratings;
}
