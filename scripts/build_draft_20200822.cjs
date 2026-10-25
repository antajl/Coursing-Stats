const fs = require('fs');

const event = {
  id: 20200822,
  year: 2020,
  date_start: "2020-08-22",
  date_end: "2020-08-23",
  title: "Международный чемпионат по курсингу CACIL & Чемпионат РКФ - CACL",
  full_title: "Международный чемпионат по курсингу CACIL & Чемпионат РКФ - CACL, 22-23.08.2020 (Московская обл., д. Суханово)",
  rank_label: "Международный чемпионат по курсингу CACIL & Чемпионат РКФ - CACL",
  event_type: "coursing",
  competition_kind: "CACIL / CACL",
  competition_type: "Курсинг борзых",
  host_club: null,
  region: "Московская область",
  location: "Московская область, Ленинский район, д. Суханово",
  protocol_location: "Московская обл., д. Суханово",
  judges: "Козлова И.В., Иванова Г.С., Вронская О.В.",
  results_url: "http://procoursing.ru/results/2020-08-22_CRKF/",
  catalog_url: null,
  confirmed: 1
};

// All transcribed dogs from crkf_slice_00 through crkf_slice_08:
const dogsData = [
  // Басенджи Кобели
  {
    catalog_no: 2, breed: "Басенджи", className: "Стандартный", sex: "Кобель",
    name: "ИТУРИ ПАЗЗЛ ЕКСТРАОРДИНАРИ СМАРТ",
    h1: { heat: 84, color: "white", j1: [17, 17, 17, 17, 17], j2: [17, 18, 17, 16, 18], total: 171 },
    h2: { heat: 104, color: "red", j1: [17, 18, 17, 18, 18], j2: [18, 18, 18, 18, 18], total: 178 },
    score: 349, place: 1, vc: "CC", title: "Чемпион РКФ"
  },
  {
    catalog_no: 3, breed: "Басенджи", className: "Стандартный", sex: "Кобель",
    name: "KASPER VAN DEAN",
    h1: { heat: 83, color: "red", j1: [17, 18, 17, 17, 17], j2: [18, 17, 17, 18, 18], total: 174 },
    h2: { heat: 105, color: "red", j1: [17, 17, 16, 18, 17], j2: [17, 17, 18, 17, 18], total: 172 },
    score: 346, place: 2, vc: "CC", title: "CACL"
  },
  {
    catalog_no: 1, breed: "Басенджи", className: "Стандартный", sex: "Кобель",
    name: "ИТУРИ ПАЗЗЛ ИЗЮМ В ШОКОЛАДЕ",
    h1: { heat: 84, color: "red", j1: [17, 18, 17, 17, 17], j2: [17, 17, 16, 17, 18], total: 171 },
    h2: { heat: 104, color: "white", j1: [17, 17, 16, 18, 18], j2: [18, 16, 16, 16, 17], total: 169 },
    score: 340, place: 3, vc: "CC", title: "R.CACL"
  },
  {
    catalog_no: 5, breed: "Басенджи", className: "Стандартный", sex: "Кобель",
    name: "SUNRISE LEUR ADAM",
    h1: { heat: 83, color: "white", j1: [17, 17, 17, 17, 17], j2: [17, 18, 17, 17, 18], total: 172 },
    h2: { heat: 105, color: "white", j1: [16, 17, 17, 17, 17], j2: [16, 17, 17, 15, 18], total: 167 },
    score: 339, place: 4, vc: "CC"
  },
  {
    catalog_no: 4, breed: "Басенджи", className: "Стандартный", sex: "Кобель",
    name: "KILIMANJARO KAISER",
    h1: { heat: 85, color: "white", j1: [16, 17, 16, 16, 16], j2: [17, 18, 17, 17, 18], total: 168 },
    h2: { heat: 106, color: "red", j1: [16, 17, 16, 17, 16], j2: [16, 17, 17, 16, 17], total: 165 },
    score: 333, place: 5, vc: "CC"
  },
  {
    catalog_no: 6, breed: "Басенджи", className: "Стандартный", sex: "Кобель",
    name: "SUNTASTIC VIKING FOR MYSTERIOUS TALISMAN",
    h1: { heat: 85, color: "red" },
    status: "withdrawn", status_reason: "Снят"
  },

  // Басенджи Суки
  {
    catalog_no: 7, breed: "Басенджи", className: "Стандартный", sex: "Сука",
    name: "АДЕБАНКЕ'С ЛИМОНИТА",
    h1: { heat: 86, color: "white", j1: [16, 17, 17, 17, 16], j2: [17, 18, 17, 16, 18], total: 169 },
    h2: { heat: 108, color: "red", j1: [17, 18, 18, 18, 18], j2: [17, 18, 18, 17, 17], total: 176 },
    score: 345, place: 1, vc: "CC", title: "Чемпион РКФ"
  },
  {
    catalog_no: 10, breed: "Басенджи", className: "Стандартный", sex: "Сука",
    name: "РЕЙНЕКС-ЛИС",
    h1: { heat: 88, color: "red", j1: [17, 18, 17, 18, 18], j2: [18, 18, 17, 18, 17], total: 176 },
    h2: { heat: 107, color: "red", j1: [17, 17, 16, 17, 16], j2: [17, 17, 18, 17, 17], total: 169 },
    score: 345, place: 2, vc: "CC", title: "CACL"
  },
  {
    catalog_no: 9, breed: "Басенджи", className: "Стандартный", sex: "Сука",
    name: "БЭРТИ",
    h1: { heat: 86, color: "red", j1: [16, 17, 17, 16, 17], j2: [17, 19, 18, 17, 18], total: 172 },
    h2: { heat: 107, color: "white", j1: [17, 17, 16, 17, 16], j2: [17, 18, 18, 17, 18], total: 171 },
    score: 343, place: 3, vc: "CC", title: "R.CACL"
  },
  {
    catalog_no: 8, breed: "Басенджи", className: "Стандартный", sex: "Сука",
    name: "АМАГАММА ЛУНДЖИЛ",
    h1: { heat: 87, color: "white", j1: [16, 17, 17, 17, 16], j2: [16, 17, 17, 16, 17], total: 166 },
    h2: { heat: 108, color: "white", j1: [17, 18, 17, 18, 17], j2: [17, 17, 17, 17, 17], total: 172 },
    score: 338, place: 4, vc: "CC"
  },
  {
    catalog_no: 11, breed: "Басенджи", className: "Стандартный", sex: "Сука",
    name: "SUNRISE LEUR ARISHA",
    h1: { heat: 87, color: "red", j1: [16, 18, 17, 15, 15], j2: [14, 18, 17, 12, 15], total: 157 },
    h2: { heat: 109, color: "red", j1: [17, 17, 17, 17, 17], j2: [18, 19, 18, 18, 18], total: 176 },
    score: 333, place: 5, vc: "CC"
  },

  // Басенджи Юниоры Кобели
  {
    catalog_no: 12, breed: "Басенджи", className: "Юниоры", sex: "Кобель",
    name: "ХАУС ЗЭ РЭЙНБОУ УЗОЧИ ЗИКИМО",
    h1: { heat: 89, color: "red", j1: [17, 17, 17, 18, 18], j2: [18, 18, 17, 18, 18], total: 176 },
    h2: { heat: 110, color: "red", j1: [17, 18, 17, 17, 17], j2: [18, 18, 18, 18, 18], total: 176 },
    score: 352, place: 1, title: "Лучший юниор"
  },

  // Грейхаунд Стандартный Кобели
  {
    catalog_no: 15, breed: "Грейхаунд", className: "Стандартный", sex: "Кобель",
    name: "RISE OF AN EMPIRE FOR HEPI HEPRI",
    h1: { heat: 10, color: "red", j1: [19, 19, 19, 19, 19], j2: [17, 17, 16, 17, 17], total: 179 },
    h2: { heat: 31, color: "white", j1: [19, 20, 19, 20, 19], j2: [18, 18, 17, 18, 18], total: 186 },
    score: 365, place: 1, vc: "CC", title: "Чемпион РКФ"
  },
  {
    catalog_no: 14, breed: "Грейхаунд", className: "Стандартный", sex: "Кобель",
    name: "ХЕПИ ХЕПРИ ФЛЭП ОФ ВИНГ",
    h1: { heat: 11, color: "red", j1: [18, 18, 18, 19, 19], j2: [17, 18, 18, 18, 18], total: 181 },
    h2: { heat: 31, color: "red", j1: [18, 18, 17, 18, 16], j2: [17, 17, 17, 17, 17], total: 172 },
    score: 353, place: 2, vc: "CC", title: "CACL"
  },
  {
    catalog_no: 13, breed: "Грейхаунд", className: "Стандартный", sex: "Кобель",
    name: "HEPI HEPRI FIRE OF MY HEART",
    h1: { heat: 10, color: "white", j1: [18, 18, 17, 18, 17], j2: [16, 16, 18, 16, 18], total: 172 },
    h2: { heat: 30, color: "red", j1: [17, 18, 17, 18, 18], j2: [17, 17, 17, 17, 17], total: 173 },
    score: 345, place: 3, vc: "CC", title: "R.CACL", qualification: "V"
  },

  // Ирландский волкодав Стандартный Общая
  {
    catalog_no: 18, breed: "Ирландский волкодав", className: "Стандартный", sex: "Сука",
    name: "MILIY ZVER CHANTEL",
    h1: { heat: 1, color: "red", j1: [18, 19, 18, 18, 18], j2: [17, 18, 18, 17, 18], total: 179 },
    h2: { heat: 22, color: "red", j1: [18, 19, 18, 19, 18], j2: [18, 18, 18, 18, 17], total: 181 },
    score: 360, place: 1, vc: "CC", title: "Чемпион РКФ"
  },
  {
    catalog_no: 17, breed: "Ирландский волкодав", className: "Стандартный", sex: "Кобель",
    name: "MILIY ZVER CHARODEY",
    h1: { heat: 2, color: "red", j1: [17, 17, 17, 17, 17], j2: [17, 16, 18, 17, 18], total: 171 },
    h2: { heat: 23, color: "red", j1: [17, 18, 18, 18, 18], j2: [17, 18, 18, 17, 18], total: 177 },
    score: 348, place: 2, vc: "CC", title: "CACL"
  },
  {
    catalog_no: 16, breed: "Ирландский волкодав", className: "Стандартный", sex: "Кобель",
    name: "BORS MES AMIS DE MAFINNS",
    h1: { heat: 1, color: "white", j1: [17, 18, 18, 18, 18], j2: [17, 17, 17, 17, 17], total: 174 },
    h2: { heat: 22, color: "white", j1: [16, 17, 16, 17, 17], j2: [17, 18, 18, 17, 18], total: 171 },
    score: 345, place: 3, vc: "CC", title: "R.CACL"
  },

  // Левретка Выше стандарта Общая
  {
    catalog_no: 22, breed: "Малая итальянская борзая", className: "Выше стандарта", sex: "Сука",
    name: "ВАЛЬС ВАЛЕНТО ЮЛИСА",
    h1: { heat: 19, color: "red", j1: [19, 19, 19, 19, 19], j2: [18, 19, 19, 19, 19], total: 189 },
    h2: { heat: 36, color: "red", j1: [18, 18, 18, 18, 18], j2: [19, 19, 18, 19, 18], total: 165, penalty: 18 },
    score: 354, place: 1, vc: "CC", title: "Чемпион РКФ"
  },
  {
    catalog_no: 21, breed: "Малая итальянская борзая", className: "Выше стандарта", sex: "Сука",
    name: "MIO BELISSIMO ALLEGRA VENTO",
    h1: { heat: 18, color: "white", j1: [18, 19, 18, 19, 18], j2: [18, 19, 19, 19, 19], total: 167, penalty: 19 },
    h2: { heat: 36, color: "white", j1: [17, 18, 18, 17, 18], j2: [18, 18, 18, 18, 18], total: 178 },
    score: 345, place: 2, vc: "CC", title: "CACL"
  },
  {
    catalog_no: 19, breed: "Малая итальянская борзая", className: "Выше стандарта", sex: "Кобель",
    name: "HOUSE OF HOUNDS DOMENICO",
    h1: { heat: 18, color: "red" },
    status: "withdrawn", status_reason: "Снят", qualification: "V"
  },
  {
    catalog_no: 20, breed: "Малая итальянская борзая", className: "Выше стандарта", sex: "Кобель",
    name: "STAKKATO EGOISTE PLATINUM",
    status: "dns", status_reason: "Неявка"
  },

  // Левретка Стандартный Общая
  {
    catalog_no: 23, breed: "Малая итальянская борзая", className: "Стандартный", sex: "Кобель",
    name: "DONATELLO BIMBO BELLO DAI GIARDINI DELLO ZAR",
    h1: { heat: 20, color: "red", j1: [19, 18, 18, 19, 19], j2: [18, 18, 18, 18, 18], total: 183 },
    h2: { heat: 37, color: "white", j1: [18, 18, 18, 19, 18], j2: [18, 18, 19, 18, 18], total: 182 },
    score: 365, place: 1, vc: "CC", qualification: "V"
  },
  {
    catalog_no: 24, breed: "Малая итальянская борзая", className: "Стандартный", sex: "Сука",
    name: "GRACE HAUND ELIZABETH HER EXCELLENCE",
    h1: { heat: 20, color: "white", j1: [18, 19, 19, 19, 18], j2: [18, 18, 19, 18, 18], total: 184 },
    h2: { heat: 37, color: "red", j1: [17, 18, 16, 15, 15], j2: [17, 19, 18, 15, 14], total: 164 },
    score: 348, place: 2, qualification: "V"
  },

  // Родезийский риджбек Кобели
  {
    catalog_no: 29, breed: "Родезийский риджбек", className: "Стандартный", sex: "Кобель",
    name: "JELANY RED TROY",
    h1: { heat: 90, color: "white", j1: [17, 17, 18, 17, 17], j2: [17, 18, 17, 17, 18], total: 173 },
    h2: { heat: 111, color: "red", j1: [16, 17, 17, 16, 16], j2: [16, 17, 17, 15, 17], total: 164 },
    score: 337, place: 1, vc: "CC", title: "Чемпион РКФ", qualification: "V"
  },
  {
    catalog_no: 26, breed: "Родезийский риджбек", className: "Стандартный", sex: "Кобель",
    name: "ARIES KHAN MARLON BRANDO",
    h1: { heat: 91, color: "white", j1: [15, 18, 17, 16, 17], j2: [15, 17, 16, 14, 16], total: 161 },
    h2: { heat: 111, color: "white", j1: [17, 17, 17, 17, 17], j2: [16, 18, 17, 16, 17], total: 169 },
    score: 330, place: 2, vc: "CC", title: "CACL"
  },
  {
    catalog_no: 28, breed: "Родезийский риджбек", className: "Стандартный", sex: "Кобель",
    name: "ГРАНД КОРТЕЖ НЕМБУС ЗЕ БРАЙТЕСТ",
    h1: { heat: 90, color: "red", j1: [10, 12, 10, 10, 12], j2: [14, 17, 16, 13, 16], total: 130 },
    h2: { heat: 112, color: "red", j1: [17, 18, 18, 18, 17], j2: [18, 18, 18, 18, 17], total: 177 },
    score: 307, place: 3, vc: "CC", title: "R.CACL"
  },
  {
    catalog_no: 25, breed: "Родезийский риджбек", className: "Стандартный", sex: "Кобель",
    name: "ARBITRUM LIBERUM SALVADOR DALI",
    h1: { heat: 92, color: "red" },
    status: "withdrawn", status_reason: "Снят"
  },
  {
    catalog_no: 27, breed: "Родезийский риджбек", className: "Стандартный", sex: "Кобель",
    name: "BILLAAR NWANKWO AMBERONE AIDEN",
    h1: { heat: 91, color: "red" },
    status: "withdrawn", status_reason: "Снят"
  },

  // Родезийский риджбек Суки
  {
    catalog_no: 30, breed: "Родезийский риджбек", className: "Стандартный", sex: "Сука",
    name: "ARBITRUM LIBERUM SUNFLOWER BY VAN GOGH",
    h1: { heat: 94, color: "red", j1: [19, 19, 19, 19, 20], j2: [18, 19, 18, 18, 18], total: 187 },
    h2: { heat: 114, color: "red", j1: [17, 19, 18, 18, 18], j2: [17, 18, 17, 17, 18], total: 177 },
    score: 364, place: 1, vc: "CC", title: "Чемпион РКФ"
  },
  {
    catalog_no: 32, breed: "Родезийский риджбек", className: "Стандартный", sex: "Сука",
    name: "GRAND CORTEGE NOBLE QUEEN",
    h1: { heat: 93, color: "white", j1: [18, 18, 18, 18, 18], j2: [16, 17, 17, 16, 17], total: 173 },
    h2: { heat: 114, color: "white", j1: [16, 18, 17, 17, 17], j2: [15, 16, 16, 15, 16], total: 163 },
    score: 336, place: 2, vc: "CC", title: "CACL"
  },
  {
    catalog_no: 31, breed: "Родезийский риджбек", className: "Стандартный", sex: "Сука",
    name: "Aries Khan PhreiaPasiphae",
    h1: { heat: 93, color: "red", j1: [18, 18, 17, 18, 17], j2: [17, 16, 16, 17, 17], total: 171 },
    h2: { heat: 113, color: "red" },
    score: 171, status: "withdrawn", status_reason: "Снят"
  },

  // Родезийский риджбек Юниоры Суки
  {
    catalog_no: 33, breed: "Родезийский риджбек", className: "Юниоры", sex: "Сука",
    name: "Maendeleo Holy Lara Croft Aries Khan",
    h1: { heat: 95, color: "red", j1: [19, 18, 17, 19, 19], j2: [17, 18, 17, 18, 18], total: 180 },
    h2: { heat: 115, color: "red", j1: [19, 19, 18, 20, 19], j2: [18, 18, 17, 17, 16], total: 181 },
    score: 361, place: 1, title: "Лучший юниор"
  },

  // РПБ Кобели
  {
    catalog_no: 34, breed: "Русская псовая борзая", className: "Стандартный", sex: "Кобель",
    name: "KATZ PTYAGIN",
    h1: { heat: 8, color: "red", j1: [17, 18, 16, 17, 18], j2: [17, 18, 17, 17, 18], total: 173 },
    h2: { heat: 27, color: "red", j1: [17, 18, 18, 18, 17], j2: [17, 18, 17, 16, 16], total: 172 },
    score: 345, place: 1, vc: "CC", title: "Чемпион РКФ", qualification: "V"
  },
  {
    catalog_no: 35, breed: "Русская псовая борзая", className: "Стандартный", sex: "Кобель",
    name: "METEL' AVGUSTA AARON",
    h1: { heat: 6, color: "white", j1: [16, 17, 15, 15, 15], j2: [15, 17, 17, 15, 17], total: 159 },
    h2: { heat: 24, color: "red", j1: [8, 11, 10, 10, 10], j2: [10, 18, 10, 10, 10], total: 107 },
    score: 266, place: 2, qualification: "V"
  },
  {
    catalog_no: 36, breed: "Русская псовая борзая", className: "Стандартный", sex: "Кобель",
    name: "SOLOVYEV SHELKOVYI ANGEL",
    h1: { heat: 9, color: "red", j1: [14, 14, 10, 12, 10], j2: [10, 17, 10, 11, 10], total: 118 },
    h2: { heat: 24, color: "white", j1: [9, 10, 10, 10, 8], j2: [5, 15, 10, 5, 10], total: 92 },
    score: 210, place: 3, qualification: "V"
  },

  // РПБ Суки
  {
    catalog_no: 43, breed: "Русская псовая борзая", className: "Стандартный", sex: "Сука",
    name: "ЗОЛОТАЯ ОСЕНЬ",
    h1: { heat: 9, color: "white", j1: [18, 18, 18, 17, 18], j2: [18, 18, 19, 18, 18], total: 180 },
    h2: { heat: 28, color: "white", j1: [18, 18, 17, 17, 18], j2: [18, 19, 19, 18, 18], total: 180 },
    score: 360, place: 1, vc: "CC", title: "Чемпион РКФ, CACIL", qualification: "V"
  },
  {
    catalog_no: 40, breed: "Русская псовая борзая", className: "Стандартный", sex: "Сука",
    name: "GOLDEN DREAM ROYAL LILY",
    h1: { heat: 5, color: "white", j1: [17, 18, 18, 18, 19], j2: [18, 19, 18, 18, 18], total: 181 },
    h2: { heat: 28, color: "red", j1: [18, 18, 17, 18, 17], j2: [18, 18, 17, 17, 18], total: 176 },
    score: 357, place: 2, vc: "CC", title: "CACL"
  },
  {
    catalog_no: 42, breed: "Русская псовая борзая", className: "Стандартный", sex: "Сука",
    name: "LUNNAJA RADUGA DIVNAYA MECHTA",
    h1: { heat: 6, color: "red", j1: [17, 18, 16, 17, 17], j2: [17, 19, 19, 18, 18], total: 176 },
    h2: { heat: 26, color: "red", j1: [18, 19, 17, 17, 18], j2: [17, 18, 18, 18, 18], total: 178 },
    score: 354, place: 3, vc: "CC", title: "R.CACL, R.CACIL", qualification: "V"
  },
  {
    catalog_no: 38, breed: "Русская псовая борзая", className: "Стандартный", sex: "Сука",
    name: "BOYARYNYA",
    h1: { heat: 7, color: "white", j1: [17, 17, 16, 17, 16], j2: [18, 18, 18, 18, 18], total: 173 },
    h2: { heat: 26, color: "white", j1: [18, 18, 17, 18, 18], j2: [17, 17, 18, 17, 18], total: 176 },
    score: 349, place: 4, vc: "CC", qualification: "V"
  },
  {
    catalog_no: 39, breed: "Русская псовая борзая", className: "Стандартный", sex: "Сука",
    name: "DERZHI VETER ANARHIYA",
    h1: { heat: 7, color: "red", j1: [16, 17, 16, 16, 16], j2: [17, 18, 17, 17, 18], total: 168 },
    h2: { heat: 25, color: "white", j1: [18, 18, 18, 18, 17], j2: [18, 19, 18, 18, 18], total: 180 },
    score: 348, place: 5, vc: "CC"
  },
  {
    catalog_no: 41, breed: "Русская псовая борзая", className: "Стандартный", sex: "Сука",
    name: "KUPENA IZ SELA TSAREVO",
    h1: { heat: 8, color: "white", j1: [16, 17, 16, 17, 16], j2: [17, 18, 18, 18, 17], total: 170 },
    h2: { heat: 27, color: "white", j1: [17, 18, 17, 17, 16], j2: [17, 19, 18, 16, 17], total: 172 },
    score: 342, place: 6, vc: "CC"
  },
  {
    catalog_no: 37, breed: "Русская псовая борзая", className: "Стандартный", sex: "Сука",
    name: "BELKA BICHI SENIYA",
    h1: { heat: 5, color: "red", j1: [16, 17, 16, 17, 17], j2: [17, 18, 18, 16, 17], total: 169 },
    h2: { heat: 25, color: "red" },
    score: 169, status: "withdrawn", status_reason: "Снят владельцем", qualification: "V"
  },

  // РПБ Юниоры Суки
  {
    catalog_no: 44, breed: "Русская псовая борзая", className: "Юниоры", sex: "Сука",
    name: "ФАРТОВАЯ ИЗ ДОМА КАРПОВОЙ",
    h1: { heat: 21, color: "red", j1: [19, 18, 18, 19, 18], j2: [18, 17, 17, 18, 17], total: 179 },
    h2: { heat: 29, color: "red", j1: [17, 19, 17, 17, 15], j2: [17, 18, 16, 17, 16], total: 169 },
    score: 348, place: 1, title: "Лучший юниор"
  },

  // Салюки Стандартный Общая
  {
    catalog_no: 49, breed: "Салюки", className: "Стандартный", sex: "Сука",
    name: "SALGREY'S ODETTA",
    h1: { heat: 14, color: "red", j1: [18, 19, 19, 19, 19], j2: [17, 18, 18, 19, 17], total: 183 },
    h2: { heat: 32, color: "red", j1: [18, 19, 18, 18, 17], j2: [18, 19, 18, 18, 18], total: 181 },
    score: 364, place: 1, vc: "CC", title: "Чемпион РКФ", qualification: "V"
  },
  {
    catalog_no: 48, breed: "Салюки", className: "Стандартный", sex: "Сука",
    name: "SALGREY'S MIRANDA",
    h1: { heat: 13, color: "red", j1: [18, 18, 17, 18, 18], j2: [18, 18, 18, 17, 16], total: 176 },
    h2: { heat: 33, color: "red", j1: [18, 19, 18, 18, 17], j2: [18, 19, 18, 18, 18], total: 181 },
    score: 357, place: 2, vc: "CC", title: "CACL", qualification: "V"
  },
  {
    catalog_no: 46, breed: "Салюки", className: "Стандартный", sex: "Кобель",
    name: "SALGREY'S OMID-LATIF",
    h1: { heat: 12, color: "red", j1: [18, 18, 18, 19, 19], j2: [18, 18, 18, 17, 16], total: 179 },
    h2: { heat: 32, color: "white", j1: [17, 19, 17, 16, 17], j2: [17, 19, 18, 17, 18], total: 175 },
    score: 354, place: 3, vc: "CC", title: "R.CACL"
  },
  {
    catalog_no: 47, breed: "Салюки", className: "Стандартный", sex: "Сука",
    name: "AL NAFISEH ELEEZA",
    h1: { heat: 13, color: "white", j1: [16, 18, 17, 17, 17], j2: [17, 17, 17, 18, 18], total: 172 },
    h2: { heat: 33, color: "white", j1: [17, 19, 17, 17, 17], j2: [19, 19, 19, 17, 18], total: 179 },
    score: 351, place: 4, vc: "CC", qualification: "V"
  },
  {
    catalog_no: 45, breed: "Салюки", className: "Стандартный", sex: "Кобель",
    name: "ИМРАН ГАЛСАН КАДАРИ",
    h1: { heat: 12, color: "white" },
    status: "disqualified", status_reason: "Агрессия"
  },

  // Салюки Юниоры Общая
  {
    catalog_no: 51, breed: "Салюки", className: "Юниоры", sex: "Сука",
    name: "SALGREY'S PRIMAVERA",
    h1: { heat: 15, color: "white", j1: [18, 19, 19, 19, 20], j2: [18, 19, 19, 17, 18], total: 186 },
    h2: { heat: 34, color: "red", j1: [18, 19, 19, 18, 18], j2: [18, 18, 18, 18, 19], total: 183 },
    score: 369, place: 1, title: "Лучший юниор"
  },
  {
    catalog_no: 50, breed: "Салюки", className: "Юниоры", sex: "Кобель",
    name: "SALGREY'S PAYAM",
    h1: { heat: 15, color: "red" },
    status: "withdrawn", status_reason: "Снят"
  },

  // Слюги Стандартный Общая
  {
    catalog_no: 52, breed: "Слюги", className: "Стандартный", sex: "Кобель",
    name: "BORZOMIR BARFAR AMAN",
    h1: { heat: 4, color: "red", j1: [2, 7, 1, 4, 2], j2: [2, 18, 1, 3, 1], total: 41 },
    score: 41
  },
  {
    catalog_no: 53, breed: "Слюги", className: "Стандартный", sex: "Сука",
    name: "BORZOMIR BAKHRUZ AZIZA",
    h1: { heat: 3, color: "white", j1: [1, 7, 1, 2, 1], j2: [1, 8, 0, 1, 1], total: 23 },
    score: 23
  },
  {
    catalog_no: 54, breed: "Слюги", className: "Стандартный", sex: "Сука",
    name: "BORZOMIR BARIYAT AMIRA",
    h1: { heat: 3, color: "red", j1: [1, 7, 1, 3, 1], j2: [1, 7, 0, 1, 1], total: 23 },
    score: 23
  },

  // Тазы Стандартный Общая
  {
    catalog_no: 56, breed: "Тазы", className: "Стандартный", sex: "Кобель",
    name: "БОРЗОМИР АРМАН",
    h1: { heat: 16, color: "red", j1: [17, 18, 17, 18, 18], j2: [18, 18, 18, 18, 17], total: 177 },
    h2: { heat: 35, color: "red", j1: [19, 19, 18, 19, 18], j2: [17, 18, 18, 19, 19], total: 184 },
    score: 361, place: 1, vc: "CC", title: "Чемпион РКФ"
  },
  {
    catalog_no: 57, breed: "Тазы", className: "Стандартный", sex: "Сука",
    name: "БОРЗОМИР АЙСУЛУ",
    h1: { heat: 17, color: "red", j1: [18, 18, 17, 19, 18], j2: [17, 17, 16, 18, 18], total: 176 },
    h2: { heat: 35, color: "white", j1: [18, 18, 18, 18, 18], j2: [17, 18, 18, 18, 18], total: 179 },
    score: 355, place: 2, vc: "CC", title: "CACL"
  },
  {
    catalog_no: 55, breed: "Тазы", className: "Стандартный", sex: "Кобель",
    name: "BORZOMIR AMIR",
    h1: { heat: 16, color: "white", j1: [18, 19, 18, 19, 18], j2: [17, 17, 18, 18, 18], total: 180 },
    score: 180, status: "withdrawn", status_reason: "Снят владельцем"
  },

  // Тайский риджбек Стандартный Кобели
  {
    catalog_no: 58, breed: "Тайский риджбек", className: "Стандартный", sex: "Кобель",
    name: "ELFGRACE MARCIO KIRO",
    h1: { heat: 82, color: "red", j1: [15, 17, 16, 15, 14], j2: [15, 16, 16, 15, 15], total: 154 },
    h2: { heat: 103, color: "red", j1: [16, 17, 16, 15, 16], j2: [16, 17, 17, 15, 17], total: 162 },
    score: 316, place: 1, vc: "CC"
  },

  // Уиппет Ветераны Кобели
  {
    catalog_no: 60, breed: "Уиппет", className: "Ветераны", sex: "Кобель",
    name: "KULIKOVO POLE ORIKS BYSTRY",
    h1: { heat: 38, color: "white", j1: [17, 18, 17, 17, 18], j2: [18, 18, 18, 18, 18], total: 177 },
    h2: { heat: 60, color: "red", j1: [18, 17, 17, 17, 17], j2: [18, 18, 19, 18, 18], total: 177 },
    score: 354, place: 1, vc: "CC", title: "Лучший ветеран"
  },

  // Уиппет Ветераны-спринтеры Кобели
  {
    catalog_no: 59, breed: "Уиппет", className: "Ветераны-спринтеры", sex: "Кобель",
    name: "BRIZ LEGKIY VETER",
    h1: { heat: 38, color: "red", j1: [17, 17, 17, 18, 18], j2: [19, 18, 17, 18, 18], total: 177 },
    h2: { heat: 60, color: "white", j1: [17, 18, 17, 17, 18], j2: [17, 18, 18, 17, 18], total: 175 },
    score: 352, place: 1, vc: "CC", title: "Лучший ветеран"
  },

  // Уиппет Стандартный Кобели
  {
    catalog_no: 69, breed: "Уиппет", className: "Стандартный", sex: "Кобель",
    name: "ANTHRAX GO-BYE",
    h1: { heat: 50, color: "white", j1: [17, 19, 18, 18, 18], j2: [18, 18, 18, 18, 18], total: 180 },
    h2: { heat: 73, color: "white", j1: [18, 18, 18, 19, 19], j2: [18, 19, 19, 19, 18], total: 185 },
    score: 365, place: 1, vc: "CC", title: "Чемпион РКФ, CACIL", qualification: "V"
  },
  {
    catalog_no: 85, breed: "Уиппет", className: "Стандартный", sex: "Кобель",
    name: "VASURU TAFFI'S NOW OR NEVER",
    h1: { heat: 46, color: "red", j1: [18, 18, 18, 18, 18], j2: [18, 18, 19, 18, 17], total: 180 },
    h2: { heat: 73, color: "red", j1: [18, 19, 18, 19, 18], j2: [19, 18, 18, 19, 18], total: 184 },
    score: 364, place: 2, vc: "CC", title: "CACL, R.CACIL", qualification: "V"
  },
  {
    catalog_no: 72, breed: "Уиппет", className: "Стандартный", sex: "Кобель",
    name: "GUY",
    h1: { heat: 45, color: "white", j1: [17, 18, 17, 18, 17], j2: [19, 18, 18, 18, 18], total: 178 },
    h2: { heat: 69, color: "white", j1: [17, 18, 18, 18, 18], j2: [18, 19, 19, 19, 18], total: 182 },
    score: 360, place: 3, vc: "CC", title: "R.CACL"
  },
  {
    catalog_no: 81, breed: "Уиппет", className: "Стандартный", sex: "Кобель",
    name: "STANGERS LAND BLACKTHORNE WINTER",
    h1: { heat: 47, color: "red", j1: [18, 19, 19, 19, 18], j2: [19, 19, 19, 18, 18], total: 185 },
    h2: { heat: 67, color: "white", j1: [17, 18, 18, 17, 17], j2: [17, 18, 18, 17, 18], total: 175 },
    score: 360, place: 4, vc: "CC", qualification: "V"
  },
  {
    catalog_no: 78, breed: "Уиппет", className: "Стандартный", sex: "Кобель",
    name: "SHERWOOD FOREST HERO",
    h1: { heat: 48, color: "white", j1: [17, 19, 18, 18, 17], j2: [18, 18, 18, 18, 18], total: 179 },
    h2: { heat: 69, color: "red", j1: [18, 18, 17, 18, 19], j2: [18, 19, 17, 18, 18], total: 180 },
    score: 359, place: 5, vc: "CC", qualification: "V"
  },
  {
    catalog_no: 70, breed: "Уиппет", className: "Стандартный", sex: "Кобель",
    name: "EFFLORESCO'S MAVISCAL",
    h1: { heat: 45, color: "red", j1: [18, 18, 17, 18, 18], j2: [19, 19, 19, 18, 18], total: 182 },
    h2: { heat: 71, color: "red", j1: [17, 18, 18, 17, 17], j2: [17, 19, 19, 17, 18], total: 177 },
    score: 359, place: 6, vc: "CC", qualification: "V"
  },
  {
    catalog_no: 80, breed: "Уиппет", className: "Стандартный", sex: "Кобель",
    name: "STANGERS LAND BARST",
    h1: { heat: 48, color: "red", j1: [18, 19, 18, 18, 18], j2: [19, 19, 18, 19, 18], total: 184 },
    h2: { heat: 67, color: "red", j1: [17, 18, 18, 17, 17], j2: [18, 18, 17, 18, 17], total: 175 },
    score: 359, place: 7, vc: "CC"
  },
  {
    catalog_no: 83, breed: "Уиппет", className: "Стандартный", sex: "Кобель",
    name: "VALPAIN PEK BLOSSOM DRAGON",
    h1: { heat: 50, color: "red", j1: [17, 19, 18, 17, 18], j2: [18, 18, 17, 17, 18], total: 177 },
    h2: { heat: 72, color: "white", j1: [17, 18, 18, 18, 17], j2: [18, 19, 19, 18, 18], total: 180 },
    score: 357, place: 8, vc: "CC", qualification: "V"
  },
  {
    catalog_no: 77, breed: "Уиппет", className: "Стандартный", sex: "Кобель",
    name: "RIDER OF ROHAN BRODWINEK",
    h1: { heat: 49, color: "white", j1: [17, 18, 18, 17, 17], j2: [20, 18, 19, 19, 18], total: 181 },
    h2: { heat: 71, color: "white", j1: [17, 18, 18, 17, 17], j2: [16, 19, 18, 17, 18], total: 175 },
    score: 356, place: 9, vc: "CC", qualification: "V"
  },
  {
    catalog_no: 84, breed: "Уиппет", className: "Стандартный", sex: "Кобель",
    name: "VASURU TAFFI'S FIRST-EVER FOREVER",
    h1: { heat: 47, color: "white", j1: [17, 19, 18, 18, 18], j2: [17, 18, 17, 17, 18], total: 177 },
    h2: { heat: 72, color: "red", j1: [16, 19, 18, 17, 17], j2: [18, 18, 17, 17, 18], total: 175 },
    score: 352, place: 10, vc: "CC"
  },
  {
    catalog_no: 71, breed: "Уиппет", className: "Стандартный", sex: "Кобель",
    name: "FIERCE FIREBALL FIFTH GEAR",
    h1: { heat: 49, color: "red", j1: [16, 19, 17, 16, 17], j2: [18, 19, 18, 18, 18], total: 176 },
    h2: { heat: 70, color: "white", j1: [17, 18, 18, 17, 18], j2: [16, 18, 18, 17, 18], total: 175 },
    score: 351, place: 11, vc: "CC"
  },
  {
    catalog_no: 82, breed: "Уиппет", className: "Стандартный", sex: "Кобель",
    name: "STRONG STOAT",
    h1: { heat: 51, color: "red", j1: [17, 18, 18, 15, 16], j2: [18, 19, 18, 18, 19], total: 176 },
    h2: { heat: 70, color: "red", j1: [16, 19, 18, 16, 17], j2: [16, 19, 19, 17, 18], total: 175 },
    score: 351, place: 12, vc: "CC"
  },
  {
    catalog_no: 76, breed: "Уиппет", className: "Стандартный", sex: "Кобель",
    name: "LIFT ME UP",
    h1: { heat: 46, color: "white", j1: [17, 18, 17, 17, 17], j2: [17, 18, 17, 17, 17], total: 173 },
    h2: { heat: 68, color: "red", j1: [5, 10, 5, 5, 5], j2: [6, 10, 10, 6, 7], total: 69 },
    score: 242, place: 13, qualification: "V"
  },
  {
    catalog_no: 73, breed: "Уиппет", className: "Стандартный", sex: "Кобель",
    name: "КУЛИКОВО ПОЛЕ ДАНТЕ",
    h1: { heat: 51, color: "white", j1: [17, 18, 18, 15, 15], j2: [17, 18, 18, 17, 18], total: 171 },
    h2: { heat: 68, color: "white" },
    score: 171, status: "disqualified", status_reason: "Агрессия", qualification: "V"
  },
  {
    catalog_no: 75, breed: "Уиппет", className: "Стандартный", sex: "Кобель",
    name: "KULIKOVO POLE DOMINGO",
    status: "dns", status_reason: "Неявка"
  },

  // Уиппет Стандартный Суки
  {
    catalog_no: 93, breed: "Уиппет", className: "Стандартный", sex: "Сука",
    name: "LOVE WILL FIND A WAY",
    h1: { heat: 55, color: "white", j1: [18, 19, 18, 19, 19], j2: [18, 18, 18, 18, 18], total: 183 },
    h2: { heat: 77, color: "white", j1: [19, 19, 19, 19, 20], j2: [19, 19, 19, 19, 19], total: 191 },
    score: 374, place: 1, vc: "CC", title: "Чемпион РКФ, CACIL", qualification: "V"
  },
  {
    catalog_no: 97, breed: "Уиппет", className: "Стандартный", sex: "Сука",
    name: "STANGERS LAND BRATISLAVA",
    h1: { heat: 56, color: "red", j1: [18, 19, 19, 19, 19], j2: [18, 19, 18, 19, 18], total: 186 },
    h2: { heat: 77, color: "red", j1: [19, 19, 18, 19, 19], j2: [19, 19, 18, 19, 18], total: 187 },
    score: 373, place: 2, vc: "CC", title: "CACL, R.CACIL", qualification: "V"
  },
  {
    catalog_no: 98, breed: "Уиппет", className: "Стандартный", sex: "Сука",
    name: "STANGERS LAND BRIZA",
    h1: { heat: 55, color: "red", j1: [18, 18, 18, 18, 19], j2: [17, 17, 17, 17, 18], total: 177 },
    h2: { heat: 78, color: "red", j1: [19, 19, 18, 18, 19], j2: [19, 19, 19, 19, 18], total: 187 },
    score: 364, place: 3, vc: "CC", title: "R.CACL"
  },
  {
    catalog_no: 95, breed: "Уиппет", className: "Стандартный", sex: "Сука",
    name: "SILVER SABLE",
    h1: { heat: 56, color: "white", j1: [17, 18, 18, 18, 19], j2: [18, 18, 18, 18, 18], total: 180 },
    h2: { heat: 76, color: "red", j1: [17, 18, 17, 18, 17], j2: [18, 19, 19, 19, 18], total: 180 },
    score: 360, place: 4, vc: "CC", qualification: "V"
  },
  {
    catalog_no: 86, breed: "Уиппет", className: "Стандартный", sex: "Сука",
    name: "AMBER VEIV'S INTRIGA",
    h1: { heat: 53, color: "red", j1: [17, 18, 17, 17, 16], j2: [18, 18, 17, 18, 18], total: 174 },
    h2: { heat: 78, color: "white", j1: [19, 19, 18, 19, 19], j2: [18, 19, 18, 18, 18], total: 185 },
    score: 359, place: 5, vc: "CC", qualification: "V"
  },
  {
    catalog_no: 91, breed: "Уиппет", className: "Стандартный", sex: "Сука",
    name: "LAVING BRIZ VESPA RAPIDA",
    h1: { heat: 53, color: "white", j1: [17, 18, 17, 18, 17], j2: [18, 18, 18, 18, 18], total: 177 },
    h2: { heat: 76, color: "white", j1: [17, 17, 16, 17, 17], j2: [18, 18, 18, 18, 18], total: 174 },
    score: 351, place: 6, vc: "CC"
  },
  {
    catalog_no: 96, breed: "Уиппет", className: "Стандартный", sex: "Сука",
    name: "STANGERS LAND ALTANA",
    h1: { heat: 52, color: "red", j1: [17, 18, 17, 17, 16], j2: [17, 18, 17, 17, 18], total: 172 },
    h2: { heat: 75, color: "red", j1: [17, 19, 18, 17, 17], j2: [18, 18, 18, 18, 18], total: 178 },
    score: 350, place: 7, vc: "CC", qualification: "V"
  },
  {
    catalog_no: 90, breed: "Уиппет", className: "Стандартный", sex: "Сука",
    name: "KORONA SOLNTSA IZ POLETA MECHTI",
    h1: { heat: 58, color: "red", j1: [16, 18, 18, 15, 16], j2: [15, 19, 18, 17, 18], total: 170 },
    h2: { heat: 75, color: "white", j1: [17, 18, 18, 18, 17], j2: [19, 18, 18, 18, 18], total: 179 },
    score: 349, place: 8, vc: "CC"
  },
  {
    catalog_no: 101, breed: "Уиппет", className: "Стандартный", sex: "Сука",
    name: "VOROZHEYA IS SAGI O GARDARIKE",
    h1: { heat: 54, color: "red", j1: [15, 17, 16, 15, 15], j2: [16, 18, 19, 17, 18], total: 166 },
    h2: { heat: 79, color: "white", j1: [18, 18, 18, 18, 18], j2: [17, 18, 17, 17, 18], total: 177 },
    score: 343, place: 9, vc: "CC", qualification: "V"
  },
  {
    catalog_no: 88, breed: "Уиппет", className: "Стандартный", sex: "Сука",
    name: "GARDA",
    h1: { heat: 59, color: "red", j1: [17, 18, 18, 15, 15], j2: [17, 19, 17, 16, 17], total: 169 },
    h2: { heat: 74, color: "red", j1: [16, 18, 17, 17, 17], j2: [16, 19, 18, 16, 18], total: 172 },
    score: 341, place: 10, vc: "CC"
  },
  {
    catalog_no: 99, breed: "Уиппет", className: "Стандартный", sex: "Сука",
    name: "VALPAIN PEK BON BON",
    h1: { heat: 58, color: "white", j1: [16, 18, 18, 16, 16], j2: [15, 18, 18, 16, 18], total: 169 },
    h2: { heat: 74, color: "white", j1: [16, 17, 16, 17, 16], j2: [16, 18, 18, 16, 18], total: 168 },
    score: 337, place: 11, vc: "CC", qualification: "V"
  },
  {
    catalog_no: 100, breed: "Уиппет", className: "Стандартный", sex: "Сука",
    name: "VALPAIN PEK DAISY DOLL",
    h1: { heat: 54, color: "white", j1: [15, 17, 16, 14, 15], j2: [16, 18, 18, 16, 17], total: 162 },
    h2: { heat: 80, color: "red", j1: [18, 18, 17, 17, 17], j2: [17, 18, 17, 16, 18], total: 173 },
    score: 335, place: 12, vc: "CC"
  },
  {
    catalog_no: 89, breed: "Уиппет", className: "Стандартный", sex: "Сука",
    name: "HEPI HEPRI PRETTY WOMAN",
    h1: { heat: 57, color: "red", j1: [10, 16, 16, 10, 13], j2: [15, 19, 18, 15, 19], total: 151 },
    h2: { heat: 80, color: "white", j1: [18, 18, 18, 17, 17], j2: [18, 19, 19, 18, 19], total: 181 },
    score: 332, place: 13, vc: "CC"
  },
  {
    catalog_no: 87, breed: "Уиппет", className: "Стандартный", sex: "Сука",
    name: "DIAMANT TOY ER UMKA LUCHIK SCHASTIA",
    h1: { heat: 57, color: "white", j1: [10, 16, 16, 10, 13], j2: [15, 18, 18, 15, 15], total: 146 },
    h2: { heat: 81, color: "red", j1: [18, 19, 18, 18, 17], j2: [18, 19, 19, 19, 18], total: 183 },
    score: 329, place: 14, vc: "CC"
  },
  {
    catalog_no: 92, breed: "Уиппет", className: "Стандартный", sex: "Сука",
    name: "LET THE LOVE GO ON",
    h1: { heat: 59, color: "white", j1: [17, 18, 18, 15, 15], j2: [16, 18, 17, 15, 17], total: 166 },
    h2: { heat: 79, color: "red", j1: [6, 10, 10, 10, 10], j2: [10, 18, 12, 10, 12], total: 108 },
    score: 274, place: 15, qualification: "V"
  },
  {
    catalog_no: 94, breed: "Уиппет", className: "Стандартный", sex: "Сука",
    name: "NIFTY RACING GIRL",
    h1: { heat: 52, color: "white" },
    status: "withdrawn", status_reason: "Снят", qualification: "V"
  },

  // Уиппет Спринтеры Общая
  {
    catalog_no: 62, breed: "Уиппет", className: "Стандартный-спринтеры", sex: "Кобель",
    name: "BLACK JACK",
    h1: { heat: 40, color: "white", j1: [18, 19, 18, 18, 18], j2: [19, 19, 19, 19, 19], total: 186 },
    h2: { heat: 62, color: "red", j1: [17, 19, 18, 17, 18], j2: [19, 19, 19, 18, 18], total: 182 },
    score: 368, place: 1, vc: "CC", title: "Чемпион РКФ"
  },
  {
    catalog_no: 65, breed: "Уиппет", className: "Стандартный-спринтеры", sex: "Кобель",
    name: "СТИЛАР ХЭЙЛСТОРМ",
    h1: { heat: 42, color: "white", j1: [18, 19, 18, 18, 18], j2: [19, 19, 18, 18, 19], total: 184 },
    h2: { heat: 62, color: "white", j1: [18, 18, 18, 18, 18], j2: [18, 18, 18, 18, 18], total: 180 },
    score: 364, place: 2, vc: "CC", title: "CACL"
  },
  {
    catalog_no: 68, breed: "Уиппет", className: "Стандартный-спринтеры", sex: "Сука",
    name: "DESSA IZ SAGI O GARDARIKE",
    h1: { heat: 42, color: "red", j1: [18, 19, 19, 17, 18], j2: [18, 18, 19, 18, 19], total: 183 },
    h2: { heat: 65, color: "red", j1: [17, 18, 18, 17, 17], j2: [18, 18, 18, 18, 18], total: 177 },
    score: 360, place: 3, vc: "CC", title: "R.CACL"
  },
  {
    catalog_no: 66, breed: "Уиппет", className: "Стандартный-спринтеры", sex: "Кобель",
    name: "VALPAIN PEK DIRECT HIT",
    h1: { heat: 44, color: "white", j1: [16, 18, 18, 17, 17], j2: [18, 18, 17, 18, 18], total: 175 },
    h2: { heat: 64, color: "white", j1: [17, 18, 18, 17, 18], j2: [18, 18, 18, 18, 18], total: 178 },
    score: 353, place: 4, vc: "CC"
  },
  {
    catalog_no: 74, breed: "Уиппет", className: "Стандартный-спринтеры", sex: "Кобель",
    name: "KULIKOVO POLE DAR",
    h1: { heat: 43, color: "red", j1: [17, 18, 18, 17, 17], j2: [17, 19, 17, 17, 18], total: 175 },
    h2: { heat: 66, color: "red", j1: [18, 18, 18, 18, 17], j2: [18, 18, 17, 18, 17], total: 177 },
    score: 352, place: 5, vc: "CC"
  },
  {
    catalog_no: 63, breed: "Уиппет", className: "Стандартный-спринтеры", sex: "Кобель",
    name: "ИСТОРИЯ ЛЮБВИ ПЕТЕРБУРГ БЬЮТИФУЛ",
    h1: { heat: 41, color: "white", j1: [17, 18, 18, 17, 17], j2: [17, 18, 18, 18, 18], total: 176 },
    h2: { heat: 66, color: "white", j1: [17, 19, 18, 17, 17], j2: [17, 18, 18, 17, 17], total: 175 },
    score: 351, place: 6, vc: "CC"
  },
  {
    catalog_no: 64, breed: "Уиппет", className: "Стандартный-спринтеры", sex: "Кобель",
    name: "KULIKOVO POLE BARON",
    h1: { heat: 40, color: "red", j1: [18, 18, 18, 18, 18], j2: [18, 18, 17, 17, 19], total: 179 },
    h2: { heat: 65, color: "white", j1: [16, 18, 17, 16, 16], j2: [17, 18, 17, 17, 18], total: 170 },
    score: 349, place: 7, vc: "CC"
  },
  {
    catalog_no: 79, breed: "Уиппет", className: "Стандартный-спринтеры", sex: "Кобель",
    name: "SHOW MUST GO ON",
    h1: { heat: 41, color: "red", j1: [17, 19, 18, 16, 17], j2: [17, 19, 18, 17, 18], total: 176 },
    h2: { heat: 64, color: "red", j1: [16, 18, 17, 16, 17], j2: [17, 18, 18, 17, 18], total: 172 },
    score: 348, place: 8, vc: "CC", qualification: "V"
  },
  {
    catalog_no: 67, breed: "Уиппет", className: "Стандартный-спринтеры", sex: "Кобель",
    name: "VREMYA NE ZHDYOT ERAGON",
    h1: { heat: 43, color: "white", j1: [17, 18, 17, 17, 18], j2: [17, 18, 18, 17, 18], total: 175 },
    h2: { heat: 63, color: "red", j1: [16, 18, 17, 16, 17], j2: [17, 18, 18, 17, 18], total: 172 },
    score: 347, place: 9, vc: "CC"
  },
  {
    catalog_no: 61, breed: "Уиппет", className: "Стандартный-спринтеры", sex: "Кобель",
    name: "AMBER VEIV'S MARIUS",
    h1: { heat: 44, color: "red", j1: [16, 18, 17, 16, 17], j2: [17, 18, 18, 17, 18], total: 172 },
    h2: { heat: 63, color: "white", j1: [15, 19, 16, 15, 16], j2: [18, 18, 18, 17, 18], total: 170 },
    score: 342, place: 10, vc: "CC"
  },

  // Уиппет Юниоры Суки
  {
    catalog_no: 102, breed: "Уиппет", className: "Юниоры", sex: "Сука",
    name: "КСЕНИЯ ГРАНД ДАЧЕСС",
    h1: { heat: 39, color: "red", j1: [17, 18, 18, 18, 19], j2: [17, 18, 19, 17, 19], total: 180 },
    h2: { heat: 61, color: "red", j1: [17, 19, 18, 17, 18], j2: [17, 18, 18, 17, 18], total: 177 },
    score: 357, place: 1, title: "Лучший юниор"
  },

  // Фараонова собака Кобели
  {
    catalog_no: 105, breed: "Фараонова собака", className: "Стандартный", sex: "Кобель",
    name: "REEDLY ROAD QUI WARRANTO",
    h1: { heat: 98, color: "red", j1: [18, 17, 16, 18, 17], j2: [18, 17, 18, 18, 17], total: 174 },
    h2: { heat: 117, color: "white", j1: [17, 18, 17, 17, 16], j2: [17, 18, 18, 17, 17], total: 172 },
    score: 346, place: 1, vc: "CC", title: "Чемпион РКФ"
  },
  {
    catalog_no: 104, breed: "Фараонова собака", className: "Стандартный", sex: "Кобель",
    name: "REEDLY ROAD QUE TAL",
    h1: { heat: 96, color: "white", j1: [17, 18, 17, 18, 17], j2: [18, 18, 17, 17, 18], total: 175 },
    h2: { heat: 117, color: "red", j1: [17, 18, 17, 17, 17], j2: [17, 17, 17, 16, 16], total: 169 },
    score: 344, place: 2, vc: "CC", title: "CACL"
  },
  {
    catalog_no: 107, breed: "Фараонова собака", className: "Стандартный", sex: "Кобель",
    name: "TIERIS GELLIOS",
    h1: { heat: 97, color: "white", j1: [17, 17, 16, 18, 17], j2: [17, 18, 18, 17, 17], total: 172 },
    h2: { heat: 118, color: "white", j1: [16, 18, 18, 16, 16], j2: [18, 17, 16, 16, 16], total: 167 },
    score: 339, place: 3, vc: "CC", title: "R.CACL"
  },
  {
    catalog_no: 103, breed: "Фараонова собака", className: "Стандартный", sex: "Кобель",
    name: "REEDLY ROAD MYBERN",
    h1: { heat: 96, color: "red", j1: [17, 18, 18, 17, 17], j2: [16, 17, 17, 16, 18], total: 171 },
    h2: { heat: 118, color: "red", j1: [15, 18, 18, 15, 16], j2: [16, 16, 18, 17, 15], total: 164 },
    score: 335, place: 4, vc: "CC"
  },
  {
    catalog_no: 106, breed: "Фараонова собака", className: "Стандартный", sex: "Кобель",
    name: "РИДЛИ РОАД КВИДДИЧ",
    h1: { heat: 97, color: "red", j1: [14, 16, 15, 15, 13], j2: [16, 18, 18, 15, 17], total: 157 },
    h2: { heat: 116, color: "red", j1: [18, 18, 18, 18, 17], j2: [17, 18, 17, 18, 17], total: 176 },
    score: 333, place: 5, vc: "CC"
  },

  // Фараонова собака Суки
  {
    catalog_no: 108, breed: "Фараонова собака", className: "Стандартный", sex: "Сука",
    name: "GALMAD STAR VELINA",
    h1: { heat: 99, color: "red", j1: [17, 18, 16, 16, 17], j2: [17, 18, 18, 17, 18], total: 172 },
    h2: { heat: 119, color: "red", j1: [17, 18, 18, 17, 16], j2: [17, 17, 17, 17, 17], total: 171 },
    score: 343, place: 1, vc: "CC", title: "Чемпион РКФ"
  },
  {
    catalog_no: 110, breed: "Фараонова собака", className: "Стандартный", sex: "Сука",
    name: "REEDLY ROAD MISS RIGHT",
    h1: { heat: 99, color: "white", j1: [16, 18, 16, 16, 17], j2: [16, 17, 17, 16, 17], total: 166 },
    h2: { heat: 119, color: "white", j1: [16, 18, 17, 16, 16], j2: [16, 18, 17, 16, 18], total: 168 },
    score: 334, place: 2, vc: "CC", title: "CACL"
  },
  {
    catalog_no: 109, breed: "Фараонова собака", className: "Стандартный", sex: "Сука",
    name: "LIBERTY INDIGO STAR",
    h1: { heat: 100, color: "red" },
    status: "withdrawn", status_reason: "Снят"
  },

  // Чирнеко дель Этна Общая
  {
    catalog_no: 111, breed: "Чирнеко дель Этна", className: "Стандартный", sex: "Кобель",
    name: "COLISTO'S BIRBO",
    h1: { heat: 101, color: "white", j1: [16, 17, 16, 15, 16], j2: [16, 17, 17, 15, 18], total: 163 },
    h2: { heat: 120, color: "white", j1: [16, 18, 18, 16, 16], j2: [18, 18, 18, 17, 17], total: 172 },
    score: 335, place: 1, vc: "CC", title: "Чемпион РКФ"
  },
  {
    catalog_no: 112, breed: "Чирнеко дель Этна", className: "Стандартный", sex: "Кобель",
    name: "TESORO SOLARE DOMENICO",
    h1: { heat: 102, color: "red", j1: [17, 18, 17, 18, 17], j2: [17, 18, 18, 17, 18], total: 175 },
    h2: { heat: 120, color: "red", j1: [10, 16, 16, 12, 12], j2: [17, 17, 18, 16, 16], total: 150 },
    score: 325, place: 2, vc: "CC", title: "CACL"
  },
  {
    catalog_no: 113, breed: "Чирнеко дель Этна", className: "Стандартный", sex: "Сука",
    name: "ROSSO BOREALE AURORA",
    h1: { heat: 101, color: "red" },
    status: "withdrawn", status_reason: "Снят"
  }
];

