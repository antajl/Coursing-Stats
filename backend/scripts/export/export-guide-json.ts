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
import {
  DONINO_SPEED_LADDER,
  DONINO_REQUIREMENTS,
  DONINO_ABBREVIATIONS,
} from '../../../frontend/src/pages/Guide/doninoConstants';
import {
  PROTOCOL_LADDER,
  PROTOCOL_REQUIREMENTS,
  PROTOCOL_ABBREVIATIONS,
} from '../../../frontend/src/pages/Guide/protocolConstants';
import {
  RATING_LADDER,
  RATING_REQUIREMENTS,
  RATING_ABBREVIATIONS,
} from '../../../frontend/src/pages/Guide/ratingConstants';

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
  donino: {
    speed_ladder: DONINO_SPEED_LADDER.map(item => ({
      rank: item.rank,
      badge: item.badge,
      name: item.name,
      prestigeLabel: item.prestigeLabel,
      howToGet: item.howToGet,
      details: item.details,
    })),
    requirements: DONINO_REQUIREMENTS,
    abbreviations: DONINO_ABBREVIATIONS,
  },
  protocol: {
    ladder: PROTOCOL_LADDER.map(item => ({
      rank: item.rank,
      badge: item.badge,
      name: item.name,
      prestigeLabel: item.prestigeLabel,
      howToGet: item.howToGet,
      details: item.details,
    })),
    requirements: PROTOCOL_REQUIREMENTS,
    abbreviations: PROTOCOL_ABBREVIATIONS,
  },
  rating: {
    ladder: RATING_LADDER.map(item => ({
      rank: item.rank,
      badge: item.badge,
      name: item.name,
      prestigeLabel: item.prestigeLabel,
      howToGet: item.howToGet,
      details: item.details,
    })),
    requirements: RATING_REQUIREMENTS,
    abbreviations: RATING_ABBREVIATIONS,
  },
};

fs.writeFileSync(OUT_FILE, JSON.stringify(guideData, null, 2), 'utf-8');
console.log(`✓ guide.json successfully written to ${OUT_FILE}`);
