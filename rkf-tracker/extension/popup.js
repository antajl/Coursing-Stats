// CoursingStats RKF Tracker — Main Popup Orchestrator (ES Module)
import { checkAuthFromTabs, fetchAppsData } from './api.js';
import { renderApps, handleSearch, toggleAppReceived } from './render.js';
import { setupSettings } from './settings.js';
import { initCompetitions } from './competitions.js';

const COOLDOWN_SECONDS = 60;
let currentFilter = 'all';
let isCoolingDown = false;
let cooldownTimer = null;
let currentApps = [];
let currentMeta = {};

// DOM Elements
const authCard = document.getElementById('auth-card');
const mainDashboard = document.getElementById('main-dashboard');
const statusBadge = document.getElementById('status-badge');
const statusDot = document.getElementById('status-dot');
const btnRefresh = document.getElementById('btn-refresh');
const btnRefreshText = document.getElementById('btn-refresh-text');
const btnFullscreen = document.getElementById('btn-fullscreen');
const searchInput = document.getElementById('search-input');
const toast = document.getElementById('toast');
const errorModal = document.getElementById('error-modal');

document.addEventListener('DOMContentLoaded', async () => {
  if (window.innerWidth > 800 || new URLSearchParams(window.location.search).get('mode') === 'tab') {
    document.body.classList.add('is-tab-mode');
  }
  setupEventListeners();
  setupSettings(showToast, handleLogout, openFullscreenTab);
  setupStorageSync();
  checkAuthAndInit();
  initCompetitions(showToast);
});

function setupEventListeners() {
  btnRefresh.addEventListener('click', triggerRefresh);
  btnFullscreen.addEventListener('click', openFullscreenTab);

  // Tabs navigation with smooth animation
  const tabApps = document.getElementById('tab-btn-apps');
  const tabComps = document.getElementById('tab-btn-competitions');
  const secApps = document.getElementById('section-apps');
  const secComps = document.getElementById('section-competitions');

  const switchTab = (toComps) => {
    tabApps.classList.toggle('active', !toComps);
    tabComps.classList.toggle('active', toComps);
    secApps.classList.toggle('active', !toComps);
    secComps.classList.toggle('active', toComps);
  };
  tabApps.addEventListener('click', () => switchTab(false));
  tabComps.addEventListener('click', () => switchTab(true));

  // Web tracker and Bot buttons
  const brandLink = document.getElementById('brand-link');
  if (brandLink) brandLink.addEventListener('click', (e) => { e.preventDefault(); openWebTracker(); });

  const btnWebTracker = document.getElementById('btn-open-web-tracker');
  if (btnWebTracker) btnWebTracker.addEventListener('click', openWebTracker);

  const btnConnectTg = document.getElementById('btn-connect-telegram');
  if (btnConnectTg) btnConnectTg.addEventListener('click', () => connectTelegramBot(btnConnectTg));

  const btnOpenRkf = document.getElementById('btn-open-rkf');
  if (btnOpenRkf) btnOpenRkf.addEventListener('click', () => chrome.tabs.create({ url: 'https://rkf.online' }));

  // Apps Expandable Search
  const appsSearchWrap = document.getElementById('apps-search-wrap');
  const appsSearchBtn = document.getElementById('apps-search-btn');
  const appsSearchClear = document.getElementById('apps-search-clear');

  if (appsSearchBtn && appsSearchWrap && searchInput) {
    appsSearchBtn.addEventListener('click', () => {
      if (appsSearchWrap.classList.toggle('expanded')) searchInput.focus();
      else if (!searchInput.value.trim()) handleSearch(currentFilter);
    });
    searchInput.addEventListener('input', () => {
      if (appsSearchClear) appsSearchClear.style.display = searchInput.value ? 'inline-flex' : 'none';
      handleSearch(currentFilter);
    });
    if (appsSearchClear) {
      appsSearchClear.addEventListener('click', () => {
        searchInput.value = '';
        appsSearchClear.style.display = 'none';
        searchInput.focus();
        handleSearch(currentFilter);
      });
    }
  } else if (searchInput) {
    searchInput.addEventListener('input', () => handleSearch(currentFilter));
  }

  document.querySelectorAll('.filter-bar .filter-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.filter-bar .filter-pill').forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      currentFilter = pill.getAttribute('data-filter');
      handleSearch(currentFilter);
    });
  });

  const btnCloseError = document.getElementById('btn-close-error');
  if (btnCloseError) btnCloseError.addEventListener('click', () => { errorModal.style.display = 'none'; });
}

