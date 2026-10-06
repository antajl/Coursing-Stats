import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  TITLE_RANK_LADDER,
  ABSOLUTE_CAREER_TITLES,
  EVENT_TITLES,
  CUMULATIVE_TITLES,
  NATIONAL_CHAMPION_VARIANTS,
  STATUS_EVENT_RULES,
  COURSING_REQUIREMENTS as COURSING_REQ,
  CRITERIA,
} from '../../../frontend/src/pages/Guide/constants';
import {
  SHOW_RANKS,
  SHOW_EVENT_AWARDS_PRIORITY,
  SHOW_CHAMPIONSHIP_TITLES,
} from '../../../frontend/src/pages/Guide/showConstants';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const OUT_FILE = path.join(ROOT, 'data/v1/guide.json');

const guideData = {
  schema: 'coursing-stats/guide-v1',
  generated_at: new Date().toISOString(),
  sport: {
    title_ladder: TITLE_RANK_LADDER.map(item => ({
      rank: item.rank,
      badge: item.badge,
      name: item.name,
      prestigeLabel: item.prestigeLabel,
      howToGet: item.howToGet,
      details: item.details,
    })),
    absolute_career: ABSOLUTE_CAREER_TITLES,
    event_titles: EVENT_TITLES,
    cumulative: CUMULATIVE_TITLES,
    national_variants: NATIONAL_CHAMPION_VARIANTS,
    status_events: STATUS_EVENT_RULES,
    requirements: COURSING_REQ,
    criteria: CRITERIA,
  },
  shows: {
    ranks: SHOW_RANKS,
    awards: SHOW_EVENT_AWARDS_PRIORITY,
    titles: SHOW_CHAMPIONSHIP_TITLES,
  },
};

fs.writeFileSync(OUT_FILE, JSON.stringify(guideData, null, 2), 'utf-8');
console.log(`✓ guide.json successfully written to ${OUT_FILE}`);
