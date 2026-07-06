import { Hono } from 'hono';

type Env = {
  DB: any;
  ADMIN_API_TOKEN: string;
};

export function handleSitemap(app: Hono<{ Bindings: Env }>) {
  // Sitemap endpoint
  app.get('/sitemap.xml', async (c) => {
    const db = c.env.DB;
    
    try {
      // Получаем все собаки
      const dogs = await db.prepare('SELECT id, name_lat, breed FROM dogs').all();
      // Получаем все события
      const events = await db.prepare('SELECT id, title, event_date, competition_kind FROM events').all();
      // Получаем всех судей
      const judges = await db.prepare('SELECT id, judge_name FROM judges').all();
      // Уникальные собаки Донино (name + breed из обеих таблиц)
      const doninoDogs = await db.prepare(`
        SELECT DISTINCT name, breed FROM (
          SELECT name, breed FROM speed_records WHERE name IS NOT NULL AND breed IS NOT NULL
          UNION
          SELECT name, breed FROM coursing_records WHERE name IS NOT NULL AND breed IS NOT NULL
        )
      `).all();
      
      const baseUrl = 'https://coursing-stats.ru';
      const currentDate = new Date().toISOString().split('T')[0];
      
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
      
      // Основные страницы
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/</loc>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>1.0</priority>\n`;
      xml += `  </url>\n`;
      
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/competitions</loc>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>0.9</priority>\n`;
      xml += `  </url>\n`;
      
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/dogs</loc>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
      
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/judges</loc>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += `  </url>\n`;
      
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/speed-records</loc>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
      
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/top-dogs</loc>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
      
      // Страницы собак
      if (dogs.results) {
        for (const dog of dogs.results) {
          const dogName = dog.name_lat || dog.name_ru || 'dog';
          xml += `  <url>\n`;
          xml += `    <loc>${baseUrl}/dog/${dog.id}</loc>\n`;
          xml += `    <changefreq>monthly</changefreq>\n`;
          xml += `    <priority>0.6</priority>\n`;
          xml += `  </url>\n`;
        }
      }
      
      // Страницы событий
      if (events.results) {
        for (const event of events.results) {
          const eventDate = event.event_date || currentDate;
          xml += `  <url>\n`;
          xml += `    <loc>${baseUrl}/event/${event.id}</loc>\n`;
          xml += `    <lastmod>${eventDate}</lastmod>\n`;
          xml += `    <changefreq>monthly</changefreq>\n`;
          xml += `    <priority>0.7</priority>\n`;
          xml += `  </url>\n`;
        }
      }
      
      // Страницы судей
      if (judges.results) {
        for (const judge of judges.results) {
          xml += `  <url>\n`;
          xml += `    <loc>${baseUrl}/judge/${judge.id}</loc>\n`;
          xml += `    <changefreq>monthly</changefreq>\n`;
          xml += `    <priority>0.5</priority>\n`;
          xml += `  </url>\n`;
        }
      }

      // Профили Донино (/donino-dog/:name/:breed)
      if (doninoDogs.results) {
        for (const doninoDog of doninoDogs.results) {
          const doninoPath = `/donino-dog/${encodeURIComponent(doninoDog.name)}/${encodeURIComponent(doninoDog.breed)}`;
          xml += `  <url>\n`;
          xml += `    <loc>${baseUrl}${doninoPath}</loc>\n`;
          xml += `    <changefreq>monthly</changefreq>\n`;
          xml += `    <priority>0.5</priority>\n`;
          xml += `  </url>\n`;
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