function openFullscreenTab() {
  chrome.tabs.create({ url: chrome.runtime.getURL('popup.html?mode=tab') });
}

function openWebTracker() {
  chrome.storage.local.get(['rkfToken']).then((store) => {
    const url = store.rkfToken
      ? `https://coursing-stats.ru/tracker?token=${encodeURIComponent(store.rkfToken)}`
      : 'https://coursing-stats.ru/tracker';
    chrome.tabs.create({ url });
  }).catch(() => chrome.tabs.create({ url: 'https://coursing-stats.ru/tracker' }));
}

async function connectTelegramBot(btn) {
  try {
    const store = await chrome.storage.local.get(['rkfToken']);
    if (!store.rkfToken) {
      showToast('Токен не найден. Войдите на rkf.online');
      return;
    }
    showToast('Открываем Telegram... Нажмите «Запустить» в боте', 3500);
    if (btn) btn.disabled = true;

    try {
      const resp = await fetch('https://coursing-stats-tracker-bot.antajltube.workers.dev/api/auth/ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apikey: store.rkfToken })
      });
      const data = await resp.json();
      if (data?.ok && data?.botUrl) {
        chrome.tabs.create({ url: data.botUrl });
        return;
      }
    } catch (_) {}

    chrome.tabs.create({ url: `https://t.me/coursing_stats_notify_bot?start=bind_${encodeURIComponent(store.rkfToken)}` });
  } catch (_) {
    showToast('Ошибка привязки Telegram');
  } finally {
    if (btn) setTimeout(() => { btn.disabled = false; }, 1500);
  }
}

function showAuthScreen() {
  document.body.classList.add('is-logged-out');
  authCard.style.display = 'block';
  mainDashboard.style.display = 'none';
  statusBadge.style.display = 'none';
}

const STORE_KEYS = ['rkfToken', 'profileId', 'userUuid', 'cached_apps', 'cached_time', 'rkf_last_refresh_timestamp'];

async function checkAuthAndInit() {
  let store = await chrome.storage.local.get(STORE_KEYS);
  if (!store.rkfToken && (await checkAuthFromTabs())) {
    showToast('Авторизация из вкладки РКФ успешна!');
    store = await chrome.storage.local.get(STORE_KEYS);
  }
  if (store.rkfToken) showDashboard(store);
  else showAuthScreen();
}

async function showDashboard(store) {
  document.body.classList.remove('is-logged-out');
  authCard.style.display = 'none';
  mainDashboard.style.display = 'flex';
  statusBadge.style.display = 'inline-flex';

  const lastTime = parseInt(store.rkf_last_refresh_timestamp || '0', 10);
  const elapsed = Math.floor((Date.now() - lastTime) / 1000);
  if (elapsed < COOLDOWN_SECONDS) startCooldown(COOLDOWN_SECONDS - elapsed);

  if (store.cached_apps && store.cached_apps.length > 0) {
    currentApps = store.cached_apps;
    currentMeta = { lastUpdated: store.cached_time || new Date().toISOString(), userUuid: store.userUuid };
    renderApps(currentApps, currentMeta, handleToggleCheck);
    handleSearch(currentFilter);
  }

  fetchData(store.rkfToken, store.profileId, store.userUuid);
}

