/**
 * Rank codes and their full names
 */
export const RANK_CODES = {
  CACL: 'Состязание ранга CACL',
  ЧРКФ: 'Чемпионат РКФ',
  ПЧРКФ: 'Первенство ЧРКФ',
  КР: 'Кубок России',
  ЧР: 'Чемпионат России',
  'ЧРКФ-Br': 'Монопородный чемпионат РКФ',
  CACIL: 'Международные состязания ранга CACIL',
  CACIB: 'Международные состязания ранга CACIB',
  CACMB: 'Международные состязания ранга CACMB',
} as const;

export type RankCode = keyof typeof RANK_CODES;

/**
 * Discipline codes and their full names
 */
export const DISCIPLINE_CODES = {
  coursing: 'Курсинг борзых',
  bzmp: 'БЗМП (бега за механической приманкой)',
  racing: 'Бега борзых (рейсинг по кругу)',
} as const;

export type DisciplineCode = keyof typeof DISCIPLINE_CODES;

/**
 * Extract rank code from text
 */
export function extractRankCode(text: string): RankCode | null {
  const upperText = text.toUpperCase();
  
  // Check for specific patterns
  if (upperText.includes('CACIL')) return 'CACIL';
  if (upperText.includes('CACIB')) return 'CACIB';
  if (upperText.includes('CACMB')) return 'CACMB';
  if (upperText.includes('ПЧРКФ') || upperText.includes('ПЕРВЕНСТВО ЧРКФ')) return 'ПЧРКФ';
  if (upperText.includes('ЧРКФ') && upperText.includes('ПОРОД')) return 'ЧРКФ-Br';
  if (upperText.includes('ЧРКФ')) return 'ЧРКФ';
  if (upperText.includes('КУБОК РОССИИ') || upperText.includes('КР')) return 'КР';
  if (upperText.includes('ЧЕМПИОНАТ РОССИИ') || upperText.includes('ЧР')) return 'ЧР';
  if (upperText.includes('CACL')) return 'CACL';
  
  return null;
}

/**
 * Extract discipline code from text
 */
export function extractDisciplineCode(text: string): DisciplineCode | null {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('курсинг')) return 'coursing';
  if (lowerText.includes('бзмп') || lowerText.includes('механической приманкой')) return 'bzmp';
  if (lowerText.includes('рейсинг') || lowerText.includes('бега борзых')) return 'racing';
  
  return null;
}

/**
 * Extract club/organizer from text (removes rank and discipline)
 */
export function extractClub(text: string, rankCode: RankCode | null, disciplineCode: DisciplineCode | null): string {
  let cleaned = text;
  
  // Remove rank patterns
  if (rankCode) {
    const rankPatterns = [
      RANK_CODES[rankCode],
      rankCode,
      rankCode.replace('-', ' '),
    ];
    for (const pattern of rankPatterns) {
      cleaned = cleaned.replace(new RegExp(pattern, 'gi'), '');
    }
  }
  
  // Remove discipline patterns
  if (disciplineCode) {
    const disciplinePatterns = [
      DISCIPLINE_CODES[disciplineCode],
      disciplineCode,
    ];
    for (const pattern of disciplinePatterns) {
      cleaned = cleaned.replace(new RegExp(pattern, 'gi'), '');
    }
  }
  
  // Remove common separators
  cleaned = cleaned.replace(/[-–—]/g, ' ');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  // Remove location patterns (dates and locations in parentheses)
  cleaned = cleaned.replace(/,\s*\d{1,2}\.\d{1,2}\.\d{4}(-\d{1,2}\.\d{1,2}\.\d{4})?\s*\(.*?\)/g, '');
  cleaned = cleaned.replace(/\([^)]*\)/g, '');
  
  return cleaned.trim();
}

/**
 * Extract breed list from text (for monoporous events)
 */
export function extractBreedList(text: string): string[] | null {
  // Look for breed lists separated by newlines or commas
  const breedPatterns = [
    /(?:в породах|породы)[:\s]*([^\n]+)/i,
    /(?:порода|пород)[:\s]*([^\n]+)/i,
  ];
  
  for (const pattern of breedPatterns) {
    const match = text.match(pattern);
    if (match) {
      const breeds = match[1]
        .split(/[,\n]/)
        .map(b => b.trim())
        .filter(b => b.length > 0);
      
      if (breeds.length > 0) {
        return breeds;
      }
    }
  }
  
  return null;
}

/**
 * Normalize event title for consistency
 */
export function normalizeTitle(title: string): string {
  let normalized = title;
  
  // Normalize ranks
  normalized = normalized.replace(/Чемпионат РКФ/g, 'ЧРКФ');
  normalized = normalized.replace(/Чемпионат России/g, 'ЧР');
  normalized = normalized.replace(/Кубок России/g, 'КР');
  normalized = normalized.replace(/Национальные монопородные состязания - ПЧРКФ/g, 'ПЧРКФ');
  normalized = normalized.replace(/Национальные монопородные состязания/g, 'ПЧРКФ');
  
  // Normalize discipline references
  normalized = normalized.replace(/бегам за механической приманкой/g, 'БЗМП');
  normalized = normalized.replace(/по курсингу борзых/g, 'по курсингу');
  normalized = normalized.replace(/по бегам борзых/g, 'по рейсингу');
  normalized = normalized.replace(/по бегам борзых за механическим зайцем/g, 'по БЗМП');
  
  // Normalize CACL references
  normalized = normalized.replace(/Состязание по курсингу борзых ранга CACL/g, 'CACL по курсингу');
  normalized = normalized.replace(/Состязания по курсингу борзых CACL/g, 'CACL по курсингу');
  normalized = normalized.replace(/Чемпионат ранга CACL по курсингу борзых/g, 'CACL по курсингу');
  normalized = normalized.replace(/Национальные состязания по курсингу ранга CACL/g, 'CACL по курсингу');
  normalized = normalized.replace(/Национальные состязания по рейсингу за механическим зайцем ранга CACL/g, 'CACL по рейсингу');
  normalized = normalized.replace(/Региональные состязания по рейсингу ранга CACL/g, 'CACL по рейсингу');
  normalized = normalized.replace(/Международные состязания по курсингу ранга CACIL/g, 'CACIL по курсингу');
  normalized = normalized.replace(/Международные состязания по рейсингу ранга CACIL/g, 'CACIL по рейсингу');
  
  // Remove redundant discipline references in parentheses
  normalized = normalized.replace(/\s*\(курсинг\)/gi, '');
  normalized = normalized.replace(/\s*\(рейсинг\)/gi, '');
  normalized = normalized.replace(/\s*\(рейсингу\)/gi, '');
  normalized = normalized.replace(/\s*\(круг\)/gi, '');
  normalized = normalized.replace(/\s*\(бегам борзых\)/gi, '');
  
  // Standardize separators
  normalized = normalized.replace(/-CACL/g, ' - CACL');
  normalized = normalized.replace(/-CACIL/g, ' - CACIL');
  normalized = normalized.replace(/--/g, ' - ');
  normalized = normalized.replace(/&amp;/g, ' & ');
  
  // Remove breed lists (multiline lists after "в породах:")
  normalized = normalized.replace(/\s*в породах:.*$/gs, '');
  normalized = normalized.replace(/\s*в породах.*$/gs, '');
  
  // Clean up whitespace
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  return normalized;
}
