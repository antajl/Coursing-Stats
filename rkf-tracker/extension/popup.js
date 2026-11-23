// CoursingStats RKF Tracker — Popup Script (Manifest V3)

const COOLDOWN_SECONDS = 60;
let currentFilter = 'all';
let isCoolingDown = false;
let cooldownTimer = null;
let currentApps = [];
let currentMeta = {};

// Elements
const authCard = document.getElementById('auth-card');
const mainDashboard = document.getElementById('main-dashboard');
const statusBadge = document.getElementById('status-badge');
const statusDot = document.getElementById('status-dot');
const lblTime = document.getElementById('lbl-time');
const btnRefresh = document.getElementById('btn-refresh');
const btnRefreshText = document.getElementById('btn-refresh-text');
const btnFullscreen = document.getElementById('btn-fullscreen');
const searchInput = document.getElementById('search-input');
const appsList = document.getElementById('apps-list');
const toast = document.getElementById('toast');
const errorModal = document.getElementById('error-modal');

// Init
document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  checkAuthAndInit();
});

function setupEventListeners() {
  btnRefresh.addEventListener('click', triggerRefresh);
  btnFullscreen.addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('popup.html') });
  });

  searchInput.addEventListener('input', handleSearch);

  // Filters
  document.querySelectorAll('.filter-bar .filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.filter-bar .filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentFilter = pill.getAttribute('data-filter');
      handleSearch();
    });
  });

  // Auth buttons
  document.getElementById('btn-open-rkf').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://rkf.online' });
  });

  document.getElementById('btn-check-auth').addEventListener('click', checkAuthFromTabs);

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

async function checkAuthAndInit() {
  const store = await chrome.storage.local.get(['rkfToken', 'profileId', 'userUuid', 'cached_apps', 'cached_time', 'rkf_last_refresh_timestamp']);
  
  if (store.rkfToken) {
    showDashboard(store);
  } else {
    // Try to auto-grab from existing rkf.online tabs
    const autoGrabbed = await checkAuthFromTabs();
    if (!autoGrabbed) {
      authCard.style.display = 'block';
      mainDashboard.style.display = 'none';
      statusBadge.style.display = 'none';
    }
  }
}

async function checkAuthFromTabs() {
  try {
    const tabs = await chrome.tabs.query({
      url: [
        'https://rkf.online/*',
        'https://*.rkf.online/*',
        '*://rkf.online/*',
        '*://*.rkf.online/*'
      ]
    });

    if (tabs && tabs.length > 0) {
      for (const tab of tabs) {
        try {
          // 1. Try direct message if content script is active
          let res = null;
          try {
            res = await chrome.tabs.sendMessage(tab.id, { type: 'GET_RKF_AUTH' });
          } catch (_) {
            // Tab was opened before extension loaded: dynamically inject content.js
            await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              files: ['content.js']
            });
            res = await chrome.tabs.sendMessage(tab.id, { type: 'GET_RKF_AUTH' });
          }

          if (res && res.apikey) {
            const cleanKey = String(res.apikey).replace(/^["']|["']$/g, '').replace(/^Bearer\s+/i, '').trim();
            await chrome.storage.local.set({
              rkfToken: cleanKey,
              profileId: res.profileId || '',
              userUuid: res.userUuid || ''
            });
            showToast('Авторизация из вкладки РКФ успешна!');
            const store = await chrome.storage.local.get(['rkfToken', 'profileId', 'userUuid', 'cached_apps', 'cached_time', 'rkf_last_refresh_timestamp']);
            showDashboard(store);
            return true;
          }
        } catch (e) {
          console.warn('Error reading auth from tab:', e);
        }
      }
    }
  } catch (err) {
    console.error('checkAuthFromTabs error:', err);
  }
  return false;
}

async function showDashboard(store) {
  authCard.style.display = 'none';
  mainDashboard.style.display = 'block';
  statusBadge.style.display = 'inline-flex';

  // Cooldown restore
  const lastTime = parseInt(store.rkf_last_refresh_timestamp || '0', 10);
  const elapsed = Math.floor((Date.now() - lastTime) / 1000);
  if (elapsed < COOLDOWN_SECONDS) {
    startCooldown(COOLDOWN_SECONDS - elapsed);
  }

  // Instant render from cache if available
  if (store.cached_apps && store.cached_apps.length > 0) {
    currentApps = store.cached_apps;
    currentMeta = { lastUpdated: store.cached_time || new Date().toISOString(), userUuid: store.userUuid };
    renderApps(currentApps, currentMeta);
  }

  // Then fetch fresh data
  fetchData(store.rkfToken, store.profileId, store.userUuid);
}

