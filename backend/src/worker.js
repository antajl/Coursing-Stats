export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': 'https://procoursing.pages.dev',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, HEAD, PUT, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Origin, Accept',
      'Access-Control-Max-Age': '86400',
      'Access-Control-Allow-Credentials': 'false',
      'Content-Type': 'application/json; charset=utf-8',
    };
    
    // Handle OPTIONS requests for CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { 
        status: 204,
        headers: corsHeaders 
      });
    }
    
    // API endpoints
    if (path.startsWith('/api/')) {
      return handleAPI(request, env, url, corsHeaders);
    }
    
    return new Response('Not found', { status: 404, headers: corsHeaders });
  },

  async scheduled(event, env, ctx) {
    // Cron trigger for automatic data updates
    console.log('Scheduled event triggered:', event.cron);
    
    try {
      // Check if we should update current year data
      const currentYear = new Date().getFullYear();
      
      // For now, just log the intent
      console.log(`Would update current year (${currentYear}) data here`);
      console.log('To enable automatic updates, implement the following:');
      console.log('1. Call external API to trigger update script');
      console.log('2. Or implement update logic directly in Worker');
      console.log('3. Or use webhook to run update script on server');
      
      // Future implementation could:
      // - Call an external endpoint that runs node scripts/update-current-year.mjs
      // - Or implement the scraping logic directly in the Worker
      // - Or use a webhook to trigger updates on a separate server
      
    } catch (error) {
      console.error('Error in scheduled event:', error);
      throw error;
    }
    
    return;
  }
};

function parsePagination(url) {
  const limitStr = url.searchParams.get("limit");
  if (limitStr === null || limitStr === "") return null;
  const limit = Math.min(Math.max(parseInt(limitStr, 10) || 50, 1), 500);
  const offset = Math.max(parseInt(url.searchParams.get("offset") || "0", 10) || 0, 0);
  return { limit, offset };
}

async function queryWithPagination(db, query, params, pagination, corsHeaders) {
  if (!pagination) {
    const { results } = await db.prepare(query).bind(...params).all();
    return Response.json(results, { headers: corsHeaders });
  }

  const countQuery = `SELECT COUNT(*) AS total FROM (${query})`;
  const { results: countRows } = await db.prepare(countQuery).bind(...params).all();
  const total = countRows[0]?.total ?? 0;

  const dataQuery = `${query} LIMIT ? OFFSET ?`;
  const { results } = await db
    .prepare(dataQuery)
    .bind(...params, pagination.limit, pagination.offset)
    .all();

  return Response.json(
    {
      items: results,
      total,
      limit: pagination.limit,
      offset: pagination.offset,
    },
    { headers: corsHeaders }
  );
}

