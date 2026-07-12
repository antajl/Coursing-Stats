import { Hono } from 'hono';
import { parseJudgeNames } from '../lib/judge-names';
import { loadStaticDataJson } from '../../lib/local-data/static-data';
import { loadDoninoCoursingRecords, loadDoninoSpeedRecords } from '../lib/static-api';

type Env = {
  ADMIN_API_TOKEN: string;
};

export function handleSitemap(app: Hono<{ Bindings: Env }>) {
  app.get('/sitemap.xml', async (c) => {
    try {
      // Load dogs from data/v1/dogs/by-id
      const dogs: any[] = [];
      // Simple approach - load manifest for count
      const manifest = await loadStaticDataJson<{ counts?: Record<string, number> }>('manifest.json');
      const dogCount = manifest?.counts?.dogs || 0;
      
      // Load judges from static data
      const judgesData = await loadStaticDataJson<{ judges?: any[] }>('indexes/judges-summary.json');
      const judges = judgesData?.judges || [];
      
      // Load donino records
      const speedRecords = await loadDoninoSpeedRecords();
      const coursingRecords = await loadDoninoCoursingRecords();
      
      // Extract unique donino dogs
      const doninoDogs = new Map<string, { name: string; breed: string }>();
      if (speedRecords?.length) {
        for (const r of speedRecords) {
          const key = `${String(r.name)}-${String(r.breed)}`;
          doninoDogs.set(key, { name: String(r.name), breed: String(r.breed) });
        }
      }
      if (coursingRecords?.length) {
        for (const r of coursingRecords) {
          const key = `${String(r.name)}-${String(r.breed)}`;
          doninoDogs.set(key, { name: String(r.name), breed: String(r.breed) });
        }
      }

      const baseUrl = 'https://coursing-stats.ru';

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

      // For dogs, we'll use a placeholder since we don't have a simple way to list all IDs
      // In production, this should be generated during build
      for (let i = 1; i <= dogCount; i++) {
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}/dog/${i}</loc>\n`;
        xml += '    <changefreq>monthly</changefreq>\n';
        xml += '    <priority>0.6</priority>\n';
        xml += '  </url>\n';
      }

      for (const judge of judges) {
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}/judges/${encodeURIComponent(judge.name)}</loc>\n`;
        xml += '    <changefreq>monthly</changefreq>\n';
        xml += '    <priority>0.5</priority>\n';
        xml += '  </url>\n';
      }

      for (const doninoDog of doninoDogs.values()) {
        const doninoPath = `/donino-dog/${encodeURIComponent(doninoDog.name)}/${encodeURIComponent(doninoDog.breed)}`;
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}${doninoPath}</loc>\n`;
        xml += '    <changefreq>monthly</changefreq>\n';
        xml += '    <priority>0.5</priority>\n';
        xml += '  </url>\n';
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
