import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

interface DogInfo {
  name_ru?: string;
  name_lat?: string;
  breed?: string;
  sex?: string;
}

interface JudgeScore {
  scores?: number[];
  sum?: number;
}

interface Heat {
  heat_number?: number;
  bib_number?: number;
  bib_color?: string;
  judges?: JudgeScore[];
  total?: number;
}

interface CompetitionResult {
  catalog_no: number;
  breed_class: string;
  placement?: number | null;
  total_score?: number | null;
  vc?: string | null;
  qualification?: string | null;
  status?: string;
  status_reason?: string | null;
  raw_scores_json?: {
    heats?: Heat[];
  };
  dog?: DogInfo;
}

interface CompetitionData {
  event_id: number;
  event: {
    name?: string;
    date?: string;
    location?: string;
    title?: string;
  };
  results: CompetitionResult[];
}

export function normalizeBreed(b: string): string {
  if (!b) return '';
  const s = b.trim().toLowerCase();
  if (s.includes('басенджи')) return 'Басенджи';
  if (s.includes('ирландский')) return 'Ирландский вольфхаунд';
  if (s.includes('малая') || s.includes('итальянская')) return 'Малая итальянская борзая';
  if (s.includes('родезийский') || s.includes('риджбек')) return 'Родезийский риджбек';
  if (s.includes('русская') || s.includes('псовая')) return 'Русская псовая борзая';
  if (s.includes('салюки')) return 'Салюки';
  if (s.includes('уиппет')) return 'Уиппет';
  if (s.includes('фараонова')) return 'Фараонова собака';
  if (s.includes('хортая')) return 'Хортая борзая';
  if (s.includes('чирнеко')) return 'Чирнеко дель Этна';
  return b.trim();
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

  const loc = comp.event.location ? ` (${comp.event.location.replace('район, д. Донино', 'Раменское, д. Донино')})` : '';
  const typeStr = type.toLowerCase().startsWith('по ') ? type.toLowerCase() : `по ${type.toLowerCase()}`;
  return `${kindLabel} ${typeStr}, ${dateStr}${loc}`;
}

