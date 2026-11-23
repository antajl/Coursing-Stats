// PWA Installation & Service Worker Controller
let deferredPrompt = null;

export function initPwa(onToast) {
  registerServiceWorker(onToast);
  setupInstallPrompt(onToast);
}

function registerServiceWorker(onToast) {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((reg) => {
        // SW registered
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                if (typeof onToast === 'function') {
                  onToast('Доступна новая версия. Перезагрузите страницу для обновления.');
                }
              }
            });
          }
        });
      })
      .catch((err) => {
        console.warn('[PWA] Service worker registration failed:', err);
      });
  });
}

function isRunningStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    document.referrer.includes('android-app://');
}

function setupInstallPrompt(onToast) {
  const btnInstall = document.getElementById('btn-install-pwa');
  if (!btnInstall) return;

  if (isRunningStandalone()) {
    btnInstall.style.display = 'none';
    return;
  }

  // Listen for Chrome / Edge / Yandex beforeinstallprompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    btnInstall.style.display = 'inline-flex';
    btnInstall.classList.add('can-install');
  });

  btnInstall.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult && choiceResult.outcome === 'accepted') {
        if (typeof onToast === 'function') {
          onToast('Установка приложения запущена');
        }
      }
      deferredPrompt = null;
      btnInstall.style.display = 'none';
    } else {
      if (typeof onToast === 'function') {
        onToast('Для установки нажмите значок установки в адресной строке браузера');
      }
    }
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    btnInstall.style.display = 'none';
    if (typeof onToast === 'function') {
      onToast('Приложение успешно установлено на устройство');
    }
  });
}
