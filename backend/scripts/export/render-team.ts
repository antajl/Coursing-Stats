import {
  type Heat,
  type JudgeScore,
  type CompetitionData,
  normalizeBreed,
  normalizeSex,
  escapeHtml,
  formatDogName,
  buildEventTitle,
  buildMetaRowsHtml,
} from './protocol-shared.js';
import { getProtocolStyles } from './protocol-styles.js';

export function buildTeamCoursingProtocolHtml(comp: CompetitionData): string {
  const eventTitle = buildEventTitle(comp);

  // Group results by catalog_no (team)
  const teamMap = new Map<number, {
    catalog_no: number;
    team_name: string;
    category?: string;
    placement: number | null;
    total_score: number | null;
    dns: boolean;
    footnote?: string;
    dogs: {
      name: string;
      breed: string;
      sex: string;
      ran: boolean;
    }[];
    heats: Heat[];
  }>();

  for (const r of comp.results) {
    const teamNo = r.catalog_no;
    const cat = (r.raw_scores_json as any)?.category || r.breed_class;
    const rawTName = (r.raw_scores_json as any)?.team_name;
    const tName = rawTName || (r.breed_class && !r.breed_class.startsWith('Команда') && r.breed_class !== 'Борзые' && r.breed_class !== 'НеБорзые' ? r.breed_class : `Команда № ${teamNo}`);

    if (!teamMap.has(teamNo)) {
      const isDns = (r.status === 'dns' || r.raw_scores_json?.ran === false) && !r.total_score && !r.placement;
      teamMap.set(teamNo, {
        catalog_no: teamNo,
        team_name: tName,
        category: cat,
        placement: r.placement ?? null,
        total_score: r.total_score ?? null,
        dns: isDns,
        footnote: (r.raw_scores_json as any)?.footnote,
        dogs: [],
        heats: r.raw_scores_json?.heats || []
      });
    }

    const t = teamMap.get(teamNo)!;
    const dogName = formatDogName(r.dog);
    const breed = normalizeBreed(r.dog?.breed || '');
    const sex = normalizeSex(r.dog?.sex || '');
    const ranExplicit = (r.raw_scores_json as any)?.ran;
    const ranMembers = (r.raw_scores_json as any)?.team_members as string[] | undefined;
    const ran = typeof ranExplicit === 'boolean'
      ? ranExplicit
      : ranMembers
        ? ranMembers.some(m => {
            const mNorm = m.toLowerCase().trim();
            const dName = (r.dog?.name || '').toLowerCase().trim();
            const ru = (r.dog?.name_ru || '').toLowerCase().trim();
            const lat = (r.dog?.name_lat || '').toLowerCase().trim();
            return mNorm === dName || mNorm === ru || mNorm === lat;
          })
        : !t.dns;

    t.dogs.push({ name: dogName, breed, sex, ran });
  }

  const allTeams = [...teamMap.values()];
  const totalCols = 24;
  const metaRowsHtml = buildMetaRowsHtml(comp, totalCols);

  let tableRowsHtml = `
    <tr class="top-title-row">
      <td colspan="${totalCols}">${escapeHtml(eventTitle)}</td>
    </tr>${metaRowsHtml}
    <tr class="col-header">
      <td rowspan="2" style="width: 3.5%;">Место</td>
      <td rowspan="2" style="width: 3.0%;">№</td>
      <td rowspan="2" style="width: 27.5%;">Название команды</td>
      <td colspan="10" style="width: 30.5%;">1-й заезд</td>
      <td colspan="10" style="width: 30.5%;">2-й заезд</td>
      <td rowspan="2" style="width: 5.0%;">Общая<br>сумма</td>
    </tr>
    <tr class="col-header sub-header">
      <td>Забег</td>
      <td>Скор.</td>
      <td>Энт.</td>
      <td>Ловк.</td>
      <td>Поим.</td>
      <td>Взаим.</td>
      <td>НаПов.</td>
      <td>БезПов.</td>
      <td>Судья</td>
      <td>Сумма 1</td>
      <td>Забег</td>
      <td>Скор.</td>
      <td>Энт.</td>
      <td>Ловк.</td>
      <td>Поим.</td>
      <td>Взаим.</td>
      <td>НаПов.</td>
      <td>БезПов.</td>
      <td>Судья</td>
      <td>Сумма 2</td>
    </tr>
  `;

  // Check if multiple categories exist
  const categories = [...new Set(allTeams.map(t => t.category).filter(Boolean))] as string[];
  const hasCategories = categories.length > 1;

  const renderTeam = (t: typeof allTeams[0]) => {
    const heat1 = t.heats[0] || null;
    const heat2 = t.heats[1] || null;

    const j1_h1 = heat1?.judges?.[0] || null;
    const j2_h1 = heat1?.judges?.[1] || null;

    const j1_h2 = heat2?.judges?.[0] || null;
    const j2_h2 = heat2?.judges?.[1] || null;

    const hasDistinctTeamName = t.team_name && !t.team_name.startsWith('Команда №');
    const teamHeaderHtml = hasDistinctTeamName
      ? `<div style="font-weight: bold; font-size: 9.5pt; margin-bottom: 2px; color: #111;">${escapeHtml(t.team_name)}</div>` +
        `<div style="font-size: 7.5pt; color: #555; margin-bottom: 2px;">Состав команды:</div>`
      : '';

    const rosterHtml = teamHeaderHtml + t.dogs.map((d, i) => `
      <div class="team-dog-entry ${d.ran ? '' : 'is-reserve'}">
        <span class="dog-idx">${i + 1}.</span>
        <span class="dog-title">${d.name}</span>
        <span class="dog-specs">(${escapeHtml(d.breed)}${d.sex ? ', ' + escapeHtml(d.sex.toLowerCase()) : ''}${d.ran ? '' : ', рез.'})</span>
      </div>
    `).join('');

    const fnMarker = t.footnote ? '*' : '';

    const renderJudgeScores = (j: JudgeScore | null) => {
      if (!j || !j.scores || j.scores.length === 0) {
        return '<td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>';
      }
      return `
        <td>${j.scores[0] ?? ''}</td>
        <td>${j.scores[1] ?? ''}</td>
        <td>${j.scores[2] ?? ''}</td>
        <td>${j.scores[3] ?? ''}</td>
        <td>${j.scores[4] ?? ''}</td>
        <td>${j.scores[5] ?? ''}</td>
        <td>${j.scores[6] ?? ''}</td>
        <td style="font-weight: 500;">${j.sum ?? ''}</td>
      `;
    };

    return `
      <tr class="participant-row">
        <td rowspan="2" style="font-weight: bold; font-size: 11pt;">${t.placement ?? ''}</td>
        <td rowspan="2" style="font-weight: bold;">${t.catalog_no}</td>
        <td rowspan="2" class="team-roster-cell">${rosterHtml}</td>
        <td rowspan="2">${heat1?.bib_number ?? ''}</td>
        ${renderJudgeScores(j1_h1)}
        <td rowspan="2" style="font-weight: bold;">${heat1?.total ?? ''}</td>
        <td rowspan="2">${heat2?.bib_number ?? ''}</td>
        ${renderJudgeScores(j1_h2)}
        <td rowspan="2" style="font-weight: bold;">${heat2?.total ?? ''}</td>
        <td rowspan="2" style="font-weight: bold; font-size: 11pt;">${t.total_score ?? ''}${fnMarker}</td>
      </tr>
      <tr class="participant-row">
        ${renderJudgeScores(j2_h1)}
        ${renderJudgeScores(j2_h2)}
      </tr>
    `;
  };

  if (hasCategories) {
    for (const cat of categories) {
      const catTeams = allTeams.filter(t => t.category === cat && !t.dns).sort((a, b) => {
        const pa = a.placement ?? 999;
        const pb = b.placement ?? 999;
        if (pa !== pb) return pa - pb;
        return a.catalog_no - b.catalog_no;
      });

      tableRowsHtml += `
        <tr class="group-row">
          <td colspan="${totalCols}" class="group-header">${escapeHtml(cat)}</td>
        </tr>
      `;

      for (const t of catTeams) {
        tableRowsHtml += renderTeam(t);
      }
    }
  } else {
    const activeTeams = allTeams.filter(t => !t.dns).sort((a, b) => {
      const pa = a.placement ?? 999;
      const pb = b.placement ?? 999;
      if (pa !== pb) return pa - pb;
      return a.catalog_no - b.catalog_no;
    });

    for (const t of activeTeams) {
      tableRowsHtml += renderTeam(t);
    }
  }

  // DNS teams
  const dnsTeams = allTeams.filter(t => t.dns).sort((a, b) => a.catalog_no - b.catalog_no);
  if (dnsTeams.length > 0) {
    tableRowsHtml += `
      <tr class="group-row">
        <td colspan="${totalCols}" class="group-header">Не стартовавшие команды (DNS)</td>
      </tr>
    `;
    for (const t of dnsTeams) {
      const rosterHtml = t.dogs.map((d, i) => `
        <div class="team-dog-entry">
          <span class="dog-idx">${i + 1}.</span>
          <span class="dog-title">${d.name}</span>
          <span class="dog-specs">(${escapeHtml(d.breed)}${d.sex ? ', ' + escapeHtml(d.sex.toLowerCase()) : ''})</span>
        </div>
      `).join('');

      tableRowsHtml += `
        <tr class="participant-row dns-row">
          <td>—</td>
          <td style="font-weight: bold;">${t.catalog_no}</td>
          <td class="team-roster-cell">${rosterHtml}</td>
          <td colspan="21" class="status-cell">DNS (Не стартовали)</td>
        </tr>
      `;
    }
  }

  // Footnotes
  const footnotes = allTeams.filter(t => t.footnote).map(t => `* Команда № ${t.catalog_no}: ${escapeHtml(t.footnote)}`);
  const footnotesHtml = footnotes.length > 0 ? `
    <div style="margin-top: 6px; font-size: 8.5pt; font-style: italic; color: #333333; text-align: left;">
      ${footnotes.join('<br>')}
    </div>
  ` : '';

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(eventTitle)}</title>
  <style>
