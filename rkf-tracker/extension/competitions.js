// RKF Competitions & Trials Controller (ES Module)
import { renderCompetitionsList, getCompetitionStatus } from './competitions-render.js';

let activeYear = 2026;
let currentDiscipline = 'Курсинг борзых';
let currentFilter = 'all';
let searchQuery = '';
let allEvents = [];
let trackedIds = new Set();
let showToastCallback = null;

export async function initCompetitions(showToast) {
  showToastCallback = showToast;
  await loadTrackedFromStorage();
  setupDomListeners();
  await switchYear(activeYear);
}

async function loadTrackedFromStorage() {
  const data = await chrome.storage.local.get('tracked_competitions');
  const arr = Array.isArray(data.tracked_competitions) ? data.tracked_competitions : [];
  trackedIds = new Set(arr);
  updateTrackedBadge();
}

function setupDomListeners() {
  const searchWrap = document.getElementById('comp-search-wrap');
  const searchBtn = document.getElementById('comp-search-btn');
  const searchInput = document.getElementById('comp-search-input');
  const searchClear = document.getElementById('comp-search-clear');

  if (searchBtn && searchWrap && searchInput) {
    searchBtn.addEventListener('click', () => {
      const isExpanded = searchWrap.classList.toggle('expanded');
      if (isExpanded) {
        searchInput.focus();
      } else if (!searchInput.value.trim()) {
        searchQuery = '';
        applyAndRender();
      }
    });

    searchInput.addEventListener('input', (e) => {
      searchQuery = (e.target.value || '').trim().toLowerCase();
      if (searchClear) searchClear.style.display = searchQuery ? 'inline-flex' : 'none';
      applyAndRender();
    });

    if (searchClear) {
      searchClear.addEventListener('click', () => {
        searchInput.value = '';
        searchQuery = '';
        searchClear.style.display = 'none';
        searchInput.focus();
        applyAndRender();
      });
    }
  }

  const yearSelect = document.getElementById('comp-year-select');
  if (yearSelect) {
    yearSelect.addEventListener('change', (e) => {
      activeYear = parseInt(e.target.value, 10) || 2026;
      switchYear(activeYear);
    });
  }

  const discSelect = document.getElementById('comp-discipline-select');
  if (discSelect) {
    discSelect.addEventListener('change', (e) => {
      currentDiscipline = e.target.value || 'Курсинг борзых';
      updateFilterCounters();
      applyAndRender();
    });
  }

  const statusSelect = document.getElementById('comp-status-select');
  if (statusSelect) {
    statusSelect.addEventListener('change', (e) => {
      currentFilter = e.target.value || 'all';
      applyAndRender();
    });
  }
}

export async function switchYear(year) {
  activeYear = year;
  const container = document.getElementById('comp-list');
  if (container) {
    container.innerHTML = '<div class="comp-loading">Загрузка календаря соревнований...</div>';
  }

  allEvents = await fetchYearEvents(year);
  updateDisciplineCounters();
  updateFilterCounters();
  applyAndRender();
}

function isCalendarYearPayload(events, expectedYear) {
  let matching = 0;
  let other = 0;
  for (const ev of events) {
    const m = String(ev?.dateRaw || '').match(/\b(20\d{2})\b/);
    if (!m) continue;
    if (Number(m[1]) === expectedYear) matching += 1;
    else other += 1;
  }
  if (matching + other === 0) return true;
  return matching > 0 && matching >= other;
}

