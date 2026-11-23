// Authentication Controller for RKF Online (Email + Password)
export function initAuth(onAuthSuccess, showToast) {
  const btnAuth = document.getElementById('btn-auth');
  const btnClose = document.getElementById('btn-close-auth-modal');
  const btnSubmit = document.getElementById('btn-login-submit');
  const btnLogout = document.getElementById('btn-logout-web');

  if (btnAuth) btnAuth.addEventListener('click', openAuthModal);
  if (btnClose) btnClose.addEventListener('click', closeAuthModal);

  if (btnSubmit) {
    btnSubmit.addEventListener('click', async () => {
      const email = (document.getElementById('auth-email')?.value || '').trim();
      const password = (document.getElementById('auth-password')?.value || '').trim();
      const errEl = document.getElementById('auth-error-msg');
      const submitText = document.getElementById('btn-login-text');

      if (!email || !password) {
        if (errEl) {
          errEl.innerText = 'Укажите E-mail и пароль';
          errEl.style.display = 'block';
        }
        return;
      }

      if (errEl) errEl.style.display = 'none';
      if (submitText) submitText.innerText = 'Вход...';

      try {
        const res = await fetch('/api/rkf/administration/authentication/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mail: email, password: password })
        });

        const data = await res.json().catch(() => ({}));

        if (res.ok && (data.apikey || data.token || data.result?.apikey)) {
          const token = data.apikey || data.token || data.result?.apikey;
          localStorage.setItem('cs_rkf_token', token);
          localStorage.setItem('cs_rkf_user_email', email);
          closeAuthModal();
          showToast('Успешная авторизация в РКФ Онлайн');
          if (typeof onAuthSuccess === 'function') onAuthSuccess(token);
        } else {
          const msg = data.errors?.error || data.message || 'Неверный E-mail или пароль в РКФ';
          if (errEl) {
            errEl.innerText = msg;
            errEl.style.display = 'block';
          }
        }
      } catch (err) {
        if (errEl) {
          errEl.innerText = 'Сетевая ошибка при обращении к серверу РКФ';
          errEl.style.display = 'block';
        }
      } finally {
        if (submitText) submitText.innerText = 'Войти в личный кабинет';
      }
    });
  }

  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      localStorage.removeItem('cs_rkf_token');
      localStorage.removeItem('cs_rkf_user_email');
      closeAuthModal();
      showToast('Вы вышли из личного кабинета РКФ');
      if (typeof onAuthSuccess === 'function') onAuthSuccess(null);
    });
  }
}

export function openAuthModal() {
  const modal = document.getElementById('auth-modal');
  const token = localStorage.getItem('cs_rkf_token');
  const userEmail = localStorage.getItem('cs_rkf_user_email');

  const formSection = document.getElementById('auth-form-section');
  const loggedSection = document.getElementById('auth-logged-section');
  const loggedEmail = document.getElementById('logged-user-email');

  if (token) {
    if (formSection) formSection.style.display = 'none';
    if (loggedSection) loggedSection.style.display = 'block';
    if (loggedEmail) loggedEmail.innerText = userEmail || 'Аккаунт подключен';
  } else {
    if (formSection) formSection.style.display = 'block';
    if (loggedSection) loggedSection.style.display = 'none';
  }

  if (modal) modal.style.display = 'flex';
}

export function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) modal.style.display = 'none';
}
