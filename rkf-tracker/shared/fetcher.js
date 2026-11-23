// In-Memory Streaming Fetcher for info.rkf.online Excel Attachments

const DEFAULT_ARTICLE_URL = 'https://info.rkf.online/article/fb2b53ca-bdf2-5e35-bea2-2e973592e2d7';

export async function fetchCalendarBytes(targetUrl = DEFAULT_ARTICLE_URL, options = {}) {
  // If targetUrl is an attachment link (.xlsx or /attachment/)
  if (targetUrl.includes('/attachment/') || targetUrl.endsWith('.xlsx')) {
    const res = await fetch(targetUrl, {
      headers: { 'User-Agent': 'CoursingStats-Tracker/1.0' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to download attachment`);
    return await res.arrayBuffer();
  }

  // Otherwise, fetch HTML page and discover the first "Национальные сертификатные состязания" link
  const pageRes = await fetch(targetUrl, {
    headers: { 'User-Agent': 'CoursingStats-Tracker/1.0' }
  });
  if (!pageRes.ok) throw new Error(`HTTP ${pageRes.status}: Failed to load article page`);

  const html = await pageRes.text();
  const attachmentUrl = extractFirstAttachmentUrl(html);

  if (!attachmentUrl) {
    throw new Error('Attachment URL not found on article page');
  }

  const fileRes = await fetch(attachmentUrl, {
    headers: { 'User-Agent': 'CoursingStats-Tracker/1.0' }
  });
  if (!fileRes.ok) throw new Error(`HTTP ${fileRes.status}: Failed to stream attachment`);

  return await fileRes.arrayBuffer();
}

export function extractFirstAttachmentUrl(html) {
  // Looks for /attachment/<uuid> links
  const match = html.match(/\/attachment\/[a-zA-Z0-9_-]+/);
  if (match) {
    return 'https://info.rkf.online' + match[0];
  }
  return null;
}
