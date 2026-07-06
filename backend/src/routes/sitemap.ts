import { Hono } from 'hono';
import { parseJudgeNames } from '../lib/judge-names';

type Env = {
  DB: any;
  ADMIN_API_TOKEN: string;
};

export function handleSitemap(app: Hono<{ Bindings: Env }>) {
  app.get('/sitemap.xml', async (c) => {
    const db = c.env.DB;

    try {
      const dogs = await db.prepare('SELECT id FROM dogs').all();
      const events = await db.prepare('SELECT id, date_start FROM events').all();
      const judgeRows = await db
        .prepare(`SELECT judges FROM events WHERE judges IS NOT NULL AND judges != ''`)
        .all();
      const doninoDogs = await db.prepare(`
        SELECT DISTINCT name, breed FROM (
          SELECT name, breed FROM speed_records WHERE name IS NOT NULL AND breed IS NOT NULL
          UNION
          SELECT name, breed FROM coursing_records WHERE name IS NOT NULL AND breed IS NOT NULL
        )
      `).all();

      const judgeNames = new Set<string>();
      if (judgeRows.results) {
        for (const row of judgeRows.results) {
          for (const name of parseJudgeNames(row.judges)) {
            judgeNames.add(name);
          }
        }
      }

      const baseUrl = 'https://coursing-stats.ru';
      const currentDate = new Date().toISOString().split('T')[0];

      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

      const staticPages = [
        { loc: '/', priority: '1.0', changefreq: 'daily' },
        { loc: '/competitions', priority: '0.9', changefreq: 'daily' },
        { loc: '/top', priority: '0.8', changefreq: 'weekly' },
        { loc: '/judges', priority: '0.7', changefreq: 'weekly' },
        { loc: '/speed-records', priority: '0.8', changefreq: 'daily' },
        { loc: '/guide', priority: '0.6', changefreq: 'monthly' },
      ];

      for (const page of staticPages) {
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}${page.loc}</loc>\n`;
        xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
        xml += `    <priority>${page.priority}</priority>\n`;
        xml += '  </url>\n';
      }

      if (dogs.results) {
        for (const dog of dogs.results) {
          xml += '  <url>\n';
          xml += `    <loc>${baseUrl}/dog/${dog.id}</loc>\n`;
          xml += '    <changefreq>monthly</changefreq>\n';
          xml += '    <priority>0.6</priority>\n';
          xml += '  </url>\n';
        }
      }

      if (events.results) {
        for (const event of events.results) {
          const lastmod = event.date_start || currentDate;
          xml += '  <url>\n';
          xml += `    <loc>${baseUrl}/event/${event.id}</loc>\n`;
          xml += `    <lastmod>${lastmod}</lastmod>\n`;
          xml += '    <changefreq>monthly</changefreq>\n';
          xml += '    <priority>0.7</priority>\n';
          xml += '  </url>\n';
        }
      }

      for (const name of judgeNames) {
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}/judges/${encodeURIComponent(name)}</loc>\n`;
        xml += '    <changefreq>monthly</changefreq>\n';
        xml += '    <priority>0.5</priority>\n';
        xml += '  </url>\n';
      }

      if (doninoDogs.results) {
        for (const doninoDog of doninoDogs.results) {
          const doninoPath = `/donino-dog/${encodeURIComponent(doninoDog.name)}/${encodeURIComponent(doninoDog.breed)}`;
          xml += '  <url>\n';
          xml += `    <loc>${baseUrl}${doninoPath}</loc>\n`;
          xml += '    <changefreq>monthly</changefreq>\n';
          xml += '    <priority>0.5</priority>\n';
          xml += '  </url>\n';
        }
      }

      xml += '</urlset>';

      return c.text(xml, 200, {
        'Content-Type': 'application/xml; charset=utf-8',
      });
    } catch (error) {
      console.error('Sitemap error:', error);
      return c.text('Error generating sitemap', 500);
    }
  });
}
