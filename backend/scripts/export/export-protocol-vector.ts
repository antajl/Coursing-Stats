import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export interface DogInfo {
  name_ru?: string;
  name_lat?: string;
  breed?: string;
  sex?: string;
}

export interface JudgeScore {
  scores?: number[];
  sum?: number;
}

export interface Heat {
  heat_number?: number;
  bib_number?: number;
  bib_color?: string;
  judges?: JudgeScore[];
  total?: number;
  time?: number | null;
  speed_kmh?: number | null;
}

export interface CompetitionResult {
  catalog_no: number;
  breed_class: string;
  placement?: number | null;
  total_score?: number | null;
  vc?: string | null;
  qualification?: string | null;
  status?: string;
  status_reason?: string | null;
  raw_scores_json?: {
    format?: string;
    heats?: Heat[];
  };
  dog?: DogInfo;
}

export interface CompetitionData {
  event_id: number;
  event: {
    id?: number;
    name?: string;
    date?: string;
    date_start?: string;
    date_end?: string;
    location?: string;
    title?: string;
    competition_kind?: string;
    competition_type?: string;
    full_title?: string;
    event_type?: string;
    host_club?: string | null;
    judges?: string | null;
  };
  results: CompetitionResult[];
}

export function normalizeBreed(b: string): string {
  if (!b) return '';
  const s = b.trim().toLowerCase();
  if (s.includes('басенджи')) return 'Басенджи';
  if (s.includes('грейхаунд')) return 'Грейхаунд';
  if (s.includes('ирландский вольфхаунд') || (s.includes('ирландский') && !s.includes('терьер'))) return 'Ирландский вольфхаунд';
  if (s.includes('ирландский терьер')) return 'Ирландский терьер';
  if (s.includes('малая') || s.includes('итальянская') || s.includes('левретка')) return 'Малая итальянская борзая';
  if (s.includes('поденко')) return 'Поденко Ибиценко (к-ш, г-ш)';
  if (s.includes('родезийский') || s.includes('риджбек')) return 'Родезийский риджбек';
  if (s.includes('русская') || s.includes('псовая')) return 'Русская псовая борзая';
  if (s.includes('салюки')) return 'Салюки';
  if (s.includes('тазы')) return 'Тазы';
  if (s.includes('уиппет')) return 'Уиппет';
  if (s.includes('фараонова')) return 'Фараонова собака';
  if (s.includes('хортая')) return 'Хортая борзая';
  if (s.includes('чирнеко')) return 'Чирнеко дель Этна';
  if (s.includes('гальго') || s.includes('испанская')) return 'Испанская борзая (гальго)';
  return b.trim();
}

export function parseBreedClass(breedClass?: string | null, defaultBreed: string = '', defaultSex: string = '') {
  let parts = (breedClass || '').split(' - ').map(s => s.trim());
  if (parts[0] === 'Неявившиеся участники' || parts[0] === 'Неприбывшие участники') {
    parts = [];
  }
  const breed = parts[0] || normalizeBreed(defaultBreed) || '';
  const className = parts[1] || 'Стандартный';
  let category = parts[2] || defaultSex || 'Микс';

  if (category === 'Кобель' || category === 'Кобели') category = 'Кобели';
  else if (category === 'Сука' || category === 'Суки') category = 'Суки';
  else category = 'Микс';

  const groupHeader = `${breed}_${className}_${category}`;
  return { breed, className, category, groupHeader };
}

export function normalizeSex(s: string): string {
  if (!s) return '';
  const str = s.trim().toLowerCase();
  if (str === 'male' || str === 'кобель') return 'Кобель';
  if (str === 'female' || str === 'сука') return 'Сука';
  return s.trim();
}