// Convert to results format
const results = dogsData.map((d, idx) => {
  const heats = [];
  if (d.h1 && d.h1.j1) {
    heats.push({
      heat_number: d.h1.heat,
      bib_color: d.h1.color,
      judges: [
        { scores: d.h1.j1, sum: d.h1.j1.reduce((a, b) => a + b, 0) },
        { scores: d.h1.j2, sum: d.h1.j2.reduce((a, b) => a + b, 0) }
      ],
      total: d.h1.total
    });
  }
  if (d.h2 && d.h2.j1) {
    heats.push({
      heat_number: d.h2.heat,
      bib_color: d.h2.color,
      judges: [
        { scores: d.h2.j1, sum: d.h2.j1.reduce((a, b) => a + b, 0) },
        { scores: d.h2.j2, sum: d.h2.j2.reduce((a, b) => a + b, 0) }
      ],
      total: d.h2.total
    });
  }

  const category = (d.className.includes('Общая') || d.sex === 'Общая') ? 'Микс' : d.sex;
  const breedClass = `${d.breed} - ${d.className} - ${category}`;
  const isLat = /^[A-Z0-9\s'".-]+$/i.test(d.name);
  const isRu = /[А-Яа-яЁё]/.test(d.name);

  return {
    id: idx + 1,
    catalog_no: d.catalog_no,
    breed_class: breedClass,
    placement: d.place ?? null,
    total_score: d.score ?? null,
    vc: d.vc ?? '',
    qualification: d.title || d.qualification || '',
    status: d.status ?? (d.score ? "finished" : "withdrawn"),
    status_reason: d.status_reason ?? null,
    judge_count: 2,
    raw_scores_json: {
      heats: heats,
      grand_total: d.score ?? null
    },
    dog: {
      name: d.name,
      name_lat: isLat ? d.name : undefined,
      name_ru: isRu ? d.name : undefined,
      breed: d.breed,
      sex: d.sex
    }
  };
});

const draft = {
  ...event,
  results
};

fs.writeFileSync('data/tmp/procoursing_2020/draft_20200822.json', JSON.stringify(draft, null, 2), 'utf8');
console.log('Successfully generated draft_20200822.json with', results.length, 'results.');
