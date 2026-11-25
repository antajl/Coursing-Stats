// CoursingStats • Web Dashboard Controller (coursing-stats.ru/tracker/)
import { MOCK_APPLICATIONS } from './mockData.js';
import { renderKpiSummary, renderCardHtml, attachCardEvents } from './render.js';
import { initPwa } from './pwa.js';
import { initApprovals } from './approvals.js';
import { initTabs } from './tabs.js';
import { initAuth, openAuthModal, triggerLogout } from './auth.js';
import { initSettings } from './settings.js';
import { setupSearchPopover } from './searchPopover.js';

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
  initSettings({
    showToast,
    onLogout: () => triggerLogout(initData, showToast),
    getAccountInfo: () => ({
      token: localStorage.getItem('cs_rkf_token'),
      email: localStorage.getItem('cs_rkf_user_email')
    })
  });
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

  // Expandable Search Popover (Exact parity with ToolbarSearch.tsx)
  setupSearchPopover({
    wrapperId: 'search-wrapper-apps',
    triggerBtnId: 'btn-search-trigger-apps',
    dropdownId: 'search-dropdown-apps',
    inputId: 'search-input',
    activeTextId: 'search-active-text-apps',
    clearTriggerId: 'btn-search-clear-apps',
    clearDdId: 'btn-dd-clear-apps',
    onSearch: () => filterAndSearch()
  });

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
  const container = document.getElementById('apps-container');
  if (!container) return;

  const token = localStorage.getItem('cs_rkf_token');
  if (!token) {
    renderKpiSummary([]);
    container.innerHTML = `
      <div class="auth-required-state">
        <div class="auth-req-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span>Требуется подключение</span>
        </div>
        <h3 class="auth-req-title">Личный кабинет РКФ Онлайн не подключен</h3>
        <p class="auth-req-desc">Войдите через официальный сайт РКФ Онлайн для автоматического отслеживания статусов ваших заявок на чемпионские титулы, сертификаты и выписки.</p>
        <button type="button" class="auth-req-btn" id="btn-open-login-from-state">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
          <span>Подключить личный кабинет РКФ</span>
        </button>
      </div>
    `;
    const btn = document.getElementById('btn-open-login-from-state');
    if (btn) btn.addEventListener('click', openAuthModal);
    return;
  }

  renderKpiSummary(apps);

  if (apps.length === 0) {
    container.innerHTML = `
      <div class="auth-required-state" style="padding: 36px 20px;">
        <h4 style="margin: 0; font-size: 14px; color: var(--text-main); font-weight: 700;">Активных заявок не найдено</h4>
        <p style="margin: 6px 0 0 0; font-size: 12px; color: var(--text-soft);">В вашем личном кабинете РКФ Онлайн нет текущих заявок на титулы.</p>
      </div>
    `;
    return;
  }

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