export function buildProtocolHtml(comp: CompetitionData): string {
  const eventTitle = buildEventTitle(comp);

  // Determine groups: separate male/female vs Mix
  // A (breed, class) is Mix if both sexes are present and compete together (or if breed_class mentions Микс)
  const breedClassSexMap = new Map<string, CompetitionResult[]>();
  const dnsList: CompetitionResult[] = [];

  for (const r of comp.results) {
    if (r.status === 'dns') {
      dnsList.push(r);
      continue;
    }

    const breed = normalizeBreed(r.dog?.breed || '');
    let className = 'Стандартный';
    if (r.breed_class.includes('Ветераны')) className = 'Ветераны';
    else if (r.breed_class.includes('Стандартный-спринтеры')) className = 'Стандартный-спринтеры';

    const sex = normalizeSex(r.dog?.sex || '');
    const key = `${breed}_${className}_${sex}`;
    if (!breedClassSexMap.has(key)) {
      breedClassSexMap.set(key, []);
    }
    breedClassSexMap.get(key)!.push(r);
  }

  // Check which (breed, class) pairs share heats or have mixed placements
  const breedClassPairs = new Map<string, { males: CompetitionResult[], females: CompetitionResult[] }>();
  for (const r of comp.results) {
    if (r.status === 'dns') continue;
    const breed = normalizeBreed(r.dog?.breed || '');
    let className = 'Стандартный';
    if (r.breed_class.includes('Ветераны')) className = 'Ветераны';
    else if (r.breed_class.includes('Стандартный-спринтеры')) className = 'Стандартный-спринтеры';
    const pairKey = `${breed}_${className}`;
    if (!breedClassPairs.has(pairKey)) {
      breedClassPairs.set(pairKey, { males: [], females: [] });
    }
    const sex = normalizeSex(r.dog?.sex || '');
    if (sex === 'Кобель') {
      breedClassPairs.get(pairKey)!.males.push(r);
    } else {
      breedClassPairs.get(pairKey)!.females.push(r);
    }
  }

  const activeGroups = new Map<string, CompetitionResult[]>();

  for (const [pairKey, pair] of breedClassPairs.entries()) {
    const hasMales = pair.males.length > 0;
    const hasFemales = pair.females.length > 0;

    // Check if both males and females exist AND either:
    // 1) Any placement is duplicate (meaning separate sex rankings) OR
    // 2) Placements are unique across the union (meaning single shared mixed ranking)
    let isMix = false;
    if (hasMales && hasFemales) {
      // Check for duplicate placement numbers (like 1st male and 1st female)
      const malePlaces = new Set(pair.males.map(m => m.placement).filter(p => p != null));
      const femalePlaces = new Set(pair.females.map(f => f.placement).filter(p => p != null));
      let hasOverlap = false;
      for (const p of malePlaces) {
        if (femalePlaces.has(p)) {
          hasOverlap = true;
          break;
        }
      }
      // If there is NO overlap in placements (e.g., place 1, 2, 3, 4 are males, place 5 is female), it is a shared Mix!
      // If there IS overlap (both have place 1), they ran separate classes!
      isMix = !hasOverlap;
    }

    if (isMix) {
      activeGroups.set(`${pairKey}_Микс`, [...pair.males, ...pair.females]);
    } else {
      if (hasMales) activeGroups.set(`${pairKey}_Кобели`, pair.males);
      if (hasFemales) activeGroups.set(`${pairKey}_Суки`, pair.females);
    }
  }

  // Sort dogs inside groups by placement (or catalog_no if no placement)
  for (const dogs of activeGroups.values()) {
    dogs.sort((a, b) => {
      const pa = a.placement ?? 999;
      const pb = b.placement ?? 999;
      if (pa !== pb) return pa - pb;
      return a.catalog_no - b.catalog_no;
    });
  }

  dnsList.sort((a, b) => a.catalog_no - b.catalog_no);

  let tableRowsHtml = '';

  // Title row (Row 1 of table)
  tableRowsHtml += `
    <tr class="top-title-row">
      <td colspan="25">${escapeHtml(eventTitle)}</td>
    </tr>
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
    <tr class="sub-col-header">
      <td>Ман.</td><td>Резв.</td><td>Вын.</td><td>Прес.</td><td>Энт.</td><td>Сум.</td>
      <td>Ман.</td><td>Резв.</td><td>Вын.</td><td>Прес.</td><td>Энт.</td><td>Сум.</td>
    </tr>
  `;

  for (const [groupName, dogs] of activeGroups.entries()) {
    tableRowsHtml += `
      <tr class="group-row">
        <td colspan="25" class="group-header">${escapeHtml(groupName)}</td>
      </tr>
    `;

    for (const res of dogs) {
      const dog = res.dog;
      const dogName = formatDogName(dog);
      const breed = escapeHtml(normalizeBreed(dog?.breed || ''));
      const sex = escapeHtml(normalizeSex(dog?.sex || ''));

      let className = 'Стандартный';
      if (res.breed_class.includes('Ветераны')) className = 'Ветераны';
      else if (res.breed_class.includes('Стандартный-спринтеры')) className = 'Стандартный-<br>спринтеры';

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

      // Case 3: Only 1 heat completed, no heat 2
      if (heats.length === 1) {
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
            <td rowspan="2"></td>
            <td></td><td></td><td></td><td></td><td></td><td></td>
            <td rowspan="2"></td>
            <td rowspan="2">${totalScore}</td>
            <td rowspan="2">${vc}</td>
            <td rowspan="2">${qual}</td>
          </tr>
          <tr class="participant-row">
            ${renderScores(j2_h1)}
            <td></td><td></td><td></td><td></td><td></td><td></td>
          </tr>
        `;
        continue;
      }

      // Case 4: Standard completed 2-run participant
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
      const breed = escapeHtml(normalizeBreed(dog?.breed || ''));
      const sex = escapeHtml(normalizeSex(dog?.sex || ''));

      let className = 'Стандартный';
      if (res.breed_class.includes('Ветераны')) className = 'Ветераны';
      else if (res.breed_class.includes('Стандартный-спринтеры')) className = 'Стандартный-<br>спринтеры';

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

import { fileURLToPath } from 'node:url';

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
    // Search competitions for eventId
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

  const outHtml = path.join(outDir, 'protocol_vector.html');
  const outPdf = path.join(outDir, 'protocol_vector.pdf');

  const htmlContent = buildProtocolHtml(compData);
  fs.writeFileSync(outHtml, htmlContent, 'utf8');
  console.log(`Saved HTML: ${outHtml} (${htmlContent.length} bytes)`);

  const ok = compilePdfWithEdge(outHtml, outPdf);
  if (ok && fs.existsSync(outPdf)) {
    console.log(`Saved PDF: ${outPdf} (${fs.statSync(outPdf).size} bytes)`);
  }
}
