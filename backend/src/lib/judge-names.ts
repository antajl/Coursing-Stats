/** Парсинг фамилий судей из строки events.judges */
export function parseJudgeNames(judgesString: string): string[] {
  if (!judgesString) return [];

  let cleaned = judgesString
    .replace(/Главный\s+судья\s*[:\s-]+\s*/gi, '')
    .replace(/судь[яи](\s*\d+)?\s*[:\s-]+\s*/gi, '')
    .replace(/^\d+\s*[-–]\s*/gm, '')
    .trim();

  const names = cleaned
    .split(',')
    .map((n) => n.trim().replace(/^[\s\-–—*•\d.]+\s*/, '').trim())
    .filter((n) => n && !n.toLowerCase().includes('круг:'));

  if (names.length === 1 && cleaned.includes(' и ')) {
    return cleaned
      .split(' и ')
      .map((n) => n.trim().replace(/^[\s\-–—*•\d.]+\s*/, '').trim())
      .filter((n) => n && !n.toLowerCase().includes('круг:'));
  }

  return names;
}
