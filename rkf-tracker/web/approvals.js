// Controller for RKF Competition Approvals Section (info.rkf.online data)
let competitionsList = [];
let currentDiscipline = 'Курсинг борзых';
let currentStatus = 'all';
let showOnlySubscribed = false;

export async function initApprovals() {
  await loadCompetitionsData();
  setupApprovalEvents();
  renderApprovals();
}

async function loadCompetitionsData() {
  try {
    const res = await fetch('./rkf-competitions-2026.json');
    if (res.ok) {
      competitionsList = await res.json();
    }
  } catch (err) {
    console.warn('[Approvals] Failed to fetch competitions JSON:', err);
  }
}

function getSubscribedSet() {
  try {
    return new Set(JSON.parse(localStorage.getItem('cs_subscribed_competitions') || '[]'));
  } catch (_) {
    return new Set();
  }
}

function toggleSubscription(id) {
  const set = getSubscribedSet();
  if (set.has(id)) {
    set.delete(id);
  } else {
    set.add(id);
  }
  localStorage.setItem('cs_subscribed_competitions', JSON.stringify(Array.from(set)));
  renderApprovals();
}

function setupApprovalEvents() {
  // Discipline pills (3 separate disciplines only)
  document.querySelectorAll('.discipline-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.discipline-pill').forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      currentDiscipline = pill.getAttribute('data-discipline');
      showOnlySubscribed = false;
      const subBtn = document.getElementById('btn-filter-subscribed');
      if (subBtn) subBtn.classList.remove('active');
      filterApprovals();
    });
  });

  // Status pills
  document.querySelectorAll('.approval-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.approval-pill').forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      currentStatus = pill.getAttribute('data-status-filter');
      filterApprovals();
    });
  });

  // Subscribed toggle button
  const subBtn = document.getElementById('btn-filter-subscribed');
  if (subBtn) {
    subBtn.addEventListener('click', () => {
      showOnlySubscribed = !showOnlySubscribed;
      subBtn.classList.toggle('active', showOnlySubscribed);
      filterApprovals();
    });
  }

  // Search input
  const searchInput = document.getElementById('approval-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', filterApprovals);
  }
}

export function renderApprovals() {
  renderApprovalsKpi();
  renderDisciplineCounts();
  const container = document.getElementById('approvals-container');
  if (!container) return;

  container.innerHTML = competitionsList.map((item) => renderCompactRowHtml(item)).join('');

  // Attach subscription click handlers
  container.querySelectorAll('.btn-track').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      if (id) toggleSubscription(id);
    });
  });

  filterApprovals();
}

function renderApprovalsKpi() {
  const total = competitionsList.length;
  const approved = competitionsList.filter((a) => a.status === 'APPROVED').length;
  const delayed = competitionsList.filter((a) => a.status === 'DELAYED').length;
  const pending = competitionsList.filter((a) => a.status === 'PENDING').length;

  const setEl = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.innerText = String(val);
  };

  setEl('appr-kpi-total', total);
  setEl('appr-kpi-approved', approved);
  setEl('appr-kpi-delayed', delayed);
  setEl('appr-kpi-pending', pending);

  setEl('cnt-appr-all', `(${total})`);
  setEl('cnt-appr-approved', `(${approved})`);
  setEl('cnt-appr-delayed', `(${delayed})`);
  setEl('cnt-appr-pending', `(${pending})`);

  const subscribedCount = getSubscribedSet().size;
  const cntSubEl = document.getElementById('cnt-appr-subscribed');
  if (cntSubEl) cntSubEl.innerText = `(${subscribedCount})`;

  const navBadge = document.getElementById('nav-competitions-count');
  if (navBadge) navBadge.innerText = String(total);
}

function renderDisciplineCounts() {
  const coursing = competitionsList.filter((c) => c.discipline === 'Курсинг борзых').length;
  const racing = competitionsList.filter((c) => c.discipline === 'Бега борзых').length;
  const bzmp = competitionsList.filter((c) => c.discipline.includes('механической')).length;

  const setEl = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.innerText = `(${val})`;
  };

  setEl('cnt-disc-coursing', coursing);
  setEl('cnt-disc-racing', racing);
  setEl('cnt-disc-bzmp', bzmp);
}

function formatShortDate(dateRaw) {
  if (!dateRaw) return '—';
  const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  const m = dateRaw.match(/^([0-9\-]+)\.([0-9]{2})/);
  if (m) {
    const days = m[1].replace('-', '–');
    const mIdx = parseInt(m[2], 10) - 1;
    if (mIdx >= 0 && mIdx < 12) return `${days} ${months[mIdx]}`;
  }
  return dateRaw;
}

function renderCompactRowHtml(item) {
  const isApproved = item.status === 'APPROVED';
  const isDelayed = item.status === 'DELAYED';
  const statusClass = isApproved ? 'approved' : (isDelayed ? 'delayed' : 'pending');
  const statusText = isApproved ? 'Утверждено' : (isDelayed ? 'Задержано' : 'На согласовании');

  const subscribedSet = getSubscribedSet();
  const isSubscribed = subscribedSet.has(item.id);
  const trackBtnClass = isSubscribed ? 'btn-track active' : 'btn-track';
  const trackTitle = isSubscribed ? 'Отслеживается (нажмите для отмены)' : 'Отслеживать состязание';

  const shortDate = formatShortDate(item.dateRaw);
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

      <!-- 3. Status Block -->
      <div class="comp-col-status">
        <span class="badge-status ${statusClass}">${statusText}</span>
      </div>

      <!-- 4. Track Bell Action Button -->
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

function filterApprovals() {
  const query = (document.getElementById('approval-search-input')?.value || '').toLowerCase().trim();
  const rows = document.querySelectorAll('.comp-row');
  const subscribedSet = getSubscribedSet();
  let visibleCount = 0;

  rows.forEach((row) => {
    const id = row.getAttribute('data-id');
    const status = row.getAttribute('data-status');
    const discipline = row.getAttribute('data-discipline') || '';
    const club = (row.getAttribute('data-club') || '').toLowerCase();
    const location = (row.getAttribute('data-location') || '').toLowerCase();
    const rank = (row.getAttribute('data-rank') || '').toLowerCase();

    // Discipline match
    let matchesDiscipline = false;
    if (currentDiscipline === 'bzmp') {
      matchesDiscipline = discipline.includes('механической') || discipline.includes('БЗМП');
    } else {
      matchesDiscipline = discipline === currentDiscipline;
    }

    // Status match
    let matchesStatus = (currentStatus === 'all') || (status === currentStatus);

    // Subscribed match
    let matchesSubscribed = !showOnlySubscribed || subscribedSet.has(id);

    // Fulltext search match
    let matchesSearch = !query ||
      club.includes(query) ||
      location.includes(query) ||
      rank.includes(query) ||
      discipline.toLowerCase().includes(query);

    const isVisible = matchesDiscipline && matchesStatus && matchesSubscribed && matchesSearch;
    row.style.display = isVisible ? 'grid' : 'none';
    if (isVisible) visibleCount++;
  });

  const emptyMsg = document.getElementById('approvals-empty');
  if (emptyMsg) {
    emptyMsg.style.display = visibleCount === 0 ? 'block' : 'none';
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
