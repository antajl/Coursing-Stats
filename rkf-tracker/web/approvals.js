// Controller for RKF Competition Approvals Section (info.rkf.online data)
let competitionsList = [];
let currentDiscipline = 'all';
let currentStatus = 'all';

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

function setupApprovalEvents() {
  // Discipline pills
  document.querySelectorAll('.discipline-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.discipline-pill').forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      currentDiscipline = pill.getAttribute('data-discipline');
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

  container.innerHTML = competitionsList.map((item) => renderApprovalCardHtml(item)).join('');
  filterApprovals();
}

function renderApprovalsKpi() {
  const total = competitionsList.length;
  const approved = competitionsList.filter((a) => a.status === 'APPROVED').length;
  const pending = competitionsList.filter((a) => a.status === 'PENDING').length;
  const other = total - approved - pending;

  const setEl = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.innerText = String(val);
  };

  setEl('appr-kpi-total', total);
  setEl('appr-kpi-approved', approved);
  setEl('appr-kpi-pending', pending);
  setEl('appr-kpi-revision', other);

  setEl('cnt-appr-all', `(${total})`);
  setEl('cnt-appr-approved', `(${approved})`);
  setEl('cnt-appr-pending', `(${pending})`);
  setEl('cnt-appr-revision', `(${other})`);

  // Update navbar badge
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

  setEl('cnt-disc-all', competitionsList.length);
  setEl('cnt-disc-coursing', coursing);
  setEl('cnt-disc-racing', racing);
  setEl('cnt-disc-bzmp', bzmp);
}

function renderApprovalCardHtml(item) {
  const isApproved = item.status === 'APPROVED';
  const isPending = item.status === 'PENDING';
  const statusClass = isApproved ? 'approved' : (isPending ? 'pending' : 'neutral');
  const statusText = isApproved ? 'Утверждено' : (isPending ? 'На согласовании' : 'На рассмотрении');

  const incomingBadge = item.summary ?
    `<span class="badge-req">${escapeHtml(item.summary)}</span>` : '';

  const notesHtml = item.notes ?
    `<div class="approval-comment"><strong>Примечание РКФ:</strong> ${escapeHtml(item.notes)}</div>` : '';

  const shortDiscipline = item.discipline.includes('механической') ? 'БЗМП' : item.discipline;

  return `
    <article class="approval-card status-${statusClass}" data-id="${item.id}"
      data-club="${escapeHtml(item.club)}"
      data-location="${escapeHtml(item.location)}"
      data-discipline="${escapeHtml(item.discipline)}"
      data-rank="${escapeHtml(item.rank)}"
      data-judges="${escapeHtml(item.judges || '')}"
      data-status="${item.status}">
      
      <div class="approval-header">
        <div class="approval-badges">
          <span class="badge-discipline">${escapeHtml(shortDiscipline)}</span>
          <span class="badge-rank">${escapeHtml(item.rank)}</span>
          ${incomingBadge}
          <span class="badge-status ${statusClass}">${statusText}</span>
        </div>
        <div class="approval-date">${escapeHtml(item.dateRaw)}</div>
      </div>

      <h3 class="approval-title">${escapeHtml(item.discipline)} • ${escapeHtml(item.rank)} — ${escapeHtml(item.location)}</h3>

      <div class="approval-meta">
        <div class="approval-meta-item">
          <span class="approval-meta-label">Организатор / Клуб</span>
          <span class="approval-meta-value">${escapeHtml(item.club)}</span>
        </div>
        <div class="approval-meta-item">
          <span class="approval-meta-label">Город / Локация</span>
          <span class="approval-meta-value">${escapeHtml(item.location)}</span>
        </div>
        <div class="approval-meta-item">
          <span class="approval-meta-label">Судейская коллегия</span>
          <span class="approval-meta-value">${escapeHtml(item.judges || 'Уточняется')}</span>
        </div>
        <div class="approval-meta-item">
          <span class="approval-meta-label">Статус регламента</span>
          <span class="approval-meta-value">${escapeHtml(item.reglament || 'На согласовании')}</span>
        </div>
      </div>

      ${notesHtml}
    </article>
  `;
}

function filterApprovals() {
  const query = (document.getElementById('approval-search-input')?.value || '').toLowerCase().trim();
  const cards = document.querySelectorAll('.approval-card');
  let visibleCount = 0;

  cards.forEach((card) => {
    const status = card.getAttribute('data-status');
    const discipline = card.getAttribute('data-discipline') || '';
    const club = (card.getAttribute('data-club') || '').toLowerCase();
    const location = (card.getAttribute('data-location') || '').toLowerCase();
    const rank = (card.getAttribute('data-rank') || '').toLowerCase();
    const judges = (card.getAttribute('data-judges') || '').toLowerCase();

    let matchesStatus = (currentStatus === 'all') || (status === currentStatus);
    
    let matchesDiscipline = true;
    if (currentDiscipline !== 'all') {
      if (currentDiscipline === 'bzmp') {
        matchesDiscipline = discipline.includes('механической') || discipline.includes('БЗМП');
      } else {
        matchesDiscipline = discipline === currentDiscipline;
      }
    }

    let matchesSearch = !query ||
      club.includes(query) ||
      location.includes(query) ||
      rank.includes(query) ||
      judges.includes(query) ||
      discipline.toLowerCase().includes(query);

    const isVisible = matchesStatus && matchesDiscipline && matchesSearch;
    card.style.display = isVisible ? 'block' : 'none';
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