export function escapeHtml(str: unknown): string {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function formatDogName(dog?: DogInfo): string {
  if (!dog) return '';
  const ru = (dog.name_ru || '').trim();
  const en = (dog.name_lat || '').trim();

  if (ru.includes('/')) {
    const parts = ru.split('/').map(p => p.trim());
    return `${escapeHtml(parts[0])} /<br>${escapeHtml(parts.slice(1).join('/'))}`;
  }
  if (en.includes('/')) {
    const parts = en.split('/').map(p => p.trim());
    return `${escapeHtml(parts[0])} /<br>${escapeHtml(parts.slice(1).join('/'))}`;
  }
  if (ru && en && ru.toUpperCase() !== en.toUpperCase()) {
    return `${escapeHtml(ru)} /<br>${escapeHtml(en)}`;
  }
  return escapeHtml(ru || en);
}

export function buildEventTitle(comp: CompetitionData): string {
  if (comp.event.full_title) return comp.event.full_title;
  const kind = comp.event.competition_kind || '';
  const type = comp.event.competition_type || 'курсингу';
  const kindLabel = kind === 'ЧРКФ' ? 'Чемпионат РКФ' : (comp.event.title || 'Соревнование');

  let dateStr = comp.event.date_start || '';
  if (comp.event.date_start && comp.event.date_end && comp.event.date_start !== comp.event.date_end) {
    const s = comp.event.date_start.split('-');
    const e = comp.event.date_end.split('-');
    if (s[0] === e[0] && s[1] === e[1]) {
      dateStr = `${s[2]}-${e[2]}.${e[1]}.${e[0]}`;
    } else {
      dateStr = `${s[2]}.${s[1]}.${s[0]} - ${e[2]}.${e[1]}.${e[0]}`;
    }
  } else if (dateStr) {
    const s = dateStr.split('-');
    dateStr = `${s[2]}.${s[1]}.${s[0]}`;
  }

  let loc = '';
  if (comp.event.location) {
    if (comp.event.location.includes('Донино')) {
      loc = ' (Московская обл., г. Раменское, д. Донино)';
    } else {
      loc = ` (${comp.event.location})`;
    }
  }
  let typeStr = type.toLowerCase();
  if (typeStr === 'бега борзых' || typeStr.includes('бега')) {
    typeStr = 'по бегам борзых';
  } else if (typeStr === 'курсинг борзых' || typeStr.includes('курсинг')) {
    typeStr = 'по курсингу борзых';
  } else if (typeStr === 'бзмп' || typeStr.includes('приманк')) {
    typeStr = 'по бегам за механической приманкой';
  } else if (!typeStr.startsWith('по ')) {
    typeStr = `по ${typeStr}`;
  }
  const doninoPrefix = (comp.event.location && comp.event.location.includes('Донино') && !loc.includes('Донино')) ? ' (Донино)' : '';
  return `${kindLabel} ${typeStr}${doninoPrefix}, ${dateStr}${loc}`;
}

// ----------------------------------------------------
export function buildMetaRowsHtml(comp: CompetitionData, colspan: number): string {
  let html = '';
  if (comp.event.host_club) {
    html += `\r\n    <tr class="meta-row">\r\n      <td colspan="${colspan}"><b>Организатор:</b> ${escapeHtml(comp.event.host_club)}</td>\r\n    </tr>`;
  }
  if (comp.event.judges) {
    html += `\r\n    <tr class="meta-row">\r\n      <td colspan="${colspan}"><b>Судьи:</b> ${escapeHtml(comp.event.judges)}</td>\r\n    </tr>`;
  }
  return html;
}

// RACING SPECIFIC RENDERING (Бега борзых)
// ----------------------------------------------------

export function getRacingRaceNumber(heat?: Heat | null): string {
  if (!heat || heat.heat_number == null) return '';
  return String(heat.heat_number);
}

export function renderRacingBibCell(heat?: Heat | null): string {
  if (!heat) return '<td></td>';
  const color = (heat.bib_color || '').toLowerCase();
  let num = heat.bib_number != null ? String(heat.bib_number) : '';
  let bg = '#ffffff';
  let textColor = '#000000';
  let border = 'border: 1px solid #4c4c4c;';

  if (color === 'red' || num === '1') {
    bg = '#ff0000';
    textColor = '#ffffff';
    border = '';
    if (!num) num = '1';
  } else if (color === 'blue' || num === '2') {
    bg = '#00a2e8';
    textColor = '#000000';
    border = '';
    if (!num) num = '2';
  } else if (color === 'white' || color === '#f0ffff' || num === '3') {
    bg = '#ffffff';
    textColor = '#000000';
    border = 'border: 1px solid #4c4c4c;';
    if (!num) num = '3';
  } else if (color === 'black' || num === '4') {
    bg = '#00a2e8'; // fallback
    bg = '#000000';
    textColor = '#ffffff';
    border = '';
    if (!num) num = '4';
  } else if (color === 'yellow' || num === '5') {
    bg = '#ffff00';
    textColor = '#000000';
    border = '';
    if (!num) num = '5';
  } else if (color === 'striped' || num === '6') {
    bg = '#ffffff';
    textColor = '#000000';
    border = 'border: 1px dashed #000000;';
    if (!num) num = '6';
  }

  if (!num) return '<td></td>';
  return `<td style="background-color: ${bg} !important; color: ${textColor}; font-weight: bold; ${border}">${num}</td>`;
}

export function renderRacingTimeSpeed(
  heat?: Heat | null,
  statusReason?: string | null,
  distance: number = 350
): string {
  if (statusReason) {
    return `<td class="time-speed-cell status-cell">${statusReason}</td>`;
  }
  if (!heat || heat.time == null) {
    return '<td></td>';
  }
  const time = heat.time;
  const speed_ms = (distance / time).toFixed(2);
  const speed_kmh = heat.speed_kmh != null
    ? heat.speed_kmh.toFixed(3)
    : ((distance / time) * 3.6).toFixed(3);

  return `<td class="time-speed-cell">${time.toFixed(2)} с<br>${speed_ms} м/с<br>${speed_kmh} км/ч</td>`;
}

export function buildRacingProtocolHtml(comp: CompetitionData): string {
  const eventTitle = buildEventTitle(comp);

  const activeGroups = new Map<string, CompetitionResult[]>();
  const dnsList: CompetitionResult[] = [];

  for (const r of comp.results) {
    if (r.status === 'dns') {
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

  const metaRowsHtml = buildMetaRowsHtml(comp, 18);

  let tableRowsHtml = `
    <tr class="top-title-row">
      <td colspan="18">${escapeHtml(eventTitle)}</td>
    </tr>${metaRowsHtml}
    <tr class="col-header">
      <td>Место</td>
      <td>№</td>
      <td>Порода</td>
      <td>Класс</td>
      <td>Пол</td>
      <td>Кличка</td>
      <td>Дистанция<br>(м)</td>
      <td>Забег<br>1</td>
      <td>Попона</td>
      <td>Время 1<br>Скорость</td>
      <td>Забег<br>2</td>
      <td>Попона</td>
      <td>Время 2<br>Скорость</td>
      <td>Забег<br>3</td>
      <td>Попона</td>
      <td>Время 3<br>Скорость</td>
      <td>СС</td>
      <td>Титул</td>
    </tr>
  `;

  for (const [groupName, dogs] of sortedActiveGroups.entries()) {
    tableRowsHtml += `
      <tr class="group-row">
        <td colspan="18" class="group-header">${escapeHtml(groupName.replace(/_/g, ' — '))}</td>
      </tr>
    `;

    const groupMaxHeats = Math.max(...dogs.map(d => d.raw_scores_json?.heats?.length || 0));

    for (const res of dogs) {
      const dog = res.dog;
      const dogName = formatDogName(dog);
      const info = parseBreedClass(res.breed_class, dog?.breed, dog?.sex);
      const breed = escapeHtml(info.breed);
      let sex = escapeHtml(dog?.sex || (info.category === 'Кобели' ? 'Кобель' : info.category === 'Суки' ? 'Сука' : ''));
      const className = escapeHtml(info.className).replace('Стандартный-спринтеры', 'Стандартный-<br>спринтеры');

      const heats = res.raw_scores_json?.heats || [];
      let heat1: Heat | null = null;
      let heat2: Heat | null = null;
      let heat3: Heat | null = null;

      if (groupMaxHeats >= 3) {
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

      tableRowsHtml += `
        <tr class="participant-row">
          <td>${place}</td>
          <td>${res.catalog_no}</td>
          <td>${breed}</td>
          <td>${className}</td>
          <td>${sex}</td>
          <td class="dog-name-cell">${dogName}</td>
          <td>350</td>
          <td>${getRacingRaceNumber(heat1)}</td>
          ${renderRacingBibCell(heat1)}
          ${renderRacingTimeSpeed(heat1, h1Reason)}
          <td>${getRacingRaceNumber(heat2)}</td>
          ${renderRacingBibCell(heat2)}
          ${renderRacingTimeSpeed(heat2, h2Reason)}
          <td>${getRacingRaceNumber(heat3)}</td>
          ${renderRacingBibCell(heat3)}
          ${renderRacingTimeSpeed(heat3, h3Reason)}
          <td>${vc}</td>
          <td>${qual}</td>
        </tr>
      `;
    }
  }

  // DNS section (Неявившиеся участники) at bottom
  if (dnsList.length > 0) {
    tableRowsHtml += `
      <tr class="group-row">
        <td colspan="18" class="group-header">Неявившиеся участники</td>
      </tr>
    `;

    for (const res of dnsList) {
      const dog = res.dog;
      const dogName = formatDogName(dog);
      const info = parseBreedClass(res.breed_class, dog?.breed, dog?.sex);
      const breed = escapeHtml(info.breed);
      let sex = escapeHtml(dog?.sex || (info.category === 'Кобели' ? 'Кобель' : info.category === 'Суки' ? 'Сука' : ''));
      const className = escapeHtml(info.className).replace('Стандартный-спринтеры', 'Стандартный-<br>спринтеры');

      tableRowsHtml += `
        <tr class="dns-row">
          <td></td>
          <td>${res.catalog_no}</td>
          <td>${breed}</td>
          <td>${className}</td>
          <td>${sex}</td>
          <td class="dog-name-cell">${dogName}</td>
          <td colspan="12" class="status-cell">Неявка</td>
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
    @page {
      size: A4 landscape;
      margin: 1.5mm 1.5mm 1.5mm 1.5mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      background: #ffffff;
      color: #000000;
      font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
      font-size: 11pt;
      line-height: 1.25;
    }
    table.protocol-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 1.5px;
      background-color: #ffffff;
      margin: 0;
      padding: 0;
    }
    th, td {
      border-top: 1px solid #4c4c4c;
      border-left: 1px solid #4c4c4c;
      border-right: 1px solid #b2b2b2;
      border-bottom: 1px solid #b2b2b2;
      background-color: #ffffff;
      padding: 4px 3px;
      text-align: center;
      vertical-align: middle;
      font-size: 10.5pt;
      font-weight: normal;
    }
    tr.top-title-row td {
      font-size: 14pt;
      font-weight: bold;
      padding: 7px 4px;
    }
    tr.meta-row td {
      font-size: 10.5pt;
      font-weight: normal;
      padding: 3.5px 4px;
      text-align: center;
    }
    tr.col-header td {
      font-size: 10pt;
      font-weight: normal;
      padding: 4px 1px;
    }
    tr.group-row {
      page-break-inside: avoid;
      page-break-after: avoid;
    }
    td.group-header {
      background-color: #c0c0c0 !important;
      font-size: 11.5pt;
      font-weight: normal;
      text-align: center;
      padding: 4.5px 3px;
    }
    td.dog-name-cell {
      text-align: center;
      font-size: 10.5pt;
      line-height: 1.25;
      padding: 4px 4px;
    }
    td.time-speed-cell {
      font-size: 9.5pt;
      line-height: 1.15;
      padding: 3px 2px;
    }
    td.status-cell {
      text-align: center;
      font-style: italic;
      font-size: 10pt;
      padding: 4px 3px;
    }
    tr.dns-row td {
      background-color: #c0c0c0 !important;
    }
    tr.participant-row {
      page-break-inside: avoid;
    }

    @media print {
      @page {
        size: A4 landscape;
        margin: 1.5mm 1.5mm 1.5mm 1.5mm;
      }
      html, body {
        font-size: 8.5pt;
        line-height: 1.15;
      }
      th, td {
        font-size: 8.5pt;
        padding: 2.5px 1.5px;
      }
      tr.top-title-row td {
        font-size: 11pt;
        padding: 3px;
      }
      tr.meta-row td {
        font-size: 8.5pt;
        padding: 2px 2px;
      }
      tr.col-header td {
        font-size: 8.5pt;
        padding: 2px 1px;
      }
      td.group-header {
        font-size: 9.5pt;
        padding: 2.5px 2px;
      }
      td.dog-name-cell {
        font-size: 8.5pt;
        padding: 2px 3px;
      }
      td.time-speed-cell {
        font-size: 7.5pt;
        line-height: 1.1;
        padding: 1.5px 1px;
      }
      td.status-cell {
        font-size: 8.5pt;
      }
    }
  </style>
</head>
<body>
  <table class="protocol-table">
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
      <col style="width: 2.3%;">
      <col style="width: 5.2%;">
    </colgroup>
    <tbody>
      ${tableRowsHtml}
    </tbody>
  </table>
</body>
</html>`;
}

// ----------------------------------------------------
// COURSING SPECIFIC RENDERING (Курсинг борзых)
// ----------------------------------------------------

export function renderBibCellRowspan(heat?: Heat | null): string {
  if (!heat || heat.bib_number == null) {
    return '<td rowspan="2"></td>';
  }
  const isRed = heat.bib_color === 'red';
  const bg = isRed ? '#ff0000' : '#ffffff';
  const color = isRed ? '#ffffff' : '#000000';
  return `<td rowspan="2" style="background-color: ${bg} !important; color: ${color}; font-style: italic;">${heat.bib_number}</td>`;
}

export function renderBibCellSingle(heat?: Heat | null): string {
  if (!heat || heat.bib_number == null) {
    return '<td></td>';
  }
  const isRed = heat.bib_color === 'red';
  const bg = isRed ? '#ff0000' : '#ffffff';
  const color = isRed ? '#ffffff' : '#000000';
  return `<td style="background-color: ${bg} !important; color: ${color}; font-style: italic;">${heat.bib_number}</td>`;
}

export function renderScores(judge?: JudgeScore | null): string {
  if (!judge || !judge.scores || judge.scores.length < 5) {
    return '<td></td><td></td><td></td><td></td><td></td><td></td>';
  }
  const s = judge.scores;
  return `<td>${s[0]}</td><td>${s[1]}</td><td>${s[2]}</td><td>${s[3]}</td><td>${s[4]}</td><td>${judge.sum ?? ''}</td>`;
}

export function buildCoursingProtocolHtml(comp: CompetitionData): string {
  const eventTitle = buildEventTitle(comp);

  const activeGroups = new Map<string, CompetitionResult[]>();
  const dnsList: CompetitionResult[] = [];

  for (const r of comp.results) {
    if (r.status === 'dns') {
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

  const metaRowsHtml = buildMetaRowsHtml(comp, 25);

  let tableRowsHtml = `
    <tr class="top-title-row">
      <td colspan="25">${escapeHtml(eventTitle)}</td>
    </tr>${metaRowsHtml}
    <tr class="col-header">
      <td rowspan="2">Место</td>
      <td rowspan="2">№</td>
      <td rowspan="2">Порода</td>
      <td rowspan="2">Класс</td>
      <td rowspan="2">Пол</td>
      <td rowspan="2">Кличка</td>
      <td rowspan="2">Забег<br>1</td>
      <td colspan="6">Главный судья/Судья</td>
      <td rowspan="2">Сумма<br>1</td>
      <td rowspan="2">Забег<br>2</td>
      <td colspan="6">Главный судья/Судья</td>
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
    </tr>
  `;

  for (const [groupName, dogs] of sortedActiveGroups.entries()) {
    tableRowsHtml += `
      <tr class="group-row">
        <td colspan="25" class="group-header">${escapeHtml(groupName.replace(/_/g, ' — '))}</td>
      </tr>
    `;

    for (const res of dogs) {
      const dog = res.dog;
      const dogName = formatDogName(dog);
      const info = parseBreedClass(res.breed_class, dog?.breed, dog?.sex);
      const breed = escapeHtml(info.breed);
      let sex = escapeHtml(dog?.sex || (info.category === 'Кобели' ? 'Кобель' : info.category === 'Суки' ? 'Сука' : ''));
      const className = escapeHtml(info.className).replace('Стандартный-спринтеры', 'Стандартный-<br>спринтеры');

      const heats = res.raw_scores_json?.heats || [];
      const heat1 = heats[0] || null;
      const heat2 = heats[1] || null;

      const j1_h1 = heat1?.judges?.[0] || null;
      const j2_h1 = heat1?.judges?.[1] || null;

      const j1_h2 = heat2?.judges?.[0] || null;
      const j2_h2 = heat2?.judges?.[1] || null;

      const place = res.placement ? res.placement : '';
      const totalScore = res.total_score ? res.total_score : '';
      const vc = res.vc ? escapeHtml(res.vc) : '';
      const qual = res.qualification ? escapeHtml(res.qualification) : '';

      // Case 1: Eliminated/Disqualified in Heat 1 (single row)
      if ((res.status === 'disqualified' || res.status === 'eliminated') && heats.length <= 1) {
        const prefix = res.status === 'disqualified' ? 'Снятие' : 'Отстранение';
        const reason = res.status_reason ? `${prefix} (${res.status_reason})` : prefix;
        tableRowsHtml += `
          <tr class="participant-row">
            <td>${place}</td>
            <td>${res.catalog_no}</td>
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

      // Case 2: Eliminated in Heat 2 (2 rows, heat 2 scores merged with reason)
      if (res.status === 'eliminated' && heats.length > 1) {
        const reason = res.status_reason ? `Отстранение (${res.status_reason})` : 'Отстранение';
        tableRowsHtml += `
          <tr class="participant-row">
            <td rowspan="2">${place}</td>
            <td rowspan="2">${res.catalog_no}</td>
            <td rowspan="2">${breed}</td>
            <td rowspan="2">${className}</td>
            <td rowspan="2">${sex}</td>
            <td rowspan="2" class="dog-name-cell">${dogName}</td>
            ${renderBibCellRowspan(heat1)}
            ${renderScores(j1_h1)}
            <td rowspan="2">${heat1 ? heat1.total : ''}</td>
            ${renderBibCellRowspan(heat2)}
            <td colspan="7" rowspan="2" class="status-cell">${escapeHtml(reason)}</td>
            <td rowspan="2">${totalScore}</td>
            <td rowspan="2">${vc}</td>
            <td rowspan="2">${qual}</td>
          </tr>
          <tr class="participant-row">
            ${renderScores(j2_h1)}
          </tr>
        `;
        continue;
      }

      // Case 3: Standard 2-run participant
      tableRowsHtml += `
        <tr class="participant-row">
          <td rowspan="2">${place}</td>
          <td rowspan="2">${res.catalog_no}</td>
          <td rowspan="2">${breed}</td>
          <td rowspan="2">${className}</td>
          <td rowspan="2">${sex}</td>
          <td rowspan="2" class="dog-name-cell">${dogName}</td>
          ${renderBibCellRowspan(heat1)}
          ${renderScores(j1_h1)}
          <td rowspan="2">${heat1 ? heat1.total : ''}</td>
          ${renderBibCellRowspan(heat2)}
          ${renderScores(j1_h2)}
          <td rowspan="2">${heat2 ? heat2.total : ''}</td>
          <td rowspan="2">${totalScore}</td>
          <td rowspan="2">${vc}</td>
          <td rowspan="2">${qual}</td>
        </tr>
        <tr class="participant-row">
          ${renderScores(j2_h1)}
          ${renderScores(j2_h2)}
        </tr>
      `;
    }
  }

  // DNS section (Неприбывшие участники) at the bottom
  if (dnsList.length > 0) {
    tableRowsHtml += `
      <tr class="group-row">
        <td colspan="25" class="group-header">Неприбывшие участники</td>
      </tr>
    `;

    for (const res of dnsList) {
      const dog = res.dog;
      const dogName = formatDogName(dog);
      const info = parseBreedClass(res.breed_class, dog?.breed, dog?.sex);
      const breed = escapeHtml(info.breed);
      let sex = escapeHtml(dog?.sex || (info.category === 'Кобели' ? 'Кобель' : info.category === 'Суки' ? 'Сука' : ''));
      const className = escapeHtml(info.className).replace('Стандартный-спринтеры', 'Стандартный-<br>спринтеры');

      tableRowsHtml += `
        <tr class="dns-row">
          <td></td>
          <td>${res.catalog_no}</td>
          <td>${breed}</td>
          <td>${className}</td>
          <td>${sex}</td>
          <td class="dog-name-cell">${dogName}</td>
          <td colspan="19" class="status-cell">Неявка</td>
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
    @page {
      size: A4 landscape;
      margin: 1.5mm 1.5mm 1.5mm 1.5mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      background: #ffffff;
      color: #000000;
      font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
      font-size: 11pt;
      line-height: 1.25;
    }
    table.protocol-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 1.5px;
      background-color: #ffffff;
      margin: 0;
      padding: 0;
    }
    th, td {
      border-top: 1px solid #4c4c4c;
      border-left: 1px solid #4c4c4c;
      border-right: 1px solid #b2b2b2;
      border-bottom: 1px solid #b2b2b2;
      background-color: #ffffff;
      padding: 4px 3px;
      text-align: center;
      vertical-align: middle;
      font-size: 10.5pt;
      font-weight: normal;
    }
    tr.top-title-row td {
      font-size: 14pt;
      font-weight: bold;
      padding: 7px 4px;
    }
    tr.meta-row td {
      font-size: 10.5pt;
      font-weight: normal;
      padding: 3.5px 4px;
      text-align: center;
    }
    tr.col-header td {
      font-size: 10pt;
      font-weight: normal;
      padding: 4px 1px;
      white-space: nowrap;
    }
    tr.sub-col-header td {
      font-size: 9pt;
      font-weight: normal;
      padding: 3px 0px;
      white-space: nowrap;
    }
    tr.group-row {
      page-break-inside: avoid;
      page-break-after: avoid;
    }
    td.group-header {
      background-color: #c0c0c0 !important;
      font-size: 11.5pt;
      font-weight: normal;
      text-align: center;
      padding: 4.5px 3px;
    }
    td.dog-name-cell {
      text-align: center;
      font-size: 10.5pt;
      line-height: 1.25;
      padding: 4px 4px;
    }
    td.status-cell {
      text-align: center;
      font-style: italic;
      font-size: 10pt;
      padding: 4px 3px;
    }
    tr.dns-row td {
      background-color: #c0c0c0 !important;
    }
    tr.participant-row {
      page-break-inside: avoid;
    }

    @media print {
      @page {
        size: A4 landscape;
        margin: 1.5mm 1.5mm 1.5mm 1.5mm;
      }
      html, body {
        font-size: 8.5pt;
        line-height: 1.15;
      }
      th, td {
        font-size: 8.5pt;
        padding: 2.2px 1.5px;
      }
      tr.top-title-row td {
        font-size: 11pt;
        padding: 3px;
      }
      tr.meta-row td {
        font-size: 8.5pt;
        padding: 2px 2px;
      }
      tr.col-header td {
        font-size: 8.5pt;
        padding: 2px 1px;
      }
      tr.sub-col-header td {
        font-size: 7.5pt;
        padding: 1.5px 0px;
      }
      td.group-header {
        font-size: 9.5pt;
        padding: 2.5px 2px;
      }
      td.dog-name-cell {
        font-size: 8.5pt;
        padding: 2px 3px;
      }
      td.status-cell {
        font-size: 8.5pt;
      }
    }
  </style>
</head>
<body>
  <table class="protocol-table">
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
    </colgroup>
    <tbody>
      ${tableRowsHtml}
    </tbody>
  </table>
</body>
</html>`;
}

export function buildProtocolHtml(comp: CompetitionData): string {
  const isRacing = comp.event.event_type === 'racing' || 
    (comp.event.competition_type && comp.event.competition_type.toLowerCase().includes('бег')) ||
    comp.results.some(r => r.raw_scores_json?.format === 'racing');

  if (isRacing) {
    return buildRacingProtocolHtml(comp);
  }
  return buildCoursingProtocolHtml(comp);
}

export function compilePdfWithEdge(htmlPath: string, pdfPath: string): boolean {
  const edgePaths = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
  ];
  const edgeExe = edgePaths.find(p => fs.existsSync(p));
  if (!edgeExe) {
    console.warn('Edge executable not found, skipping PDF generation.');
    return false;
  }

  try {
    const cmd = `"${edgeExe}" --headless --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf="${pdfPath}" --no-pdf-header-footer "${htmlPath}"`;
    execSync(cmd);
    return true;
  } catch (err: unknown) {
    console.error('Edge PDF compilation failed:', err instanceof Error ? err.message : String(err));
    return false;
  }
}

// CLI entrypoint
const isMain = process.argv[1] && (
  process.argv[1] === fileURLToPath(import.meta.url) ||
  process.argv[1].endsWith('export-protocol-vector.ts')
);

if (isMain) {
  const inputArg = process.argv[2];
  const outputDirArg = process.argv[3];

  if (!inputArg) {
    console.error('Usage: npx tsx backend/scripts/export/export-protocol-vector.ts <path-to-json-or-eventId> [output-dir]');
    process.exit(1);
  }

  let jsonPath = inputArg;
  if (/^\d+$/.test(inputArg)) {
    const baseDir = path.resolve('data/v1/competitions');
    let foundPath: string | null = null;
    function walk(dir: string) {
      for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, item.name);
        if (item.isDirectory()) walk(full);
        else if (item.isFile() && item.name.startsWith(inputArg + '-') && item.name.endsWith('.json')) {
          foundPath = full;
        }
      }
    }
    walk(baseDir);
    if (!foundPath) {
      console.error(`Competition with eventId ${inputArg} not found under data/v1/competitions`);
      process.exit(1);
    }
    jsonPath = foundPath;
  }

  const compData: CompetitionData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const outDir = outputDirArg ? path.resolve(outputDirArg) : path.dirname(jsonPath);

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outHtml = path.join(outDir, 'protocol_cs.html');
  const outPdf = path.join(outDir, 'protocol_cs.pdf');

  const htmlContent = buildProtocolHtml(compData);
  fs.writeFileSync(outHtml, htmlContent, 'utf8');
  console.log(`Saved HTML: ${outHtml} (${htmlContent.length} bytes)`);

  const ok = compilePdfWithEdge(outHtml, outPdf);
  if (ok && fs.existsSync(outPdf)) {
    console.log(`Saved PDF: ${outPdf} (${fs.statSync(outPdf).size} bytes)`);
  }
}
