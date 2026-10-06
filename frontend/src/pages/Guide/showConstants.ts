/** Справочник по выставкам (conformation) — источники РКФ / FCI. */

export const SHOW_OFFICIAL_SOURCES = [
  {
    label: 'Список титулов и принятые сокращения в родословных РКФ',
    href: 'https://rkf.org.ru/wp-content/uploads/2023/12/polozhenie_o_titulakh_rkf.pdf',
    note: 'Официальный эталон РКФ: международные (FCI), кумулятивные (ACH/GCH/CH), виннеры («Россия», «Евразия», Кубок Москвы) и монопородные титулы (разд. 1, 2, 3)',
  },
  {
    label: 'Положение о сертификатных выставках РКФ (ред. 18.12.2024)',
    href: 'https://help.rkf.online/ru/knowledge_base/art/2427/cat/489/polozenie-o-sertifikatnih-vistavkah-rkf-dejstvuet-do-31122025',
    note: 'В силу с 01.01.2025. Ранги, классы, оценки, сертификаты CAC/CACIB, BOB, BIG, BIS',
  },
  {
    label: 'Положение о титулах РКФ',
    href: 'https://help.rkf.online/ru/knowledge_base/art/695/cat/489/',
    note: 'Оформление Чемпиона России, Чемпиона РКФ, юных и ветеранов по красоте',
  },
  {
    label: 'Каталог положений РКФ',
    href: 'https://rkf.org.ru/dressirovka-i-sport/polozhenija/',
    note: 'Актуальные редакции документов',
  },
  {
    label: 'FCI — Regulations for Dog Shows (EXP-REG)',
    href: 'https://www.fci.be/medias/EXP-REG-en-20270101-22481.pdf',
    note: 'Международные правила выставок FCI (англ.)',
  },
] as const

/** Ранги выставок в системе РКФ (п. 1.2 Положения о сертификатных выставках). */
export const SHOW_RANKS = [
  {
    rank: 'CACIB FCI',
    scope: 'Интернациональная всепородная',
    certs: 'CACIB, JCACIB, CAC (все CW взрослых классов)',
  },
  {
    rank: 'ЧРКФ ОС',
    scope: 'Национальная, «Чемпион РКФ с особым статусом»',
    certs: 'ЧРКФ, ЮЧРКФ, CAC (по правилам ранга)',
  },
  {
    rank: 'CAC ЧРКФ / ЧРКФ',
    scope: 'Национальная всепородная «Чемпион РКФ»',
    certs: 'ЧРКФ, CAC — победителям сравнения CW',
  },
  {
    rank: 'CAC ЧФ / ЧФ',
    scope: '«Чемпион федерации»',
    certs: 'ЧФ, CAC — по правилам ранга',
  },
  {
    rank: 'CAC (группа пород)',
    scope: 'Национальная по группе FCI',
    certs: 'CAC кобелю и суке — 1-е в сравнении CW',
  },
  {
    rank: 'Монопородные',
    scope: 'КЧК, КЧК КК, ПК / ПП',
    certs: 'Клубные сертификаты и победители года',
  },
] as const

export const SHOW_CERTIFICATES = [
  { level: 'Международный', code: 'CACIB' },
  { level: 'Национальный', code: 'CAC' },
  { level: 'Юниорский', code: 'JCAC' },
  { level: 'Ветеранский', code: 'VCAC' },
] as const

/** Награды и титулы, присваиваемые на выставке (карточки). */
export const SHOW_EVENT_TITLES = [
  {
    abbr: 'BIS',
    title: 'Best in Show',
    condition: 'Лучшая собака выставки — финал главного ринга среди обладателей BIG',
    ref: 'Положение о сертификатных выставках, главный ринг',
  },
  {
    abbr: 'BOB',
    title: 'Best of Breed / ЛПП',
    condition: 'Лучший представитель породы (сравнение CW юниоров, взрослых, ветеранов)',
    ref: 'Положение о сертификатных выставках, ринг породы',
  },
  {
    abbr: 'ЧРКФ',
    title: 'Чемпион РКФ (диплом дня)',
    condition: 'Диплом на выставках ранга ЧРКФ / CAC ЧРКФ (не путать с оформлением титула в РКФ)',
    ref: 'Положение о сертификатных выставках, ранги',
  },
  {
    abbr: 'ЧФ',
    title: 'Чемпион федерации',
    condition: 'На выставках ранга CAC ЧФ / ЧФ',
    ref: 'Положение о сертификатных выставках, ранги',
  },
] as const