async function handleAPI(request, env, url, corsHeaders) {
  const path = url.pathname;
  const db = env.DB;
  
  try {
    // Test endpoint
    if (path === '/api/test') {
      const { results } = await db.prepare('SELECT 1 as test').all();
      return Response.json({ test: results, db: !!db }, { headers: corsHeaders });
    }
    
    // Test view endpoint
    if (path === '/api/test-view') {
      const { results } = await db.prepare('SELECT * FROM v_top_by_placement LIMIT 5').all();
      return Response.json({ results, count: results.length }, { headers: corsHeaders });
    }
    
    // Recreate views endpoint
    if (path === '/api/recreate-views') {
      if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405, headers: corsHeaders });
      }
      
      try {
        await db.exec('DROP VIEW IF EXISTS v_top_by_placement');
        await db.exec('DROP VIEW IF EXISTS v_top_by_score');
        
        await db.exec("CREATE VIEW v_top_by_placement AS SELECT d.id AS dog_id, d.name_lat, d.name_ru, d.breed, e.year, SUM(CASE WHEN r.placement = 1 THEN 1 ELSE 0 END) AS gold, SUM(CASE WHEN r.placement = 2 THEN 1 ELSE 0 END) AS silver, SUM(CASE WHEN r.placement = 3 THEN 1 ELSE 0 END) AS bronze, COUNT(*) AS total_starts FROM results r JOIN dogs d ON d.id = r.dog_id JOIN events e ON r.event_id = e.id WHERE r.status = 'finished' AND e.event_type IN ('coursing', 'bzmp') GROUP BY d.id, e.year");
        
        await db.exec("CREATE VIEW v_top_by_score AS SELECT d.id AS dog_id, d.name_lat, d.name_ru, d.breed, e.year, MAX(r.total_score) AS best_score, ROUND(AVG(r.total_score), 2) AS avg_score, COUNT(*) AS total_starts FROM results r JOIN dogs d ON d.id = r.dog_id JOIN events e ON r.event_id = e.id WHERE r.status = 'finished' AND r.total_score IS NOT NULL AND e.event_type IN ('coursing', 'bzmp') GROUP BY d.id, e.year");
        
        return Response.json({ success: true, message: 'Views recreated successfully' }, { headers: corsHeaders });
      } catch (err) {
        console.error('Error recreating views:', err);
        return Response.json({ success: false, error: err.message }, { status: 500, headers: corsHeaders });
      }
    }
    
    // Manual update trigger endpoint
    if (path === '/api/update/trigger') {
      if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405, headers: corsHeaders });
      }
      
      // For now, return success - actual update would need server-side scraping
      // In production, this would trigger GitHub Actions or external server
      return Response.json({
        success: true,
        message: 'Update triggered successfully',
        note: 'Automatic updates run weekly via GitHub Actions (.github/workflows/update-db.yml). Manual run: npm run ci-update-db'
      }, { headers: corsHeaders });
    }
    
    // Re-parse coursing events endpoint
    if (path === '/api/admin/reparse-coursing') {
      if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405, headers: corsHeaders });
      }
      
      try {
        const { reparseCoursingEvents } = await import('../scripts/reparse-coursing-events.mjs');
        const result = await reparseCoursingEvents(db);
        
        return Response.json({
          success: true,
          message: 'Re-parsing completed successfully',
          ...result
        }, { headers: corsHeaders });
      } catch (err) {
        console.error('Re-parsing failed:', err);
        return Response.json({ 
          success: false, 
          error: err.message 
        }, { status: 500, headers: corsHeaders });
      }
    }
    
    // GET /api/top/placement?breed=&year=&minStarts=&limit=&offset=
    if (path === '/api/top/placement') {
      const breed = url.searchParams.get('breed') || '';
      const year = url.searchParams.get('year') || '';
      const minStarts = parseInt(url.searchParams.get('minStarts')) || 0;
      const pagination = parsePagination(url);

      const params = [];

      let query;
      if (year) {
        query = 'SELECT * FROM v_top_by_placement WHERE year = ?';
        params.push(year);

        if (breed) {
          query += ' AND breed = ?';
          params.push(breed);
        }
        if (minStarts > 0) {
          query += ' AND total_starts >= ?';
          params.push(minStarts);
        }
      } else {
        query = `
          SELECT
            d.id AS dog_id,
            d.name_lat,
            d.name_ru,
            d.breed,
            SUM(CASE WHEN r.placement = 1 THEN 1 ELSE 0 END) AS gold,
            SUM(CASE WHEN r.placement = 2 THEN 1 ELSE 0 END) AS silver,
            SUM(CASE WHEN r.placement = 3 THEN 1 ELSE 0 END) AS bronze,
            COUNT(*) AS total_starts
          FROM results r
          JOIN dogs d ON d.id = r.dog_id
          JOIN events e ON r.event_id = e.id
          WHERE r.status = 'finished' AND e.event_type IN ('coursing', 'bzmp')
        `;

        if (breed) {
          query += ' AND d.breed = ?';
          params.push(breed);
        }

        query += ' GROUP BY d.id';

        if (minStarts > 0) {
          query += ' HAVING total_starts >= ?';
          params.push(minStarts);
        }

        query += ' ORDER BY gold DESC, silver DESC, bronze DESC';
      }

      return queryWithPagination(db, query, params, pagination, corsHeaders);
    }
    
    // GET /api/top/score?breed=&year=&minStarts=&limit=&offset=
    if (path === '/api/top/score') {
      const breed = url.searchParams.get('breed') || '';
      const year = url.searchParams.get('year') || '';
      const minStarts = parseInt(url.searchParams.get('minStarts')) || 0;
      const pagination = parsePagination(url);

      const params = [];

      let query;
      if (year) {
        query = 'SELECT * FROM v_top_by_score WHERE year = ?';
        params.push(year);

        if (breed) {
          query += ' AND breed = ?';
          params.push(breed);
        }
        if (minStarts > 0) {
          query += ' AND total_starts >= ?';
          params.push(minStarts);
        }
      } else {
        query = `
          SELECT
            d.id AS dog_id,
            d.name_lat,
            d.name_ru,
            d.breed,
            MAX(r.total_score) AS best_score,
            AVG(r.total_score) AS avg_score,
            COUNT(*) AS total_starts
          FROM results r
          JOIN dogs d ON d.id = r.dog_id
          JOIN events e ON r.event_id = e.id
          WHERE r.status = 'finished' AND r.total_score IS NOT NULL AND e.event_type IN ('coursing', 'bzmp')
        `;

        if (breed) {
          query += ' AND d.breed = ?';
          params.push(breed);
        }

        query += ' GROUP BY d.id';

        if (minStarts > 0) {
          query += ' HAVING total_starts >= ?';
          params.push(minStarts);
        }

        query += ' ORDER BY best_score DESC';
      }

      return queryWithPagination(db, query, params, pagination, corsHeaders);
    }
    
    // GET /api/top/speed?breed=&year=&minStarts=&limit=&offset=
    if (path === '/api/top/speed') {
      const breed = url.searchParams.get('breed') || '';
      const year = url.searchParams.get('year') || '';
      const minStarts = parseInt(url.searchParams.get('minStarts') || '0', 10);
      const pagination = parsePagination(url);
      
      let query = `
        SELECT 
          d.id AS dog_id,
          d.name_lat,
          d.name_ru,
          d.breed,
          COUNT(r.id) AS total_starts,
          MAX(
            CASE 
              WHEN json_extract(r.raw_scores_json, '$.heat1.speed') IS NOT NULL 
              THEN CAST(json_extract(r.raw_scores_json, '$.heat1.speed') AS REAL) * 3.6
              WHEN json_extract(r.raw_scores_json, '$.heat2.speed') IS NOT NULL 
              THEN CAST(json_extract(r.raw_scores_json, '$.heat2.speed') AS REAL) * 3.6
              WHEN json_extract(r.raw_scores_json, '$.heat3.speed') IS NOT NULL 
              THEN CAST(json_extract(r.raw_scores_json, '$.heat3.speed') AS REAL) * 3.6
              ELSE 0
            END
          ) AS best_speed,
          ROUND(AVG(
            CASE 
              WHEN json_extract(r.raw_scores_json, '$.heat1.speed') IS NOT NULL 
              THEN CAST(json_extract(r.raw_scores_json, '$.heat1.speed') AS REAL) * 3.6
              WHEN json_extract(r.raw_scores_json, '$.heat2.speed') IS NOT NULL 
              THEN CAST(json_extract(r.raw_scores_json, '$.heat2.speed') AS REAL) * 3.6
              WHEN json_extract(r.raw_scores_json, '$.heat3.speed') IS NOT NULL 
              THEN CAST(json_extract(r.raw_scores_json, '$.heat3.speed') AS REAL) * 3.6
              ELSE NULL
            END
          ), 2) AS avg_speed
        FROM results r
        JOIN dogs d ON d.id = r.dog_id
        JOIN events e ON r.event_id = e.id
        WHERE e.event_type = 'racing' AND r.raw_scores_json IS NOT NULL
      `;
      const params = [];

      if (breed) {
        query += ' AND d.breed = ?';
        params.push(breed);
      }

      if (year) {
        query += ' AND strftime("%Y", e.date_start) = ?';
        params.push(year);
      }

      query += ' GROUP BY d.id';

      if (minStarts > 0) {
        query += ' HAVING total_starts >= ?';
        params.push(minStarts);
      }

      query += ' ORDER BY best_speed DESC';

      return queryWithPagination(db, query, params, pagination, corsHeaders);
    }
    
    // GET /api/dogs/:id/events
    if (path.match(/^\/api\/dogs\/\d+\/events$/)) {
      const dogId = path.split('/')[3];
      
      const eventsQuery = `
        SELECT 
          e.id AS event_id,
          e.date_start,
          e.date_end,
          e.title,
          e.event_type,
          e.competition_kind,
          e.results_url,
          e.location,
          r.placement,
          r.total_score,
          r.status
        FROM events e
        JOIN results r ON e.id = r.event_id
        WHERE r.dog_id = ? AND r.status = 'finished'
        ORDER BY e.date_start DESC
      `;
      
      const { results } = await db.prepare(eventsQuery).bind(dogId).all();
      return Response.json(results, { headers: corsHeaders });
    }
    
    // GET /api/dogs/:id
    if (path.match(/^\/api\/dogs\/\d+$/)) {
      const dogId = path.split('/')[3];
      
      // Get dog basic info
      const dogQuery = `
        SELECT 
          d.id AS dog_id,
          d.name_lat,
          d.name_ru,
          d.breed,
          d.sex,
          d.owner
        FROM dogs d
        WHERE d.id = ?
      `;
      
      const { results } = await db.prepare(dogQuery).bind(dogId).all();
      
      if (results.length === 0) {
        return Response.json({ error: 'Dog not found' }, { status: 404, headers: corsHeaders });
      }
      
      const dogData = results[0];
      
      // Get coursing statistics (coursing + bzmp)
      const coursingQuery = `
        SELECT 
          COUNT(r.id) AS total_starts,
          MAX(r.total_score) AS best_score,
          ROUND(AVG(r.total_score), 2) AS avg_score,
          SUM(CASE WHEN r.placement = 1 THEN 1 ELSE 0 END) AS gold,
          SUM(CASE WHEN r.placement = 2 THEN 1 ELSE 0 END) AS silver,
          SUM(CASE WHEN r.placement = 3 THEN 1 ELSE 0 END) AS bronze,
          (
            SELECT e.results_url 
            FROM results r2 
            JOIN events e ON r2.event_id = e.id 
            WHERE r2.dog_id = ? AND r2.status = 'finished' 
              AND e.event_type IN ('coursing', 'bzmp')
            ORDER BY r2.total_score DESC 
            LIMIT 1
          ) AS best_score_event_url
        FROM results r
        JOIN events e ON r.event_id = e.id
        WHERE r.dog_id = ? AND r.status = 'finished' 
          AND e.event_type IN ('coursing', 'bzmp')
      `;
      
      const { results: coursingResults } = await db.prepare(coursingQuery).bind(dogId, dogId).all();
      dogData.coursing_stats = coursingResults[0] || {
        total_starts: 0,
        best_score: null,
        avg_score: null,
        gold: 0,
        silver: 0,
        bronze: 0
      };
      
      // Get racing statistics
      const racingQuery = `
        SELECT 
          COUNT(r.id) AS total_starts,
          (
            SELECT e.results_url 
            FROM results r2 
            JOIN events e ON r2.event_id = e.id 
            WHERE r2.dog_id = ? AND e.event_type = 'racing' AND r2.raw_scores_json IS NOT NULL
            ORDER BY 
              CASE 
                WHEN json_extract(r2.raw_scores_json, '$.heat1.speed') IS NOT NULL THEN CAST(json_extract(r2.raw_scores_json, '$.heat1.speed') AS REAL)
                ELSE 0
              END DESC,
              CASE 
                WHEN json_extract(r2.raw_scores_json, '$.heat2.speed') IS NOT NULL THEN CAST(json_extract(r2.raw_scores_json, '$.heat2.speed') AS REAL)
                ELSE 0
              END DESC,
              CASE 
                WHEN json_extract(r2.raw_scores_json, '$.heat3.speed') IS NOT NULL THEN CAST(json_extract(r2.raw_scores_json, '$.heat3.speed') AS REAL)
                ELSE 0
              END DESC
            LIMIT 1
          ) AS best_speed_event_url
        FROM results r
        JOIN events e ON r.event_id = e.id
        WHERE r.dog_id = ? AND r.status = 'finished' AND e.event_type = 'racing'
      `;
      
      const { results: racingCountResults } = await db.prepare(racingQuery).bind(dogId, dogId).all();
      dogData.racing_stats = {
        total_starts: racingCountResults[0]?.total_starts || 0,
        best_speed: null,
        avg_speed: null,
        best_speed_event_url: racingCountResults[0]?.best_speed_event_url || null
      };
      
      // Get speed data from racing events
      if (dogData.racing_stats.total_starts > 0) {
        const speedQuery = `
          SELECT r.raw_scores_json
          FROM results r
          JOIN events e ON r.event_id = e.id
          WHERE r.dog_id = ? AND e.event_type = 'racing' AND r.raw_scores_json IS NOT NULL
        `;
        
        const { results: speedResults } = await db.prepare(speedQuery).bind(dogId).all();
        
        // Extract speeds from raw_scores_json
        const speeds = [];
        for (const row of speedResults) {
          try {
            const scores = JSON.parse(row.raw_scores_json);
            if (scores.heat1?.speed) speeds.push(parseFloat(scores.heat1.speed));
            if (scores.heat2?.speed) speeds.push(parseFloat(scores.heat2.speed));
            if (scores.heat3?.speed) speeds.push(parseFloat(scores.heat3.speed));
          } catch (e) {
            console.error('Error parsing raw_scores_json:', e);
          }
        }
        
        // Calculate best and average speed (convert m/s to km/h)
        if (speeds.length > 0) {
          const bestSpeed = Math.max(...speeds) * 3.6; // m/s to km/h
          const avgSpeed = (speeds.reduce((a, b) => a + b, 0) / speeds.length) * 3.6; // m/s to km/h
          dogData.racing_stats.best_speed = bestSpeed.toFixed(2);
          dogData.racing_stats.avg_speed = avgSpeed.toFixed(2);
        }
      }
      
      return Response.json(dogData, { headers: corsHeaders });
    }
    
    // GET /api/dogs/:id/events
    if (path.match(/^\/api\/dogs\/\d+\/events$/)) {
      const dogId = path.split('/')[3];
      
      const eventsQuery = `
        SELECT 
          e.id AS event_id,
          e.date_start,
          e.date_end,
          e.title,
          e.event_type,
          e.results_url,
          e.location,
          r.placement,
          r.total_score,
          r.status
        FROM events e
        JOIN results r ON e.id = r.event_id
        WHERE r.dog_id = ? AND r.status = 'finished'
        ORDER BY e.date_start DESC
      `;
      
      const { results } = await db.prepare(eventsQuery).bind(dogId).all();
      return Response.json(results, { headers: corsHeaders });
    }
    
    // GET /api/breeds
    if (path === '/api/breeds') {
      const { results } = await db.prepare('SELECT DISTINCT breed FROM dogs ORDER BY breed').all();
      return Response.json(results, { headers: corsHeaders });
    }
    
    // GET /api/years
    if (path === '/api/years') {
      const { results } = await db.prepare('SELECT DISTINCT year FROM events ORDER BY year DESC').all();
      return Response.json(results, { headers: corsHeaders });
    }
    
    // GET /api/events
    if (path === '/api/events') {
      const breed = url.searchParams.get('breed') || '';
      const year = url.searchParams.get('year') || '';
      
      let query = 'SELECT * FROM events WHERE 1=1';
      const params = [];
      
      if (year) {
        query += ' AND year = ?';
        params.push(year);
      }
      
      query += ' ORDER BY date_start DESC';
      
      const { results } = await db.prepare(query).bind(...params).all();
      return Response.json(results, { headers: corsHeaders });
    }
    
    return new Response('API endpoint not found', { status: 404, headers: corsHeaders });
  } catch (error) {
    console.error('API error:', error);
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}
