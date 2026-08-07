/** Serialize values for SQLite insert (JSON objects → string). */
export function toSqlValue(value: unknown): unknown {
  if (value === undefined) return null;
  if (value !== null && typeof value === 'object') return JSON.stringify(value);
  return value;
}

export function pickRow(
  source: Record<string, unknown>,
  columns: string[],
): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  for (const col of columns) {
    if (col in source) row[col] = source[col];
  }
  return row;
}
