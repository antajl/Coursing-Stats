// Multi-variant Authentication & Telegram Bridge Controller for RKF Tracker
// Primary: Isolated official RKF site login (WebView2)
// Secondary: Accordion fallback (E-mail/Password or manual Token)

let pollWebLoginTimer = null;

export function initAuth(onAuthSuccess, showToast) {
  const btnAuth = document.getElementById('btn-auth');
  const btnClose = document.getElementById('btn-close-auth-modal');
  const btnMainWeb = document.getElementById('btn-main-web-login');
  const btnToggleAlt = document.getElementById('btn-toggle-alt-auth');
  const btnSubmit = document.getElementById('btn-login-submit');
  const btnTokenSubmit = document.getElementById('btn-token-submit');
  const btnLogout = document.getElementById('btn-logout-web');
  const btnTg = document.getElementById('btn-connect-telegram');

  if (btnAuth) btnAuth.addEventListener('click', openAuthModal);
  if (btnClose) btnClose.addEventListener('click', closeAuthModal);

  // Primary: Official Web Login in isolated window
  if (btnMainWeb) {
    btnMainWeb.addEventListener('click', () => handleMainWebLogin(onAuthSuccess, showToast));
  }

  // Accordion toggle for alternative methods
  if (btnToggleAlt) {
    btnToggleAlt.addEventListener('click', () => {
      const content = document.getElementById('auth-alt-content');
      if (!content) return;
      const isOpen = content.style.display !== 'none';
      content.style.display = isOpen ? 'none' : 'block';
      btnToggleAlt.classList.toggle('open', !isOpen);
    });
  }

  // Alt Sub-Tab switching (Password vs Token)
  document.querySelectorAll('.auth-tab-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.auth-tab-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const targetId = pill.getAttribute('data-pane');
      document.querySelectorAll('#auth-alt-content .auth-pane').forEach(pane => {
        pane.style.display = pane.id === targetId ? 'block' : 'none';
      });
      const errEl = document.getElementById('auth-error-msg');
      if (errEl) errEl.style.display = 'none';
    });
  });

  handleUrlToken(onAuthSuccess, showToast);
  if (btnSubmit) btnSubmit.addEventListener('click', () => handlePasswordLogin(onAuthSuccess, showToast));
  if (btnTokenSubmit) btnTokenSubmit.addEventListener('click', () => handleTokenSubmit(onAuthSuccess, showToast));
  if (btnLogout) btnLogout.addEventListener('click', () => handleLogout(onAuthSuccess, showToast));
  if (btnTg) btnTg.addEventListener('click', () => handleTelegramConnect(showToast));
}

async function handleMainWebLogin(onAuthSuccess, showToast) {
  const btnText = document.getElementById('btn-main-web-text');
  const errEl = document.getElementById('auth-error-msg');
  if (errEl) errEl.style.display = 'none';

  if (btnText) btnText.innerText = 'Открытие окна входа РКФ...';

  try {
    const res = await fetch('/api/desktop/auth/start-web-login');
    const data = await res.json().catch(() => ({}));

    if (res.ok && data.ok) {
      if (btnText) btnText.innerText = 'Ожидание авторизации на rkf.online...';
      startPollingWebLogin(onAuthSuccess, showToast);
    } else {
      fallbackWebLogin(showToast);
    }
  } catch (err) {
    fallbackWebLogin(showToast);
  }
}

function startPollingWebLogin(onAuthSuccess, showToast) {
  if (pollWebLoginTimer) clearInterval(pollWebLoginTimer);

  pollWebLoginTimer = setInterval(async () => {
    try {
      const res = await fetch('/api/desktop/auth/poll-web-login');
      const data = await res.json().catch(() => ({}));

      if (data.ok && data.status === 'success' && data.token) {
        stopPollingWebLogin();
        localStorage.setItem('cs_rkf_token', data.token);
        closeAuthModal();
        if (typeof showToast === 'function') {
          showToast('Успешный вход через официальный сайт РКФ Онлайн');
        }
        if (typeof onAuthSuccess === 'function') {
          onAuthSuccess(data.token);
        }
      } else if (data.status === 'canceled') {
        stopPollingWebLogin();
        const btnText = document.getElementById('btn-main-web-text');
        if (btnText) btnText.innerText = 'Войти через официальный сайт РКФ Онлайн';
      }
    } catch (e) {}
  }, 750);
}

function stopPollingWebLogin() {
  if (pollWebLoginTimer) {
    clearInterval(pollWebLoginTimer);
    pollWebLoginTimer = null;
  }
  const btnText = document.getElementById('btn-main-web-text');
  if (btnText) btnText.innerText = 'Войти через официальный сайт РКФ Онлайн';
}

function fallbackWebLogin(showToast) {
  stopPollingWebLogin();
  window.open('https://rkf.online/login', '_blank');
  if (typeof showToast === 'function') {
    showToast('Сайт rkf.online открыт в браузере. Вставьте токен в блок ниже.');
  }
  const altContent = document.getElementById('auth-alt-content');
  const btnToggle = document.getElementById('btn-toggle-alt-auth');
  if (altContent) altContent.style.display = 'block';
  if (btnToggle) btnToggle.classList.add('open');
}

