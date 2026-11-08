import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  TITLE_RANK_LADDER,
  SPORT_TIER_CERTIFICATES,
  SPORT_TIER_ANNUAL_EVENTS,
  SPORT_TIER_CUMULATIVE,
  NATIONAL_CHAMPION_VARIANTS,
  COURSING_REQUIREMENTS as COURSING_REQ,
  COURSING_JUDGING_CRITERIA,
  COURSING_TIE_BREAK_STEPS,
  SPORT_BLANKET_COLORS,
  SPORT_CAREER_ROADMAP,
  ABBREVIATIONS as SPORT_ABBREVIATIONS,
} from '../../../frontend/src/pages/Guide/constants';
import {
  SHOW_RANKS,
  SHOW_CLASSES,
  SHOW_GRADES,
  SHOW_RING_AWARDS,
  SHOW_CAREER_TITLES,
  SHOW_REQUIREMENTS,
  SHOW_ABBREVIATIONS,
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
  OLYMPIC_CASCADE_STEPS,
  CS_V2_COMPONENTS,
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
    tier_certificates: SPORT_TIER_CERTIFICATES,
    tier_annual_events: SPORT_TIER_ANNUAL_EVENTS,
    tier_cumulative: SPORT_TIER_CUMULATIVE,
    national_variants: NATIONAL_CHAMPION_VARIANTS,
    requirements: COURSING_REQ,
    criteria: COURSING_JUDGING_CRITERIA,
    tie_break_steps: COURSING_TIE_BREAK_STEPS,
    blanket_colors: SPORT_BLANKET_COLORS,
    career_roadmap: SPORT_CAREER_ROADMAP,
    abbreviations: SPORT_ABBREVIATIONS,
  },
  shows: {
    ranks: SHOW_RANKS,
    classes: SHOW_CLASSES,
    grades: SHOW_GRADES,
    awards: SHOW_RING_AWARDS,
    titles: SHOW_CAREER_TITLES,
    requirements: SHOW_REQUIREMENTS,
    abbreviations: SHOW_ABBREVIATIONS,
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
    olympic_cascade: OLYMPIC_CASCADE_STEPS,
    cs_v2_components: CS_V2_COMPONENTS,
    requirements: RATING_REQUIREMENTS,
    abbreviations: RATING_ABBREVIATIONS,
  },
};

const tmpFile = `${OUT_FILE}.tmp`;
fs.writeFileSync(tmpFile, JSON.stringify(guideData, null, 2), 'utf-8');
try {
  fs.renameSync(tmpFile, OUT_FILE);
} catch {
  fs.unlinkSync(OUT_FILE);
  fs.renameSync(tmpFile, OUT_FILE);
}
console.log(`✓ guide.json successfully written to ${OUT_FILE}`);
