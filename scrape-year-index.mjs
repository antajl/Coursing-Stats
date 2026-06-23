import * as cheerio from "cheerio";
import fs from "node:fs/promises";
import { fetchWin1251, sleep } from "./lib/fetch-win1251.mjs";

const YEARS = Array.from({ length: 2026 - 2015 + 1 }, (_, i) => 2015 + i); // 2015..2026
const BASE = "http://procoursing.ru";

/**
 * Из href вытаскиваем тип события по суффиксу файла: Coursing / BZMP / Racing.
 * Это надёжнее, чем парсить русский текст в ячейке (там бывают вложенные
 * списки нескольких классов в одной строке).
 */
function typeFromHref(href) {
  const m = href.match(/_(Catalog|Complete_Results)_(\w+)\.(pdf|html)$/i);
  if (!m) return null;
  const raw = m[2].toLowerCase();
  if (raw === "coursing") return "coursing";
  if (raw === "bzmp") return "bzmp";
  if (raw === "racing") return "racing";
  return raw; // на случай неизвестного типа — не теряем данные, разберёмся вручную
}

function parseDateRange(text, year) {
  // форматы: "12.04.2026" или "18-19.04.2026"
  const m = text.trim().match(/^(\d{1,2})(?:-(\d{1,2}))?\.(\d{2})\.(\d{4})$/);
  if (!m) return { date_start: null, date_end: null };
  const [, d1, d2, mm, yyyy] = m;
  const pad = (n) => String(n).padStart(2, "0");
  const date_start = `${yyyy}-${pad(mm)}-${pad(d1)}`;
  const date_end = d2 ? `${yyyy}-${pad(mm)}-${pad(d2)}` : null;
  return { date_start, date_end };
}

/**
 * Разбирает одну страницу года в список "сырых" событий.
 * ВАЖНО: я не видел реальной DOM-структуры таблицы (только markdown-конвертацию
 * с побитой кодировкой), поэтому селектор ниже — лучшая догадка по структуре
 * "таблица с <tr>/<td>, в одной из последних колонок ссылки на каталог/результаты".
 * Перед боевым прогоном — проверь на реальном HTML (см. README, шаг 1).
 */
async function scrapeYear(year) {
  const url = `${BASE}/s_${year}.html`;
  const html = await fetchWin1251(url);
  const $ = cheerio.load(html);

  const events = [];

  $("table tr").each((_, row) => {
    const $row = $(row);
    const cells = $row.find("td");
    if (cells.length < 5) return; // похоже на заголовок таблицы — пропускаем

    const dateText = $(cells[0]).text().trim();
    const { date_start, date_end } = parseDateRange(dateText, year);
    if (!date_start) return; // строка без даты — не событие (например, шапка)

    const rankLabel = $(cells[1]).text().replace(/\s+/g, " ").trim();
    const title = $(cells[2]).text().replace(/\s+/g, " ").trim();
    const hostClub = $(cells[3]).text().replace(/\s+/g, " ").trim();
    const location = $(cells[4]).text().replace(/\s+/g, " ").trim();

    // ссылки могут быть в последних 2-3 ячейках — ищем по всей строке
    let catalogUrl = null;
    let resultsUrl = null;
    let eventType = null;

    $row.find("a").each((__, a) => {
      const href = $(a).attr("href");
      if (!href) return;
      const absolute = href.startsWith("http") ? href : `${BASE}/${href.replace(/^\//, "")}`;
      const t = typeFromHref(absolute);
      if (!t) return;
      eventType = eventType || t;
      if (/_Catalog_/i.test(absolute)) catalogUrl = absolute;
      if (/_Complete_Results_/i.test(absolute)) resultsUrl = absolute;
    });

    const confirmedText = $(cells[cells.length - 1]).text().trim();

    events.push({
      year,
      date_start,
      date_end,
      rank_label: rankLabel,
      event_type: eventType, // может быть null, если в строке нет ссылок (событие без результатов пока)
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
  const all = [];
  for (const year of YEARS) {
    console.log(`Скрапим ${year}...`);
    try {
      const events = await scrapeYear(year);
      console.log(`  найдено строк: ${events.length}`);
      all.push(...events);
    } catch (err) {
      console.error(`  ОШИБКА на ${year}:`, err.message);
    }
    await sleep(1500); // вежливая пауза между годами
  }

  await fs.writeFile("events.json", JSON.stringify(all, null, 2), "utf-8");
  console.log(`Готово. Всего событий: ${all.length}. Записано в events.json`);
}

main();
