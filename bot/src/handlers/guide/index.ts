import { Composer } from 'grammy';
import { CoursingStatsAPI } from '../../api';
import { getNavigationButtons } from '../../keyboards';

/**
 * Обработчики справки (Guide) с 5 разделами
 * @param api - клиент API Coursing Stats
 * @param cache - опциональное KV хранилище для кэширования
 * @returns экземпляр Composer с обработчиками справки
 */
export function createGuide(api: CoursingStatsAPI) {
  const guide = new Composer();

  /**
   * Раздел "Соревнования" — Титулы и сертификаты
   * @param ctx - контекст Grammy
   */
  guide.callbackQuery('guide_titles', async (ctx) => {
    const text = `
<b>🏆 Соревнования — Титулы и сертификаты</b>

<b>Курсинг:</b>
• CACIL — Кандидат в Чемпионы Международного Класса
• CQN — Квалификационный Национальный
• Чемпион России — высший титул
• Чемпион РКФ — региональный чемпион

<b>Бега борзых:</b>
• JC — Junior Coursing (моложе 2 лет)
• SC — Senior Coursing (старше 2 лет)
• FC — Field Coursing (на траве)

<b>Иерархия наград:</b>
CACIL > CQN > Чемпион России > Чемпион РКФ

<a href="https://coursing-stats.ru/guide?tab=titles">🌐 Подробнее на сайте</a>
    `.trim();
    
    await ctx.editMessageText(text, {
      parse_mode: 'HTML',
      reply_markup: getNavigationButtons('guide_menu', 'main_menu')
    });
  });

  /**
   * Раздел "Выставки" — Награды и титулы РКФ
   * @param ctx - контекст Grammy
   */
  guide.callbackQuery('guide_shows', async (ctx) => {
    const text = `
<b>🎪 Выставки — Награды и титулы РКФ</b>

<b>Основные титулы:</b>
• CAC — Champion of Champions
• BOB — Best of Breed
• ЧРКФ — Чемпион России Кинологической Федерации
• КЧК — Кандидат в Чемпионы Класса

<b>Ранги выставок:</b>
• Монарх — Monarch
• Чемпион — Champion
• Юный Чемпион — Junior Champion

<b>Сокращения в протоколах:</b>
• V — Very Good (Очень хорошо)
• G — Good (Хорошо)
• S — Sufficient (Достаточно)

<a href="https://coursing-stats.ru/guide?tab=shows">🌐 Подробнее на сайте</a>
    `.trim();
    
    await ctx.editMessageText(text, {
      parse_mode: 'HTML',
      reply_markup: getNavigationButtons('guide_menu', 'main_menu')
    });
  });

  /**
   * Раздел "Протоколы" — Как читать протоколы
   * @param ctx - контекст Grammy
   */
  guide.callbackQuery('guide_protocol', async (ctx) => {
    const text = `
<b>📋 Протоколы — Как читать протоколы</b>

<b>Структура таблицы:</b>
• Left (лево) — направление движения
• Right (справа) — направление движения
• Time — время прохождения трассы
• Faults — ошибки прохождения

<b>Оценки:</b>
• 100 — идеальное прохождение
• 99 — отличное прохождение
• 95 — хорошее прохождение
• 0 — квалификация (Вне зачёта)

<b>Статусы:</b>
• VS — Very Slow (Очень медленно)
• NQ — Not Qualified (Не квалифицирован)
• DQ — Disqualified (Дисквалифицирован)

<a href="https://coursing-stats.ru/guide?tab=protocol">🌐 Подробнее на сайте</a>
    `.trim();
    
    await ctx.editMessageText(text, {
      parse_mode: 'HTML',
      reply_markup: getNavigationButtons('guide_menu', 'main_menu')
    });
  });

  /**
   * Раздел "Рейтинг" — Как устроен рейтинг Coursing Stats
   * @param ctx - контекст Grammy
   */
  guide.callbackQuery('guide_rating', async (ctx) => {
    const text = `
<b>📊 Рейтинг — Как устроен рейтинг Coursing Stats</b>

<b>Система очков:</b>
• 1-е место — 100 очков
• 2-е место — 90 очков
• 3-е место — 81 очко
• Каждое следующее место на 1 очко меньше

<b>Индекс CS:</b>
• CS = Competition Score
• Учитывает все участия собаки
• Отражает активность участия

<b>Отдельные таблицы:</b>
• По медалям — учитываются только медали
• По очкам — учитываются все результаты
• Гибридная система для справедливости

<a href="https://coursing-stats.ru/guide?tab=rating">🌐 Подробнее на сайте</a>
    `.trim();
    
    await ctx.editMessageText(text, {
      parse_mode: 'HTML',
      reply_markup: getNavigationButtons('guide_menu', 'main_menu')
    });
  });

  /**
   * Раздел "О сайте" — Информация о проекте
   * @param ctx - контекст Grammy
   */
  guide.callbackQuery('guide_site', async (ctx) => {
    const text = `
<b>ℹ️ О проекте Coursing Stats</b>

<b>Источники данных:</b>
• procoursing.ru — официальные данные курсинга
• Донино — рекорды скорости и курсинга
• РКФ — данные о выставках

<b>Связь с автором:</b>
• Telegram: @coursing_stats_bot
• Email: antajl@yandex.ru
• GitHub: github.com/coursing-stats

<b>Технологии:</b>
• Бот на Cloudflare Workers
• Статический сайт на CDN
• Open source проект

<b>Лицензия:</b>
MIT License — открытый исходный код

<a href="https://coursing-stats.ru/guide?tab=site">🌐 Подробнее на сайте</a>
    `.trim();
    
    await ctx.editMessageText(text, {
      parse_mode: 'HTML',
      reply_markup: getNavigationButtons('guide_menu', 'main_menu')
    });
  });

  return guide;
}