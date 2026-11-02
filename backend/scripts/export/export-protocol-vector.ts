import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Shared types and formatting utilities
export {
  type DogInfo,
  type JudgeScore,
  type Heat,
  type CompetitionResult,
  type CompetitionData,
  normalizeBreed,
  parseBreedClass,
  normalizeSex,
  escapeHtml,
  formatCatalogNo,
  formatDogName,
  getJudgeString,
  isGenericJudgePlaceholder,
  buildEventTitle,
  buildMetaRowsHtml,
  getRacingRaceNumber,
  renderRacingBibCell,
  renderRacingTimeSpeed,
  getCoursingBibStyle,
  renderBibCellRowspan,
  renderBibCellSingle,
  renderScores,
} from './protocol-shared.js';

import {
  type CompetitionData,
} from './protocol-shared.js';

// Styles & Toolbar
export { TOOLBAR_CSS, getProtocolStyles } from './protocol-styles.js';
export {
  buildToolbarHtml,
  buildProtocolSeoHead,
  injectToolbar,
} from './protocol-toolbar.js';

import { injectToolbar } from './protocol-toolbar.js';

// Discipline renderers
export { buildRacingProtocolHtml } from './render-racing.js';
export { buildCoursingProtocolHtml } from './render-coursing.js';
export { buildTeamCoursingProtocolHtml } from './render-team.js';

import { buildRacingProtocolHtml } from './render-racing.js';
import { buildCoursingProtocolHtml } from './render-coursing.js';
import { buildTeamCoursingProtocolHtml } from './render-team.js';

export function buildCombinedMarathonProtocolHtml(comp: CompetitionData): string {
  const racingResults = comp.results.filter(r => r.raw_scores_json && (r.raw_scores_json.round_time !== undefined || r.raw_scores_json.format === 'racing' || (r.raw_scores_json.heats?.[0] && r.raw_scores_json.heats[0].time !== undefined)));
  const coursingResults = comp.results.filter(r => r.raw_scores_json && !r.raw_scores_json.round_time && r.raw_scores_json.format !== 'racing' && (!r.raw_scores_json.heats?.[0] || r.raw_scores_json.heats[0].time === undefined));

  const racingComp = {
    ...comp,
    event: { ...comp.event, title: `${comp.event.title} (1-й раунд: Рейсинг 480 м)` },
    results: racingResults,
  };
  const coursingComp = {
    ...comp,
    event: { ...comp.event, title: `${comp.event.title} (2-й раунд: Курсинг)` },
    results: coursingResults,
  };

  const racingHtml = buildRacingProtocolHtml(racingComp);
  const coursingHtml = buildCoursingProtocolHtml(coursingComp);

  const rBodyMatch = racingHtml.match(/<body>([\s\S]*?)<\/body>/);
  const cBodyMatch = coursingHtml.match(/<body>([\s\S]*?)<\/body>/);
  const rBody = rBodyMatch ? rBodyMatch[1] : racingHtml;
  const cBody = cBodyMatch ? cBodyMatch[1] : coursingHtml;

  const headMatch = racingHtml.match(/<head>([\s\S]*?)<\/head>/);
  const head = headMatch ? headMatch[1] : '';

  return `<!DOCTYPE html>
<html lang="ru">
<head>
${head}
</head>
<body>
${rBody}
<div style="page-break-before: always; height: 16px;"></div>
${cBody}
</body>
</html>`;
}

export function buildProtocolHtml(comp: CompetitionData): string {
  let rawHtml: string;
  const isTeamCoursing = comp.results.some(r => r.raw_scores_json?.format === 'team_coursing') ||
    (comp.event.competition_type && comp.event.competition_type.includes('Тройка'));

  if (isTeamCoursing) {
    rawHtml = buildTeamCoursingProtocolHtml(comp);
  } else {
    const hasRacing = comp.results.some(r => r.raw_scores_json && (r.raw_scores_json.round_time !== undefined || r.raw_scores_json.format === 'racing' || (r.raw_scores_json.heats?.[0] && r.raw_scores_json.heats[0].time !== undefined)));
    const hasCoursing = comp.results.some(r => r.raw_scores_json && !r.raw_scores_json.round_time && r.raw_scores_json.format !== 'racing' && r.raw_scores_json.heats?.[0]?.judges !== undefined);

    if (hasRacing && hasCoursing) {
      rawHtml = buildCombinedMarathonProtocolHtml(comp);
    } else if (hasCoursing) {
      rawHtml = buildCoursingProtocolHtml(comp);
    } else {
      const isRacing = comp.event.event_type === 'racing' || 
        hasRacing ||
        (comp.event.competition_type && (comp.event.competition_type.toLowerCase().includes('рейсинг') || comp.event.competition_type.toLowerCase().includes('круг')));

      if (isRacing) {
        rawHtml = buildRacingProtocolHtml(comp);
      } else {
        rawHtml = buildCoursingProtocolHtml(comp);
      }
    }
  }

  return injectToolbar(rawHtml, comp);
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
