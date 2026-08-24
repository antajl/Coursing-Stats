/**
 * Shared utilities for audit scripts.
 * Eliminates duplication across competition and show audit tools.
 */

import fs from 'node:fs'
import path from 'node:path'

/**
 * Recursively walk directory and return relative paths to JSON files.
 * Used by audit scripts to scan competition protocols and exhibition data.
 * 
 * @param dir - Directory to walk
 * @param base - Base path for relative paths (internal recursion parameter)
 * @returns Array of relative JSON file paths
 */
export function walkJson(dir: string, base = ''): string[] {
  if (!fs.existsSync(dir)) return []
  const out: string[] = []
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${ent.name}` : ent.name
    const full = path.join(dir, ent.name)
    if (ent.isDirectory()) out.push(...walkJson(full, rel))
    else if (ent.name.endsWith('.json')) out.push(rel)
  }
  return out
}
