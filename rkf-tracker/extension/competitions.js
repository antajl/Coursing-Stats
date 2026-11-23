// RKF Competitions & Trials Controller (ES Module)
import { renderCompetitionsList } from './competitions-render.js';

const CDN_BASE_URL = 'https://coursing-stats.ru/data/v1/calendar';
let activeYear = 2027;
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
      activeYear = parseInt(e.target.value, 10) || 2027;
      switchYear(activeYear);
    });
  }

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
  updateFilterCounters();
  applyAndRender();
}

async function fetchYearEvents(year) {
  const cacheKey = 'cached_calendar_' + year;
  const timeKey = 'cached_calendar_time_' + year;

  try {
    const cached = await chrome.storage.local.get([cacheKey, timeKey]);
    const cacheAge = Date.now() - (cached[timeKey] || 0);

    if (cached[cacheKey] && cacheAge < 3600000) {
      return cached[cacheKey];
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(`${CDN_BASE_URL}/${year}.json`, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const events = Array.isArray(data.events) ? data.events : [];
      await chrome.storage.local.set({
        [cacheKey]: events,
        [timeKey]: Date.now()
      });
      return events;
    }
    if (cached[cacheKey]) return cached[cacheKey];
  } catch (err) {
    console.warn('[Competitions] Fetch error, checking cache:', err);
    const cached = await chrome.storage.local.get(cacheKey);
    if (cached[cacheKey]) return cached[cacheKey];
  }

  return [];
}

function updateFilterCounters() {
  const cntAll = document.getElementById('comp-cnt-all');
  const cntApproved = document.getElementById('comp-cnt-approved');
  const cntPending = document.getElementById('comp-cnt-pending');
  const cntTracked = document.getElementById('comp-cnt-tracked');

  const approvedCount = allEvents.filter((ev) => ev.confirmed === 1).length;
  const pendingCount = allEvents.filter((ev) => ev.confirmed !== 1).length;
  const trackedCount = allEvents.filter((ev) => trackedIds.has(String(ev.id))).length;

  if (cntAll) cntAll.textContent = `(${allEvents.length})`;
  if (cntApproved) cntApproved.textContent = `(${approvedCount})`;
  if (cntPending) cntPending.textContent = `(${pendingCount})`;
  if (cntTracked) cntTracked.textContent = `(${trackedCount})`;
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

function applyAndRender() {
  const container = document.getElementById('comp-list');
  if (!container) return;

  const filtered = allEvents.filter((ev) => {
    const isApproved = ev.confirmed === 1;
    const isTracked = trackedIds.has(String(ev.id));

    if (currentFilter === 'approved' && !isApproved) return false;
    if (currentFilter === 'pending' && isApproved) return false;
    if (currentFilter === 'tracked' && !isTracked) return false;

    if (searchQuery) {
      const haystack = [
        ev.title,
        ev.full_title,
        ev.region,
        ev.location,
        ev.host_club,
        ev.competition_kind,
        ev.competition_type,
        ev.rank_label,
        ev.judges
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
