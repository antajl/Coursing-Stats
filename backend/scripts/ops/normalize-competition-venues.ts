/**
 * normalize-competition-venues.ts
 *
 * Standardizes location, region, and host_club across all competition events (2015-2026).
 * Synchronizes data/v1/calendar/{year}.json and data/v1/competitions/{year}/**.json.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../../..');

const CALENDAR_DIR = path.join(ROOT, 'data/v1/calendar');
const COMPS_DIR = path.join(ROOT, 'data/v1/competitions');

interface VenueInfo {
  location: string;
  region: string;
  defaultHost?: string;
}

function resolveVenueAndRegion(textPool: string): VenueInfo {
  const text = textPool.toLowerCase();

  // 1. Калужская область
  if (/головинк/i.test(text)) {
    return {
      location: 'Калужская область, Жуковский р-н, б/о Головинка',
      region: 'Калужская область',
      defaultHost: 'РООКО Кинологический союз «Арта»',
    };
  }
  if (/иволг|прогнань/i.test(text)) {
    return {
      location: 'Калужская область, Жуковский р-н, с. Спас-Прогнанье, б/о «Иволга»',
      region: 'Калужская область',
      defaultHost: 'РООКО Кинологический союз «Арта»',
    };
  }

  // 2. Вологодская область
  if (/вологд/i.test(text)) {
    return {
      location: 'Вологодская область, г. Вологда',
      region: 'Вологодская область',
      defaultHost: 'ВГООКС «Сириус»',
    };
  }

  // 3. Ставропольский край
  if (/ставропол/i.test(text)) {
    return {
      location: 'Ставропольский край, г. Ставрополь',
      region: 'Ставропольский край',
      defaultHost: 'ОО «Региональное кинологическое общество Ставропольского края «Альянс»',
    };
  }

  // 4. Свердловская область
  if (/седельников/i.test(text)) {
    return {
      location: 'Свердловская область, Сысертский р-н, д. Большое Седельниково',
      region: 'Свердловская область',
      defaultHost: 'РОО «Союз охотников и рыболовов Свердловской области»',
    };
  }
  if (/кадников/i.test(text)) {
    return {
      location: 'Свердловская область, Сысертский р-н, с. Кадниково',
      region: 'Свердловская область',
      defaultHost: 'РОО «Союз охотников и рыболовов Свердловской области»',
    };
  }

  // 5. Республика Татарстан
  if (/высокая гора/i.test(text)) {
    return {
      location: 'Республика Татарстан, Высокогорский р-н, пгт. Высокая Гора',
      region: 'Республика Татарстан',
      defaultHost: 'РОО «Республиканский клуб собаководов и охотников»',
    };
  }
  if (/зеленодол|казан|татарстан/i.test(text)) {
    return {
      location: 'Республика Татарстан, Зеленодольский р-н',
      region: 'Республика Татарстан',
      defaultHost: 'РОО «Республиканский клуб собаководов и охотников»',
    };
  }

  // 6. Ярославская область
  if (/первитин/i.test(text)) {
    return {
      location: 'Ярославская область, Ростовский р-н, с. Первитино',
      region: 'Ярославская область',
      defaultHost: 'ОО «Ярославский областной клуб спортивно-прикладного собаководства»',
    };
  }
  if (/великое/i.test(text)) {
    return {
      location: 'Ярославская область, Гаврилов-Ямский р-н, с. Великое',
      region: 'Ярославская область',
      defaultHost: 'ОО «Ярославский областной клуб спортивно-прикладного собаководства»',
    };
  }
  if (/большесел/i.test(text)) {
    return {
      location: 'Ярославская область, Большесельский р-н',
      region: 'Ярославская область',
      defaultHost: 'ОО «Ярославский областной клуб спортивно-прикладного собаководства»',
    };
  }
  if (/левцов/i.test(text)) {
    return {
      location: 'Ярославская область, Ярославский р-н, АТК «Левцово»',
      region: 'Ярославская область',
      defaultHost: 'ОО «Ярославский областной клуб спортивно-прикладного собаководства»',
    };
  }
  if (/любим/i.test(text)) {
    return {
      location: 'Ярославская область, г. Любим',
      region: 'Ярославская область',
      defaultHost: 'ОО «Ярославский областной клуб спортивно-прикладного собаководства»',
    };
  }
  if (/ярослав/i.test(text)) {
    return {
      location: 'Ярославская область, г. Ярославль',
      region: 'Ярославская область',
      defaultHost: 'ОО «Ярославский областной клуб спортивно-прикладного собаководства»',
    };
  }

  // 7. Санкт-Петербург
  if (/петербург|петергоф/i.test(text)) {
    return {
      location: 'г. Санкт-Петербург, г. Петергоф',
      region: 'г. Санкт-Петербург',
      defaultHost: 'МОКО «Кеннел-клуб Санкт-Петербурга»',
    };
  }

  // 8. Пермский край
  if (/перм/i.test(text)) {
    return {
      location: 'Пермский край, г. Пермь',
      region: 'Пермский край',
      defaultHost: 'РСОО «Федерация спортивно-прикладного собаководства Пермского края»',
    };
  }

  // 9. Нижегородская область
  if (/курцев|городецк|нижегород/i.test(text)) {
    return {
      location: 'Нижегородская область, Городецкий р-н, д. Курцево',
      region: 'Нижегородская область',
      defaultHost: 'МОО «Клуб охотничьего собаководства «Артемида»',
    };
  }

  // 10. Новосибирская область
  if (/степной|новосибирск/i.test(text)) {
    return {
      location: 'Новосибирская область, Искитимский р-н, п. Степной',
      region: 'Новосибирская область',
      defaultHost: 'НГОО Клуб собаководства «Виннер»',
    };
  }

  // 11. Московская область - конкретные площадки
  if (/донино/i.test(text)) {
    return {
      location: 'Московская область, Раменский р-н, д. Донино',
      region: 'Московская область',
      defaultHost: 'МОРОО «Федерация спортивно-прикладного собаководства»',
    };
  }
  if (/суханов/i.test(text)) {
    return {
      location: 'Московская область, Ленинский г.о., д. Суханово',
      region: 'Московская область',
      defaultHost: 'МОКО «Русский простор»',
    };
  }
  if (/новый милет/i.test(text)) {
    return {
      location: 'Московская область, г.о. Балашиха, д. Новый Милет',
      region: 'Московская область',
      defaultHost: 'ОООК КЦ «Элита» (РАЛББ)',
    };
  }
  if (/раменск/i.test(text)) {
    return {
      location: 'Московская область, г. Раменское, Раменский ипподром',
      region: 'Московская область',
      defaultHost: 'МОРОО «Федерация спортивно-прикладного собаководства»',
    };
  }
  if (/царёв|царево/i.test(text)) {
    return {
      location: 'Московская область, Пушкинский р-н, с.п. Царёвское',
      region: 'Московская область',
      defaultHost: 'СПГОО «Общество любителей животных «Радонежье»',
    };
  }
  if (/сергиев.*посад|радонеж/i.test(text)) {
    return {
      location: 'Московская область, Сергиево-Посадский г.о.',
      region: 'Московская область',
      defaultHost: 'СПГОО «Общество любителей животных «Радонежье»',
    };
  }
  if (/купавн/i.test(text)) {
    return {
      location: 'Московская область, г.о. Балашиха, мкр. Купавна',
      region: 'Московская область',
      defaultHost: 'МОРОО «Федерация спортивно-прикладного собаководства»',
    };
  }
  if (/балаших/i.test(text)) {
    return {
      location: 'Московская область, г. Балашиха',
      region: 'Московская область',
      defaultHost: 'ОООК КЦ «Элита» (РАЛББ)',
    };
  }
  if (/михайловск/i.test(text)) {
    return {
      location: 'Московская область, Пушкинский р-н, д. Михайловское',
      region: 'Московская область',
      defaultHost: 'МОРОО «Федерация спортивно-прикладного собаководства»',
    };
  }
  if (/левково/i.test(text)) {
    return {
      location: 'Московская область, Пушкинский р-н, д. Левково',
      region: 'Московская область',
      defaultHost: 'КЛЖ «Фауна»',
    };
  }

  // Fallback
  return {
    location: 'Московская область',
    region: 'Московская область',
    defaultHost: 'МОРОО «Федерация спортивно-прикладного собаководства»',
  };
}

function resolveHostClub(ev: any, defaultHost?: string): string {
  const cur = (ev.host_club || '').trim();
  const title = (ev.title || '').trim();
  const id = Number(ev.id);

  // Donino Club Championship series
  if (id === 2026004 || id === 2022001 || id === 2026005 || /клубный чемпионат донино/i.test(title)) {
    return 'Курсинг в Донино';
  }

  // Autumn Marathon (NKP RPB)
  if (/осенний марафон/i.test(title) || /нкп\s+рпб|русская псовая борзая/i.test(cur)) {
    return 'НКП «Русская псовая борзая»';
  }

  // Martovskiy Zayats (Fauna)
  if (/мартовский заяц/i.test(title) || /фауна/i.test(cur)) {
    return 'КЛЖ «Фауна»';
  }

  // Radonezhye
  if (/радонеж/i.test(cur) || /царёв/i.test(title)) {
    return 'СПГОО «Общество любителей животных «Радонежье»';
  }

  // Sirius (Vologda)
  if (/сириус/i.test(cur) || /вологд/i.test(title)) {
    return 'ВГООКС «Сириус»';
  }

  // Yaroslavl club
  if (/ярослав/i.test(cur) || /первитин|великое|большесел/i.test(title)) {
    return 'ОО «Ярославский областной клуб спортивно-прикладного собаководства»';
  }

  // Elita / RALBB
  if (id === 20210613 || /элита|ралбб/i.test(cur) || (cur === 'Новый Милет' && !/осенний марафон/i.test(title))) {
    return 'ОООК КЦ «Элита» (РАЛББ)';
  }

  // Arta
  if (/арта/i.test(cur) || /головинк|иволг/i.test(title)) {
    return 'РООКО Кинологический союз «Арта»';
  }

  // Sverdlovsk / Urals
  if (/сооир|свердлов/i.test(cur) || /уральский беговой|седельников|кадников/i.test(title)) {
    return 'РОО «Союз охотников и рыболовов Свердловской области»';
  }

  // Alliance (Stavropol)
  if (/альянс|ставропол/i.test(cur) || /ставропол/i.test(title)) {
    return 'ОО «Региональное кинологическое общество Ставропольского края «Альянс»';
  }

  // Tatarstan
  if (/рксо|республиканский клуб собаководов|татарстан/i.test(cur) || /казань|зеленодол/i.test(title)) {
    return 'РОО «Республиканский клуб собаководов и охотников»';
  }

  // Perm
  if (/перм/i.test(cur) || /перм/i.test(title)) {
    return 'РСОО «Федерация спортивно-прикладного собаководства Пермского края»';
  }

  // Kennel Club SPb
  if (/кеннел|санкт-петербург/i.test(cur) || /санкт-петербург|петергоф/i.test(title)) {
    return 'МОКО «Кеннел-клуб Санкт-Петербурга»';
  }

  // Artemida
  if (/артемид/i.test(cur) || /курцев/i.test(title)) {
    return 'МОО «Клуб охотничьего собаководства «Артемида»';
  }

  // Winner (Novosibirsk)
  if (/виннер/i.test(cur) || /степной/i.test(title)) {
    return 'НГОО Клуб собаководства «Виннер»';
  }

  // Russkiy Prostore (Sukhanovo)
  if (/русский простор/i.test(cur) || /суханово/i.test(title)) {
    return 'МОКО «Русский простор»';
  }

  // FSPS (Ramenskoye / Donino / others)
  if (/фспс|федерация спортивно-прикладного/i.test(cur) || cur === 'Раменское') {
    return 'МОРОО «Федерация спортивно-прикладного собаководства»';
  }

  if (cur.length > 5) {
    return cur;
  }

  return defaultHost || 'МОРОО «Федерация спортивно-прикладного собаководства»';
}

export function runVenueNormalization() {
  const calFiles = fs.readdirSync(CALENDAR_DIR).filter(f => f.endsWith('.json')).sort();
  let totalEventsUpdated = 0;
  let totalCompsUpdated = 0;

  for (const calFile of calFiles) {
    const calPath = path.join(CALENDAR_DIR, calFile);
    const calData = JSON.parse(fs.readFileSync(calPath, 'utf8'));
    let calModified = false;

    for (const ev of calData.events) {
      const pool = [
        ev.location,
        ev.region,
        ev.title,
        ev.rank_label,
        ev.host_club,
        ev.results_file,
      ].filter(Boolean).join(' ');

      const vInfo = resolveVenueAndRegion(pool);
      const hostClub = resolveHostClub(ev, vInfo.defaultHost);

      if (
        ev.location !== vInfo.location ||
        ev.region !== vInfo.region ||
        ev.host_club !== hostClub
      ) {
        ev.location = vInfo.location;
        ev.region = vInfo.region;
        ev.host_club = hostClub;
        calModified = true;
        totalEventsUpdated++;
      }
    }

    if (calModified) {
      fs.writeFileSync(calPath, JSON.stringify(calData, null, 2) + '\n', 'utf8');
    }
  }

  // Now synchronize all competition JSON files
  function walkDir(dir: string, cb: (fp: string) => void) {
    for (const f of fs.readdirSync(dir)) {
      const full = path.join(dir, f);
      if (fs.statSync(full).isDirectory()) {
        walkDir(full, cb);
      } else if (f.endsWith('.json')) {
        cb(full);
      }
    }
  }

  // Map of normalized event metadata from all calendar files
  const calMap = new Map<number | string, any>();
  for (const calFile of calFiles) {
    const calData = JSON.parse(fs.readFileSync(path.join(CALENDAR_DIR, calFile), 'utf8'));
    for (const ev of calData.events) {
      calMap.set(ev.id, ev);
      calMap.set(String(ev.id), ev);
    }
  }

  walkDir(COMPS_DIR, (compPath) => {
    try {
      const comp = JSON.parse(fs.readFileSync(compPath, 'utf8'));
      if (!comp.event || !comp.event.id) return;
      const calEv = calMap.get(comp.event.id);
      if (!calEv) return;

      let compModified = false;
      if (comp.event.location !== calEv.location) {
        comp.event.location = calEv.location;
        compModified = true;
      }
      if (comp.event.region !== calEv.region) {
        comp.event.region = calEv.region;
        compModified = true;
      }
      if (comp.event.host_club !== calEv.host_club) {
        comp.event.host_club = calEv.host_club;
        compModified = true;
      }

      if (compModified) {
        fs.writeFileSync(compPath, JSON.stringify(comp, null, 2) + '\n', 'utf8');
        totalCompsUpdated++;
      }
    } catch (e) {
      console.error(`Error reading ${compPath}:`, e);
    }
  });

  console.log(`Venue normalization complete: ${totalEventsUpdated} calendar events updated, ${totalCompsUpdated} competition files updated.`);
}

if (process.argv[1] && process.argv[1].includes('normalize-competition-venues')) {
  runVenueNormalization();
}
