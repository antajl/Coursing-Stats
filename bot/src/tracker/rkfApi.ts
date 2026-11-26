import type { ApplicationItem, StatusGroup } from './types';

function cleanToken(token: string): string {
  return String(token || '').replace(/^["']|["']$/g, '').replace(/^Bearer\s+/i, '').trim();
}

export function determineStatusGroup(status: string): StatusGroup {
  const s = (status || '').toLowerCase();
  if (
    s.includes('выдач') ||
    s.includes('готов') ||
    s.includes('передан') ||
    s.includes('оформлен') ||
    s.includes('выполнено')
  ) {
    return 'ready';
  }
  if (s.includes('отклон') || s.includes('отказ') || s.includes('аннулир')) {
    return 'rejected';
  }
  return 'active';
}

async function fetchFeed(feedType: number, headers: Record<string, string>): Promise<any[]> {
  try {
    const res = await fetch(
      `https://rkf.online/api/article/articles_feed?type_id=${feedType}&page=1&limit=50`,
      { headers },
    );
    if (!res.ok) return [];
    const data = (await res.json()) as { result?: any[] };
    return Array.isArray(data?.result) ? data.result : [];
  } catch {
    return [];
  }
}

export async function validateRkfToken(token: string): Promise<boolean> {
  const clean = cleanToken(token);
  if (!clean) return false;
  try {
    const res = await fetch('https://rkf.online/api/article/articles_feed_counters', {
      headers: { authorization: `Bearer ${clean}`, accept: 'application/json' },
    });
    return res.status === 200;
  } catch {
    return false;
  }
}

export async function fetchRkfApplications(
  token: string,
  receivedBarcodes: string[] = [],
): Promise<ApplicationItem[]> {
  const clean = cleanToken(token);
  const headers = { authorization: `Bearer ${clean}`, accept: 'application/json' };

  const ping = await fetch('https://rkf.online/api/article/articles_feed_counters', { headers });
  if (ping.status === 401 || ping.status === 403) {
    throw new Error('AUTH_EXPIRED');
  }

  const [feed6, feed9, ownerDocsRes, healthDocsRes] = await Promise.all([
    fetchFeed(6, headers),
    fetchFeed(9, headers),
    fetch('https://rkf.online/api/requests/get_rkf_document_request/ownergetrkfdocumentrequest/register_of_requests', { headers })
      .then((r) => r.json())
      .catch(() => ({})),
    fetch('https://rkf.online/api/requests/dog_health_check_request/ownerdoghealthcheckrequest/register_of_requests', {
      method: 'POST',
      headers: { ...headers, 'content-type': 'application/json' },
      body: JSON.stringify({ type_id: 1 }),
    })
      .then((r) => r.json())
      .catch(() => ({})),
  ]);

  const metaMap: Record<string, any> = {};
  for (const doc of (ownerDocsRes as any).result || []) {
    if (doc.barcode) {
      metaMap[doc.barcode] = {
        dogName: doc.dog_name,
        documentName: doc.document_short_name,
        pedigreeNumber: doc.pedigree_number,
        status: doc.status_name,
        date: doc.date_change || doc.date_create,
      };
    }
  }
  for (const doc of (healthDocsRes as any).result || []) {
    if (doc.barcode) {
      metaMap[doc.barcode] = {
        dogName: doc.dog_name,
        documentName: doc.type_name || 'Проверка на дисплазию',
        pedigreeNumber: doc.pedigree_number,
        status: doc.status_name,
        date: doc.date_change || doc.date_create,
      };
    }
  }

  const apps: Record<string, ApplicationItem> = {};
  for (const item of [...feed6, ...feed9]) {
    const content = item.content || item.title || '';
    const numMatch = content.match(/№\s*(\d+)/) || item.redirect_link?.match(/barcode=(\d+)/);
    if (!numMatch) continue;
    const barcode = numMatch[1];
    const statusMatch = content.match(/присвоен статус "(.*?)"/) || content.match(/статус:?\s*"(.*?)"/);
    const status = statusMatch ? statusMatch[1] : null;

    if (!apps[barcode]) {
      const m = metaMap[barcode] || {};
      const docName =
        m.documentName || (content.includes('дисплази') ? 'Проверка на дисплазию' : 'Оформление титула');
      apps[barcode] = {
        barcode,
        dogName: m.dogName || '',
        documentName: docName,
        pedigreeNumber: m.pedigreeNumber || '',
        currentStatus: status || 'В обработке',
        lastUpdated: item.create_date || new Date().toISOString(),
        statusGroup: determineStatusGroup(status || 'В обработке'),
        isReceived: receivedBarcodes.includes(barcode),
        history: [],
      };
    }
    if (status) apps[barcode].history.push({ date: item.create_date, status });
  }

  if (Object.keys(apps).length === 0) {
    for (const [barcode, m] of Object.entries(metaMap)) {
      apps[barcode] = {
        barcode,
        dogName: m.dogName || '',
        documentName: m.documentName || 'Заявка РКФ',
        pedigreeNumber: m.pedigreeNumber || '',
        currentStatus: m.status || 'В обработке',
        lastUpdated: m.date || new Date().toISOString(),
        statusGroup: determineStatusGroup(m.status || ''),
        isReceived: receivedBarcodes.includes(barcode),
        history: m.status ? [{ date: m.date || '', status: m.status }] : [],
      };
    }
  }

  return Object.values(apps).sort(
    (a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime(),
  );
}