export const SHOW_CLASSES = [
  { name: 'Беби', note: 'Оценки «перспективный» / «очень перспективный»' },
  { name: 'Щенки', note: 'До установленного возраста породы' },
  { name: 'Юниоры', note: 'JCAC, BOB junior; сертификаты юных чемпионов' },
  { name: 'Промежуточный', note: 'CAC / CACIB при CW + «отлично»' },
  { name: 'Открытый', note: 'Основной класс для взрослых без титула чемпиона' },
  { name: 'Рабочий', note: 'Для чемпионов с рабочими сертификатами (если предусмотрено)' },
  { name: 'Чемпионов', note: 'Собаки с оформленными чемпионскими титулами' },
  { name: 'Ветераны', note: 'VCAC, BOB veteran' },
] as const

/**
 * Приоритет наград на одной выставке (главный ринг → порода → сертификаты).
 * Сверху — реже и престижнее. Используется в UI рейтинга выставок.
 */
export const SHOW_EVENT_AWARDS_PRIORITY = [
  {
    rank: 1,
    abbr: 'BIS',
    title: 'Best in Show — лучшая собака выставки',
    points: '10 000 очков',
    note: 'Финал главного ринга среди обладателей BIG',
  },
  {
    rank: 2,
    abbr: 'BIG',
    title: 'Best in Group — лучшая в группе FCI',
    points: '5 000 очков',
    note: 'Сравнение BOB всех пород группы (топ-3)',
  },
  {
    rank: 3,
    abbr: 'BIS-Ю / BIS-В / BIS-Щ / BIS-Б',
    title: 'Лучший юниор / ветеран / щенок / беби выставки',
    points: '2 500 – 3 500 очков',
    note: 'Главный ринг (не путать с ЛЮ/ЛВ/ЛЩ/ЛБ породы). Юниор: 3500, Ветеран: 3200, Щенок: 2800, Беби: 2500',
  },
  {
    rank: 4,
    abbr: 'ЛПП',
    title: 'Лучший представитель породы (BOB)',
    points: '2 000 очков',
    note: 'Сравнение ЛЮ, ЛВ, лучших взрослых; в протоколе часто «ЛПП (BOB)»',
  },
  {
    rank: 5,
    abbr: 'ЛППП',
    title: 'Лучший противоположного пола (BOS)',
    points: '1 500 очков',
    note: 'После ЛПП; в протоколе «ЛППП (BOS)»',
  },
  {
    rank: 6,
    abbr: 'ЛБ / ЛЩ / ЛЮ / ЛВ',
    title: 'Лучший беби / щенок / юниор / ветеран породы',
    points: '800 – 900 очков',
    note: 'Сравнение CW кобеля и суки соответствующего класса. ЛЮ: 900, ЛВ: 850, ЛБ/ЛЩ: 800',
  },
  {
    rank: 7,
    abbr: 'CACIB',
    title: 'Сертификат кандидата в интернациональные чемпионы красоты (FCI)',
    points: '500 очков',
    note: 'Только CACIB FCI; кобелю и суке среди обладателей CAC взрослых классов',
  },
  {
    rank: 8,
    abbr: 'CAC / JCAC / VCAC',
    title: 'Национальные сертификаты (взрослые / юниоры / ветераны)',
    points: '70 – 100 очков',
    note: 'Сертификаты кандидата в чемпионы (CAC: 100, JCAC: 80, VCAC: 70) — шаг к титулам в РКФ',
  },
  {
    rank: 9,
    abbr: 'ЧРКФ / КЧК / КЧП / П…',
    title: 'Дипломы и победители дня (ЧРКФ, клубные, П «России»/Москвы…)',
    points: '28 – 60 очков',
    note: 'Зависят от ранга выставки: ЧРКФ (60), П «России» (55), П Москвы (50), КЧК/КЧП (35)',
  },
  {
    rank: 10,
    abbr: 'CW',
    title: 'Class Winner — победитель класса',
    points: '40 очков',
    note: 'Первое место в классе при оценке не ниже «очень хорошо»; база для CAC/сравнений',
  },
  {
    rank: 11,
    abbr: 'R.CACIB / R.CAC / R.JCAC',
    title: 'Резервные сертификаты',
    points: '25 – 200 очков',
    note: 'Только если присуждён основной. R.CACIB (200), R.CAC (40), R.JCAC (30), R.VCAC (25)',
  },
] as const