async function handleTelegramConnect(showToast) {
  try {
    const res = await fetch('/api/desktop/telegram/bind-url');
    const data = await res.json().catch(() => ({}));

    if (data.ok && data.url) {
      if (typeof showToast === 'function') {
        showToast('Ссылка на Telegram-бота открыта в системном браузере');
      }
    } else {
      const ticket = 'tk_' + Math.random().toString(36).substring(2, 10);
      const url = 'https://t.me/coursing_stats_notify_bot?start=bind_tk_' + ticket;
      window.open(url, '_blank');
      if (typeof showToast === 'function') {
        showToast('Бот открыт. Нажмите Запустить в Telegram для привязки.');
      }
    }
  } catch (err) {
    const ticket = 'tk_' + Math.random().toString(36).substring(2, 10);
    window.open('https://t.me/coursing_stats_notify_bot?start=bind_tk_' + ticket, '_blank');
  }
}

async function handlePasswordLogin(onAuthSuccess, showToast) {
  const email = (document.getElementById('auth-email')?.value || '').trim();
  const password = (document.getElementById('auth-password')?.value || '').trim();
  const errEl = document.getElementById('auth-error-msg');
  const submitText = document.getElementById('btn-login-text');

  if (!email || !password) {
    showError(errEl, 'Укажите E-mail и пароль');
    return;
  }

  if (errEl) errEl.style.display = 'none';
  if (submitText) submitText.innerText = 'Вход...';

  try {
    const res = await fetch('/api/desktop/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: password })
    });
    const data = await res.json().catch(() => ({}));

    if (res.ok && data.ok && data.apikey) {
      const token = data.apikey;
      localStorage.setItem('cs_rkf_token', token);
      localStorage.setItem('cs_rkf_user_email', email);
      closeAuthModal();
      if (typeof showToast === 'function') showToast('Успешный вход в РКФ Онлайн');
      if (typeof onAuthSuccess === 'function') onAuthSuccess(token);
    } else {
      showError(errEl, data.error || data.message || 'Неверный E-mail или пароль');
    }
  } catch (err) {
    showError(errEl, 'Ошибка подключения к сервису авторизации');
  } finally {
    if (submitText) submitText.innerText = 'Войти по паролю';
  }
}

async function handleTokenSubmit(onAuthSuccess, showToast) {
  const tokenInput = document.getElementById('auth-token-input');
  const token = (tokenInput?.value || '').trim();
  const errEl = document.getElementById('auth-error-msg');

  if (!token) {
    showError(errEl, 'Введите или вставьте API-токен');
    return;
  }

  try {
    await fetch('/api/desktop/auth/save-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: token })
    }).catch(() => {});

    localStorage.setItem('cs_rkf_token', token);
    closeAuthModal();
    if (typeof showToast === 'function') showToast('API-токен успешно сохранен');
    if (typeof onAuthSuccess === 'function') onAuthSuccess(token);
  } catch (err) {
    showError(errEl, 'Не удалось сохранить API-токен');
  }
}

async function handleLogout(onAuthSuccess, showToast) {
  stopPollingWebLogin();
  try { await fetch('/api/desktop/auth/logout').catch(() => {}); } catch (e) {}

  localStorage.removeItem('cs_rkf_token');
  localStorage.removeItem('cs_rkf_user_email');
  closeAuthModal();
  if (typeof showToast === 'function') showToast('Вы вышли из личного кабинета РКФ');
  if (typeof onAuthSuccess === 'function') onAuthSuccess(null);
}

function handleUrlToken(onAuthSuccess, showToast) {
  try {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('cs_rkf_token', token);
      fetch('/api/desktop/auth/save-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token })
      }).catch(() => {});

      window.history.replaceState({}, document.title, window.location.pathname);
      if (typeof showToast === 'function') showToast('Авторизация успешно сохранена');
      if (typeof onAuthSuccess === 'function') onAuthSuccess(token);
    }
  } catch (e) {}
}

function showError(el, message) {
  if (el) { el.innerText = message; el.style.display = 'block'; }
}

export function openAuthModal() {
  const modal = document.getElementById('auth-modal');
  const token = localStorage.getItem('cs_rkf_token');
  const userEmail = localStorage.getItem('cs_rkf_user_email');
  const formSection = document.getElementById('auth-form-section');
  const loggedSection = document.getElementById('auth-logged-section');
  const loggedEmail = document.getElementById('logged-user-email');
  const tokenInput = document.getElementById('auth-token-input');
  const errEl = document.getElementById('auth-error-msg');

  if (errEl) errEl.style.display = 'none';

  if (token) {
    if (formSection) formSection.style.display = 'none';
    if (loggedSection) loggedSection.style.display = 'block';
    if (loggedEmail) loggedEmail.innerText = userEmail || 'Ключ сессии активен';
  } else {
    if (formSection) formSection.style.display = 'block';
    if (loggedSection) loggedSection.style.display = 'none';
    if (tokenInput && token) tokenInput.value = token;
  }

  if (modal) modal.style.display = 'flex';
}

export function closeAuthModal() {
  stopPollingWebLogin();
  const modal = document.getElementById('auth-modal');
  if (modal) modal.style.display = 'none';
}
