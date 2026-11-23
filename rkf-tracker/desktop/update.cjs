const fs = require('fs');
const path = require('path');
let config = {};
try {
  config = require('./config.json');
} catch (e) {
  try {
    config = require('./config.example.json');
  } catch (_) {}
}
const { renderHtml } = require('./render.cjs');

const HEADERS = {
  authorization: `Bearer ${config.token}`,
  accept: 'application/json',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
};

async function checkAuthAndConnectivity() {
  let res;
  try {
    res = await fetch('https://rkf.online/api/article/articles_feed_counters', {
      headers: HEADERS
    });
  } catch (err) {
    throw new Error('Нет связи с сервером rkf.online (проверьте интернет или сайт РКФ временно недоступен).');
  }

  if (res.status === 401 || res.status === 403) {
    throw new Error('AUTH_EXPIRED: Сессия в РКФ Онлайн истекла. Требуется обновить токен доступа.');
  }

  if (!res.ok) {
    throw new Error(`Ошибка сервера RKF.Online: HTTP ${res.status}`);
  }

  return true;
}

async function fetchFeed(filterType) {
  let allArticles = [];
  let page = 1;
  while (true) {
    const res = await fetch(`https://rkf.online/api/article/articles_feed?start_element=${page}&size=50&filter_type=${filterType}`, {
      headers: HEADERS
    });
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        throw new Error('AUTH_EXPIRED: Сессия в РКФ Онлайн истекла.');
      }
      break;
    }
    const data = await res.json();
    const articles = data.result?.articles || [];
    if (articles.length === 0) break;
    allArticles = allArticles.concat(articles);
    if (allArticles.length >= (data.result?.articles_count || 0)) break;
    page += articles.length;
  }
  return allArticles;
}

async function fetchMetadataMaps() {
  const metaMap = {};
  try {
    const [ownerRes, healthRes] = await Promise.all([
      fetch('https://rkf.online/api/requests/get_rkf_document_request/ownergetrkfdocumentrequest/register_of_requests', { headers: HEADERS }).then(r => r.json()).catch(() => ({})),
      fetch('https://rkf.online/api/requests/dog_health_check_request/ownerdoghealthcheckrequest/register_of_requests', {
        method: 'POST', headers: { ...HEADERS, 'content-type': 'application/json' }, body: JSON.stringify({ type_id: 1 })
      }).then(r => r.json()).catch(() => ({}))
    ]);

    for (const doc of (ownerRes.result || [])) {
      if (doc.barcode) {
        metaMap[doc.barcode] = {
          dogName: doc.dog_name || '',
          documentName: doc.document_short_name || 'Документ РКФ',
          pedigreeNumber: doc.pedigree_number || ''
        };
      }
    }

    for (const doc of (healthRes.result || [])) {
      if (doc.barcode) {
        metaMap[doc.barcode] = {
          dogName: doc.dog_name || '',
          documentName: doc.type_name || 'Проверка на дисплазию',
          pedigreeNumber: doc.pedigree_number || ''
        };
      }
    }
  } catch (e) {
    console.error('Ошибка получения метаданных:', e.message);
  }
  return metaMap;
}

function determineStatusGroup(status) {
  const s = (status || '').toLowerCase();
  if (s.includes('изготовлен') || s.includes('выдан') || s.includes('выполнен')) return 'ready';
  if (s.includes('отклон') || s.includes('отказ')) return 'rejected';
  return 'active';
}

function loadReceivedMap() {
  const p = path.join(__dirname, 'received.json');
  if (fs.existsSync(p)) {
    try { return JSON.parse(fs.readFileSync(p, 'utf-8')); } catch (e) {}
  }
  return {};
}

function saveReceivedMap(map) {
  const p = path.join(__dirname, 'received.json');
  fs.writeFileSync(p, JSON.stringify(map, null, 2), 'utf-8');
}

async function runUpdate() {
  console.log(`[${new Date().toLocaleTimeString()}] Проверка связи и токена РКФ...`);

  // 1. First ensure session is valid and site is reachable
  await checkAuthAndConnectivity();

  // 2. Fetch notifications feed & registry metadata
  const [unreadFeed, archiveFeed, metaMap] = await Promise.all([
    fetchFeed(6),
    fetchFeed(9),
    fetchMetadataMaps()
  ]);

  const allNotifications = [...unreadFeed, ...archiveFeed];
  const applications = {};
  const receivedMap = loadReceivedMap();

  for (const item of allNotifications) {
    const content = item.content || item.title || '';
    const numMatch = content.match(/№\s*(\d+)/) || (item.redirect_link && item.redirect_link.match(/barcode=(\d+)/));
    if (!numMatch) continue;
    const barcode = numMatch[1];

    const statusMatch = content.match(/присвоен статус "(.*?)"/) || content.match(/статус:?\s*"(.*?)"/);
    const status = statusMatch ? statusMatch[1] : null;

    if (!applications[barcode]) {
      const meta = metaMap[barcode] || {};
      let docName = meta.documentName;
      if (!docName) {
        if (content.includes('дисплази')) docName = 'Проверка на дисплазию';
        else docName = 'Оформление титула';
      }

      applications[barcode] = {
        barcode,
        dogName: meta.dogName || '',
        documentName: docName,
        pedigreeNumber: meta.pedigreeNumber || '',
        history: []
      };
    }

    if (status) {
      applications[barcode].history.push({
        date: item.create_date,
        status
      });
    }
  }

  // Finalize history, current status and pickup state
  for (const app of Object.values(applications)) {
    const seen = new Set();
    const cleanHist = [];
    for (const h of app.history) {
      const key = `${h.date}_${h.status}`;
      if (!seen.has(key)) {
        seen.add(key);
        cleanHist.push(h);
      }
    }
    cleanHist.sort((a, b) => new Date(a.date) - new Date(b.date));
    app.history = cleanHist;
    app.currentStatus = cleanHist[cleanHist.length - 1]?.status || 'Неизвестно';
    app.lastUpdated = cleanHist[cleanHist.length - 1]?.date || new Date().toISOString();
    app.statusGroup = determineStatusGroup(app.currentStatus);

    app.isReceived = !!receivedMap[app.barcode];
    app.receivedAt = receivedMap[app.barcode] || null;
  }

  // Sort: active applications first, then ready, then collected
  const sortedApps = Object.values(applications).sort((a, b) => {
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

  const meta = {
    profileId: config.profileId,
    userUuid: config.userUuid,
    lastUpdated: new Date().toISOString()
  };

  const html = renderHtml(sortedApps, meta);

  fs.writeFileSync(config.desktopHtmlPath, html, 'utf-8');
  fs.writeFileSync(path.join(__dirname, 'index.html'), html, 'utf-8');

  console.log(`Успешно обновлено: ровно ${sortedApps.length} актуальных заявок.`);
  return { sortedApps, meta };
}

function setReceivedStatus(barcode, isReceived) {
  const map = loadReceivedMap();
  if (isReceived) {
    map[barcode] = new Date().toISOString();
  } else {
    delete map[barcode];
  }
  saveReceivedMap(map);
  return map;
}

if (require.main === module) {
  runUpdate().catch(err => {
    console.error('Ошибка:', err.message);
    process.exit(1);
  });
}

module.exports = { runUpdate, setReceivedStatus, loadReceivedMap };
