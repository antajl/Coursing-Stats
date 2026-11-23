// Typography and Canine Title Formatters (Old Money Case Normalization)

const CYNOLOGICAL_ACRONYMS = new Set([
  'РКФ', 'RKF', 'FCI', 'ЧРКФ', 'ГЧРКФ', 'ЧР', 'ЮЧР', 'ВЧР', 'САС', 'CAC', 'CACIB', 'CACL',
  'БЗМП', 'ЛПП', 'BOB', 'BOS', 'BIS', 'BIG', 'CW', 'КЧК', 'ПК', 'СС', 'ЮЧРКФ', 'ВЧРКФ',
  'Д-1', 'Д-2', 'Д-3', 'CACT', 'CACIT'
]);

const PARTICLES = new Set(['дэ', 'де', 'фон', 'ван', 'дер', 'ла', 'ле', 'аль', 'эль', 'из', 'от', 'со']);

export function formatDogName(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .split(/\s+/)
    .map((word, idx) => {
      if (idx > 0 && PARTICLES.has(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

export function formatDocTitle(title) {
  if (!title) return '';
  return title
    .split(/\s+/)
    .map(word => {
      const cleanWord = word.replace(/[(),]/g, '');
      if (CYNOLOGICAL_ACRONYMS.has(cleanWord.toUpperCase())) {
        return word.toUpperCase();
      }
      const lower = word.toLowerCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(' ');
}
