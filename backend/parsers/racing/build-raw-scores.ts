/** Конвертация heat1/heat2/heat3 (v1) или массива heats в raw_scores_json для racing. */
export function buildRacingRawScoresJson(result: {
  heat1?: { num?: number | null; bib?: string | null; time?: number | null; speed?: number | null };
  heat2?: { num?: number | null; bib?: string | null; time?: number | null; speed?: number | null };
  heat3?: { num?: number | null; bib?: string | null; time?: number | null; speed?: number | null };
  raw_scores_json?: string;
}) {
  if (result.raw_scores_json) {
    try {
      const parsed = JSON.parse(result.raw_scores_json);
      if (parsed.heats?.length) return result.raw_scores_json;
    } catch {
      /* fall through */
    }
  }

  const slots = [result.heat1, result.heat2, result.heat3];
  const heats = slots
    .map((h) => {
      if (!h?.time && !h?.speed) return null;
      const bibNum = typeof h.num === 'number' ? h.num : null;
      return {
        heat_number: bibNum ?? 0,
        bib_number: bibNum,
        bib_color: h.bib && /^[a-z#]/i.test(h.bib) ? h.bib : null,
        time: h.time ?? null,
        speed_kmh: h.speed ?? null,
      };
    })
    .filter(Boolean);

  const timed = heats.filter((h) => h!.time !== null);
  const grandTotal = timed.length > 0 ? Math.min(...timed.map((h) => h!.time!)) : null;

  return JSON.stringify({
    heats,
    grand_total: grandTotal,
    normalized_score: grandTotal,
    format: 'racing',
  });
}
