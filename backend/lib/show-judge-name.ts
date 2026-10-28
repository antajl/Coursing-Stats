/**
 * Нормализация и ключ слияния имён судей выставок РКФ.
 * Используется в build-show-indexes и тестах.
 */

/** Латинские омоглифы → кириллица (и наоборот), если в строке доминирует один алфавит. */
const LATIN_TO_CYR: Record<string, string> = {
  A: 'А', a: 'а', B: 'В', E: 'Е', e: 'е', K: 'К', k: 'к', M: 'М', m: 'м',
  H: 'Н', O: 'О', o: 'о', P: 'Р', p: 'р', C: 'С', c: 'с', T: 'Т', X: 'Х', x: 'х',
  Y: 'У', y: 'у',
}
const CYR_TO_LAT: Record<string, string> = Object.fromEntries(
  Object.entries(LATIN_TO_CYR).map(([lat, cyr]) => [cyr, lat]),
)

/** Частые варианты латиницы одного имени → канон (для First Last западных записей). */
const LATIN_GIVEN_CANON: Record<string, string> = {
  tatiana: 'tatyana',
  tatyana: 'tatyana',
  dmitrii: 'dmitry',
  dmitriy: 'dmitry',
  dmitry: 'dmitry',
  nikolai: 'nikolay',
  nikolay: 'nikolay',
  vasilii: 'vasiliy',
  vasiliy: 'vasiliy',
  victor: 'viktor',
  viktor: 'viktor',
  yulia: 'yuliya',
  yuliya: 'yuliya',
  natalia: 'natalya',
  natalya: 'natalya',
  maria: 'maria',
  maryia: 'maria',
  evgeniy: 'evgeny',
  evgenii: 'evgeny',
  evgeny: 'evgeny',
  aleksandr: 'alexander',
  alexander: 'alexander',
  alexey: 'alexey',
  aleksey: 'alexey',
  sergey: 'sergey',
  sergei: 'sergey',
  andrey: 'andrey',
  andrei: 'andrey',
  mikhail: 'mikhail',
  michael: 'mikhail',
}

export const GIVEN_CANON_EN_TO_RU: Record<string, string> = {
  alexey: 'алексей',
  aleksey: 'алексей',
  alexander: 'александр',
  aleksandr: 'александр',
  elena: 'елена',
  natalia: 'наталья',
  natalya: 'наталья',
  tatyana: 'татьяна',
  tatiana: 'татьяна',
  dmitry: 'дмитрий',
  dmitriy: 'дмитрий',
  dmitrii: 'дмитрий',
  olga: 'ольга',
  irina: 'ирина',
  galina: 'галина',
  sergey: 'сергей',
  sergei: 'сергей',
  vladimir: 'владимир',
  yana: 'яна',
  yulia: 'юлия',
  julia: 'юлия',
  valentin: 'валентин',
  valentina: 'валентина',
  viktor: 'виктор',
  victor: 'виктор',
  mikhail: 'михаил',
  nikolay: 'николай',
  nikolai: 'николай',
  ekaterina: 'екатерина',
  svetlana: 'светлана',
  marina: 'марина',
  ksenia: 'ксения',
  daria: 'дарья',
  polina: 'полина',
  sofia: 'софия',
  alina: 'алина',
  lyudmila: 'людмила',
  inessa: 'инесса',
  nina: 'нина',
  tamara: 'тамара',
  raisa: 'раиса',
  alla: 'алла',
  valery: 'валерий',
  valerii: 'валерий',
  inna: 'инна',
  zhanna: 'жанна',
  stanislav: 'станислав',
  liliya: 'лилия',
  elvira: 'эльвира',
  evgeny: 'евгений',
  evgeniy: 'евгений',
  evgenia: 'евгения',
  valeria: 'валерия',
  denis: 'денис',
  revaz: 'реваз',
  dzianis: 'денис',
  anatolij: 'анатолий',
  anatoly: 'анатолий',
  zoya: 'зоя',
  larisa: 'лариса',
}

export const COMMON_GIVEN_NAMES = new Set([
  'яна', 'алексей', 'ольга', 'елена', 'ирина', 'мария', 'анна', 'олег', 'иван',
  'петр', 'сергей', 'андрей', 'дмитрий', 'александр', 'наталья',
  'татьяна', 'екатерина', 'светлана', 'юлия', 'юлианна', 'вероника', 'виктория',
  'марина', 'ксения', 'дарья', 'полина', 'софия', 'алина', 'михаил',
  'николай', 'владимир', 'владислав', 'артем', 'роман',
  'максим', 'константин', 'геннадий', 'валентин', 'виктор', 'галина', 'любовь',
  'надежда', 'зоя', 'лариса', 'оксана', 'элина', 'эдуард', 'эмиль', 'юрий',
  'григорий', 'степан', 'федор', 'илья', 'кирилл', 'павел', 'руслан', 'тимур',
  'вячеслав', 'ярослав', 'игорь', 'василий', 'алекс', 'лена', 'наташа',
  'таня', 'саша', 'катя', 'маша', 'людмила', 'инесса', 'нина',
  'тамара', 'раиса', 'алла', 'валерий', 'инна', 'жанна', 'станислав', 'лилия',
  'эльвира', 'майя', 'нелли', 'диана', 'виолетта', 'евгений', 'евгения',
  'валерия', 'олеся', 'реваз', 'златко', 'душан', 'зоран',
  'флера', 'шамиль', 'эсенгельды', 'заур', 'мадина', 'наиля', 'роберт', 'эмилия', 'ираида', 'лидия', 'георгий', 'эдуард', 'вера',
])

