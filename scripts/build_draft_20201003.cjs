const fs = require('fs');

const event = {
  id: 20201003,
  year: 2020,
  date_start: "2020-10-03",
  date_end: "2020-10-04",
  title: "Международный чемпионат по курсингу CACIL - Чемпионат России по курсингу",
  full_title: "Международный чемпионат по курсингу CACIL - Чемпионат России по курсингу, 03-04.10.2020 (Московская обл., Михайловское)",
  rank_label: "Международный чемпионат по курсингу CACIL - Чемпионат России по курсингу",
  event_type: "coursing",
  competition_kind: "CACIL / CACL",
  competition_type: "Курсинг борзых",
  host_club: null,
  region: "Московская область",
  location: "Московская область, Михайловское",
  protocol_location: "Московская обл., Михайловское",
  judges: "Егорова М.А., Орлова М.О., Куликова Г.В.",
  results_url: "http://procoursing.ru/results/2020-10-03/",
  catalog_url: null,
  confirmed: 1
};

const dogsData = [
  // Басенджи Кобели
  {
    catalog_no: 2, breed: "Басенджи", className: "Стандартный", sex: "Кобель",
    name: "DAKAR S KNJAZHESKOGO DVORA",
    h1: { heat: 97, color: "red", j1: [18, 17, 17, 17, 17], j2: [18, 17, 15, 17, 18], total: 171 },
    h2: { heat: 111, color: "red", j1: [18, 18, 17, 17, 18], j2: [16, 17, 16, 16, 17], total: 170 },
    score: 341, place: 1, vc: "CC", title: "Чемпион России"
  },
  {
    catalog_no: 3, breed: "Басенджи", className: "Стандартный", sex: "Кобель",
    name: "ELEN VLADKHINS FINWEST BASTER",
    h1: { heat: 99, color: "white", j1: [16, 16, 15, 17, 17], j2: [17, 15, 13, 17, 17], total: 160 },
    h2: { heat: 113, color: "white", j1: [18, 18, 18, 17, 19], j2: [17, 18, 17, 17, 19], total: 178 },
    score: 338, place: 2, vc: "CC", title: "CACL"
  },
  {
    catalog_no: 4, breed: "Басенджи", className: "Стандартный", sex: "Кобель",
    name: "GEZAN GOREDENNA",
    h1: { heat: 98, color: "white", j1: [16, 16, 15, 16, 16], j2: [18, 17, 15, 17, 18], total: 164 },
    h2: { heat: 114, color: "white", j1: [17, 18, 18, 17, 19], j2: [16, 18, 17, 16, 18], total: 174 },
    score: 338, place: 3, vc: "CC", title: "R.CACL"
  },
  {
    catalog_no: 7, breed: "Басенджи", className: "Стандартный", sex: "Кобель",
    name: "KASPER VAN DEAN",
    h1: { heat: 99, color: "red", j1: [17, 17, 16, 18, 17], j2: [17, 17, 15, 17, 18], total: 169 },
    h2: { heat: 112, color: "white", j1: [17, 17, 17, 17, 18], j2: [17, 17, 15, 16, 17], total: 168 },
    score: 337, place: 4, vc: "CC"
  },
  {
    catalog_no: 1, breed: "Басенджи", className: "Стандартный", sex: "Кобель",
    name: "AMAGAMMA NAMIB MALAVI",
    h1: { heat: 100, color: "red", j1: [17, 17, 15, 17, 17], j2: [17, 17, 15, 18, 18], total: 168 },
    h2: { heat: 114, color: "red", j1: [16, 16, 16, 16, 18], j2: [17, 17, 17, 17, 17], total: 167 },
    score: 335, place: 5, vc: "CC"
  },
  {
    catalog_no: 8, breed: "Басенджи", className: "Стандартный", sex: "Кобель",
    name: "KAVKAZON PIRAT",
    h1: { heat: 98, color: "red", j1: [17, 17, 15, 17, 17], j2: [17, 16, 14, 16, 18], total: 164 },
    h2: { heat: 111, color: "white", j1: [18, 17, 16, 17, 18], j2: [17, 16, 16, 16, 17], total: 168 },
    score: 332, place: 6, vc: "CC"
  },
  {
    catalog_no: 5, breed: "Басенджи", className: "Стандартный", sex: "Кобель",
    name: "ITURI PUZZLE IZYUM V CHOCOLADE",
    h1: { heat: 101, color: "red", j1: [17, 17, 16, 17, 17], j2: [15, 17, 14, 15, 17], total: 162 },
    h2: { heat: 113, color: "red", j1: [17, 16, 16, 17, 17], j2: [16, 17, 17, 18, 18], total: 169 },
    score: 331, place: 7, vc: "CC"
  },
  {
    catalog_no: 9, breed: "Басенджи", className: "Стандартный", sex: "Кобель",
    name: "SUNRISE LEUR ADAM",
    h1: { heat: 97, color: "white", j1: [17, 16, 15, 16, 16], j2: [16, 16, 14, 17, 18], total: 161 },
    h2: { heat: 112, color: "red", j1: [17, 17, 16, 17, 18], j2: [16, 17, 16, 17, 17], total: 168 },
    score: 329, place: 8, vc: "CC"
  },
  {
    catalog_no: 6, breed: "Басенджи", className: "Стандартный", sex: "Кобель",
    name: "ITURI PUZZLE EXTRAORDINARY SMART", dogId: 50,
    h1: { heat: 100, color: "white" },
    status: "disqualified", status_reason: "Дисквалификация"
  },

  // Басенджи Суки
  {
    catalog_no: 13, breed: "Басенджи", className: "Стандартный", sex: "Сука",
    name: "NASLEDIYE ETERA NINFA DEL BOSCO",
    h1: { heat: 104, color: "red", j1: [18, 18, 15, 18, 18], j2: [17, 17, 16, 17, 17], total: 171 },
    h2: { heat: 115, color: "red", j1: [18, 18, 18, 18, 18], j2: [17, 18, 17, 17, 18], total: 177 },
    score: 348, place: 1, vc: "CC", title: "Чемпион России"
  },
  {
    catalog_no: 14, breed: "Басенджи", className: "Стандартный", sex: "Сука",
    name: "REYNEX-LIS",
    h1: { heat: 102, color: "red", j1: [18, 18, 17, 18, 17], j2: [18, 17, 15, 17, 18], total: 173 },
    h2: { heat: 116, color: "red", j1: [18, 17, 18, 18, 17], j2: [17, 18, 17, 18, 17], total: 175 },
    score: 348, place: 2, vc: "CC", title: "CACL"
  },
  {
    catalog_no: 12, breed: "Басенджи", className: "Стандартный", sex: "Сука",
    name: "GORDEN MAGIC MARIEL PERSEUS URSA", dogId: 10393,
    h1: { heat: 102, color: "white", j1: [18, 17, 17, 17, 17], j2: [18, 17, 14, 17, 18], total: 170 },
    h2: { heat: 115, color: "white", j1: [16, 17, 17, 17, 17], j2: [17, 17, 16, 18, 18], total: 170 },
    score: 340, place: 3, vc: "CC", title: "R.CACL"
  },
  {
    catalog_no: 10, breed: "Басенджи", className: "Стандартный", sex: "Сука",
    name: "AMAGAMMA LUNDGIL",
    h1: { heat: 103, color: "red", j1: [16, 16, 12, 15, 15], j2: [18, 18, 16, 18, 17], total: 161 },
    h2: { heat: 117, color: "red", j1: [18, 18, 18, 18, 17], j2: [18, 17, 17, 18, 18], total: 177 },
    score: 338, place: 4, vc: "CC"
  },
  {
    catalog_no: 11, breed: "Басенджи", className: "Стандартный", sex: "Сука",
    name: "BERTIE",
    h1: { heat: 103, color: "white", j1: [18, 17, 15, 18, 18], j2: [16, 16, 15, 16, 15], total: 164 },
    h2: { heat: 116, color: "white", j1: [16, 18, 18, 16, 18], j2: [16, 17, 17, 17, 17], total: 170 },
    score: 334, place: 5, vc: "CC"
  },

  // Басенджи Юниоры Кобели
  {
    catalog_no: 17, breed: "Басенджи", className: "Юниоры", sex: "Кобель",
    name: "HOUSE THE RAINBOW UZOCHI ZIKIMO", dogId: 5683,
    h1: { heat: 105, color: "red", j1: [17, 18, 14, 17, 17], j2: [17, 18, 15, 17, 17], total: 167 },
    h2: { heat: 118, color: "red", j1: [17, 18, 18, 18, 18], j2: [18, 18, 18, 17, 18], total: 178 },
    score: 345, place: 1, title: "Лучший юниор"
  },
  {
    catalog_no: 16, breed: "Басенджи", className: "Юниоры", sex: "Кобель",
    name: "HOUSE THE RAINBOW FIJI", dogId: 10468,
    h1: { heat: 105, color: "white", j1: [17, 17, 15, 18, 17], j2: [16, 17, 14, 17, 17], total: 165 },
    h2: { heat: 118, color: "white", j1: [18, 17, 17, 17, 17], j2: [18, 17, 17, 16, 18], total: 172 },
    score: 337, place: 2
  },

  // Грейхаунд Стандартный Общая
  {
    catalog_no: 25, breed: "Грейхаунд", className: "Стандартный", sex: "Сука",
    name: "DIVERSIJA",
    h1: { heat: 55, color: "red", j1: [19, 18, 15, 18, 18], j2: [19, 18, 19, 19, 19], total: 182 },
    h2: { heat: 66, color: "red", j1: [18, 19, 18, 18, 19], j2: [18, 19, 19, 19, 19], total: 186 },
    score: 368, place: 1, vc: "CC, CACIL", title: "Чемпион России"
  },
  {
    catalog_no: 18, breed: "Грейхаунд", className: "Стандартный", sex: "Кобель",
    name: "ARTEFAKT JEAN CHARDIN",
    h1: { heat: 56, color: "red", j1: [20, 19, 15, 19, 19], j2: [19, 18, 18, 19, 19], total: 185 },
    h2: { heat: 67, color: "white", j1: [19, 18, 18, 18, 20], j2: [17, 17, 18, 16, 18], total: 179 },
    score: 364, place: 2, vc: "CC, R.CACIL", title: "CACL"
  },
  {
    catalog_no: 22, breed: "Грейхаунд", className: "Стандартный", sex: "Кобель",
    name: "RUSSKIY VETER GASTON",
    h1: { heat: 54, color: "white", j1: [18, 19, 15, 17, 18], j2: [19, 19, 19, 19, 17], total: 180 },
    h2: { heat: 66, color: "white", j1: [17, 19, 17, 18, 19], j2: [16, 18, 17, 17, 18], total: 176 },
    score: 356, place: 3, vc: "CC", title: "R.CACL"
  },
  {
    catalog_no: 20, breed: "Грейхаунд", className: "Стандартный", sex: "Кобель",
    name: "BEL ETUAL GERTSOG GAMILTON",
    h1: { heat: 55, color: "white", j1: [19, 17, 15, 18, 18], j2: [16, 17, 17, 18, 17], total: 172 },
    h2: { heat: 68, color: "white", j1: [19, 19, 18, 18, 20], j2: [17, 17, 18, 18, 18], total: 182 },
    score: 354, place: 4, vc: "CC"
  },
  {
    catalog_no: 24, breed: "Грейхаунд", className: "Стандартный", sex: "Сука",
    name: "ARTEFAKT JULIETTE ADAM",
    h1: { heat: 57, color: "red", j1: [19, 18, 15, 19, 18], j2: [17, 18, 18, 17, 18], total: 177 },
    h2: { heat: 68, color: "red", j1: [18, 20, 17, 17, 20], j2: [16, 18, 17, 16, 17], total: 176 },
    score: 353, place: 5, vc: "CC"
  },
  {
    catalog_no: 19, breed: "Грейхаунд", className: "Стандартный", sex: "Кобель",
    name: "ARTEFAKT JOIE DE VIVRE",
    h1: { heat: 54, color: "red", j1: [18, 18, 15, 18, 18], j2: [17, 18, 18, 17, 18], total: 175 },
    h2: { heat: 67, color: "red", j1: [17, 19, 18, 17, 20], j2: [16, 18, 17, 17, 17], total: 176 },
    score: 351, place: 6, vc: "CC"
  },
  {
    catalog_no: 21, breed: "Грейхаунд", className: "Стандартный", sex: "Кобель",
    name: "RUSSKIY VETER GAGARIN",
    h1: { heat: 57, color: "white", j1: [18, 17, 14, 18, 17], j2: [16, 16, 17, 16, 16], total: 165 },
    h2: { heat: 69, color: "red", j1: [20, 17, 17, 19, 18], j2: [18, 16, 15, 17, 17], total: 174 },
    score: 339, place: 7, vc: "CC"
  },
  {
    catalog_no: 23, breed: "Грейхаунд", className: "Стандартный", sex: "Кобель",
    name: "RUSSKIY VETER GEKTOR",
    h1: { heat: 56, color: "white", j1: [18, 18, 15, 18, 19], j2: [18, 17, 17, 17, 18], total: 175 },
    score: 175, status: "withdrawn", status_reason: "Травма"
  },

  // Левретка Выше стандарта Суки
  {
    catalog_no: 28, breed: "Левретка", className: "Выше стандарта", sex: "Сука",
    name: "MIO BELISSIMO ALLEGRA VENTO",
    h1: { heat: 86, color: "red", j1: [18, 18, 16, 18, 18], j2: [18, 19, 19, 18, 19], total: 181 },
    h2: { heat: 95, color: "red", j1: [20, 19, 20, 20, 19], j2: [20, 19, 19, 20, 20], total: 196 },
    score: 377, place: 1, vc: "CC"
  },
  {
    catalog_no: 29, breed: "Левретка", className: "Выше стандарта", sex: "Сука",
    name: "VALS VALENTO YULISA",
    h1: { heat: 86, color: "white", j1: [5, 17, 13, 8, 5], j2: [4, 16, 10, 7, 4], total: 89 },
    score: 89, status: "withdrawn"
  },

  // Левретка Стандартный Общая
  {
    catalog_no: 31, breed: "Левретка", className: "Стандартный", sex: "Сука",
    name: "GRACE HAUND ELIZABETH HER EXCELLENCE",
    h1: { heat: 87, color: "white", j1: [18, 18, 15, 17, 17], j2: [18, 18, 18, 18, 18], total: 175 },
    h2: { heat: 96, color: "red", j1: [19, 18, 19, 19, 19], j2: [19, 19, 18, 19, 20], total: 189 },
    score: 364, place: 1, vc: "CC"
  },
  {
    catalog_no: 30, breed: "Левретка", className: "Стандартный", sex: "Кобель",
    name: "DONATELLO BIMBO BELLO DAI GIARDINI DELLO ZAR",
    h1: { heat: 87, color: "red", j1: [17, 17, 14, 17, 16], j2: [17, 17, 17, 18, 18], total: 168 },
    h2: { heat: 96, color: "white", j1: [18, 19, 17, 18, 18], j2: [17, 17, 16, 16, 19], total: 175 },
    score: 343, place: 2, vc: "CC"
  },

  // Поденко Ибиценко Стандартный Общая
  {
    catalog_no: 35, breed: "Поденко Ибиценко", className: "Стандартный", sex: "Сука",
    name: "LUCKYHAS BAILA RUBIA PARA TERRA BALTIKA",
    h1: { heat: 108, color: "red", j1: [17, 17, 15, 18, 18], j2: [18, 17, 16, 17, 17], total: 170 },
    h2: { heat: 120, color: "white", j1: [17, 18, 18, 18, 18], j2: [17, 16, 18, 17, 18], total: 175 },
    score: 345, place: 1, vc: "CC", title: "Чемпион России"
  },
  {
    catalog_no: 36, breed: "Поденко Ибиценко", className: "Стандартный", sex: "Сука",
    name: "YOU WARM MY HEART",
    h1: { heat: 107, color: "red", j1: [17, 17, 14, 15, 18], j2: [17, 17, 15, 17, 17], total: 164 },
    h2: { heat: 121, color: "red", j1: [18, 18, 18, 18, 18], j2: [17, 18, 18, 17, 18], total: 178 },
    score: 342, place: 2, vc: "CC", title: "CACL"
  },
  {
    catalog_no: 33, breed: "Поденко Ибиценко", className: "Стандартный", sex: "Кобель",
    name: "ANVAR NURI YELLOW WILD FLOWER",
    h1: { heat: 106, color: "red", j1: [17, 16, 15, 17, 17], j2: [17, 16, 16, 17, 17], total: 165 },
    h2: { heat: 120, color: "red", j1: [16, 17, 17, 17, 17], j2: [18, 17, 17, 17, 18], total: 171 },
    score: 336, place: 3, vc: "CC", title: "R.CACL"
  },
  {
    catalog_no: 32, breed: "Поденко Ибиценко", className: "Стандартный", sex: "Кобель",
    name: "ANVAR NURI ELANDGE LEO",
    h1: { heat: 107, color: "white", j1: [18, 17, 15, 14, 17], j2: [16, 16, 16, 16, 16], total: 161 },
    h2: { heat: 119, color: "white", j1: [17, 16, 16, 17, 17], j2: [18, 16, 17, 17, 17], total: 168 },
    score: 329, place: 4, vc: "CC"
  },
  {
    catalog_no: 34, breed: "Поденко Ибиценко", className: "Стандартный", sex: "Кобель",
    name: "ANVAR NURI ZHIGER SHAY",
    h1: { heat: 106, color: "white", j1: [17, 17, 15, 17, 17], j2: [17, 17, 16, 17, 17], total: 150 }, // penalty 10% applied in source table (167 -> 150)
    h2: { heat: 119, color: "red", j1: [17, 17, 17, 16, 17], j2: [17, 17, 17, 16, 18], total: 169 },
    score: 319, place: 5, vc: "CC", status_reason: "Ранний старт (штраф 10% от суммы баллов забега)"
  },

  // Родезийский риджбек Стандартный Кобели
  {
    catalog_no: 39, breed: "Родезийский риджбек", className: "Стандартный", sex: "Кобель",
    name: "GRAND CORTEGE NEMBUS THE BRIGHTEST",
    h1: { heat: 125, color: "red", j1: [18, 18, 15, 17, 18], j2: [17, 18, 18, 18, 20], total: 177 },
    h2: { heat: 135, color: "red", j1: [16, 18, 17, 16, 18], j2: [17, 17, 17, 17, 17], total: 170 },
    score: 347, place: 1, vc: "CC", title: "Чемпион России"
  },
  {
    catalog_no: 40, breed: "Родезийский риджбек", className: "Стандартный", sex: "Кобель",
    name: "JELANY RED TROY",
    h1: { heat: 124, color: "white", j1: [16, 17, 15, 17, 17], j2: [16, 17, 16, 17, 17], total: 165 },
    h2: { heat: 135, color: "white", j1: [16, 18, 17, 17, 18], j2: [16, 17, 17, 17, 17], total: 170 },
    score: 335, place: 2, vc: "CC", title: "CACL"
  },
  {
    catalog_no: 38, breed: "Родезийский риджбек", className: "Стандартный", sex: "Кобель",
    name: "BILLAAR NWANKWO AMBERONE AIDEN",
    h1: { heat: 124, color: "red", j1: [8, 16, 10, 8, 7], j2: [8, 15, 10, 10, 7], total: 99 },
    score: 99, status: "withdrawn"
  },
  {
    catalog_no: 37, breed: "Родезийский риджбек", className: "Стандартный", sex: "Кобель",
    name: "ARIES KHAN MARLON BRANDO",
    h1: { heat: 125, color: "white" },
    status: "withdrawn", status_reason: "Снят"
  },

  // Родезийский риджбек Стандартный Суки
  {
    catalog_no: 42, breed: "Родезийский риджбек", className: "Стандартный", sex: "Сука",
    name: "ARIES KHAN PHREIA PASIPHAE", dogId: 182,
    h1: { heat: 126, color: "white", j1: [18, 18, 15, 17, 18], j2: [18, 17, 17, 18, 17], total: 173 },
    h2: { heat: 137, color: "red", j1: [17, 18, 17, 17, 18], j2: [18, 18, 18, 18, 19], total: 178 },
    score: 351, place: 1, vc: "CC", title: "Чемпион России"
  },
  {
    catalog_no: 45, breed: "Родезийский риджбек", className: "Стандартный", sex: "Сука",
    name: "RAYRIDGE IZIDA IDA",
    h1: { heat: 127, color: "red", j1: [18, 18, 15, 18, 18], j2: [18, 17, 17, 18, 18], total: 175 },
    h2: { heat: 137, color: "white", j1: [17, 17, 18, 16, 17], j2: [17, 17, 17, 17, 18], total: 171 },
    score: 346, place: 2, vc: "CC", title: "CACL"
  },
  {
    catalog_no: 43, breed: "Родезийский риджбек", className: "Стандартный", sex: "Сука",
    name: "GRAND CORTEGE NOBLE QUEEN",
    h1: { heat: 128, color: "red", j1: [16, 17, 15, 18, 18], j2: [16, 18, 18, 15, 18], total: 169 },
    h2: { heat: 136, color: "red", j1: [14, 18, 18, 15, 18], j2: [17, 16, 16, 15, 16], total: 163 },
    score: 332, place: 3, vc: "CC", title: "R.CACL"
  },
  {
    catalog_no: 47, breed: "Родезийский риджбек", className: "Стандартный", sex: "Сука",
    name: "SUNHILL RIDGES NOLA ADEOLA",
    h1: { heat: 126, color: "red", j1: [10, 17, 15, 13, 17], j2: [17, 18, 17, 15, 18], total: 157 },
    h2: { heat: 136, color: "white", j1: [14, 18, 18, 13, 17], j2: [16, 16, 15, 15, 16], total: 158 },
    score: 315, place: 4, vc: "CC"
  },
  {
    catalog_no: 46, breed: "Родезийский риджбек", className: "Стандартный", sex: "Сука",
    name: "SHABANI'S PIPPILOTTA",
    h1: { heat: 127, color: "white" },
    status: "withdrawn", status_reason: "Снят"
  },

  // Родезийский риджбек Юниоры Суки
  {
    catalog_no: 48, breed: "Родезийский риджбек", className: "Юниоры", sex: "Сука",
    name: "MAENDELEO HOLY LARA CROFT ARIES KHAN",
    h1: { heat: 129, color: "red", j1: [18, 18, 15, 19, 18], j2: [18, 18, 17, 19, 19], total: 179 },
    h2: { heat: 138, color: "red", j1: [19, 18, 18, 19, 19], j2: [17, 17, 16, 18, 17], total: 178 },
    score: 357, place: 1, title: "Лучший юниор"
  },

  // Русская псовая борзая Стандартный Кобели
  {
    catalog_no: 50, breed: "Русская псовая борзая", className: "Стандартный", sex: "Кобель",
    name: "KARAY",
    h1: { heat: 130, color: "white", j1: [17, 17, 15, 18, 18], j2: [18, 18, 18, 18, 19], total: 176 },
    h2: { heat: 142, color: "red", j1: [18, 19, 18, 18, 18], j2: [17, 19, 18, 18, 18], total: 181 },
    score: 357, place: 1, vc: "CC", title: "Чемпион России"
  },
  {
    catalog_no: 49, breed: "Русская псовая борзая", className: "Стандартный", sex: "Кобель",
    name: "BORZIE-SENAVIAN TSAGRY",
    h1: { heat: 134, color: "red", j1: [17, 18, 15, 17, 18], j2: [17, 17, 17, 17, 17], total: 170 },
    h2: { heat: 140, color: "white", j1: [19, 19, 18, 18, 19], j2: [18, 19, 18, 19, 19], total: 186 },
    score: 356, place: 2, vc: "CC", title: "CACL"
  },
  {
    catalog_no: 52, breed: "Русская псовая борзая", className: "Стандартный", sex: "Кобель",
    name: "SEREBYANYI IZ SEVERNOY OHOTY",
    h1: { heat: 134, color: "white", j1: [17, 17, 15, 17, 18], j2: [16, 18, 17, 16, 18], total: 169 },
    h2: { heat: 141, color: "white", j1: [17, 18, 19, 18, 19], j2: [17, 18, 16, 17, 18], total: 177 },
    score: 346, place: 3, vc: "CC", title: "R.CACL"
  },
  {
    catalog_no: 53, breed: "Русская псовая борзая", className: "Стандартный", sex: "Кобель",
    name: "SOLOVYEV SHELKOVYI ANGEL",
    h1: { heat: 133, color: "red", j1: [8, 17, 15, 12, 17], j2: [15, 16, 16, 15, 16], total: 147 },
    h2: { heat: 143, color: "red", j1: [15, 18, 16, 18, 16], j2: [16, 16, 17, 16, 16], total: 164 },
    score: 311, place: 4, vc: "CC, R.CACIL"
  },

  // Русская псовая борзая Стандартный Суки
  {
    catalog_no: 57, breed: "Русская псовая борзая", className: "Стандартный", sex: "Сука",
    name: "DOROGOY DRUG ULANKA",
    h1: { heat: 131, color: "red", j1: [17, 19, 15, 18, 18], j2: [18, 19, 18, 19, 19], total: 180 },
    h2: { heat: 141, color: "red", j1: [18, 19, 18, 18, 20], j2: [18, 18, 18, 19, 19], total: 185 },
    score: 365, place: 1, vc: "CC, CACIL", title: "Чемпион России"
  },
  {
    catalog_no: 58, breed: "Русская псовая борзая", className: "Стандартный", sex: "Сука",
    name: "PERM VELIKAYA SAFYANA",
    h1: { heat: 130, color: "red", j1: [18, 18, 15, 18, 18], j2: [17, 18, 18, 17, 19], total: 176 },
    h2: { heat: 139, color: "red", j1: [19, 19, 18, 18, 19], j2: [19, 19, 18, 18, 18], total: 185 },
    score: 361, place: 2, vc: "CC", title: "CACL"
  },
  {
    catalog_no: 59, breed: "Русская псовая борзая", className: "Стандартный", sex: "Сука",
    name: "SOLITSA",
    h1: { heat: 133, color: "white", j1: [17, 18, 15, 18, 19], j2: [18, 18, 18, 17, 18], total: 176 },
    h2: { heat: 139, color: "white", j1: [19, 18, 19, 19, 19], j2: [18, 18, 18, 19, 18], total: 185 },
    score: 361, place: 3, vc: "CC", title: "R.CACL"
  },
  {
    catalog_no: 56, breed: "Русская псовая борзая", className: "Стандартный", sex: "Сука",
    name: "DERZHI VETER ANARHIYA",
    h1: { heat: 132, color: "red", j1: [17, 18, 15, 17, 18], j2: [17, 18, 18, 17, 18], total: 173 },
    h2: { heat: 140, color: "red", j1: [18, 19, 18, 18, 19], j2: [18, 19, 18, 18, 19], total: 184 },
    score: 357, place: 4, vc: "CC"
  },
  {
    catalog_no: 55, breed: "Русская псовая борзая", className: "Стандартный", sex: "Сука",
    name: "BORZIE-SENAVIAN CARINA",
    h1: { heat: 131, color: "white", j1: [16, 18, 15, 17, 18], j2: [18, 18, 18, 18, 19], total: 175 },
    h2: { heat: 142, color: "white", j1: [18, 18, 19, 18, 19], j2: [18, 18, 17, 17, 17], total: 179 },
    score: 354, place: 5, vc: "CC"
  },
  {
    catalog_no: 60, breed: "Русская псовая борзая", className: "Стандартный", sex: "Сука",
    name: "ZVEZDNAYA RADUGA MIROSLAVA",
    h1: { heat: 132, color: "white" },
    status: "withdrawn", status_reason: "Снят"
  },

  // Салюки Стандартный Суки
  {
    catalog_no: 63, breed: "Салюки", className: "Стандартный", sex: "Сука",
    name: "SALGREY'S ODETTA",
    h1: { heat: 84, color: "red", j1: [19, 18, 15, 18, 19], j2: [18, 19, 18, 18, 18], total: 180 },
    h2: { heat: 92, color: "red", j1: [18, 18, 18, 17, 20], j2: [18, 18, 17, 18, 18], total: 180 },
    score: 360, place: 1, vc: "CC", title: "Чемпион России"
  },
  {
    catalog_no: 61, breed: "Салюки", className: "Стандартный", sex: "Сука",
    name: "AL NAFISEH GHAALIYA",
    h1: { heat: 83, color: "red", j1: [18, 18, 14, 17, 18], j2: [18, 18, 18, 18, 18], total: 175 },
    h2: { heat: 93, color: "red", j1: [20, 18, 18, 19, 20], j2: [17, 18, 17, 18, 18], total: 183 },
    score: 358, place: 2, vc: "CC", title: "CACL"
  },
  {
    catalog_no: 62, breed: "Салюки", className: "Стандартный", sex: "Сука",
    name: "SALGREY'S MIRANDA",
    h1: { heat: 83, color: "white", j1: [15, 17, 14, 17, 17], j2: [15, 17, 16, 15, 17], total: 160 },
    h2: { heat: 92, color: "white", j1: [19, 17, 18, 17, 19], j2: [17, 17, 17, 17, 17], total: 175 },
    score: 335, place: 3, vc: "CC", title: "R.CACL"
  },

  // Салюки Юниоры Суки
  {
    catalog_no: 64, breed: "Салюки", className: "Юниоры", sex: "Сука",
    name: "SALGREY'S PRIMAVERA",
    h1: { heat: 85, color: "red", j1: [19, 18, 15, 19, 20], j2: [18, 19, 19, 19, 19], total: 185 },
    h2: { heat: 94, color: "red", j1: [18, 18, 18, 18, 20], j2: [17, 19, 18, 18, 19], total: 183 },
    score: 368, place: 1, title: "Лучший юниор"
  },

  // Слюги Стандартный Кобели
  {
    catalog_no: 65, breed: "Слюги", className: "Стандартный", sex: "Кобель",
    name: "BORZOMIR BARFAR AMAN",
    h1: { heat: 77, color: "red", j1: [16, 18, 15, 17, 17], j2: [17, 18, 18, 17, 18], total: 171 },
    h2: { heat: 88, color: "red", j1: [15, 18, 17, 14, 14], j2: [17, 16, 16, 16, 17], total: 160 },
    score: 331, place: 1, vc: "CC, CACIL", title: "Чемпион России"
  },
  {
    catalog_no: 66, breed: "Слюги", className: "Стандартный", sex: "Кобель",
    name: "BORZOMIR BARKHAN ALI",
    h1: { heat: 77, color: "white", j1: [16, 16, 15, 16, 16], j2: [18, 17, 17, 18, 17], total: 166 },
    h2: { heat: 88, color: "white", j1: [5, 17, 12, 7, 7], j2: [12, 15, 14, 10, 10], total: 109 },
    score: 275, place: 2, status: "finished"
  },
  {
    catalog_no: 67, breed: "Слюги", className: "Стандартный", sex: "Кобель",
    name: "BORZOMIR BASEL AKMAL",
    h1: { heat: 78, color: "red" },
    status: "withdrawn", status_reason: "Снят"
  },

  // Слюги Стандартный Суки
  {
    catalog_no: 70, breed: "Слюги", className: "Стандартный", sex: "Сука",
    name: "BORZOMIR GALIJA BASMA",
    h1: { heat: 79, color: "white", j1: [18, 18, 15, 17, 18], j2: [19, 18, 17, 18, 18], total: 176 },
    h2: { heat: 89, color: "white", j1: [15, 17, 16, 16, 17], j2: [16, 16, 17, 16, 17], total: 163 },
    score: 339, place: 1, vc: "CC", title: "Чемпион России"
  },
  {
    catalog_no: 68, breed: "Слюги", className: "Стандартный", sex: "Сука",
    name: "BORZOMIR BAKHRUZ AZIZA",
    h1: { heat: 80, color: "red", j1: [8, 18, 15, 10, 13], j2: [16, 17, 16, 13, 16], total: 142 },
    h2: { heat: 89, color: "red", j1: [17, 18, 17, 17, 18], j2: [17, 18, 17, 18, 18], total: 175 },
    score: 317, place: 2, vc: "CC, R.CACIL", title: "CACL"
  },
  {
    catalog_no: 69, breed: "Слюги", className: "Стандартный", sex: "Сука",
    name: "BORZOMIR BARIYAT AMIRA",
    h1: { heat: 79, color: "red", j1: [18, 17, 15, 16, 16], j2: [18, 17, 18, 17, 17], total: 169 },
    h2: { heat: 90, color: "red" },
    score: 169, status: "withdrawn", status_reason: "Снят"
  },

  // Тазы Стандартный Общая
  {
    catalog_no: 71, breed: "Тазы", className: "Стандартный", sex: "Кобель",
    name: "BORZOMIR AMIR",
    h1: { heat: 81, color: "white", j1: [17, 16, 15, 16, 16], j2: [17, 17, 15, 16, 17], total: 162 },
    h2: { heat: 91, color: "white", j1: [17, 18, 18, 17, 18], j2: [17, 17, 17, 18, 18], total: 175 },
    score: 337, place: 1, vc: "CC", title: "Чемпион России"
  },
  {
    catalog_no: 72, breed: "Тазы", className: "Стандартный", sex: "Сука",
    name: "BORZOMIR AISULU",
    h1: { heat: 81, color: "red", j1: [17, 17, 15, 17, 17], j2: [16, 17, 17, 17, 17], total: 167 },
    h2: { heat: 91, color: "red", j1: [17, 17, 17, 17, 17], j2: [17, 16, 17, 17, 17], total: 169 },
    score: 336, place: 2, vc: "CC", title: "CACL"
  },
  {
    catalog_no: 73, breed: "Тазы", className: "Стандартный", sex: "Сука",
    name: "MATILDA DLYA BORZOMIR",
    h1: { heat: 82, color: "red", j1: [18, 17, 15, 17, 18], j2: [18, 17, 16, 18, 17], total: 171 },
    score: 171, status: "withdrawn", status_reason: "Снят владельцем"
  },

  // Тайский риджбек Стандартный Общая
  {
    catalog_no: 74, breed: "Тайский риджбек", className: "Стандартный", sex: "Кобель",
    name: "YAROSVET POBEDONOSNY",
    h1: { heat: 110, color: "red", j1: [17, 17, 14, 17, 17], j2: [17, 16, 16, 16, 17], total: 164 },
    h2: { heat: 122, color: "red", j1: [15, 17, 17, 17, 17], j2: [16, 18, 17, 16, 18], total: 168 },
    score: 332, place: 1, vc: "CC", title: "Чемпион России"
  },
  {
    catalog_no: 76, breed: "Тайский риджбек", className: "Стандартный", sex: "Сука",
    name: "THAI-MEX AURA",
    h1: { heat: 109, color: "red", j1: [17, 17, 15, 17, 18], j2: [17, 16, 15, 17, 16], total: 165 },
    h2: { heat: 123, color: "red", j1: [15, 17, 17, 15, 17], j2: [17, 17, 17, 17, 18], total: 167 },
    score: 332, place: 2, vc: "CC", title: "CACL"
  },
  {
    catalog_no: 75, breed: "Тайский риджбек", className: "Стандартный", sex: "Сука",
    name: "LAWAN FAILIN KANDOL MILEDA",
    h1: { heat: 109, color: "white", j1: [17, 17, 14, 17, 17], j2: [16, 15, 14, 16, 16], total: 159 },
    h2: { heat: 122, color: "white", j1: [14, 16, 17, 15, 17], j2: [15, 16, 17, 15, 16], total: 158 },
    score: 317, place: 3, vc: "CC", title: "R.CACL"
  },

  // Уиппет Ветераны Кобели
  {
    catalog_no: 78, breed: "Уиппет", className: "Ветераны", sex: "Кобель",
    name: "ANYUTINY GLAZKI DARIUS I",
    h1: { heat: 36, color: "white", j1: [18, 19, 15, 19, 18], j2: [17, 18, 17, 17, 18], total: 176 },
    h2: { heat: 52, color: "white", j1: [19, 18, 17, 19, 19], j2: [16, 15, 16, 16, 17], total: 172 },
    score: 348, place: 1, vc: "CC", title: "Лучший ветеран"
  },
  {
    catalog_no: 77, breed: "Уиппет", className: "Ветераны", sex: "Кобель",
    name: "ALMAZ DUSHA LAMBERT DIAMOND",
    h1: { heat: 36, color: "red", j1: [18, 18, 14, 19, 18], j2: [15, 17, 16, 15, 16], total: 166 },
    h2: { heat: 52, color: "red", j1: [19, 19, 18, 19, 19], j2: [17, 17, 18, 17, 18], total: 181 },
    score: 347, place: 2, vc: "CC"
  },

  // Уиппет Стандартный Кобели
  {
    catalog_no: 97, breed: "Уиппет", className: "Стандартный", sex: "Кобель",
    name: "GUY",
    h1: { heat: 29, color: "red", j1: [19, 19, 15, 17, 20], j2: [19, 19, 20, 19, 19], total: 186 },
    h2: { heat: 46, color: "red", j1: [20, 20, 19, 19, 20], j2: [19, 19, 19, 20, 20], total: 195 },
    score: 381, place: 1, vc: "CC, CACIL", title: "Чемпион России"
  },
  {
    catalog_no: 96, breed: "Уиппет", className: "Стандартный", sex: "Кобель",
    name: "GORDEY",
    h1: { heat: 33, color: "white", j1: [19, 17, 15, 18, 19], j2: [19, 19, 19, 20, 19], total: 184 },
    h2: { heat: 45, color: "red", j1: [19, 20, 18, 19, 20], j2: [19, 19, 20, 19, 19], total: 192 },
    score: 376, place: 2, vc: "CC", title: "CACL"
  },
  {
    catalog_no: 95, breed: "Уиппет", className: "Стандартный", sex: "Кобель",
    name: "FIERCE FIREBALL FIFTH GEAR",
    h1: { heat: 30, color: "white", j1: [19, 19, 15, 18, 20], j2: [19, 18, 19, 19, 18], total: 184 },
    h2: { heat: 45, color: "white", j1: [19, 20, 19, 19, 20], j2: [17, 18, 18, 17, 17], total: 184 },
    score: 368, place: 3, vc: "CC, R.CACIL", title: "R.CACL"
  },
  {
    catalog_no: 105, breed: "Уиппет", className: "Стандартный", sex: "Кобель",
    name: "STANGERS LAND BLACKTHORNE WINTER",
    h1: { heat: 28, color: "white", j1: [19, 19, 15, 19, 20], j2: [19, 19, 18, 19, 18], total: 185 },
    h2: { heat: 49, color: "red", j1: [19, 20, 20, 19, 20], j2: [15, 18, 17, 15, 17], total: 180 },
    score: 365, place: 4, vc: "CC"
  },
  {
    catalog_no: 109, breed: "Уиппет", className: "Стандартный", sex: "Кобель",
    name: "VASURU TAFFI'S NOW OR NEVER",
    h1: { heat: 32, color: "red", j1: [17, 20, 15, 18, 20], j2: [17, 17, 18, 17, 18], total: 177 },
    h2: { heat: 46, color: "white", j1: [20, 19, 19, 19, 20], j2: [18, 18, 17, 18, 18], total: 186 },
    score: 363, place: 5, vc: "CC"
  },
  {
    catalog_no: 103, breed: "Уиппет", className: "Стандартный", sex: "Кобель",
    name: "SHERWOOD FOREST HERO",
    h1: { heat: 31, color: "red", j1: [19, 18, 15, 17, 20], j2: [17, 19, 18, 17, 17], total: 177 },
    h2: { heat: 47, color: "white", j1: [18, 19, 19, 19, 20], j2: [18, 18, 19, 18, 18], total: 186 },
    score: 363, place: 6, vc: "CC"
  },
  {
    catalog_no: 93, breed: "Уиппет", className: "Стандартный", sex: "Кобель",
    name: "DJINI LAMBOR",
    h1: { heat: 31, color: "white", j1: [18, 19, 15, 18, 20], j2: [16, 18, 17, 16, 16], total: 173 },
    h2: { heat: 51, color: "red", j1: [20, 19, 19, 19, 20], j2: [19, 18, 17, 19, 19], total: 189 },
    score: 362, place: 7, vc: "CC"
  },
  {
    catalog_no: 106, breed: "Уиппет", className: "Стандартный", sex: "Кобель",
    name: "STRONG STOAT",
    h1: { heat: 28, color: "red", j1: [19, 18, 15, 18, 20], j2: [17, 18, 16, 17, 17], total: 175 },
    h2: { heat: 48, color: "white", j1: [18, 19, 19, 19, 20], j2: [17, 19, 18, 18, 19], total: 186 },
    score: 361, place: 8, vc: "CC"
  },
  {
    catalog_no: 107, breed: "Уиппет", className: "Стандартный", sex: "Кобель",
    name: "VALPAIN PEK BLOSSOM DRAGON",
    h1: { heat: 30, color: "red", j1: [18, 19, 14, 17, 20], j2: [18, 17, 19, 17, 17], total: 176 },
    h2: { heat: 50, color: "white", j1: [18, 19, 18, 19, 20], j2: [18, 19, 18, 18, 18], total: 185 },
    score: 361, place: 9, vc: "CC"
  },
  {
    catalog_no: 92, breed: "Уиппет", className: "Стандартный", sex: "Кобель",
    name: "ANTHRAX GO-BYE",
    h1: { heat: 29, color: "red", j1: [19, 19, 15, 18, 20], j2: [17, 18, 18, 17, 18], total: 179 },
    h2: { heat: 50, color: "red", j1: [18, 20, 19, 18, 20], j2: [17, 18, 18, 16, 18], total: 182 },
    score: 361, place: 10, vc: "CC"
  },
  {
    catalog_no: 104, breed: "Уиппет", className: "Стандартный", sex: "Кобель",
    name: "STANGERS LAND BARST",
    h1: { heat: 35, color: "red", j1: [20, 19, 15, 19, 20], j2: [20, 19, 18, 19, 19], total: 188 },
    h2: { heat: 43, color: "white", j1: [17, 19, 19, 19, 19], j2: [15, 17, 17, 15, 16], total: 173 },
    score: 361, place: 11, vc: "CC"
  },
  {
    catalog_no: 108, breed: "Уиппет", className: "Стандартный", sex: "Кобель",
    name: "VALPAIN PEK DARLING OF FORTUNE",
    h1: { heat: 32, color: "white", j1: [19, 19, 15, 17, 19], j2: [18, 19, 17, 19, 18], total: 180 },
    h2: { heat: 48, color: "red", j1: [19, 20, 19, 19, 20], j2: [16, 17, 17, 16, 17], total: 180 },
    score: 360, place: 12, vc: "CC"
  },
  {
    catalog_no: 101, breed: "Уиппет", className: "Стандартный", sex: "Кобель",
    name: "LET IT BE",
    h1: { heat: 34, color: "red", j1: [20, 20, 15, 19, 20], j2: [16, 18, 18, 17, 18], total: 181 },
    h2: { heat: 47, color: "red", j1: [18, 19, 18, 19, 20], j2: [16, 17, 18, 16, 17], total: 178 },
    score: 359, place: 13, vc: "CC"
  },
  {
    catalog_no: 100, breed: "Уиппет", className: "Стандартный", sex: "Кобель",
    name: "KULIKOVO POLE VINTAGE",
    h1: { heat: 33, color: "red", j1: [17, 19, 15, 19, 19], j2: [16, 17, 17, 16, 16], total: 171 },
    h2: { heat: 44, color: "red", j1: [18, 20, 19, 19, 19], j2: [16, 19, 19, 16, 17], total: 182 },
    score: 353, place: 14, vc: "CC"
  },
  {
    catalog_no: 98, breed: "Уиппет", className: "Стандартный", sex: "Кобель",
    name: "KORVET ZVEZDNYY IZ POLETA MECHTI",
    h1: { heat: 34, color: "white", j1: [20, 19, 15, 19, 19], j2: [15, 17, 17, 15, 17], total: 173 },
    h2: { heat: 44, color: "white", j1: [18, 19, 18, 19, 19], j2: [17, 17, 17, 18, 18], total: 180 },
    score: 353, place: 15, vc: "CC"
  },
  {
    catalog_no: 94, breed: "Уиппет", className: "Стандартный", sex: "Кобель",
    name: "EFFLORESCO'S MAVISCAL",
    h1: { heat: 27, color: "red", j1: [18, 19, 14, 18, 19], j2: [19, 18, 17, 19, 18], total: 179 },
    h2: { heat: 43, color: "red", j1: [17, 19, 18, 18, 19], j2: [16, 18, 16, 16, 17], total: 174 },
    score: 353, place: 16, vc: "CC"
  },
  {
    catalog_no: 102, breed: "Уиппет", className: "Стандартный", sex: "Кобель",
    name: "RIDER OF ROHAN BRODWINEK",
    h1: { heat: 27, color: "white", j1: [18, 18, 15, 18, 19], j2: [17, 17, 19, 17, 17], total: 175 },
    h2: { heat: 49, color: "white", j1: [18, 18, 19, 19, 20], j2: [16, 17, 16, 16, 16], total: 175 },
    score: 350, place: 17, vc: "CC"
  },

  // Уиппет Стандартный Суки
  {
    catalog_no: 120, breed: "Уиппет", className: "Стандартный", sex: "Сука",
    name: "SILVER SABLE",
    h1: { heat: 8, color: "white", j1: [18, 17, 15, 17, 18], j2: [17, 18, 19, 18, 19], total: 176 },
    h2: { heat: 18, color: "white", j1: [20, 20, 18, 19, 20], j2: [19, 19, 20, 19, 19], total: 193 },
    score: 369, place: 1, vc: "CC, CACIL", title: "Чемпион России"
  },
  {
    catalog_no: 122, breed: "Уиппет", className: "Стандартный", sex: "Сука",
    name: "STANGERS LAND BRATISLAVA",
    h1: { heat: 7, color: "white", j1: [17, 17, 15, 18, 18], j2: [19, 19, 18, 19, 19], total: 179 },
    h2: { heat: 19, color: "red", j1: [17, 19, 17, 17, 18], j2: [18, 19, 19, 18, 18], total: 180 },
    score: 359, place: 2, vc: "CC, R.CACIL", title: "CACL"
  },
  {
    catalog_no: 126, breed: "Уиппет", className: "Стандартный", sex: "Сука",
    name: "VALPAIN PEK DRAGON'S DAUGHTER",
    h1: { heat: 6, color: "red", j1: [18, 18, 15, 17, 18], j2: [16, 17, 16, 18, 16], total: 169 },
    h2: { heat: 21, color: "red", j1: [20, 20, 19, 19, 20], j2: [17, 19, 18, 18, 18], total: 188 },
    score: 357, place: 3, vc: "CC", title: "R.CACL"
  },
  {
    catalog_no: 114, breed: "Уиппет", className: "Стандартный", sex: "Сука",
    name: "KORONA SOLNTSA IZ POLETA MECHTI",
    h1: { heat: 5, color: "white", j1: [17, 18, 15, 16, 18], j2: [18, 19, 19, 19, 19], total: 178 },
    h2: { heat: 16, color: "red", j1: [17, 19, 18, 16, 19], j2: [18, 19, 17, 18, 17], total: 178 },
    score: 356, place: 4, vc: "CC"
  },
  {
    catalog_no: 123, breed: "Уиппет", className: "Стандартный", sex: "Сука",
    name: "STANGERS LAND BRIZA",
    h1: { heat: 10, color: "red", j1: [18, 18, 15, 18, 18], j2: [16, 17, 18, 16, 17], total: 171 },
    h2: { heat: 16, color: "white", j1: [18, 18, 18, 18, 19], j2: [19, 18, 18, 19, 18], total: 183 },
    score: 354, place: 5, vc: "CC"
  },
  {
    catalog_no: 119, breed: "Уиппет", className: "Стандартный", sex: "Сука",
    name: "RUSSKI PARK DANAYA",
    h1: { heat: 10, color: "white", j1: [17, 18, 15, 17, 18], j2: [17, 18, 17, 17, 18], total: 172 },
    h2: { heat: 20, color: "red", j1: [20, 18, 18, 18, 20], j2: [18, 17, 18, 17, 18], total: 182 },
    score: 354, place: 6, vc: "CC"
  },
  {
    catalog_no: 118, breed: "Уиппет", className: "Стандартный", sex: "Сука",
    name: "NIFTY RACING GIRL",
    h1: { heat: 4, color: "red", j1: [18, 18, 14, 18, 18], j2: [16, 18, 17, 18, 17], total: 172 },
    h2: { heat: 14, color: "white", j1: [18, 18, 18, 18, 19], j2: [17, 18, 18, 19, 19], total: 182 },
    score: 354, place: 7, vc: "CC"
  },
  {
    catalog_no: 110, breed: "Уиппет", className: "Стандартный", sex: "Сука",
    name: "BEATRIS IZ SOZVEZDIYA SURSKIKH PSOV",
    h1: { heat: 7, color: "red", j1: [18, 18, 15, 18, 18], j2: [16, 17, 17, 16, 17], total: 170 },
    h2: { heat: 17, color: "red", j1: [19, 20, 19, 19, 20], j2: [17, 18, 16, 17, 18], total: 183 },
    score: 353, place: 8, vc: "CC"
  },
  {
    catalog_no: 112, breed: "Уиппет", className: "Стандартный", sex: "Сука",
    name: "GARDA",
    h1: { heat: 4, color: "white", j1: [18, 17, 15, 17, 18], j2: [17, 17, 16, 17, 16], total: 168 },
    h2: { heat: 15, color: "red", j1: [17, 18, 18, 18, 19], j2: [19, 18, 18, 19, 18], total: 182 },
    score: 350, place: 9, vc: "CC"
  },
  {
    catalog_no: 116, breed: "Уиппет", className: "Стандартный", sex: "Сука",
    name: "LUXURY WHIPP LADY DAY",
    h1: { heat: 3, color: "white", j1: [18, 18, 15, 17, 18], j2: [17, 17, 17, 16, 17], total: 170 },
    h2: { heat: 15, color: "white", j1: [18, 20, 18, 18, 20], j2: [17, 17, 18, 17, 17], total: 180 },
    score: 350, place: 10, vc: "CC"
  },
  {
    catalog_no: 113, breed: "Уиппет", className: "Стандартный", sex: "Сука",
    name: "GRACE",
    h1: { heat: 9, color: "red", j1: [17, 17, 15, 18, 17], j2: [17, 17, 17, 18, 18], total: 171 },
    h2: { heat: 18, color: "red", j1: [19, 18, 18, 18, 20], j2: [17, 17, 18, 16, 17], total: 178 },
    score: 349, place: 11, vc: "CC"
  },
  {
    catalog_no: 125, breed: "Уиппет", className: "Стандартный", sex: "Сука",
    name: "VALPAIN PEK BON BON",
    h1: { heat: 5, color: "red", j1: [15, 18, 15, 18, 18], j2: [16, 18, 18, 17, 17], total: 170 },
    h2: { heat: 20, color: "white", j1: [20, 19, 17, 17, 20], j2: [19, 18, 16, 15, 15], total: 176 },
    score: 346, place: 12, vc: "CC"
  },
  {
    catalog_no: 111, breed: "Уиппет", className: "Стандартный", sex: "Сука",
    name: "EMERALD OF MY SOUL",
    h1: { heat: 11, color: "red", j1: [19, 18, 15, 18, 18], j2: [16, 17, 16, 18, 18], total: 173 },
    h2: { heat: 17, color: "white", j1: [17, 18, 17, 17, 19], j2: [16, 17, 17, 16, 17], total: 171 },
    score: 344, place: 13, vc: "CC"
  },
  {
    catalog_no: 124, breed: "Уиппет", className: "Стандартный", sex: "Сука",
    name: "STYLAR HARLAY QUINN",
    h1: { heat: 9, color: "white", j1: [18, 18, 15, 18, 18], j2: [19, 18, 19, 20, 19], total: 182 },
    h2: { heat: 19, color: "white", j1: [15, 19, 17, 16, 18], j2: [16, 17, 15, 13, 15], total: 161 },
    score: 343, place: 14, vc: "CC"
  },
  {
    catalog_no: 121, breed: "Уиппет", className: "Стандартный", sex: "Сука",
    name: "STANGERS LAND ALTANA",
    h1: { heat: 3, color: "red", j1: [16, 15, 15, 17, 17], j2: [18, 18, 16, 17, 18], total: 167 },
    h2: { heat: 14, color: "red", j1: [19, 19, 19, 18, 20], j2: [15, 16, 16, 14, 15], total: 171 },
    score: 338, place: 15, vc: "CC"
  },
  {
    catalog_no: 115, breed: "Уиппет", className: "Стандартный", sex: "Сука",
    name: "LOVE WILL FIND A WAY",
    h1: { heat: 6, color: "white", j1: [17, 17, 15, 18, 19], j2: [17, 18, 17, 16, 17], total: 171 },
    score: 171, status: "withdrawn", status_reason: "Снят владельцем"
  },
  {
    catalog_no: 117, breed: "Уиппет", className: "Стандартный", sex: "Сука",
    name: "LUXURY WHIPP LAVATERRA",
    h1: { heat: 8, color: "red" },
    status: "withdrawn", status_reason: "Снят"
  },

  // Уиппет Стандартный-спринтеры Кобели
  {
    catalog_no: 82, breed: "Уиппет", className: "Стандартный-спринтеры", sex: "Кобель",
    name: "BLACK JACK",
    h1: { heat: 23, color: "red", j1: [19, 20, 15, 18, 20], j2: [19, 18, 19, 19, 19], total: 186 },
    h2: { heat: 38, color: "red", j1: [20, 20, 18, 18, 20], j2: [17, 19, 18, 19, 18], total: 187 },
    score: 373, place: 1, vc: "CC", title: "Чемпион России"
  },
  {
    catalog_no: 88, breed: "Уиппет", className: "Стандартный-спринтеры", sex: "Кобель",
    name: "VALPAIN PEK DIRECT HIT",
    h1: { heat: 26, color: "red", j1: [20, 19, 15, 19, 20], j2: [19, 18, 17, 19, 18], total: 184 },
    h2: { heat: 40, color: "white", j1: [15, 18, 18, 18, 18], j2: [19, 19, 20, 19, 19], total: 183 },
    score: 367, place: 2, vc: "CC", title: "CACL"
  },
  {
    catalog_no: 85, breed: "Уиппет", className: "Стандартный-спринтеры", sex: "Кобель",
    name: "ISTORIYA LYUBVI PETERBURG BEAUTIFUL",
    h1: { heat: 22, color: "white", j1: [19, 19, 15, 18, 18], j2: [16, 18, 18, 17, 18], total: 176 },
    h2: { heat: 39, color: "white", j1: [18, 18, 18, 18, 19], j2: [19, 18, 19, 19, 19], total: 185 },
    score: 361, place: 3, vc: "CC", title: "R.CACL"
  },
  {
    catalog_no: 84, breed: "Уиппет", className: "Стандартный-спринтеры", sex: "Кобель",
    name: "DON CORLEONE",
    h1: { heat: 22, color: "red", j1: [18, 18, 15, 17, 17], j2: [17, 16, 17, 16, 17], total: 168 },
    h2: { heat: 41, color: "red", j1: [18, 19, 19, 19, 20], j2: [19, 19, 20, 19, 19], total: 191 },
    score: 359, place: 4, vc: "CC"
  },
  {
    catalog_no: 83, breed: "Уиппет", className: "Стандартный-спринтеры", sex: "Кобель",
    name: "BORN TO CHARM LEON",
    h1: { heat: 24, color: "red", j1: [18, 20, 15, 18, 20], j2: [16, 17, 18, 18, 17], total: 177 },
    h2: { heat: 39, color: "red", j1: [18, 19, 18, 19, 19], j2: [17, 17, 18, 16, 17], total: 178 },
    score: 355, place: 5, vc: "CC"
  },
  {
    catalog_no: 87, breed: "Уиппет", className: "Стандартный-спринтеры", sex: "Кобель",
    name: "STILAR HALESTORM",
    h1: { heat: 23, color: "white", j1: [17, 18, 14, 17, 19], j2: [17, 17, 18, 17, 17], total: 171 },
    h2: { heat: 42, color: "red", j1: [18, 18, 18, 19, 19], j2: [18, 19, 19, 17, 18], total: 183 },
    score: 354, place: 6, vc: "CC"
  },
  {
    catalog_no: 86, breed: "Уиппет", className: "Стандартный-спринтеры", sex: "Кобель",
    name: "KETLIN RUTGER",
    h1: { heat: 25, color: "white", j1: [18, 19, 15, 17, 19], j2: [16, 18, 16, 17, 16], total: 171 },
    h2: { heat: 38, color: "white", j1: [20, 19, 18, 18, 20], j2: [16, 18, 17, 18, 17], total: 181 },
    score: 352, place: 7, vc: "CC"
  },
  {
    catalog_no: 81, breed: "Уиппет", className: "Стандартный-спринтеры", sex: "Кобель",
    name: "BATMAN NIGHT SHADOW",
    h1: { heat: 25, color: "red", j1: [17, 20, 15, 18, 20], j2: [15, 17, 17, 16, 17], total: 172 },
    h2: { heat: 40, color: "red", j1: [15, 20, 19, 18, 18], j2: [16, 18, 17, 16, 17], total: 174 },
    score: 346, place: 8, vc: "CC"
  },
  {
    catalog_no: 80, breed: "Уиппет", className: "Стандартный-спринтеры", sex: "Кобель",
    name: "ANYUTINY GLAZKI ELVIN JONES",
    h1: { heat: 24, color: "white", j1: [16, 18, 14, 17, 18], j2: [17, 16, 16, 17, 16], total: 165 },
    h2: { heat: 41, color: "white", j1: [18, 18, 18, 19, 20], j2: [16, 17, 18, 17, 17], total: 178 },
    score: 343, place: 9, vc: "CC"
  },

  // Уиппет Стандартный-спринтеры Суки
  {
    catalog_no: 91, breed: "Уиппет", className: "Стандартный-спринтеры", sex: "Сука",
    name: "VALPAIN PEK DAMASK STEEL",
    h1: { heat: 1, color: "red", j1: [17, 16, 14, 17, 17], j2: [18, 18, 17, 18, 18], total: 170 },
    h2: { heat: 13, color: "red", j1: [20, 18, 17, 18, 19], j2: [19, 19, 18, 19, 19], total: 186 },
    score: 356, place: 1, vc: "CC", title: "Чемпион России"
  },
  {
    catalog_no: 90, breed: "Уиппет", className: "Стандартный-спринтеры", sex: "Сука",
    name: "ISTORIYA LUBVI SHIKARNAYA FORTUNA",
    h1: { heat: 1, color: "white", j1: [18, 17, 15, 18, 18], j2: [18, 17, 19, 17, 19], total: 176 },
    h2: { heat: 12, color: "white", j1: [18, 18, 18, 18, 19], j2: [16, 17, 17, 16, 17], total: 174 },
    score: 350, place: 2, vc: "CC", title: "CACL"
  },
  {
    catalog_no: 89, breed: "Уиппет", className: "Стандартный-спринтеры", sex: "Сука",
    name: "ENTAYLI YOZ",
    h1: { heat: 2, color: "red", j1: [16, 17, 15, 18, 16], j2: [16, 17, 16, 17, 18], total: 166 },
    h2: { heat: 12, color: "red", j1: [19, 19, 17, 18, 19], j2: [17, 18, 18, 17, 18], total: 180 },
    score: 346, place: 3, vc: "CC", title: "R.CACL"
  },

  // Уиппет Юниоры Кобели
  {
    catalog_no: 127, breed: "Уиппет", className: "Юниоры", sex: "Кобель",
    name: "AMOROUS BABY PINKERTON",
    h1: { heat: 37, color: "red", j1: [20, 19, 15, 18, 19], j2: [19, 18, 18, 20, 17], total: 183 },
    h2: { heat: 53, color: "red", j1: [20, 19, 18, 18, 18], j2: [18, 17, 17, 18, 15], total: 178 },
    score: 361, place: 1, title: "Лучший юниор"
  },

  // Фараонова собака Стандартный Кобели
  {
    catalog_no: 129, breed: "Фараонова собака", className: "Стандартный", sex: "Кобель",
    name: "REEDLY ROAD QUI WARRANTO",
    h1: { heat: 60, color: "white", j1: [16, 18, 15, 17, 17], j2: [18, 19, 19, 19, 19], total: 177 },
    h2: { heat: 70, color: "red", j1: [18, 18, 18, 19, 18], j2: [19, 19, 18, 19, 20], total: 186 },
    score: 363, place: 1, vc: "CC", title: "Чемпион России"
  },
  {
    catalog_no: 130, breed: "Фараонова собака", className: "Стандартный", sex: "Кобель",
    name: "TIERIS GELLIOS",
    h1: { heat: 59, color: "red", j1: [17, 17, 15, 17, 18], j2: [17, 18, 17, 18, 17], total: 171 },
    h2: { heat: 71, color: "red", j1: [19, 19, 18, 18, 18], j2: [18, 19, 19, 19, 19], total: 186 },
    score: 357, place: 2, vc: "CC", title: "CACL"
  },
  {
    catalog_no: 128, breed: "Фараонова собака", className: "Стандартный", sex: "Кобель",
    name: "REEDLY ROAD MYBERN",
    h1: { heat: 59, color: "white", j1: [16, 17, 15, 18, 19], j2: [16, 17, 16, 17, 17], total: 168 },
    h2: { heat: 72, color: "white", j1: [17, 16, 16, 17, 18], j2: [15, 17, 18, 17, 18], total: 169 },
    score: 337, place: 3, vc: "CC", title: "R.CACL"
  },

  // Фараонова собака Стандартный Суки
  {
    catalog_no: 131, breed: "Фараонова собака", className: "Стандартный", sex: "Сука",
    name: "GALMAD STAR VELINA",
    h1: { heat: 58, color: "white", j1: [16, 16, 15, 16, 18], j2: [15, 16, 17, 16, 16], total: 161 },
    h2: { heat: 70, color: "white", j1: [18, 17, 17, 18, 17], j2: [17, 17, 16, 17, 17], total: 171 },
    score: 332, place: 1, vc: "CC", title: "Чемпион России"
  },
  {
    catalog_no: 132, breed: "Фараонова собака", className: "Стандартный", sex: "Сука",
    name: "LIBERTY INDIGO STAR",
    h1: { heat: 60, color: "red", j1: [17, 18, 13, 16, 17], j2: [16, 17, 17, 16, 17], total: 164 },
    h2: { heat: 72, color: "red", j1: [16, 17, 18, 16, 18], j2: [16, 16, 15, 13, 13], total: 158 },
    score: 322, place: 2, vc: "CC", title: "CACL"
  },
  {
    catalog_no: 133, breed: "Фараонова собака", className: "Стандартный", sex: "Сука",
    name: "REEDLY ROAD MISS RIGHT",
    h1: { heat: 58, color: "red", j1: [17, 17, 15, 18, 18], j2: [16, 18, 17, 17, 18], total: 171 },
    h2: { heat: 71, color: "white", j1: [8, 17, 15, 9, 12], j2: [13, 17, 13, 10, 10], total: 124 },
    score: 295, place: 3, status: "finished"
  },

  // Фараонова собака Юниоры Суки
  {
    catalog_no: 134, breed: "Фараонова собака", className: "Юниоры", sex: "Сука",
    name: "REEDLY ROAD STEADLYN",
    h1: { heat: 61, color: "red", j1: [16, 17, 14, 17, 17], j2: [15, 18, 16, 16, 16], total: 162 },
    h2: { heat: 73, color: "red", j1: [19, 17, 17, 17, 18], j2: [18, 17, 16, 18, 17], total: 174 },
    score: 336, place: 1, title: "Лучший юниор"
  },

  // Чирнеко дель Этна Стандартный Кобели
  {
    catalog_no: 138, breed: "Чирнеко дель Этна", className: "Стандартный", sex: "Кобель",
    name: "TESORO SOLARE FORTUNATO",
    h1: { heat: 64, color: "red", j1: [16, 17, 14, 16, 18], j2: [19, 18, 18, 19, 19], total: 174 },
    h2: { heat: 76, color: "red", j1: [19, 17, 17, 18, 18], j2: [19, 19, 19, 20, 20], total: 186 },
    score: 360, place: 1, vc: "CC", title: "Чемпион России"
  },
  {
    catalog_no: 135, breed: "Чирнеко дель Этна", className: "Стандартный", sex: "Кобель",
    name: "COLISTO'S BIRBO",
    h1: { heat: 64, color: "white", j1: [15, 18, 15, 17, 18], j2: [15, 17, 17, 16, 17], total: 165 },
    h2: { heat: 75, color: "white", j1: [16, 17, 17, 17, 17], j2: [17, 18, 18, 18, 17], total: 172 },
    score: 337, place: 2, vc: "CC", title: "CACL"
  },
  {
    catalog_no: 137, breed: "Чирнеко дель Этна", className: "Стандартный", sex: "Кобель",
    name: "TESORO SOLARE DOMENICO",
    h1: { heat: 65, color: "red", j1: [20, 17, 15, 18, 19], j2: [19, 18, 19, 20, 19], total: 184 },
    h2: { heat: 75, color: "red", j1: [6, 18, 12, 10, 13], j2: [15, 17, 10, 10, 13], total: 124 },
    score: 308, place: 3, vc: "CC", title: "R.CACL"
  },

  // Чирнеко дель Этна Стандартный Суки
  {
    catalog_no: 140, breed: "Чирнеко дель Этна", className: "Стандартный", sex: "Сука",
    name: "MIA SANTO'S ILVA-NEVA",
    h1: { heat: 62, color: "white", j1: [18, 18, 15, 17, 18], j2: [19, 19, 19, 20, 19], total: 182 },
    h2: { heat: 74, color: "red", j1: [17, 18, 18, 17, 19], j2: [17, 17, 18, 19, 18], total: 178 },
    score: 360, place: 1, vc: "CC", title: "Чемпион России"
  },
  {
    catalog_no: 141, breed: "Чирнеко дель Этна", className: "Стандартный", sex: "Сука",
    name: "ROSSO BOREALE AURORA",
    h1: { heat: 62, color: "red", j1: [15, 17, 14, 16, 18], j2: [17, 18, 18, 18, 18], total: 169 },
    h2: { heat: 74, color: "white", j1: [17, 17, 18, 18, 18], j2: [18, 18, 19, 17, 17], total: 177 },
    score: 346, place: 2, vc: "CC", title: "CACL"
  },
  {
    catalog_no: 139, breed: "Чирнеко дель Этна", className: "Стандартный", sex: "Сука",
    name: "COLISTO S MOLLY",
    h1: { heat: 63, color: "red" },
    status: "withdrawn", status_reason: "Снят"
  },

  // Неявившиеся участники (DNS):
  { catalog_no: 15, breed: "Басенджи", className: "Стандартный", sex: "Сука", name: "SUNRISE LEUR ARISHA", status: "dns", status_reason: "Неявка" },
  { catalog_no: 26, breed: "Ирландский волкодав", className: "Стандартный", sex: "Кобель", name: "MILIY ZVER CHARODEY", status: "dns", status_reason: "Неявка" },
  { catalog_no: 27, breed: "Ирландский волкодав", className: "Стандартный", sex: "Сука", name: "MILIY ZVER CHANTEL", status: "dns", status_reason: "Неявка" },
  { catalog_no: 41, breed: "Родезийский риджбек", className: "Стандартный", sex: "Сука", name: "ARIES KHAN PHOEBE PIPIRIMA", status: "dns", status_reason: "Неявка" },
  { catalog_no: 44, breed: "Родезийский риджбек", className: "Стандартный", sex: "Сука", name: "PODAROK IZ AFRIKI YAKITA MOKKO", status: "dns", status_reason: "Неявка" },
  { catalog_no: 51, breed: "Русская псовая борзая", className: "Стандартный", sex: "Кобель", name: "OBEREG", status: "dns", status_reason: "Неявка" },
  { catalog_no: 54, breed: "Русская псовая борзая", className: "Стандартный", sex: "Кобель", name: "STEP KUBANSKAYA J-NORD-VEST", status: "dns", status_reason: "Неявка" },
  { catalog_no: 79, breed: "Уиппет", className: "Ветераны", sex: "Кобель", name: "BRIZ LEGKIY VETER", status: "dns", status_reason: "Неявка" },
  { catalog_no: 99, breed: "Уиппет", className: "Стандартный", sex: "Кобель", name: "KULIKOVO POLE VERSK LOVETS UDACHI", status: "dns", status_reason: "Неявка" },
  { catalog_no: 136, breed: "Чирнеко дель Этна", className: "Стандартный", sex: "Кобель", name: "SOLLUCERO", status: "dns", status_reason: "Неявка" }
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
      id: d.dogId,
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

fs.writeFileSync('data/tmp/procoursing_2020/draft_20201003.json', JSON.stringify(draft, null, 2), 'utf8');
console.log('Successfully generated draft_20201003.json with', results.length, 'results.');
