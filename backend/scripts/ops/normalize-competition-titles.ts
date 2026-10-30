/**
 * normalize-competition-titles.ts
 *
 * Normalizes competition titles and rank_labels across all years (2015-2026):
 * - Replaces generic dry abbreviations (ЧРКФ, ЧР, КР, ПЧРКФ) with human readable titles.
 * - Adds venue/city context in parentheses for repeated RKF championships (e.g. Чемпионат РКФ (Ярославль)).
 * - Preserves traditional cup and series names (Мартовский Заяц, Тройка..., Осенний Марафон, Клубный чемпионат Донино).
 * - Synchronizes calendar/{year}.json and competitions/{year}/**.json.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../../..');

const CALENDAR_DIR = path.join(ROOT, 'data/v1/calendar');
const COMPS_DIR = path.join(ROOT, 'data/v1/competitions');

interface SpecialName {
  name: string;
  rank: string;
  disc: string;
}

const SPECIAL_NAMES: Record<number | string, SpecialName> = {
  // 2015
  20150314: { name: 'Мартовский Заяц', rank: 'Чемпионат РКФ', disc: 'Курсинг борзых' },
  20150808: { name: 'Заяц на Ярославке', rank: 'Состязания CACL', disc: 'Курсинг борзых' },
  20150809: { name: 'Дружественные забеги', rank: 'Дружественные забеги', disc: 'Курсинг борзых' },

  // 2016
  20160227: { name: 'Мартовский Заяц', rank: 'Чемпионат РКФ', disc: 'Курсинг борзых' },
  20160806: { name: 'Заяц на Ярославке', rank: 'Состязания CACL', disc: 'Курсинг борзых' },
  20160807: { name: 'Дружественные забеги', rank: 'Дружественные забеги', disc: 'Курсинг борзых' },

  // 2017
  20170225: { name: 'Мартовский Заяц', rank: 'Чемпионат РКФ', disc: 'Курсинг борзых' },
  20170521: { name: 'Тройка, птица тройка', rank: 'Состязание свор', disc: 'Курсинг борзых' },
  20170813: { name: 'Состязания CACL (Михайловское)', rank: 'Состязания CACL (Михайловское)', disc: 'Бега борзых' },
  1557:     { name: 'Чемпионат России (Новый Милет)', rank: 'Чемпионат России (Новый Милет)', disc: 'Курсинг борзых' },
  20171029: { name: 'Тройка, птица осенняя', rank: 'Состязание свор', disc: 'Курсинг борзых' },

  // 2018
  20180309: { name: 'Мартовский Заяц', rank: 'Чемпионат РКФ', disc: 'Курсинг борзых' },
  20180603: { name: 'Тройка, птица весенняя', rank: 'Состязание свор', disc: 'Курсинг борзых' },
  20180611: { name: 'Чемпионат России (Новый Милет)', rank: 'Чемпионат России (Новый Милет)', disc: 'Бега борзых' },
  1560:     { name: 'Чемпионат РКФ (Новый Милет)', rank: 'Чемпионат РКФ (Новый Милет)', disc: 'Бега борзых' },
  20180825: { name: 'Международные CACIL & ЧРКФ', rank: 'Международные CACIL & Чемпионат РКФ', disc: 'Курсинг борзых' },
  20180915: { name: 'Чемпионат РКФ (Михайловское)', rank: 'Чемпионат РКФ (Михайловское)', disc: 'Курсинг борзых' },
  20180930: { name: 'Осенний Марафон', rank: 'Чемпионат НКП (РПБ)', disc: 'Курсинг борзых' },
  20181021: { name: 'Тройка, птица осенняя', rank: 'Состязание свор', disc: 'Курсинг борзых' },

  // 2019
  20190302: { name: 'Мартовский Заяц', rank: 'Чемпионат РКФ', disc: 'Курсинг борзых' },
  20190414: { name: 'Тройка, птица весенняя', rank: 'Состязание свор', disc: 'Курсинг борзых' },
  20190427: { name: 'Международные CACIL & ЧР', rank: 'Международные CACIL & Чемпионат России', disc: 'Курсинг борзых' },
  20190811: { name: 'Тестовые состязания (Раменское)', rank: 'Тестовые состязания', disc: 'Бега борзых' },
  20190908: { name: 'Чемпионат России (Новый Милет)', rank: 'Чемпионат России (Новый Милет)', disc: 'Бега борзых' },
  20191005: { name: 'Международные CACIL & CACL (Михайловское)', rank: 'Международные CACIL & CACL (Михайловское)', disc: 'Курсинг борзых' },
  20191006: { name: 'Осенний Марафон', rank: 'Чемпионат НКП (РПБ)', disc: 'Курсинг борзых' },
  20191110: { name: 'Тройка, птица осенняя', rank: 'Состязание свор', disc: 'Курсинг борзых' },

  // 2020
  20200822: { name: 'Международные CACIL & ЧРКФ', rank: 'Международные CACIL & Чемпионат РКФ', disc: 'Курсинг борзых' },
  20201003: { name: 'Зайчик-листопадничек', rank: 'Состязания CACL', disc: 'Курсинг борзых' },

  // 2021
  20210522: { name: 'Зигзаг удачи в лютиках', rank: 'Чемпионат РКФ - CACL', disc: 'Курсинг борзых' },
  20210821: { name: 'Международные CACIL & ЧРКФ', rank: 'Международные CACIL & Чемпионат РКФ', disc: 'Курсинг борзых' },
  20211002: { name: 'Зайчик-листопадничек', rank: 'CACIL & CACL', disc: 'Курсинг борзых' },
  20211010: { name: 'Международные CACIL & Чемпионат РКФ (Раменское)', rank: 'Международные CACIL & Чемпионат РКФ (Раменское)', disc: 'Бега борзых' },
  20211024: { name: 'Тройка, просто птица', rank: 'Состязание свор', disc: 'Курсинг борзых' },

  // 2022
  20221019: { name: 'Кубок России (Головинка)', rank: 'Кубок России (Головинка)', disc: 'БЗМП' },
  20221020: { name: 'Кубок России (Вологда)', rank: 'Кубок России (Вологда)', disc: 'Бега борзых' },
  20221028: { name: 'Кубок котейки Глюка', rank: 'Дружественные забеги', disc: 'Курсинг борзых' },

  // 2023
  20230924: { name: 'Осенний Марафон', rank: 'Осенний Марафон', disc: 'Курсинг борзых' },
  20230926: { name: 'Осенний Марафон', rank: 'Чемпионат НКП (РПБ)', disc: 'Курсинг борзых' },

  // Donino Series
  2026004:  { name: 'I Клубный чемпионат Донино', rank: 'I Клубный чемпионат Донино', disc: 'Бега борзых' },
  2022001:  { name: 'II Клубный чемпионат Донино', rank: 'II Клубный чемпионат Донино', disc: 'Бега борзых' },
  2026005:  { name: 'III Клубный чемпионат Донино', rank: 'III Клубный чемпионат Донино', disc: 'Бега борзых' },
};

function deduceVenue(textPool: string): string | null {
  const text = textPool.toLowerCase();
  if (/донино/i.test(text)) return 'Донино';
  if (/радонеж/i.test(text)) return 'Радонежье';
  if (/арта/i.test(text)) return 'Арта';
  if (/русск.*простор/i.test(text)) return 'Русский Простор';
  if (/уральск.*бегов.*клуб|седельников/i.test(text)) return 'Уральский беговой клуб';
  if (/раздоль/i.test(text)) return 'БК Раздолье';
  if (/ярославк/i.test(text)) return 'Курсинг на Ярославке';
  if (/ярослав/i.test(text)) return 'Ярославль';
  if (/ставропол/i.test(text)) return 'Ставрополь';
  if (/казан|зеленодол/i.test(text)) return 'Казань';
  if (/перм/i.test(text)) return 'Пермь';
  if (/суханов/i.test(text)) return 'Суханово';
  if (/михайловск/i.test(text)) return 'Михайловское';
  if (/кадников/i.test(text)) return 'Кадниково';
  if (/сириус|вологд/i.test(text)) return 'Вологда';
  if (/элит.*ралбб|сергиев.*посад/i.test(text)) return 'Сергиев Посад';
  if (/головинк/i.test(text)) return 'Головинка';
  if (/санкт-петербург|петербург/i.test(text)) return 'Санкт-Петербург';
  if (/балаших/i.test(text)) return 'Балашиха';
  if (/купавн/i.test(text)) return 'Купавна';
  if (/раменск/i.test(text)) return 'Раменское';
  if (/новый милет/i.test(text)) return 'Новый Милет';
  if (/первитин/i.test(text)) return 'Первитино';
  if (/иволг/i.test(text)) return 'Иволга';
  if (/сычево/i.test(text)) return 'Сычёво';
  if (/царёв|царево/i.test(text)) return 'Царёво';
  return null;
}

function deduceDiscipline(ev: any, textPool: string): string {
  if (ev.event_type === 'bzmp') return 'БЗМП';
  if (ev.event_type === 'racing') return 'Бега борзых';
  if (ev.event_type === 'other') return 'Другие';
  const text = (textPool + ' ' + (ev.results_file || '')).toLowerCase();
  if (/бзмп|приманк/i.test(text)) return 'БЗМП';
  if (/рейсинг|бега борзых|круг/i.test(text)) return 'Бега борзых';
  return 'Курсинг борзых';
}

function deduceRank(ev: any, textPool: string): string {
  const pool = (textPool + ' ' + (ev.results_file || '')).toLowerCase();
  if (/чемпионат россии|чр\b/i.test(pool) && !/ркф/i.test(pool)) return 'Чемпионат России';
  if (/кубок россии|кр\b/i.test(pool)) return 'Кубок России';
  if (/монопородн|пчркф|монородн/i.test(pool)) return 'Монопородный чемпионат РКФ';
  if (/клубный чемпионат/i.test(pool)) return 'Клубный чемпионат';
  if (/дружествен/i.test(pool)) return 'Дружественные забеги';
  if (/cacil/i.test(pool)) return 'Международные состязания CACIL';
  if (/cacl/i.test(pool) && !/чркф|чемпионат ркф/i.test(pool)) return 'Состязания CACL';
  return 'Чемпионат РКФ';
}

function normalizeEventName(ev: any): { rank_label: string; title: string } {
  const id = Number(ev.id);
  if (SPECIAL_NAMES[id]) {
    const s = SPECIAL_NAMES[id];
    const rankLabel = s.name === s.rank ? `${s.name}\n(${s.disc})` : `${s.name} · ${s.rank}\n(${s.disc})`;
    let fullTitle = `${s.name} — ${s.rank}`;
    if (s.name === s.rank) {
      const discPhrase = s.disc === 'Бега борзых' ? 'по бегам борзых' : (s.disc === 'БЗМП' ? 'по бегам за механической приманкой' : 'по курсингу борзых');
      fullTitle = `${s.name} ${discPhrase}`;
    }
    return {
      rank_label: rankLabel,
      title: fullTitle,
    };
  }

  // Use only intrinsic data (club, location, kind, type, full_title) to avoid prior title contamination
  const pool = [ev.raw_title, ev.full_title, ev.host_club, ev.location, ev.competition_kind, ev.competition_type].filter(Boolean).join(' ');
  const venue = deduceVenue(pool);
  const disc = deduceDiscipline(ev, pool);
  const rank = deduceRank(ev, pool);

  let mainTitle = rank;
  if (venue) {
    mainTitle = `${rank} (${venue})`;
  }

  let discPhrase = disc === 'БЗМП'
    ? 'по бегам за механической приманкой'
    : (disc === 'Бега борзых' ? 'по бегам борзых' : 'по курсингу борзых');

  const title = `${mainTitle} ${discPhrase}`;
  const rank_label = `${mainTitle}\n(${disc})`;

  return { rank_label, title };
}

export function runNormalization() {
  const calFiles = fs.readdirSync(CALENDAR_DIR).filter(f => f.endsWith('.json')).sort();
  let totalEventsUpdated = 0;
  let totalCompsUpdated = 0;

  for (const cFile of calFiles) {
    const fullPath = path.join(CALENDAR_DIR, cFile);
    const cal = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    const events = Array.isArray(cal) ? cal : (cal.events || []);
    let calChanged = false;

    for (const ev of events) {
      let comp = null;
      let compPath = null;
      if (ev.results_file) {
        compPath = path.join(ROOT, 'data/v1', ev.results_file);
        if (fs.existsSync(compPath)) {
          comp = JSON.parse(fs.readFileSync(compPath, 'utf8'));
        }
      }

      const mergedData = {
        ...ev,
        full_title: comp?.event?.full_title || ev.full_title,
        host_club: comp?.event?.host_club || ev.host_club,
        location: comp?.event?.location || ev.location,
        competition_kind: comp?.event?.competition_kind || ev.competition_kind,
        competition_type: comp?.event?.competition_type || ev.competition_type,
        raw_title: comp?.event?.full_title || null,
      };

      const norm = normalizeEventName(mergedData);

      if (ev.rank_label !== norm.rank_label || ev.title !== norm.title) {
        ev.rank_label = norm.rank_label;
        ev.title = norm.title;
        calChanged = true;
        totalEventsUpdated++;
      }

      if (comp && compPath) {
        let compChanged = false;
        if (comp.event.rank_label !== norm.rank_label || comp.event.title !== norm.title) {
          comp.event.rank_label = norm.rank_label;
          comp.event.title = norm.title;
          compChanged = true;
          totalCompsUpdated++;
        }
        if (compChanged) {
          fs.writeFileSync(compPath, JSON.stringify(comp, null, 2) + '\n', 'utf8');
        }
      }
    }

    if (calChanged) {
      fs.writeFileSync(fullPath, JSON.stringify(cal, null, 2) + '\n', 'utf8');
    }
  }

  console.log(`Normalization complete: ${totalEventsUpdated} calendar events updated, ${totalCompsUpdated} competition files updated.`);
}

if (process.argv[1] === __filename) {
  runNormalization();
}