export const COMMON_LATIN_GIVEN_NAMES = new Set([
  'yana', 'alexey', 'aleksey', 'olga', 'elena', 'irina', 'maria', 'anna', 'oleg', 'ivan',
  'petr', 'sergey', 'sergei', 'andrey', 'andrei', 'dmitry', 'dmitrii', 'dmitriy', 'alexander',
  'aleksandr', 'natalia', 'natalya', 'tatyana', 'tatiana', 'ekaterina', 'svetlana', 'yulia',
  'julia', 'yulianna', 'veronica', 'veronika', 'victoria', 'viktoria', 'marina', 'ksenia',
  'daria', 'polina', 'sofia', 'alina', 'mikhail', 'nikolay', 'nikolai', 'vladimir', 'vladislav',
  'artem', 'roman', 'maxim', 'maksim', 'konstantin', 'gennady', 'valentin', 'valentina',
  'viktor', 'victor', 'galina', 'lyubov', 'liubov', 'nadezhda', 'zoya', 'larisa', 'oksana',
  'elina', 'eduard', 'yury', 'yurii', 'grigory', 'grigorii', 'stepan', 'fedor', 'ilya',
  'kirill', 'pavel', 'ruslan', 'timur', 'vyacheslav', 'yaroslav', 'igor', 'vasily', 'vasiliy',
  'lyudmila', 'inessa', 'nina', 'tamara', 'raisa', 'alla', 'valery', 'valerii', 'inna', 'zhanna',
  'stanislav', 'liliya', 'elvira', 'evgeny', 'evgeniy', 'evgenia', 'valeria', 'denis', 'dzianis', 'revaz',
  'dusan', 'zlatko', 'zoran',
  'juliya', 'sviatlana', 'tijana', 'nemanja', 'sonia', 'mile', 'zaur', 'jovica', 'gertruda', 'refet', 'dalibor', 'esengeldy', 'mica', 'jane', 'sadiq', 'rale', 'ratibor', 'anatoli', 'aleksandar', 'tamara', 'bojan', 'miodrag', 'zeljko', 'voislav', 'vojislav', 'dragan', 'branko', 'sinisa', 'goran', 'predrag',
])

/** Известные опечатки в выгрузках РКФ (точные токены после lower+ё→е). */
const TOKEN_TYPOS: Record<string, string> = {
  белки: 'белкин',
  покровскя: 'покровская',
  lychkovskay: 'lychkovskaya',
  екатериа: 'екатерина',
}

function fixJudgeScriptHomoglyphs(s: string): string {
  const cyr = (s.match(/[а-яё]/gi) || []).length
  const lat = (s.match(/[a-z]/gi) || []).length
  if (cyr === 0 && lat === 0) return s
  if (cyr >= lat) {
    return s.replace(/[A-Za-z]/g, (ch) => LATIN_TO_CYR[ch] || ch)
  }
  return s.replace(/[А-Яа-яЁё]/g, (ch) => CYR_TO_LAT[ch] || ch)
}

/**
 * Нормализация имени судьи выставок для дедупликации.
 * Убирает скобки/страны, ё→е, омоглифы, переносы строк, OCR-разрывы слов, удвоения.
 */
const DISTINCT_CYR = /[бгджзийлпфцчшщъыьэюя]/i
const DISTINCT_LAT = /[dfgjqruvwz]/i

const LAT_TO_CYR_LOOKALIKE: Record<string, string> = {
  a: 'а', c: 'с', e: 'е', o: 'о', p: 'р', x: 'х', y: 'у', k: 'к', m: 'м', h: 'н', b: 'в'
}

const CYR_TO_LAT_LOOKALIKE: Record<string, string> = {
  а: 'a', с: 'c', е: 'e', о: 'o', р: 'p', х: 'x', у: 'y', к: 'k', м: 'm', н: 'h', в: 'b'
}

function fixWordMixedScript(s: string): string {
  return s
    .split(/\s+/)
    .map((word) => {
      if (DISTINCT_LAT.test(word) && !DISTINCT_CYR.test(word)) {
        return word.replace(/[асеорхукмнв]/gi, (ch) => {
          const lower = ch.toLowerCase()
          const lat = CYR_TO_LAT_LOOKALIKE[lower] || lower
          return ch === lower ? lat : lat.toUpperCase()
        })
      }
      if (DISTINCT_CYR.test(word) && !DISTINCT_LAT.test(word)) {
        return word.replace(/[aceopxykmhb]/gi, (ch) => {
          const lower = ch.toLowerCase()
          const cyr = LAT_TO_CYR_LOOKALIKE[lower] || lower
          return ch === lower ? cyr : cyr.toUpperCase()
        })
      }
      return word
    })
    .join(' ')
}

