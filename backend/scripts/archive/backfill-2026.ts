import * as cheerio from "cheerio";
import fs from "node:fs/promises";
import { fetchWin1251, sleep } from "../../lib/fetch-win1251";

const YEAR = 2026;
const BASE = "http://procoursing.ru";

/**
 * Из href вытаскиваем тип события по суффиксу файла: Coursing / BZMP / Racing.
 */
function typeFromHref(href) {
  const m = href.match(/_(Catalog|Complete_Results)_(\w+)\.(pdf|html)$/i);
  if (!m) return null;
  const raw = m[2].toLowerCase();
  if (raw === "coursing") return "coursing";
  if (raw === "bzmp") return "bzmp";
  if (raw === "racing") return "racing";
  return raw;
}

function parseDateRange(text, year) {
  const m = text.trim().match(/^(\d{1,2})(?:-(\d{1,2}))?\.(\d{2})\.(\d{4})$/);
  if (!m) return { date_start: null, date_end: null };
  const [, d1, d2, mm, yyyy] = m;
  const pad = (n) => String(n).padStart(2, "0");
  const date_start = `${yyyy}-${pad(mm)}-${pad(d1)}`;
  const date_end = d2 ? `${yyyy}-${pad(mm)}-${pad(d2)}` : null;
  return { date_start, date_end };
}

function typeFromRankLabel(rankLabel) {
  const lower = rankLabel.toLowerCase();
  if (lower.includes("курсинг")) return "coursing";
  if (lower.includes("бзмп")) return "bzmp";
  if (lower.includes("рейсинг") || lower.includes("бега")) return "racing";
  return null;
}

function extractCompetitionKind(rankLabel) {
  const competitionCodes = [
    'Чемпионат России',
    'ПЧРКФ',
    'ЧРКФ',
    'CACL',
    'CACIB',
    'CACMB',
    'CAC',
    'Кубок России',
    'Кубок'
  ];
  
  const upperLabel = rankLabel.toUpperCase();
  for (const code of competitionCodes) {
    if (upperLabel.includes(code.toUpperCase())) {
      return code;
    }
  }
  
  return null;
}

function extractCompetitionType(rankLabel) {
  const disciplines = [
    'Курсинг борзых',
    'БЗМП',
    'Бега борзых',
    'Бега за механической приманкой',
    'рейсинг',
    'курсинг'
  ];
  
  const upperLabel = rankLabel.toUpperCase();
  for (const disc of disciplines) {
    if (upperLabel.includes(disc.toUpperCase())) {
      if (disc === 'рейсинг') return 'Бега борзых';
      if (disc === 'курсинг') return 'Курсинг борзых';
      return disc;
    }
  }
  
  return null;
}

async function scrapeYear(year) {
  const url = `${BASE}/s_${year}.html`;
  const html = await fetchWin1251(url);
  const $ = cheerio.load(html);

  const events = [];
  const currentDate = new Date().toISOString().split('T')[0];

  $("table tr").each((_, row) => {
    const $row = $(row);
    const cells = $row.find("td");
    if (cells.length < 5) return;

    const dateText = $(cells[0]).text().trim();
    const { date_start, date_end } = parseDateRange(dateText, year);
    if (!date_start) return;

    // Не фильтруем будущие события - загружаем весь 2026 год

    const rankLabel = $(cells[1]).text().replace(/\s+/g, " ").trim();
    const title = $(cells[2]).text().replace(/\s+/g, " ").trim();
    const hostClub = $(cells[3]).text().replace(/\s+/g, " ").trim();
    const location = $(cells[4]).text().replace(/\s+/g, " ").trim();

    let catalogUrl = null;
    let resultsUrl = null;
    let eventType = null;

    $row.find("a").each((__, a) => {
      const href = $(a).attr("href");
      if (!href) return;
      const absolute = href.startsWith("http") ? href : `${BASE}/${href.replace(/^\//, "")}`;
      const t = typeFromHref(absolute);
      if (t) eventType = eventType || t;
      if (/_Catalog_/i.test(absolute)) catalogUrl = absolute;
      if (/_Complete_Results_/i.test(absolute)) resultsUrl = absolute;
      if (/\/results\/\d{4}-\d{2}-\d{2}\//i.test(absolute)) {
        resultsUrl = absolute;
      }
    });

    if (!eventType) {
      eventType = typeFromRankLabel(rankLabel);
      if (!eventType) {
        console.log(`  Unknown event type for: ${rankLabel}`);
      }
    }

    const competitionKind = extractCompetitionKind(rankLabel);
    const competitionType = extractCompetitionType(rankLabel);

    const confirmedText = $(cells[cells.length - 1]).text().trim();

    events.push({
      year,
      date_start,
      date_end,
      rank_label: rankLabel,
      event_type: eventType,
      competition_kind: competitionKind,
      competition_type: competitionType,
      title,
      host_club: hostClub,
      location,
      catalog_url: catalogUrl,
      results_url: resultsUrl,
      confirmed: confirmedText.includes("+") ? 1 : 0,
    });
  });

  return events;
}

async function main() {
  console.log(`Скрапинг ${YEAR} года...`);
  
  const events = await scrapeYear(YEAR);
  console.log(`Найдено событий: ${events.length}`);

  await fs.writeFile(`data/events-${YEAR}.json`, JSON.stringify(events, null, 2), "utf-8");
  console.log(`Записано в data/events-${YEAR}.json`);
  console.log("\nДалее:");
  console.log(`1. node backend/scripts/load-events.mjs data/events-${YEAR}.json`);
  console.log("2. node backend/scripts/load-results.mjs data/events-${YEAR}.json");
  console.log("3. npx wrangler d1 execute pc-db --local --file=./data/load-events.sql");
  console.log("4. npx wrangler d1 execute pc-db --local --file=./data/load-results.sql");
}

main();
