// CoursingStats • Web Dashboard Controller (my.coursing-stats.ru)
import { MOCK_APPLICATIONS } from './mockData.js';
import { renderKpiSummary, renderCardHtml, attachCardEvents } from './render.js';
import { initPwa } from './pwa.js';
import { initApprovals } from './approvals.js';
import { initTabs } from './tabs.js';
import { initAuth, openAuthModal } from './auth.js';

let apps = [];
let currentFilter = 'all';
let isMockMode = true;

document.addEventListener('DOMContentLoaded', () => {
  initData();
  setupEvents();
  initTabs();
  initApprovals();
  initPwa(showToast);
  initAuth(initData, showToast);
});

function initData() {
  const token = localStorage.getItem('cs_rkf_token');
  const tgCard = document.getElementById('tg-bridge-card');

  if (token) {
    isMockMode = false;
    updateModeBadge('Личный кабинет РКФ', true);
    if (tgCard) tgCard.style.display = 'flex';
    fetchLiveData(token);
  } else {
    isMockMode = false;
    updateModeBadge('Не подключен', false);
    if (tgCard) tgCard.style.display = 'none';
    apps = [];
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
      document.querySelectorAll('.filter-pill').forEach(p => {
        p.classList.remove('active', 'cs-glass-pill-active');
        p.classList.add('cs-glass-pill');
      });
      pill.classList.remove('cs-glass-pill');
      pill.classList.add('active', 'cs-glass-pill-active');
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
        openAuthModal();
      }
    });
  }
}

async function fetchLiveData(token) {
  const syncDot = document.getElementById('sync-dot');
  const btnRefresh = document.getElementById('btn-refresh');
  if (syncDot) syncDot.classList.add('syncing');

  try {
    const res = await fetch('/api/rkf/applications/list', {
      headers: {
        'authorization': `Bearer ${token}`
      }
    });

    if (res.ok) {
      const data = await res.json();
      const storedReceived = new Set(JSON.parse(localStorage.getItem('cs_received_barcodes') || '[]'));
      apps = (data.items || []).map(app => ({
        barcode: app.barcode,
        dogName: app.dog?.name || 'Без клички',
        pedigreeNumber: app.dog?.pedigree || '',
        documentName: app.service?.title || 'Заявка',
        currentStatus: app.status?.name || 'В обработке',
        statusGroup: app.status?.is_ready ? 'ready' : (app.status?.is_rejected ? 'rejected' : 'active'),
        lastUpdated: app.updated_at,
        history: (app.history || []).map(h => ({ date: h.created_at, status: h.name })),
        isReceived: storedReceived.has(app.barcode)
      }));
      render();
      showToast('Синхронизировано с РКФ!');
      updateModeBadge('Обновлено: ' + new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }), true);
    } else {
      showToast('Ошибка авторизации в РКФ (проверьте данные входа)');
    }
  } catch (err) {
    showToast('Сетевая ошибка при обращении к прокси');
  } finally {
    if (syncDot) syncDot.classList.remove('syncing');
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
    const headerHtml = `
      <div class="app-table-header">
        <div>Дата / Вручен</div>
        <div>Кличка / № РКФ</div>
        <div>Документ / Трек-номер</div>
        <div>Статус в РКФ</div>
        <div style="text-align: right;">Действия</div>
      </div>
    `;
    container.innerHTML = headerHtml + apps.map(app => renderCardHtml(app)).join('');
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

function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.innerText = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2600);
}