export const KNOWN_BREED_AND_NOISE_PHRASES: string[] = [
  'миниатюрная американская овчарка', 'белая швейцарская овчарка', 'староанглийская овчарка',
  'немецкая овчарка', 'бельгийская овчарка', 'восточноевропейская овчарка', 'среднеазиатская овчарка',
  'кавказская овчарка', 'австралийская овчарка', 'пиренейская овчарка', 'каталонская овчарка', 'овчарка',
  'вест хайленд вайт терьер', 'вест хайленд уайт терьер', 'джек рассел терьер', 'парсон рассел терьер',
  'йоркширский терьер', 'керн терьер', 'бордер терьер', 'бедлингтон терьер', 'бостон терьер',
  'ирландский волкодав', 'ирландский вольфхаунд', 'ирландский терьер', 'русский черный терьер',
  'черный терьер', 'американский стаффордширский терьер', 'стаффордширский бультерьер',
  'бультерьер стандартный', 'бультерьер миниатюрный', 'бультерьер', 'фокстерьер гладкошерстный',
  'фокстерьер жесткошерстный', 'фокстерьер', 'эрдельтерьер', 'ягдтерьер', 'чешский терьер', 'терьер',
  'такса стандартная', 'такса миниатюрная', 'такса кроличья', 'такса',
  'миниатюрная гладкошерстная', 'миниатюрная длинношерстная', 'миниатюрная жесткошерстная',
  'стандартная гладкошерстная', 'стандартная длинношерстная', 'стандартная жесткошерстная',
  'кроличья гладкошерстная', 'кроличья длинношерстная', 'кроличья жесткошерстная',
  'золотистый ретривер', 'лабрадор ретривер', 'прямошерстный ретривер', 'курчавошерстный ретривер',
  'новошотландский ретривер', 'чесапик бей ретривер', 'ретривер',
  'английский кокер спаниель', 'американский кокер спаниель', 'русский охотничий спаниель',
  'вельш спрингер спаниель', 'английский спрингер спаниель',
  'кавалер кинг чарльз спаниель', 'кинг чарльз спаниель', 'той спаниель', 'спаниель',
  'немецкий шпиц', 'померанский шпиц', 'малый шпиц', 'средний шпиц', 'вольфшпиц', 'японский шпиц', 'шпиц',
  'бернский зенненхунд', 'большой швейцарский зенненхунд', 'энтлебухер зенненхунд', 'аппенцеллер зенненхунд', 'зенненхунд',
  'бельгийский гриффон', 'брюссельский гриффон', 'пти брабансон', 'гриффон',
  'итальянский кане корсо', 'кане корсо', 'аргентинский дог', 'немецкий дог', 'бордоский дог', 'дог',
  'тибетский мастиф', 'испанский мастиф', 'английский мастиф', 'пиренейский мастиф', 'майоркский мастиф', 'неаполитанский мастиф', 'мастиф', 'бульмастиф',
  'французский бульдог', 'английский бульдог', 'американский бульдог', 'континентальный бульдог', 'бульдог',
  'американский булли', 'булли',
  'бишон фризе', 'русская цветная болонка', 'мальтезе', 'болоньезе',
  'русская псовая борзая', 'афганская борзая', 'малая итальянская борзая', 'испанская борзая', 'венгерская борзая', 'грейхаунд', 'уиппет', 'салюки', 'азавак', 'слюги', 'борзая',
  'сибирский хаски', 'хаски', 'аляскинский маламут', 'маламут', 'самоедская собака', 'самоед', 'басенджи', 'сиба', 'акита', 'американская акита',
  'цвергшнауцер', 'ризеншнауцер', 'миттельшнауцер', 'шнауцер',
  'цвергпинчер', 'немецкий пинчер', 'пинчер', 'доберман', 'ротвейлер',
  'сенбернар', 'ньюфаундленд', 'леонбергер', 'хотошо', 'ховаварт', 'бурбуль', 'московская сторожевая',
  'немецкий боксер', 'боксер', 'чихуахуа', 'мопс', 'пекинес', 'ши тцу', 'японский хин', 'папийон',
    'немецкий померанский', 'померанский', 'бассет хаунд', 'бладхаунд', 'шар пей', 'бордер колли',
  'пудель той', 'чау чау', 'шнауцер', 'эрдельтерьер', 'чихуахуа', 'шьен партиколор',
  'лхасский апсо', 'другие окрасы', 'немецкий курцхаар', 'шьен партиколор а пуаль', 'шьен партиколор а', 'венгерская выжла', 'выжла', 'собака) стандартная', 'собака стандартная', 'собака)', 'собака', 'метис', 'без породы',
  'siberian husky', 'tibetan mastiff', 'border terrier', 'french bulldog', 'belgian shepherd',
  'australian shepherd', 'golden retriever', 'labrador retriever', 'welsh corgi', 'poodle',
  'airedale terrier', 'fox terrier', 'bull terrier', 'miniature schnauzer', 'giant schnauzer',
  'german shepherd', 'cane corso', 'great dane', 'dogue de bordeaux', 'bernese mountain dog',
  'english bulldog', 'american bulldog', 'staffordshire bull terrier', 'jack russell terrier'
].sort((a, b) => b.length - a.length)

