// 3. Упрощённый русский стеммер (удаление словоизменительных окончаний)
export const RUSSIAN_ENDINGS_REGEX =
  /(?:остями|естями|остям|естям|остях|естях|остей|естей|ости|ести|ость|есть|ому|ему|ыми|ими|ого|его|ами|ями|ной|ным|ных|ную|ные|ный|ное|ная|ов|ев|ей|ам|ям|ах|ях|ом|ем|ой|ей|ую|юю|ий|ый|ой|ая|яя|ое|ее|ые|ие|ть|ти|ся|сь|ет|ут|ют|ит|ат|ят|ал|ла|ли|ло|а|я|у|ю|е|о|и|ы|ь)$/i

export function stemWord(word: string): string {
  const clean = word.toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9]/gi, '')
  if (clean.length <= 3) return clean
  let stemmed = clean.replace(RUSSIAN_ENDINGS_REGEX, '')
  if (stemmed.endsWith('тн') || stemmed.endsWith('сн')) {
    stemmed = stemmed.slice(0, -1)
  }
  return stemmed
}
