// CoursingStats RKF Tracker — Main Popup Orchestrator (ES Module)
import { checkAuthFromTabs, fetchAppsData } from './api.js';
import { renderApps, handleSearch } from './render.js';
import { setupSettings } from './settings.js';

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

// Init
document.addEventListener('DOMContentLoaded', async () => {
  if (window.innerWidth > 800 || new URLSearchParams(window.location.search).get('mode') === 'tab') {
    document.body.classList.add('is-tab-mode');
  }

  setupEventListeners();
  setupSettings(showToast, handleLogout, openFullscreenTab);
  setupStorageSync();
  checkAuthAndInit();
});

function setupEventListeners() {
  btnRefresh.addEventListener('click', triggerRefresh);
  btnFullscreen.addEventListener('click', openFullscreenTab);

  // Brand link with fallback
  const brandLink = document.getElementById('brand-link');
  if (brandLink) {
    brandLink.addEventListener('click', async (e) => {
      e.preventDefault();
      const targetUrl = 'https://my.coursing-stats.ru';
      const fallbackUrl = 'https://coursing-stats.ru';
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1200);
        await fetch(targetUrl, { method: 'HEAD', mode: 'no-cors', signal: controller.signal });
        clearTimeout(timeoutId);
        chrome.tabs.create({ url: targetUrl });
      } catch (_) {
        chrome.tabs.create({ url: fallbackUrl });
      }
    });
  }

  searchInput.addEventListener('input', () => handleSearch(currentFilter));

  // Filters
  document.querySelectorAll('.filter-bar .filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.filter-bar .filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentFilter = pill.getAttribute('data-filter');
      handleSearch(currentFilter);
    });
  });

  // Auth actions
  document.getElementById('btn-open-rkf').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://rkf.online' });
  });

  document.getElementById('toggle-manual-token').addEventListener('click', (e) => {
    e.preventDefault();
    const wrap = document.getElementById('manual-token-wrap');
    wrap.style.display = wrap.style.display === 'none' ? 'flex' : 'none';
  });

  document.getElementById('btn-save-manual-token').addEventListener('click', () => {
    const raw = document.getElementById('manual-token-input').value.trim();
    const token = raw.replace(/^Bearer\s+/i, '');
    if (token) {
      chrome.storage.local.set({ rkfToken: token }, () => {
        showToast('Токен сохранен!');
        checkAuthAndInit();
      });
    }
  });

  document.getElementById('btn-close-error').addEventListener('click', () => {
    errorModal.style.display = 'none';
  });
}

function openFullscreenTab() {
  chrome.tabs.create({ url: chrome.runtime.getURL('popup.html?mode=tab') });
}

function showAuthScreen() {
  document.body.classList.add('is-logged-out');
  authCard.style.display = 'block';
  authCard.classList.remove('fade-in');
  void authCard.offsetWidth;
  authCard.classList.add('fade-in');
  mainDashboard.style.display = 'none';
  statusBadge.style.display = 'none';
}

async function checkAuthAndInit() {
  const store = await chrome.storage.local.get(['rkfToken', 'profileId', 'userUuid', 'cached_apps', 'cached_time', 'rkf_last_refresh_timestamp']);
  if (store.rkfToken) {
    showDashboard(store);
  } else {
    const auto = await checkAuthFromTabs();
    if (auto) {
      showToast('Авторизация из вкладки РКФ успешна!');
      const updated = await chrome.storage.local.get(['rkfToken', 'profileId', 'userUuid', 'cached_apps', 'cached_time', 'rkf_last_refresh_timestamp']);
      showDashboard(updated);
    } else {
      showAuthScreen();
    }
  }
}

async function showDashboard(store) {
  document.body.classList.remove('is-logged-out');
  authCard.style.display = 'none';
  mainDashboard.style.display = 'block';
  mainDashboard.classList.remove('fade-in');
  void mainDashboard.offsetWidth;
  mainDashboard.classList.add('fade-in');
  statusBadge.style.display = 'inline-flex';

  const lastTime = parseInt(store.rkf_last_refresh_timestamp || '0', 10);
  const elapsed = Math.floor((Date.now() - lastTime) / 1000);
  if (elapsed < COOLDOWN_SECONDS) {
    startCooldown(COOLDOWN_SECONDS - elapsed);
  }

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
  const row = document.getElementById('row-' + barcode);
  const chk = document.getElementById('chk-' + barcode);
  chk.classList.toggle('checked', isChecked);
  row.classList.toggle('is-collected', isChecked);

  const isReady = row.getAttribute('data-is-ready') === 'true';
  row.setAttribute('data-filter-group', isChecked ? 'collected' : (isReady ? 'to_pickup' : 'active'));

  const app = currentApps.find(a => a.barcode === barcode);
  if (app) app.isReceived = isChecked;

  const { rkf_received_docs = {} } = await chrome.storage.local.get('rkf_received_docs');
  if (isChecked) rkf_received_docs[barcode] = new Date().toISOString();
  else delete rkf_received_docs[barcode];

  await chrome.storage.local.set({ rkf_received_docs, cached_apps: currentApps });
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
    if (area === 'local') {
      if (changes.rkfToken) {
        if (!changes.rkfToken.newValue) {
          currentApps = [];
          showAuthScreen();
        } else {
          checkAuthAndInit();
        }
      }
      if (changes.cached_apps && changes.cached_apps.newValue) {
        currentApps = changes.cached_apps.newValue;
        renderApps(currentApps, currentMeta, handleToggleCheck);
        handleSearch(currentFilter);
      }
    }
  });
}

function setStatusState(state) {
  statusDot.className = 'status-dot';
  if (state === 'syncing') statusDot.classList.add('syncing');
  else if (state === 'error') statusDot.classList.add('error');
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

function showToast(text) {
  toast.innerText = text;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

function showErrorModal(title, desc, hint) {
  document.getElementById('err-title').innerText = title;
  document.getElementById('err-desc').innerText = desc;
  document.getElementById('err-hint').innerText = hint;
  errorModal.style.display = 'flex';
}
