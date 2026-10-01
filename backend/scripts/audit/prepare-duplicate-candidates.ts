/**
 * Generates actionable merge candidates from duplicate-dogs.json.
 * 
 * Usage:
 *   npx tsx backend/scripts/audit/prepare-duplicate-candidates.ts
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { transliterateRuToLat } from '../ingest/ingest-competition.js';
import { normalizeDogName, normalizeText } from '../../lib/text-normalization.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const REPORT_PATH = path.join(ROOT, 'data/v1/reports/duplicate-dogs.json');
const OUT_PATH = path.join(ROOT, 'data/v1/reports/merge-candidates.json');
const DOGS_DIR = path.join(ROOT, 'data/v1/dogs/by-id');

interface DuplicateCluster {
  breed: string;
  ids: number[];
  names: string[];
  competition_id_counts: number[];
  suggested_keep_id: number;
}

interface DuplicateReport {
  totals: {
    duplicate_clusters: number;
    dogs_in_clusters: number;
  };
  clusters: DuplicateCluster[];
}

export interface MergeCandidate {
  id: string;
  breed: string;
  aliasId: number;
  aliasName: string;
  aliasComps: number;
  keepId: number;
  keepName: string;
  keepComps: number;
  confidence: 'high' | 'medium';
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

function evaluatePairConfidence(
  aliasName: string,
  keepName: string
): { confidence: 'high' | 'medium'; reason: string } {
  const normAlias = normalizeDogName(aliasName);
  const normKeep = normalizeDogName(keepName);

  // 1. One contains the other
  if (normAlias.includes(normKeep) || normKeep.includes(normAlias)) {
    return {
      confidence: 'high',
      reason: 'Name containment / slash-name variant',
    };
  }

  // 2. Transliteration match
  const tAlias = transliterateRuToLat(aliasName);
  const tKeep = transliterateRuToLat(keepName);

  if (tAlias === tKeep) {
    return {
      confidence: 'high',
      reason: 'Exact RU↔EN transliteration match',
    };
  }

  const tokensAlias = new Set(tAlias.split(' ').filter((t) => t.length >= 3));
  const tokensKeep = new Set(tKeep.split(' ').filter((t) => t.length >= 3));

  if (tokensAlias.size > 0 && tokensKeep.size > 0) {
    let shared = 0;
    for (const t of tokensAlias) {
      if (tokensKeep.has(t)) shared += 1;
    }
    const overlap = shared / Math.min(tokensAlias.size, tokensKeep.size);
    if (overlap >= 0.8 && shared >= 2) {
      return {
        confidence: 'high',
        reason: `High token overlap after transliteration (${shared} shared tokens)`,
      };
    }
  }

  return {
    confidence: 'medium',
    reason: 'Heuristic name overlap in same breed',
  };
}

function main() {
  if (!fs.existsSync(REPORT_PATH)) {
    throw new Error(`Report not found: ${REPORT_PATH}. Run 'yarn run audit-duplicate-dogs' first.`);
  }

  const report = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf-8')) as DuplicateReport;
  const candidates: MergeCandidate[] = [];

  let existingApproved = new Set<string>();
  if (fs.existsSync(OUT_PATH)) {
    try {
      const prev = JSON.parse(fs.readFileSync(OUT_PATH, 'utf-8')) as { candidates?: MergeCandidate[] };
      for (const c of prev.candidates ?? []) {
        if (c.status === 'approved') {
          existingApproved.add(`${c.aliasId}->${c.keepId}`);
        }
      }
    } catch {
      // ignore
    }
  }

  for (const cluster of report.clusters) {
    const keepId = cluster.suggested_keep_id;
    const keepIdx = cluster.ids.indexOf(keepId);
    const keepName = keepIdx >= 0 ? cluster.names[keepIdx] : cluster.names[0];
    const keepComps = keepIdx >= 0 ? cluster.competition_id_counts[keepIdx] : 0;

    for (let i = 0; i < cluster.ids.length; i++) {
      const aliasId = cluster.ids[i];
      if (aliasId === keepId) continue;

      const aliasName = cluster.names[i];
      const aliasComps = cluster.competition_id_counts[i];
      const pairKey = `${aliasId}->${keepId}`;

      const { confidence, reason } = evaluatePairConfidence(aliasName, keepName);

      candidates.push({
        id: pairKey,
        breed: cluster.breed,
        aliasId,
        aliasName,
        aliasComps,
        keepId,
        keepName,
        keepComps,
        confidence,
        reason,
        status: existingApproved.has(pairKey) ? 'approved' : 'pending',
      });
    }
  }

  const highCount = candidates.filter((c) => c.confidence === 'high').length;
  const mediumCount = candidates.filter((c) => c.confidence === 'medium').length;

  const outputPayload = {
    schema: 'coursing-stats/merge-candidates-v1',
    generated_at: new Date().toISOString(),
    totals: {
      candidates: candidates.length,
      high_confidence: highCount,
      medium_confidence: mediumCount,
      approved: candidates.filter((c) => c.status === 'approved').length,
    },
    candidates,
  };

  fs.writeFileSync(OUT_PATH, JSON.stringify(outputPayload, null, 2) + '\n', 'utf-8');

  console.log(`\n======================================================`);
  console.log(`Merge Candidates Prepared:`);
  console.log(`  Total pairs:     ${candidates.length}`);
  console.log(`  High confidence: ${highCount} (obvious translits / slash-names)`);
  console.log(`  Medium:          ${mediumCount}`);
  console.log(`  Output file:     data/v1/reports/merge-candidates.json`);
  console.log(`======================================================\n`);
}

main();