export function normalizeShowJudgeDisplayName(raw: string): string {
  let normalized = raw.normalize('NFKC').trim()

  // Если имя содержит слеш (двуязычное: "Реваз Хомасуридзе / Revaz Khomasuridze")
  if (normalized.includes('/')) {
    const slashParts = normalized.split('/').map((p) => p.trim()).filter(Boolean)
    const cyrPart = slashParts.find((p) => /[а-яё]/i.test(p))
    if (cyrPart) {
      normalized = cyrPart
    } else if (slashParts.length > 0) {
      normalized = slashParts[0]
    }
  }

  // Переводим в нижний регистр и чиним смешанные омоглифы по словам
  normalized = normalized.toLowerCase().replace(/ё/g, 'е')
  normalized = fixWordMixedScript(normalized)

  // Удаляем нумерацию списков (например, "8) yuliya ol'kova")
  normalized = normalized.replace(/^\s*\d{1,2}\s*[.)]\s*/iu, '')
  // Удаляем префиксы дат протоколов и номера вопросов вида "19.01.22 вопрос 23) "
  normalized = normalized.replace(/^\s*\d{2}[\s.]\d{2}[\s.]\d{2,4}\s*/iu, '')
  normalized = normalized.replace(/^\s*вопрос\s+\d+\s*\)?\s*[-–—:]*\s*/iu, '')

  // Удаляем административные пометки выставочной комиссии
  normalized = normalized.replace(/\(.*решени[ею].*\)/gi, '')
  normalized = normalized.replace(/\b(изменено\s+по\s+решению\s+вк|вопрос\s+\d+|решени[ею]\s+вк).*$/iu, '')

  // Отсекаем числовые токены, номера родословных, классы и дрессировочные сертификаты
  if (/^(?:\d|ккл|окд|згс|угс|бх|bh|ипо|ipo|игп|igp)/iu.test(normalized)) {
    return ''
  }
  normalized = normalized.replace(/^[(]+\s*/iu, '')

  // Вычленяем судью из расписаний типа "17.04.2022 седых н.е. - шнауцер..."
  const schedMatch = normalized.match(/^\d{2}\.\d{2}\.\d{4}\s+([а-яa-z\s.]+?)\s+-\s+.*$/iu)
  if (schedMatch) {
    normalized = schedMatch[1]
  }

  // Отрезаем пометки внимания в конце
  normalized = normalized.replace(/\s+внимание.*$/iu, '').replace(/[!?:;]+$/g, '')
  normalized = normalized.replace(/\([^)]*\)/g, ' ')
  normalized = normalized.replace(
    /\s*[-–—]\s*(serbia|russia|rf|rkf|azerbaijan|azerba[iy]dzhan|kazakhstan|kazahstan|ukraine|belarus|poland|germany|france|italy|spain|finland|sweden|norway|china|japan|korea|usa|uk|россия|ркф|украина|беларусь|казахстан|азербайджан)\s*$/iu,
    '',
  )

  // Удаляем титулы и пометки выставочных рингов (ЛПП, JCAC, CACIB и т.д.)
  normalized = normalized.replace(/(?<=^|\s)(?:лпп|cacib|rcacib|cac|rcac|vcac|чркф|кчк|вкчк|ючркф|bob|bos|bis|big|отл|очхор|хор|уд|сс|чк|пк)(?=\s|$)/giu, ' ')
  normalized = normalized.replace(/(?<=^|\s)[j][cс][aа][cс](?=\s|$)/giu, ' ')
  normalized = normalized.replace(/(?<=^|\s)[vв][cс][aа][cс](?=\s|$)/giu, ' ')
  normalized = normalized.replace(/^[vв]\s+[чc]\s+[vв][cс][aа][cс]\s+/giu, ' ')
  normalized = normalized.replace(/(?<=^|\s)v\s+ч\s+vсас(?=\s|$)/giu, ' ')

  // Удаляем прилипшие названия пород и разновидностей в начале и конце
  let strippedBreed = true
  while (strippedBreed) {
    strippedBreed = false
    normalized = normalized.trim()
    for (const phrase of KNOWN_BREED_AND_NOISE_PHRASES) {
      if (normalized === phrase) {
        return ''
      }
      if (normalized.startsWith(phrase + ' ')) {
        normalized = normalized.slice(phrase.length).trim()
        strippedBreed = true
        break
      }
      if (normalized.endsWith(' ' + phrase)) {
        normalized = normalized.slice(0, -phrase.length).trim()
        strippedBreed = true
        break
      }
    }
    // Отрезаем незакрытые скобки породных окрасов перед реальным именем
    const parenClean = normalized.replace(/^\s*\([a-zа-яё\s.,;()/-]+?\s+(?=[a-zа-яё]{3,}\s+[a-zа-яё])/giu, '')
    if (parenClean !== normalized) {
      normalized = parenClean.trim()
      strippedBreed = true
    }
  }

  // Отрезаем остаточные одиночные породные слова по краям
  const singleBreedRe = /^(?:овчарка|терьер|ретривер|бульдог|корги|шпиц|пудель|хаски|доберман|ротвейлер|мопс|бигль|колли|шелти|мальтезе|басенджи|сиба|пинчер|спаниель|такса|собака|той|мастиф|болонка|борзая|боксер|гриффон|дог|зенненхунд|маламут|самоед|акита|шнауцер|булли|курцхаар|дратхаар|выжла|веймаранер)\s+/giu
  const singleBreedEndRe = /\s+(?:овчарка|терьер|ретривер|бульдог|корги|шпиц|пудель|хаски|доберман|ротвейлер|мопс|бигль|колли|шелти|мальтезе|басенджи|сиба|пинчер|спаниель|такса|собака|той|мастиф|болонка|борзая|боксер|гриффон|дог|зенненхунд|маламут|самоед|акита|шнауцер|булли|курцхаар|дратхаар|выжла|веймаранер)$/giu
  normalized = normalized.replace(singleBreedRe, '')
  normalized = normalized.replace(singleBreedEndRe, '')
  normalized = normalized.replace(/\s+/g, ' ').trim()
  if (!normalized || KNOWN_BREED_AND_NOISE_PHRASES.includes(normalized) || normalized.length < 4) {
    return ''
  }

  // Удаляем случайно просочившиеся в имя даты
  normalized = normalized.replace(/\s+\d{2}\s+\d{2}\s+\d{4}\b/g, '')
  // Удаляем лидирующие и хвостовые тире и пунктуацию
  normalized = normalized.replace(/^[-–—\s.,;:]+/g, '').replace(/[-–—\s.,;:]+$/g, '')
  normalized = normalized.replace(/\s+[-–—]\s+/g, ' ')
  // Убираем пробелы после дефиса (agafonova- tripoli)
  normalized = normalized.replace(/\b([а-яa-z]+)-\s+([а-яa-z]+)\b/g, '$1-$2')

  // Склеиваем дефисные переносы строк из PDF (например, "валенти-новна" → "валентиновна")
  normalized = normalized.replace(/([а-я]{2,})-([а-я]{2,})/g, (match, p1, p2) => {
    if (/^(?:новна|ровна|евна|овна|ична|инична|вич|ович|евич|ва|ова|ева|ина|ына|ин|ын|ский|ская|цкая|цкий|баев|баева|бург)$/i.test(p2)) {
      return p1 + p2
    }
    if (/^(?:валенти|александ|владими|мордвино|краковс|оболенс|сенашен|переведен|денисо|крюко)$/i.test(p1)) {
      return p1 + p2
    }
    return match
  })

  normalized = normalized.replace(/[,;.]+/g, ' ')
  normalized = normalized.replace(/[\u00a0\s]+/g, ' ').trim()
  normalized = fixJudgeScriptHomoglyphs(normalized)

  // Исправляем типичные OCR-разрывы слов в фамилиях, именах и отчествах
  normalized = normalized
    .replace(/(?<=^|\s)ч\s+айковс/giu, 'чайковс')
    .replace(/(?<=^|\s)м\s+ордвинов/giu, 'мордвинов')
    .replace(/(?<=^|\s)к\s+раковск/giu, 'краковск')
    .replace(/(?<=^|\s)мищенк\s+о(?=\s|$)/g, 'мищенко')
    .replace(/(?<=^|\s)чайковс\s+кая(?=\s|$)/g, 'чайковская')
    .replace(/(?<=^|\s)гаврило\s+ва(?=\s|$)/g, 'гаврилова')
    .replace(/(?<=^|\s)гиндулл\s+ина(?=\s|$)/g, 'гиндуллина')
    .replace(/(?<=^|\s)корнеев\s+а(?=\s|$)/g, 'корнеева')
    .replace(/(?<=^|\s)соловье\s+ва(?=\s|$)/g, 'соловьева')
    .replace(/(?<=^|\s)горбаче\s+вский(?=\s|$)/g, 'горбачевский')
    .replace(/(?<=^|\s)городил\s+ов(?=\s|$)/g, 'городилов')
    .replace(/(?<=^|\s)игнатов\s+ич(?=\s|$)/g, 'игнатович')
    .replace(/(?<=^|\s)котельн\s+икова(?=\s|$)/g, 'котельникова')
    .replace(/(?<=^|\s)краковс\s+кая(?=\s|$)/g, 'краковская')
    .replace(/(?<=^|\s)кудрявц\s+ева(?=\s|$)/g, 'кудрявцева')
    .replace(/(?<=^|\s)кулешо\s+ва(?=\s|$)/g, 'кулешова')
    .replace(/(?<=^|\s)матвеев\s+а(?=\s|$)/g, 'матвеева')
    .replace(/(?<=^|\s)оболенс\s+кая(?=\s|$)/g, 'оболенская')
    .replace(/(?<=^|\s)овсянни\s+кова(?=\s|$)/g, 'овсянникова')
    .replace(/(?<=^|\s)переведе\s+нцева(?=\s|$)/g, 'переведенцева')
    .replace(/(?<=^|\s)романе\s+нкова(?=\s|$)/g, 'романенкова')
    .replace(/(?<=^|\s)силаков\s+а(?=\s|$)/g, 'силакова')
    .replace(/(?<=^|\s)трофим\s+ов(?=\s|$)/g, 'трофимов')
    .replace(/(?<=^|\s)хамитов\s+а(?=\s|$)/g, 'хамитова')
    .replace(/(?<=^|\s)хмаро\s+ва(?=\s|$)/g, 'хмарова')
    .replace(/(?<=^|\s)сударико\s+ва(?=\s|$)/g, 'сударикова')
    .replace(/(?<=^|\s)владим\s+ир(?=\s|$)/g, 'владимир')
    .replace(/(?<=^|\s)алексан\s+др(?=\s|$)/g, 'александр')
    .replace(/(?<=^|\s)станисл\s+ав(?=\s|$)/g, 'станислав')
    .replace(/(?<=^|\s)екатери\s+на(?=\s|$)/g, 'екатерина')
    .replace(/(?<=^|\s)владим\s+ировна(?=\s|$)/g, 'владимировна')
    .replace(/(?<=^|\s)рашидо\s+вна(?=\s|$)/g, 'рашидовна')
    .replace(/(?<=^|\s)адольф\s+овна(?=\s|$)/g, 'адольфовна')
    .replace(/(?<=^|\s)ренатов\s+на(?=\s|$)/g, 'ренатовна')
    .replace(/(?<=^|\s)николае\s+вна(?=\s|$)/g, 'николаевна')
    .replace(/(?<=^|\s)алексеев\s+ич(?=\s|$)/g, 'алексеевич')
    .replace(/(?<=^|\s)аркадье\s+вич(?=\s|$)/g, 'аркадьевич')
    .replace(/(?<=^|\s)капитон\s+овна(?=\s|$)/g, 'капитоновна')
    .replace(/(?<=^|\s)анатоль\s+евна(?=\s|$)/g, 'анатольевна')
    .replace(/(?<=^|\s)иосифо\s+вна(?=\s|$)/g, 'иосифовна')
    .replace(/(?<=^|\s)евгеньев\s+ич(?=\s|$)/g, 'евгеньевич')
    .replace(/(?<=^|\s)алексан\s+дровна(?=\s|$)/g, 'александровна')
    .replace(/(?<=^|\s)валерьев\s+на(?=\s|$)/g, 'валерьевна')
    .replace(/(?<=^|\s)фирдаус\s+овна(?=\s|$)/g, 'фирдаусовна')
    .replace(/(?<=^|\s)энгельсовн\s+а(?=\s|$)/g, 'энгельсовна')
    .replace(/(?<=^|\s)владими\s+рович(?=\s|$)/g, 'владимирович')
    .replace(/(?<=^|\s)валенти\s+нович(?=\s|$)/g, 'валентинович')
    .replace(/(?<=^|\s)викторов\s+на(?=\s|$)/g, 'викторовна')
    .replace(/(?<=^|\s)([а-я]{3,})ов\s+на(?=\s|$)/g, '$1овна')
    .replace(/(?<=^|\s)([а-я]{3,})ев\s+на(?=\s|$)/g, '$1евна')
    .replace(/(?<=^|\s)([а-я]{3,})ин\s+ич(?=\s|$)/g, '$1инична')
    .replace(/(?<=^|\s)([а-я]{3,})ск\s+ая(?=\s|$)/g, '$1ская')
    .replace(/(?<=^|\s)([а-я]{3,})цк\s+ая(?=\s|$)/g, '$1цкая')
    .replace(/(?<=^|\s)([а-я]{3,})ск\s+ий(?=\s|$)/g, '$1ский')
    .replace(/(?<=^|\s)([а-я]{3,})цк\s+ий(?=\s|$)/g, '$1цкий')

  let words = normalized.split(/\s+/).filter(Boolean)
  words = words.map((word) => {
    if (TOKEN_TYPOS[word]) return TOKEN_TYPOS[word]
    if (word.length >= 10) {
      const match = word.match(/^(.*?(?:ова|ева|ина|ына|ская|цкая|ский|цкий))([а-я]{3,})$/iu)
      if (match) {
        const [, surname, name] = match
        if (COMMON_GIVEN_NAMES.has(name) && surname.length >= 5) {
          return `${surname} ${name}`
        }
      }
    }
    if (/^[a-z]+$/i.test(word) && LATIN_GIVEN_CANON[word]) {
      return LATIN_GIVEN_CANON[word]
    }
    return word
  })

  // Фильтр повторения ФИО
  if (words.length >= 3 && words[0] === words[words.length - 1]) {
    words = words.slice(0, -1)
  }
  if (words.length === 4 && words[0] === words[2] && words[1] === words[3]) {
    words = words.slice(0, 2)
  }
  if (words.length === 6 && words[0] === words[3] && words[1] === words[4] && words[2] === words[5]) {
    words = words.slice(0, 3)
  }
  if (words.length >= 4 && words.slice(0, 2).join(' ') === words.slice(-2).join(' ')) {
    words = words.slice(0, -2)
  }

  normalized = words.join(' ').trim()

  // Если осталась чистая порода, шум или менее 2 слов (нет связки Фамилия+Имя) — отсекаем
  if (!normalized || KNOWN_BREED_AND_NOISE_PHRASES.includes(normalized) || normalized.length < 4) {
    return ''
  }
  const finalWords = normalized.split(' ').filter((w) => w.length > 0 && !/^[-–—]+$/.test(w))
  if (finalWords.length < 2) {
    return ''
  }

  return finalWords.join(' ').trim()
}

