// RKF Online API Client for Worker environment
import type { ApplicationItem, StatusGroup } from '../types.js';

export function determineStatusGroup(status: string): StatusGroup {
  const s = (status || '').toLowerCase();
  if (s.includes('изготовлен') || s.includes('выдан') || s.includes('выполнен') || s.includes('готов')) {
    return 'ready';
  }
  if (s.includes('отклон') || s.includes('отказ')) {
    return 'rejected';
  }
  return 'active';
}

async function fetchFeed(filterType: number, headers: Record<string, string>): Promise<any[]> {
  let all: any[] = [];
  let page = 1;
  let iterations = 0;
  const MAX_ITERATIONS = 10;
  while (iterations < MAX_ITERATIONS) {
    iterations++;
    try {
      const url = `https://rkf.online/api/article/articles_feed?start_element=${page}&size=50&filter_type=${filterType}`;
      const res = await fetch(url, { headers });
      if (!res.ok) break;
      const d: any = await res.json();
      const list = d.result?.articles || [];
      if (!list.length) break;
      all = all.concat(list);
      if (all.length >= (d.result?.articles_count || 0)) break;
      page += list.length;
    } catch {
      break;
    }
  }
  return all;
}

export async function authenticateRkfUser(
  email: string,
  password: string
): Promise<{ ok: boolean; apikey?: string; error?: string }> {
  try {
    const res = await fetch('https://rkf.online/api/Authentication', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'accept': 'application/json',
        'origin': 'https://rkf.online',
        'referer': 'https://rkf.online/login',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: JSON.stringify({
        email: email.trim(),
        password: password.trim(),
        is_remember_me: true
      })
    });

    const data: any = await res.json().catch(() => ({}));
    if (res.status === 200 && (data.result?.apikey || data.apikey)) {
      return { ok: true, apikey: data.result?.apikey || data.apikey };
    }

    const err =
      data.errors?.authentication ||
      data.errors?.error ||
      data.message ||
      'Неверная почта или пароль на rkf.online';
    return { ok: false, error: err };
  } catch {
    return { ok: false, error: 'Сетевая ошибка при обращении к серверу РКФ' };
  }
}

export async function validateRkfToken(token: string): Promise<boolean> {
  const clean = String(token || '').replace(/^["']|["']$/g, '').replace(/^Bearer\s+/i, '').trim();
  if (!clean || clean.length < 10) return false;
  try {
    const res = await fetch('https://rkf.online/api/article/articles_feed_counters', {
      headers: {
        authorization: `Bearer ${clean}`,
        accept: 'application/json'
      }
    });
    return res.status === 200;
  } catch {
    return false;
  }
}

export async function fetchRkfApplications(
  token: string,
  receivedBarcodes: string[] = []
): Promise<ApplicationItem[]> {
  const cleanToken = String(token || '').replace(/^["']|["']$/g, '').replace(/^Bearer\s+/i, '').trim();
  const headers = {
    authorization: `Bearer ${cleanToken}`,
    accept: 'application/json'
  };

  const ping = await fetch('https://rkf.online/api/article/articles_feed_counters', { headers });
  if (ping.status === 401 || ping.status === 403) {
    throw new Error('AUTH_EXPIRED');
  }

  const [feed6, feed9, ownerDocsRes, healthDocsRes] = await Promise.all([
    fetchFeed(6, headers),
    fetchFeed(9, headers),
    fetch('https://rkf.online/api/requests/get_rkf_document_request/ownergetrkfdocumentrequest/register_of_requests', { headers })
      .then(r => r.json())
      .catch(() => ({})),
    fetch('https://rkf.online/api/requests/dog_health_check_request/ownerdoghealthcheckrequest/register_of_requests', {
      method: 'POST',
      headers: { ...headers, 'content-type': 'application/json' },
      body: JSON.stringify({ type_id: 1 })
    })
      .then(r => r.json())
      .catch(() => ({}))
  ]);

  const metaMap: Record<string, any> = {};
  for (const doc of ((ownerDocsRes as any).result || [])) {
    if (doc.barcode) {
      metaMap[doc.barcode] = {
        dogName: doc.dog_name,
        documentName: doc.document_short_name,
        pedigreeNumber: doc.pedigree_number,
        status: doc.status_name,
        date: doc.date_change || doc.date_create
      };
    }
  }

  for (const doc of ((healthDocsRes as any).result || [])) {
    if (doc.barcode) {
      metaMap[doc.barcode] = {
        dogName: doc.dog_name,
        documentName: doc.type_name || 'Проверка на дисплазию',
        pedigreeNumber: doc.pedigree_number,
        status: doc.status_name,
        date: doc.date_change || doc.date_create
      };
    }
  }

  const allNotifications = [...feed6, ...feed9];
  const apps: Record<string, ApplicationItem> = {};

  for (const item of allNotifications) {
    const content = item.content || item.title || '';
    const numMatch = content.match(/№\s*(\d+)/) || (item.redirect_link && item.redirect_link.match(/barcode=(\d+)/));
    if (!numMatch) continue;
    const barcode = numMatch[1];
    const statusMatch = content.match(/присвоен статус "(.*?)"/) || content.match(/статус:?\s*"(.*?)"/);
    const status = statusMatch ? statusMatch[1] : null;

    if (!apps[barcode]) {
      const m = metaMap[barcode] || {};
      let docName = m.documentName;
      if (!docName) {
        docName = content.includes('дисплази') ? 'Проверка на дисплазию' : 'Оформление титула';
      }
      apps[barcode] = {
        barcode,
        dogName: m.dogName || '',
        documentName: docName,
        pedigreeNumber: m.pedigreeNumber || '',
        currentStatus: status || 'В обработке',
        lastUpdated: item.create_date || new Date().toISOString(),
        statusGroup: determineStatusGroup(status || 'В обработке'),
        isReceived: receivedBarcodes.includes(barcode),
        history: []
      };
    }

    if (status) {
      apps[barcode].history.push({ date: item.create_date, status });
    }
  }

  if (Object.keys(apps).length === 0 && Object.keys(metaMap).length > 0) {
    for (const [barcode, m] of Object.entries(metaMap)) {
      apps[barcode] = {
        barcode,
        dogName: m.dogName || '',
        documentName: m.documentName || 'Заявка РКФ',
        pedigreeNumber: m.pedigreeNumber || '',
        currentStatus: m.status || 'В обработке',
        lastUpdated: m.date || new Date().toISOString(),
        statusGroup: determineStatusGroup(m.status || 'В обработке'),
        isReceived: receivedBarcodes.includes(barcode),
        history: [{ date: m.date || new Date().toISOString(), status: m.status || 'В обработке' }]
      };
    }
  }

  for (const app of Object.values(apps)) {
    const seen = new Set<string>();
    const cleanHist: any[] = [];
    for (const h of app.history) {
      const key = `${h.date}_${h.status}`;
      if (!seen.has(key)) {
        seen.add(key);
        cleanHist.push(h);
      }
    }
    cleanHist.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    app.history = cleanHist;
    if (cleanHist.length > 0) {
      app.currentStatus = cleanHist[cleanHist.length - 1].status;
      app.lastUpdated = cleanHist[cleanHist.length - 1].date;
    }
    app.statusGroup = determineStatusGroup(app.currentStatus);
    app.isReceived = receivedBarcodes.includes(app.barcode);
  }

  return Object.values(apps).sort((a, b) => {
    return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
  });
}
