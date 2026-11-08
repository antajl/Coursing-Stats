import {
  type Heat,
  type CompetitionResult,
  type CompetitionData,
  normalizeSex,
  parseBreedClass,
  escapeHtml,
  formatCatalogNo,
  formatDogName,
  buildEventTitle,
  buildMetaRowsHtml,
  getRacingRaceNumber,
  renderRacingBibCell,
  renderRacingTimeSpeed,
} from './protocol-shared.js';
import { getProtocolStyles } from './protocol-styles.js';

export function buildRacingProtocolHtml(comp: CompetitionData): string {
  const eventTitle = buildEventTitle(comp);

  const activeGroups = new Map<string, CompetitionResult[]>();
  const dnsList: CompetitionResult[] = [];

  for (const r of comp.results) {
    if (r.status === 'dns' || r.status === 'absent') {
      dnsList.push(r);
      continue;
    }
    const info = parseBreedClass(r.breed_class, r.dog?.breed, r.dog?.sex);
    if (!activeGroups.has(info.groupHeader)) {
      activeGroups.set(info.groupHeader, []);
    }
    activeGroups.get(info.groupHeader)!.push(r);
  }

  const sortedGroupEntries = [...activeGroups.entries()].sort((a, b) => {
    const minA = Math.min(...a[1].map(d => d.catalog_no || 9999));
    const minB = Math.min(...b[1].map(d => d.catalog_no || 9999));
    if (minA !== minB) return minA - minB;
    return a[0].localeCompare(b[0], 'ru');
  });

  const sortedActiveGroups = new Map(sortedGroupEntries);

  for (const dogs of sortedActiveGroups.values()) {
    dogs.sort((a, b) => {
      const pa = a.placement ?? 999;
      const pb = b.placement ?? 999;
      if (pa !== pb) return pa - pb;
      return a.catalog_no - b.catalog_no;
    });
  }

  dnsList.sort((a, b) => a.catalog_no - b.catalog_no);

  const overallMaxHeats = Math.min(3, Math.max(
    1,
    ...comp.results.map(r => r.raw_scores_json?.heats?.length || 0)
  ));
  const hasAnyBibs = comp.results.some(r =>
    r.raw_scores_json?.heats?.some(h => Boolean(h.bib_color) || h.bib_number != null)
  );
  const colsPerHeat = hasAnyBibs ? 3 : 2;
  const totalCols = 7 + overallMaxHeats * colsPerHeat + 2;
  const metaRowsHtml = buildMetaRowsHtml(comp, totalCols);

  const isLeagueComp =
    comp.event.competition_kind === 'Клубный чемпионат' ||
    Boolean(comp.event.title?.includes('Клубный чемпионат')) ||
    [2026004, 2022001, 2026005].includes(Number(comp.event.id)) ||
    comp.results.some(r =>
      (r.qualification && ['Прогресс', 'Чемпионы', 'Чемпионов', 'Абсолют', 'Юниор'].includes(r.qualification.trim())) ||
      (r.breed_class && /(?:Прогресс|Чемпион|Абсолют)/i.test(r.breed_class))
    );

  const qualColTitle = isLeagueComp ? 'Лига' : 'СС';
  const titleColTitle = isLeagueComp ? 'Переход<br>в лигу' : 'Титул';

  let heatsHeaderCells = '';
  for (let i = 1; i <= overallMaxHeats; i++) {
    const heatLabel = overallMaxHeats === 1 ? 'Забег' : `Забег<br>${i}`;
    const timeLabel = overallMaxHeats === 1 ? 'Время<br>Скорость' : `Время ${i}<br>Скорость`;
    if (hasAnyBibs) {
      heatsHeaderCells += `
      <td>${heatLabel}</td>
      <td>Попона</td>
      <td>${timeLabel}</td>`;
    } else {
      heatsHeaderCells += `
      <td>${heatLabel}</td>
      <td>${timeLabel}</td>`;
    }
  }

  const colHeaderHtml = `
    <tr class="col-header">
      <td>Место</td>
      <td>№</td>
      <td>Порода</td>
      <td>Класс</td>
      <td>Пол</td>
      <td>Кличка</td>
      <td>Дистанция<br>(м)</td>${heatsHeaderCells}
      <td>${qualColTitle}</td>
      <td>${titleColTitle}</td>
    </tr>`;

  let tableRowsHtml = `
    <tr class="top-title-row">
      <td colspan="${totalCols}">${escapeHtml(eventTitle)}</td>
    </tr>${metaRowsHtml}
    ${colHeaderHtml}
  `;

  for (const [groupName, dogs] of sortedActiveGroups.entries()) {
    tableRowsHtml += `
      <tr class="group-row">
        <td colspan="${totalCols}" class="group-header">${escapeHtml(groupName.replace(/_/g, ' — '))}</td>
      </tr>
    `;

    const groupMaxHeats = Math.max(...dogs.map(d => d.raw_scores_json?.heats?.length || 0));
    const groupValidHeat = dogs
      .flatMap(d => d.raw_scores_json?.heats || [])
      .find(h => h.time != null && h.time > 0 && h.speed_kmh != null && h.speed_kmh > 0);
    const defaultGroupDistance = groupValidHeat && groupValidHeat.time && groupValidHeat.speed_kmh
      ? Math.round((groupValidHeat.speed_kmh / 3.6) * groupValidHeat.time)
      : ((comp.event as any)?.distance || 350);

    for (const res of dogs) {
      const dog = res.dog;
      const dogName = formatDogName(dog);
      const info = parseBreedClass(res.breed_class, dog?.breed, dog?.sex);
      const breed = escapeHtml(info.breed);
      let sex = escapeHtml(normalizeSex(dog?.sex || '') || (info.category === 'Кобели' ? 'Кобель' : info.category === 'Суки' ? 'Сука' : ''));
      let className = escapeHtml(info.className).replace('Стандартный-спринтеры', 'Стандартный-<br>спринтеры');

      const heats = res.raw_scores_json?.heats || [];
      let heat1: Heat | null = null;
      let heat2: Heat | null = null;
      let heat3: Heat | null = null;

      if (overallMaxHeats <= 2) {
        heat1 = heats[0] || null;
        heat2 = heats[1] || null;
        heat3 = null;
      } else if (groupMaxHeats >= 3) {
        heat1 = heats[0] || null;
        heat2 = heats[1] || null;
        heat3 = heats[2] || null;
      } else {
        heat1 = heats[0] || null;
        heat2 = null;
        heat3 = heats[1] || null;
      }

      const place = res.placement ? res.placement : '';
      const vc = res.vc ? escapeHtml(res.vc) : '';
      const qual = res.qualification ? escapeHtml(res.qualification) : '';

      let leagueCell = '';
      let targetLeagueCell = '';

      if (isLeagueComp) {
        const lMatch = className.match(/\((Прогресс|Чемпионы|Чемпионов|Абсолют)\)/i);
        if (lMatch) {
          leagueCell = lMatch[1].replace(/чемпионов/i, 'Чемпионы');
          className = className.replace(/\s*\([^)]+\)/g, '').trim();
        } else if (/юниор/i.test(className)) {
          leagueCell = 'Юниор';
        } else {
          leagueCell = 'Прогресс';
        }

        const qualRaw = (res.qualification || '').trim();
        if (qualRaw) {
          if (/чемпион/i.test(qualRaw)) {
            targetLeagueCell = 'Чемпионов';
          } else if (/абсолют/i.test(qualRaw)) {
            targetLeagueCell = 'Абсолют';
          } else if (/прогресс/i.test(qualRaw)) {
            targetLeagueCell = 'Прогресс';
          } else {
            targetLeagueCell = escapeHtml(qualRaw);
          }
        } else if (res.status !== 'finished' && res.status !== 'dns') {
          targetLeagueCell = '—';
        } else {
          targetLeagueCell = leagueCell;
        }
      } else {
        leagueCell = vc;
        targetLeagueCell = qual;
      }

      let h1Reason: string | null = null;
      let h2Reason: string | null = null;
      let h3Reason: string | null = null;

      if (res.status !== 'finished' && res.status !== 'dns') {
        const rawReason = res.status_reason || (res.status === 'disqualified' ? 'Дисквалификация' : 'Снятие');
        const formattedReason = escapeHtml(rawReason)
          .replace(' (Вход в круг)', '<br>(Вход в круг)')
          .replace(' (Агрессия на старте)', '<br>(Агрессия на старте)')
          .replace(' (Агрессия)', '<br>(Агрессия)')
          .replace(' (Нарушение экипировки)', '<br>(Нарушение экипировки)')
          .replace(' (Остановка на трассе)', '<br>(Остановка на трассе)')
          .replace('Снят владельцем', 'Снят<br>владельцем')
          .replace(' (Возврат к владельцу)', '<br>(Возврат к владельцу)');

        if (heat1 && (heat1.time == null || heat1.time <= 0)) {
          h1Reason = formattedReason;
        } else if (heat2 && (heat2.time == null || heat2.time <= 0)) {
          h2Reason = formattedReason;
        } else if (heat3 && (heat3.time == null || heat3.time <= 0)) {
          h3Reason = formattedReason;
        } else if (!heat2) {
          h2Reason = formattedReason;
        }
      }

      let dogDistance = defaultGroupDistance;
      const validHeat = heats.find(h => h.time != null && h.time > 0 && h.speed_kmh != null && h.speed_kmh > 0);
      if (validHeat && validHeat.time && validHeat.speed_kmh) {
        dogDistance = Math.round((validHeat.speed_kmh / 3.6) * validHeat.time);
      } else if (res.raw_scores_json?.distance) {
        dogDistance = Number(res.raw_scores_json.distance);
      }

      tableRowsHtml += `
        <tr class="participant-row">
          <td>${place}</td>
          <td>${formatCatalogNo(res.catalog_no)}</td>
          <td>${breed}</td>
          <td>${className}</td>
          <td>${sex}</td>
          <td class="dog-name-cell">${dogName}</td>
          <td>${dogDistance}</td>
          ${(() => {
            const heatList = overallMaxHeats <= 2
              ? [{ h: heat1, r: h1Reason }, { h: heat2, r: h2Reason }].slice(0, overallMaxHeats)
              : [{ h: heat1, r: h1Reason }, { h: heat2, r: h2Reason }, { h: heat3, r: h3Reason }];

            return heatList.map(item => `
          <td>${getRacingRaceNumber(item.h)}</td>
          ${hasAnyBibs ? renderRacingBibCell(item.h) : ''}
          ${renderRacingTimeSpeed(item.h, item.r, dogDistance)}`).join('');
          })()}
          <td>${leagueCell}</td>
          <td>${targetLeagueCell}</td>
        </tr>
      `;
    }
  }

  // DNS section (Неявившиеся участники) at bottom
  if (dnsList.length > 0) {
    tableRowsHtml += `
      <tr class="group-row">
        <td colspan="${totalCols}" class="group-header">Неявившиеся участники</td>
      </tr>
    `;

    for (const res of dnsList) {
      const dog = res.dog;
      const dogName = formatDogName(dog);
      const info = parseBreedClass(res.breed_class, dog?.breed, dog?.sex);
      const breed = escapeHtml(info.breed);
      let sex = escapeHtml(normalizeSex(dog?.sex || '') || (info.category === 'Кобели' ? 'Кобель' : info.category === 'Суки' ? 'Сука' : ''));
      let className = escapeHtml(info.className).replace('Стандартный-спринтеры', 'Стандартный-<br>спринтеры');

      tableRowsHtml += `
        <tr class="dns-row">
          <td></td>
          <td>${formatCatalogNo(res.catalog_no)}</td>
          <td>${breed}</td>
          <td>${className}</td>
          <td>${sex}</td>
          <td class="dog-name-cell">${dogName}</td>
          <td colspan="${totalCols - 6}" class="status-cell">Неявка</td>
        </tr>
      `;
    }
  }

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(eventTitle)}</title>
  <style>