async function fetchYearEvents(year) {
  if (year === 2026) {
    try {
      const liveRes = await fetch('https://coursing-stats-tracker-bot.antajltube.workers.dev/api/competitions');
      if (liveRes.ok) {
        const payload = await liveRes.json();
        if (
          payload?.ok &&
          Array.isArray(payload.events) &&
          payload.events.length > 0 &&
          isCalendarYearPayload(payload.events, 2026)
        ) {
          return payload.events;
        }
      }
    } catch (e) {
      console.warn('[Competitions] Live 2026 fetch failed, falling back to bundled JSON:', e);
    }
    try {
      const url = chrome.runtime?.getURL ? chrome.runtime.getURL('rkf-competitions-2026.json') : './rkf-competitions-2026.json';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch (e) {
      console.warn('[Competitions] Local 2026 load failed:', e);
    }
  }

  const cacheKey = 'cached_calendar_' + year;
  const timeKey = 'cached_calendar_time_' + year;

  try {
    const cached = await chrome.storage.local.get([cacheKey, timeKey]);
    const cacheAge = Date.now() - (cached[timeKey] || 0);

    if (cached[cacheKey] && cacheAge < 3600000) {
      return cached[cacheKey];
    }

    const c = new AbortController();
    const tid = setTimeout(() => c.abort(), 6000);
    const res = await fetch(`https://coursing-stats.ru/data/v1/calendar/${year}.json`, { signal: c.signal });
    clearTimeout(tid);

    if (res.ok) {
      const data = await res.json();
      const events = Array.isArray(data.events) ? data.events : [];
      await chrome.storage.local.set({ [cacheKey]: events, [timeKey]: Date.now() });
      return events;
    }
    if (cached[cacheKey]) return cached[cacheKey];
  } catch (err) {
    const cached = await chrome.storage.local.get(cacheKey);
    if (cached[cacheKey]) return cached[cacheKey];
  }

  return [];
}

function updateDisciplineCounters() {
  const discSelect = document.getElementById('comp-discipline-select');
  if (!discSelect) return;

  const cCount = allEvents.filter((ev) => isMatchDiscipline(ev, 'Курсинг борзых')).length;
  const rCount = allEvents.filter((ev) => isMatchDiscipline(ev, 'Бега борзых')).length;
  const bCount = allEvents.filter((ev) => isMatchDiscipline(ev, 'БЗМП')).length;

  for (const opt of discSelect.options) {
    if (opt.value === 'Курсинг борзых') opt.textContent = `Курсинг борзых (${cCount})`;
    else if (opt.value === 'Бега борзых') opt.textContent = `Бега борзых (${rCount})`;
    else if (opt.value === 'БЗМП') opt.textContent = `БЗМП (${bCount})`;
  }
}

function updateFilterCounters() {
  const statusSelect = document.getElementById('comp-status-select');
  if (!statusSelect) return;

  const discEvents = allEvents.filter((ev) => isMatchDiscipline(ev, currentDiscipline));

  let approved = 0;
  let pending = 0;
  let delayed = 0;
  let tracked = 0;

  for (const ev of discEvents) {
    const st = getCompetitionStatus(ev).key;
    if (st === 'approved') approved++;
    else if (st === 'delayed') delayed++;
    else pending++;

    if (trackedIds.has(String(ev.id))) tracked++;
  }

  for (const opt of statusSelect.options) {
    if (opt.value === 'all') opt.textContent = `Все статусы (${discEvents.length})`;
    else if (opt.value === 'approved') opt.textContent = `Утверждено (${approved})`;
    else if (opt.value === 'pending') opt.textContent = `На согласовании (${pending})`;
    else if (opt.value === 'delayed') opt.textContent = `Задержано (${delayed})`;
    else if (opt.value === 'tracked') opt.textContent = `Отслеживаемые (${tracked})`;
  }
  updateTrackedBadge();
}

function updateTrackedBadge() {
  const badge = document.getElementById('tab-competitions-count');
  if (badge) {
    if (trackedIds.size > 0) {
      badge.textContent = String(trackedIds.size);
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
  }
}

function isMatchDiscipline(ev, disc) {
  const target = (ev.discipline || ev.sheetName || '').toLowerCase();
  if (disc === 'БЗМП') {
    return target.includes('бзмп') || target.includes('приманк');
  }
  return target.includes(disc.toLowerCase());
}

function getEventDateSortKey(ev) {
  if (ev.date_start) return ev.date_start;
  const raw = ev.dateRaw || '';
  // Match "DD.MM.YYYY" or "DD-DD.MM.YYYY"
  const m = raw.match(/(\d{2})\.(\d{2})\.(\d{4})/);
  if (m) {
    return `${m[3]}-${m[2]}-${m[1]}`;
  }
  return '1970-01-01';
}

function applyAndRender() {
  const container = document.getElementById('comp-list');
  if (!container) return;

  const filtered = allEvents.filter((ev) => {
    if (!isMatchDiscipline(ev, currentDiscipline)) return false;

    const statusKey = getCompetitionStatus(ev).key;
    const isTracked = trackedIds.has(String(ev.id));

    if (currentFilter === 'approved' && statusKey !== 'approved') return false;
    if (currentFilter === 'pending' && statusKey !== 'pending') return false;
    if (currentFilter === 'delayed' && statusKey !== 'delayed') return false;
    if (currentFilter === 'tracked' && !isTracked) return false;

    if (searchQuery) {
      const haystack = [
        ev.title,
        ev.rank,
        ev.discipline,
        ev.location,
        ev.club,
        ev.reglament,
        ev.summary,
        ev.judges,
        ev.notes
      ].filter(Boolean).join(' ').toLowerCase();

      if (!haystack.includes(searchQuery)) return false;
    }

    return true;
  });

  // Sort descending: from latest to earliest (от самых поздних к ранним)
  filtered.sort((a, b) => {
    const dateA = getEventDateSortKey(a);
    const dateB = getEventDateSortKey(b);
    return dateB.localeCompare(dateA);
  });

  renderCompetitionsList(container, filtered, trackedIds, handleToggleTrack);
}

async function handleToggleTrack(eventId, btn) {
  const isNowTracked = !trackedIds.has(String(eventId));
  if (isNowTracked) {
    trackedIds.add(String(eventId));
    btn.classList.add('active');
    btn.title = 'Отслеживается (нажмите для отмены)';
    if (showToastCallback) showToastCallback('Мероприятие добавлено в мониторинг');
  } else {
    trackedIds.delete(String(eventId));
    btn.classList.remove('active');
    btn.title = 'Отслеживать состязание';
    if (showToastCallback) showToastCallback('Мероприятие удалено из мониторинга');
  }

  await chrome.storage.local.set({ tracked_competitions: Array.from(trackedIds) });
  updateFilterCounters();
  if (currentFilter === 'tracked') {
    applyAndRender();
  }
}
