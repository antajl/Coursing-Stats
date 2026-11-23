// CoursingStats • Web Dashboard (my.coursing-stats.ru) Client

const MOCK_DATA = [
  {
    barcode: "2200000498194",
    dogName: "БЕЛЬ ЭТУАЛЬ КАЙЛА",
    documentName: "ЧЕМПИОН РКФ ПО РАБОЧИМ КАЧЕСТВАМ (ЧРКФ)",
    pedigreeNumber: "7257850",
    currentStatus: "Передана в бухгалтерию",
    lastUpdated: "2026-11-23T14:20:00.000Z",
    statusGroup: "active",
    history: [
      { date: "2026-11-20T10:00:00.000Z", status: "Подана" },
      { date: "2026-11-21T11:30:00.000Z", status: "Принята к рассмотрению" },
      { date: "2026-11-23T14:20:00.000Z", status: "Передана в бухгалтерию" }
    ]
  },
  {
    barcode: "2200000496275",
    dogName: "ЭМУЛЬ ДЭ ГЕПАРД ГЕЛИЛА АЛЬ РАВДА",
    documentName: "ГРАНД ЧЕМПИОН РКФ ПО РАБОЧИМ КАЧЕСТВАМ (ГЧРКФ)",
    pedigreeNumber: "7132438",
    currentStatus: "Изготовлено",
    lastUpdated: "2026-11-20T16:45:00.000Z",
    statusGroup: "ready",
    history: [
      { date: "2026-11-15T09:12:00.000Z", status: "Подана" },
      { date: "2026-11-17T12:00:00.000Z", status: "В работе" },
      { date: "2026-11-20T16:45:00.000Z", status: "Изготовлено" }
    ]
  },
  {
    barcode: "2200000495394",
    dogName: "ЭМУЛЬ ДЭ ГЕПАРД ГЕЛИЛА АЛЬ РАВДА",
    documentName: "НАЦИОНАЛЬНЫЙ ЧЕМПИОН ПО РАБОЧИМ КАЧЕСТВАМ",
    pedigreeNumber: "7132438",
    currentStatus: "Изготовлено",
    lastUpdated: "2026-11-19T15:10:00.000Z",
    statusGroup: "ready",
    history: [
      { date: "2026-11-14T08:00:00.000Z", status: "Подана" },
      { date: "2026-11-19T15:10:00.000Z", status: "Изготовлено" }
    ]
  },
  {
    barcode: "2200000491072",
    dogName: "ЭМУЛЬ ДЭ ГЕПАРД ГЕЛИЛА АЛЬ РАВДА",
    documentName: "ЧЕМПИОН РОССИИ ПО РАБОЧИМ КАЧЕСТВАМ (ЧР)",
    pedigreeNumber: "7132438",
    currentStatus: "Изготовлено",
    lastUpdated: "2026-11-19T11:22:00.000Z",
    statusGroup: "ready",
    history: [
      { date: "2026-11-11T14:00:00.000Z", status: "Подана" },
      { date: "2026-11-19T11:22:00.000Z", status: "Изготовлено" }
    ]
  },
  {
    barcode: "2200000491085",
    dogName: "БЕЛЬ ЭТУАЛЬ КАЙЛА",
    documentName: "ВНУТРЕННИЙ РАБОЧИЙ СЕРТИФИКАТ",
    pedigreeNumber: "7257850",
    currentStatus: "Изготовлено",
    lastUpdated: "2026-11-19T09:40:00.000Z",
    statusGroup: "ready",
    history: [
      { date: "2026-11-12T10:15:00.000Z", status: "Подана" },
      { date: "2026-11-19T09:40:00.000Z", status: "Изготовлено" }
    ]
  },
  {
    barcode: "2000000032166",
    dogName: "ЭМУЛЬ ДЭ ГЕПАРД ГЕЛИЛА АЛЬ РАВДА",
    documentName: "Проверка на дисплазию",
    pedigreeNumber: "7132438",
    currentStatus: "Изготовлено",
    lastUpdated: "2026-11-11T13:00:00.000Z",
    statusGroup: "ready",
    history: [
      { date: "2026-11-05T12:00:00.000Z", status: "Подана" },
      { date: "2026-11-11T13:00:00.000Z", status: "Изготовлено" }
    ]
  }
];

let apps = [];
let currentFilter = 'all';
let isMockMode = true;

const CYNOLOGICAL_ACRONYMS = new Set([
  'РКФ', 'РК', 'ФЦИ', 'FCI', 'ЧРКФ', 'ЮЧРКФ', 'ВЧРКФ', 'ЧР', 'ЮЧР', 'ВЧР',
  'ГЧР', 'ГЧРКФ', 'ЧФ', 'ЮЧФ', 'КЧК', 'ЮКЧК', 'СС', 'ЮСС', 'CAC', 'CACIB',
  'CACL', 'RCAC', 'RCACIB', 'RCACL', 'BIS', 'JBIS', 'VBIS', 'BIG', 'BOB'
]);

