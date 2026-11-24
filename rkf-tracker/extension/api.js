// RKF Online API Client (ES Module)

export function determineStatusGroup(status) {
  const s = (status || '').toLowerCase();
  if (s.includes('изготовлен') || s.includes('выдан') || s.includes('выполнен') || s.includes('готов')) return 'ready';
  if (s.includes('отклон') || s.includes('отказ')) return 'rejected';
  return 'active';
}

export async function checkAuthFromTabs() {
  try {
    const tabs = await chrome.tabs.query({
      url: [
        'https://rkf.online/*',
        'https://*.rkf.online/*',
        '*://rkf.online/*',
        '*://*.rkf.online/*'
      ]
    });

    if (tabs && tabs.length > 0) {
      for (const tab of tabs) {
        try {
          let res = null;
          try {
            res = await chrome.tabs.sendMessage(tab.id, { type: 'GET_RKF_AUTH' });
          } catch (_) {
            await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              files: ['content.js']
            });
            res = await chrome.tabs.sendMessage(tab.id, { type: 'GET_RKF_AUTH' });
          }

          if (res && res.apikey) {
            const cleanKey = String(res.apikey).replace(/^["']|["']$/g, '').replace(/^Bearer\s+/i, '').trim();
            await chrome.storage.local.set({
              rkfToken: cleanKey,
              profileId: res.profileId || '',
              userUuid: res.userUuid || ''
            });
            return {
              rkfToken: cleanKey,
              profileId: res.profileId || '',
              userUuid: res.userUuid || ''
            };
          }
        } catch (e) {
          console.warn('[API] Read auth from tab failed:', e);
        }
      }
    }
  } catch (err) {
    console.error('[API] checkAuthFromTabs error:', err);
  }
  return null;
}

export async function fetchFeed(filterType, headers) {
  let all = [];
  let page = 1;
  while (true) {
    try {
      const res = await fetch(`https://rkf.online/api/article/articles_feed?start_element=${page}&size=50&filter_type=${filterType}`, { headers });
      if (!res.ok) break;
      const d = await res.json();
      const list = d.result?.articles || [];
      if (!list.length) break;
      all = all.concat(list);
      if (all.length >= (d.result?.articles_count || 0)) break;
      page += list.length;
    } catch (_) {
      break;
    }
  }
  return all;
}

export async function fetchAppsData(token, profileId, userUuid, receivedMap = {}) {
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
    fetch('https://rkf.online/api/requests/get_rkf_document_request/ownergetrkfdocumentrequest/register_of_requests', { headers }).then(r => r.json()).catch(() => ({})),
    fetch('https://rkf.online/api/requests/dog_health_check_request/ownerdoghealthcheckrequest/register_of_requests', {
      method: 'POST',
      headers: { ...headers, 'content-type': 'application/json' },
      body: JSON.stringify({ type_id: 1 })
    }).then(r => r.json()).catch(() => ({}))
  ]);

  const metaMap = {};
  for (const doc of (ownerDocsRes.result || [])) {
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
  for (const doc of (healthDocsRes.result || [])) {
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
  const applications = {};

  for (const item of allNotifications) {
    const content = item.content || item.title || '';
    const numMatch = content.match(/№\s*(\d+)/) || (item.redirect_link && item.redirect_link.match(/barcode=(\d+)/));
    if (!numMatch) continue;
    const barcode = numMatch[1];
    const statusMatch = content.match(/присвоен статус "(.*?)"/) || content.match(/статус:?\s*"(.*?)"/);
    const status = statusMatch ? statusMatch[1] : null;

    if (!applications[barcode]) {
      const m = metaMap[barcode] || {};
      let docName = m.documentName;
      if (!docName) {
        if (content.includes('дисплази')) docName = 'Проверка на дисплазию';
        else docName = 'Оформление титула';
      }

      applications[barcode] = {
        barcode,
        dogName: m.dogName || '',
        documentName: docName,
        pedigreeNumber: m.pedigreeNumber || '',
        history: []
      };
    }

    if (status) {
      applications[barcode].history.push({ date: item.create_date, status });
    }
  }

  if (Object.keys(applications).length === 0 && Object.keys(metaMap).length > 0) {
    for (const [barcode, m] of Object.entries(metaMap)) {
      applications[barcode] = {
        barcode,
        dogName: m.dogName || '',
        documentName: m.documentName || 'Заявка РКФ',
        pedigreeNumber: m.pedigreeNumber || '',
        history: [{ date: m.date || new Date().toISOString(), status: m.status || 'В обработке' }]
      };
    }
  }

  for (const app of Object.values(applications)) {
    const seen = new Set();
    const cleanHist = [];
    for (const h of app.history) {
      const key = `${h.date}_${h.status}`;
      if (!seen.has(key)) { seen.add(key); cleanHist.push(h); }
    }
    cleanHist.sort((a, b) => new Date(a.date) - new Date(b.date));
    app.history = cleanHist;
    const metaFallback = metaMap[app.barcode] || {};
    app.currentStatus = cleanHist[cleanHist.length - 1]?.status || metaFallback.status || 'В обработке';
    app.lastUpdated = cleanHist[cleanHist.length - 1]?.date || metaFallback.date || new Date().toISOString();
    app.statusGroup = determineStatusGroup(app.currentStatus);
    app.isReceived = !!receivedMap[app.barcode];
  }

  return Object.values(applications).sort((a, b) => {
    const getWeight = (x) => {
      if (x.statusGroup === 'active') return 1;
      if (x.statusGroup === 'ready' && !x.isReceived) return 2;
      if (x.statusGroup === 'rejected') return 3;
      return 4;
    };
    const wa = getWeight(a);
    const wb = getWeight(b);
    if (wa !== wb) return wa - wb;
    return new Date(b.lastUpdated) - new Date(a.lastUpdated);
  });
}
