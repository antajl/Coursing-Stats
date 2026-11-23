// Cynological Title and Dog Name Formatters (ES Module)

export const CYNOLOGICAL_ACRONYMS = new Set([
  'РКФ', 'РК', 'ФЦИ', 'FCI', 'ЧРКФ', 'ЮЧРКФ', 'ВЧРКФ', 'ЧР', 'ЮЧР', 'ВЧР',
  'ГЧР', 'ГЧРКФ', 'ЧФ', 'ЮЧФ', 'КЧК', 'ЮКЧК', 'СС', 'ЮСС', 'CAC', 'CACIB',
  'CACL', 'RCAC', 'RCACIB', 'RCACL', 'BIS', 'JBIS', 'VBIS', 'BIG', 'BOB',
  'BOS', 'BJ', 'BV', 'CW', 'ЛПП', 'ЛЮ', 'ЛВ', 'ЛЩ', 'ЛБ', 'ПК'
]);

export const LOWERCASE_PARTICLES = new Set([
  'по', 'в', 'и', 'на', 'с', 'со', 'для', 'из', 'от', 'до', 'де', 'дэ', 'ла', 'ле', 'аль', 'эль', 'ван', 'дер', 'фон'
]);

export function formatDogName(name) {
  if (!name) return '';
  return name.trim().split(/\s+/).map((word, idx) => {
    return word.split('-').map(part => {
      const clean = part.toLowerCase();
      if (idx > 0 && (clean === 'дэ' || clean === 'аль' || clean === 'де')) {
        return clean.charAt(0).toUpperCase() + clean.slice(1);
      }
      return clean.charAt(0).toUpperCase() + clean.slice(1);
    }).join('-');
  }).join(' ');
}

export function formatDocTitle(title) {
  if (!title) return '';
  return title.split(/\s+/).map((word, idx) => {
    const raw = word.replace(/[(),]/g, '');
    const up = raw.toUpperCase();
    if (CYNOLOGICAL_ACRONYMS.has(up)) {
      return word.toUpperCase();
    }
    const low = raw.toLowerCase();
    if (idx > 0 && LOWERCASE_PARTICLES.has(low)) {
      return word.toLowerCase();
    }
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');
}