export interface ShowJudgeNameParts {
  last: string
  first: string
  middle: string
  firstInitial: string
  middleInitial: string
}

export function parseShowJudgeNameParts(normalized: string): ShowJudgeNameParts {
  const parts = normalized.split(/\s+/).filter(Boolean)
  const joined = parts.join('')
  const lat = (joined.match(/[a-z]/gi) || []).length
  const cyr = (joined.match(/[а-я]/gi) || []).length

  // Западные записи на латинице: определяем порядок Given Last vs Surname Given
  if (lat > cyr && parts.length >= 2) {
    const pFirst = parts[0] || ''
    const pLast = parts[parts.length - 1] || ''

    const pFirstIsSlavicSurname = /(?:ova|eva|ina|yna|ov|ev|in|yn|skaya|skiy|sky|ckiy|tsky|enko|ykh|ikh|ich|chuk)$/i.test(pFirst)
    const pLastIsSlavicSurname = /(?:ova|eva|ina|yna|ov|ev|in|yn|skaya|skiy|sky|ckiy|tsky|enko|ykh|ikh|ich|chuk)$/i.test(pLast)

    if (
      (COMMON_LATIN_GIVEN_NAMES.has(pLast) && !COMMON_LATIN_GIVEN_NAMES.has(pFirst)) ||
      (pFirstIsSlavicSurname && !pLastIsSlavicSurname && !COMMON_LATIN_GIVEN_NAMES.has(pFirst))
    ) {
      // Порядок Surname Given: "Lychkovskaya Natalya", "Olkova Juliya"
      const last = pFirst
      const first = pLast
      const middle = parts.length > 2 ? parts.slice(1, -1).join(' ') : ''
      return {
        last,
        first,
        middle,
        firstInitial: first ? first.replace(/\./g, '').charAt(0) : '',
        middleInitial: middle ? middle.replace(/\./g, '').charAt(0) : '',
      }
    } else {
      // Порядок Given [Middle] Surname: "Natalia Lychkovskaya", "Dusan Paunovic", "Juliya Olkova"
      const first = pFirst
      const last = pLast
      const middle = parts.length > 2 ? parts.slice(1, -1).join(' ') : ''
      return {
        last,
        first,
        middle,
        firstInitial: first ? first.replace(/\./g, '').charAt(0) : '',
        middleInitial: middle ? middle.replace(/\./g, '').charAt(0) : '',
      }
    }
  }

  // Кириллические записи
  // Проверяем порядок, когда первым словом идёт отчество (например "Сергеевич Белкин Алексей", "Викторовна Белкина Елена", "Васильевна Сенашенко Екатерина")
  if (parts.length >= 3 && /(?:ович|евич|овна|евна|ична|инична)$/iu.test(parts[0])) {
    const middle = parts[0]
    if (COMMON_GIVEN_NAMES.has(parts[2])) {
      // [Отчество] [Фамилия] [Имя]
      const last = parts[1]
      const first = parts[2]
      return {
        last,
        first,
        middle,
        firstInitial: first ? first.replace(/\./g, '').charAt(0) : '',
        middleInitial: middle ? middle.replace(/\./g, '').charAt(0) : '',
      }
    } else if (COMMON_GIVEN_NAMES.has(parts[1])) {
      // [Отчество] [Имя] [Фамилия]
      const first = parts[1]
      const last = parts.slice(2).join(' ')
      return {
        last,
        first,
        middle,
        firstInitial: first ? first.replace(/\./g, '').charAt(0) : '',
        middleInitial: middle ? middle.replace(/\./g, '').charAt(0) : '',
      }
    } else if (/(?:ова|ева|ина|ына|ская|цкая|ов|ев|ин|ын|ский|цкий|ых|их|енко|ян|дзе|швили)$/iu.test(parts[1])) {
      // [Отчество] [Фамилия] [Имя] по фамильному суффиксу
      const last = parts[1]
      const first = parts.slice(2).join(' ')
      return {
        last,
        first,
        middle,
        firstInitial: first ? first.replace(/\./g, '').charAt(0) : '',
        middleInitial: middle ? middle.replace(/\./g, '').charAt(0) : '',
      }
    } else if (/(?:ова|ева|ина|ына|ская|цкая|ов|ев|ин|ын|ский|цкий|ых|их|енко|ян|дзе|швили)$/iu.test(parts[2])) {
      // [Отчество] [Имя] [Фамилия] по фамильному суффиксу
      const first = parts[1]
      const last = parts.slice(2).join(' ')
      return {
        last,
        first,
        middle,
        firstInitial: first ? first.replace(/\./g, '').charAt(0) : '',
        middleInitial: middle ? middle.replace(/\./g, '').charAt(0) : '',
      }
    }
  }

  // Проверяем порядок [Имя] [Отчество] [Фамилия] (например "Екатерина Васильевна Сенашенко")
  if (parts.length >= 3 && /(?:ович|евич|овна|евна|ична|инична)$/iu.test(parts[1])) {
    const first = parts[0]
    const middle = parts[1]
    const last = parts.slice(2).join(' ')
    return {
      last,
      first,
      middle,
      firstInitial: first ? first.replace(/\./g, '').charAt(0) : '',
      middleInitial: middle ? middle.replace(/\./g, '').charAt(0) : '',
    }
  }

  // Проверяем порядок [Имя] [Фамилия] (например "Алексей Белкин", "Наталья Лычковская")
  if (parts.length === 2 && COMMON_GIVEN_NAMES.has(parts[0]) && !COMMON_GIVEN_NAMES.has(parts[1])) {
    const first = parts[0]
    const last = parts[1]
    return {
      last,
      first,
      middle: '',
      firstInitial: first ? first.replace(/\./g, '').charAt(0) : '',
      middleInitial: '',
    }
  }

  // По умолчанию для кириллицы: [Фамилия] [Имя] [Отчество]
  const last = parts[0] || ''
  const first = parts[1] || ''
  const middle = parts[2] || ''
  return {
    last,
    first,
    middle,
    firstInitial: first ? first.replace(/\./g, '').charAt(0) : '',
    middleInitial: middle ? middle.replace(/\./g, '').charAt(0) : '',
  }
}

