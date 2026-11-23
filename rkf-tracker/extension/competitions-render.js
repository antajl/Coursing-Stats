// RKF Competitions Card & List Renderer (ES Module)

export function getCompetitionStatus(ev) {
  const reg = (ev.reglament || '').toLowerCase();
  const notes = (ev.notes || '').toLowerCase();

  if (ev.status === 'APPROVED' || reg.includes('утвержден')) {
    return { key: 'approved', label: 'Утверждено', badgeClass: 'status-approved' };
  }
  if (reg.includes('опоздан') || notes.includes('задержан') || reg.includes('задержан')) {
    return { key: 'delayed', label: 'Задержано', badgeClass: 'status-delayed' };
  }
  if (ev.status === 'REJECTED' || reg.includes('отклон') || reg.includes('отказ')) {
    return { key: 'rejected', label: 'Отклонено', badgeClass: 'status-rejected' };
  }
  return { key: 'pending', label: 'На согласовании', badgeClass: 'status-pending' };
}

export function renderCompetitionsList(container, events, trackedIds, onToggleTrack) {
  if (!container) return;

  if (events.length === 0) {
    container.innerHTML = `
      <div class="comp-empty-state">
        <div class="comp-empty-title">Мероприятия не найдены</div>
        <div class="comp-empty-desc">Попробуйте изменить поисковый запрос, дисциплину или статус.</div>
      </div>
    `;
    return;
  }

  container.innerHTML = events.map((ev) => createEventCardHtml(ev, trackedIds)).join('');
  attachEventCardHandlers(container, onToggleTrack);
}

function createEventCardHtml(ev, trackedIds) {
  const statusInfo = getCompetitionStatus(ev);
  const isTracked = trackedIds.has(String(ev.id));
  const dateFormatted = ev.dateRaw || formatDates(ev.date_start, ev.date_end);

  const statusBadge = `<span class="comp-status-badge ${statusInfo.badgeClass}">${statusInfo.label}</span>`;
  const trackBtnClass = isTracked ? 'btn-track active' : 'btn-track';
  const trackBtnText = isTracked ? 'Отслеживается' : 'Отслеживать';

  const discipline = ev.discipline || ev.sheetName || 'Курсинг';
  const rank = ev.rank || ev.competition_kind || 'Сертификатные';
  const location = ev.location || ev.region || 'Локация уточняется';
  const club = ev.club || ev.host_club || 'Организатор уточняется';

  const reglament = ev.reglament ? `<div class="comp-meta-line"><span class="comp-meta-label">Регламент:</span> <span class="comp-meta-val">${escapeHtml(ev.reglament)}</span></div>` : '';
  const summary = ev.summary ? `<div class="comp-meta-line"><span class="comp-meta-label">Заявка:</span> <span class="comp-meta-val">${escapeHtml(ev.summary)}</span></div>` : '';
  const judges = ev.judges ? `<div class="comp-meta-line"><span class="comp-meta-label">Судьи:</span> <span class="comp-meta-val">${escapeHtml(ev.judges)}</span></div>` : '';
  const notes = ev.notes ? `<div class="comp-meta-line"><span class="comp-meta-label">Примечание:</span> <span class="comp-meta-val">${escapeHtml(ev.notes)}</span></div>` : '';

  const title = ev.title || `${rank} • ${discipline}`;

  return `
    <article class="comp-card" id="comp-card-${ev.id}">
      <div class="comp-card-header">
        <div class="comp-date-badge">${escapeHtml(dateFormatted)}</div>
        <div class="comp-header-badges">
          ${statusBadge}
          <button class="${trackBtnClass}" data-event-id="${ev.id}" title="Добавить в отслеживаемые">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
            <span>${trackBtnText}</span>
          </button>
        </div>
      </div>

      <h3 class="comp-title">${escapeHtml(title)}</h3>

      <div class="comp-tags-row">
        <span class="comp-tag">${escapeHtml(discipline)}</span>
        <span class="comp-tag tag-rank">${escapeHtml(rank)}</span>
      </div>

      <div class="comp-meta-grid">
        <div class="comp-meta-line">
          <span class="comp-meta-label">Локация:</span>
          <span class="comp-meta-val">${escapeHtml(location)}</span>
        </div>
        <div class="comp-meta-line">
          <span class="comp-meta-label">Клуб:</span>
          <span class="comp-meta-val">${escapeHtml(club)}</span>
        </div>
        ${reglament}
        ${summary}
        ${judges}
        ${notes}
      </div>

      <div class="comp-card-footer">
        <span class="comp-id-sub">№ ${escapeHtml(ev.id)} • ${escapeHtml(ev.sheetName || 'РКФ')}</span>
        <a href="https://coursing-stats.ru/calendar" target="_blank" class="comp-link-portal">
          Открыть в календаре
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
        </a>
      </div>
    </article>
  `;
}

function attachEventCardHandlers(container, onToggleTrack) {
  container.querySelectorAll('.btn-track').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const eventId = btn.getAttribute('data-event-id');
      if (eventId && onToggleTrack) {
        onToggleTrack(eventId, btn);
      }
    });
  });
}

function formatDates(start, end) {
  if (!start) return 'Дата уточняется';
  const s = start.split('-');
  const formattedStart = `${s[2]}.${s[1]}.${s[0]}`;
  if (!end || end === start) return formattedStart;
  const e = end.split('-');
  return `${s[2]}.${s[1]} – ${e[2]}.${e[1]}.${e[0]}`;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
