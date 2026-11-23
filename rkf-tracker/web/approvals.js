// Controller for RKF Competition Approvals Section (info.rkf.online)
import { MOCK_APPROVALS } from './approvalsData.js';

let approvalsList = [...MOCK_APPROVALS];
let currentStatusFilter = 'all';
let currentDisciplineFilter = 'all';

export function initApprovals() {
  setupApprovalEvents();
  renderApprovals();
}

function setupApprovalEvents() {
  // Status filter pills for approvals
  document.querySelectorAll('.approval-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.approval-pill').forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      currentStatusFilter = pill.getAttribute('data-status-filter');
      filterApprovals();
    });
  });

  // Discipline selector
  const disciplineSelect = document.getElementById('approval-discipline-select');
  if (disciplineSelect) {
    disciplineSelect.addEventListener('change', (e) => {
      currentDisciplineFilter = e.target.value;
      filterApprovals();
    });
  }

  // Search input for approvals
  const searchInput = document.getElementById('approval-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', filterApprovals);
  }
}

export function renderApprovals() {
  renderApprovalsKpi();
  const container = document.getElementById('approvals-container');
  if (!container) return;

  container.innerHTML = approvalsList.map((item) => renderApprovalCardHtml(item)).join('');
  filterApprovals();
}

function renderApprovalsKpi() {
  const total = approvalsList.length;
  const approved = approvalsList.filter((a) => a.status === 'approved').length;
  const pending = approvalsList.filter((a) => a.status === 'pending').length;
  const revision = approvalsList.filter((a) => a.status === 'revision').length;

  const setEl = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.innerText = String(val);
  };

  setEl('appr-kpi-total', total);
  setEl('appr-kpi-approved', approved);
  setEl('appr-kpi-pending', pending);
  setEl('appr-kpi-revision', revision);

  setEl('cnt-appr-all', `(${total})`);
  setEl('cnt-appr-approved', `(${approved})`);
  setEl('cnt-appr-pending', `(${pending})`);
  setEl('cnt-appr-revision', `(${revision})`);
}

function renderApprovalCardHtml(item) {
  const statusClass = item.status === 'approved' ? 'approved' :
    item.status === 'revision' ? 'revision' : 'pending';

  const calBadge = item.calendarNumber ?
    `<span class="badge-rank">${item.calendarNumber}</span>` : '';

  return `
    <article class="approval-card status-${statusClass}" data-id="${item.id}"
      data-club="${escapeHtml(item.club)}"
      data-city="${escapeHtml(item.city)}"
      data-discipline="${escapeHtml(item.discipline)}"
      data-title="${escapeHtml(item.title)}"
      data-req="${escapeHtml(item.requestNumber)}"
      data-status="${item.status}">
      
      <div class="approval-header">
        <div class="approval-badges">
          <span class="badge-discipline">${escapeHtml(item.discipline)}</span>
          <span class="badge-rank">${escapeHtml(item.rank)}</span>
          ${calBadge}
          <span class="badge-status ${statusClass}">${escapeHtml(item.statusLabel)}</span>
        </div>
        <div class="approval-date">${escapeHtml(item.date)}</div>
      </div>

      <h3 class="approval-title">${escapeHtml(item.title)}</h3>

      <div class="approval-meta">
        <div class="approval-meta-item">
          <span class="approval-meta-label">Организатор / Клуб</span>
          <span class="approval-meta-value">${escapeHtml(item.club)}</span>
        </div>
        <div class="approval-meta-item">
          <span class="approval-meta-label">Город / Локация</span>
          <span class="approval-meta-value">${escapeHtml(item.city)}</span>
        </div>
        <div class="approval-meta-item">
          <span class="approval-meta-label">Номер заявки</span>
          <span class="approval-meta-value">Вх. ${escapeHtml(item.requestNumber)}</span>
        </div>
        <div class="approval-meta-item">
          <span class="approval-meta-label">Дата рассмотрения</span>
          <span class="approval-meta-value">${escapeHtml(item.updatedDate)}</span>
        </div>
      </div>

      <div class="approval-comment">
        <strong>Примечание комиссии:</strong> ${escapeHtml(item.comment)}
      </div>
    </article>
  `;
}

function filterApprovals() {
  const query = (document.getElementById('approval-search-input')?.value || '').toLowerCase().trim();
  const cards = document.querySelectorAll('.approval-card');
  let visibleCount = 0;

  cards.forEach((card) => {
    const status = card.getAttribute('data-status');
    const discipline = card.getAttribute('data-discipline');
    const club = (card.getAttribute('data-club') || '').toLowerCase();
    const city = (card.getAttribute('data-city') || '').toLowerCase();
    const title = (card.getAttribute('data-title') || '').toLowerCase();
    const req = (card.getAttribute('data-req') || '').toLowerCase();

    let matchesStatus = (currentStatusFilter === 'all') || (status === currentStatusFilter);
    let matchesDiscipline = (currentDisciplineFilter === 'all') || (discipline === currentDisciplineFilter);

    let matchesSearch = !query ||
      club.includes(query) ||
      city.includes(query) ||
      title.includes(query) ||
      req.includes(query) ||
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
