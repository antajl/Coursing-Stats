import fs from 'node:fs';
import path from 'node:path';
import type Database from 'better-sqlite3';
import { parseJudgeNames } from '../../src/lib/judge-names';
import { PUBLIC_DIR, SITE_BASE_URL, writeIndex } from './shared';

function xmlEscape(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function buildSitemap(db: Database.Database) {
  const dogs = db.prepare('SELECT id FROM dogs ORDER BY id').all() as { id: number }[];
  const judgeRows = db.prepare(`SELECT judges FROM events WHERE judges IS NOT NULL AND judges != ''`).all() as {
    judges: string;
  }[];
  const doninoDogs = db
    .prepare(
      `SELECT DISTINCT name, breed FROM (
         SELECT name, breed FROM speed_records WHERE name IS NOT NULL AND breed IS NOT NULL
         UNION
         SELECT name, breed FROM coursing_records WHERE name IS NOT NULL AND breed IS NOT NULL
       )`,
    )
    .all() as { name: string; breed: string }[];

  const judgeNames = new Set<string>();
  for (const row of judgeRows) {
    for (const name of parseJudgeNames(row.judges)) judgeNames.add(name);
  }

  writeIndex('sitemap-urls.json', {
    schema: 'coursing-stats/index-sitemap-v1',
    dogs: dogs.map((d) => `/dog/${d.id}`),
    events: [],
    judges: [...judgeNames].map((name) => `/judges/${encodeURIComponent(name)}`),
    donino_dogs: doninoDogs.map((d) => `/donino-dog/${encodeURIComponent(d.name)}/${encodeURIComponent(d.breed)}`),
  });

  const staticPages = [
    { loc: '/', priority: '1.0', changefreq: 'daily' },
    { loc: '/competitions', priority: '0.9', changefreq: 'daily' },
    { loc: '/top', priority: '0.8', changefreq: 'weekly' },
    { loc: '/judges', priority: '0.7', changefreq: 'weekly' },
    { loc: '/speed-records', priority: '0.8', changefreq: 'daily' },
    { loc: '/guide', priority: '0.6', changefreq: 'monthly' },
  ];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  for (const page of staticPages) {
    xml += '  <url>\n';
    xml += `    <loc>${SITE_BASE_URL}${page.loc}</loc>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += '  </url>\n';
  }

  for (const dog of dogs) {
    xml += '  <url>\n';
    xml += `    <loc>${SITE_BASE_URL}/dog/${dog.id}</loc>\n`;
    xml += '    <changefreq>monthly</changefreq>\n';
    xml += '    <priority>0.6</priority>\n';
    xml += '  </url>\n';
  }

  for (const name of judgeNames) {
    xml += '  <url>\n';
    xml += `    <loc>${SITE_BASE_URL}/judges/${encodeURIComponent(xmlEscape(name))}</loc>\n`;
    xml += '    <changefreq>monthly</changefreq>\n';
    xml += '    <priority>0.5</priority>\n';
    xml += '  </url>\n';
  }

  for (const doninoDog of doninoDogs) {
    const doninoPath = `/donino-dog/${encodeURIComponent(doninoDog.name)}/${encodeURIComponent(doninoDog.breed)}`;
    xml += '  <url>\n';
    xml += `    <loc>${SITE_BASE_URL}${xmlEscape(doninoPath)}</loc>\n`;
    xml += '    <changefreq>monthly</changefreq>\n';
    xml += '    <priority>0.5</priority>\n';
    xml += '  </url>\n';
  }

  xml += '</urlset>';

  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), xml, 'utf-8');
  console.log('  → frontend/public/sitemap.xml');
}
