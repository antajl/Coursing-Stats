// settings.js — Desktop Monitoring Settings Controller
// Old Money styling, file budget < 150 lines

export function initSettings({ showToast, onLogout, getAccountInfo }) {
  const modal = document.getElementById('settings-modal');
  const btnSettings = document.getElementById('btn-settings');
  const btnClose = document.getElementById('btn-close-settings-modal');
  const pollSelect = document.getElementById('setting-poll-interval');
  const notifyCheck = document.getElementById('setting-notify-enabled');
  const autostartCheck = document.getElementById('setting-autostart-enabled');
  const btnTestNotify = document.getElementById('btn-test-notification');
  const accountEmail = document.getElementById('settings-account-email');
  const btnLogout = document.getElementById('btn-logout-from-settings');

  function openSettings() {
    if (modal) modal.style.display = 'flex';
    syncAccountUI();
    loadSettings();
  }

  function closeSettings() {
    if (modal) modal.style.display = 'none';
  }

  function syncAccountUI() {
    const acc = getAccountInfo ? getAccountInfo() : null;
    if (accountEmail) {
      accountEmail.textContent = (acc && acc.email) ? acc.email : (acc && acc.token ? 'Подключен' : 'Не подключен');
    }
    if (btnLogout) {
      btnLogout.style.display = (acc && acc.token) ? 'inline-block' : 'none';
    }
  }

  async function loadSettings() {
    try {
      const res = await fetch('/api/desktop/settings');
      if (!res.ok) return;
      const data = await res.json();
      if (pollSelect && typeof data.interval !== 'undefined') {
        pollSelect.value = String(data.interval);
      }
      if (notifyCheck && typeof data.notifications !== 'undefined') {
        notifyCheck.checked = Boolean(data.notifications);
      }
      if (autostartCheck && typeof data.autostart !== 'undefined') {
        autostartCheck.checked = Boolean(data.autostart);
      }
    } catch {
      // Running in standard web context or standalone
    }
  }

  async function saveSettings(patch) {
    try {
      await fetch('/api/desktop/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch)
      });
    } catch {
      // Local fallback
    }
  }

  if (btnSettings) {
    btnSettings.addEventListener('click', openSettings);
  }

  if (btnClose) {
    btnClose.addEventListener('click', closeSettings);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeSettings();
    });
  }

  if (pollSelect) {
    pollSelect.addEventListener('change', () => {
      const interval = parseInt(pollSelect.value, 10);
      saveSettings({ interval });
      if (showToast) showToast('Интервал проверки обновлен');
    });
  }

  if (notifyCheck) {
    notifyCheck.addEventListener('change', () => {
      const notifications = notifyCheck.checked;
      saveSettings({ notifications });
      if (showToast) showToast(notifications ? 'Уведомления включены' : 'Уведомления отключены');
    });
  }

  if (autostartCheck) {
    autostartCheck.addEventListener('change', () => {
      const autostart = autostartCheck.checked;
      saveSettings({ autostart });
      if (showToast) showToast(autostart ? 'Автозагрузка включена' : 'Автозагрузка выключена');
    });
  }

  if (btnTestNotify) {
    btnTestNotify.addEventListener('click', async () => {
      try {
        const res = await fetch('/api/desktop/test-notification', { method: 'POST' });
        if (res.ok) {
          if (showToast) showToast('Тестовое уведомление отправлено');
        } else {
          if (showToast) showToast('Уведомление отправлено (web-режим)');
        }
      } catch {
        if (showToast) showToast('Тестовое уведомление (браузер)');
      }
    });
  }

  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      closeSettings();
      if (onLogout) onLogout();
    });
  }

  return { openSettings, closeSettings, syncAccountUI };
}
