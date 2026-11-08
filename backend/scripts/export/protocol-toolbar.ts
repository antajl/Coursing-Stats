import { TOOLBAR_CSS } from './protocol-styles.js';
import {
  CompetitionData,
  escapeHtml,
  buildEventTitle,
} from './protocol-shared.js';
import { toIsoDate } from '../seo/entities/event-seo.js';

function sanitizeDocUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const lower = trimmed.toLowerCase();
  if (lower.includes('web.archive.org') || lower.includes('procoursing.ru')) {
    return null;
  }
  return trimmed;
}

export function buildToolbarHtml(comp: CompetitionData): string {
  const eventId = comp.event_id || comp.event.id;
  const title = comp.event.title || buildEventTitle(comp);
  const pdfUrl = sanitizeDocUrl(comp.event.results_pdf_url);
  const catalogUrl = sanitizeDocUrl(comp.event.catalog_url);
  const rulesUrl = sanitizeDocUrl(comp.event.rules_url);

  const doninoSeries = [
    { id: '2026004', label: 'I этап (9 авг)', url: '/protocols/2026004.html' },
    { id: '2022001', label: 'II этап (20 сен)', url: '/protocols/2022001.html' },
    { id: '2026005', label: 'III этап (31 окт)', url: '/protocols/2026005.html' },
  ];
  const isDoninoSeries =
    doninoSeries.some(s => s.id === String(eventId)) ||
    (comp.event.host_club?.includes('Донино') && comp.event.competition_kind === 'Клубный чемпионат');

  return `
<header class="cs-toolbar">
  <div class="cs-toolbar-inner">
    <div class="cs-toolbar-left">
      <a href="/event/${eventId}" class="cs-btn cs-btn-back" title="Вернуться к состязанию на сайте">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        <span>К состязанию</span>
      </a>
      <span class="cs-toolbar-divider"></span>
      <span class="cs-toolbar-brand">CoursingStats</span>
      <span class="cs-toolbar-divider cs-title-divider"></span>
      <span class="cs-toolbar-title">${escapeHtml(title)}</span>
    </div>
    ${isDoninoSeries ? `
    <div class="cs-toolbar-series">
      <span class="cs-series-label">Серия Донино 2026:</span>
      <div class="cs-series-stages">
        ${doninoSeries.map(s => `
        <a href="${s.url}" class="cs-btn cs-btn-stage ${s.id === String(eventId) ? 'cs-stage-active' : ''}" title="${escapeHtml(s.label)}">${escapeHtml(s.label)}</a>
        `).join('')}
      </div>
    </div>` : ''}
    <div class="cs-toolbar-actions">
      ${isDoninoSeries ? `
      <a href="/donino/championship" class="cs-btn cs-btn-donino" title="Клубный чемпионат Донино: общий зачет и этапы">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.45 1-1 1H7.5c-.28 0-.5.22-.5.5v1c0 .28.22.5.5.5h9c.28 0 .5-.22.5-.5v-1c0-.28-.22-.5-.5-.5H15c-.55 0-1-.45-1-1v-2.34c3.2-1.07 5-3.5 5-6.66V3H5v5c0 3.16 1.8 5.59 5 6.66z"/></svg>
        <span>Чемпионат</span>
      </a>` : ''}
      ${pdfUrl ? `
      <a href="${escapeHtml(pdfUrl)}" target="_blank" rel="noopener noreferrer" class="cs-btn cs-btn-doc" title="PDF-файл протокола">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
        <span>PDF-файл</span>
      </a>` : ''}
      ${catalogUrl ? `
      <a href="${escapeHtml(catalogUrl)}" target="_blank" rel="noopener noreferrer" class="cs-btn cs-btn-doc" title="Каталог участников">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
        <span>Каталог</span>
      </a>` : ''}
      ${rulesUrl ? `
      <a href="${escapeHtml(rulesUrl)}" target="_blank" rel="noopener noreferrer" class="cs-btn cs-btn-doc" title="Регламент состязания">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
        <span>Регламент</span>
      </a>` : ''}
      <button onclick="window.print()" class="cs-btn cs-btn-primary" title="Печать или сохранение в PDF (Ctrl+P)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
        <span>Печать</span>
      </button>
    </div>
  </div>
</header>
`;
}

export function buildProtocolSeoHead(comp: CompetitionData): string {
  const eventId = comp.event_id || comp.event?.id || '';
  const eventTitle = comp.event?.full_title || comp.event?.title || comp.event?.name || 'Протокол состязания';
  const eventDate = comp.event?.date || comp.event?.date_start || '';
  const location = (comp.event?.location || '').trim();
  const hostClub = (comp.event?.host_club || '').trim();
  const count = comp.results ? comp.results.length : 0;
  const canonicalUrl = `https://coursing-stats.ru/protocols/${eventId}.html`;

  const descParts = [
    `Официальный протокол состязания: ${eventTitle}${eventDate ? ` (${eventDate})` : ''}`,
    location ? location : null,
    hostClub ? `Организатор: ${hostClub}` : null,
    count > 0 ? `${count} участников` : null,
    'Результаты забегов, баллы судей и сертификаты РКФ на портале Coursing Stats.'
  ].filter(Boolean);
  const description = descParts.join('. ');

  const startIso = toIsoDate(eventDate);
  const sportsEventSchema = startIso
    ? {
        '@context': 'https://schema.org',
        '@type': 'SportsEvent',
        name: eventTitle,
        startDate: startIso,
        ...(location ? { location: { '@type': 'Place', name: location } } : {}),
        ...(hostClub ? { organizer: { '@type': 'Organization', name: hostClub } } : {}),
        url: canonicalUrl
      }
    : {
        '@context': 'https://schema.org',
        '@type': 'ItemPage',
        name: eventTitle,
        description,
        url: canonicalUrl
      };

  return `  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${canonicalUrl}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escapeHtml(eventTitle)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="https://coursing-stats.ru/og-image.png">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:site_name" content="Coursing Stats">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(eventTitle)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="https://coursing-stats.ru/og-image.png">
  <script type="application/ld+json">
${JSON.stringify(sportsEventSchema, null, 2)}
  </script>`;
}

export function injectToolbar(html: string, comp: CompetitionData): string {
  if (html.includes('class="cs-toolbar"')) return html;

  let res = html;

  // 1. Inject SEO metadata, Canonical and SportsEvent Schema into <head>
  const headEndIdx = res.indexOf('</head>');
  if (headEndIdx !== -1 && !res.includes('rel="canonical"')) {
    const seoHead = buildProtocolSeoHead(comp);
    res = res.slice(0, headEndIdx) + seoHead + '\n' + res.slice(headEndIdx);
  }

  // 2. Inject toolbar CSS
  const styleIdx = res.lastIndexOf('</style>');
  if (styleIdx !== -1) {
    res = res.slice(0, styleIdx) + TOOLBAR_CSS + '\n  ' + res.slice(styleIdx);
  }

  // 3. Inject toolbar HTML
  const toolbarHtml = buildToolbarHtml(comp);
  const bodyIdx = res.indexOf('<body>');
  if (bodyIdx !== -1) {
    const afterBody = bodyIdx + '<body>'.length;
    res = res.slice(0, afterBody) + '\n' + toolbarHtml + '\n' + res.slice(afterBody);
  }

  return res;
}
