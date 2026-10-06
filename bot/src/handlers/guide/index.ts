import { Composer } from 'grammy';
import { CoursingStatsAPI } from '../../api';
import { getNavigationButtons } from '../../keyboards';
import { safeEditOrReply } from '../commands';
import type { KVNamespace } from '../context';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderSportTitles(guide: any): string {
  const ladder = Array.isArray(guide?.sport?.title_ladder) ? guide.sport.title_ladder : [];
  const reqs = Array.isArray(guide?.sport?.requirements) ? guide.sport.requirements : [];

  const ladderText = ladder.length > 0
    ? ladder
        .slice(0, 9)
        .map((t: any) => `${t.rank}. <b>${escapeHtml(t.badge || '')}</b> — ${escapeHtml(t.name || '')}`)
        .join('\n')
    : [
        '1. <b>ACH RUS</b> — Абсолютный чемпион России (спорт + выставки)',
        '2. <b>C.I.B.P.</b> — Международный чемпион красоты и курсинга (FCI)',
        '3. <b>ГЧР РК</b> — Гранд чемпион России по рабочим качествам',
        '4. <b>ЧР РК</b> — Чемпион России (1-е место на главном ЧР года)',
        '5. <b>ПКР РК</b> — Победитель Кубка России',
        '6. <b>ЧРКФ РК</b> — Чемпион РКФ',
        '7. <b>НЧ РК</b> — Национальный чемпион (пожизненный титул за 5 CACL)',
        '8. <b>CACIL</b> — Международный сертификат состязаний FCI',
        '9. <b>CACL</b> — Национальный сертификат состязаний (базовый)',
      ].join('\n');

  const reqText = reqs.length > 0
    ? reqs
        .slice(0, 3)
        .map((r: any) => `• <b>${escapeHtml(r.label || '')}:</b> ${escapeHtml(r.text || '')}`)
        .join('\n')
    : [
        '• <b>Квалификационная норма:</b> не менее ⅔ от максимально возможной суммы баллов за 2 забега.',
        '• <b>Минимум участников:</b> от 3 собак одной породы на старте (при ≥3 кобелей и ≥3 сук — раздельно по полу).',
        '• <b>Второй круг:</b> менее 50% баллов в 1-м забеге — собака не допускается ко 2-му кругу.',
      ].join('\n');

  return `
<b>🏆 Соревнования — Титулы и сертификаты РКФ</b>

<b>Лестница престижа (от высших к базовым):</b>
${ladderText}

<blockquote expandable><b>Нормативы и условия:</b>
${reqText}</blockquote>

<a href="https://coursing-stats.ru/guide?tab=titles">🌐 Полный регламент титулов на сайте</a>
`.trim();
}

function renderShowTitles(guide: any): string {
  const awards = Array.isArray(guide?.shows?.awards) ? guide.shows.awards : [];
  const titles = Array.isArray(guide?.shows?.titles) ? guide.shows.titles : [];

  const mainAwards = [
    { abbr: 'BIS', desc: 'Best in Show — лучшая собака всей выставки' },
    { abbr: 'BIG', desc: 'Best in Group — лучшая собака группы FCI' },
    { abbr: 'ЛПП (BOB)', desc: 'Лучший представитель породы' },
    { abbr: 'ЛППП (BOS)', desc: 'Лучший представитель противоположного пола' },
    { abbr: 'CACIB', desc: 'Кандидат в интернациональные чемпионы (FCI)' },
    { abbr: 'CAC', desc: 'Кандидат в чемпионы России (взрослые классы)' },
    { abbr: 'CW', desc: 'Class Winner — победитель своего класса' },
  ];

  const awardsText = awards.length > 0
    ? awards
        .slice(0, 7)
        .map((a: any, i: number) => `${i + 1}. <b>${escapeHtml(a.abbr || '')}</b> — ${escapeHtml(a.title || '')}`)
        .join('\n')
    : mainAwards
        .map((a, i) => `${i + 1}. <b>${a.abbr}</b> — ${a.desc}`)
        .join('\n');

  const titlesText = titles.length > 0
    ? titles
        .slice(0, 5)
        .map((t: any) => `• <b>${escapeHtml(t.abbr || '')}</b> — ${escapeHtml(t.title || '')}`)
        .join('\n')
    : [
        '• <b>ACH RUS</b> — Абсолютный чемпион России (CH RUS + GCH RUS + C.I.B.)',
        '• <b>GCH RUS</b> — Гранд чемпион России',
        '• <b>CH RUS (ЧР)</b> — Чемпион России (4 × CAC у 4 судей)',
        '• <b>JCH RUS (ЮЧР)</b> — Юный чемпион России (3 × JCAC)',
        '• <b>CH RKF (ЧРКФ)</b> — Чемпион РКФ',
      ].join('\n');

  return `
<b>🎪 Выставки — Иерархия наград и титулы РКФ</b>

<b>Иерархия наград ринга:</b>
${awardsText}

<blockquote expandable><b>Выставочные титулы карьеры:</b>
${titlesText}</blockquote>

<a href="https://coursing-stats.ru/guide?tab=shows">🌐 Полный регламент выставок на сайте</a>
`.trim();
}