/** Кумулятивные титулы по красоте и абсолютные звания (оформление в РКФ по набору сертификатов). */
export const SHOW_CHAMPIONSHIP_TITLES = [
  {
    abbr: 'ACH RUS',
    title: 'Absolute Russian Champion (Абсолютный чемпион России)',
    summary: 'Высшая вершина в системе РКФ: Чемпион России (CH RUS) + Гранд Чемпион (GCH RUS) + Интерчемпион (C.I.B. или C.I.E.)',
    ref: 'Список титулов РКФ, разд. 2.1',
  },
  {
    abbr: 'GCH RUS',
    title: 'Russian Grand Champion (Гранд чемпион России)',
    summary: 'Чемпион России + Чемпион РКФ + Чемпион НКП (или по набору дипломов главных выставок страны)',
    ref: 'Список титулов РКФ, разд. 2.1',
  },
  {
    abbr: 'C.I.B. / C.I.B.P.',
    title: 'International Beauty Champion / Beauty & Performance (FCI)',
    summary: 'C.I.B. — 4 × CACIB у 3 судей из 3 стран (≥ 1 год). C.I.B.P. — 2 × CACIB + 2 × CACIL (для борзых)',
    ref: 'Список титулов РКФ, разд. 1.2; регламент FCI',
  },
  {
    abbr: 'CH RUS (ЧР)',
    title: 'Чемпион России по красоте (Russian Champion)',
    summary: '4 × CAC у 4 разных судей на CAC/CACIB (≥ 1 год между первым и последним)',
    ref: 'Список титулов РКФ, разд. 2.2; Положение о титулах РКФ',
  },
  {
    abbr: 'JCH RUS (ЮЧР)',
    title: 'Юный чемпион России (Russian Junior Champion)',
    summary: '3 × JCAC у 3 судей в классе юниоров',
    ref: 'Список титулов РКФ, разд. 2.2; Положение о титулах РКФ',
  },
  {
    abbr: 'VCH RUS (ВЧР)',
    title: 'Ветеран чемпион России (Russian Veteran Champion)',
    summary: '3 × VCAC у 3 судей в классе ветеранов',
    ref: 'Список титулов РКФ, разд. 2.2; Положение о титулах РКФ',
  },
  {
    abbr: 'CH RKF (ЧРКФ)',
    title: 'Чемпион РКФ (RKF Champion)',
    summary: '1 × диплом ЧРКФ или 3 × ЧФ разных федераций; на титульной выставке ЧРКФ',
    ref: 'Список титулов РКФ, разд. 2.4; Положение о титулах РКФ',
  },
  {
    abbr: 'ACH CLUB',
    title: 'National Breed Club Absolute Champion (Абсолютный чемпион НКП)',
    summary: 'Чемпион НКП по выставкам (CH CLUB) + Чемпион НКП по рабочим качествам / курсингу',
    ref: 'Список титулов РКФ, разд. 2.5',
  },
  {
    abbr: 'CH CLUB (ЧК)',
    title: 'Чемпион национального клуба породы (Club Champion)',
    summary: 'Оформляется по сертификатам КЧК монопородных выставок НКП',
    ref: 'Список титулов РКФ, разд. 2.5',
  },
] as const

