import type Database from 'better-sqlite3';

type Stmt = ReturnType<Database.Database['prepare']>;

function bindable(stmt: Stmt, params: unknown[]) {
  return {
    all(): Promise<{ results: unknown[] }> {
      return Promise.resolve({ results: stmt.all(...params) as unknown[] });
    },
    run(): Promise<unknown> {
      const r = stmt.run(...params);
      return Promise.resolve({
        success: true,
        meta: { last_row_id: Number(r.lastInsertRowid) },
        changes: r.changes,
      });
    },
    first(): Promise<unknown> {
      return Promise.resolve(stmt.get(...params));
    },
  };
}

/** D1-compatible async wrapper over better-sqlite3 (for existing route SQL). */
export function createD1Shim(db: Database.Database) {
  return {
    prepare(sql: string) {
      const stmt = db.prepare(sql);
      const bound = () => bindable(stmt, []);
      return {
        bind(...params: unknown[]) {
          return bindable(stmt, params);
        },
        all: () => bound().all(),
        run: () => bound().run(),
        first: () => bound().first(),
      };
    },
    exec(sql: string) {
      db.exec(sql);
      return Promise.resolve();
    },
  };
}

export type LocalD1 = ReturnType<typeof createD1Shim>;