async function fetchData(token, profileId, userUuid) {
  btnRefresh.classList.add('loading');
  btnRefreshText.innerText = 'Запрос...';
  setStatusState('syncing');

  const cleanToken = String(token || '').replace(/^["']|["']$/g, '').replace(/^Bearer\s+/i, '').trim();
  const headers = {
    authorization: `Bearer ${cleanToken}`,
    accept: 'application/json'
  };

  try {
    // Check auth
    const ping = await fetch('https://rkf.online/api/article/articles_feed_counters', { headers });
    if (ping.status === 401 || ping.status === 403) {
      throw new Error('AUTH_EXPIRED');
    }

    // Parallel fetch notifications & metadata
    const [feed6, feed9, ownerDocsRes, healthDocsRes] = await Promise.all([
      fetchFeed(6, headers),
      fetchFeed(9, headers),
      fetch('https://rkf.online/api/requests/get_rkf_document_request/ownergetrkfdocumentrequest/register_of_requests', { headers }).then(r => r.json()).catch(e => { console.warn('ownerDocsRes error:', e); return {}; }),
      fetch('https://rkf.online/api/requests/dog_health_check_request/ownerdoghealthcheckrequest/register_of_requests', {
        method: 'POST', headers: { ...headers, 'content-type': 'application/json' }, body: JSON.stringify({ type_id: 1 })
      }).then(r => r.json()).catch(e => { console.warn('healthDocsRes error:', e); return {}; })
    ]);

    // Build metadata map
    const metaMap = {};
    for (const doc of (ownerDocsRes.result || [])) {
      if (doc.barcode) metaMap[doc.barcode] = { dogName: doc.dog_name, documentName: doc.document_short_name, pedigreeNumber: doc.pedigree_number, status: doc.status_name, date: doc.date_change || doc.date_create };
    }
    for (const doc of (healthDocsRes.result || [])) {
      if (doc.barcode) metaMap[doc.barcode] = { dogName: doc.dog_name, documentName: doc.type_name || 'Проверка на дисплазию', pedigreeNumber: doc.pedigree_number, status: doc.status_name, date: doc.date_change || doc.date_create };
    }

    // Process notifications (the 9 active applications)
    const allNotifications = [...feed6, ...feed9];
    const applications = {};
    const { rkf_received_docs: receivedMap = {} } = await chrome.storage.local.get('rkf_received_docs');

    for (const item of allNotifications) {
      const content = item.content || item.title || '';
      const numMatch = content.match(/№\s*(\d+)/) || (item.redirect_link && item.redirect_link.match(/barcode=(\d+)/));
      if (!numMatch) continue;
      const barcode = numMatch[1];
      const statusMatch = content.match(/присвоен статус "(.*?)"/) || content.match(/статус:?\s*"(.*?)"/);
      const status = statusMatch ? statusMatch[1] : null;

      if (!applications[barcode]) {
        const m = metaMap[barcode] || {};
        let docName = m.documentName;
        if (!docName) {
          if (content.includes('дисплази')) docName = 'Проверка на дисплазию';
          else docName = 'Оформление титула';
        }

        applications[barcode] = {
          barcode,
          dogName: m.dogName || '',
          documentName: docName,
          pedigreeNumber: m.pedigreeNumber || '',
          history: []
        };
      }

      if (status) {
        applications[barcode].history.push({ date: item.create_date, status });
      }
    }

    // Fallback: If notifications feed returned 0 applications, seed directly from register_of_requests!
    if (Object.keys(applications).length === 0 && Object.keys(metaMap).length > 0) {
      for (const [barcode, m] of Object.entries(metaMap)) {
        applications[barcode] = {
          barcode,
          dogName: m.dogName || '',
          documentName: m.documentName || 'Заявка РКФ',
          pedigreeNumber: m.pedigreeNumber || '',
          history: [
            { date: m.date || new Date().toISOString(), status: m.status || 'В обработке' }
          ]
        };
      }
    }

    // Clean and sort
    for (const app of Object.values(applications)) {
      const seen = new Set();
      const cleanHist = [];
      for (const h of app.history) {
        const key = `${h.date}_${h.status}`;
        if (!seen.has(key)) { seen.add(key); cleanHist.push(h); }
      }
      cleanHist.sort((a, b) => new Date(a.date) - new Date(b.date));
      app.history = cleanHist;
      app.currentStatus = cleanHist[cleanHist.length - 1]?.status || 'Неизвестно';
      app.lastUpdated = cleanHist[cleanHist.length - 1]?.date || new Date().toISOString();
      app.statusGroup = determineStatusGroup(app.currentStatus);
      app.isReceived = !!receivedMap[app.barcode];
    }

    const sortedApps = Object.values(applications).sort((a, b) => {
      const getWeight = (x) => {
        if (x.statusGroup === 'active') return 1;
        if (x.statusGroup === 'ready' && !x.isReceived) return 2;
        if (x.statusGroup === 'rejected') return 3;
        return 4;
      };
      const wa = getWeight(a);
      const wb = getWeight(b);
      if (wa !== wb) return wa - wb;
      return new Date(b.lastUpdated) - new Date(a.lastUpdated);
    });

    currentApps = sortedApps;
    const nowIso = new Date().toISOString();
    currentMeta = { lastUpdated: nowIso, userUuid: userUuid || '' };

    // Save cache
    chrome.storage.local.set({
      cached_apps: sortedApps,
      cached_time: nowIso
    });

    renderApps(currentApps, currentMeta);
    setStatusState('ok');

  } catch (err) {
    setStatusState('error');
    if (err.message === 'AUTH_EXPIRED') {
      showErrorModal(
        'Сессия в РКФ Онлайн истекла',
        'Авторизационный токен устарел. Доступ к аккаунту временно закрыт.',
        'Откройте rkf.online в соседней вкладке браузера и нажмите "Проверить снова".'
      );
    } else {
      showErrorModal(
        'Ошибка связи с RKF.Online',
        'Не удалось получить данные с серверов РКФ.',
        'Проверьте подключение к интернету или попробуйте через пару минут.'
      );
    }
  } finally {
    btnRefresh.classList.remove('loading');
    if (!isCoolingDown) btnRefreshText.innerText = 'Обновить';
  }
}

async function fetchFeed(filterType, headers) {
  let all = [];
  let page = 1;
  while (true) {
    try {
      const res = await fetch(`https://rkf.online/api/article/articles_feed?start_element=${page}&size=50&filter_type=${filterType}`, { headers });
      if (!res.ok) {
        console.warn(`[RKF] feed ${filterType} error: HTTP ${res.status}`);
        break;
      }
      const d = await res.json();
      const list = d.result?.articles || [];
      if (!list.length) break;
      all = all.concat(list);
      if (all.length >= (d.result?.articles_count || 0)) break;
      page += list.length;
    } catch (err) {
      console.warn(`[RKF] feed ${filterType} network error:`, err);
      break;
    }
  }
  return all;
}

function determineStatusGroup(status) {
  const s = (status || '').toLowerCase();
  if (s.includes('изготовлен') || s.includes('выдан') || s.includes('выполнен')) return 'ready';
  if (s.includes('отклон') || s.includes('отказ')) return 'rejected';
  return 'active';
}

function renderApps(apps, meta) {
  const timeStr = new Date(meta.lastUpdated).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  lblTime.innerHTML = `Обновлено: <strong>${timeStr}</strong>`;

  const activeCount = apps.filter(a => a.statusGroup === 'active').length;
  const toPickupCount = apps.filter(a => a.statusGroup === 'ready' && !a.isReceived).length;
  const collectedCount = apps.filter(a => a.statusGroup === 'ready' && a.isReceived).length;
  const rejectedCount = apps.filter(a => a.statusGroup === 'rejected').length;

  document.getElementById('cnt-all').innerText = `(${apps.length})`;
  document.getElementById('cnt-active').innerText = `(${activeCount})`;
  document.getElementById('cnt-pickup').innerText = `(${toPickupCount})`;
  document.getElementById('cnt-collected').innerText = `(${collectedCount})`;

  const rejTab = document.querySelector('.filter-pill[data-filter="rejected"]');
  if (rejTab) {
    rejTab.style.display = rejectedCount > 0 ? 'inline-flex' : 'none';
    document.getElementById('cnt-rejected').innerText = `(${rejectedCount})`;
  }

  appsList.innerHTML = apps.map(app => renderRowHtml(app, meta.userUuid)).join('');
  attachRowEvents();
  handleSearch();
}

function renderRowHtml(app, userUuid) {
  let badgeClass = 'badge-active';
  if (app.statusGroup === 'ready') badgeClass = 'badge-ready';
  if (app.statusGroup === 'rejected') badgeClass = 'badge-rejected';

  let filterGroup = app.statusGroup;
  if (app.statusGroup === 'ready') {
    filterGroup = app.isReceived ? 'collected' : 'to_pickup';
  }

  const updatedDate = new Date(app.lastUpdated).toLocaleDateString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });

  const rkfLink = userUuid
    ? `https://rkf.online/user/${userUuid}/documents/application/registry?barcode=${app.barcode}`
    : `https://rkf.online`;
  const dogDisplay = app.dogName || 'Собака не указана';
  const docTitle = app.documentName || 'Документ РКФ';

  return `
    <div class="app-row ${app.isReceived ? 'is-collected' : ''}" id="row-${app.barcode}" data-barcode="${app.barcode}" data-filter-group="${filterGroup}" data-is-ready="${app.statusGroup === 'ready'}">
      <div class="row-main">
        <!-- 1. Checkbox "Забрали" -->
        <div class="col-check">
          <div class="check-btn ${app.isReceived ? 'checked' : ''}" id="chk-${app.barcode}" data-barcode="${app.barcode}" title="Отметить: забрали из РКФ">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
        </div>

        <!-- 2. Dog info (210px) -->
        <div class="col-dog">
          <div class="dog-name" title="${dogDisplay}">${dogDisplay}</div>
          ${app.pedigreeNumber ? `<div class="dog-pedigree">№ РКФ ${app.pedigreeNumber}</div>` : ''}
        </div>

        <!-- 3. Document Title & Barcode (Fluid) -->
        <div class="col-doc">
          <div class="doc-title" title="${docTitle}">${docTitle}</div>
          <div class="doc-meta">
            <a href="${rkfLink}" target="_blank" class="barcode-link" title="Открыть в РКФ Онлайн">
              <span>№ ${app.barcode}</span>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>
            <span>• ${updatedDate}</span>
          </div>
        </div>

        <!-- 4. Status badge (160px) -->
        <div class="col-status">
          <span class="badge ${badgeClass}">${app.currentStatus}</span>
        </div>

        <!-- 5. Chevron Arrow -->
        <div class="col-chevron">
          <svg class="chevron-icon" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>

      <!-- History details -->
      <div class="timeline" id="hist-${app.barcode}" style="display: none;">
        ${app.history.map(h => {
          const d = new Date(h.date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
          return `
            <div class="t-item">
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

function attachRowEvents() {
  // Row accordion click
  document.querySelectorAll('.app-row').forEach(row => {
    row.addEventListener('click', (e) => {
      if (e.target.closest('.check-btn') || e.target.closest('.barcode-link')) return;
      const barcode = row.getAttribute('data-barcode');
      const hist = document.getElementById('hist-' + barcode);
      const isOpen = hist.style.display !== 'none';
      if (isOpen) {
        hist.style.display = 'none';
        row.classList.remove('is-open');
      } else {
        hist.style.display = 'flex';
        row.classList.add('is-open');
      }
    });
  });

  // Checkbox click
  document.querySelectorAll('.check-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const barcode = btn.getAttribute('data-barcode');
      const row = document.getElementById('row-' + barcode);
      const isChecked = !btn.classList.contains('checked');

      if (isChecked) {
        btn.classList.add('checked');
        row.classList.add('is-collected');
        row.setAttribute('data-filter-group', 'collected');
      } else {
        btn.classList.remove('checked');
        row.classList.remove('is-collected');
        const isReady = row.getAttribute('data-is-ready') === 'true';
        row.setAttribute('data-filter-group', isReady ? 'to_pickup' : 'active');
      }

      // Update app object
      const app = currentApps.find(a => a.barcode === barcode);
      if (app) app.isReceived = isChecked;

      // Save to chrome.storage
      const { rkf_received_docs = {} } = await chrome.storage.local.get('rkf_received_docs');
      if (isChecked) rkf_received_docs[barcode] = new Date().toISOString();
      else delete rkf_received_docs[barcode];
      await chrome.storage.local.set({ rkf_received_docs, cached_apps: currentApps });

      showToast(isChecked ? 'Отмечено: документ забран' : 'Отметка снята: готов к выдаче');
      handleSearch();
    });
  });

  // Barcode links
  document.querySelectorAll('.barcode-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  });
}

function handleSearch() {
  const q = (searchInput.value || '').toLowerCase().trim();
  const rows = document.querySelectorAll('.app-row');
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    const fGroup = row.getAttribute('data-filter-group');
    const matchFilter = (currentFilter === 'all') || (fGroup === currentFilter);
    const matchQuery = !q || text.includes(q);
    row.style.display = (matchFilter && matchQuery) ? 'block' : 'none';
  });
}

function setStatusState(state) {
  statusDot.className = 'status-dot';
  if (state === 'syncing') {
    statusDot.classList.add('syncing');
    statusDot.title = 'Синхронизация с сервером РКФ...';
  } else if (state === 'error') {
    statusDot.classList.add('error');
    statusDot.title = 'Ошибка доступа / нет связи с РКФ';
  } else {
    statusDot.title = 'Связь с РКФ Онлайн активна (всё в норме)';
  }
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