export const SHOW_FEATURE_NOTES = [
  {
    label: 'Классы',
    text: 'Беби, щенки, юниоры, промежуточный, открытый, рабочий, чемпионов, ветераны — сначала кобели, затем суки.',
    ref: 'Положение о сертификатных выставках, п. 8.2',
  },
  {
    label: 'Оценки',
    text: 'От «отлично» до «удовлетворительно»; CW и сертификаты — при «очень хорошо» и выше.',
    ref: 'Положение о сертификатных выставках, п. 9.2–9.3',
  },
  {
    label: 'Ринг породы',
    text: 'Классы → CW → BOB / BOS → CAC / CACIB / JCAC по правилам ранга.',
    ref: 'Положение о сертификатных выставках, п. 9.4–9.5',
  },
  {
    label: 'Названия пород на сайте',
    text: 'Sentence case, не капс протокола. Левретка / малинуа / кане-корсо / гальго — обиходный чип; полное имя в tooltip. Тип шерсти не угадываем: без маркера → «тип не указан».',
    ref: 'breedMapping.ts; 03-DATA.md',
  },
] as const

export const SHOW_GRADES = [
  { grade: 'Отлично', en: 'Excellent', ribbon: 'красная' },
  { grade: 'Очень хорошо', en: 'Very good', ribbon: 'синяя' },
  { grade: 'Хорошо', en: 'Good', ribbon: 'зелёная' },
  { grade: 'Удовлетворительно', en: 'Satisfactory', ribbon: 'жёлтая' },
] as const

