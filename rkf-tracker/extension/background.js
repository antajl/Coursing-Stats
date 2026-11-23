// CoursingStats RKF Tracker — Background Service Worker (Manifest V3)

const ALARM_NAME = 'rkf_check_alarm';
const DEFAULT_INTERVAL_MINUTES = 60;

// Setup alarm on extension install / update
chrome.runtime.onInstalled.addListener(async () => {
  const store = await chrome.storage.local.get(['pref_interval', 'pref_notify', 'pref_sound']);
  const interval = store.pref_interval ? parseInt(store.pref_interval, 10) : DEFAULT_INTERVAL_MINUTES;
  const prefNotify = store.pref_notify !== undefined ? store.pref_notify : true;
  const prefSound = store.prefSound !== undefined ? store.pref_sound : true;

  await chrome.storage.local.set({
    pref_interval: interval,
    pref_notify: prefNotify,
    pref_sound: prefSound
  });

  setupPeriodicAlarm(interval);
});

// Re-register alarm on browser startup
chrome.runtime.onStartup.addListener(async () => {
  const { pref_interval } = await chrome.storage.local.get('pref_interval');
  const interval = pref_interval ? parseInt(pref_interval, 10) : DEFAULT_INTERVAL_MINUTES;
  setupPeriodicAlarm(interval);
});

// Listen to preference changes (e.g. user changes interval in popup)
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.pref_interval) {
    const newInterval = parseInt(changes.pref_interval.newValue, 10) || DEFAULT_INTERVAL_MINUTES;
    setupPeriodicAlarm(newInterval);
  }
});

function setupPeriodicAlarm(intervalMinutes) {
  if (intervalMinutes <= 0) {
    chrome.alarms.clear(ALARM_NAME);
    return;
  }
  const safeMinutes = Math.max(15, intervalMinutes);
  chrome.alarms.clear(ALARM_NAME, () => {
    chrome.alarms.create(ALARM_NAME, {
      periodInMinutes: safeMinutes,
      delayInMinutes: safeMinutes
    });
  });
}

// Alarm Trigger: Background check
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== ALARM_NAME) return;

  const store = await chrome.storage.local.get([
    'rkfToken',
    'profileId',
    'userUuid',
    'cached_apps',
    'pref_notify',
    'pref_sound',
    'rkf_received_docs'
  ]);

  if (!store.rkfToken) return; // User is logged out

  try {
    await performBackgroundCheck(store);
  } catch (err) {
    console.warn('[RKF Background Check] Error during check:', err);
  }
});