async function fetchData(token, profileId, userUuid) {
  btnRefresh.classList.add('loading');
  btnRefreshText.innerText = 'Запрос...';
  setStatusState('syncing');

  try {
    const { rkf_received_docs: receivedMap = {} } = await chrome.storage.local.get('rkf_received_docs');
    const sortedApps = await fetchAppsData(token, profileId, userUuid, receivedMap);

    currentApps = sortedApps;
    const nowIso = new Date().toISOString();
    currentMeta = { lastUpdated: nowIso, userUuid: userUuid || '' };

    await chrome.storage.local.set({ cached_apps: sortedApps, cached_time: nowIso });
    renderApps(currentApps, currentMeta, handleToggleCheck);
    handleSearch(currentFilter);
    setStatusState('ok');
  } catch (err) {
    setStatusState('error');
    if (err.message === 'AUTH_EXPIRED') {
      showErrorModal('Сессия в РКФ Онлайн истекла', 'Авторизационный токен устарел.', 'Откройте rkf.online в браузере для автоматического обновления.');
    } else {
      showErrorModal('Ошибка связи с RKF.Online', 'Не удалось получить данные с серверов РКФ.', 'Проверьте интернет или повторите через минуту.');
    }
  } finally {
    btnRefresh.classList.remove('loading');
    if (!isCoolingDown) btnRefreshText.innerText = 'Обновить';
  }
}

async function handleToggleCheck(barcode, isChecked) {
  await toggleAppReceived(barcode, isChecked, currentApps);
  showToast(isChecked ? 'Отмечено: документ забран' : 'Отметка снята');
  handleSearch(currentFilter);
}

async function handleLogout() {
  await chrome.storage.local.remove(['rkfToken', 'profileId', 'userUuid', 'cached_apps', 'cached_time', 'rkf_last_refresh_timestamp']);
  currentApps = [];
  showAuthScreen();
}

function setupStorageSync() {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    if (changes.rkfToken) {
      if (!changes.rkfToken.newValue) { currentApps = []; showAuthScreen(); }
      else checkAuthAndInit();
    }
    if (changes.cached_apps?.newValue) {
      currentApps = changes.cached_apps.newValue;
      renderApps(currentApps, currentMeta, handleToggleCheck);
      handleSearch(currentFilter);
    }
  });
}

function setStatusState(state) {
  statusDot.className = 'status-dot' + (state === 'syncing' ? ' syncing' : state === 'error' ? ' error' : '');
}

function startCooldown(seconds) {
  isCoolingDown = true;
  btnRefresh.disabled = true;
  let left = Math.max(1, Math.round(seconds));
  if (cooldownTimer) clearInterval(cooldownTimer);
  btnRefreshText.innerText = left + ' сек...';

  cooldownTimer = setInterval(() => {
    left--;
    if (left <= 0) {
      clearInterval(cooldownTimer);
      cooldownTimer = null;
      isCoolingDown = false;
      btnRefresh.disabled = false;
      btnRefreshText.innerText = 'Обновить';
    } else {
      btnRefreshText.innerText = left + ' сек...';
    }
  }, 1000);
}

async function triggerRefresh() {
  if (isCoolingDown) return;
  const store = await chrome.storage.local.get(['rkfToken', 'profileId', 'userUuid']);
  if (!store.rkfToken) return;

  await chrome.storage.local.set({ rkf_last_refresh_timestamp: Date.now() });
  startCooldown(COOLDOWN_SECONDS);
  await fetchData(store.rkfToken, store.profileId, store.userUuid);
  showToast('Заявки успешно синхронизированы!');
}

function showToast(text, duration = 2000) {
  toast.innerText = text;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

function showErrorModal(title, desc, hint) {
  document.getElementById('err-title').innerText = title;
  document.getElementById('err-desc').innerText = desc;
  document.getElementById('err-hint').innerText = hint;
  errorModal.style.display = 'flex';
}