function renderProtocolGuide(guide: any): string {
  const criteria = Array.isArray(guide?.sport?.criteria) ? guide.sport.criteria : [];

  const critText = criteria.length > 0
    ? criteria
        .map((c: any) => `• <b>${escapeHtml(c.key || '')} — ${escapeHtml(c.name || '')} (до 20 б.):</b> ${escapeHtml(c.summary || '')}`)
        .join('\n')
    : [
        '• <b>М — Маневренность (до 20 б.):</b> смена направления за приманкой, преодоление препятствий, чистота работы.',
        '• <b>Р — Резвость (до 20 б.):</b> быстрота на трассе относительно соперника в паре.',
        '• <b>В — Выносливость (до 20 б.):</b> прохождение трассы в хорошей форме до конца без признаков усталости.',
        '• <b>П — Преследование (до 20 б.):</b> неотрывное внимание к приманке со 100% концентрацией.',
        '• <b>Э — Энтузиазм (до 20 б.):</b> напор на старте, упорство на дистанции и азарт при поимке.',
      ].join('\n');

  return `
<b>📋 Протоколы — Оценка забега по 5 критериям</b>

Каждый забег оценивается судьями по <b>5 официальным критериям</b> (до 20 баллов каждый, максимум 100 баллов за забег):

${critText}

<blockquote expandable><b>Отметки в протоколах:</b>
• <b>ВС</b> — Выполнен сертификат (≥ ⅔ от максимальной суммы баллов)
• <b>КВ</b> — Квалификация пройдена (≥ 50% баллов)
• <b>НК</b> — Не квалифицирован (&lt; 50% баллов)
• <b>DQ</b> — Дисквалификация за помеху или отказ от преследования</blockquote>

<a href="https://coursing-stats.ru/guide?tab=protocol">🌐 Подробнее о протоколах на сайте</a>
`.trim();
}

function renderRatingGuide(): string {
  return `
<b>📊 Рейтинг — Система очков и рейтинг собак</b>

В CoursingStats используются две независимые системы оценки:

<b>1. CS-очки (CS Index):</b>
• Отражает стабильность и результативность на протяжении сезона.
• Начисляются за занятые места с учётом числа соперников в забеге.
• Чем больше собак в породе на старте — тем выше ценность победы.

<b>2. Медальный зачёт:</b>
• Строго по призовым местам (золото, серебро, бронза) в открытых классах.
• Медали и CS-очки никогда не смешиваются.

<blockquote expandable><b>Динамический рейтинг Elo:</b>
Рассчитывается индивидуально по результатам парных забегов (стартовый рейтинг 1000). Победа над более сильным соперником даёт больше очков, чем над аутсайдером.</blockquote>

<a href="https://coursing-stats.ru/guide?tab=rating">🌐 Формулы и методология на сайте</a>
`.trim();
}

function renderSiteGuide(): string {
  return `
<b>ℹ️ О проекте Coursing Stats</b>

<b>CoursingStats</b> — открытая база результатов соревнований по курсингу и бегам борзых, выставок РКФ и рекордов бегового центра Донино.

<b>Источники данных:</b>
• <b>procoursing.ru</b> — протоколы соревнований по курсингу и бегам
• <b>РКФ</b> — выставочные каталоги и отчёты
• <b>Донино</b> — замеры скорости (км/ч) и спринт 350м (сек)

<b>Платформа:</b>
• Сайт: <a href="https://coursing-stats.ru">coursing-stats.ru</a>
• Телеграм-канал / Бот: @coursing_stats_bot
• Исходный код: Open Source

<a href="https://coursing-stats.ru/guide?tab=site">🌐 Открыть энциклопедию на сайте</a>
`.trim();
}

/**
 * Обработчики справки (Guide) с 5 разделами
 * Данные загружаются динамически из CDN (data/v1/guide.json), синхронизируясь с сайтом
 * @param api - клиент API Coursing Stats
 * @param cache - опциональное KV хранилище для кэширования
 * @returns экземпляр Composer с обработчиками справки
 */
export function createGuide(api: CoursingStatsAPI, cache?: KVNamespace) {
  const guide = new Composer();

  /**
   * Раздел "Соревнования" — Титулы и сертификаты
   */
  guide.callbackQuery('guide_titles', async (ctx) => {
    const guideData = await api.getGuide();
    const text = renderSportTitles(guideData);
    
    await safeEditOrReply(ctx, text, {
      parse_mode: 'HTML',
      reply_markup: getNavigationButtons('guide_menu', 'main_menu')
    }, cache);
  });

  /**
   * Раздел "Выставки" — Награды и титулы РКФ
   */
  guide.callbackQuery('guide_shows', async (ctx) => {
    const guideData = await api.getGuide();
    const text = renderShowTitles(guideData);
    
    await safeEditOrReply(ctx, text, {
      parse_mode: 'HTML',
      reply_markup: getNavigationButtons('guide_menu', 'main_menu')
    }, cache);
  });

  /**
   * Раздел "Протоколы" — Как читать протоколы
   */
  guide.callbackQuery('guide_protocol', async (ctx) => {
    const guideData = await api.getGuide();
    const text = renderProtocolGuide(guideData);
    
    await safeEditOrReply(ctx, text, {
      parse_mode: 'HTML',
      reply_markup: getNavigationButtons('guide_menu', 'main_menu')
    }, cache);
  });

  /**
   * Раздел "Рейтинг" — Как устроен рейтинг Coursing Stats
   */
  guide.callbackQuery('guide_rating', async (ctx) => {
    const text = renderRatingGuide();
    
    await safeEditOrReply(ctx, text, {
      parse_mode: 'HTML',
      reply_markup: getNavigationButtons('guide_menu', 'main_menu')
    }, cache);
  });

  /**
   * Раздел "О сайте" — Информация о проекте
   */
  guide.callbackQuery('guide_site', async (ctx) => {
    const text = renderSiteGuide();
    
    await safeEditOrReply(ctx, text, {
      parse_mode: 'HTML',
      reply_markup: getNavigationButtons('guide_menu', 'main_menu')
    }, cache);
  });

  return guide;
}