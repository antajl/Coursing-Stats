// RKF Competitions & Trials Controller (ES Module)
import { renderCompetitionsList, getCompetitionStatus } from './competitions-render.js';

let activeYear = 2026;
let currentDiscipline = 'all';
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
  const searchInput = document.getElementById('comp-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = (e.target.value || '').trim().toLowerCase();
      applyAndRender();
    });
  }

  const yearSelect = document.getElementById('comp-year-select');
  if (yearSelect) {
    yearSelect.addEventListener('change', (e) => {
      activeYear = parseInt(e.target.value, 10) || 2026;
      switchYear(activeYear);
    });
  }

  // Discipline buttons
  const discBtns = document.querySelectorAll('.comp-disc-btn');
  discBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      discBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentDiscipline = btn.getAttribute('data-disc') || 'all';
      applyAndRender();
    });
  });

  // Status filter pills
  const pills = document.querySelectorAll('.comp-filter-pill');
  pills.forEach((pill) => {
    pill.addEventListener('click', () => {
      pills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      currentFilter = pill.getAttribute('data-comp-filter') || 'all';
      applyAndRender();
    });
  });
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

async function fetchYearEvents(year) {
  if (year === 2026) {
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
  const cntAll = document.getElementById('disc-cnt-all');
  const cntCoursing = document.getElementById('disc-cnt-coursing');
  const cntRacing = document.getElementById('disc-cnt-racing');
  const cntBzmp = document.getElementById('disc-cnt-bzmp');

  const cCount = allEvents.filter((ev) => isMatchDiscipline(ev, 'Курсинг борзых')).length;
  const rCount = allEvents.filter((ev) => isMatchDiscipline(ev, 'Бега борзых')).length;
  const bCount = allEvents.filter((ev) => isMatchDiscipline(ev, 'БЗМП')).length;

  if (cntAll) cntAll.textContent = `(${allEvents.length})`;
  if (cntCoursing) cntCoursing.textContent = `(${cCount})`;
  if (cntRacing) cntRacing.textContent = `(${rCount})`;
  if (cntBzmp) cntBzmp.textContent = `(${bCount})`;
}

function updateFilterCounters() {
  const cntAll = document.getElementById('comp-cnt-all');
  const cntApproved = document.getElementById('comp-cnt-approved');
  const cntPending = document.getElementById('comp-cnt-pending');
  const cntDelayed = document.getElementById('comp-cnt-delayed');
  const cntTracked = document.getElementById('comp-cnt-tracked');

  let approved = 0;
  let pending = 0;
  let delayed = 0;
  let tracked = 0;

  for (const ev of allEvents) {
    const st = getCompetitionStatus(ev).key;
    if (st === 'approved') approved++;
    else if (st === 'delayed') delayed++;
    else pending++;

    if (trackedIds.has(String(ev.id))) tracked++;
  }

  if (cntAll) cntAll.textContent = `(${allEvents.length})`;
  if (cntApproved) cntApproved.textContent = `(${approved})`;
  if (cntPending) cntPending.textContent = `(${pending})`;
  if (cntDelayed) cntDelayed.textContent = `(${delayed})`;
  if (cntTracked) cntTracked.textContent = `(${tracked})`;
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
  if (disc === 'all') return true;
  const target = (ev.discipline || ev.sheetName || '').toLowerCase();
  if (disc === 'БЗМП') {
    return target.includes('бзмп') || target.includes('приманк');
  }
  return target.includes(disc.toLowerCase());
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

  renderCompetitionsList(container, filtered, trackedIds, handleToggleTrack);
}

async function handleToggleTrack(eventId, btn) {
  const isNowTracked = !trackedIds.has(String(eventId));
  if (isNowTracked) {
    trackedIds.add(String(eventId));
    btn.classList.add('active');
    btn.querySelector('span').textContent = 'Отслеживается';
    if (showToastCallback) showToastCallback('Мероприятие добавлено в мониторинг');
  } else {
    trackedIds.delete(String(eventId));
    btn.classList.remove('active');
    btn.querySelector('span').textContent = 'Отслеживать';
    if (showToastCallback) showToastCallback('Мероприятие удалено из мониторинга');
  }

  await chrome.storage.local.set({ tracked_competitions: Array.from(trackedIds) });
  updateFilterCounters();
  if (currentFilter === 'tracked') {
    applyAndRender();
  }
}
