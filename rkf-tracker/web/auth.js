// Multi-variant Authentication Controller for RKF Tracker
// Supports: 1. Password login, 2. Web login (auto-capture), 3. Direct API token

export function initAuth(onAuthSuccess, showToast) {
  const btnAuth = document.getElementById('btn-auth');
  const btnClose = document.getElementById('btn-close-auth-modal');
  const btnSubmit = document.getElementById('btn-login-submit');
  const btnWebLogin = document.getElementById('btn-open-web-login');
  const btnTokenSubmit = document.getElementById('btn-token-submit');
  const btnLogout = document.getElementById('btn-logout-web');

  if (btnAuth) btnAuth.addEventListener('click', openAuthModal);
  if (btnClose) btnClose.addEventListener('click', closeAuthModal);

  // Tab switching inside modal
  const tabPills = document.querySelectorAll('.auth-tab-pill');
  tabPills.forEach(pill => {
    pill.addEventListener('click', () => {
      tabPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const targetPaneId = pill.getAttribute('data-pane');
      document.querySelectorAll('.auth-pane').forEach(pane => {
        pane.style.display = pane.id === targetPaneId ? 'block' : 'none';
      });
      const errEl = document.getElementById('auth-error-msg');
      if (errEl) errEl.style.display = 'none';
    });
  });

  // Handle auto-return with token in query (?token=...)
  handleUrlToken(onAuthSuccess, showToast);

  // Variant 1: Password login
  if (btnSubmit) {
    btnSubmit.addEventListener('click', () => handlePasswordLogin(onAuthSuccess, showToast));
  }

  // Variant 2: Web login (rkf.online in WebView2)
  if (btnWebLogin) {
    btnWebLogin.addEventListener('click', () => handleWebLogin(showToast));
  }

  // Variant 3: Direct API token input
  if (btnTokenSubmit) {
    btnTokenSubmit.addEventListener('click', () => handleTokenSubmit(onAuthSuccess, showToast));
  }

  // Logout handler
  if (btnLogout) {
    btnLogout.addEventListener('click', () => handleLogout(onAuthSuccess, showToast));
  }
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

      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      if (typeof showToast === 'function') {
        showToast('Авторизация через сайт РКФ успешно сохранена');
      }
      if (typeof onAuthSuccess === 'function') {
        onAuthSuccess(token);
      }
    }
  } catch (e) {}
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
      const msg = data.error || data.message || 'Неверный E-mail или пароль в РКФ';
      showError(errEl, msg);
    }
  } catch (err) {
    showError(errEl, 'Ошибка подключения к локальному сервису авторизации');
  } finally {
    if (submitText) submitText.innerText = 'Войти по паролю';
  }
}

async function handleWebLogin(showToast) {
  try {
    const res = await fetch('/api/desktop/auth/start-web-login');
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.ok) {
      closeAuthModal();
      if (typeof showToast === 'function') {
        showToast('Открытие формы входа на официальном сайте rkf.online...');
      }
    } else {
      window.open('https://rkf.online/login', '_blank');
      closeAuthModal();
      if (typeof showToast === 'function') {
        showToast('Открыт сайт rkf.online. Скопируйте токен после входа.');
      }
    }
  } catch (err) {
    window.open('https://rkf.online/login', '_blank');
    closeAuthModal();
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
  try {
    await fetch('/api/desktop/auth/logout').catch(() => {});
  } catch (e) {}

  localStorage.removeItem('cs_rkf_token');
  localStorage.removeItem('cs_rkf_user_email');
  closeAuthModal();
  if (typeof showToast === 'function') showToast('Вы вышли из личного кабинета РКФ');
  if (typeof onAuthSuccess === 'function') onAuthSuccess(null);
}

function showError(el, message) {
  if (el) {
    el.innerText = message;
    el.style.display = 'block';
  }
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
  const modal = document.getElementById('auth-modal');
  if (modal) modal.style.display = 'none';
}
