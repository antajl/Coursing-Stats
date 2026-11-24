export function getReceivedBarcodes(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem('cs_received_barcodes') || '[]'));
  } catch {
    return new Set();
  }
}

export function toggleReceivedBarcode(barcode: string): Set<string> {
  const current = getReceivedBarcodes();
  if (current.has(barcode)) {
    current.delete(barcode);
  } else {
    current.add(barcode);
  }
  localStorage.setItem('cs_received_barcodes', JSON.stringify(Array.from(current)));
  return current;
}

export function getSubscribedCompetitions(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem('cs_subscribed_competitions') || '[]'));
  } catch {
    return new Set();
  }
}

export function toggleSubscribedCompetition(id: string): Set<string> {
  const current = getSubscribedCompetitions();
  if (current.has(id)) {
    current.delete(id);
  } else {
    current.add(id);
  }
  localStorage.setItem('cs_subscribed_competitions', JSON.stringify(Array.from(current)));
  return current;
}

export function getStoredToken(): string | null {
  return localStorage.getItem('cs_rkf_token');
}

export function getStoredEmail(): string | null {
  return localStorage.getItem('cs_rkf_user_email');
}

export const DEFAULT_RKF_USER_UUID = 'f4ef4ce4cffe4e18b3fed35e2536d64b';

export function getStoredUserUuid(): string {
  return localStorage.getItem('cs_rkf_user_uuid') || DEFAULT_RKF_USER_UUID;
}

export function getRkfApplicationUrl(barcode: string): string {
  const uuid = getStoredUserUuid();
  return `https://rkf.online/user/${uuid}/documents/application/registry?barcode=${barcode}`;
}

export function setStoredAuth(token: string, email: string, userUuid?: string): void {
  localStorage.setItem('cs_rkf_token', token);
  localStorage.setItem('cs_rkf_user_email', email);
  if (userUuid) {
    localStorage.setItem('cs_rkf_user_uuid', userUuid);
  }
}

export function clearStoredAuth(): void {
  localStorage.removeItem('cs_rkf_token');
  localStorage.removeItem('cs_rkf_user_email');
  localStorage.removeItem('cs_rkf_user_uuid');
}

export async function authenticateRkf(
  email: string,
  pass: string
): Promise<{ ok: boolean; token?: string; error?: string }> {
  const cleanEmail = email.trim();
  const cleanPass = pass.trim();

  // 1. Direct POST to RKF Online
  try {
    const res = await fetch('https://rkf.online/api/Authentication', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email: cleanEmail,
        password: cleanPass,
        is_remember_me: true,
      }),
    });

    const data = await res.json().catch(() => ({}));
    const token = data.result?.apikey || data.apikey || data.access_token;
    if (res.ok && token) {
      return { ok: true, token };
    }

    if (res.status === 422 || res.status === 401 || res.status === 400) {
      const err =
        data.errors?.authentication ||
        data.errors?.error ||
        data.message ||
        'Неверная почта или пароль на rkf.online';
      return { ok: false, error: err };
    }
  } catch {
    // 2. Fallback to API proxy (Cloudflare Worker or Vite dev server) if direct CORS is blocked
    try {
      const fbRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPass }),
      });
      const fbData = await fbRes.json().catch(() => ({}));
      const fbToken = fbData.apikey || fbData.token;
      if (fbRes.ok && fbToken) {
        return { ok: true, token: fbToken };
      }
      if (fbData.error) {
        return { ok: false, error: fbData.error };
      }
    } catch {}

    return {
      ok: false,
      error:
        'Сетевая ошибка при обращении к серверу РКФ. Установите расширение браузера для входа в 1 клик.',
    };
  }

  return { ok: false, error: 'Неверный логин или пароль на rkf.online' };
}

