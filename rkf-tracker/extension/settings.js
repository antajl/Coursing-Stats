// Settings Modal and Preferences Controller (ES Module)
import { playHarmonicChime } from './audio.js';

export function setupSettings(showToast, onLogout, onOpenTab) {
  const btnSettings = document.getElementById('btn-settings');
  const btnCloseSettings = document.getElementById('btn-close-settings');
  const btnSaveSettings = document.getElementById('btn-save-settings');
  const btnTestSound = document.getElementById('btn-test-sound');
  const btnTestNotify = document.getElementById('btn-test-notify');
  const btnModeTab = document.getElementById('btn-mode-tab');
  const btnLogout = document.getElementById('btn-logout');

  if (btnSettings) {
    btnSettings.addEventListener('click', openSettingsModal);
  }

  if (btnCloseSettings) {
    btnCloseSettings.addEventListener('click', closeSettingsModal);
  }

  if (btnSaveSettings) {
    btnSaveSettings.addEventListener('click', async () => {
      await saveSettingsAndClose();
      showToast('Настройки сохранены');
    });
  }

  if (btnTestSound) {
    btnTestSound.addEventListener('click', () => {
      playHarmonicChime();
    });
  }

  if (btnTestNotify) {
    btnTestNotify.addEventListener('click', () => {
      const soundEnabled = document.getElementById('setting-sound').checked;
      chrome.notifications.create(`rkf_test_${Date.now()}`, {
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: 'РКФ: Изготовлено',
        message: 'Бель Этуаль Кайла • Чемпион РКФ по рабочим качествам\n(Тестовое уведомление CoursingStats)',
        priority: 2,
        silent: !soundEnabled
      });
      if (soundEnabled) {
        playHarmonicChime();
      }
      showToast('Тестовое уведомление отправлено в Windows');
    });
  }

  if (btnModeTab) {
    btnModeTab.addEventListener('click', () => {
      closeSettingsModal();
      onOpenTab();
    });
  }

  if (btnLogout) {
    btnLogout.addEventListener('click', async () => {
      closeSettingsModal();
      await onLogout();
      showToast('Вы вышли из аккаунта');
    });
  }

  const copySettingsBtn = document.getElementById('btn-copy-token-settings');
  if (copySettingsBtn) {
    copySettingsBtn.addEventListener('click', async () => {
      const store = await chrome.storage.local.get(['rkfToken']);
      if (!store.rkfToken) {
        showToast('Токен отсутствует. Войдите в РКФ Онлайн.');
        return;
      }
      try {
        await navigator.clipboard.writeText(store.rkfToken);
        showToast('Токен скопирован в буфер обмена!');
      } catch {
        showToast('Не удалось скопировать токен');
      }
    });
  }
}

export async function openSettingsModal() {
  const store = await chrome.storage.local.get(['pref_interval', 'pref_notify', 'pref_sound']);
  const interval = store.pref_interval !== undefined ? store.pref_interval : 60;
  const notify = store.pref_notify !== undefined ? store.pref_notify : true;
  const sound = store.pref_sound !== undefined ? store.pref_sound : true;

  document.getElementById('setting-interval').value = String(interval);
  document.getElementById('setting-notify').checked = !!notify;
  document.getElementById('setting-sound').checked = !!sound;

  document.getElementById('settings-modal').style.display = 'flex';
}

export function closeSettingsModal() {
  document.getElementById('settings-modal').style.display = 'none';
}

export async function saveSettingsAndClose() {
  const parsed = parseInt(document.getElementById('setting-interval').value, 10);
  const intervalVal = isNaN(parsed) ? 60 : parsed;
  const notifyVal = document.getElementById('setting-notify').checked;
  const soundVal = document.getElementById('setting-sound').checked;

  await chrome.storage.local.set({
    pref_interval: intervalVal,
    pref_notify: notifyVal,
    pref_sound: soundVal
  });

  closeSettingsModal();
}