async function performBackgroundCheck(store) {
  const cleanToken = String(store.rkfToken || '').replace(/^["']|["']$/g, '').replace(/^Bearer\s+/i, '').trim();
  const headers = {
    authorization: `Bearer ${cleanToken}`,
    accept: 'application/json'
  };

  // Ping check auth
  const ping = await fetch('https://rkf.online/api/article/articles_feed_counters', { headers });
  if (ping.status === 401 || ping.status === 403) {
    console.warn('[RKF Background] Auth expired');
    return;
  }

  // Parallel fetch notifications & metadata
  const [feed6, feed9, ownerDocsRes, healthDocsRes] = await Promise.all([
    fetchFeedBackground(6, headers),
    fetchFeedBackground(9, headers),
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
  const receivedMap = store.rkf_received_docs || {};

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

  // Fallback to register_of_requests if no notification feed items
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

  // Clean and determine current status
  for (const app of Object.values(applications)) {
    const seen = new Set();
    const cleanHist = [];
    for (const h of app.history) {
      const key = `${h.date}_${h.status}`;
      if (!seen.has(key)) { seen.add(key); cleanHist.push(h); }
    }
    cleanHist.sort((a, b) => new Date(a.date) - new Date(b.date));
    app.history = cleanHist;
    app.currentStatus = cleanHist[cleanHist.length - 1]?.status || 'Неизвестно';
    app.lastUpdated = cleanHist[cleanHist.length - 1]?.date || new Date().toISOString();
    app.statusGroup = determineStatusGroup(app.currentStatus);
    app.isReceived = !!receivedMap[app.barcode];
  }

  const oldApps = store.cached_apps || [];
  const oldMap = new Map(oldApps.map(a => [a.barcode, a]));

  // Status difference detection
  const notifyEnabled = store.pref_notify !== false;
  const soundEnabled = store.pref_sound !== false;

  for (const newApp of Object.values(applications)) {
    const prev = oldMap.get(newApp.barcode);
    if (prev && prev.currentStatus && prev.currentStatus !== newApp.currentStatus) {
      // Status has progressed or changed!
      if (notifyEnabled) {
        showStatusNotification(newApp, prev.currentStatus, soundEnabled);
      }
    }
  }

  // Update storage cache
  const sortedApps = Object.values(applications);
  await chrome.storage.local.set({
    cached_apps: sortedApps,
    cached_time: new Date().toISOString()
  });
}

function showStatusNotification(app, prevStatus, soundEnabled) {
  const dog = formatDogName(app.dogName) || 'Собака';
  const doc = formatDocTitle(app.documentName) || 'Заявка РКФ';
  const newStatus = app.currentStatus;

  chrome.notifications.create(`rkf_status_${app.barcode}_${Date.now()}`, {
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: `Статус изменен: ${newStatus}`,
    message: `${dog} • ${doc}\n(Ранее: ${prevStatus})`,
    priority: 2,
    silent: !soundEnabled
  });
}

// Click on notification opens the tracker dashboard
chrome.notifications.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL('popup.html?mode=tab') });
});

async function fetchFeedBackground(filterType, headers) {
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

function determineStatusGroup(status) {
  const s = (status || '').toLowerCase();
  if (s.includes('изготовлен') || s.includes('выдан') || s.includes('выполнен')) return 'ready';
  if (s.includes('отклон') || s.includes('отказ')) return 'rejected';
  return 'active';
}

const CYNOLOGICAL_ACRONYMS = new Set([
  'РКФ', 'РК', 'ФЦИ', 'FCI', 'ЧРКФ', 'ЮЧРКФ', 'ВЧРКФ', 'ЧР', 'ЮЧР', 'ВЧР',
  'ГЧР', 'ГЧРКФ', 'ЧФ', 'ЮЧФ', 'КЧК', 'ЮКЧК', 'СС', 'ЮСС', 'CAC', 'CACIB',
  'CACL', 'RCAC', 'RCACIB', 'RCACL', 'BIS', 'JBIS', 'VBIS', 'BIG', 'BOB',
  'BOS', 'BJ', 'BV', 'CW', 'ЛПП', 'ЛЮ', 'ЛВ', 'ЛЩ', 'ЛБ', 'ПК'
]);

const LOWERCASE_PARTICLES = new Set([
  'по', 'в', 'и', 'на', 'с', 'со', 'для', 'из', 'от', 'до', 'де', 'дэ', 'ла', 'ле', 'аль', 'эль', 'ван', 'дер', 'фон'
]);

function formatDogName(name) {
  if (!name) return '';
  return name.trim().split(/\s+/).map((word, idx) => {
    return word.split('-').map(part => {
      const clean = part.toLowerCase();
      if (idx > 0 && (clean === 'дэ' || clean === 'аль' || clean === 'де')) {
        return clean.charAt(0).toUpperCase() + clean.slice(1);
      }
      return clean.charAt(0).toUpperCase() + clean.slice(1);
    }).join('-');
  }).join(' ');
}

function formatDocTitle(title) {
  if (!title) return '';
  return title.split(/\s+/).map((word, idx) => {
    const raw = word.replace(/[(),]/g, '');
    const up = raw.toUpperCase();
    if (CYNOLOGICAL_ACRONYMS.has(up)) {
      return word.toUpperCase();
    }
    const low = raw.toLowerCase();
    if (idx > 0 && LOWERCASE_PARTICLES.has(low)) {
      return word.toLowerCase();
    }
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');
}