${getProtocolStyles({ discipline: 'team', resultsCount: comp.results.length })}
  </style>
</head>
<body>
  <table class="protocol-table">
    <colgroup>
      <col style="width: 3.5%;">
      <col style="width: 3.0%;">
      <col style="width: 27.5%;">
      <!-- Heat 1 -->
      <col style="width: 2.8%;">
      <col style="width: 2.7%;">
      <col style="width: 2.7%;">
      <col style="width: 2.7%;">
      <col style="width: 2.7%;">
      <col style="width: 2.7%;">
      <col style="width: 2.7%;">
      <col style="width: 2.7%;">
      <col style="width: 3.8%;">
      <col style="width: 4.2%;">
      <!-- Heat 2 -->
      <col style="width: 2.8%;">
      <col style="width: 2.7%;">
      <col style="width: 2.7%;">
      <col style="width: 2.7%;">
      <col style="width: 2.7%;">
      <col style="width: 2.7%;">
      <col style="width: 2.7%;">
      <col style="width: 2.7%;">
      <col style="width: 3.8%;">
      <col style="width: 4.2%;">
      <!-- Grand Total -->
      <col style="width: 5.0%;">
    </colgroup>
    <tbody>
      ${tableRowsHtml}
    </tbody>
  </table>
  ${footnotesHtml}
</body>
</html>`;
}