/** Транслитерация славянских фамилий в кириллицу. */
export function translitLatSurname(lat: string): string | null {
  let s = lat.toLowerCase()
  s = s.replace(/skaya$/, 'ская')
  s = s.replace(/skiy$/, 'ский')
  s = s.replace(/sky$/, 'ский')
  s = s.replace(/ckiy$/, 'цкий')
  s = s.replace(/tsky$/, 'цкий')
  s = s.replace(/ova$/, 'ова')
  s = s.replace(/eva$/, 'ева')
  s = s.replace(/ina$/, 'ина')
  s = s.replace(/yna$/, 'ына')
  s = s.replace(/ov$/, 'ов')
  s = s.replace(/ev$/, 'ев')
  s = s.replace(/in$/, 'ин')
  s = s.replace(/yn$/, 'ын')
  s = s.replace(/enko$/, 'енко')
  s = s.replace(/ykh$/, 'ых')
  s = s.replace(/ikh$/, 'их')
  s = s.replace(/chuk$/, 'чук')
  s = s.replace(/ich$/, 'ич')

  const isSlavic =
    /(?:ская|ский|цкий|ова|ева|ина|ына|ов|ев|ин|ын|енко|ых|их|чук|ич)$/.test(s) ||
    ['zhuk', 'dudko', 'shiyan', 'khomasuridze', 'sedykh'].includes(s)
  if (!isSlavic) return null

  s = s
    .replaceAll('shch', 'щ')
    .replaceAll('zh', 'ж')
    .replaceAll('ch', 'ч')
    .replaceAll('sh', 'ш')
    .replaceAll('kh', 'х')
    .replaceAll('ts', 'ц')
    .replaceAll('ya', 'я')
    .replaceAll('yu', 'ю')
    .replaceAll('ia', 'я')
    .replaceAll('iu', 'ю')
    .replaceAll('ij', 'ий')
    .replaceAll('iy', 'ий')
    .replaceAll('a', 'а')
    .replaceAll('b', 'б')
    .replaceAll('v', 'в')
    .replaceAll('w', 'в')
    .replaceAll('g', 'г')
    .replaceAll('d', 'д')
    .replaceAll('e', 'е')
    .replaceAll('z', 'з')
    .replaceAll('i', 'и')
    .replaceAll('j', 'й')
    .replaceAll('k', 'к')
    .replaceAll('l', 'л')
    .replaceAll('m', 'м')
    .replaceAll('n', 'н')
    .replaceAll('o', 'о')
    .replaceAll('p', 'п')
    .replaceAll('r', 'р')
    .replaceAll('s', 'с')
    .replaceAll('t', 'т')
    .replaceAll('u', 'у')
    .replaceAll('f', 'ф')
    .replaceAll('x', 'кс')
    .replaceAll("'", 'ь')
    .replace(/([бвгджзклмнпрстфхцчшщ])y/g, '$1ы')
    .replaceAll('y', 'и')

  return s
}

/** Ключ: фамилия|имя|отчество. Для латиницы сохраняется полное given name для предотвращения ложных слияний (например, Natalia/Nikolay Sedykh). */
export function showJudgeMergeKey(parts: ShowJudgeNameParts): string {
  const latinGiven = /^[a-z]/i.test(parts.first) && parts.first.length > 1
  const firstKey = latinGiven ? parts.first : parts.firstInitial
  const middle = parts.middleInitial || '*'
  return `${parts.last}|${firstKey}|${middle}`
}

export function showJudgeMergeKeyFromRaw(raw: string): string {
  return showJudgeMergeKey(parseShowJudgeNameParts(normalizeShowJudgeDisplayName(raw)))
}
