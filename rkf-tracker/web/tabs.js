// Tab Navigation Controller (Applications vs Approvals)
export function initTabs() {
  const tabBtns = document.querySelectorAll('.section-tab-btn');
  const viewApps = document.getElementById('view-applications');
  const viewAppr = document.getElementById('view-approvals');
  const bcCurrent = document.getElementById('bc-current-section');

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const target = btn.getAttribute('data-tab');
      if (target === 'approvals') {
        if (viewApps) viewApps.style.display = 'none';
        if (viewAppr) viewAppr.style.display = 'block';
        if (bcCurrent) bcCurrent.innerText = 'Согласование состязаний';
      } else {
        if (viewApps) viewApps.style.display = 'block';
        if (viewAppr) viewAppr.style.display = 'none';
        if (bcCurrent) bcCurrent.innerText = 'Заявки РКФ';
      }
    });
  });
}
