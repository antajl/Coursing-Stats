import type { TrackerApplication, TrackerCompetition } from './trackerTypes';

export const TRACKER_WORKER_URL = 'https://coursing-stats-tracker-bot.antajltube.workers.dev';

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

export function getStoredUserUuid(): string {
  return localStorage.getItem('cs_rkf_user_uuid') || '';
}

export function getRkfApplicationUrl(barcode: string): string {
  const uuid = getStoredUserUuid();
  if (!uuid) {
    return 'https://rkf.online';
  }
  return `https://rkf.online/user/${uuid}/documents/application/registry?barcode=${encodeURIComponent(barcode)}`;
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

  // Route through the Cloudflare Worker auth proxy because rkf.online blocks browser CORS
  try {
    const res = await fetch(`${TRACKER_WORKER_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password: pass }),
    });
    const data = await res.json().catch(() => ({}));
    const token = data.apikey || data.token || data.result?.apikey || data.access_token;
    if (res.ok && token) {
      return { ok: true, token };
    }
    if (data.error) {
      return { ok: false, error: data.error };
    }
    if (res.status === 401 || res.status === 422 || res.status === 400) {
      return { ok: false, error: 'Неверная почта или пароль на rkf.online' };
    }
  } catch {
    return {
      ok: false,
      error:
        'Сетевая ошибка при обращении к серверу РКФ. Проверьте подключение к интернету или попробуйте позже.',
    };
  }

  return { ok: false, error: 'Неверный логин или пароль на rkf.online' };
}

export async function fetchTrackerApplications(token: string): Promise<{
  ok: boolean;
  applications?: TrackerApplication[];
  authExpired?: boolean;
  error?: string;
}> {
  try {
    const res = await fetch(`${TRACKER_WORKER_URL}/api/applications`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401 || data.error === 'AUTH_EXPIRED') {
      return { ok: false, authExpired: true, error: 'Срок действия сессии истек. Войдите заново.' };
    }
    if (res.ok && Array.isArray(data.applications)) {
      try {
        localStorage.setItem('cs_rkf_applications', JSON.stringify(data.applications));
        localStorage.setItem('cs_rkf_last_sync', String(Date.now()));
      } catch {}
      return { ok: true, applications: data.applications };
    }
    return { ok: false, error: data.error || 'Не удалось загрузить заявки из РКФ' };
  } catch {
    return { ok: false, error: 'Ошибка сети при загрузке заявок' };
  }
}

export async function fetchSyncedState(token: string): Promise<{
  receivedBarcodes: string[];
  subscribedCompetitions: string[];
} | null> {
  try {
    const res = await fetch(`${TRACKER_WORKER_URL}/api/sync`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.ok) return null;
    return {
      receivedBarcodes: Array.isArray(data.receivedBarcodes) ? data.receivedBarcodes : [],
      subscribedCompetitions: Array.isArray(data.subscribedCompetitions) ? data.subscribedCompetitions : [],
    };
  } catch {
    return null;
  }
}

export async function pushSyncedState(
  token: string,
  receivedBarcodes: string[],
  subscribedCompetitions: string[]
): Promise<void> {
  try {
    await fetch(`${TRACKER_WORKER_URL}/api/sync`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ receivedBarcodes, subscribedCompetitions }),
    });
  } catch {
    // Non-blocking background sync
  }
}

function isCalendarYearPayload(events: TrackerCompetition[], expectedYear: number): boolean {
  let matchingYearCount = 0;
  let otherYearCount = 0;
  for (const ev of events) {
    const match = String(ev.dateRaw || '').match(/\b(20\d{2})\b/);
    if (!match) continue;
    const year = Number(match[1]);
    if (year === expectedYear) matchingYearCount += 1;
    else otherYearCount += 1;
  }
  if (matchingYearCount + otherYearCount === 0) return true;
  // Reject snapshot if RKF overwrote the 2026 attachment with 2027 schedule
  return matchingYearCount > 0 && matchingYearCount >= otherYearCount;
}

export async function fetchLiveCompetitions(): Promise<{
  events: TrackerCompetition[];
  updatedAt: string | null;
} | null> {
  try {
    const res = await fetch(`${TRACKER_WORKER_URL}/api/competitions`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.ok || !Array.isArray(data.events) || data.events.length === 0) return null;
    const events = data.events as TrackerCompetition[];
    if (!isCalendarYearPayload(events, 2026)) {
      return null;
    }
    return {
      events,
      updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : null,
    };
  } catch {
    return null;
  }
}