export const SHOW_ABBREVIATIONS = [
  { abbr: 'ACH RUS', full: 'Absolute Russian Champion (Абсолютный чемпион России — высший кумулятивный титул РКФ)' },
  { abbr: 'GCH RUS', full: 'Russian Grand Champion (Гранд чемпион России)' },
  { abbr: 'JGCH RUS', full: 'Russian Junior Grand Champion (Юный гранд чемпион России)' },
  { abbr: 'VGCH RUS', full: 'Russian Veteran Grand Champion (Ветеран гранд чемпион России)' },
  { abbr: 'CH RUS', full: 'Russian Champion (Чемпион России по красоте)' },
  { abbr: 'JCH RUS', full: 'Russian Junior Champion (Юный чемпион России)' },
  { abbr: 'VCH RUS', full: 'Russian Veteran Champion (Ветеран чемпион России)' },
  { abbr: 'CH RKF', full: 'RKF Champion (Чемпион РКФ по красоте)' },
  { abbr: 'JCH RKF', full: 'RKF Junior Champion (Юный чемпион РКФ)' },
  { abbr: 'VCH RKF', full: 'RKF Veteran Champion (Ветеран чемпион РКФ)' },
  { abbr: 'ACH CLUB', full: 'National Breed Club Absolute Champion (Абсолютный чемпион НКП)' },
  { abbr: 'CH CLUB', full: 'National Breed Club Champion (Чемпион национального клуба породы)' },
  { abbr: 'JCH CLUB', full: 'National Breed Club Junior Champion (Юный чемпион НКП)' },
  { abbr: 'VCH CLUB', full: 'National Breed Club Veteran Champion (Ветеран чемпион НКП)' },
  { abbr: 'C.I.B.', full: 'International Beauty Champion FCI (Интернациональный чемпион по красоте)' },
  { abbr: 'C.I.E.', full: 'International Show Champion FCI (Интернациональный шоу-чемпион)' },
  { abbr: 'C.I.B.P.', full: 'International Beauty & Performance Champion (Интерчемпион по красоте и курсингу борзых)' },
  { abbr: 'WW', full: 'World Winner (Победитель Всемирной выставки собак FCI)' },
  { abbr: 'EW', full: 'European Winner (Победитель Европейской секции FCI)' },
  { abbr: 'EAW', full: 'Eurasian Winner (Победитель выставки «Евразия»)' },
  { abbr: 'MW', full: 'Moscow Winner (Победитель «Кубка Москвы»)' },
  { abbr: 'RW', full: 'Russian Winner (Победитель выставки «Россия»)' },
  { abbr: 'BW RUS', full: 'National Breed Winner (Победитель Национальной выставки породы года)' },
  { abbr: 'BIS', full: 'Best in Show — лучшая собака выставки' },
  { abbr: 'BIG', full: 'Best in Group — лучшая собака группы FCI' },
  { abbr: 'BIS-Ю', full: 'Лучший юниор выставки (BIS Junior) — главный ринг, не ЛЮ породы' },
  { abbr: 'BIS-Щ', full: 'Лучший щенок выставки (BIS Puppy) — главный ринг, не ЛЩ породы' },
  { abbr: 'BIS-Б', full: 'Лучший беби выставки (BIS Baby) — главный ринг, не ЛБ породы' },
  { abbr: 'BIS-В', full: 'Лучший ветеран выставки (BIS Veteran) — главный ринг, не ЛВ породы' },
  { abbr: 'ЛПП', full: 'Лучший представитель породы (= BOB)' },
  { abbr: 'ЛППП', full: 'Лучший представитель противоположного пола (= BOS)' },
  { abbr: 'ЛБ', full: 'Лучший беби породы (Best Baby)' },
  { abbr: 'ЛЩ', full: 'Лучший щенок породы (Best Puppy)' },
  { abbr: 'ЛЮ', full: 'Лучший юниор породы (Best Junior)' },
  { abbr: 'ЛВ', full: 'Лучший ветеран породы (Best Veteran)' },
  { abbr: 'BOB', full: 'Best of Breed — то же, что ЛПП' },
  { abbr: 'BOS', full: 'Best of Opposite Sex — то же, что ЛППП' },
  { abbr: 'CACIB', full: 'Certificat d’Aptitude au Championnat International de Beauté' },
  { abbr: 'CAC', full: 'Certificat d’Aptitude au Championnat (кандидат в чемпионы России)' },
  { abbr: 'JCAC', full: 'Junior CAC — кандидат в юные чемпионы России' },
  { abbr: 'VCAC', full: 'Veteran CAC — кандидат в чемпионы-ветераны' },
  { abbr: 'CW', full: 'Class Winner — победитель класса' },
  { abbr: 'R.CAC', full: 'Резервный CAC' },
  { abbr: 'ОТЛ', full: 'Отлично (Excellent)' },
  { abbr: 'ОЧ.ХОР', full: 'Очень хорошо (Very good); в PDF иногда обрывок «ХО»' },
  { abbr: 'ХОР', full: 'Хорошо (Good)' },
  { abbr: 'НЯ', full: 'Неявка — заявка без участия в ринге' },
  { abbr: 'Б/О', full: 'Без оценки — судья не отсудил (поведение, здоровье, снятие и т.п.)' },
  { abbr: 'ДСК', full: 'Дисквалификация' },
  { abbr: 'R.CACIB', full: 'Резервный CACIB' },
  { abbr: 'R.JCAC', full: 'Резервный JCAC' },
  { abbr: 'ЧРКФ', full: 'Чемпион РКФ (диплом на выставке)' },
  { abbr: 'ЮЧРКФ', full: 'Юный чемпион РКФ' },
  { abbr: 'ВЧРКФ', full: 'Ветеран-чемпион РКФ' },
  { abbr: 'КЧК', full: 'Кандидат в чемпионы клуба (НКП)' },
  { abbr: 'КЧП', full: 'Кандидат в чемпионы породы (без НКП)' },
  { abbr: 'СС', full: 'Сертификат соответствия' },
  { abbr: 'ЮСС', full: 'Юный сертификат соответствия' },
  { abbr: 'П «России»', full: 'Победитель выставки «Россия»' },
  { abbr: 'П Москвы', full: 'Победитель Кубка / выставки Москвы' },
] as const

export const SHOW_ABBR_LOOKUP = Object.fromEntries(SHOW_ABBREVIATIONS.map((row) => [row.abbr, row.full]))
