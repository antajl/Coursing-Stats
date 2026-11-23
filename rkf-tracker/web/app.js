// CoursingStats • Web Dashboard Controller (my.coursing-stats.ru)
import { MOCK_APPLICATIONS } from './mockData.js';
import { renderKpiSummary, renderCardHtml, attachCardEvents } from './render.js';

let apps = [];
let currentFilter = 'all';
let isMockMode = true;

document.addEventListener('DOMContentLoaded', () => {
  initData();
  setupEvents();
});

function initData() {
  const token = localStorage.getItem('cs_rkf_token');
  const storedReceived = JSON.parse(localStorage.getItem('cs_received_barcodes') || '[]');
  const receivedSet = new Set(storedReceived);

  if (token) {
    isMockMode = false;
    updateModeBadge('Личный кабинет РКФ', true);
    fetchLiveData(token);
  } else {
    isMockMode = true;
    updateModeBadge('Демо-режим', false);
    apps = MOCK_APPLICATIONS.map(app => ({
      ...app,
      isReceived: receivedSet.has(app.barcode)
    }));
    render();
  }
}

function updateModeBadge(text, isLive) {
  const badge = document.getElementById('sync-time');
  const dot = document.getElementById('sync-dot');
  if (badge) badge.innerText = text;
  if (dot) dot.className = `sync-dot ${isLive ? 'live' : 'mock'}`;
}

function setupEvents() {
  // Filter pills
  document.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentFilter = pill.getAttribute('data-filter');
      filterAndSearch();
    });
  });

  // Search input
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', filterAndSearch);
  }

  // Refresh button
  const btnRefresh = document.getElementById('btn-refresh');
  if (btnRefresh) {
    btnRefresh.addEventListener('click', () => {
      const token = localStorage.getItem('cs_rkf_token');
      if (token) {
        fetchLiveData(token);
      } else {
        showToast('В демо-режиме показаны тестовые данные');
      }
    });
  }

  // Mock toggle
  const btnMock = document.getElementById('btn-toggle-mock');
  if (btnMock) {
    btnMock.addEventListener('click', () => {
      if (isMockMode) {
        openAuthModal();
      } else {
        localStorage.removeItem('cs_rkf_token');
        showToast('Включен демо-режим');
        initData();
      }
    });
  }

  // Auth modal
  const btnAuth = document.getElementById('btn-auth');
  const btnCloseModal = document.getElementById('btn-close-auth-modal');
  const btnSaveToken = document.getElementById('btn-save-token');
  const btnLogoutWeb = document.getElementById('btn-logout-web');

  if (btnAuth) btnAuth.addEventListener('click', openAuthModal);
  if (btnCloseModal) btnCloseModal.addEventListener('click', closeAuthModal);

  if (btnSaveToken) {
    btnSaveToken.addEventListener('click', () => {
      const raw = document.getElementById('token-input').value.trim();
      const token = raw.replace(/^Bearer\s+/i, '');
      if (token) {
        localStorage.setItem('cs_rkf_token', token);
        closeAuthModal();
        showToast('Токен сохранен, выполняется синхронизация...');
        initData();
      }
    });
  }

  if (btnLogoutWeb) {
    btnLogoutWeb.addEventListener('click', () => {
      localStorage.removeItem('cs_rkf_token');
      closeAuthModal();
      showToast('Токен удален, активирован демо-режим');
      initData();
    });
  }
}

async function fetchLiveData(token) {
  const syncDot = document.getElementById('sync-dot');
  const btnRefreshText = document.getElementById('btn-refresh-text');
  if (syncDot) syncDot.classList.add('syncing');
  if (btnRefreshText) btnRefreshText.innerText = 'Запрос...';

  try {
    const res = await fetch('/api/rkf/article/articles_feed?start_element=1&size=50&filter_type=6', {
      headers: { authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const feedData = await res.json();
      const storedReceived = new Set(JSON.parse(localStorage.getItem('cs_received_barcodes') || '[]'));
      const items = feedData.articles || feedData.data || [];
      apps = items.map(it => ({
        barcode: String(it.barcode || it.id || ''),
        dogName: it.dog_name || it.title || 'Борзая',
        documentName: it.document_title || it.document_name || 'Сертификат',
        pedigreeNumber: it.pedigree_number || '',
        currentStatus: it.status_name || it.status || 'В обработке',
        lastUpdated: it.updated_at || it.created_at || new Date().toISOString(),
        statusGroup: (it.status_code === 10 || (it.status_name || '').toLowerCase().includes('готов')) ? 'ready' : 'active',
        isReceived: storedReceived.has(String(it.barcode || it.id || '')),
        history: it.history || []
      }));
      render();
      showToast('Синхронизировано с РКФ!');
      updateModeBadge('Обновлено: ' + new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }), true);
    } else {
      showToast('Ошибка авторизации в РКФ (проверьте токен)');
    }
  } catch (err) {
    showToast('Сетевая ошибка при обращении к прокси');
  } finally {
    if (syncDot) syncDot.classList.remove('syncing');
    if (btnRefreshText) btnRefreshText.innerText = 'Синхронизировать';
  }
}

function handleToggleReceived(barcode) {
  const target = apps.find(a => a.barcode === barcode);
  if (!target) return;
  target.isReceived = !target.isReceived;

  const stored = new Set(JSON.parse(localStorage.getItem('cs_received_barcodes') || '[]'));
  if (target.isReceived) {
    stored.add(barcode);
  } else {
    stored.delete(barcode);
  }
  localStorage.setItem('cs_received_barcodes', JSON.stringify(Array.from(stored)));
  render();
}

function render() {
  renderKpiSummary(apps);
  const container = document.getElementById('apps-container');
  if (container) {
    container.innerHTML = apps.map(app => renderCardHtml(app)).join('');
    attachCardEvents(handleToggleReceived);
    filterAndSearch();
  }
}

function filterAndSearch() {
  const query = (document.getElementById('search-input')?.value || '').toLowerCase().trim();
  const rows = document.querySelectorAll('.app-row');

  rows.forEach(row => {
    const barcode = row.getAttribute('data-barcode');
    const app = apps.find(a => a.barcode === barcode);
    if (!app) return;

    let matchesFilter = false;
    if (currentFilter === 'all') matchesFilter = true;
    else if (currentFilter === 'active') matchesFilter = app.statusGroup === 'active';
    else if (currentFilter === 'to_pickup') matchesFilter = app.statusGroup === 'ready' && !app.isReceived;
    else if (currentFilter === 'collected') matchesFilter = app.statusGroup === 'ready' && app.isReceived;

    const matchesSearch = !query ||
      app.dogName.toLowerCase().includes(query) ||
      app.documentName.toLowerCase().includes(query) ||
      app.barcode.includes(query) ||
      (app.pedigreeNumber && app.pedigreeNumber.includes(query));

    row.style.display = (matchesFilter && matchesSearch) ? 'block' : 'none';
  });
}

function openAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) modal.style.display = 'flex';
}

function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) modal.style.display = 'none';
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.innerText = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2600);
}