const LOWERCASE_PARTICLES = new Set([
  'по', 'в', 'и', 'на', 'с', 'со', 'для', 'из', 'от', 'до', 'де', 'дэ', 'ла', 'ле', 'аль', 'эль', 'ван', 'дер', 'фон'
]);

function formatDogName(name) {
  if (!name) return '';
  return name.trim().split(/\s+/).map((word, idx) => {
    return word.split('-').map(part => {
      const clean = part.toLowerCase();
      if (idx > 0 && (clean === 'дэ' || clean === 'аль' || clean === 'де')) {
        return clean.charAt(0).toUpperCase() + clean.slice(1);
      }
      return clean.charAt(0).toUpperCase() + clean.slice(1);
    }).join('-');
  }).join(' ');
}

function formatDocTitle(title) {
  if (!title) return '';
  return title.split(/\s+/).map((word, idx) => {
    const raw = word.replace(/[(),]/g, '');
    const up = raw.toUpperCase();
    if (CYNOLOGICAL_ACRONYMS.has(up)) {
      return word.toUpperCase();
    }
    const low = raw.toLowerCase();
    if (idx > 0 && LOWERCASE_PARTICLES.has(low)) {
      return word.toLowerCase();
    }
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');
}

document.addEventListener('DOMContentLoaded', () => {
  initData();
  setupEvents();
});

function initData() {
  const savedToken = localStorage.getItem('cs_rkf_token');
  const storedReceived = JSON.parse(localStorage.getItem('cs_received_docs') || '{}');

  if (savedToken) {
    isMockMode = false;
    document.getElementById('sync-time').innerText = 'Токен сохранен';
    fetchLiveData(savedToken);
  } else {
    isMockMode = true;
    document.getElementById('sync-time').innerText = 'Демо-режим (локально)';
    apps = MOCK_DATA.map(a => ({
      ...a,
      isReceived: !!storedReceived[a.barcode]
    }));
    render();
  }
}

function setupEvents() {
  // Filters
  document.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentFilter = pill.getAttribute('data-filter');
      filterAndSearch();
    });
  });

  // Search
  document.getElementById('search-input').addEventListener('input', filterAndSearch);

  // Refresh
  document.getElementById('btn-refresh').addEventListener('click', () => {
    const token = localStorage.getItem('cs_rkf_token');
    if (token) {
      fetchLiveData(token);
    } else {
      showToast('В демо-режиме данные актуальны');
    }
  });

  // Mock toggle
  document.getElementById('btn-toggle-mock').addEventListener('click', () => {
    isMockMode = !isMockMode;
    if (isMockMode) {
      localStorage.removeItem('cs_rkf_token');
      initData();
      showToast('Включены демо-данные');
    } else {
      openAuthModal();
    }
  });

  // Auth Modal
  document.getElementById('btn-auth').addEventListener('click', openAuthModal);
  document.getElementById('btn-close-auth-modal').addEventListener('click', closeAuthModal);
  document.getElementById('btn-save-token').addEventListener('click', () => {
    const raw = document.getElementById('token-input').value.trim();
    const token = raw.replace(/^Bearer\s+/i, '');
    if (token) {
      localStorage.setItem('cs_rkf_token', token);
      closeAuthModal();
      showToast('Токен сохранен!');
      initData();
    }
  });

  document.getElementById('btn-logout-web').addEventListener('click', () => {
    localStorage.removeItem('cs_rkf_token');
    closeAuthModal();
    showToast('Токен очищен, включен демо-режим');
    initData();
  });
}

