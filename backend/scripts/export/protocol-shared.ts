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
    results_pdf_url?: string | null;
    catalog_url?: string | null;
    rules_url?: string | null;
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
  if (s.includes('тайский')) return 'Тайский риджбек';
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
  if (parts.length === 1 && breedClass && breedClass.includes('_')) {
    parts = breedClass.split('_').map(s => s.trim());
  }
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

export function formatCatalogNo(num: any): string {
  if (num == null || num === 'null' || num === '' || Number.isNaN(num)) return '';
  return String(num);
}

export function formatDogName(dog?: DogInfo): string {
  if (!dog) return '';
  const ru = (dog.name_ru || '').trim();
  const en = (dog.name_lat || '').trim();

  // Если в кличке есть слеш — разделяем, русская кличка ВСЕГДА сверху
  for (const str of [ru, en]) {
    if (str && str.includes('/')) {
      const parts = str.split('/').map(p => p.trim()).filter(Boolean);
      const ruPart = parts.find(p => /[а-яё]/i.test(p));
      const latPart = parts.find(p => /[a-z]/i.test(p));
      if (ruPart && latPart) {
        return `${escapeHtml(ruPart)} /<br>${escapeHtml(latPart)}`;
      }
      return `${escapeHtml(parts[0])} /<br>${escapeHtml(parts.slice(1).join('/'))}`;
    }
  }

  // Приоритет русской клички: русский вариант сверху
  if (ru && en && ru.toUpperCase() !== en.toUpperCase()) {
    const ruHasCyr = /[а-яё]/i.test(ru);
    const enHasCyr = /[а-яё]/i.test(en);
    if (!ruHasCyr && enHasCyr) {
      return `${escapeHtml(en)} /<br>${escapeHtml(ru)}`;
    }
    return `${escapeHtml(ru)} /<br>${escapeHtml(en)}`;
  }
  return escapeHtml(ru || en);
}

export function getJudgeString(j?: any): string {
  if (!j) return '';
  if (Array.isArray(j)) return j.join(', ');
  return String(j);
}

export function isGenericJudgePlaceholder(j?: any): boolean {
  if (!j) return true;
  const s = getJudgeString(j).trim().toLowerCase();
  if (!s) return true;
  if (s === 'главный судья/судья' || s === 'главный судья' || s === 'судья' || s === 'судьи') return true;
  return false;
}

export function buildEventTitle(comp: CompetitionData): string {
  const ev = comp.event;
  let baseTitle = (ev.full_title || ev.title || 'Соревнования').trim();

  const isValidDate = (d?: string | null): boolean =>
    Boolean(d && d !== 'null' && d !== 'undefined' && /^\d{4}-\d{2}-\d{2}$/.test(d));

  let dateStr = '';
  if (isValidDate(ev.date_start) && isValidDate(ev.date_end) && ev.date_start !== ev.date_end) {
    const s = ev.date_start!.split('-');
    const e = ev.date_end!.split('-');
    if (s[0] === e[0] && s[1] === e[1]) {
      dateStr = `${s[2]}-${e[2]}.${e[1]}.${e[0]}`;
    } else {
      dateStr = `${s[2]}.${s[1]}.${s[0]} - ${e[2]}.${e[1]}.${e[0]}`;
    }
  } else if (isValidDate(ev.date_start) || isValidDate(ev.date)) {
    const raw = isValidDate(ev.date_start) ? ev.date_start! : ev.date!;
    const d = raw.split('-');
    dateStr = `${d[2]}.${d[1]}.${d[0]}`;
  }

  let locStr = '';
  if (ev.location) {
    const cleanLoc = ev.location.trim().replace(/^\(|\)$/g, '');
    locStr = ` (${cleanLoc})`;
  }

  const hasDate = /\b\d{2}[.\-–]\d{2}[.\-–]\d{4}\b|\b\d{2}\.\d{2}\.\d{4}\b/.test(baseTitle);
  const hasLoc = /\([^)]*(?:обл|район|г\.|д\.|посад|милет|суханово|донино|левково|купавна)[^)]*\)/i.test(baseTitle);

  let finalTitle = baseTitle;
  if (!hasDate && dateStr) {
    finalTitle += `, ${dateStr}`;
  }
  if (!hasLoc && locStr) {
    finalTitle += locStr;
  }
  return finalTitle;
}

export function buildMetaRowsHtml(comp: CompetitionData, colspan: number): string {
  let html = '';
  if (comp.event.host_club) {
    html += `\r\n    <tr class="meta-row">\r\n      <td colspan="${colspan}"><b>Организатор:</b> ${escapeHtml(comp.event.host_club)}</td>\r\n    </tr>`;
  }
  if (comp.event.judges && !isGenericJudgePlaceholder(comp.event.judges)) {
    html += `\r\n    <tr class="meta-row">\r\n      <td colspan="${colspan}"><b>Судьи:</b> ${escapeHtml(getJudgeString(comp.event.judges))}</td>\r\n    </tr>`;
  }
  return html;
}

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

export function getCoursingBibStyle(heat?: Heat | null): { bg: string; color: string } {
  const bibNum = heat?.bib_number ?? heat?.heat_number;
  if (!heat || (bibNum == null && !heat.bib_color)) {
    return { bg: '#ffffff', color: '#000000' };
  }
  const rawColor = String(heat.bib_color || '').toLowerCase().trim();
  let bg = '#ffffff';
  let color = '#000000';

  if (rawColor === 'red' || rawColor === '#ff0000') {
    bg = '#ff0000';
    color = '#ffffff';
  } else if (rawColor === 'blue' || rawColor === '#00a2e8' || rawColor === '#00ccff') {
    bg = '#00a2e8';
    color = '#ffffff';
  } else if (rawColor === 'yellow' || rawColor === '#ffff00' || rawColor === '#ebe1b0' || rawColor === '#f7f6f0') {
    bg = '#f7f6f0';
    color = '#000000';
  } else if (rawColor.startsWith('#') && (rawColor.length === 7 || rawColor.length === 4)) {
    bg = rawColor;
  }
  return { bg, color };
}

export function renderBibCellRowspan(heat?: Heat | null, rowspan: number = 2): string {
  const bibNum = heat?.bib_number ?? heat?.heat_number;
  if (!heat || bibNum == null) {
    return `<td rowspan="${rowspan}"></td>`;
  }
  const { bg, color } = getCoursingBibStyle(heat);
  return `<td rowspan="${rowspan}" style="background-color: ${bg} !important; color: ${color}; font-style: italic;">${bibNum}</td>`;
}

export function renderBibCellSingle(heat?: Heat | null): string {
  const bibNum = heat?.bib_number ?? heat?.heat_number;
  if (!heat || bibNum == null) {
    return '<td></td>';
  }
  const { bg, color } = getCoursingBibStyle(heat);
  return `<td style="background-color: ${bg} !important; color: ${color}; font-style: italic;">${bibNum}</td>`;
}

export function renderScores(judge?: JudgeScore | null): string {
  if (!judge || !judge.scores || judge.scores.length < 5) {
    return '<td></td><td></td><td></td><td></td><td></td><td></td>';
  }
  const s = judge.scores;
  return `<td>${s[0]}</td><td>${s[1]}</td><td>${s[2]}</td><td>${s[3]}</td><td>${s[4]}</td><td>${judge.sum ?? ''}</td>`;
}
