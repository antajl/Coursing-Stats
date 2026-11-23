// DOM Renderer for Applications and Cards (ES Module)
import { formatDogName, formatDocTitle } from './formatters.js';

export function renderApps(apps, meta, onToggleCheck) {
  const lblTime = document.getElementById('lbl-time');
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

  const appsList = document.getElementById('apps-list');
  appsList.innerHTML = apps.map(app => renderRowHtml(app, meta.userUuid)).join('');
  attachRowEvents(apps, onToggleCheck);
}

export function renderRowHtml(app, userUuid) {
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
  const dogDisplay = formatDogName(app.dogName) || 'Собака не указана';
  const docTitle = formatDocTitle(app.documentName) || 'Документ РКФ';

  return `
    <div class="app-row status-${app.statusGroup} ${app.isReceived ? 'is-collected' : ''}" id="row-${app.barcode}" data-barcode="${app.barcode}" data-filter-group="${filterGroup}" data-is-ready="${app.statusGroup === 'ready'}">
      <div class="row-main">
        <div class="col-check">
          <div class="check-btn ${app.isReceived ? 'checked' : ''}" id="chk-${app.barcode}" data-barcode="${app.barcode}" title="Отметить: забрали из РКФ">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
        </div>

        <div class="col-dog">
          <div class="dog-name" title="${dogDisplay}">${dogDisplay}</div>
          ${app.pedigreeNumber ? `<div class="dog-pedigree">№ РКФ ${app.pedigreeNumber}</div>` : ''}
        </div>

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

        <div class="col-status">
          <span class="badge ${badgeClass}">${app.currentStatus}</span>
        </div>

        <div class="col-chevron">
          <svg class="chevron-icon" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>

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

export function attachRowEvents(apps, onToggleCheck) {
  document.querySelectorAll('.app-row').forEach(row => {
    row.addEventListener('click', (e) => {
      if (e.target.closest('.check-btn') || e.target.closest('.barcode-link')) return;
      const barcode = row.getAttribute('data-barcode');
      const hist = document.getElementById('hist-' + barcode);
      const isOpen = hist.style.display !== 'none';
      hist.style.display = isOpen ? 'none' : 'flex';
      row.classList.toggle('is-open', !isOpen);
    });
  });

  document.querySelectorAll('.check-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const barcode = btn.getAttribute('data-barcode');
      const isChecked = !btn.classList.contains('checked');
      onToggleCheck(barcode, isChecked);
    });
  });

  document.querySelectorAll('.barcode-link').forEach(link => {
    link.addEventListener('click', (e) => e.stopPropagation());
  });
}

export function handleSearch(currentFilter) {
  const searchInput = document.getElementById('search-input');
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
