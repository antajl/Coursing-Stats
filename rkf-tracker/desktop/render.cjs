function renderHtml(apps, meta) {
  const updatedStr = new Date(meta.lastUpdated).toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'Europe/Moscow'
  });

  const activeCount = apps.filter(a => a.statusGroup === 'active').length;
  const toPickupCount = apps.filter(a => a.statusGroup === 'ready' && !a.isReceived).length;
  const collectedCount = apps.filter(a => a.statusGroup === 'ready' && a.isReceived).length;
  const rejectedCount = apps.filter(a => a.statusGroup === 'rejected').length;
  const totalCount = apps.length;

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Заявки РКФ • CoursingStats</title>
  <style>
    :root {
      --bg: #FAF8F5;
      --card-bg: #FFFFFF;
      --border: #E8E2D9;
      --border-hover: #D5CBBF;
      --text-main: #221F1F;
      --text-muted: #685E53;
      --text-soft: #8C827A;
      --camel: #C89D66;
      --camel-hover: #B28247;
      --camel-bg: #F7EEDB;
      --emerald: #047857;
      --emerald-bg: #ECFDF5;
      --emerald-border: #A7F3D0;
      --amber: #B45309;
      --amber-bg: #FFFBEB;
      --amber-border: #FDE68A;
      --rose: #BE123C;
      --rose-bg: #FFF1F2;
      --rose-border: #FECDD3;
      --shadow-sm: 0 1px 2px rgba(34, 31, 31, 0.04);
    }

    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
    body { background-color: var(--bg); color: var(--text-main); line-height: 1.4; padding: 20px 16px; }
    .container { max-width: 1080px; margin: 0 auto; }

    /* Compact Header */
    .top-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; gap: 12px; }
    .brand h1 { font-size: 18px; font-weight: 700; color: var(--text-main); letter-spacing: -0.01em; }

    /* Actions right group: Status dot + Time + Refresh Button */
    .top-actions { display: flex; align-items: center; gap: 12px; }
    .status-badge {
      display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-muted);
    }
    .status-dot {
      width: 8px; height: 8px; border-radius: 50%; background: #047857;
      box-shadow: 0 0 0 2px rgba(4, 120, 87, 0.2); transition: all 0.25s ease; flex-shrink: 0;
    }
    .status-dot.syncing {
      background: #B45309; box-shadow: 0 0 0 3px rgba(180, 83, 9, 0.25); animation: pulse 1s infinite;
    }
    .status-dot.error {
      background: #BE123C; box-shadow: 0 0 0 3px rgba(190, 18, 60, 0.25);
    }
    @keyframes pulse {
      0% { transform: scale(0.9); opacity: 0.8; }
      50% { transform: scale(1.2); opacity: 1; }
      100% { transform: scale(0.9); opacity: 0.8; }
    }

    /* Refresh Button */
    .btn-refresh {
      background: var(--text-main); color: #FAF8F5; border: 1px solid var(--text-main); padding: 6px 14px;
      font-size: 12px; font-weight: 600; border-radius: 6px; cursor: pointer;
      display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s ease;
    }
    .btn-refresh:hover:not(:disabled) { background: #3B332A; border-color: #3B332A; }
    .btn-refresh:disabled {
      background: #E8E2D9 !important; color: #8C827A !important;
      border: 1px solid #D5CBBF !important; cursor: not-allowed !important; opacity: 0.85;
      box-shadow: none !important;
    }
    .btn-refresh:disabled svg { stroke: #8C827A !important; }
    .btn-refresh.loading svg { animation: spin 0.8s linear infinite; }
    @keyframes spin { 100% { transform: rotate(360deg); } }

    /* Filter Tabs */
    .filter-bar {
      display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap; align-items: center;
    }
    .filter-pill {
      background: var(--card-bg); border: 1px solid var(--border); padding: 5px 12px;
      border-radius: 6px; font-size: 12px; font-weight: 600; color: var(--text-muted);
      cursor: pointer; transition: all 0.15s ease; display: inline-flex; align-items: center; gap: 6px;
      user-select: none;
    }
    .filter-pill:hover { border-color: var(--border-hover); color: var(--text-main); }
    .filter-pill.active { background: var(--text-main); border-color: var(--text-main); color: #FAF8F5; }
    .filter-pill .count { font-size: 11px; opacity: 0.85; }
    .filter-pill.pill-pickup.active { background: var(--emerald); border-color: var(--emerald); }
    .filter-pill.pill-active.active { background: var(--amber); border-color: var(--amber); }

    /* Search */
    .search-wrap { margin-bottom: 12px; }
    .search-input {
      width: 100%; padding: 7px 12px; border: 1px solid var(--border); border-radius: 6px;
      font-size: 13px; background: var(--card-bg); color: var(--text-main); outline: none;
      transition: border-color 0.15s;
    }
    .search-input:focus { border-color: var(--camel); }

    /* Application Rows List */
    .apps-list { display: flex; flex-direction: column; gap: 6px; }

    /* Clickable Card */
    .app-row {
      background: var(--card-bg); border: 1px solid var(--border); border-radius: 8px;
      padding: 11px 16px; box-shadow: var(--shadow-sm); cursor: pointer;
      transition: all 0.15s ease; user-select: none;
    }
    .app-row:hover {
      border-color: var(--border-hover); background: #FAF9F7; transform: translateY(-0.5px);
    }
    .app-row.is-collected { opacity: 0.6; background: #FDFCFB; }

    /* Fixed Table-like Grid: Zero horizontal jumps */
    .row-main {
      display: grid;
      grid-template-columns: 24px 250px 1fr 180px 20px;
      align-items: center;
      gap: 14px;
    }

    @media (max-width: 860px) {
      .row-main {
        grid-template-columns: 24px 1fr 20px;
        gap: 8px;
      }
      .col-doc { grid-column: 2; margin-top: 2px; }
      .col-status { grid-column: 2; justify-content: flex-start; margin-top: 4px; }
      .col-chevron { grid-column: 3; grid-row: 1 / span 3; }
    }

    /* Column 1: Checkbox */
    .col-check { display: flex; align-items: center; justify-content: center; width: 24px; }
    .check-btn {
      width: 18px; height: 18px; border: 1.5px solid #C89D66; border-radius: 4px;
      display: inline-flex; align-items: center; justify-content: center;
      cursor: pointer; background: #FFFFFF; transition: all 0.15s; flex-shrink: 0;
    }
    .check-btn.checked { background: #047857; border-color: #047857; }
    .check-btn svg { stroke: #FFFFFF; width: 12px; height: 12px; display: none; }
    .check-btn.checked svg { display: block; }

    /* Column 2: Dog Info (Strict fixed 250px) */
    .col-dog {
      width: 250px; flex-shrink: 0; display: flex; flex-direction: column; overflow: hidden;
    }
    .dog-name {
      font-size: 13px; font-weight: 700; color: var(--text-main);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .dog-pedigree { font-size: 11px; color: var(--text-soft); font-family: monospace; }

    /* Column 3: Document Title & Barcode (Fluid flex 1fr) */
    .col-doc {
      display: flex; flex-direction: column; min-width: 0; overflow: hidden;
    }
    .doc-title {
      font-size: 13px; font-weight: 600; color: var(--text-main);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .doc-meta { display: flex; align-items: center; gap: 8px; font-size: 11px; color: var(--text-muted); }
    .barcode-link {
      color: var(--text-muted); text-decoration: none; font-family: monospace;
      display: inline-flex; align-items: center; gap: 3px;
    }
    .barcode-link:hover { color: var(--camel); text-decoration: underline; }

    /* Column 4: Status Badge (Strict fixed 180px, right-aligned) */
    .col-status {
      width: 180px; flex-shrink: 0; display: flex; align-items: center; justify-content: flex-end;
    }
    .badge {
      font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 4px;
      white-space: nowrap; letter-spacing: 0.01em; border: 1px solid transparent; text-align: center;
    }
    .badge-ready { background: var(--emerald-bg); color: var(--emerald); border-color: var(--emerald-border); }
    .badge-active { background: var(--amber-bg); color: var(--amber); border-color: var(--amber-border); }
    .badge-rejected { background: var(--rose-bg); color: var(--rose); border-color: var(--rose-border); }

    /* Column 5: Chevron Arrow (Strict fixed 20px) */
    .col-chevron { width: 20px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
    .chevron-icon {
      width: 16px; height: 16px; stroke: var(--text-soft); transition: transform 0.2s ease, stroke 0.15s ease;
    }
    .app-row:hover .chevron-icon { stroke: var(--text-main); }
    .app-row.is-open .chevron-icon { transform: rotate(180deg); stroke: var(--camel); }

    /* Timeline details */
    .timeline {
      margin-top: 10px; padding-top: 10px; border-top: 1px dashed var(--border);
      display: flex; flex-direction: column; gap: 5px; cursor: default;
    }
    .t-item { display: flex; align-items: center; gap: 10px; font-size: 11.5px; }
    .t-date { color: var(--text-soft); font-family: monospace; min-width: 72px; }
    .t-bullet { width: 5px; height: 5px; border-radius: 50%; background: var(--camel); flex-shrink: 0; }
    .t-status { font-weight: 500; color: var(--text-main); }

    /* Error Notification Modal */
    .error-modal-backdrop {
      display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(34, 31, 31, 0.4); backdrop-filter: blur(2px); z-index: 2000;
      align-items: center; justify-content: center; padding: 16px;
    }
    .error-modal {
      background: #FFFFFF; border: 1px solid var(--border); border-radius: 10px;
      max-width: 480px; width: 100%; padding: 22px; box-shadow: 0 10px 25px rgba(0,0,0,0.15);
    }
    .error-modal h3 { font-size: 16px; font-weight: 700; color: var(--rose); margin-bottom: 8px; }
    .error-modal p { font-size: 13px; color: var(--text-main); line-height: 1.5; margin-bottom: 16px; }
    .error-modal .hint { font-size: 12px; color: var(--text-muted); background: var(--bg); padding: 10px 12px; border-radius: 6px; border: 1px solid var(--border); margin-bottom: 16px; }
    .error-modal .btn-close {
      background: var(--text-main); color: #FAF8F5; border: none; padding: 7px 16px;
      font-size: 12px; font-weight: 600; border-radius: 6px; cursor: pointer; float: right;
    }
    .error-modal .btn-close:hover { background: #3B332A; }

    /* Toast */
    .toast {
      position: fixed; bottom: 16px; right: 16px; background: var(--text-main); color: #FAF8F5;
      padding: 8px 14px; border-radius: 6px; font-size: 12px; font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.12); opacity: 0; transform: translateY(6px);
      transition: all 0.2s ease; pointer-events: none; z-index: 1000;
    }
    .toast.show { opacity: 1; transform: translateY(0); }
  </style>
</head>
<body>
  <div class="container">
    <!-- Top Bar -->
    <div class="top-bar">
      <div class="brand">
        <h1>Заявки РКФ</h1>
      </div>
      <!-- Right: Status indicator + Update Time + Refresh Button -->
      <div class="top-actions">
        <div class="status-badge">
          <div class="status-dot" id="status-dot" title="Связь с РКФ Онлайн активна (в норме)"></div>
          <span>Обновлено: <strong id="lbl-time">${updatedStr}</strong></span>
        </div>
        <button class="btn-refresh" id="btn-refresh" onclick="triggerRefresh()">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>
          <span id="btn-refresh-text">Обновить</span>
        </button>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="filter-bar">
      <div class="filter-pill active" onclick="setFilter('all', this)">Все <span class="count">(${totalCount})</span></div>
      <div class="filter-pill pill-active" onclick="setFilter('active', this)">В обработке <span class="count">(${activeCount})</span></div>
      <div class="filter-pill pill-pickup" onclick="setFilter('to_pickup', this)">Готовы к выдаче <span class="count">(${toPickupCount})</span></div>
      <div class="filter-pill" onclick="setFilter('collected', this)">Забрали <span class="count">(${collectedCount})</span></div>
      ${rejectedCount > 0 ? `<div class="filter-pill" onclick="setFilter('rejected', this)">Отклонено <span class="count">(${rejectedCount})</span></div>` : ''}
    </div>

    <!-- Search -->
    <div class="search-wrap">
      <input type="text" class="search-input" id="search-input" placeholder="Поиск по кличке собаки, названию титула или номеру..." oninput="handleSearch()">
    </div>

    <!-- List -->
    <div class="apps-list" id="apps-list">
      ${apps.map(app => renderAppRow(app, meta.userUuid)).join('')}
    </div>
  </div>

  <!-- Error Modal -->
  <div class="error-modal-backdrop" id="error-modal">
    <div class="error-modal">
      <h3 id="err-title">Ошибка связи с РКФ</h3>
      <p id="err-desc"></p>
      <div class="hint" id="err-hint"></div>
      <button class="btn-close" onclick="closeErrorModal()">Понятно</button>
    </div>
  </div>

  <div class="toast" id="toast"></div>

  <script>
    let currentFilter = 'all';
    let isCoolingDown = false;
    let cooldownTimer = null;
    const COOLDOWN_SECONDS = 60;

    function showToast(text) {
      const t = document.getElementById('toast');
      t.innerText = text;
      t.classList.add('show');
      setTimeout(() => t.classList.remove('show'), 2000);
    }

    function setStatusState(state) {
      const dot = document.getElementById('status-dot');
      dot.className = 'status-dot';
      if (state === 'syncing') {
        dot.classList.add('syncing');
        dot.title = 'Синхронизация с сервером РКФ...';
      } else if (state === 'error') {
        dot.classList.add('error');
        dot.title = 'Ошибка доступа / нет связи с РКФ';
      } else {
        dot.title = 'Связь с РКФ Онлайн активна (всё в норме)';
      }
    }

    function showErrorModal(title, desc, hint) {
      document.getElementById('err-title').innerText = title;
      document.getElementById('err-desc').innerText = desc;
      document.getElementById('err-hint').innerText = hint;
      document.getElementById('error-modal').style.display = 'flex';
    }

    function closeErrorModal() {
      document.getElementById('error-modal').style.display = 'none';
    }

    function setFilter(filter, el) {
      currentFilter = filter;
      document.querySelectorAll('.filter-bar .filter-pill').forEach(p => p.classList.remove('active'));
      if (el) el.classList.add('active');
      handleSearch();
    }

    function handleSearch() {
      const q = (document.getElementById('search-input').value || '').toLowerCase().trim();
      const rows = document.querySelectorAll('.app-row');
      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const fGroup = row.getAttribute('data-filter-group');
        const matchFilter = (currentFilter === 'all') || (fGroup === currentFilter);
        const matchQuery = !q || text.includes(q);
        row.style.display = (matchFilter && matchQuery) ? 'block' : 'none';
      });
    }

    function toggleHist(barcode, e) {
      if (e) {
        if (e.target.closest('.check-btn') || e.target.closest('.barcode-link')) return;
      }
      const row = document.getElementById('row-' + barcode);
      const el = document.getElementById('hist-' + barcode);
      const isOpen = el.style.display !== 'none';

      if (isOpen) {
        el.style.display = 'none';
        row.classList.remove('is-open');
      } else {
        el.style.display = 'flex';
        row.classList.add('is-open');
      }
    }

    function startCooldown(seconds) {
      isCoolingDown = true;
      const btn = document.getElementById('btn-refresh');
      const text = document.getElementById('btn-refresh-text');
      btn.disabled = true;
      let left = Math.max(1, Math.round(seconds));

      if (cooldownTimer) clearInterval(cooldownTimer);
      text.innerText = left + ' сек...';

      cooldownTimer = setInterval(() => {
        left--;
        if (left <= 0) {
          clearInterval(cooldownTimer);
          cooldownTimer = null;
          isCoolingDown = false;
          btn.disabled = false;
          text.innerText = 'Обновить';
        } else {
          text.innerText = left + ' сек...';
        }
      }, 1000);
    }

    // Check persistent cooldown on load
    window.addEventListener('DOMContentLoaded', () => {
      const last = parseInt(localStorage.getItem('rkf_last_refresh_timestamp') || '0', 10);
      const elapsed = Math.floor((Date.now() - last) / 1000);
      if (elapsed < COOLDOWN_SECONDS) {
        startCooldown(COOLDOWN_SECONDS - elapsed);
      }
    });

    async function triggerRefresh() {
      if (isCoolingDown) return;

      const btn = document.getElementById('btn-refresh');
      const text = document.getElementById('btn-refresh-text');
      btn.classList.add('loading');
      text.innerText = 'Запрос...';
      setStatusState('syncing');

      let res, data;
      try {
        res = await fetch('http://localhost:4199/api/refresh', { method: 'POST' });
        data = await res.json().catch(() => ({}));
      } catch (networkErr) {
        btn.classList.remove('loading');
        text.innerText = 'Обновить';
        setStatusState('error');
        showErrorModal(
          'Локальная служба не отвечает',
          'Фоновый процесс обновления не запущен на компьютере.',
          'Что сделать: напишите ассистенту в чате: \"Обнови заявки РКФ\" — он запустит синхронизацию напрямую.'
        );
        return;
      }

      btn.classList.remove('loading');

      if (res.ok) {
        setStatusState('ok');
        showToast('Заявки успешно обновлены!');
        localStorage.setItem('rkf_last_refresh_timestamp', Date.now().toString());
        startCooldown(COOLDOWN_SECONDS);
        setTimeout(() => window.location.reload(), 300);
      } else {
        text.innerText = 'Обновить';
        setStatusState('error');
        if (data.isAuthError || res.status === 401) {
          showErrorModal(
            'Сессия в РКФ Онлайн истекла',
            'Срок действия авторизационного токена закончился. Доступ к аккаунту РКФ временно закрыт.',
            'Что сделать: зайдите в браузер на rkf.online, скопируйте новый токен (cURL) и отправьте ассистенту в чат. Он обновит ключ за 5 секунд.'
          );
        } else {
          showErrorModal(
            'Ошибка связи с RKF.Online',
            data.error || 'Сервер РКФ вернул ошибку при получении данных.',
            'Проверьте подключение к интернету или попробуйте через пару минут.'
          );
        }
      }
    }

    async function toggleCheck(barcode, e) {
      if (e) e.stopPropagation();
      const btn = document.getElementById('chk-' + barcode);
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

      handleSearch();

      try {
        await fetch('http://localhost:4199/api/toggle-received', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ barcode, isReceived: isChecked })
        });
        showToast(isChecked ? 'Отмечено: документ забран' : 'Отметка снята: готов к выдаче');
      } catch (e) {}
    }
  </script>
</body>
</html>`;
}

function renderAppRow(app, userUuid) {
  let badgeClass = 'badge-active';
  if (app.statusGroup === 'ready') badgeClass = 'badge-ready';
  if (app.statusGroup === 'rejected') badgeClass = 'badge-rejected';

  let filterGroup = app.statusGroup;
  if (app.statusGroup === 'ready') {
    filterGroup = app.isReceived ? 'collected' : 'to_pickup';
  }

  const updatedDate = new Date(app.lastUpdated).toLocaleDateString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Europe/Moscow'
  });

  const rkfLink = `https://rkf.online/user/${userUuid}/documents/application/registry?barcode=${app.barcode}`;
  const dogDisplay = app.dogName || 'Собака не указана';
  const docTitle = app.documentName || 'Документ РКФ';

  return `
    <div class="app-row ${app.isReceived ? 'is-collected' : ''}" id="row-${app.barcode}" data-filter-group="${filterGroup}" data-is-ready="${app.statusGroup === 'ready'}" onclick="toggleHist('${app.barcode}', event)" title="Нажмите, чтобы открыть историю">
      <div class="row-main">
        <!-- 1. Checkbox "Забрали" (24px) -->
        <div class="col-check">
          <div class="check-btn ${app.isReceived ? 'checked' : ''}" id="chk-${app.barcode}" onclick="toggleCheck('${app.barcode}', event)" title="Отметить: забрали из РКФ">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
        </div>

        <!-- 2. Dog info (Fixed 250px) -->
        <div class="col-dog">
          <div class="dog-name" title="${dogDisplay}">${dogDisplay}</div>
          ${app.pedigreeNumber ? `<div class="dog-pedigree">№ РКФ ${app.pedigreeNumber}</div>` : ''}
        </div>

        <!-- 3. Document Title & Barcode (Fluid 1fr) -->
        <div class="col-doc">
          <div class="doc-title" title="${docTitle}">${docTitle}</div>
          <div class="doc-meta">
            <a href="${rkfLink}" target="_blank" class="barcode-link" onclick="event.stopPropagation()" title="Открыть в РКФ Онлайн">
              <span>№ ${app.barcode}</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>
            <span>• ${updatedDate}</span>
          </div>
        </div>

        <!-- 4. Status badge (Fixed 180px, right-aligned) -->
        <div class="col-status">
          <span class="badge ${badgeClass}">${app.currentStatus}</span>
        </div>

        <!-- 5. Chevron Arrow (Fixed 20px) -->
        <div class="col-chevron">
          <svg class="chevron-icon" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>

      <!-- History details -->
      <div class="timeline" id="hist-${app.barcode}" data-count="${app.history.length}" style="display: none;" onclick="event.stopPropagation()">
        ${app.history.map(h => {
          const d = new Date(h.date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Europe/Moscow' });
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

module.exports = { renderHtml };
