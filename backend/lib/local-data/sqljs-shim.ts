import type { Database as SqlJsDatabase, Statement } from 'sql.js';

function normalizeRunResult(db: SqlJsDatabase) {
  const changes = db.getRowsModified();
  const row = db.exec('SELECT last_insert_rowid() AS id');
  const lastInsertRowid = row[0]?.values[0]?.[0] ?? 0;
  return {
    success: true,
    meta: { last_row_id: Number(lastInsertRowid) },
    changes,
  };
}

function bindable(db: SqlJsDatabase, stmt: Statement, params: unknown[]) {
  return {
    all(): Promise<{ results: unknown[] }> {
      if (params.length) stmt.bind(params);
      const results: unknown[] = [];
      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }
      stmt.free();
      return Promise.resolve({ results });
    },
    run(): Promise<unknown> {
      if (params.length) stmt.bind(params);
      stmt.step();
      stmt.free();
      return Promise.resolve(normalizeRunResult(db));
    },
    first(): Promise<unknown> {
      if (params.length) stmt.bind(params);
      let row: unknown = null;
      if (stmt.step()) row = stmt.getAsObject();
      stmt.free();
      return Promise.resolve(row);
    },
  };
}

/** D1-compatible async wrapper over sql.js (Cloudflare Worker). */
export function createSqlJsShim(db: SqlJsDatabase) {
  return {
    prepare(sql: string) {
      const stmt = db.prepare(sql);
      const bound = () => bindable(db, stmt, []);
      return {
        bind(...params: unknown[]) {
          return bindable(db, stmt, params);
        },
        all: () => bound().all(),
        run: () => bound().run(),
        first: () => bound().first(),
      };
    },
    async exec(sql: string) {
      db.run(sql);
    },
  };
}

export type SqlJsD1 = ReturnType<typeof createSqlJsShim>;