${getProtocolStyles({ discipline: 'racing', resultsCount: comp.results.length })}
  </style>
</head>
<body>
  <table class="protocol-table">
    ${(() => {
      if (!hasAnyBibs) {
        if (overallMaxHeats === 1) {
          return `
    <colgroup>
      <col style="width: 3.5%;">
      <col style="width: 3.0%;">
      <col style="width: 13.0%;">
      <col style="width: 10.0%;">
      <col style="width: 4.5%;">
      <col style="width: 33.0%;">
      <col style="width: 5.0%;">
      <col style="width: 5.0%;">
      <col style="width: 14.0%;">
      <col style="width: ${isLeagueComp ? '4.0%' : '3.5%'};">
      <col style="width: ${isLeagueComp ? '5.0%' : '5.5%'};">
    </colgroup>`;
        }
        if (overallMaxHeats === 2) {
          return `
    <colgroup>
      <col style="width: 3.0%;">
      <col style="width: 2.5%;">
      <col style="width: 11.5%;">
      <col style="width: 8.5%;">
      <col style="width: 4.0%;">
      <col style="width: 27.5%;">
      <col style="width: 4.5%;">
      <col style="width: 4.0%;">
      <col style="width: 11.0%;">
      <col style="width: 4.0%;">
      <col style="width: 11.0%;">
      <col style="width: ${isLeagueComp ? '4.0%' : '3.5%'};">
      <col style="width: ${isLeagueComp ? '4.5%' : '5.0%'};">
    </colgroup>`;
        }
        return `
    <colgroup>
      <col style="width: 3.0%;">
      <col style="width: 2.5%;">
      <col style="width: 10.5%;">
      <col style="width: 8.0%;">
      <col style="width: 4.0%;">
      <col style="width: 25.0%;">
      <col style="width: 4.0%;">
      <col style="width: 3.5%;">
      <col style="width: 8.0%;">
      <col style="width: 3.5%;">
      <col style="width: 8.0%;">
      <col style="width: 3.5%;">
      <col style="width: 8.0%;">
      <col style="width: ${isLeagueComp ? '4.0%' : '3.5%'};">
      <col style="width: ${isLeagueComp ? '4.5%' : '5.0%'};">
    </colgroup>`;
      }

      if (overallMaxHeats === 1) {
        return `
    <colgroup>
      <col style="width: 3.5%;">
      <col style="width: 3.0%;">
      <col style="width: 12.0%;">
      <col style="width: 10.0%;">
      <col style="width: 4.5%;">
      <col style="width: 34.0%;">
      <col style="width: 5.0%;">
      <col style="width: 4.5%;">
      <col style="width: 4.0%;">
      <col style="width: 10.5%;">
      <col style="width: ${isLeagueComp ? '4.0%' : '3.5%'};">
      <col style="width: ${isLeagueComp ? '5.0%' : '5.5%'};">
    </colgroup>`;
      }
      if (overallMaxHeats === 2) {
        return `
    <colgroup>
      <col style="width: 3.0%;">
      <col style="width: 2.5%;">
      <col style="width: 10.5%;">
      <col style="width: 8.5%;">
      <col style="width: 4.0%;">
      <col style="width: 26.0%;">
      <col style="width: 4.5%;">
      <col style="width: 3.8%;">
      <col style="width: 3.2%;">
      <col style="width: 8.5%;">
      <col style="width: 3.8%;">
      <col style="width: 3.2%;">
      <col style="width: 8.5%;">
      <col style="width: ${isLeagueComp ? '4.0%' : '3.5%'};">
      <col style="width: ${isLeagueComp ? '4.5%' : '5.0%'};">
    </colgroup>`;
      }
      return `
    <colgroup>
      <col style="width: 3.0%;">
      <col style="width: 2.5%;">
      <col style="width: 9.5%;">
      <col style="width: 7.5%;">
      <col style="width: 3.8%;">
      <col style="width: 21.7%;">
      <col style="width: 4.0%;">
      <col style="width: 3.5%;">
      <col style="width: 3.0%;">
      <col style="width: 7.0%;">
      <col style="width: 3.5%;">
      <col style="width: 3.0%;">
      <col style="width: 7.0%;">
      <col style="width: 3.5%;">
      <col style="width: 3.0%;">
      <col style="width: 7.0%;">
      <col style="width: ${isLeagueComp ? '3.5%' : '2.3%'};">
      <col style="width: ${isLeagueComp ? '4.0%' : '5.2%'};">
    </colgroup>`;
    })()}
    <tbody>
      ${tableRowsHtml}
    </tbody>
  </table>
</body>
</html>`;
}