async function fetchLiveData(token) {
  const syncDot = document.getElementById('sync-dot');
  const btnRefreshText = document.getElementById('btn-refresh-text');
  syncDot.classList.add('syncing');
  btnRefreshText.innerText = 'Запрос...';

  try {
    const res = await fetch('/api/rkf/article/articles_feed?start_element=1&size=50&filter_type=6', {
      headers: { authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      showToast('Синхронизировано с РКФ!');
      document.getElementById('sync-time').innerText = 'Обновлено: ' + new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    } else {
      showToast('Ошибка авторизации в РКФ (проверьте токен)');
    }
  } catch (err) {
    showToast('Сетевая ошибка при обращении к прокси');
  } finally {
    syncDot.classList.remove('syncing');
    btnRefreshText.innerText = 'Синхронизировать';
  }
}

function render() {
  const activeCount = apps.filter(a => a.statusGroup === 'active').length;
  const toPickupCount = apps.filter(a => a.statusGroup === 'ready' && !a.isReceived).length;
  const collectedCount = apps.filter(a => a.statusGroup === 'ready' && a.isReceived).length;

  document.getElementById('cnt-all').innerText = `(${apps.length})`;
  document.getElementById('cnt-active').innerText = `(${activeCount})`;
  document.getElementById('cnt-pickup').innerText = `(${toPickupCount})`;
  document.getElementById('cnt-collected').innerText = `(${collectedCount})`;

  const container = document.getElementById('apps-container');
  container.innerHTML = apps.map(app => renderCardHtml(app)).join('');
  attachCardEvents();
  filterAndSearch();
}

function renderCardHtml(app) {
  let badgeClass = 'badge-active';
  if (app.statusGroup === 'ready') badgeClass = 'badge-ready';
  let filterGroup = app.statusGroup;
  if (app.statusGroup === 'ready') {
    filterGroup = app.isReceived ? 'collected' : 'to_pickup';
  }

  const updatedDate = new Date(app.lastUpdated).toLocaleDateString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });

  const dogDisplay = formatDogName(app.dogName) || 'Собака';
  const docTitle = formatDocTitle(app.documentName) || 'Заявка РКФ';

  return `
    <div class="app-card status-${app.statusGroup} ${app.isReceived ? 'is-collected' : ''}" id="card-${app.barcode}" data-barcode="${app.barcode}" data-filter-group="${filterGroup}">
      <div class="card-main">
        <div class="check-box ${app.isReceived ? 'checked' : ''}" data-barcode="${app.barcode}" title="Отметить: забрали из РКФ">
          <svg viewBox="0 0 24 24" fill="none" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>

        <div class="dog-col">
          <div class="dog-title" title="${dogDisplay}">${dogDisplay}</div>
          ${app.pedigreeNumber ? `<div class="dog-sub">№ РКФ ${app.pedigreeNumber}</div>` : ''}
        </div>

        <div class="doc-col">
          <div class="doc-name" title="${docTitle}">${docTitle}</div>
          <div class="doc-meta">
            <span class="doc-link">№ ${app.barcode}</span>
            <span>• ${updatedDate}</span>
          </div>
        </div>

        <div class="status-col">
          <span class="badge ${badgeClass}">${app.currentStatus}</span>
        </div>

        <div class="chevron-col">
          <svg class="chevron-icon" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>

      <div class="timeline" id="timeline-${app.barcode}" style="display: none;">
        ${app.history.map(h => {
          const d = new Date(h.date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
          return `
            <div class="timeline-step">
              <span class="t-date">${d}</span>
              <div class="t-bullet"></div>
              <span class="t-status">${h.status}</span>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function attachCardEvents() {
  document.querySelectorAll('.app-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.check-box')) return;
      const barcode = card.getAttribute('data-barcode');
      const timeline = document.getElementById('timeline-' + barcode);
      const isOpen = timeline.style.display !== 'none';
      timeline.style.display = isOpen ? 'none' : 'flex';
      card.classList.toggle('is-open', !isOpen);
    });
  });

  document.querySelectorAll('.check-box').forEach(box => {
    box.addEventListener('click', (e) => {
      e.stopPropagation();
      const barcode = box.getAttribute('data-barcode');
      const card = document.getElementById('card-' + barcode);
      const isChecked = !box.classList.contains('checked');

      box.classList.toggle('checked', isChecked);
      card.classList.toggle('is-collected', isChecked);
      card.setAttribute('data-filter-group', isChecked ? 'collected' : 'to_pickup');

      const app = apps.find(a => a.barcode === barcode);
      if (app) app.isReceived = isChecked;

      const stored = JSON.parse(localStorage.getItem('cs_received_docs') || '{}');
      if (isChecked) stored[barcode] = new Date().toISOString();
      else delete stored[barcode];
      localStorage.setItem('cs_received_docs', JSON.stringify(stored));

      showToast(isChecked ? 'Отмечено: забрали из РКФ' : 'Отметка снята');
      render();
    });
  });
}

function filterAndSearch() {
  const q = (document.getElementById('search-input').value || '').toLowerCase().trim();
  document.querySelectorAll('.app-card').forEach(card => {
    const text = card.textContent.toLowerCase();
    const fGroup = card.getAttribute('data-filter-group');
    const matchFilter = (currentFilter === 'all') || (fGroup === currentFilter);
    const matchQuery = !q || text.includes(q);
    card.style.display = (matchFilter && matchQuery) ? 'block' : 'none';
  });
}

function openAuthModal() {
  document.getElementById('token-input').value = localStorage.getItem('cs_rkf_token') || '';
  document.getElementById('auth-modal').style.display = 'flex';
}

function closeAuthModal() {
  document.getElementById('auth-modal').style.display = 'none';
}

function showToast(text) {
  const toast = document.getElementById('toast');
  toast.innerText = text;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}
