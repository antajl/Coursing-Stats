// UI Rendering Engine for Applications and Timeline Accordions
import { formatDogName, formatDocTitle } from './formatters.js';

export function renderKpiSummary(apps) {
  const activeCount = apps.filter(a => a.statusGroup === 'active').length;
  const toPickupCount = apps.filter(a => a.statusGroup === 'ready' && !a.isReceived).length;
  const collectedCount = apps.filter(a => a.statusGroup === 'ready' && a.isReceived).length;

  // Header / Toolbar counters
  const cntAll = document.getElementById('cnt-all');
  const cntActive = document.getElementById('cnt-active');
  const cntPickup = document.getElementById('cnt-pickup');
  const cntCollected = document.getElementById('cnt-collected');

  if (cntAll) cntAll.innerText = `(${apps.length})`;
  if (cntActive) cntActive.innerText = `(${activeCount})`;
  if (cntPickup) cntPickup.innerText = `(${toPickupCount})`;
  if (cntCollected) cntCollected.innerText = `(${collectedCount})`;

  // Top KPI widgets
  const kpiTotal = document.getElementById('kpi-total');
  const kpiActive = document.getElementById('kpi-active');
  const kpiPickup = document.getElementById('kpi-pickup');
  const kpiCollected = document.getElementById('kpi-collected');

  if (kpiTotal) kpiTotal.innerText = apps.length;
  if (kpiActive) kpiActive.innerText = activeCount;
  if (kpiPickup) kpiPickup.innerText = toPickupCount;
  if (kpiCollected) kpiCollected.innerText = collectedCount;
}

export function renderCardHtml(app) {
  const isCollected = app.isReceived;
  const statusClass = app.statusGroup === 'ready' ? 'status-ready' : (app.statusGroup === 'rejected' ? 'status-rejected' : 'status-active');
  const collectedClass = isCollected ? 'is-collected' : '';
  const checkedClass = isCollected ? 'checked' : '';

  const badgeClass = app.statusGroup === 'ready' ? 'badge-ready' : (app.statusGroup === 'rejected' ? 'badge-rejected' : 'badge-active');
  const badgeText = app.statusGroup === 'ready' ? 'Изготовлено' : (app.statusGroup === 'rejected' ? 'Отклонено' : app.currentStatus);

  const formattedDog = formatDogName(app.dogName);
  const formattedDoc = formatDocTitle(app.documentName);
  const updatedDate = app.lastUpdated ? new Date(app.lastUpdated).toLocaleDateString('ru-RU') : '';

  return `
    <article class="app-row ${statusClass} ${collectedClass}" data-barcode="${app.barcode}">
      <div class="row-main">
        <div class="col-check">
          <div class="check-btn ${checkedClass}" title="${isCollected ? 'Отметить как не забранный' : 'Отметить как забранный'}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        </div>

        <div class="col-dog">
          <div class="dog-name" title="${formattedDog}">${formattedDog}</div>
          <div class="dog-pedigree">№ РКФ ${app.pedigreeNumber || '—'}</div>
        </div>

        <div class="col-doc">
          <div class="doc-title" title="${formattedDoc}">${formattedDoc}</div>
          <div class="doc-meta">
            <a href="https://rkf.online/article/${app.barcode}" target="_blank" class="barcode-link" title="Открыть в РКФ Онлайн">
              № ${app.barcode}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </a>
            <span class="meta-dot">•</span>
            <span class="meta-date">${updatedDate}</span>
          </div>
        </div>

        <div class="col-status">
          <span class="badge ${badgeClass}">${badgeText}</span>
        </div>

        <div class="col-chevron">
          <svg class="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>

      <div class="timeline" style="display: none;">
        ${(app.history || []).map(h => `
          <div class="t-item">
            <span class="t-date">${new Date(h.date).toLocaleDateString('ru-RU')}</span>
            <span class="t-bullet"></span>
            <span class="t-status">${h.status}</span>
          </div>
        `).join('')}
      </div>
    </article>
  `;
}

export function attachCardEvents(onToggleReceived) {
  document.querySelectorAll('.app-row').forEach(row => {
    const barcode = row.getAttribute('data-barcode');

    // Toggle Timeline Accordion on Card click (except check button & links)
    row.addEventListener('click', (e) => {
      if (e.target.closest('.check-btn') || e.target.closest('a')) return;
      const timeline = row.querySelector('.timeline');
      const isOpen = timeline.style.display !== 'none';
      timeline.style.display = isOpen ? 'none' : 'flex';
      row.classList.toggle('is-open', !isOpen);
    });

    // Toggle Received Checkbox
    const checkBtn = row.querySelector('.check-btn');
    if (checkBtn) {
      checkBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (onToggleReceived) onToggleReceived(barcode);
      });
    }
  });
}
