import {
  type CompetitionResult,
  type CompetitionData,
  normalizeSex,
  parseBreedClass,
  escapeHtml,
  formatCatalogNo,
  formatDogName,
  getJudgeString,
  isGenericJudgePlaceholder,
  buildEventTitle,
  buildMetaRowsHtml,
  renderBibCellSingle,
  renderBibCellRowspan,
  renderScores,
} from './protocol-shared.js';
import { getProtocolStyles } from './protocol-styles.js';

export function buildCoursingProtocolHtml(comp: CompetitionData): string {
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

  const overallMaxHeats = Math.min(2, Math.max(
    1,
    ...comp.results.map(r => r.raw_scores_json?.heats?.length || 0)
  ));

  const maxJudges = Math.max(
    1,
    ...comp.results.flatMap(r => (r.raw_scores_json?.heats || []).map(h => h.judges?.length || 0))
  );

  const totalCols = overallMaxHeats === 1 ? 16 : 25;
  const metaRowsHtml = buildMetaRowsHtml(comp, totalCols);

  let colHeaderHtml = '';
  if (overallMaxHeats === 1) {
    colHeaderHtml = `
    <tr class="col-header">
      <td rowspan="2">Место</td>
      <td rowspan="2">№</td>
      <td rowspan="2">Порода</td>
      <td rowspan="2">Класс</td>
      <td rowspan="2">Пол</td>
      <td rowspan="2">Кличка</td>
      <td rowspan="2">Забег</td>
      <td colspan="6">${comp.event.judges && !isGenericJudgePlaceholder(comp.event.judges) ? escapeHtml(getJudgeString(comp.event.judges)) : 'Оценки по критериям'}</td>
      <td rowspan="2">Итого<br>баллов</td>
      <td rowspan="2">СС</td>
      <td rowspan="2">Титул</td>
    </tr>
    <tr class="col-header sub-header">
      <td>Ман.</td>
      <td>Резв.</td>
      <td>Вын.</td>
      <td>Прес.</td>
      <td>Энт.</td>
      <td>Сум.</td>
    </tr>`;
  } else {
    colHeaderHtml = `
    <tr class="col-header">
      <td rowspan="2">Место</td>
      <td rowspan="2">№</td>
      <td rowspan="2">Порода</td>
      <td rowspan="2">Класс</td>
      <td rowspan="2">Пол</td>
      <td rowspan="2">Кличка</td>
      <td rowspan="2">Забег<br>1</td>
      <td colspan="6">${comp.event.judges && !isGenericJudgePlaceholder(comp.event.judges) ? escapeHtml(getJudgeString(comp.event.judges)) : 'Оценки по критериям'}</td>
      <td rowspan="2">Сумма<br>1</td>
      <td rowspan="2">Забег<br>2</td>
      <td colspan="6">${comp.event.judges && !isGenericJudgePlaceholder(comp.event.judges) ? escapeHtml(getJudgeString(comp.event.judges)) : 'Оценки по критериям'}</td>
      <td rowspan="2">Сумма<br>2</td>
      <td rowspan="2">Общая<br>сумма</td>
      <td rowspan="2">СС</td>
      <td rowspan="2">Титул</td>
    </tr>
    <tr class="col-header sub-header">
      <td>Ман.</td>
      <td>Резв.</td>
      <td>Вын.</td>
      <td>Прес.</td>
      <td>Энт.</td>
      <td>Сум.</td>
      <td>Ман.</td>
      <td>Резв.</td>
      <td>Вын.</td>
      <td>Прес.</td>
      <td>Энт.</td>
      <td>Сум.</td>
    </tr>`;
  }

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

    for (const res of dogs) {
      const dog = res.dog;
      const dogName = formatDogName(dog);
      const info = parseBreedClass(res.breed_class, dog?.breed, dog?.sex);
      const breed = escapeHtml(info.breed);
      let sex = escapeHtml(normalizeSex(dog?.sex || '') || (info.category === 'Кобели' ? 'Кобель' : info.category === 'Суки' ? 'Сука' : ''));
      let className = escapeHtml(info.className).replace('Стандартный-спринтеры', 'Стандартный-<br>спринтеры');

      const heats = res.raw_scores_json?.heats || [];
      const heat1 = heats[0] || null;
      const heat2 = heats[1] || null;

      const j1_h1 = heat1?.judges?.[0] || null;
      const j2_h1 = heat1?.judges?.[1] || null;
      const j3_h1 = heat1?.judges?.[2] || null;

      const j1_h2 = heat2?.judges?.[0] || null;
      const j2_h2 = heat2?.judges?.[1] || null;
      const j3_h2 = heat2?.judges?.[2] || null;

      const place = res.placement ? res.placement : '';
      const totalScore = res.total_score ? res.total_score : '';
      const vc = res.vc ? escapeHtml(res.vc) : '';
      const qual = res.qualification ? escapeHtml(res.qualification) : '';

      // Single heat coursing participant
      if (overallMaxHeats === 1) {
        if (res.status === 'disqualified' || res.status === 'eliminated') {
          const prefix = res.status === 'disqualified' ? 'Снятие' : 'Отстранение';
          const reason = res.status_reason ? `${prefix} (${res.status_reason})` : prefix;
          tableRowsHtml += `
            <tr class="participant-row">
              <td>${place}</td>
              <td>${formatCatalogNo(res.catalog_no)}</td>
              <td>${breed}</td>
              <td>${className}</td>
              <td>${sex}</td>
              <td class="dog-name-cell">${dogName}</td>
              ${renderBibCellSingle(heat1)}
              <td colspan="9" class="status-cell">${escapeHtml(reason)}</td>
            </tr>
          `;
        } else {
          tableRowsHtml += `
            <tr class="participant-row">
              <td rowspan="${maxJudges}">${place}</td>
              <td rowspan="${maxJudges}">${formatCatalogNo(res.catalog_no)}</td>
              <td rowspan="${maxJudges}">${breed}</td>
              <td rowspan="${maxJudges}">${className}</td>
              <td rowspan="${maxJudges}">${sex}</td>
              <td rowspan="${maxJudges}" class="dog-name-cell">${dogName}</td>
              ${renderBibCellRowspan(heat1, maxJudges)}
              ${renderScores(j1_h1)}
              <td rowspan="${maxJudges}">${totalScore || (heat1?.total != null ? heat1.total : '')}</td>
              <td rowspan="${maxJudges}">${vc}</td>
              <td rowspan="${maxJudges}">${qual}</td>
            </tr>
            ${maxJudges >= 2 ? `
            <tr class="participant-row">
              ${renderScores(j2_h1)}
            </tr>` : ''}
            ${maxJudges >= 3 ? `
            <tr class="participant-row">
              ${renderScores(j3_h1)}
            </tr>` : ''}
          `;
        }
        continue;
      }

      // Case 1: Eliminated/Disqualified/Withdrawn/Injured in Heat 1 (single row)
      const isFailedInHeat1 = (res.status === 'disqualified' || res.status === 'eliminated' || res.status === 'withdrawn' || res.status === 'injured' || res.status === 'dnf' || res.status === 'dropped_out') && heats.length <= 1;
      if (isFailedInHeat1) {
        const reason = res.status_reason || (res.status === 'injured' ? 'Травма' : (res.status === 'withdrawn' ? 'Снят' : ((res.status === 'dnf' || res.status === 'dropped_out') ? 'Сошёл' : 'Дисквалификация')));
        tableRowsHtml += `
          <tr class="participant-row">
            <td>${place}</td>
            <td>${formatCatalogNo(res.catalog_no)}</td>
            <td>${breed}</td>
            <td>${className}</td>
            <td>${sex}</td>
            <td class="dog-name-cell">${dogName}</td>
            ${renderBibCellSingle(heat1)}
            <td colspan="18" class="status-cell">${escapeHtml(reason)}</td>
          </tr>
        `;
        continue;
      }

      // Case 2: Eliminated/Disqualified/Withdrawn/Injured in Heat 2
      const isFailedInHeat2 = (res.status === 'eliminated' || res.status === 'disqualified' || res.status === 'withdrawn' || res.status === 'injured' || res.status === 'dnf' || res.status === 'dropped_out') && heats.length > 1;
      if (isFailedInHeat2) {
        const reason = res.status_reason || (res.status === 'injured' ? 'Травма' : (res.status === 'withdrawn' ? 'Снят' : ((res.status === 'dnf' || res.status === 'dropped_out') ? 'Сошёл' : 'Дисквалификация')));
        tableRowsHtml += `
          <tr class="participant-row">
            <td rowspan="${maxJudges}">${place}</td>
            <td rowspan="${maxJudges}">${formatCatalogNo(res.catalog_no)}</td>
            <td rowspan="${maxJudges}">${breed}</td>
            <td rowspan="${maxJudges}">${className}</td>
            <td rowspan="${maxJudges}">${sex}</td>
            <td rowspan="${maxJudges}" class="dog-name-cell">${dogName}</td>
            ${renderBibCellRowspan(heat1, maxJudges)}
            ${renderScores(j1_h1)}
            <td rowspan="${maxJudges}">${heat1?.total != null ? heat1.total : ''}</td>
            ${renderBibCellRowspan(heat2, maxJudges)}
            <td colspan="7" rowspan="${maxJudges}" class="status-cell">${escapeHtml(reason)}</td>
            <td rowspan="${maxJudges}">${totalScore}</td>
            <td rowspan="${maxJudges}">${vc}</td>
            <td rowspan="${maxJudges}">${qual}</td>
          </tr>
          <tr class="participant-row">
            ${renderScores(j2_h1)}
          </tr>
          ${maxJudges >= 3 ? `
          <tr class="participant-row">
            ${renderScores(j3_h1)}
          </tr>` : ''}
        `;
        continue;
      }

      // Case 3: Standard 2-run participant
      tableRowsHtml += `
        <tr class="participant-row">
          <td rowspan="${maxJudges}">${place}</td>
          <td rowspan="${maxJudges}">${formatCatalogNo(res.catalog_no)}</td>
          <td rowspan="${maxJudges}">${breed}</td>
          <td rowspan="${maxJudges}">${className}</td>
          <td rowspan="${maxJudges}">${sex}</td>
          <td rowspan="${maxJudges}" class="dog-name-cell">${dogName}</td>
          ${renderBibCellRowspan(heat1, maxJudges)}
          ${renderScores(j1_h1)}
          <td rowspan="${maxJudges}">${heat1?.total != null ? heat1.total : ''}</td>
          ${renderBibCellRowspan(heat2, maxJudges)}
          ${renderScores(j1_h2)}
          <td rowspan="${maxJudges}">${heat2?.total != null ? heat2.total : ''}</td>
          <td rowspan="${maxJudges}">${totalScore}</td>
          <td rowspan="${maxJudges}">${vc}</td>
          <td rowspan="${maxJudges}">${qual}</td>
        </tr>
        <tr class="participant-row">
          ${renderScores(j2_h1)}
          ${renderScores(j2_h2)}
        </tr>
        ${maxJudges >= 3 ? `
        <tr class="participant-row">
          ${renderScores(j3_h1)}
          ${renderScores(j3_h2)}
        </tr>` : ''}
      `;
    }
  }

  // DNS section (Неприбывшие участники) at the bottom
  if (dnsList.length > 0) {
    tableRowsHtml += `
      <tr class="group-row">
        <td colspan="${totalCols}" class="group-header">Неприбывшие участники</td>
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
${getProtocolStyles({ discipline: 'coursing', resultsCount: comp.results.length })}
  </style>
</head>
<body>
  <table class="protocol-table">
    ${overallMaxHeats === 1 ? `
    <colgroup>
      <col style="width: 3.0%;">
      <col style="width: 2.5%;">
      <col style="width: 10.0%;">
      <col style="width: 8.0%;">
      <col style="width: 4.0%;">
      <col style="width: 40.0%;">
      <col style="width: 3.5%;">
      <col style="width: 3.0%;">
      <col style="width: 3.0%;">
      <col style="width: 3.0%;">
      <col style="width: 3.0%;">
      <col style="width: 3.0%;">
      <col style="width: 4.0%;">
      <col style="width: 4.5%;">
      <col style="width: 3.0%;">
      <col style="width: 5.5%;">
    </colgroup>` : `
    <colgroup>
      <col style="width: 2.4%;">
      <col style="width: 2.0%;">
      <col style="width: 7.0%;">
      <col style="width: 6.0%;">
      <col style="width: 3.2%;">
      <col style="width: 33.0%;">
      <col style="width: 2.4%;">
      <col style="width: 1.6%;">
      <col style="width: 1.6%;">
      <col style="width: 1.6%;">
      <col style="width: 1.6%;">
      <col style="width: 1.6%;">
      <col style="width: 1.6%;">
      <col style="width: 2.6%;">
      <col style="width: 2.4%;">
      <col style="width: 1.6%;">
      <col style="width: 1.6%;">
      <col style="width: 1.6%;">
      <col style="width: 1.6%;">
      <col style="width: 1.6%;">
      <col style="width: 1.6%;">
      <col style="width: 2.6%;">
      <col style="width: 3.0%;">
      <col style="width: 2.2%;">
      <col style="width: 10.0%;">
    </colgroup>`}
    <tbody>
      ${tableRowsHtml}
    </tbody>
  </table>
</body>
</html>`;
}
