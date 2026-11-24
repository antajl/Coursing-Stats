// RKF Competitions Card & List Renderer (ES Module)

/** Сопоставление мероприятий графика РКФ с протоколами соревнований (/event/:id) */
const EVENT_LINK_MAP = {
  ev_15cgms: 2026003, // 03-04.10.2026 СПГОО «Радонежье» Курсинг
  ev_td6lum: 1300,    // 04-05.04.2026 Ярославль Курсинг
  ev_amzre: 1301,     // 04-05.04.2026 Ярославль БЗМП
  ev_5c2n7: 1302,     // 11-12.04.2026 Ставрополь Курсинг
  ev_svlj07: 1303,    // 11-12.04.2026 Ставрополь БЗМП
  ev_4h5z4l: 1304,    // 18-19.04.2026 Казань Курсинг
  ev_g7da21: 1305,    // 18-19.04.2026 Казань БЗМП
  ev_l9qhz: 1310,     // 25-26.04.2026 Донино Курсинг
  ev_lds8ed: 1311,    // 25-26.04.2026 Донино БЗМП
  ev_mzwbyq: 1312,    // 01-02.05.2026 Пермь Курсинг
  ev_4x1xye: 1313,    // 01-02.05.2026 Пермь БЗМП
  ev_is4ldm: 1317,    // 23-24.05.2026 Арта Курсинг
  ev_qu374a: 2026001, // 27-28.06.2026 Суханово Монопородный
  ev_1x75ga: 1550,    // 01-02.08.2026 Донино Бега
  ev_b76v6g: 2026002, // 22-23.08.2026 Суханово Кубок
  ev_47z3pe: 2022002, // 26-27.09.2026 Донино Бега
  ev_elkduj: 2022003, // 10-11.10.2026 Донино Курсинг
  ev_gsoenj: 2022004  // 10-11.10.2026 Донино БЗМП
};

export function getCompetitionEventId(id) {
  if (!id) return null;
  return EVENT_LINK_MAP[id] || null;
}

export function getCompetitionStatus(ev) {
  const st = (ev.status || '').toUpperCase();
  if (st === 'DELAYED') {
    return { key: 'delayed', label: 'Задержано', badgeClass: 'status-delayed' };
  }
  if (st === 'APPROVED' || ev.confirmed === 1) {
    return { key: 'approved', label: 'Утверждено', badgeClass: 'status-approved' };
  }
  if (st === 'PENDING') {
    return { key: 'pending', label: 'На согласовании', badgeClass: 'status-pending' };
  }
  if (st === 'REJECTED') {
    return { key: 'rejected', label: 'Отклонено', badgeClass: 'status-rejected' };
  }

  const sum = (ev.summary || '').toLowerCase();
  const reg = (ev.reglament || '').toLowerCase();
  const notes = (ev.notes || '').toLowerCase();
  if (sum.includes('задержано') || reg.includes('опоздан') || notes.includes('задержан')) {
    return { key: 'delayed', label: 'Задержано', badgeClass: 'status-delayed' };
  }
  if (reg.includes('утвержден')) {
    return { key: 'approved', label: 'Утверждено', badgeClass: 'status-approved' };
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

  // Meta items in compact 2-column or inline list
  const metaItems = [];
  if (location) metaItems.push(`<span class="comp-meta-item"><strong class="comp-lbl">Где:</strong> ${escapeHtml(location)}</span>`);
  if (club) metaItems.push(`<span class="comp-meta-item"><strong class="comp-lbl">Клуб:</strong> ${escapeHtml(club)}</span>`);
  if (ev.judges) metaItems.push(`<span class="comp-meta-item"><strong class="comp-lbl">Судьи:</strong> ${escapeHtml(ev.judges)}</span>`);
  if (ev.reglament) metaItems.push(`<span class="comp-meta-item"><strong class="comp-lbl">Регламент:</strong> ${escapeHtml(ev.reglament)}</span>`);
  if (ev.summary) metaItems.push(`<span class="comp-meta-item"><strong class="comp-lbl">Заявка:</strong> ${escapeHtml(ev.summary)}</span>`);
  if (ev.notes) metaItems.push(`<span class="comp-meta-item comp-meta-note"><strong class="comp-lbl">Прим:</strong> ${escapeHtml(ev.notes)}</span>`);

  // Title without redundant discipline repeat if already clear
  const rawTitle = ev.title || rank;
  const cleanTitle = rawTitle.replace(/\s*•\s*(Курсинг борзых|Бега борзых|Бега за механической приманкой|БЗМП)/i, '').trim();

  return `
    <article class="comp-card" id="comp-card-${ev.id}">
      <div class="comp-card-top">
        <div class="comp-head-left">
          <span class="comp-date-badge">${escapeHtml(dateFormatted)}</span>
          <h3 class="comp-title">${escapeHtml(cleanTitle)}</h3>
          ${rank ? `<span class="comp-tag tag-rank">${escapeHtml(rank)}</span>` : ''}
        </div>
        <div class="comp-head-right">
          ${statusBadge}
          <button class="${trackBtnClass}" data-event-id="${ev.id}" title="Добавить в отслеживаемые">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
            <span>${trackBtnText}</span>
          </button>
        </div>
      </div>

      <div class="comp-meta-row">
        ${metaItems.join('')}
      </div>

      <div class="comp-card-footer">
        ${renderCardActionLink(ev)}
      </div>
    </article>
  `;
}

function renderCardActionLink(ev) {
  const eventId = ev.site_event_id || getCompetitionEventId(ev.id);
  if (eventId) {
    return `
      <a href="https://coursing-stats.ru/event/${eventId}/" target="_blank" class="comp-link-portal comp-link-protocol" title="Перейти к протоколу состязания на сайте">
        Протокол на сайте
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
          <polyline points="15 3 21 3 21 9"/>
          <line x1="10" y1="14" x2="21" y2="3"/>
        </svg>
      </a>
    `;
  }

  const year = ev.year || '2026';
  return `
    <a href="https://coursing-stats.ru/competitions/archive/${year}/" target="_blank" class="comp-link-portal" title="Открыть архив соревнований на сайте">
      Архив соревнований
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
        <polyline points="15 3 21 3 21 9"/>
        <line x1="10" y1="14" x2="21" y2="3"/>
      </svg>
    </a>
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
