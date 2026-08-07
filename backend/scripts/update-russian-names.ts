import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Данные с двойными именами (русское / латинское)
const nameMapping = {
  "DZHANA-DZHAN GENRI MORGAN": "ДЖАНА-ДЖАН ГЕНРИ МОРГАН",
  "NICOL SAN S KNJAZHESKOGO DVORA": "НИКОЛЬ САН С КНЯЖЕСКОГО ДВОРА",
  "EE VELITCHESTVO": "ЕЁ ВЕЛИЧЕСТВО",
  "HARMONY KAMA TIRAMISU BEST EVER": "ХАРМОНИ КАМА ТИРАМИСУ БЕСТ ЭВЕР",
  "VETLUGA HALVA RACEDOG": "ВЕТЛУГА ХАЛВА РЕЙСДОГ",
  "GRACE HOUND JASMINE NOIR": "ГРЭЙС ХАУНД ЖАСМИН НУАР",
  "KEYOD": "КЭЙОД",
  "ARIES KHAN SCYTHIAN SIMURAN": "АРИЕС ХАН СКИФ СИМУРАН",
  "ARIES KHAN SAMUEL FORSAGE JACKSON": "АРИЕС ХАН СЭМЮЭЛЬ ФОРСАЖ ДЖЕКСОН",
  "ARIES KHAN PHREIA PASIPHAE": "ARIES KHAN PHREIA PASIPHAE",
  "ARIES KHAN RIVIERA AL RISHA SANGREAL": "АРИЕС ХАН РИВЬЕРА АЛЬ РИША САНГРИЭЛЬ",
  "ARIES KHAN SKADI SARAMA FAST & FURIOUS": "АРИЕС ХАН СКАДИ САРАМА ФАСТ & ФЮРИОС",
  "EMUL DE GEPARD GELILA AL RAWDA": "ЭМУЛЬ ДЭ ГЕПАРД ГЕЛИЛА АЛЬ РАВДА",
  "SALGREY'S VELAR": "САЛГРЕЙС ВЕЛАР",
  "SALUKOV SINBAD STORY OF SEVEN SEAS": "САЛЮКОВ СИНБАД СТОРИ ОФ СЕВЕН СИАС",
  "IMRAN DZAZZI": "ИМРАН ДЖАЗЗИ",
  "AL NAFISEH LEON BAKST": "AL NAFISEH LEON BAKST",
  "STANGERS LAND BRATISLAVA": "STANGERS LAND BRATISLAVA",
  "DEVAJ 1976 ZAROOQ": "DEVAJ 1976 ZAROOQ",
  "STANGERS LAND ZAMIR": "СТАНГЕРС ЛАНД ЗАМИР",
  "STANGERS LAND IRWIN DIVNYI": "СТАНГЕРС ЛАНД ИРВИН ДИВНЫЙ",
  "STANGERS LAND VERSAILLES CHARMAN": "СТАНГЕРС ЛАНД ВЕРСАЛЬ ШАРМАН",
  "MALENKIY PRINTS IZ POLETA MECHTI": "МАЛЕНЬКИЙ ПРИНЦ ИЗ ПОЛЕТА МЕЧТЫ",
  "STANGERS LAND ZENIT": "СТАНГЕРС ЛАНД ЗЕНИТ",
  "WILDABOUT DOUBLE ATOMIC RACE": "WILDABOUT DOUBLE ATOMIC RACE",
  "YARYJ VETER IZ POLETA MECHTI": "ЯРЫЙ ВЕТЕР ИЗ ПОЛЕТА МЕЧТЫ",
  "BRIGHT SUN BOUNTY": "БРАЙТ САН БАУНТИ",
  "FEEL MY HEART DAENERYS STORMBORN": "ФЕЕЛ МАЙ ХЕАРТ ДЕЙНЕРИС ШТОРМБОРН",
  "BONNY FLYING FLASH": "БОННИ ФЛАИНГ ФЛЭШ",
  "STANGERS LAND INGRID ELEGANT": "СТАНГЕРС ЛАНД ИНГРИД ЭЛЕГАНТ",
  "ZOELLA VLAPAN": "ZOELLA VLAPAN",
  "STANGERS LAND VALDIVIA": "СТАНГЕРС ЛАНД ВАЛЬДИВИЯ",
  "ANTIQUE GODDESS": "АНТИК ГОДДЕС",
  "DIAMANT TOP KRISTAL": "ДИАМАНТ ТОП КРИСТАЛ",
  "STANGERS LAND KATALINA": "СТАНГЕРС ЛАНД КАТАЛИНА",
  "STANGERS LAND DARING GREATLY": "СТАНГЕРС ЛАНД ДАРИНГ ГРЕЙТЛИ",
  "STANGERS LAND KORITSA": "СТАНГЕРС ЛАНД КОРИЦА",
  "ALPHAS LEGACY ALTAIR": "ALPHAS LEGACY ALTAIR",
  "FEEL MY HEART DUNCAN MACLAUD": "ФЕЕЛ МАЙ ХЕАРТ ДУНКАН МАКЛАУД",
  "URAL SPIRIT SALAMANDER": "УРАЛ СПИРИТ САЛАМАНДР",
  "BRAVE HEART SIMBA": "БРЕЙВ ХАРТ СИМБА",
  "BEYOND BLUE DOUGHNUT": "BEYOND BLUE DOUGHNUT",
  "DZHIPSI LILIT BOGINYA NOCHI": "ДЖИПСИ ЛИЛИТ БОГИНЯ НОЧИ",
  "STANGERS LAND INTERNAL ENERGY": "СТАНГЕРС ЛАНД ИНТЕРНАЛ ЭНЕРДЖИ",
  "STANGERS LAND ZLATOSLAVA": "СТАНГЕРС ЛАНД ЗЛАТОСЛАВА",
  "HEIDI SOTIS DJED ATUM": "ХЕЙДИ СОТИС ДЖЕД АТУМ",
  "HEIDI SOTIS DELIMARA MINTAKA": "ХЕЙДИ СОТИС ДЕЛИМАРА МИНТАКА",
  "HEIDI SOTIS DJGANTIYA MUT": "ХЕЙДИ СОТИС ДЖГАНТИЯ МУТ",
  "BAXTER BERN": "БАКСТЕР БЕРН"
};

// Загрузка соревнования
const competitionPath = path.join(__dirname, '../../data/v1/competitions/2026/08-август/1550-пчркф-курсинг-борзых.json');
const competition = JSON.parse(fs.readFileSync(competitionPath, 'utf8'));

// Обновление русских имён
let updated = 0;
for (const result of competition.results) {
  const currentNameLat = result.dog.name_lat;
  if (nameMapping[currentNameLat]) {
    result.dog.name_ru = nameMapping[currentNameLat];
    updated++;
  }
}

console.log(`Обновлено русских имён для ${updated} собак`);

// Обновление названия соревнования
competition.event.title = "Курсинг Донино — ЧРКФ по бегам борзых";
competition.event.rank_code = "ЧРКФ";

// Сохранение обновлённого файла
fs.writeFileSync(competitionPath, JSON.stringify(competition, null, 2), 'utf8');
console.log(`Файл обновлён: ${competitionPath}`);