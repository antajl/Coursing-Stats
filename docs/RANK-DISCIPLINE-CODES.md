# Rank and Discipline Codes

## Overview

Event titles in the calendar and competition files previously mixed multiple types of information in a single string:
- Rank (CACL, ЧРКФ, ПЧРКФ, etc.)
- Discipline (coursing, BZMP, racing)
- Organizer/club
- Breed lists (for monoporous events)
- Location

This caused inconsistent naming where the same rank appeared as:
- `ЧРКФ - CACL по курсингу`
- `ЧРКФ-CACL по курсингу` (without spaces)
- `Чемпионат РКФ - CACL по бегам борзых`
- `ЧР - CACL по курсингу`

## Solution

The data structure now separates rank and discipline into independent code fields:

### Rank Codes

| rank_code | Full Name | Description |
|-----------|------------|-------------|
| `CACL` | Состязание ранга CACL | Certificate of Aptitude for Coursing Lure |
| `ЧРКФ` | Чемпионат РКФ | Russian Cynological Federation Championship |
| `ПЧРКФ` | Первенство ЧРКФ | Russian Cynological Federation First Championship |
| `КР` | Кубок России | Russian Cup |
| `ЧР` | Чемпионат России | Russian Championship |
| `ЧРКФ-Br` | Монопородный чемпионат РКФ | Monoporous RKF Championship (by specific breed) |
| `CACIL` | Международные состязания ранга CACIL | International CACIL |
| `CACIB` | Международные состязания ранга CACIB | International CACIB |
| `CACMB` | Международные состязания ранга CACMB | International CACMB |

### Discipline Codes

| discipline_code | Full Name | Description |
|------------------|------------|-------------|
| `coursing` | Курсинг борзых | Sighthound coursing |
| `bzmp` | БЗМП (бега за механической приманкой) | Mechanical lure coursing |
| `racing` | Бега борзых (рейсинг по кругу) | Greyhound racing |

## Data Structure Changes

### Calendar Event Interface

```typescript
interface CalendarEvent {
  id: number;
  year: number;
  month: string;
  date_start: string;
  date_end: string | null;
  title: string;              // Original title
  full_title: string | null;  // Full title
  rank_label: string;        // Original rank label
  rank_code: string | null;   // NEW: Normalized rank code
  discipline_code: string | null; // NEW: Normalized discipline code
  event_type: string;
  competition_kind: string;
  competition_type: string;
  host_club: string;
  region: string | null;
  location: string;
  results_url: string | null;
  catalog_url: string | null;
  confirmed: number;
  judges: string | null;
  has_results: boolean;
  results_file: string | null;
  result_count: number;
  participants_count: number;
}
```

### Competition Event Structure

The competition files also include the new fields in the `event` object:
```json
{
  "event": {
    "rank_code": "ЧРКФ",
    "discipline_code": "coursing",
    ...
  }
}
```

## Implementation

### Rank and Discipline Mapping

The mapping logic is implemented in `backend/lib/rank-discipline-mapping.ts`:

```typescript
export function extractRankCode(text: string): RankCode | null
export function extractDisciplineCode(text: string): DisciplineCode | null
export function extractClub(text: string, rankCode: RankCode | null, disciplineCode: DisciplineCode | null): string
export function extractBreedList(text: string): string[] | null
```

### Calendar Parsers

All year-specific calendar parsers (`parse-calendar-2015.ts` through `parse-calendar-2024.ts`) now:
1. Parse the original title
2. Extract `rank_code` using `extractRankCode()`
3. Extract `discipline_code` using `extractDisciplineCode()`
4. Store both codes in the calendar event

### Competition Files

Competition files are updated using `backend/scripts/web-archive/update-competition-rank-discipline.ts`:
- Reads existing competition files
- Extracts rank and discipline codes from the title
- Adds `rank_code` and `discipline_code` fields to the event object

## Usage

### Parsing Calendar Events

```typescript
import { extractRankCode, extractDisciplineCode } from '../../lib/rank-discipline-mapping';

const rankCode = extractRankCode("ЧРКФ - CACL по курсингу");
// Returns: "ЧРКФ"

const disciplineCode = extractDisciplineCode("ЧРКФ - CACL по курсингу");
// Returns: "coursing"
```

### Filtering by Rank

```typescript
const championshipEvents = calendarEvents.filter(e => e.rank_code === 'ЧРКФ');
const caclEvents = calendarEvents.filter(e => e.rank_code === 'CACL');
```

### Filtering by Discipline

```typescript
const coursingEvents = calendarEvents.filter(e => e.discipline_code === 'coursing');
const racingEvents = calendarEvents.filter(e => e.discipline_code === 'racing');
```

## Benefits

1. **Consistent identification**: Same rank always has the same code regardless of text variations
2. **Easier filtering**: Simple code-based filtering instead of complex string matching
3. **Better data quality**: Separates concerns - rank, discipline, organizer are independent
4. **Future-proof**: Easy to add new ranks or disciplines without breaking existing code
5. **Internationalization**: Codes are language-independent, full names can be localized

## Migration

The migration was performed in the following steps:
1. Created rank and discipline mapping in `backend/lib/rank-discipline-mapping.ts`
2. Updated `CalendarEvent` interface with new fields
3. Updated all year-specific calendar parsers to extract codes
4. Reparsed all calendar files (2015-2024) with new structure
5. Updated existing competition files with new fields
6. Re-added results to calendar with new structure

## Notes

- Some events may have `null` values for `rank_code` or `discipline_code` if the parser couldn't identify them
- The original `rank_label` is preserved for reference
- Organizer/club information is still in `host_club` field
- Breed lists for monoporous events are not yet extracted (future enhancement)
