// Tab Navigation Controller (Applications vs Approvals)
export function initTabs() {
  const tabBtns = document.querySelectorAll('[data-tab]');
  const viewApps = document.getElementById('view-applications');
  const viewAppr = document.getElementById('view-approvals');
  const bcCurrent = document.getElementById('bc-current-section');

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab');

      tabBtns.forEach((b) => {
        if (b.getAttribute('data-tab') === target) {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });

      if (target === 'approvals') {
        if (viewApps) viewApps.style.display = 'none';
        if (viewAppr) viewAppr.style.display = 'block';
        if (bcCurrent) bcCurrent.innerText = 'Соревнования РКФ';
      } else {
        if (viewApps) viewApps.style.display = 'block';
        if (viewAppr) viewAppr.style.display = 'none';
        if (bcCurrent) bcCurrent.innerText = 'Заявки на титулы';
      }
    });
  });
}
