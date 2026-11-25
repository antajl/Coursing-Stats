// HTML renderer for individual competition row
export function renderCompactRowHtml(item, isSubscribed, shortDate) {
  const isApproved = item.status === 'APPROVED';
  const isDelayed = item.status === 'DELAYED';
  const statusClass = isApproved ? 'approved' : (isDelayed ? 'delayed' : 'pending');
  const statusText = isApproved ? 'Утверждено' : (isDelayed ? 'Задержано' : 'На согласовании');

  const trackBtnClass = isSubscribed ? 'btn-track active' : 'btn-track';
  const trackTitle = isSubscribed ? 'Отслеживается (нажмите для отмены)' : 'Отслеживать состязание';
  const reglamentText = item.reglament ? ` • Регламент: ${escapeHtml(item.reglament)}` : '';

  return `
    <div class="comp-row status-${statusClass}" data-id="${item.id}"
      data-discipline="${escapeHtml(item.discipline)}"
      data-club="${escapeHtml(item.club)}"
      data-location="${escapeHtml(item.location)}"
      data-rank="${escapeHtml(item.rank)}"
      data-status="${item.status}">
      
      <!-- 1. Date Block -->
      <div class="comp-col-date">
        <span class="date-badge">${escapeHtml(shortDate)}</span>
      </div>

      <!-- 2. Club & Rank Center Block -->
      <div class="comp-col-main">
        <div class="comp-title-line">
          <span class="comp-club">${escapeHtml(item.club)}</span>
          <span class="badge-rank">${escapeHtml(item.rank)}</span>
        </div>
        <div class="comp-sub-line">
          <span>${escapeHtml(item.location)}</span>${reglamentText}
        </div>
      </div>

      <!-- 3. Location Block -->
      <div class="comp-col-location">
        <span class="comp-city">${escapeHtml(item.location || '—')}</span>
        <span class="comp-federation">${escapeHtml(item.federation || 'РКФ')}</span>
      </div>

      <!-- 4. Status Block -->
      <div class="comp-col-status">
        <span class="badge-status ${statusClass}">${statusText}</span>
      </div>

      <!-- 5. Track Bell Action Button -->
      <div class="comp-col-action">
        <button class="${trackBtnClass}" data-id="${item.id}" title="${trackTitle}" aria-label="${trackTitle}">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="${isSubscribed ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </button>
      </div>
    </div>
  `;
}

export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
